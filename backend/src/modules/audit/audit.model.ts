import mongoose, { Schema, Document, Types } from 'mongoose';

export type AuditSeverity = 'high' | 'medium' | 'info';

export interface IAuditLog extends Document {
  action: string;
  actor: Types.ObjectId | null;
  actorLabel: string;
  target: string;
  severity: AuditSeverity;
  ip: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action:     { type: String, required: true },
    actor:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorLabel: { type: String, required: true },
    target:     { type: String, required: true },
    severity:   { type: String, enum: ['high', 'medium', 'info'], default: 'info' },
    ip:         { type: String, default: 'system' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ severity: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);