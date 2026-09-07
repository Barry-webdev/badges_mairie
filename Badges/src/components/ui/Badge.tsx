import type { BadgeStatut } from '../../types';

interface StatusBadgeProps {
  statut: BadgeStatut | string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIF: { label: 'Actif', classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
  SUSPENDU: { label: 'Suspendu', classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
  EXPIRÉ: { label: 'Expiré', classes: 'bg-orange-100 text-orange-800 border border-orange-200' },
  RÉVOQUÉ: { label: 'Révoqué', classes: 'bg-red-100 text-red-800 border border-red-200' },
};

export const StatusBadge = ({ statut, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[statut] || { label: statut, classes: 'bg-gray-100 text-gray-700 border border-gray-200' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClass} ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statut === 'ACTIF' ? 'bg-emerald-500' : statut === 'RÉVOQUÉ' ? 'bg-red-500' : 'bg-amber-500'}`} />
      {config.label}
    </span>
  );
};
