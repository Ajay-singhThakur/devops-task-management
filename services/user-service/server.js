import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import validateEnv from "./config/validateEnv.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
validateEnv();

const app = express();

connectDB();

// Security Middleware
app.use(helmet());

// CORS
app.use(cors());

// Logging
app.use(morgan("combined"));

// Parse JSON
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TaskFlow User Service 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "User Service",
  });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});