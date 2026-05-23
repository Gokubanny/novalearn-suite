import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAiChatHistory extends Document {
  user: Types.ObjectId;
  school?: Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AiChatHistorySchema = new Schema<IAiChatHistory>(
  {
    user:   { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    messages: {
      type: [ChatMessageSchema],
      default: [],
      // Never store more than 300 messages per student
      validate: {
        validator: (v: IChatMessage[]) => v.length <= 300,
        message: 'Chat history exceeds maximum length.',
      },
    },
  },
  { timestamps: true }
);

AiChatHistorySchema.index({ user: 1 });

export default mongoose.model<IAiChatHistory>('AiChatHistory', AiChatHistorySchema);