
import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  user: mongoose.Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Budget must be greater than zero"],
    },
  },
  {
    timestamps: true,
  }
);

// Each user can have only one budget per month and year.
budgetSchema.index(
  { user: 1, year: 1, month: 1 },
  { unique: true }
);

const Budget = mongoose.model<IBudget>(
  "Budget",
  budgetSchema
);

export default Budget;
