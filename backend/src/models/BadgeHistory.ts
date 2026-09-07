import mongoose, { Document, Schema, Types } from 'mongoose';

export type HistoryAction =
  | 'AGENT_CRÉÉ'
  | 'AGENT_MODIFIÉ'
  | 'BADGE_GÉNÉRÉ'
  | 'BADGE_RENOUVELÉ'
  | 'BADGE_SUSPENDU'
  | 'BADGE_RÉACTIVÉ'
  | 'BADGE_RÉVOQUÉ';

export interface IBadgeHistoryDocument extends Document {
  agentId: Types.ObjectId;
  badgeId?: Types.ObjectId;
  action: HistoryAction;
  ancienStatut?: string;
  nouveauStatut?: string;
  motif?: string;
  userId?: Types.ObjectId;
  createdAt: Date;
}

const BadgeHistorySchema = new Schema<IBadgeHistoryDocument>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      default: null,
    },
    action: {
      type: String,
      enum: [
        'AGENT_CRÉÉ',
        'AGENT_MODIFIÉ',
        'BADGE_GÉNÉRÉ',
        'BADGE_RENOUVELÉ',
        'BADGE_SUSPENDU',
        'BADGE_RÉACTIVÉ',
        'BADGE_RÉVOQUÉ',
      ],
      required: true,
    },
    ancienStatut: { type: String, default: null },
    nouveauStatut: { type: String, default: null },
    motif: { type: String, default: null },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const BadgeHistory = mongoose.model<IBadgeHistoryDocument>(
  'BadgeHistory',
  BadgeHistorySchema
);
