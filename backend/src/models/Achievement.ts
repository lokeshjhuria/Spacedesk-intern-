import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievementDocument extends Document {
  achievementId: string;
  code: string;
  title: string;
  description: string;
  category: 'combat' | 'progression' | 'mastery' | 'economy';
  targetValue: number;
  reward: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
}

const AchievementSchema = new Schema<IAchievementDocument>(
  {
    achievementId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['combat', 'progression', 'mastery', 'economy'],
      required: true
    },
    targetValue: { type: Number, required: true },
    reward: {
      credits: { type: Number, default: 0 },
      energyCores: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
      veloopCoins: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

export const Achievement = mongoose.model<IAchievementDocument>('Achievement', AchievementSchema);
