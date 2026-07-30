import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import { getTasks } from "../services/taskService";

function Profile() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getTasks();

        const tasks = data.tasks;

        const completed = tasks.filter(
          (task) => task.status === "completed"
        ).length;

        setStats({
          total: tasks.length,
          completed,
          pending: tasks.length - completed,
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadStats();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl">

        <div className="flex items-center gap-6 mb-10">

          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div>
            <h2 className="text-3xl font-bold">
              {user?.name}
            </h2>

            <p className="text-gray-500 mt-2">
              {user?.email}
            </p>
          </div>

        </div>

        <hr className="mb-8" />

        <h3 className="text-2xl font-semibold mb-6">
          Task Statistics
        </h3>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="bg-blue-600 text-white rounded-xl p-6">
            <p className="text-lg">
              Total Tasks
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {stats.total}
            </h2>
          </div>

          <div className="bg-green-600 text-white rounded-xl p-6">
            <p className="text-lg">
              Completed
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {stats.completed}
            </h2>
          </div>

          <div className="bg-yellow-500 text-white rounded-xl p-6">
            <p className="text-lg">
              Pending
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {stats.pending}
            </h2>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default Profile;