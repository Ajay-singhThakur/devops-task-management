import Task from "../models/Task.js";

export const createTask = async ({ title, description, userId }) => {
  return await Task.create({
    title,
    description,
    userId,
  });
};

export const getTasks = async (userId) => {
  return await Task.find({ userId }).sort({
    createdAt: -1,
  });
};

export const updateTask = async (taskId, userId, updates) => {
  return await Task.findOneAndUpdate(
    {
      _id: taskId,
      userId,
    },
    updates,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteTask = async (taskId, userId) => {
  return await Task.findOneAndDelete({
    _id: taskId,
    userId,
  });
};

export const toggleTaskStatus = async (taskId, userId) => {
  const task = await Task.findOne({
    _id: taskId,
    userId,
  });

  if (!task) {
    return null;
  }

  task.status =
    task.status === "pending"
      ? "completed"
      : "pending";

  await task.save();

  return task;
};