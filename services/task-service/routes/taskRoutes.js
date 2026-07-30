import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createTaskController,
  getTasksController,
  updateTaskController,
  deleteTaskController,
  toggleTaskStatusController,
} from "../controllers/taskController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTaskController);

router.get("/", getTasksController);

router.put("/:id", updateTaskController);

router.patch("/:id/status", toggleTaskStatusController);

router.delete("/:id", deleteTaskController);

export default router;