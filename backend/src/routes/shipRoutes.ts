import { Router } from 'express';
import { ShipController } from '../controllers/shipController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', ShipController.listShips);
router.post('/:id/unlock', ShipController.unlockShip);
router.post('/:id/equip', ShipController.equipShip);

export default router;
