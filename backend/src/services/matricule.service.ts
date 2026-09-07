import { Agent } from '../models/Agent';

/**
 * Génère un matricule unique au format GC-PITA-XXX
 * Garantit l'unicité en vérifiant en base de données
 */
export const generateMatricule = async (): Promise<string> => {
  // Trouver le dernier matricule existant
  const lastAgent = await Agent.findOne(
    { matricule: /^GC-PITA-\d+$/ },
    { matricule: 1 }
  ).sort({ matricule: -1 });

  let nextNumber = 1;

  if (lastAgent) {
    const parts = lastAgent.matricule.split('-');
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Padder avec des zéros : GC-PITA-001
  const padded = String(nextNumber).padStart(3, '0');
  const candidate = `GC-PITA-${padded}`;

  // Vérifier l'unicité (protection contre concurrence)
  const exists = await Agent.findOne({ matricule: candidate });
  if (exists) {
    // Chercher le premier disponible
    return findNextAvailableMatricule(nextNumber + 1);
  }

  return candidate;
};

const findNextAvailableMatricule = async (start: number): Promise<string> => {
  let number = start;
  while (number <= 9999) {
    const padded = String(number).padStart(3, '0');
    const candidate = `GC-PITA-${padded}`;
    const exists = await Agent.findOne({ matricule: candidate });
    if (!exists) return candidate;
    number++;
  }
  throw new Error('Impossible de générer un nouveau matricule : plage épuisée');
};
