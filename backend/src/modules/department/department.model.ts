import mongoose, { Schema } from 'mongoose';
import { IDepartment } from '../../types';

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    head: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String },
    isActive: { type: Boolean, default: true },

    // ── Matric number format ──────────────────────────────────────────────
    matricPrefix: { type: String, trim: true, uppercase: true },
    matricSeparator: { type: String, default: '/', enum: ['/', '-', '.'] },
    matricYearFormat: { type: String, enum: ['full', 'short'], default: 'full' },
    matricSequenceDigits: { type: Number, default: 3, min: 3, max: 6 },
    matricSequence: { type: Number, default: 0 },
    matricLastSession: { type: String },
  },
  { timestamps: true }
);

DepartmentSchema.index({ school: 1 });
DepartmentSchema.index({ school: 1, code: 1 }, { unique: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);