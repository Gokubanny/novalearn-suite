import mongoose, { Schema, Document, Types } from 'mongoose';

interface IReply {
  author: Types.ObjectId;
  body: string;
  createdAt: Date;
}

export interface IDiscussion extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  body: string;
  pinned: boolean;
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<IReply>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const DiscussionSchema = new Schema<IDiscussion>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    pinned: { type: Boolean, default: false },
    replies: [ReplySchema],
  },
  { timestamps: true }
);

export default mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
