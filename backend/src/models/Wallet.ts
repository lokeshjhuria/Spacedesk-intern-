import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletDocument extends Document {
  userId: mongoose.Types.ObjectId;
  credits: number;
  energyCores: number;
  veloopCoins: number;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWalletDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    credits: {
      type: Number,
      default: 500, // Starter credits
      min: 0
    },
    energyCores: {
      type: Number,
      default: 5,   // Starter energy cores
      min: 0
    },
    veloopCoins: {
      type: Number,
      default: 0,   // Earned through platform-verified achievements & milestones
      min: 0
    },
    xp: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export const Wallet = mongoose.model<IWalletDocument>('Wallet', WalletSchema);
