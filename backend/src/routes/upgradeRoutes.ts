import { Router } from 'express';
import { UpgradeController } from '../controllers/upgradeController';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', optionalAuth, UpgradeController.listUpgrades);
router.post('/purchase', authenticateToken, UpgradeController.purchaseUpgrade);

export default router;
