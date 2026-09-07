// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'RESPONSABLE_GARDE';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Agent ────────────────────────────────────────────────────────────────────
export type Sexe = 'M' | 'F';

export interface Agent {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: Sexe;
  dateNaissance: string;
  lieuNaissance: string;
  photo?: string;
  fonction: string;
  affectation: string;
  telephone: string;
  dateRecrutement: string;
  createdAt: string;
  updatedAt: string;
  badge?: Badge | null;
}

export interface AgentFormData {
  nom: string;
  prenom: string;
  sexe: Sexe | '';
  dateNaissance: string;
  lieuNaissance: string;
  photo?: File | null;
  fonction: string;
  affectation: string;
  telephone: string;
  dateRecrutement: string;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export type BadgeStatut = 'ACTIF' | 'SUSPENDU' | 'EXPIRÉ' | 'RÉVOQUÉ';

export interface Badge {
  _id: string;
  agentId: string | Agent;
  badgeNumber: string;
  qrToken: string;
  qrImage?: string;
  dateEmission: string;
  dateExpiration: string;
  statut: BadgeStatut;
  motifRevocation?: string;
  motifSuspension?: string;
  dateSuspension?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  stats: {
    totalAgents: number;
    badgesActifs: number;
    badgesSuspendus: number;
    badgesExpires: number;
    badgesRevoques: number;
  };
  derniersAgents: Agent[];
  badgesExpirantBientot: Badge[];
  activiteRecente: HistoryItem[];
}

// ─── History ──────────────────────────────────────────────────────────────────
export type HistoryAction =
  | 'AGENT_CRÉÉ'
  | 'AGENT_MODIFIÉ'
  | 'BADGE_GÉNÉRÉ'
  | 'BADGE_RENOUVELÉ'
  | 'BADGE_SUSPENDU'
  | 'BADGE_RÉACTIVÉ'
  | 'BADGE_RÉVOQUÉ';

export interface HistoryItem {
  _id: string;
  agentId: Agent | null;
  badgeId?: Badge | null;
  action: HistoryAction;
  ancienStatut?: string;
  nouveauStatut?: string;
  motif?: string;
  userId?: User | null;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Vérification publique ────────────────────────────────────────────────────
export interface VerificationData {
  found: boolean;
  statut: BadgeStatut | null;
  agent?: {
    nom: string;
    prenom: string;
    matricule: string;
    fonction: string;
    affectation: string;
    photo?: string | null;
  };
  badge?: {
    dateEmission: string;
    dateExpiration: string;
    validite: string;
  };
}
