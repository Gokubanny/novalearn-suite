import mongoose, { Schema } from 'mongoose';
import { ISchool, SubscriptionPlan, SubscriptionStatus } from '../../types';

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'Nigeria' },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: { type: String },
    logo: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SubscriptionPlan),
        default: SubscriptionPlan.BASIC,
      },
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.TRIAL,
      },
      startDate: { type: Date, default: Date.now },
      endDate: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      },
      maxStudents: { type: Number, default: 100 },
      maxLecturers: { type: Number, default: 20 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SchoolSchema.index({ code: 1 });
SchoolSchema.index({ admin: 1 });

export default mongoose.model<ISchool>('School', SchoolSchema);
