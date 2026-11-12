import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type LiveChatStatus = 'WAITING' | 'ACCEPTED' | 'CLOSED';

export interface ILiveChat extends Document {
  _id: Types.ObjectId;
  topic: string;
  user: Types.ObjectId;
  admin?: Types.ObjectId;
  status: LiveChatStatus;
  userAlias: string;
  adminAlias: string;
  acceptedAt?: Date;
  closedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LiveChatSchema = new Schema<ILiveChat>(
  {
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['WAITING', 'ACCEPTED', 'CLOSED'],
      default: 'WAITING',
      index: true,
    },
    userAlias: {
      type: String,
      default: 'Anonymous User',
    },
    adminAlias: {
      type: String,
      default: 'SupportTeam',
    },
    acceptedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// 72-hour native MongoDB TTL index (exactly 3 days retention)
LiveChatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
LiveChatSchema.index({ user: 1, status: 1 });
LiveChatSchema.index({ status: 1, createdAt: -1 });

const LiveChat: Model<ILiveChat> =
  mongoose.models.LiveChat || mongoose.model<ILiveChat>('LiveChat', LiveChatSchema);

export default LiveChat;
