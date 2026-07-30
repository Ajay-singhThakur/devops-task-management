import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from "../services/taskService.js";

export const createTaskController = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = await createTask({
      title,
      description,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTasksController = async (req, res) => {
  try {
    const tasks = await getTasks(req.user.id);

    res.status(200).json({
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const updateTaskController = async (req, res) => {
  try {
    const task = await updateTask(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const deleteTaskController = async (req, res) => {
  try {
    const task = await deleteTask(
      req.params.id,
      req.user.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const toggleTaskStatusController = async (
  req,
  res
) => {
  try {
    const task = await toggleTaskStatus(
      req.params.id,
      req.user.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task status updated",
      task,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};