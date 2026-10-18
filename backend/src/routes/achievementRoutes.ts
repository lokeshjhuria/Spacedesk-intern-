import { Router } from 'express';
import { AchievementController } from '../controllers/achievementController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', AchievementController.listAchievements);
router.post('/:id/claim', AchievementController.claimAchievement);

export default router;
