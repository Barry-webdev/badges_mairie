import { Types } from 'mongoose';
import { BadgeHistory, HistoryAction } from '../models/BadgeHistory';

interface LogHistoryParams {
  agentId: string | Types.ObjectId;
  badgeId?: string | Types.ObjectId;
  action: HistoryAction;
  ancienStatut?: string;
  nouveauStatut?: string;
  motif?: string;
  userId?: string | Types.ObjectId;
}

export const logHistory = async (params: LogHistoryParams): Promise<void> => {
  await BadgeHistory.create({
    agentId: params.agentId,
    badgeId: params.badgeId || null,
    action: params.action,
    ancienStatut: params.ancienStatut || null,
    nouveauStatut: params.nouveauStatut || null,
    motif: params.motif || null,
    userId: params.userId || null,
  });
};
