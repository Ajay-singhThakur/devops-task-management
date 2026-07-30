import TaskCard from "./TaskCard";

function TaskList({ tasks, onDelete, onToggle }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <div className="text-6xl mb-4">📋</div>

        <h2 className="text-2xl font-bold text-gray-700">
          No Tasks Found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default TaskList;