import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceSession extends Document {
  course: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  lecturer: mongoose.Types.ObjectId;
  lecturerLatitude: number;
  lecturerLongitude: number;
  durationMinutes: number;
  expiresAt: Date;
  session: string;
  semester: string;
  status: 'open' | 'closed';
  submittedStudents: mongoose.Types.ObjectId[];
  presentStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lecturerLatitude: { type: Number, required: true },
    lecturerLongitude: { type: Number, required: true },
    durationMinutes: { type: Number, required: true, min: 5, max: 120 },
    expiresAt: { type: Date, required: true },
    session: { type: String, required: true },
    semester: { type: String, required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    submittedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    presentStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

AttendanceSessionSchema.index({ course: 1, status: 1 });
AttendanceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IAttendanceSession>(
  'AttendanceSession',
  AttendanceSessionSchema
);
