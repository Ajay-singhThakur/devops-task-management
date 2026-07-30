import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    onAddTask({
      id: Date.now(),
      title,
      completed: false,
    });

    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Enter Task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 border rounded-lg px-4 py-2"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
      >
        Add
      </button>
    </form>
  );
}

export default TaskForm;