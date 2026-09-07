import { Router } from 'express';
import { verifyBadge } from '../controllers/verify.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Trop de requêtes de vérification.' },
});

// Route publique — pas d'authentification
router.get('/:token', verifyLimiter, verifyBadge);

export default router;
