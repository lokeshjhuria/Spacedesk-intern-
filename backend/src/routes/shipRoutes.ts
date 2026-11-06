import { Router } from 'express';
import { ShipController } from '../controllers/shipController';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', optionalAuth, ShipController.listShips);
router.post('/:id/unlock', authenticateToken, ShipController.unlockShip);
router.post('/:id/equip', authenticateToken, ShipController.equipShip);

export default router;
