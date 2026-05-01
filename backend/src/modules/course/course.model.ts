import mongoose, { Schema } from 'mongoose';
import { ICourse, Semester, ClassType } from '../../types';

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    creditUnits: { type: Number, required: true, min: 1, max: 6 },
    semester: { type: String, enum: Object.values(Semester), required: true },
    session: { type: String, required: true },
    level: { type: Number, required: true, enum: [100, 200, 300, 400, 500] },
    classType: {
      type: String,
      enum: Object.values(ClassType),
      default: ClassType.PHYSICAL,
    },
    zoomLink: { type: String },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        startTime: { type: String },
        endTime: { type: String },
        venue: { type: String },
      },
    ],
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ school: 1 });
CourseSchema.index({ school: 1, code: 1, session: 1 }, { unique: true });
CourseSchema.index({ lecturer: 1 });
CourseSchema.index({ department: 1 });

export default mongoose.model<ICourse>('Course', CourseSchema);
