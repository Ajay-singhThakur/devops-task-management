function TaskCard({ task, onDelete, onToggle }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow">

      <h2
        className={`text-xl font-semibold ${
          task.completed ? "line-through text-gray-400" : ""
        }`}
      >
        {task.title}
      </h2>

      <div className="flex gap-3 mt-5">

        <button
          onClick={() => onToggle(task.id)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {task.completed ? "Undo" : "Complete"}
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>

      </div>

    </div>
  );
}

export default TaskCard;