import mongoose from 'mongoose';
import { Wallet, IWalletDocument } from '../models/Wallet';
import { WalletTransaction } from '../models/WalletTransaction';
import { AuditLog } from '../models/AuditLog';
import { CurrencyType, TransactionType } from '../types/shared';

export interface WalletAdjustmentParams {
  userId: string | mongoose.Types.ObjectId;
  currency: CurrencyType;
  amount: number; // positive to credit, negative to debit
  type: TransactionType;
  referenceId: string;
  idempotencyKey?: string;
  note?: string;
}

export class WalletService {
  /**
   * Get or initialize player wallet
   */
  static async getWallet(userId: string | mongoose.Types.ObjectId): Promise<IWalletDocument> {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        credits: 500,
        energyCores: 5,
        veloopCoins: 0,
        xp: 0
      });
    }
    return wallet;
  }

  /**
   * Atomically adjust wallet balance with concurrency safety and idempotency protection
   */
  static async adjustBalance(params: WalletAdjustmentParams): Promise<{
    wallet: IWalletDocument;
    transaction: any;
    alreadyProcessed?: boolean;
  }> {
    const { userId, currency, amount, type, referenceId, idempotencyKey, note } = params;

    // Check idempotency if key provided
    if (idempotencyKey) {
      const existingTx = await WalletTransaction.findOne({ idempotencyKey });
      if (existingTx) {
        const currentWallet = await this.getWallet(userId);
        return {
          wallet: currentWallet,
          transaction: existingTx,
          alreadyProcessed: true
        };
      }
    }

    // Atomic update preventing negative balances
    const filter: Record<string, any> = { userId };
    if (amount < 0) {
      // Require sufficient balance
      filter[currency] = { $gte: Math.abs(amount) };
    }

    const update: Record<string, any> = {
      $inc: { [currency]: amount }
    };

    const updatedWallet = await Wallet.findOneAndUpdate(filter, update, {
      new: true,
      upsert: false
    });

    if (!updatedWallet) {
      // Either wallet doesn't exist or insufficient balance
      const current = await Wallet.findOne({ userId });
      if (!current) {
        throw new Error('Wallet not found');
      }
      throw new Error(`Insufficient ${currency} balance (required: ${Math.abs(amount)}, current: ${current[currency]})`);
    }

    // Record immutable transaction
    const balanceAfter = updatedWallet[currency];
    const transaction = await WalletTransaction.create({
      userId,
      currency,
      amount,
      type,
      balanceAfter,
      referenceId,
      idempotencyKey,
      note,
      status: 'confirmed'
    });

    // Audit large or sensitive transactions
    if (currency === 'veloopCoins' || Math.abs(amount) >= 1000) {
      await AuditLog.create({
        userId,
        action: 'WALLET_TRANSACTION',
        category: 'wallet',
        severity: currency === 'veloopCoins' ? 'warn' : 'info',
        details: {
          currency,
          amount,
          type,
          referenceId,
          balanceAfter
        }
      });
    }

    return {
      wallet: updatedWallet,
      transaction,
      alreadyProcessed: false
    };
  }

  /**
   * Grant multiple rewards atomically (e.g. from mission completion)
   */
  static async grantMissionRewards(
    userId: string | mongoose.Types.ObjectId,
    rewards: { credits: number; energyCores: number; xp: number; veloopCoins: number },
    referenceId: string,
    idempotencyKey?: string
  ): Promise<IWalletDocument> {
    if (idempotencyKey) {
      const existing = await WalletTransaction.findOne({ idempotencyKey });
      if (existing) {
        return this.getWallet(userId);
      }
    }

    // Atomically increment all currencies
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $inc: {
          credits: rewards.credits,
          energyCores: rewards.energyCores,
          xp: rewards.xp,
          veloopCoins: rewards.veloopCoins
        }
      },
      { new: true, upsert: true }
    );

    // Record individual transactions
    const currencies: CurrencyType[] = ['credits', 'energyCores', 'xp', 'veloopCoins'];
    for (const cur of currencies) {
      const amt = rewards[cur];
      if (amt > 0) {
        await WalletTransaction.create({
          userId,
          currency: cur,
          amount: amt,
          type: 'mission_reward',
          balanceAfter: updatedWallet[cur],
          referenceId,
          idempotencyKey: idempotencyKey ? `${idempotencyKey}_${cur}` : undefined,
          note: `Mission reward: +${amt} ${cur}`,
          status: 'confirmed'
        });
      }
    }

    return updatedWallet;
  }
}

