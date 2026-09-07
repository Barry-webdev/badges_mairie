import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middlewares/errorHandler.middleware';

import authRoutes from './routes/auth.routes';
import agentRoutes from './routes/agent.routes';
import badgeRoutes from './routes/badge.routes';
import verifyRoutes from './routes/verify.routes';
import dashboardRoutes from './routes/dashboard.routes';
import historyRoutes from './routes/history.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ─── Middlewares globaux ──────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:4173',
    ];
    // Accepter toutes les origines Vercel du projet
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Servir les fichiers uploadés (photos des agents)
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'GC Pita API opérationnelle', timestamp: new Date() });
});

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage ────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info(`Serveur GC Pita démarré sur le port ${PORT}`);
    logger.info(`Environnement : ${process.env.NODE_ENV}`);
  });
};

start().catch((err) => {
  logger.error('Erreur au démarrage :', err);
  process.exit(1);
});

export default app;
