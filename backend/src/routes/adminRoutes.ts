import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/audit-logs', AdminController.getAuditLogs);
router.post('/grant-currency', AdminController.grantCurrency);
router.get('/stats', AdminController.getSystemStats);

export default router;
