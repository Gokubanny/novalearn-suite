import mongoose, { Schema } from 'mongoose';
import { IAttendance, AttendanceStatus, Semester } from '../../types';

const AttendanceSchema = new Schema<IAttendance>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    session: { type: String, required: true },
    semester: { type: String, enum: Object.values(Semester), required: true },
    date: { type: Date, required: true, default: Date.now },
    records: [
      {
        student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        status: {
          type: String,
          enum: Object.values(AttendanceStatus),
          default: AttendanceStatus.ABSENT,
        },
        markedAt: { type: Date },
        method: {
          type: String,
          enum: ['facial_recognition', 'manual'],
          default: 'facial_recognition',
        },
      },
    ],
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ course: 1, date: 1 });
AttendanceSchema.index({ school: 1 });
AttendanceSchema.index({ 'records.student': 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
