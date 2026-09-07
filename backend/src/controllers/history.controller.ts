import { Response, NextFunction } from 'express';
import { BadgeHistory } from '../models/BadgeHistory';
import { AuthRequest } from '../types';

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const agentId = req.query.agentId as string;
    const action = req.query.action as string;

    const filter: Record<string, unknown> = {};
    if (agentId) filter.agentId = agentId;
    if (action) filter.action = action;

    const history = await BadgeHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('agentId', 'nom prenom matricule')
      .populate('badgeId', 'badgeNumber')
      .populate('userId', 'nom email')
      .lean();

    const total = await BadgeHistory.countDocuments(filter);

    res.json({
      success: true,
      data: history,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};
