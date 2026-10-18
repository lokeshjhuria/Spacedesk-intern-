import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerShipDocument extends Document {
  userId: mongoose.Types.ObjectId;
  shipId: string;
  isEquipped: boolean;
  unlockedAt: Date;
  upgradeLevels: {
    weapon: number;
    shield: number;
    speed: number;
    special: number;
  };
}

const PlayerShipSchema = new Schema<IPlayerShipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    shipId: {
      type: String,
      required: true,
      index: true
    },
    isEquipped: {
      type: Boolean,
      default: false
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    upgradeLevels: {
      weapon: { type: Number, default: 1, min: 1, max: 10 },
      shield: { type: Number, default: 1, min: 1, max: 10 },
      speed: { type: Number, default: 1, min: 1, max: 10 },
      special: { type: Number, default: 1, min: 1, max: 10 }
    }
  },
  {
    timestamps: true
  }
);

PlayerShipSchema.index({ userId: 1, shipId: 1 }, { unique: true });

export const PlayerShip = mongoose.model<IPlayerShipDocument>('PlayerShip', PlayerShipSchema);
