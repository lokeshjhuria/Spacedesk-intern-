import mongoose, { Schema, Document } from 'mongoose';

export interface IMissionResultDocument extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  missionId: string;
  elapsedSeconds: number;
  score: number;
  starsAwarded: number;
  accuracyPercent: number;
  damageTaken: number;
  powerupsCollected: number;
  enemiesDefeated: number;
  rewardsGranted: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
  validationFlags: string[];
  createdAt: Date;
}

const MissionResultSchema = new Schema<IMissionResultDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    missionId: { type: String, required: true, index: true },
    elapsedSeconds: { type: Number, required: true },
    score: { type: Number, required: true },
    starsAwarded: { type: Number, required: true, min: 0, max: 3 },
    accuracyPercent: { type: Number, default: 0 },
    damageTaken: { type: Number, default: 0 },
    powerupsCollected: { type: Number, default: 0 },
    enemiesDefeated: { type: Number, default: 0 },
    rewardsGranted: {
      credits: { type: Number, default: 0 },
      energyCores: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
      veloopCoins: { type: Number, default: 0 }
    },
    validationFlags: [{ type: String }]
  },
  {
    timestamps: true
  }
);

export const MissionResult = mongoose.model<IMissionResultDocument>('MissionResult', MissionResultSchema);
