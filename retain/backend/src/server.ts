
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

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
  });
});

app.listen(PORT, () => {
  console.log(`Retain API running on port ${PORT}`);
});
