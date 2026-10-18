import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginStreakDocument extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string; // YYYY-MM-DD
  claimedToday: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoginStreakSchema = new Schema<ILoginStreakDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    currentStreak: { type: Number, default: 1 },
    longestStreak: { type: Number, default: 1 },
    lastLoginDate: { type: String, required: true },
    claimedToday: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export const LoginStreak = mongoose.model<ILoginStreakDocument>('LoginStreak', LoginStreakSchema);
