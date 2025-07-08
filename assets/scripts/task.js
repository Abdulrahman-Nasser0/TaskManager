export class Task {
  constructor(title, priority, description) {
    this.id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.title = title;
    this.priority = priority;
    this.description = description;
    this.createdAt = new Date();
    this.completed = false;
    this.column = "todo";
  }
}

export function formatDate(date) {
  const today = new Date();
  const taskDate = new Date(date);
  if (taskDate.toDateString() === today.toDateString()) {
    return "today";
  }
  return taskDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
