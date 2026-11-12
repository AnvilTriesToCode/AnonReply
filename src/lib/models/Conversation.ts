import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ConversationStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'RESOLVED';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  title: string;
  body: string;
  author: Types.ObjectId;
  status: ConversationStatus;
  denialReason?: string;
  aliasMap: Map<string, string>;
  aliasCounter: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
    denialReason: {
      type: String,
      trim: true,
    },
    aliasMap: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    aliasCounter: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// =====================================================
// TTL INDEX — MongoDB automatically deletes documents
// when the current time exceeds the `expiresAt` field.
// expireAfterSeconds: 0 means "delete at the exact Date
// stored in expiresAt" (which we set to createdAt + 72h).
// =====================================================
ConversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Query performance indexes
ConversationSchema.index({ author: 1, status: 1 });
ConversationSchema.index({ status: 1, createdAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
