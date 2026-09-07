/**
 * Formate une date en format français lisible
 */
export const format = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formate une date en format long français
 */
export const formatLong = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Vérifie si une date est dépassée
 */
export const isExpired = (date: Date | string): boolean => {
  const d = date instanceof Date ? date : new Date(date);
  return new Date() > d;
};

/**
 * Calcule le nombre de jours avant expiration
 */
export const daysUntilExpiration = (date: Date | string): number => {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
