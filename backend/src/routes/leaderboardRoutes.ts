import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboardController';

const router = Router();

// Publicly readable or accessible to authenticated users
router.get('/', LeaderboardController.getLeaderboard);

export default router;
