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
  },
  { timestamps: true }
);

DepartmentSchema.index({ school: 1 });
DepartmentSchema.index({ school: 1, code: 1 }, { unique: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
