import { Router } from 'express';
import { UpgradeController } from '../controllers/upgradeController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', UpgradeController.listUpgrades);
router.post('/purchase', UpgradeController.purchaseUpgrade);

export default router;
