function Navbar() {
  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center px-6 py-4 shadow">
      <h1 className="text-2xl font-bold">TaskFlow</h1>

      <div className="flex items-center gap-4">
        <span>Welcome, Ajay</span>

        <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;