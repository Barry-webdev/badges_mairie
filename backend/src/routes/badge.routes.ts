import { Router } from 'express';
import {
  getBadges,
  getBadgeById,
  generateBadge,
  downloadBadgePdf,
  revokeBadge,
  suspendBadge,
  renewBadge,
} from '../controllers/badge.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getBadges);

// Routes spécifiques AVANT la route générique /:id
router.get('/:id/pdf', downloadBadgePdf);
router.post('/:id/generate', generateBadge);
router.post('/:id/revoke', revokeBadge);
router.post('/:id/suspend', suspendBadge);
router.post('/:id/renew', renewBadge);

// Route générique en dernier
router.get('/:id', getBadgeById);

export default router;
