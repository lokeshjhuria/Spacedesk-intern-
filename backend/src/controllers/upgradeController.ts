import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Upgrade } from '../models/Upgrade';
import { PlayerProfile } from '../models/PlayerProfile';
import { Wallet } from '../models/Wallet';
import { WalletService } from '../services/walletService';

export class UpgradeController {
  /**
   * List upgrade systems with current level and next level cost
   */
  static async listUpgrades(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const upgrades = await Upgrade.find();
      const profile = await PlayerProfile.findOne({ userId });

      const equippedUpgrades = profile?.equippedUpgrades || {
        weapon: 1,
        shield: 1,
        engine: 1,
        hull: 1,
        reactor: 1
      };

      const result = upgrades.map((u) => {
        const curLevel = equippedUpgrades[u.category] || 1;
        const isMaxLevel = curLevel >= u.maxLevel;

        const nextCostCredits = isMaxLevel
          ? 0
          : Math.round(u.baseCost.credits * Math.pow(u.costMultiplier, curLevel - 1));

        const nextCostEnergy = isMaxLevel
          ? 0
          : Math.round(u.baseCost.energyCores * Math.pow(1.3, curLevel - 1));

        return {
          ...u.toObject(),
          currentLevel: curLevel,
          isMaxLevel,
          currentMultiplier: 1 + (curLevel - 1) * u.multiplierPerLevel,
          nextMultiplier: isMaxLevel ? 1 + (curLevel - 1) * u.multiplierPerLevel : 1 + curLevel * u.multiplierPerLevel,
          nextCost: {
            credits: nextCostCredits,
            energyCores: nextCostEnergy
          }
        };
      });

      res.json({ success: true, upgrades: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Purchase an upgrade level
   */
  static async purchaseUpgrade(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { category } = req.body;

      if (!category) {
        res.status(400).json({ success: false, error: 'Upgrade category is required' });
        return;
      }

      const upgradeDef = await Upgrade.findOne({ category });
      if (!upgradeDef) {
        res.status(404).json({ success: false, error: `Upgrade category ${category} not found` });
        return;
      }

      const profile = await PlayerProfile.findOne({ userId });
      if (!profile) {
        res.status(404).json({ success: false, error: 'Player profile not found' });
        return;
      }

      const curLevel = profile.equippedUpgrades[category] || 1;
      if (curLevel >= upgradeDef.maxLevel) {
        res.status(400).json({ success: false, error: `${upgradeDef.name} has already reached maximum level (${upgradeDef.maxLevel})` });
        return;
      }

      const costCredits = Math.round(upgradeDef.baseCost.credits * Math.pow(upgradeDef.costMultiplier, curLevel - 1));
      const costEnergy = Math.round(upgradeDef.baseCost.energyCores * Math.pow(1.3, curLevel - 1));

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        res.status(404).json({ success: false, error: 'Wallet not found' });
        return;
      }

      if (wallet.credits < costCredits) {
        res.status(400).json({
          success: false,
          error: `Insufficient Credits (requires ${costCredits}, you have ${wallet.credits})`
        });
        return;
      }

      if (wallet.energyCores < costEnergy) {
        res.status(400).json({
          success: false,
          error: `Insufficient Energy Cores (requires ${costEnergy}, you have ${wallet.energyCores})`
        });
        return;
      }

      // Deduct wallet balances atomically
      if (costCredits > 0) {
        await WalletService.adjustBalance({
          userId,
          currency: 'credits',
          amount: -costCredits,
          type: 'upgrade_purchase',
          referenceId: upgradeDef.upgradeId,
          note: `Upgraded ${upgradeDef.name} to level ${curLevel + 1}`
        });
      }

      if (costEnergy > 0) {
        await WalletService.adjustBalance({
          userId,
          currency: 'energyCores',
          amount: -costEnergy,
          type: 'upgrade_purchase',
          referenceId: upgradeDef.upgradeId,
          note: `Upgraded ${upgradeDef.name} to level ${curLevel + 1}`
        });
      }

      // Update equipped upgrade level
      profile.equippedUpgrades[category] = curLevel + 1;
      profile.markModified('equippedUpgrades');
      await profile.save();

      const updatedWallet = await Wallet.findOne({ userId });

      res.json({
        success: true,
        message: `${upgradeDef.name} upgraded to Level ${curLevel + 1}!`,
        category,
        newLevel: curLevel + 1,
        wallet: updatedWallet
      });
    } catch (err: any) {
      console.error('[Upgrade Purchase Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
