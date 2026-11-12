import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILiveChatMessage extends Document {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: 'USER' | 'ADMIN';
  alias: string;
  text: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LiveChatMessageSchema = new Schema<ILiveChatMessage>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'LiveChat',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['USER', 'ADMIN'],
      required: true,
    },
    alias: {
      type: String,
      required: true,
      default: 'Anonymous User',
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL Index for Live Chat Messages synced with parent 72h lifecycle
LiveChatMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
LiveChatMessageSchema.index({ chat: 1, createdAt: 1 });

const LiveChatMessage: Model<ILiveChatMessage> =
  mongoose.models.LiveChatMessage ||
  mongoose.model<ILiveChatMessage>('LiveChatMessage', LiveChatMessageSchema);

export default LiveChatMessage;
