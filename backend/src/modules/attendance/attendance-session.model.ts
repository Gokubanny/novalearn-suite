import mongoose, { Schema, Document, Types } from 'mongoose';
import { Semester } from '../../types';

export interface IAttendanceSession extends Document {
  course: Types.ObjectId;
  school: Types.ObjectId;
  lecturer: Types.ObjectId;
  lecturerLatitude: number;
  lecturerLongitude: number;
  durationMinutes: number;
  expiresAt: Date;
  session: string;
  semester: string;
  status: 'open' | 'closed';
  presentStudents: Types.ObjectId[];
  submittedStudents: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    course:   { type: Schema.Types.ObjectId, ref: 'Course',  required: true },
    school:   { type: Schema.Types.ObjectId, ref: 'School',  required: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    lecturerLatitude:  { type: Number, required: true },
    lecturerLongitude: { type: Number, required: true },
    durationMinutes:   { type: Number, required: true, min: 5, max: 120 },
    expiresAt:         { type: Date,   required: true },
    session:           { type: String, required: true },
    semester: {
      type: String,
      enum: Object.values(Semester),
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    presentStudents:   [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    submittedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

AttendanceSessionSchema.index({ course: 1, status: 1 });
AttendanceSessionSchema.index({ school: 1 });
AttendanceSessionSchema.index({ expiresAt: 1 });

export default mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);