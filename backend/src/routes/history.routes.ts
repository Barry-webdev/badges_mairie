import { Router } from 'express';
import { getHistory } from '../controllers/history.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getHistory);

export default router;
