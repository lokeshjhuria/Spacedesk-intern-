import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Achievement } from '../models/Achievement';
import { PlayerAchievement } from '../models/PlayerAchievement';
import { PlayerProfile } from '../models/PlayerProfile';
import { PlayerProgress } from '../models/PlayerProgress';
import { Wallet } from '../models/Wallet';
import { WalletService } from '../services/walletService';

export class AchievementController {
  static async listAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const achievements = await Achievement.find();
      const playerAchievements = await PlayerAchievement.find({ userId });
      const profile = await PlayerProfile.findOne({ userId });
      const progress = await PlayerProgress.findOne({ userId });
      const wallet = await Wallet.findOne({ userId });

      const claimMap = new Map<string, any>();
      for (const pa of playerAchievements) {
        claimMap.set(pa.achievementId, pa);
      }

      const results = achievements.map((ach) => {
        let currentValue = 0;

        // Compute current progress from player records
        switch (ach.code) {
          case 'FIRST_BLOOD':
          case 'HUNTER_100':
          case 'WARLORD_500':
            currentValue = profile?.stats.enemiesKilled || 0;
            break;
          case 'DREADNOUGHT_FALL':
            currentValue = (progress?.completedMissions.some((m) => m.missionId === 'M-10') ? 1 : 0);
            break;
          case 'SECTOR_SOVEREIGN':
            currentValue = ['M-10', 'M-20', 'M-30', 'M-40', 'M-50'].filter((bossM) =>
              progress?.completedMissions.some((m) => m.missionId === bossM)
            ).length;
            break;
          case 'VETERAN_RANK':
            currentValue = profile?.level || 1;
            break;
          case 'HALFWAY_THERE':
            currentValue = progress?.completedMissions.length || 0;
            break;
          case 'FLEET_ADMIRAL':
            currentValue = progress?.unlockedShips.length || 1;
            break;
          case 'PERFECTIONIST_10':
            currentValue = progress?.completedMissions.filter((m) => m.stars === 3).length || 0;
            break;
          case 'SCAVENGER_50':
            currentValue = profile?.stats.powerupsCollected || 0;
            break;
          case 'CREDIT_TYCOON':
            currentValue = wallet?.credits || 0;
            break;
          case 'VELOOP_ELITE':
            currentValue = wallet?.veloopCoins || 0;
            break;
          default:
            currentValue = 0;
        }

        const isCompleted = currentValue >= ach.targetValue;
        const record = claimMap.get(ach.achievementId);
        const isClaimed = !!record?.isClaimed;

        return {
          ...ach.toObject(),
          currentValue: Math.min(currentValue, ach.targetValue),
          isCompleted,
          isClaimed
        };
      });

      res.json({ success: true, achievements: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async claimAchievement(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      const achievement = await Achievement.findOne({ achievementId: id });
      if (!achievement) {
        res.status(404).json({ success: false, error: `Achievement ${id} not found` });
        return;
      }

      // Check if already claimed
      let record = await PlayerAchievement.findOne({ userId, achievementId: id });
      if (record?.isClaimed) {
        res.status(400).json({ success: false, error: 'Achievement reward has already been claimed' });
        return;
      }

      // Grant rewards
      const idempotencyKey = `achievement_reward_${userId}_${id}`;
      const updatedWallet = await WalletService.grantMissionRewards(
        userId,
        achievement.reward,
        `Achievement: ${achievement.title}`,
        idempotencyKey
      );

      if (!record) {
        record = await PlayerAchievement.create({
          userId,
          achievementId: id,
          currentValue: achievement.targetValue,
          isCompleted: true,
          isClaimed: true,
          claimedAt: new Date()
        });
      } else {
        record.isClaimed = true;
        record.claimedAt = new Date();
        await record.save();
      }

      res.json({
        success: true,
        message: `Claimed rewards for '${achievement.title}'!`,
        reward: achievement.reward,
        wallet: updatedWallet
      });
    } catch (err: any) {
      console.error('[Claim Achievement Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
