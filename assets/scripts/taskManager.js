import { Task, formatDate } from "./task.js";
import { saveTasks, loadTasks } from "./storage.js";

const elements = {};
let tasks = [];
let currentFilter = "all";

const initElements = () => {
  elements.form = document.getElementById("taskForm");
  elements.submitBtn = document.getElementById("submitBtn");
  elements.taskTitle = document.getElementById("taskTitle");
  elements.taskPriority = document.getElementById("taskPriority");
  elements.taskDescription = document.getElementById("taskDescription");
  elements.taskList = document.getElementById("taskList");
  elements.totalTasks = document.getElementById("totalTasks");
  elements.highPriorityTasks = document.getElementById("highPriorityTasks");
  elements.completedTasks = document.getElementById("completedTasks");
  elements.inProgressTasks = document.getElementById("inProgressTasks");
  elements.filterBtns = document.querySelectorAll(".filter-btn");
  elements.emptyState = document.getElementById("emptyState");
};

const filterTasks = () => {
  switch (currentFilter) {
    case "all":
      return tasks;
    case "active":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    case "high":
      return tasks.filter((task) => task.priority === "high");
    default:
      return tasks;
  }
};

const addTask = (title, priority, description) => {
  const task = new Task(title, priority, description);
  tasks.push(task);
  saveTasks(tasks);
  updateStats();
  renderTask(task);
  showToast("Task added!");
  return task;
};

const getStats = () => ({
  total: tasks.length,
  high: tasks.filter((t) => t.priority === "high").length,
  medium: tasks.filter((t) => t.priority === "medium").length,
  low: tasks.filter((t) => t.priority === "low").length,
  completed: tasks.filter((t) => t.completed).length,
  active: tasks.filter((t) => !t.completed).length,
});

const updateStats = () => {
  const stats = getStats();
  if (elements.totalTasks) elements.totalTasks.textContent = stats.total;
  if (elements.highPriorityTasks)
    elements.highPriorityTasks.textContent = stats.high;
  if (elements.completedTasks)
    elements.completedTasks.textContent = stats.completed;
  if (elements.inProgressTasks)
    elements.inProgressTasks.textContent = stats.active;
};

const toggleComplete = (taskId) => {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
    renderAllTasks();
  }
};

const renderTask = (task) => {
  if (!elements.taskList) return;
  const taskEl = document.createElement("div");
  taskEl.className = `task-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${task.completed ? "border-green-500 opacity-75" : "border-purple-500"} animate-slide-in`;
  taskEl.dataset.taskId = task.id;
  const priorityColors = {
    low: "bg-green-100 text-green-600",
    medium: "bg-yellow-100 text-yellow-600",
    high: "bg-red-100 text-red-600",
  };
  taskEl.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold ${task.completed ? "line-through text-gray-500" : "text-gray-800"}">${task.title}</h3>
                    <span class="px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}">${task.priority}</span>
                </div>
                ${task.description ? `<p class="text-gray-600 ${task.completed ? "line-through" : ""}">${task.description}</p>` : ""}
                <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Created ${formatDate(task.createdAt)}
                    </span>
                </div>
            </div>
            <div class="flex gap-2 ml-4">
                <button onclick="TaskManager.toggleComplete('${task.id}')" class="p-2 ${task.completed ? "text-gray-600" : "text-green-600"} hover:bg-green-100 rounded-lg transition-colors duration-200" title="${task.completed ? "Mark as incomplete" : "Mark as complete"}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </button>
                <button onclick="TaskManager.deleteTask('${task.id}')" class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200" title="Delete task">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
  elements.taskList.appendChild(taskEl);
};

const renderAllTasks = () => {
  if (!elements.taskList) return;
  elements.taskList.innerHTML = ``;
  const filteredTasks = filterTasks();
  if (filteredTasks.length === 0 && elements.emptyState) {
    elements.emptyState.classList.remove("hidden");
  } else if (elements.emptyState) {
    elements.emptyState.classList.add("hidden");
  }
  filteredTasks.forEach(renderTask);
  updateStats();
};

const deleteTask = (taskId) => {
  const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
  if (taskEl) {
    taskEl.classList.add(
      "opacity-0",
      "scale-95",
      "transition-all",
      "duration-300",
    );
    setTimeout(() => {
      actuallyDeleteTask(taskId);
    }, 300);
  } else {
    actuallyDeleteTask(taskId);
  }
};

function actuallyDeleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks(tasks);
  renderAllTasks();
  showToast("Task deleted!", "bg-red-600");
}

const handleSubmit = (e) => {
  e.preventDefault();
  const title = elements.taskTitle.value.trim();
  const priority = elements.taskPriority.value;
  const description = elements.taskDescription.value.trim();
  if (!title) {
    alert("Task title is required");
    elements.taskTitle.focus();
    return;
  }
  addTask(title, priority, description || "No description");
  elements.form.reset();
  elements.taskTitle.focus();
};

const bindEvents = () => {
  if (elements.form) {
    elements.form.addEventListener("submit", handleSubmit);
  }
  if (elements.filterBtns) {
    elements.filterBtns.forEach((button) => {
      button.addEventListener("click", handleFilterClick);
    });
  }
};

const handleFilterClick = (e) => {
  const clickedButton = e.target;
  elements.filterBtns.forEach((btn) => {
    if (btn === clickedButton) {
      btn.classList.remove("bg-gray-200", "text-gray-700");
      btn.classList.add("bg-purple-600", "text-white");
    } else {
      btn.classList.remove("bg-purple-600", "text-white");
      btn.classList.add("bg-gray-200", "text-gray-700");
    }
  });
  currentFilter = clickedButton.dataset.filter;
  renderAllTasks();
};

const init = () => {
  initElements();
  bindEvents();
  tasks = loadTasks();
  renderAllTasks();
  updateStats();
};

function showToast(message, color = "bg-green-600") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `fixed bottom-6 right-6 z-50 ${color} text-white px-4 py-2 rounded shadow-lg transition-all duration-300`;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

// Expose globally for inline HTML event handlers
window.TaskManager = {
  init,
  addTask,
  deleteTask,
  toggleComplete,
  getStats,
  getTasks: () => [...tasks],
};

document.addEventListener("DOMContentLoaded", () => {
  window.TaskManager.init();
});
