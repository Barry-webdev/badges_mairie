import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI non définie dans les variables d\'environnement');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      heartbeatFrequencyMS: 10000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    logger.info(`MongoDB connecté : ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('Erreur de connexion MongoDB :', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('Erreur MongoDB :', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB déconnecté — tentative de reconnexion...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI!, {
        serverSelectionTimeoutMS: 30000,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      }).catch((err) => logger.error('Reconnexion MongoDB échouée :', err));
    }, 5000);
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnecté avec succès');
  });
};
