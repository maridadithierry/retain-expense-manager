
import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  title: string;
  description?: string;
  amount: number;
  category: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  paymentMethod: "cash" | "mpesa" | "card" | "bank" | "other";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "mpesa", "card", "bank", "other"],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model<IExpense>(
  "Expense",
  expenseSchema
);

export default Expense;
