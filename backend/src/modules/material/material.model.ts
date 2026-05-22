import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMaterial extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryPublicId?: string;
  resourceType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    cloudinaryPublicId: { type: String },
    resourceType: { type: String, default: 'raw' },
  },
  { timestamps: true }
);

export default mongoose.model<IMaterial>('Material', MaterialSchema);