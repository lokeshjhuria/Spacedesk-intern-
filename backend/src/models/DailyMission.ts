import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyMissionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  missionKey: string;
  title: string;
  description: string;
  type: 'kills' | 'missions' | 'score' | 'powerups';
  target: number;
  current: number;
  isClaimed: boolean;
  reward: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
  expiresAt: Date;
}

const DailyMissionSchema = new Schema<IDailyMissionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    missionKey: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['kills', 'missions', 'score', 'powerups'],
      required: true
    },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    isClaimed: { type: Boolean, default: false },
    reward: {
      credits: { type: Number, default: 100 },
      energyCores: { type: Number, default: 1 },
      xp: { type: Number, default: 50 },
      veloopCoins: { type: Number, default: 5 }
    },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

DailyMissionSchema.index({ userId: 1, missionKey: 1, expiresAt: 1 });

export const DailyMission = mongoose.model<IDailyMissionDocument>('DailyMission', DailyMissionSchema);
