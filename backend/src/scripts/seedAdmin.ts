import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gc-pita';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });
  console.log('✅ Connecté à MongoDB');

  const existing = await Admin.findOne({ role: 'ADMIN' });
  if (existing) {
    console.log('⚠️  Un compte ADMIN existe déjà :', existing.email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('Admin@GCPita2024!', 12);

  await Admin.create({
    nom: 'Administrateur Système',
    email: 'admin@mairie-pita.gn',
    passwordHash,
    role: 'ADMIN',
    actif: true,
  });

  console.log('✅ Compte administrateur créé :');
  console.log('   Email    : admin@mairie-pita.gn');
  console.log('   Mot de passe : Admin@GCPita2024!');
  console.log('   ⚠️  CHANGEZ ce mot de passe immédiatement en production !');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Erreur seed admin :', err);
  process.exit(1);
});
