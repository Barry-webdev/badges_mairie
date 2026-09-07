import { Request } from 'express';

// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'RESPONSABLE_GARDE';

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Agent ───────────────────────────────────────────────────────────────────
export type Sexe = 'M' | 'F';

export interface IAgent {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: Sexe;
  dateNaissance: Date;
  lieuNaissance: string;
  photo?: string;
  fonction: string;
  affectation: string;
  telephone: string;
  dateRecrutement: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export type BadgeStatut = 'ACTIF' | 'SUSPENDU' | 'EXPIRÉ' | 'RÉVOQUÉ';

export interface IBadge {
  _id: string;
  agentId: string;
  badgeNumber: string;
  qrToken: string;
  dateEmission: Date;
  dateExpiration: Date;
  statut: BadgeStatut;
  motifRevocation?: string;
  motifSuspension?: string;
  dateSuspension?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── History ─────────────────────────────────────────────────────────────────
export type HistoryAction =
  | 'AGENT_CRÉÉ'
  | 'AGENT_MODIFIÉ'
  | 'BADGE_GÉNÉRÉ'
  | 'BADGE_RENOUVELÉ'
  | 'BADGE_SUSPENDU'
  | 'BADGE_RÉACTIVÉ'
  | 'BADGE_RÉVOQUÉ';

export interface IBadgeHistory {
  _id: string;
  agentId: string;
  badgeId?: string;
  action: HistoryAction;
  ancienStatut?: BadgeStatut;
  nouveauStatut?: BadgeStatut;
  motif?: string;
  userId?: string;
  createdAt: Date;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
