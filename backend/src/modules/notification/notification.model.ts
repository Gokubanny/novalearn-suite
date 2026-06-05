import mongoose, { Schema } from 'mongoose';
import { INotification, NotificationType } from '../../types';
import { emitToUser } from '../../realtime/socket';

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.INFO,
    },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

// Emit realtime event to the recipient whenever a notification is created
NotificationSchema.post('save', function (doc) {
  try {
    if (doc?.recipient) {
      emitToUser(String(doc.recipient), 'notification:new', doc.toJSON());
    }
  } catch {
    /* ignore — realtime is best-effort */
  }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
