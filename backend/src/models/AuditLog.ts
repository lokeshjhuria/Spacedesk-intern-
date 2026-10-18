import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  category: 'auth' | 'wallet' | 'anti_cheat' | 'admin' | 'mission';
  severity: 'info' | 'warn' | 'critical';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    category: {
      type: String,
      enum: ['auth', 'wallet', 'anti_cheat', 'admin', 'mission'],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['info', 'warn', 'critical'],
      default: 'info',
      index: true
    },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
