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
  // Subset of presentStudents the lecturer marked by hand (not verified by
  // face). Lets the saved record keep the true method for each student.
  manualStudents: Types.ObjectId[];
  attemptCounts: {
    student: Types.ObjectId;
    count: number;
    lastStatus: 'present' | 'face_mismatch' | 'location_invalid';
    lastAttemptAt: Date;
  }[];
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
    manualStudents:    [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    // One entry per student who has made at least one selfie attempt this
    // session — tracks how many tries and what the most recent outcome was,
    // so the lecturer can see "attempted but not yet present" separately
    // from silence (no attempt at all).
    attemptCounts: [
      {
        student:       { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        count:         { type: Number, default: 0 },
        lastStatus:    { type: String, enum: ['present', 'face_mismatch', 'location_invalid'] },
        lastAttemptAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSessionSchema.index({ course: 1, status: 1 });
AttendanceSessionSchema.index({ school: 1 });
AttendanceSessionSchema.index({ expiresAt: 1 });
// Used by the once-a-minute sweep that saves sessions nobody ended.
AttendanceSessionSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);