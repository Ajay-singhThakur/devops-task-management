import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">
          📋 TaskFlow
        </h2>

        <nav className="space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/completed" className={linkClass}>
            ✅ Completed
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            👤 Profile
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 transition text-white py-3 rounded-lg font-semibold"
      >
        🚪 Logout
      </button>
    </aside>
  );
}

export default Sidebar;