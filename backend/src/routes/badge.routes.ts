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
router.get('/:id', getBadgeById);
router.post('/:id/generate', generateBadge);
router.get('/:id/pdf', downloadBadgePdf);
router.post('/:id/revoke', revokeBadge);
router.post('/:id/suspend', suspendBadge);
router.post('/:id/renew', renewBadge);

export default router;
