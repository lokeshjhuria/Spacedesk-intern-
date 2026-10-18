import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  equippedShipId: string;
  equippedUpgrades: Record<string, number>;
  highestSector: number;
  totalMissionsCompleted: number;
  totalScore: number;
  stats: {
    enemiesKilled: number;
    bossesDefeated: number;
    deaths: number;
    powerupsCollected: number;
    playTimeSeconds: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlayerProfileSchema = new Schema<IPlayerProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String,
      default: '/avatars/pilot_default.png'
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    equippedShipId: {
      type: String,
      default: 'ship_interceptor'
    },
    equippedUpgrades: {
      type: Map,
      of: Number,
      default: {
        weapon: 1,
        shield: 1,
        engine: 1,
        hull: 1,
        reactor: 1
      }
    },
    highestSector: {
      type: Number,
      default: 1
    },
    totalMissionsCompleted: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    stats: {
      enemiesKilled: { type: Number, default: 0 },
      bossesDefeated: { type: Number, default: 0 },
      deaths: { type: Number, default: 0 },
      powerupsCollected: { type: Number, default: 0 },
      playTimeSeconds: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

export const PlayerProfile = mongoose.model<IPlayerProfileDocument>('PlayerProfile', PlayerProfileSchema);
