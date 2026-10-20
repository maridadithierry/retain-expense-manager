import expenseRoutes from "./routes/expenseRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Authentication routes — mount only once.
app.use("/api/auth", authRoutes);

app.use("/api/expenses" , expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the Retain API",
    status: "running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "Retain API",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Retain API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Retain API:", error);
    process.exit(1);
  }
}

startServer();
