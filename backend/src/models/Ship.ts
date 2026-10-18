import mongoose, { Schema, Document } from 'mongoose';
import { IShip, ShipClass } from '../types/shared';

export interface IShipDocument extends Omit<IShip, 'id'>, Document {
  shipId: string;
}

const ShipSchema = new Schema<IShipDocument>(
  {
    shipId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    class: {
      type: String,
      enum: ['interceptor', 'guardian', 'destroyer', 'phantom', 'nova'],
      required: true
    },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    lore: { type: String, required: true },
    baseStats: {
      speed: { type: Number, required: true },
      fireRate: { type: Number, required: true },
      health: { type: Number, required: true },
      shield: { type: Number, required: true },
      damage: { type: Number, required: true },
      criticalChance: { type: Number, required: true }
    },
    specialAbility: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      cooldownSeconds: { type: Number, required: true },
      durationSeconds: { type: Number, required: true },
      icon: { type: String, required: true }
    },
    price: {
      credits: { type: Number, required: true },
      energyCores: { type: Number, required: true },
      veloopCoins: { type: Number, default: 0 }
    },
    unlockRequirement: {
      minLevel: { type: Number, default: 1 },
      requiredMissionId: { type: String }
    },
    visualTheme: {
      primaryColor: { type: String, required: true },
      accentColor: { type: String, required: true },
      engineGlow: { type: String, required: true }
    }
  },
  {
    timestamps: true
  }
);

export const Ship = mongoose.model<IShipDocument>('Ship', ShipSchema);

