import { Response, NextFunction } from 'express';
import { Agent } from '../models/Agent';
import { Badge } from '../models/Badge';
import { BadgeHistory } from '../models/BadgeHistory';
import { AuthRequest } from '../types';

export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    // Stats générales
    const totalAgents = await Agent.countDocuments();

    // Stats badges
    const [actifs, suspendus, expires, revoques] = await Promise.all([
      Badge.countDocuments({ statut: 'ACTIF', dateExpiration: { $gte: now } }),
      Badge.countDocuments({ statut: 'SUSPENDU' }),
      Badge.countDocuments({
        $or: [
          { statut: 'EXPIRÉ' },
          { statut: 'ACTIF', dateExpiration: { $lt: now } },
        ],
      }),
      Badge.countDocuments({ statut: 'RÉVOQUÉ' }),
    ]);

    // Derniers agents
    const derniersAgents = await Agent.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Badges arrivant à expiration dans 30 jours
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const badgesExpirantBientot = await Badge.find({
      statut: 'ACTIF',
      dateExpiration: { $gte: now, $lte: in30Days },
    })
      .populate('agentId', 'nom prenom matricule')
      .limit(5)
      .lean();

    // Activité récente
    const activiteRecente = await BadgeHistory.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('agentId', 'nom prenom matricule')
      .populate('userId', 'nom')
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalAgents,
          badgesActifs: actifs,
          badgesSuspendus: suspendus,
          badgesExpires: expires,
          badgesRevoques: revoques,
        },
        derniersAgents,
        badgesExpirantBientot,
        activiteRecente,
      },
    });
  } catch (error) {
    next(error);
  }
};
