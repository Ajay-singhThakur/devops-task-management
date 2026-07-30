import TaskCard from "./TaskCard";

function TaskList({ tasks, onDelete, onToggle }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default TaskList;