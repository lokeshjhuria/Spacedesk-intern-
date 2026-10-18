import mongoose, { Schema, Document } from 'mongoose';
import { ShipClass } from '../types/shared';

export interface ILeaderboardEntryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  avatarUrl: string;
  score: number;
  missionId: string;
  missionTitle: string;
  shipClass: ShipClass;
  accuracy: number;
  verified: boolean;
  completedAt: Date;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: '/avatars/pilot_default.png' },
    score: { type: Number, required: true, index: -1 },
    missionId: { type: String, required: true, index: true },
    missionTitle: { type: String, required: true },
    shipClass: {
      type: String,
      enum: ['interceptor', 'guardian', 'destroyer', 'phantom', 'nova'],
      required: true
    },
    accuracy: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

LeaderboardEntrySchema.index({ missionId: 1, score: -1 });

export const LeaderboardEntry = mongoose.model<ILeaderboardEntryDocument>('LeaderboardEntry', LeaderboardEntrySchema);

