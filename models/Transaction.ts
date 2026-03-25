import mongoose, { Schema, Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ITransaction extends Document {
  userUUID: string;
  type: 'deposit' | 'purchase' | 'refund' | 'referral_bonus';
  amount: number;
  status: 'pending' | 'successful' | 'failed';
  reference?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    userUUID: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['deposit', 'purchase', 'refund', 'referral_bonus'],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
    },
    reference: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);
TransactionSchema.plugin(mongoosePaginate);

type TransactionModel = Model<ITransaction> & PaginateModel<ITransaction>;

const Transaction: TransactionModel =
  (mongoose.models.Transaction as TransactionModel) ||
  mongoose.model<ITransaction, TransactionModel>('Transaction', TransactionSchema);

export default Transaction;
