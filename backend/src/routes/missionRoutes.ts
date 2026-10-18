import { Router } from 'express';
import { MissionController } from '../controllers/missionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', MissionController.listMissions);
router.get('/:id', MissionController.getMissionById);
router.post('/:id/start', MissionController.startMission);
router.post('/:id/complete', MissionController.completeMission);

export default router;
