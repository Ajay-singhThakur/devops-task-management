import asyncHandler from "../middleware/asyncHandler.js";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from "../services/taskService.js";

export const createTaskController = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const task = await createTask({
    title,
    description,
    userId: req.user.id,
  });

  res.status(201).json({
    message: "Task created successfully",
    task,
  });
});

export const getTasksController = asyncHandler(async (req, res) => {
  const tasks = await getTasks(req.user.id);

  res.status(200).json({
    count: tasks.length,
    tasks,
  });
});

export const updateTaskController = asyncHandler(async (req, res) => {
  const task = await updateTask(
    req.params.id,
    req.user.id,
    req.body
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    message: "Task updated successfully",
    task,
  });
});

export const deleteTaskController = asyncHandler(async (req, res) => {
  const task = await deleteTask(
    req.params.id,
    req.user.id
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    message: "Task deleted successfully",
  });
});

export const toggleTaskStatusController = asyncHandler(async (req, res) => {
  const task = await toggleTaskStatus(
    req.params.id,
    req.user.id
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    message: "Task status updated successfully",
    task,
  });
});