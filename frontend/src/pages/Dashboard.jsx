import { useState } from "react";

import MainLayout from "../layouts/MainLayout";
import TaskForm from "../components/task/TaskForm";
import TaskList from "../components/task/TaskList";
import TaskFilter from "../components/task/TaskFilter";

function Dashboard() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Learn Docker",
      completed: false,
    },
    {
      id: 2,
      title: "Learn Kubernetes",
      completed: true,
    },
  ]);

  const [filter, setFilter] = useState("all");

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <TaskForm onAddTask={addTask} />

      <TaskFilter
        filter={filter}
        setFilter={setFilter}
      />

      <TaskList
        tasks={filteredTasks}
        onDelete={deleteTask}
        onToggle={toggleTask}
      />
    </MainLayout>
  );
}

export default Dashboard;