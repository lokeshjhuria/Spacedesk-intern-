import mongoose, { Schema, Document } from 'mongoose';
import { UpgradeCategory } from '../types/shared';

export interface IUpgradeDocument extends Document {
  upgradeId: string;
  category: UpgradeCategory;
  name: string;
  description: string;
  maxLevel: number;
  multiplierPerLevel: number;
  baseCost: {
    credits: number;
    energyCores: number;
  };
  costMultiplier: number;
}

const UpgradeSchema = new Schema<IUpgradeDocument>(
  {
    upgradeId: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['weapon', 'shield', 'engine', 'hull', 'reactor'],
      required: true,
      index: true
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    maxLevel: { type: Number, default: 10 },
    multiplierPerLevel: { type: Number, default: 0.15 },
    baseCost: {
      credits: { type: Number, required: true },
      energyCores: { type: Number, required: true }
    },
    costMultiplier: { type: Number, default: 1.5 }
  },
  {
    timestamps: true
  }
);

export const Upgrade = mongoose.model<IUpgradeDocument>('Upgrade', UpgradeSchema);

