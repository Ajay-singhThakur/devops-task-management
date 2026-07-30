import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import TaskForm from "../components/task/TaskForm";
import TaskList from "../components/task/TaskList";
import TaskFilter from "../components/task/TaskFilter";
import { toast } from "react-toastify";

import {
  getTasks,
  createTask,
  deleteTask,
  toggleTaskStatus,
} from "../services/taskService";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();
      setTasks(data.tasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (task) => {
    try {
      await createTask(task);
      await loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const completeTask = async (id) => {
    try {
      await toggleTaskStatus(id);
      await loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status === "completed";
    if (filter === "pending") return task.status === "pending";
    return true;
  });

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {/* Statistics */}

      <div className="grid md:grid-cols-3 gap-2 mb-6">

        <div className="bg-blue-600 text-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-medium">
            Total Tasks
          </h2>

          <p className="text-4xl font-bold mt-3">
            {totalTasks}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-medium">
            Pending Tasks
          </h2>

          <p className="text-4xl font-bold mt-3">
            {pendingTasks}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-medium">
            Completed Tasks
          </h2>

          <p className="text-4xl font-bold mt-3">
            {completedTasks}
          </p>
        </div>

      </div>

      <TaskForm onAddTask={addTask} />

      <TaskFilter
        filter={filter}
        setFilter={setFilter}
      />

      {loading ? (
        <div className="text-center text-lg py-10">
          Loading Tasks...
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onDelete={removeTask}
          onToggle={completeTask}
        />
      )}
    </MainLayout>
  );
}

export default Dashboard;