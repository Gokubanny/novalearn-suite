import mongoose, { Schema } from 'mongoose';
import { IAssignment, SubmissionStatus } from '../../types';

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
    attachments: [{ type: String }],
    submissions: [
      {
        student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        fileUrl: { type: String, required: true },
        submittedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: Object.values(SubmissionStatus),
          default: SubmissionStatus.SUBMITTED,
        },
        score: { type: Number },
        feedback: { type: String },
        gradedAt: { type: Date },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AssignmentSchema.index({ course: 1 });
AssignmentSchema.index({ school: 1 });
AssignmentSchema.index({ lecturer: 1 });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
