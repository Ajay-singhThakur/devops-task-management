import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger.js";
import validateEnv from "./config/validateEnv.js";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

dotenv.config();
validateEnv();


const app = express();

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Task Service 🚀",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "Task Service",
  });
});

app.use("/api/v1/tasks", taskRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`Task Service running on port ${PORT}`);
});