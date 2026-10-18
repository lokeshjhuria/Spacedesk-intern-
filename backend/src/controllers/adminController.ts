import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { WalletService } from '../services/walletService';

export class AdminController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = Math.min(100, Number(req.query.limit) || 50);
      const category = req.query.category as string | undefined;

      const filter: Record<string, any> = {};
      if (category) filter.category = category;

      const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async grantCurrency(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { targetUserId, currency, amount } = req.body;

      if (!targetUserId || !currency || amount === undefined) {
        res.status(400).json({ success: false, error: 'targetUserId, currency, and amount are required' });
        return;
      }

      const target = await User.findById(targetUserId);
      if (!target) {
        res.status(404).json({ success: false, error: 'Target user not found' });
        return;
      }

      const { wallet } = await WalletService.adjustBalance({
        userId: target._id,
        currency,
        amount: Number(amount),
        type: 'admin_grant',
        referenceId: `admin_${req.user!._id}`,
        note: `Admin grant by ${req.user!.username}`
      });

      res.json({
        success: true,
        message: `Successfully adjusted ${amount} ${currency} for user ${target.username}`,
        wallet
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getSystemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const totalUsers = await User.countDocuments();
      const totalWallets = await Wallet.find();

      let totalCredits = 0;
      let totalEnergyCores = 0;
      let totalVeloopCoins = 0;

      for (const w of totalWallets) {
        totalCredits += w.credits || 0;
        totalEnergyCores += w.energyCores || 0;
        totalVeloopCoins += w.veloopCoins || 0;
      }

      res.json({
        success: true,
        stats: {
          totalUsers,
          economyCirculation: {
            totalCredits,
            totalEnergyCores,
            totalVeloopCoins
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
