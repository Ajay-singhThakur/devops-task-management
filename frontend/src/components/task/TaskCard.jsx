function TaskCard({ task, onDelete, onToggle }) {
  const isCompleted = task.status === "completed";

  return (
    <div className="bg-white p-5 rounded-lg shadow border">

      <h2
        className={`text-xl font-semibold ${
          isCompleted ? "line-through text-gray-400" : ""
        }`}
      >
        {task.title}
      </h2>

      {task.description && (
        <p className="text-gray-600 mt-2">
          {task.description}
        </p>
      )}

      <div className="mt-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isCompleted
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isCompleted ? "Completed" : "Pending"}
        </span>
      </div>

      <div className="flex gap-3 mt-5">

        <button
          onClick={() => onToggle(task._id)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isCompleted ? "Undo" : "Complete"}
        </button>

        <button
          onClick={() => onDelete(task._id)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>

      </div>

    </div>
  );
}

export default TaskCard;