import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Ship } from '../models/Ship';
import { PlayerShip } from '../models/PlayerShip';
import { PlayerProgress } from '../models/PlayerProgress';
import { PlayerProfile } from '../models/PlayerProfile';
import { Wallet } from '../models/Wallet';
import { WalletService } from '../services/walletService';

export class ShipController {
  /**
   * List all 5 ship classes with ownership and equip status
   */
  static async listShips(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const ships = await Ship.find().sort({ 'unlockRequirement.minLevel': 1 });
      const playerShips = await PlayerShip.find({ userId });
      const progress = await PlayerProgress.findOne({ userId });
      const profile = await PlayerProfile.findOne({ userId });

      const ownedMap = new Map<string, any>();
      for (const ps of playerShips) {
        ownedMap.set(ps.shipId, ps);
      }

      const completedMissionIds = new Set(progress?.completedMissions.map((m) => m.missionId) || []);
      const playerLevel = profile ? profile.level : 1;

      const shipsWithStatus = ships.map((s) => {
        const owned = ownedMap.get(s.shipId);
        const isOwned = !!owned;
        const isEquipped = profile?.equippedShipId === s.shipId;

        // Check if unlock conditions are met
        const meetsLevel = playerLevel >= s.unlockRequirement.minLevel;
        const meetsMission = !s.unlockRequirement.requiredMissionId || completedMissionIds.has(s.unlockRequirement.requiredMissionId);
        const canUnlock = meetsLevel && meetsMission;

        return {
          ...s.toObject(),
          isOwned,
          isEquipped,
          canUnlock,
          playerUpgradeLevels: owned?.upgradeLevels || { weapon: 1, shield: 1, speed: 1, special: 1 }
        };
      });

      res.json({ success: true, ships: shipsWithStatus });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Purchase / Unlock a ship class
   */
  static async unlockShip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      const ship = await Ship.findOne({ shipId: id });
      if (!ship) {
        res.status(404).json({ success: false, error: `Ship ${id} not found` });
        return;
      }

      // Check if already owned
      const existing = await PlayerShip.findOne({ userId, shipId: id });
      if (existing) {
        res.status(400).json({ success: false, error: 'Ship is already unlocked and in your hangar' });
        return;
      }

      // Check level and mission prereqs
      const profile = await PlayerProfile.findOne({ userId });
      const progress = await PlayerProgress.findOne({ userId });
      const playerLevel = profile ? profile.level : 1;

      if (playerLevel < ship.unlockRequirement.minLevel) {
        res.status(400).json({
          success: false,
          error: `Pilot level ${ship.unlockRequirement.minLevel} required to commission this ship`
        });
        return;
      }

      if (ship.unlockRequirement.requiredMissionId) {
        const hasMission = progress?.completedMissions.some(
          (m) => m.missionId === ship.unlockRequirement.requiredMissionId
        );
        if (!hasMission) {
          res.status(400).json({
            success: false,
            error: `Must complete mission ${ship.unlockRequirement.requiredMissionId} before commissioning this ship`
          });
          return;
        }
      }

      // Check affordability
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        res.status(400).json({ success: false, error: 'Wallet not found' });
        return;
      }

      if (wallet.credits < ship.price.credits) {
        res.status(400).json({
          success: false,
          error: `Insufficient Credits (requires ${ship.price.credits}, you have ${wallet.credits})`
        });
        return;
      }

      if (wallet.energyCores < ship.price.energyCores) {
        res.status(400).json({
          success: false,
          error: `Insufficient Energy Cores (requires ${ship.price.energyCores}, you have ${wallet.energyCores})`
        });
        return;
      }

      if ((ship.price.veloopCoins || 0) > 0 && wallet.veloopCoins < (ship.price.veloopCoins || 0)) {
        res.status(400).json({
          success: false,
          error: `Insufficient VELoop Reward Coins (requires ${ship.price.veloopCoins}, you have ${wallet.veloopCoins})`
        });
        return;
      }

      // Atomically debit wallet balances
      if (ship.price.credits > 0) {
        await WalletService.adjustBalance({
          userId,
          currency: 'credits',
          amount: -ship.price.credits,
          type: 'ship_purchase',
          referenceId: ship.shipId,
          note: `Unlocked ship ${ship.name}`
        });
      }

      if (ship.price.energyCores > 0) {
        await WalletService.adjustBalance({
          userId,
          currency: 'energyCores',
          amount: -ship.price.energyCores,
          type: 'ship_purchase',
          referenceId: ship.shipId,
          note: `Unlocked ship ${ship.name}`
        });
      }

      if ((ship.price.veloopCoins || 0) > 0) {
        await WalletService.adjustBalance({
          userId,
          currency: 'veloopCoins',
          amount: -(ship.price.veloopCoins || 0),
          type: 'ship_purchase',
          referenceId: ship.shipId,
          note: `Commissioned premium ship ${ship.name}`
        });
      }

      // Register player ship
      const newPlayerShip = await PlayerShip.create({
        userId,
        shipId: ship.shipId,
        isEquipped: false,
        upgradeLevels: { weapon: 1, shield: 1, speed: 1, special: 1 }
      });

      // Update progress unlocked ships array
      await PlayerProgress.findOneAndUpdate(
        { userId },
        { $addToSet: { unlockedShips: ship.shipId } },
        { upsert: true }
      );

      const updatedWallet = await Wallet.findOne({ userId });

      res.json({
        success: true,
        message: `Successfully commissioned ${ship.name} into your hangar!`,
        ship: newPlayerShip,
        wallet: updatedWallet
      });
    } catch (err: any) {
      console.error('[Unlock Ship Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Equip an owned ship
   */
  static async equipShip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      const playerShip = await PlayerShip.findOne({ userId, shipId: id });
      if (!playerShip) {
        res.status(404).json({ success: false, error: 'Ship is not in your hangar. Unlock it first.' });
        return;
      }

      // Unequip all and equip target
      await PlayerShip.updateMany({ userId }, { $set: { isEquipped: false } });
      playerShip.isEquipped = true;
      await playerShip.save();

      // Update profile
      await PlayerProfile.findOneAndUpdate({ userId }, { $set: { equippedShipId: id } });

      res.json({
        success: true,
        message: `${id} is now your active combat vessel.`,
        equippedShipId: id
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
