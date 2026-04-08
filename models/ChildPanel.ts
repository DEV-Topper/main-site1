import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChildPanel extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  adminName: string;
  adminPassword?: string; // Stored hashed
  priceInUsd: number;
  priceInNaira: number;
  status: 'pending' | 'active' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ChildPanelSchema: Schema<IChildPanel> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      required: [true, 'Please provide a domain'],
      unique: true,
      trim: true,
    },
    adminName: {
      type: String,
      required: [true, 'Please provide an admin username'],
      trim: true,
    },
    adminPassword: {
      type: String,
      required: [true, 'Please provide an admin password'],
    },
    priceInUsd: {
      type: Number,
      required: true,
      default: 10.99,
    },
    priceInNaira: {
      type: Number,
      required: true,
      default: 14287,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const ChildPanel: Model<IChildPanel> =
  mongoose.models.ChildPanel || mongoose.model<IChildPanel>('ChildPanel', ChildPanelSchema);

export default ChildPanel;
