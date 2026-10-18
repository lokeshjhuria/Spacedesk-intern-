import { Router } from 'express';
import { PlayerController } from '../controllers/playerController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/profile', PlayerController.getProfile);
router.put('/profile', PlayerController.updateProfile);
router.get('/progress', PlayerController.getProgress);
router.get('/inventory', PlayerController.getInventory);

export default router;
