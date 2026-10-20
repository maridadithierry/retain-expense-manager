
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Category from "../models/Category.js";

const paymentMethods = [
  "cash",
  "mpesa",
  "card",
  "bank",
  "other",
] as const;

type PaymentMethod = (typeof paymentMethods)[number];

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (paymentMethods as readonly string[]).includes(value)
  );
}

function getUserId(req: Request): string | null {
  const id = req.user?.userId;

  return typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id)
    ? id
    : null;
}

// GET /api/expenses
export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const expenses = await Expense.find({ user: userId })
      .populate("category")
      .sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Failed to retrieve expenses" });
  }
};

// POST /api/expenses
export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const {
      title,
      description,
      amount,
      category,
      date,
      paymentMethod,
      notes,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      amount === undefined ||
      amount === null ||
      (typeof amount !== "number" && typeof amount !== "string") ||
      (typeof amount === "string" && !amount.trim()) ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof category !== "string" ||
      !mongoose.Types.ObjectId.isValid(category) ||
      !isPaymentMethod(paymentMethod)
    ) {
      res.status(400).json({
        message:
          "Provide a valid title, positive amount, category, and payment method",
      });
      return;
    }

    // Validate and prepare the date.
    let expenseDate = new Date();

    if (date !== undefined) {
      const parsedDate =
        date instanceof Date
          ? date
          : typeof date === "string"
            ? new Date(date)
            : null;

      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: "Invalid date" });
        return;
      }

      expenseDate = parsedDate;
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      res.status(400).json({ message: "Category not found" });
      return;
    }

    const expense = await Expense.create({
      title: title.trim(),
      description,
      amount: Number(amount),
      category,
      user: userId,
      date: expenseDate,
      paymentMethod,
      notes,
    });

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Failed to create expense" });
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({ message: "Invalid expense ID" });
      return;
    }

    const updates = { ...req.body };

    // Prevent changing ownership and database-managed fields.
    delete updates.user;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (updates.title !== undefined) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim()
      ) {
        res.status(400).json({ message: "Title cannot be empty" });
        return;
      }

      updates.title = updates.title.trim();
    }

    if (updates.amount !== undefined) {
      if (
        (typeof updates.amount !== "number" &&
          typeof updates.amount !== "string") ||
        (typeof updates.amount === "string" &&
          !updates.amount.trim()) ||
        !Number.isFinite(Number(updates.amount)) ||
        Number(updates.amount) <= 0
      ) {
        res.status(400).json({
          message: "Amount must be greater than zero",
        });
        return;
      }

      updates.amount = Number(updates.amount);
    }

    if (updates.category !== undefined) {
      if (
        typeof updates.category !== "string" ||
        !mongoose.Types.ObjectId.isValid(updates.category)
      ) {
        res.status(400).json({ message: "Invalid category" });
        return;
      }

      const categoryExists = await Category.findById(
        updates.category
      );

      if (!categoryExists) {
        res.status(400).json({ message: "Category not found" });
        return;
      }
    }

    if (updates.paymentMethod !== undefined) {
      if (!isPaymentMethod(updates.paymentMethod)) {
        res.status(400).json({ message: "Invalid payment method" });
        return;
      }

      updates.paymentMethod = updates.paymentMethod as PaymentMethod;
    }

    if (updates.date !== undefined) {
      const parsedDate =
        updates.date instanceof Date
          ? updates.date
          : typeof updates.date === "string"
            ? new Date(updates.date)
            : null;

      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: "Invalid date" });
        return;
      }

      updates.date = parsedDate;
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category");

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Failed to update expense" });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = req.params.id;

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({ message: "Invalid expense ID" });
      return;
    }

    const expense = await Expense.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};
