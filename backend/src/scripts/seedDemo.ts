import 'dotenv/config';
import mongoose from 'mongoose';
import { Agent } from '../models/Agent';
import { Badge } from '../models/Badge';
import { BadgeHistory } from '../models/BadgeHistory';
import { generateQrToken } from '../services/qrcode.service';

const demoAgents = [
  {
    matricule: 'GC-PITA-001',
    nom: 'MARAA',
    prenom: 'Ibrahima',
    sexe: 'M' as const,
    dateNaissance: new Date('1990-03-15'),
    lieuNaissance: 'Pita',
    fonction: 'Agent de Sécurité',
    affectation: 'Centre',
    telephone: '+224 621 00 01 01',
    dateRecrutement: new Date('2020-01-10'),
  },
  {
    matricule: 'GC-PITA-002',
    nom: 'DIALLO',
    prenom: 'Mamadou',
    sexe: 'M' as const,
    dateNaissance: new Date('1988-07-22'),
    lieuNaissance: 'Conakry',
    fonction: 'Chef de Patrouille',
    affectation: 'Nord',
    telephone: '+224 621 00 02 02',
    dateRecrutement: new Date('2019-06-01'),
  },
  {
    matricule: 'GC-PITA-003',
    nom: 'BAH',
    prenom: 'Fatoumata',
    sexe: 'F' as const,
    dateNaissance: new Date('1995-11-30'),
    lieuNaissance: 'Labé',
    fonction: 'Agent de Contrôle',
    affectation: 'Sud',
    telephone: '+224 621 00 03 03',
    dateRecrutement: new Date('2021-03-15'),
  },
  {
    matricule: 'GC-PITA-004',
    nom: 'BARRY',
    prenom: 'Thierno',
    sexe: 'M' as const,
    dateNaissance: new Date('1985-05-12'),
    lieuNaissance: 'Pita',
    fonction: 'Responsable de Secteur',
    affectation: 'Est',
    telephone: '+224 621 00 04 04',
    dateRecrutement: new Date('2018-09-01'),
  },
  {
    matricule: 'GC-PITA-005',
    nom: 'CAMARA',
    prenom: 'Aïssatou',
    sexe: 'F' as const,
    dateNaissance: new Date('1993-08-18'),
    lieuNaissance: 'Kindia',
    fonction: 'Agent de Sécurité',
    affectation: 'Ouest',
    telephone: '+224 621 00 05 05',
    dateRecrutement: new Date('2022-01-20'),
  },
];

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gc-pita';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });
  console.log('✅ Connecté à MongoDB');

  for (const data of demoAgents) {
    const exists = await Agent.findOne({ matricule: data.matricule });
    if (exists) {
      console.log(`⏩ ${data.matricule} existe déjà, ignoré`);
      continue;
    }

    const agent = await Agent.create(data);
    const qrToken = await generateQrToken();
    const now = new Date();
    const expiration = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    const badge = await Badge.create({
      agentId: agent._id,
      badgeNumber: `BADGE-${agent.matricule}-${Date.now()}`,
      qrToken,
      dateEmission: now,
      dateExpiration: expiration,
      statut: 'ACTIF',
    });

    await BadgeHistory.create({
      agentId: agent._id,
      badgeId: badge._id,
      action: 'BADGE_GÉNÉRÉ',
      nouveauStatut: 'ACTIF',
    });

    console.log(`✅ Créé : ${data.matricule} — ${data.prenom} ${data.nom}`);
  }

  console.log('\n🎉 Données de démonstration créées avec succès !');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Erreur seed demo :', err);
  process.exit(1);
});
