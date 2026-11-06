import { Router } from 'express';
import { MissionController } from '../controllers/missionController';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

// Publicly readable missions catalog with user overlay if authenticated
router.get('/', optionalAuth, MissionController.listMissions);
router.get('/:id', optionalAuth, MissionController.getMissionById);

// Gameplay sessions support authenticated pilots and guest standby flights
router.post('/:id/start', optionalAuth, MissionController.startMission);
router.post('/:id/complete', optionalAuth, MissionController.completeMission);

export default router;
