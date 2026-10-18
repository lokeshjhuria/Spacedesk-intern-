import mongoose, { Schema, Document } from 'mongoose';

export interface IMissionSessionDocument extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  missionId: string;
  startedAt: Date;
  expiresAt: Date;
  status: 'active' | 'completed' | 'abandoned' | 'invalidated';
  sessionToken: string;
  minFeasibleDurationSec: number;
  maxFeasibleScore: number;
  enemyCountExpected: number;
  createdAt: Date;
  updatedAt: Date;
}

const MissionSessionSchema = new Schema<IMissionSessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    missionId: { type: String, required: true, index: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned', 'invalidated'],
      default: 'active',
      index: true
    },
    sessionToken: { type: String, required: true },
    minFeasibleDurationSec: { type: Number, required: true },
    maxFeasibleScore: { type: Number, required: true },
    enemyCountExpected: { type: Number, required: true }
  },
  {
    timestamps: true
  }
);

export const MissionSession = mongoose.model<IMissionSessionDocument>('MissionSession', MissionSessionSchema);
