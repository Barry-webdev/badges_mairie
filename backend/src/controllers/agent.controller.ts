import { Response, NextFunction } from 'express';
import { Agent } from '../models/Agent';
import { Badge } from '../models/Badge';
import { AuthRequest } from '../types';
import { generateMatricule } from '../services/matricule.service';
import { logHistory } from '../services/history.service';
import { createError } from '../middlewares/errorHandler.middleware';
import path from 'path';
import fs from 'fs';

// ─── Liste agents (avec pagination, recherche, filtre) ────────────────────────
export const getAgents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = (req.query.search as string) || '';
    const statut = req.query.statut as string;

    // Construire le filtre agent
    const agentFilter: Record<string, unknown> = {};
    if (search) {
      agentFilter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { matricule: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
      ];
    }

    const agents = await Agent.find(agentFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Agent.countDocuments(agentFilter);

    // Enrichir avec le badge actif
    const agentsWithBadge = await Promise.all(
      agents.map(async (agent) => {
        const badge = await Badge.findOne(
          { agentId: agent._id },
          { statut: 1, dateExpiration: 1, dateEmission: 1 }
        ).sort({ createdAt: -1 });

        let effectiveStatut = badge?.statut || null;
        if (badge && badge.statut === 'ACTIF' && new Date() > badge.dateExpiration) {
          effectiveStatut = 'EXPIRÉ';
        }

        return {
          ...agent,
          _id: agent._id.toString(),
          badge: badge ? {
            _id: badge._id.toString(),
            statut: effectiveStatut,
            dateExpiration: badge.dateExpiration,
            dateEmission: badge.dateEmission,
          } : null
        };
      })
    );

    // Filtrer par statut si demandé
    const filtered = statut
      ? agentsWithBadge.filter((a) => a.badge?.statut === statut)
      : agentsWithBadge;

    res.json({
      success: true,
      data: filtered,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Créer un agent ───────────────────────────────────────────────────────────
export const createAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      nom, prenom, sexe, dateNaissance, lieuNaissance,
      fonction, affectation, telephone, dateRecrutement,
    } = req.body;

    const matricule = await generateMatricule();
    const photo = req.file ? req.file.filename : undefined;

    const agent = await Agent.create({
      matricule,
      nom,
      prenom,
      sexe,
      dateNaissance,
      lieuNaissance,
      photo,
      fonction,
      affectation,
      telephone,
      dateRecrutement,
    });

    await logHistory({
      agentId: agent._id,
      action: 'AGENT_CRÉÉ',
      nouveauStatut: 'ACTIF',
      userId: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: agent,
      message: 'Agent créé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Obtenir un agent ─────────────────────────────────────────────────────────
export const getAgentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const agent = await Agent.findById(req.params.id).lean();
    if (!agent) throw createError('Agent non trouvé', 404);

    const badge = await Badge.findOne({ agentId: agent._id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculer statut effectif
    let effectiveBadge = null;
    if (badge) {
      let statut = badge.statut;
      if (statut === 'ACTIF' && new Date() > badge.dateExpiration) {
        statut = 'EXPIRÉ';
      }
      effectiveBadge = {
        ...badge,
        _id: badge._id.toString(),
        agentId: badge.agentId.toString(),
        statut,
      };
    }

    res.json({
      success: true,
      data: {
        ...agent,
        _id: agent._id.toString(),
        badge: effectiveBadge,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Modifier un agent ────────────────────────────────────────────────────────
export const updateAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) throw createError('Agent non trouvé', 404);

    const allowedFields = [
      'nom', 'prenom', 'sexe', 'dateNaissance', 'lieuNaissance',
      'fonction', 'affectation', 'telephone', 'dateRecrutement',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (agent as any)[field] = req.body[field];
      }
    });

    if (req.file) {
      // Supprimer l'ancienne photo
      if (agent.photo) {
        const oldPath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'photos', agent.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      agent.photo = req.file.filename;
    }

    await agent.save();

    await logHistory({
      agentId: agent._id,
      action: 'AGENT_MODIFIÉ',
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: agent,
      message: 'Agent mis à jour avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Supprimer un agent ───────────────────────────────────────────────────────
export const deleteAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) throw createError('Agent non trouvé', 404);

    // Supprimer la photo
    if (agent.photo) {
      const photoPath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'photos', agent.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    // Supprimer les badges associés
    await Badge.deleteMany({ agentId: agent._id });

    await agent.deleteOne();

    res.json({ success: true, message: 'Agent supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
