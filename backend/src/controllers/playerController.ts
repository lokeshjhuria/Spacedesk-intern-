import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { PlayerProfile } from '../models/PlayerProfile';
import { PlayerProgress } from '../models/PlayerProgress';
import { PlayerShip } from '../models/PlayerShip';
import { Ship } from '../models/Ship';

export class PlayerController {
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const profile = await PlayerProfile.findOne({ userId });
      if (!profile) {
        res.status(404).json({ success: false, error: 'Player profile not found' });
        return;
      }
      res.json({ success: true, profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const progress = await PlayerProgress.findOne({ userId });
      res.json({ success: true, progress });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getInventory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const playerShips = await PlayerShip.find({ userId });
      const shipDefs = await Ship.find();
      const profile = await PlayerProfile.findOne({ userId });

      res.json({
        success: true,
        ships: playerShips,
        shipDefinitions: shipDefs,
        equippedUpgrades: profile?.equippedUpgrades || {},
        equippedShipId: profile?.equippedShipId || 'ship_interceptor'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { displayName, avatarUrl } = req.body;

      const profile = await PlayerProfile.findOneAndUpdate(
        { userId },
        {
          ...(displayName && { displayName }),
          ...(avatarUrl && { avatarUrl })
        },
        { new: true }
      );

      res.json({ success: true, message: 'Profile updated successfully', profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
