import mongoose, { Schema } from 'mongoose';
import { IStudent, ApprovalStatus, Semester } from '../../types';

const StudentSchema = new Schema<IStudent>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    matricNumber: { type: String, required: true },
    level: { type: Number, required: true, enum: [100, 200, 300, 400, 500] },
    currentSemester: {
      type: String,
      enum: Object.values(Semester),
      default: Semester.FIRST,
    },
    currentSession: { type: String, required: true },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    faceImageUrl: { type: String },
    faceEncoding: [{ type: Number }],
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    gpa: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StudentSchema.index({ school: 1 });
StudentSchema.index({ matricNumber: 1, school: 1 }, { unique: true });
StudentSchema.index({ user: 1 });

export default mongoose.model<IStudent>('Student', StudentSchema);
