import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserPreferences extends Document {
  user: Types.ObjectId;
  school?: Types.ObjectId;
  learningStyle: {
    difficultyPreference: 'easy' | 'medium' | 'hard';
    explanationDetail: 'concise' | 'detailed' | 'comprehensive';
    preferredSubjects: string[];
    studyReminders: boolean;
  };
  aiSettings: {
    responseTemperature: number;
    maxTokens: number;
    contextLength: number;
  };
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    learningStyle: {
      difficultyPreference: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      explanationDetail: { type: String, enum: ['concise', 'detailed', 'comprehensive'], default: 'detailed' },
      preferredSubjects: { type: [String], default: [] },
      studyReminders: { type: Boolean, default: false },
    },
    aiSettings: {
      responseTemperature: { type: Number, default: 0.5, min: 0, max: 1 },
      maxTokens: { type: Number, default: 1024 },
      contextLength: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

UserPreferencesSchema.index({ user: 1 });

export default mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);