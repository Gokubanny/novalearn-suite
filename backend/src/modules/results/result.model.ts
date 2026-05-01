import mongoose, { Schema } from 'mongoose';
import { IResult, Semester } from '../../types';

const ResultSchema = new Schema<IResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    semester: { type: String, enum: Object.values(Semester), required: true },
    session: { type: String, required: true },
    caScore: { type: Number, required: true, min: 0, max: 40 },
    examScore: { type: Number, required: true, min: 0, max: 60 },
    totalScore: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    gradeClass: { type: String },
    isPublished: { type: Boolean, default: false },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Ensure unique result per student per course per session
ResultSchema.index({ student: 1, course: 1, session: 1 }, { unique: true });
ResultSchema.index({ school: 1 });
ResultSchema.index({ course: 1 });

export default mongoose.model<IResult>('Result', ResultSchema);
