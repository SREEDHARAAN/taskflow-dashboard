// TaskFlow Application - Complete JavaScript Implementation

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentTaskId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.checkTheme();
    }

    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Edit form submission
        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });

        // Close modal
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // Delete button
        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            this.deleteTask();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Close modal on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });
    }

    addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;

        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            status: 'todo',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Show toast notification
        this.showToast('Task added successfully!');
        
        // Reset form
        document.getElementById('taskForm').reset();
    }

    updateTask() {
        const id = parseInt(document.getElementById('editTaskId').value);
        const title = document.getElementById('editTaskTitle').value;
        const description = document.getElementById('editTaskDescription').value;
        const dueDate = document.getElementById('editTaskDueDate').value;
        const priority = document.getElementById('editTaskPriority').value;

        const taskIndex = this.tasks.findIndex(t => t.id === id);
        
        if (taskIndex > -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                description,
                dueDate,
                priority
            };
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeModal();
            this.showToast('Task updated successfully!');
        }
    }

    deleteTask() {
        const id = parseInt(document.getElementById('editTaskId').value);
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeModal();
        this.showToast('Task deleted!');
    }

    moveTask(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            if (newStatus === 'completed') {
                this.showToast('Task completed! 🎉');
            } else {
                this.showToast(`Task moved to ${this.getStatusLabel(newStatus)}!`);
            }
        }
    }

    editTask(task) {
        this.currentTaskId = task.id;
        
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editTaskPriority').value = task.priority;
        
        this.openModal();
    }

    openModal() {
        document.getElementById('taskModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('taskModal').classList.remove('show');
        this.currentTaskId = null;
    }

    renderTasks() {
        const todoList = document.getElementById('todoList');
        const inProgressList = document.getElementById('inProgressList');
        const completedList = document.getElementById('completedList');

        todoList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';

        this.tasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            
            if (task.status === 'todo') {
                todoList.appendChild(taskCard);
            } else if (task.status === 'inprogress') {
                inProgressList.appendChild(taskCard);
            } else {
                completedList.appendChild(taskCard);
            }
        });
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority}`;
        card.innerHTML = `
            <div class="task-card-header">
                <span class="task-title">${this.escapeHtml(task.title)}</span>
                <span class="task-due-date"><i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}</span>
            </div>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                <div class="task-actions">
                    <button class="task-btn task-btn-move" onclick="app.moveTask(${task.id}, 'inprogress')" title="Move to In Progress">
                        <i class="fas fa-forward"></i>
                    </button>
                    ${task.status !== 'completed' ? `
                        <button class="task-btn task-btn-complete" onclick="app.moveTask(${task.id}, 'completed')" title="Mark as Complete">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="task-btn task-btn-delete" onclick="app.deleteTask(${task.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.updateThemeIcon();
    }

    checkTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeBtn = document.getElementById('themeToggle');
        const icon = themeBtn.querySelector('i');
        
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getStatusLabel(status) {
        const labels = {
            'todo': 'To Do',
            'inprogress': 'In Progress',
            'completed': 'Completed'
        };
        return labels[status];
    }
}

// Initialize Application
const app = new TaskManager();