import mongoose, { Schema } from 'mongoose';
import { ILecturer, ApprovalStatus } from '../../types';

const LecturerSchema = new Schema<ILecturer>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    staffId: { type: String, required: true },
    title: { type: String, required: true, enum: ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Engr.'] },
    qualification: { type: String, required: true },
    specialisation: { type: String },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
);

LecturerSchema.index({ school: 1 });
LecturerSchema.index({ staffId: 1, school: 1 }, { unique: true });

export default mongoose.model<ILecturer>('Lecturer', LecturerSchema);
