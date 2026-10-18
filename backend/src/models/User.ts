import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/shared';

export interface IUserDocument extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['player', 'admin'],
      default: 'player',
      index: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUserDocument>('User', UserSchema);

