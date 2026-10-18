import mongoose, { Schema, Document } from 'mongoose';
import { CurrencyType } from '../types/shared';

export interface IEventDocument extends Document {
  eventId: string;
  title: string;
  description: string;
  bannerTag: string;
  rewardMultiplier: number;
  bonusCurrency: CurrencyType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const EventSchema = new Schema<IEventDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    bannerTag: { type: String, default: 'LIMITED TIME' },
    rewardMultiplier: { type: Number, default: 1.5 },
    bonusCurrency: {
      type: String,
      enum: ['credits', 'energyCores', 'veloopCoins', 'xp'],
      default: 'veloopCoins'
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export const Event = mongoose.model<IEventDocument>('Event', EventSchema);

