import { Router } from 'express';
import authRoutes from './authRoutes';
import playerRoutes from './playerRoutes';
import missionRoutes from './missionRoutes';
import shipRoutes from './shipRoutes';
import upgradeRoutes from './upgradeRoutes';
import walletRoutes from './walletRoutes';
import leaderboardRoutes from './leaderboardRoutes';
import achievementRoutes from './achievementRoutes';
import eventRoutes from './eventRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/player', playerRoutes);
router.use('/missions', missionRoutes);
router.use('/ships', shipRoutes);
router.use('/upgrades', upgradeRoutes);
router.use('/wallet', walletRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/achievements', achievementRoutes);
router.use('/events', eventRoutes);
router.use('/admin', adminRoutes);

export default router;
