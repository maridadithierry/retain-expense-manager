
import { Router } from "express";
import Category from "../models/Category.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Failed to load categories:", error);
    res.status(500).json({ message: "Unable to load categories" });
  }
});

export default router;
