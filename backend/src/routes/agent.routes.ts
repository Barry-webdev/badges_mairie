import { Router } from 'express';
import {
  getAgents,
  createAgent,
  getAgentById,
  updateAgent,
  deleteAgent,
} from '../controllers/agent.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadPhoto } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAgents);
router.post('/', uploadPhoto, createAgent);
router.get('/:id', getAgentById);
router.put('/:id', uploadPhoto, updateAgent);
router.delete('/:id', authorize('ADMIN'), deleteAgent);

export default router;
