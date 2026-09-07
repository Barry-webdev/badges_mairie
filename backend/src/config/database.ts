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
      socketTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
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
    logger.warn('MongoDB déconnecté');
  });
};
