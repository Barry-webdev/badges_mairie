import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, getMe);

export default router;
