import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedMissionSubdoc {
  missionId: string;
  stars: number;
  highestScore: number;
  completedAt: Date;
}

export interface IPlayerProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  completedMissions: ICompletedMissionSubdoc[];
  unlockedShips: string[];
  unlockedSectors: number[];
  createdAt: Date;
  updatedAt: Date;
}

const CompletedMissionSchema = new Schema<ICompletedMissionSubdoc>(
  {
    missionId: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 3 },
    highestScore: { type: Number, required: true, min: 0 },
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const PlayerProgressSchema = new Schema<IPlayerProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    completedMissions: [CompletedMissionSchema],
    unlockedShips: {
      type: [String],
      default: ['ship_interceptor']
    },
    unlockedSectors: {
      type: [Number],
      default: [1]
    }
  },
  {
    timestamps: true
  }
);

export const PlayerProgress = mongoose.model<IPlayerProgressDocument>('PlayerProgress', PlayerProgressSchema);
