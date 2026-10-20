
import { Router } from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// Get the logged-in user's budgets
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const budgets = await Budget.find({ user: userId })
      .sort({ year: -1, month: -1 });

    return res.json(budgets);
  } catch (error) {
    console.error("Failed to load budgets:", error);
    return res.status(500).json({
      message: "Unable to load budgets",
    });
  }
});

// Create a monthly budget
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { month, year, amount } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Provide a valid month, year, and positive budget amount.",
      });
    }

    const budget = await Budget.create({
      user: new mongoose.Types.ObjectId(userId),
      month,
      year,
      amount,
    });

    return res.status(201).json(budget);
  } catch (error: unknown) {
    if (
      error instanceof mongoose.Error.ValidationError ||
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000)
    ) {
      return res.status(400).json({
        message: "A budget for this month already exists, or the details are invalid.",
      });
    }

    console.error("Failed to create budget:", error);
    return res.status(500).json({
      message: "Unable to create budget",
    });
  }
});

export default router;
