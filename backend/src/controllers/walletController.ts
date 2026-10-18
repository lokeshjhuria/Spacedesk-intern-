import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Wallet } from '../models/Wallet';
import { WalletTransaction } from '../models/WalletTransaction';
import { LoginStreak } from '../models/LoginStreak';
import { WalletService } from '../services/walletService';
import { RewardedAdsService } from '../services/rewardedAdsService';
import { VELoopAdapterService } from '../services/veloopAdapter';

const STREAK_REWARDS = [
  { day: 1, credits: 200, energyCores: 1, veloopCoins: 2 },
  { day: 2, credits: 350, energyCores: 2, veloopCoins: 4 },
  { day: 3, credits: 500, energyCores: 3, veloopCoins: 6 },
  { day: 4, credits: 700, energyCores: 4, veloopCoins: 8 },
  { day: 5, credits: 1000, energyCores: 5, veloopCoins: 12 },
  { day: 6, credits: 1500, energyCores: 7, veloopCoins: 16 },
  { day: 7, credits: 3000, energyCores: 12, veloopCoins: 30 }
];

export class WalletController {
  static async getWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const wallet = await WalletService.getWallet(userId);
      res.json({ success: true, wallet });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const limit = Math.min(50, Number(req.query.limit) || 20);
      const page = Math.max(1, Number(req.query.page) || 1);
      const skip = (page - 1) * limit;

      const transactions = await WalletTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await WalletTransaction.countDocuments({ userId });

      res.json({
        success: true,
        transactions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getDailyStreak(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const today = new Date().toISOString().slice(0, 10);

      let streak = await LoginStreak.findOne({ userId });
      if (!streak) {
        streak = await LoginStreak.create({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
          claimedToday: false
        });
      } else if (streak.lastLoginDate !== today) {
        // Check if yesterday or broken
        const last = new Date(streak.lastLoginDate);
        const diffDays = Math.floor((new Date(today).getTime() - last.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          streak.currentStreak = (streak.currentStreak % 7) + 1;
        } else if (diffDays > 1) {
          streak.currentStreak = 1;
        }
        streak.lastLoginDate = today;
        streak.claimedToday = false;
        await streak.save();
      }

      res.json({
        success: true,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          claimedToday: streak.claimedToday,
          streakRewards: STREAK_REWARDS
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async claimDailyReward(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const today = new Date().toISOString().slice(0, 10);

      let streak = await LoginStreak.findOne({ userId });
      if (!streak) {
        streak = await LoginStreak.create({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
          claimedToday: false
        });
      }

      if (streak.claimedToday && streak.lastLoginDate === today) {
        res.status(400).json({ success: false, error: 'Daily reward has already been claimed today. Return tomorrow!' });
        return;
      }

      const rewardConfig = STREAK_REWARDS[Math.min(streak.currentStreak, 7) - 1];
      const idempotencyKey = `daily_reward_${userId}_${today}`;

      // Grant rewards
      await WalletService.grantMissionRewards(
        userId,
        {
          credits: rewardConfig.credits,
          energyCores: rewardConfig.energyCores,
          xp: 100,
          veloopCoins: rewardConfig.veloopCoins
        },
        `Daily Streak Day ${streak.currentStreak}`,
        idempotencyKey
      );

      streak.claimedToday = true;
      streak.lastLoginDate = today;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      await streak.save();

      const updatedWallet = await WalletService.getWallet(userId);

      res.json({
        success: true,
        message: `Day ${streak.currentStreak} login bonus claimed!`,
        reward: rewardConfig,
        wallet: updatedWallet,
        currentStreak: streak.currentStreak
      });
    } catch (err: any) {
      console.error('[Daily Claim Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async requestRewardedAd(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const { purpose } = req.body; // 'revive' | 'double_rewards' | 'supply_drop'

      if (!['revive', 'double_rewards', 'supply_drop'].includes(purpose)) {
        res.status(400).json({ success: false, error: 'Invalid ad purpose specified' });
        return;
      }

      const adSession = RewardedAdsService.startAdSession(userId, purpose);
      res.json({ success: true, ...adSession });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async completeRewardedAd(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const { adSessionId, proofToken } = req.body;

      if (!adSessionId) {
        res.status(400).json({ success: false, error: 'Ad session ID is required' });
        return;
      }

      const verification = await RewardedAdsService.completeAdSession(userId, adSessionId, proofToken);

      // If supply drop, grant reward canister
      let grantedReward: any = null;
      if (verification.purpose === 'supply_drop') {
        const drop = { credits: 300, energyCores: 2, xp: 150, veloopCoins: 3 };
        await WalletService.grantMissionRewards(
          userId,
          drop,
          `Ad Supply Drop ${adSessionId}`,
          `ad_supply_${adSessionId}`
        );
        grantedReward = drop;
      }

      const wallet = await WalletService.getWallet(userId);

      res.json({
        success: true,
        message: verification.message,
        purpose: verification.purpose,
        reward: grantedReward,
        wallet
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
