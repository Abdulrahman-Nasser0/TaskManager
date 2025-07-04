// Task Management System
const TaskManager = (() => {
    // Private variables
    let tasks = [];
    const elements = {};
    
    let currentFilter = 'all';  

    const initElements = () => {
        elements.form = document.getElementById('taskForm');
        elements.submitBtn = document.getElementById('submitBtn');
        elements.taskTitle = document.getElementById('taskTitle');
        elements.taskPriority = document.getElementById('taskPriority');
        elements.taskDescription = document.getElementById('taskDescription');
        elements.taskList = document.getElementById('taskList');
        elements.totalTasks = document.getElementById('totalTasks');
        elements.highPriorityTasks = document.getElementById('highPriorityTasks');
        elements.completedTasks = document.getElementById('completedTasks');      
        elements.inProgressTasks = document.getElementById('inProgressTasks');   
        elements.filterBtns = document.querySelectorAll('.filter-btn');   
    };

    
    class Task {
        constructor(title, priority, description) {
            this.id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            this.title = title;
            this.priority = priority;
            this.description = description;
            this.createdAt = new Date();
            this.completed = false;
            this.column = 'todo';
        }
    }
    
    const filterTasks = () => {
        switch(currentFilter) {
            case 'all':
                return tasks;  // Return all tasks
                
            case 'active':
                return tasks.filter(task => !task.completed);  // Only incomplete tasks
                
            case 'completed':
                return tasks.filter(task => task.completed);  // Only completed tasks
                
            case 'high':
                return tasks.filter(task => task.priority === 'high');  // Only high priority
                
            default:
                return tasks;
        }
    };

    const addTask = (title, priority, description) => {
        const task = new Task(title, priority, description);
        tasks.push(task);
        saveTasks();
        updateStats();
        renderTask(task);
        return task;
    };

     // localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            tasks = JSON.parse(saved);
            renderAllTasks();
        }
    };

    const getStats = () => ({
        total: tasks.length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
        completed: tasks.filter(t => t.completed).length,
        active: tasks.filter(t => !t.completed).length
    });

    const updateStats = () => {
        const stats = getStats();
        
        if (elements.totalTasks) {
            elements.totalTasks.textContent = stats.total;
        }
        if (elements.highPriorityTasks) {
            elements.highPriorityTasks.textContent = stats.high;
        }
        if (elements.completedTasks) {
            elements.completedTasks.textContent = stats.completed;
        }
        if (elements.inProgressTasks) {
            elements.inProgressTasks.textContent = stats.active;
        }
    };

    const toggleComplete = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderAllTasks();
        }
    };

    const renderTask = (task)=>{
        if(!elements.taskList)return;

        const taskEl = document.createElement('div');
         taskEl.className = `task-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${task.completed ? 'border-green-500 opacity-75' : 'border-purple-500'} animate-slide-in`;
        taskEl.dataset.taskId = task.id;
        const priorityColors = {
            low: 'bg-green-100 text-green-600',
            medium: 'bg-yellow-100 text-yellow-600',
            high: 'bg-red-100 text-red-600'
        };


        taskEl.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.title}</h3>
                    <span class="px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}">${task.priority}</span>
                </div>
                ${task.description ? `<p class="text-gray-600 ${task.completed ? 'line-through' : ''}">${task.description}</p>` : ''}
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
                <button onclick="TaskManager.toggleComplete('${task.id}')" class="p-2 ${task.completed ? 'text-gray-600' : 'text-green-600'} hover:bg-green-100 rounded-lg transition-colors duration-200" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
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
    
    const renderAllTasks = ()=>{
        if(!elements.taskList)return;

        elements.taskList.innerHTML = ``;
        const filteredTasks = filterTasks();

        if (filteredTasks.length === 0 && elements.emptyState) {
            elements.emptyState.classList.remove('hidden');
        } else if (elements.emptyState) {
            elements.emptyState.classList.add('hidden');
        }
        filteredTasks.forEach(renderTask);
        updateStats();
    };

    const formatDate = (date) => {
        const today = new Date();
        const taskDate = new Date(date);
        
        if (taskDate.toDateString() === today.toDateString()) {
            return 'today';
        }
        
        return taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const deleteTask = (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderAllTasks();
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const title = elements.taskTitle.value.trim();
        const priority = elements.taskPriority.value;
        const description = elements.taskDescription.value.trim();
        
        // Validation
        if (!title) {
            alert('Task title is required');
            elements.taskTitle.focus();
            return;
        }
        
        addTask(title, priority, description || 'No description');
        elements.form.reset();
        elements.taskTitle.focus();
    };

    const bindEvents = () => {
        if(elements.form){
            elements.form.addEventListener('submit', handleSubmit);
        }

        if(elements.filterBtns) {
            elements.filterBtns.forEach(button => {
                button.addEventListener('click', handleFilterClick);
            });
        }
    };
    const handleFilterClick = (e) => {
        const clickedButton = e.target;
        
        // Update visual state of buttons
        elements.filterBtns.forEach(btn => {
            if (btn === clickedButton) {
                // Active button styling
                btn.classList.remove('bg-gray-200', 'text-gray-700');
                btn.classList.add('bg-purple-600', 'text-white');
            } else {
                // Inactive button styling
                btn.classList.remove('bg-purple-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
        
        // Update current filter
        currentFilter = clickedButton.dataset.filter;
        
        // Re-render tasks with new filter
        renderAllTasks();
    };


    // Initialize
    const init = () => {
        initElements();
        bindEvents();
        loadTasks();
        updateStats();
    };

    return {
        init,
        addTask,
        deleteTask,
        toggleComplete,
        getStats,
        getTasks: () => [...tasks] //copy 
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    TaskManager.init();
});