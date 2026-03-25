import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral {
  uid: string; 
  username: string;
  date: Date;
  earnings: number;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  phone?: string;
  walletBalance: number;
  purchasedAccounts: number;
  status: 'active' | 'suspended';
  role: 'user' | 'admin';
  referralCode?: string;
  referredBy?: string; 
  referralBalance: number;
  referrals: IReferral[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    purchasedAccounts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
    },
    referralBalance: {
      type: Number,
      default: 0,
    },
    referrals: [
      {
        uid: String,
        username: String,
        date: { type: Date, default: Date.now },
        earnings: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
