import mongoose, { Schema, Document } from 'mongoose';
import { CurrencyType, TransactionType } from '../types/shared';

export interface IWalletTransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  currency: CurrencyType;
  amount: number;
  type: TransactionType;
  balanceAfter: number;
  referenceId: string;
  idempotencyKey?: string;
  note?: string;
  status: 'confirmed' | 'pending' | 'failed';
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    currency: {
      type: String,
      enum: ['credits', 'energyCores', 'veloopCoins', 'xp'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: [
        'mission_reward',
        'upgrade_purchase',
        'ship_purchase',
        'daily_reward',
        'streak_reward',
        'achievement_reward',
        'event_reward',
        'ad_boost',
        'admin_grant'
      ],
      required: true,
      index: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    referenceId: {
      type: String,
      required: true,
      index: true
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true
    },
    note: {
      type: String
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'failed'],
      default: 'confirmed'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model<IWalletTransactionDocument>('WalletTransaction', WalletTransactionSchema);

