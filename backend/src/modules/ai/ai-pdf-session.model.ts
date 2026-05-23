import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPdfFile {
  name: string;
  url?: string;
  size: number;
  text: string;
  uploadedAt: Date;
}

export interface IPdfChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAiPdfSession extends Document {
  user: Types.ObjectId;
  school?: Types.ObjectId;
  title: string;
  pdfs: IPdfFile[];  // Up to 3 PDFs
  messages: IPdfChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const PdfFileSchema = new Schema<IPdfFile>(
  {
    name: { type: String, required: true },
    url: { type: String },
    size: { type: Number, required: true },
    text: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PdfChatMessageSchema = new Schema<IPdfChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AiPdfSessionSchema = new Schema<IAiPdfSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    title: { type: String, required: true, default: 'New PDF Chat' },
    pdfs: {
      type: [PdfFileSchema],
      default: [],
      validate: {
        validator: (v: IPdfFile[]) => v.length <= 3,
        message: 'Maximum 3 PDFs per chat session.',
      },
    },
    messages: {
      type: [PdfChatMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

AiPdfSessionSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model<IAiPdfSession>('AiPdfSession', AiPdfSessionSchema);