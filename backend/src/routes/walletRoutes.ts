import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', WalletController.getWallet);
router.get('/transactions', WalletController.getTransactions);
router.get('/streak', WalletController.getDailyStreak);
router.post('/daily/claim', WalletController.claimDailyReward);
router.post('/ads/request', WalletController.requestRewardedAd);
router.post('/ads/complete', WalletController.completeRewardedAd);

export default router;
