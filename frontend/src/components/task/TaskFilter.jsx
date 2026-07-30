function TaskFilter({ filter, setFilter }) {
  return (
    <div className="flex gap-3 mb-6">

      <button
        onClick={() => setFilter("all")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        All
      </button>

      <button
        onClick={() => setFilter("pending")}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Pending
      </button>

      <button
        onClick={() => setFilter("completed")}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Completed
      </button>

    </div>
  );
}

export default TaskFilter;