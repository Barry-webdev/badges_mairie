import { Response, NextFunction } from 'express';
import { Agent } from '../models/Agent';
import { Badge } from '../models/Badge';
import { AuthRequest } from '../types';
import { generateQrToken, generateQrCodeImage } from '../services/qrcode.service';
import { generateBadgePdf } from '../services/pdf.service';
import { logHistory } from '../services/history.service';
import { createError } from '../middlewares/errorHandler.middleware';

// ─── Lister les badges ────────────────────────────────────────────────────────
export const getBadges = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const statut = req.query.statut as string;

    const filter: Record<string, unknown> = {};
    if (statut) filter.statut = statut;

    const badges = await Badge.find(filter)
      .populate('agentId', 'nom prenom matricule photo fonction affectation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Mettre à jour les statuts expirés
    const enriched = badges.map((b) => {
      const effective =
        b.statut === 'RÉVOQUÉ' || b.statut === 'SUSPENDU'
          ? b.statut
          : new Date() > b.dateExpiration
          ? 'EXPIRÉ'
          : b.statut;
      return { ...b, statut: effective };
    });

    const total = await Badge.countDocuments(filter);

    res.json({
      success: true,
      data: enriched,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Obtenir un badge ─────────────────────────────────────────────────────────
export const getBadgeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id)
      .populate('agentId')
      .lean();
    if (!badge) throw createError('Badge non trouvé', 404);

    res.json({ success: true, data: badge });
  } catch (error) {
    next(error);
  }
};

// ─── Générer un badge pour un agent ──────────────────────────────────────────
export const generateBadge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) throw createError('Agent non trouvé', 404);

    const { dateEmission, dateExpiration } = req.body;

    if (!dateEmission || !dateExpiration) {
      throw createError('Date d\'émission et date d\'expiration requises', 400);
    }

    if (new Date(dateExpiration) <= new Date(dateEmission)) {
      throw createError('La date d\'expiration doit être après la date d\'émission', 400);
    }

    // Désactiver l'ancien badge actif si existant
    await Badge.updateMany(
      { agentId: agent._id, statut: { $in: ['ACTIF', 'SUSPENDU'] } },
      { $set: { statut: 'RÉVOQUÉ', motifRevocation: 'Remplacement par nouveau badge' } }
    );

    const qrToken = await generateQrToken();
    const badgeNumber = `BADGE-${agent.matricule}-${Date.now()}`;

    const badge = await Badge.create({
      agentId: agent._id,
      badgeNumber,
      qrToken,
      dateEmission: new Date(dateEmission),
      dateExpiration: new Date(dateExpiration),
      statut: 'ACTIF',
    });

    // Générer l'image QR pour la réponse
    const qrImage = await generateQrCodeImage(qrToken);

    await logHistory({
      agentId: agent._id,
      badgeId: badge._id,
      action: 'BADGE_GÉNÉRÉ',
      nouveauStatut: 'ACTIF',
      userId: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: { ...badge.toObject(), qrImage },
      message: 'Badge généré avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Télécharger le PDF du badge ──────────────────────────────────────────────
export const downloadBadgePdf = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Valider que l'ID est un ObjectId valide
    if (!id || id.length < 12) {
      throw createError(`ID badge invalide : ${id}`, 400);
    }

    const badge = await Badge.findById(id);
    if (!badge) throw createError('Badge non trouvé', 404);

    const agent = await Agent.findById(badge.agentId);
    if (!agent) throw createError('Agent non trouvé', 404);

    const pdfBuffer = await generateBadgePdf(agent, badge);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="badge-${agent.matricule}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// ─── Révoquer un badge ────────────────────────────────────────────────────────
export const revokeBadge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) throw createError('Badge non trouvé', 404);
    if (badge.statut === 'RÉVOQUÉ') throw createError('Badge déjà révoqué', 400);

    const { motif } = req.body;
    if (!motif) throw createError('Le motif de révocation est requis', 400);

    const ancienStatut = badge.getEffectiveStatut();
    badge.statut = 'RÉVOQUÉ';
    badge.motifRevocation = motif;
    await badge.save();

    await logHistory({
      agentId: badge.agentId,
      badgeId: badge._id,
      action: 'BADGE_RÉVOQUÉ',
      ancienStatut,
      nouveauStatut: 'RÉVOQUÉ',
      motif,
      userId: req.user?.id,
    });

    res.json({ success: true, message: 'Badge révoqué avec succès', data: badge });
  } catch (error) {
    next(error);
  }
};

// ─── Suspendre un badge ───────────────────────────────────────────────────────
export const suspendBadge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) throw createError('Badge non trouvé', 404);
    if (badge.statut === 'RÉVOQUÉ') throw createError('Impossible de suspendre un badge révoqué', 400);
    if (badge.statut === 'SUSPENDU') throw createError('Badge déjà suspendu', 400);

    const { motif } = req.body;
    if (!motif) throw createError('Le motif de suspension est requis', 400);

    const ancienStatut = badge.getEffectiveStatut();
    badge.statut = 'SUSPENDU';
    badge.motifSuspension = motif;
    badge.dateSuspension = new Date();
    await badge.save();

    await logHistory({
      agentId: badge.agentId,
      badgeId: badge._id,
      action: 'BADGE_SUSPENDU',
      ancienStatut,
      nouveauStatut: 'SUSPENDU',
      motif,
      userId: req.user?.id,
    });

    res.json({ success: true, message: 'Badge suspendu avec succès', data: badge });
  } catch (error) {
    next(error);
  }
};

// ─── Renouveler un badge ──────────────────────────────────────────────────────
export const renewBadge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const oldBadge = await Badge.findById(req.params.id);
    if (!oldBadge) throw createError('Badge non trouvé', 404);
    if (oldBadge.statut === 'RÉVOQUÉ') throw createError('Impossible de renouveler un badge révoqué', 400);

    const { dateEmission, dateExpiration } = req.body;

    if (!dateEmission || !dateExpiration) {
      throw createError('Dates requises pour le renouvellement', 400);
    }

    // Archiver l'ancien badge
    oldBadge.statut = 'RÉVOQUÉ';
    oldBadge.motifRevocation = 'Renouvellement — remplacé par nouveau badge';
    await oldBadge.save();

    // Créer le nouveau badge
    const agent = await Agent.findById(oldBadge.agentId);
    if (!agent) throw createError('Agent non trouvé', 404);

    const qrToken = await generateQrToken();
    const badgeNumber = `BADGE-${agent.matricule}-${Date.now()}`;

    const newBadge = await Badge.create({
      agentId: oldBadge.agentId,
      badgeNumber,
      qrToken,
      dateEmission: new Date(dateEmission),
      dateExpiration: new Date(dateExpiration),
      statut: 'ACTIF',
    });

    const qrImage = await generateQrCodeImage(qrToken);

    await logHistory({
      agentId: oldBadge.agentId,
      badgeId: newBadge._id,
      action: 'BADGE_RENOUVELÉ',
      ancienStatut: oldBadge.statut,
      nouveauStatut: 'ACTIF',
      userId: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: { ...newBadge.toObject(), qrImage },
      message: 'Badge renouvelé avec succès',
    });
  } catch (error) {
    next(error);
  }
};
