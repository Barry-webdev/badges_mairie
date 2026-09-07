import mongoose, { Document, Schema, Types } from 'mongoose';

export type BadgeStatut = 'ACTIF' | 'SUSPENDU' | 'EXPIRÉ' | 'RÉVOQUÉ';

export interface IBadgeDocument extends Document {
  agentId: Types.ObjectId;
  badgeNumber: string;
  qrToken: string;
  dateEmission: Date;
  dateExpiration: Date;
  statut: BadgeStatut;
  motifRevocation?: string;
  motifSuspension?: string;
  dateSuspension?: Date;
  dateReactivation?: Date;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  getEffectiveStatut(): BadgeStatut;
}

const BadgeSchema = new Schema<IBadgeDocument>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'L\'ID de l\'agent est obligatoire'],
      index: true,
    },
    badgeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    dateEmission: {
      type: Date,
      required: [true, 'La date d\'émission est obligatoire'],
    },
    dateExpiration: {
      type: Date,
      required: [true, 'La date d\'expiration est obligatoire'],
    },
    statut: {
      type: String,
      enum: ['ACTIF', 'SUSPENDU', 'EXPIRÉ', 'RÉVOQUÉ'],
      default: 'ACTIF',
    },
    motifRevocation: { type: String, default: null },
    motifSuspension: { type: String, default: null },
    dateSuspension: { type: Date, default: null },
    dateReactivation: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Méthode pour vérifier l'expiration
BadgeSchema.methods.isExpired = function (): boolean {
  return new Date() > this.dateExpiration;
};

// Méthode pour obtenir le statut effectif (tient compte de l'expiration)
BadgeSchema.methods.getEffectiveStatut = function (): BadgeStatut {
  if (this.statut === 'RÉVOQUÉ') return 'RÉVOQUÉ';
  if (this.statut === 'SUSPENDU') return 'SUSPENDU';
  if (new Date() > this.dateExpiration) return 'EXPIRÉ';
  return 'ACTIF';
};

export const Badge = mongoose.model<IBadgeDocument>('Badge', BadgeSchema);
