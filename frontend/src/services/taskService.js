import taskApi from "./taskApi";

export const getTasks = async () => {
  const response = await taskApi.get("/tasks");
  return response.data;
};

export const createTask = async (task) => {
  const response = await taskApi.post("/tasks", task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await taskApi.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await taskApi.delete(`/tasks/${id}`);
  return response.data;
};

export const toggleTaskStatus = async (id) => {
  const response = await taskApi.patch(`/tasks/${id}/status`);
  return response.data;
};
