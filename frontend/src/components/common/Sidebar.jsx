function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-6">Menu</h2>

      <ul className="space-y-4">
        <li className="hover:text-blue-400 cursor-pointer">
          Dashboard
        </li>

        <li className="hover:text-blue-400 cursor-pointer">
          My Tasks
        </li>

        <li className="hover:text-blue-400 cursor-pointer">
          Completed
        </li>

        <li className="hover:text-blue-400 cursor-pointer">
          Profile
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;