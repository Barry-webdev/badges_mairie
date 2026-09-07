import { Request, Response, NextFunction } from 'express';
import { Badge } from '../models/Badge';
import { Agent } from '../models/Agent';
import { createError } from '../middlewares/errorHandler.middleware';
import { format } from '../utils/dateUtils';

export const verifyBadge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    const badge = await Badge.findOne({ qrToken: token });
    if (!badge) {
      res.json({
        success: true,
        data: { found: false, statut: null },
        message: 'Badge introuvable',
      });
      return;
    }

    const agent = await Agent.findById(badge.agentId);
    if (!agent) throw createError('Agent associé introuvable', 404);

    // Calculer le statut effectif
    const effectiveStatut = badge.getEffectiveStatut();

    // Mettre à jour le statut EXPIRÉ en base si nécessaire
    if (effectiveStatut === 'EXPIRÉ' && badge.statut === 'ACTIF') {
      badge.statut = 'EXPIRÉ';
      await badge.save();
    }

    // N'exposer que les données publiques autorisées
    const publicData = {
      found: true,
      statut: effectiveStatut,
      agent: {
        nom: agent.nom,
        prenom: agent.prenom,
        matricule: agent.matricule,
        fonction: agent.fonction,
        affectation: agent.affectation,
        // La photo est exposée uniquement si le badge est valide
        photo: effectiveStatut !== 'RÉVOQUÉ' ? agent.photo : null,
      },
      badge: {
        dateEmission: format(badge.dateEmission),
        dateExpiration: format(badge.dateExpiration),
        validite: `Du ${format(badge.dateEmission)} au ${format(badge.dateExpiration)}`,
      },
    };

    res.json({ success: true, data: publicData });
  } catch (error) {
    next(error);
  }
};
