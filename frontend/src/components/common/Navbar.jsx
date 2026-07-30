import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          🚀 TaskFlow
        </h1>
        <p className="text-sm text-gray-500">
          Task Management System
        </p>
      </div>

      <div className="text-right">
        <p className="text-gray-500 text-sm">
          Welcome
        </p>

        <h2 className="text-lg font-semibold text-gray-800">
          {user?.name || "User"} 👋
        </h2>
      </div>
    </nav>
  );
}

export default Navbar;