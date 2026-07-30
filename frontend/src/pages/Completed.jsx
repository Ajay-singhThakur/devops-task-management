import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import TaskList from "../components/task/TaskList";
import { getTasks, deleteTask, toggleTaskStatus } from "../services/taskService";

function Completed() {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    const data = await getTasks();

    setTasks(
      data.tasks.filter((task) => task.status === "completed")
    );
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Completed Tasks
      </h1>

      <TaskList
        tasks={tasks}
        onDelete={async (id) => {
          await deleteTask(id);
          loadTasks();
        }}
        onToggle={async (id) => {
          await toggleTaskStatus(id);
          loadTasks();
        }}
      />
    </MainLayout>
  );
}

export default Completed;