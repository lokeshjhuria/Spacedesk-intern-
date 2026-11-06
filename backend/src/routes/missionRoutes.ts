import { Router } from 'express';
import { MissionController } from '../controllers/missionController';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

// Publicly readable missions catalog with user overlay if authenticated
router.get('/', optionalAuth, MissionController.listMissions);
router.get('/:id', optionalAuth, MissionController.getMissionById);

// Gameplay sessions require authenticated user
router.post('/:id/start', authenticateToken, MissionController.startMission);
router.post('/:id/complete', authenticateToken, MissionController.completeMission);

export default router;
