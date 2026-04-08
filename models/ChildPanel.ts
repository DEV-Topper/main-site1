import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChildPanel extends Document {
  userUUID: string;
  domain: string;
  adminUsername: string;
  adminPassword: string; // Stored as is or hashed depending on admin preference, let's store it securely
  price: number;
  currency: string;
  status: 'pending' | 'active' | 'suspended' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const ChildPanelSchema: Schema<IChildPanel> = new Schema(
  {
    userUUID: { type: String, required: true, index: true },
    domain: { type: String, required: true, trim: true },
    adminUsername: { type: String, required: true, trim: true },
    adminPassword: { type: String, required: true },
    price: { type: Number, default: 20000 },
    currency: { type: String, default: 'NGN' },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'expired'],
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
