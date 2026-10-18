import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerAchievementDocument extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  currentValue: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: Date;
  claimedAt?: Date;
}

const PlayerAchievementSchema = new Schema<IPlayerAchievementDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementId: { type: String, required: true, index: true },
    currentValue: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    completedAt: { type: Date },
    claimedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

PlayerAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const PlayerAchievement = mongoose.model<IPlayerAchievementDocument>('PlayerAchievement', PlayerAchievementSchema);
