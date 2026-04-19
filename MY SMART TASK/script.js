// Storage key
const STORAGE_KEY = 'smart-todos';

// State
let todos = [];
let editingId = null;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');
const activeTasks = document.getElementById('activeTasks');
const completedTasks = document.getElementById('completedTasks');
const emptyState = document.getElementById('emptyState');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const confirmDialog = document.getElementById('confirmDialog');
const confirmCancel = document.getElementById('confirmCancel');
const confirmDelete = document.getElementById('confirmDelete');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');

// Initialize
function init() {
    loadTodos();
    loadTheme();
    requestNotificationPermission();
    setupEventListeners();
    renderTodos();
    startReminderCheck();
}

// Load todos from localStorage
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    todos = stored ? JSON.parse(stored) : [];
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Load theme from localStorage
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark');
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

// Show notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'todo-reminder'
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    addTaskBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closeTaskModal);
    cancelBtn.addEventListener('click', closeTaskModal);
    taskForm.addEventListener('submit', handleSubmit);
    clearCompleted.addEventListener('click', openConfirmDialog);
    confirmCancel.addEventListener('click', closeConfirmDialog);
    confirmDelete.addEventListener('click', handleClearCompleted);
    
    // Close modal on outside click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeTaskModal();
    });
    confirmDialog.addEventListener('click', (e) => {
        if (e.target === confirmDialog) closeConfirmDialog();
    });
}

// Open add modal
function openAddModal() {
    editingId = null;
    modalTitle.textContent = 'Add New Task';
    submitBtn.textContent = 'Add Task';
    taskForm.reset();
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    document.getElementById('taskDue').value = tomorrow.toISOString().slice(0, 16);
    
    taskModal.classList.add('active');
}

// Open edit modal
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    editingId = id;
    modalTitle.textContent = 'Edit Task';
    submitBtn.textContent = 'Update Task';
    
    document.getElementById('taskTitle').value = todo.title;
    document.getElementById('taskDescription').value = todo.description;
    document.getElementById('taskPriority').value = todo.priority;
    document.getElementById('taskDue').value = new Date(todo.due).toISOString().slice(0, 16);
    
    taskModal.classList.add('active');
}

// Close task modal
function closeTaskModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
    editingId = null;
}

// Handle form submit
function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const due = document.getElementById('taskDue').value;
    
    if (!title || !due) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (editingId) {
        // Update existing todo
        const index = todos.findIndex(t => t.id === editingId);
        if (index !== -1) {
            todos[index] = {
                ...todos[index],
                title,
                description,
                priority,
                due
            };
        }
    } else {
        // Add new todo
        const newTodo = {
            id: Date.now().toString(),
            title,
            description,
            priority,
            due,
            completed: false,
            reminder: true,
            createdAt: new Date().toISOString()
        };
        todos.unshift(newTodo);
    }
    
    saveTodos();
    renderTodos();
    closeTaskModal();
}

// Toggle complete
function toggleComplete(id) {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
    }
}

// Toggle reminder
function toggleReminder(id) {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        todos[index].reminder = !todos[index].reminder;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
    }
}

// Open confirm dialog
function openConfirmDialog() {
    confirmDialog.classList.add('active');
}

// Close confirm dialog
function closeConfirmDialog() {
    confirmDialog.classList.remove('active');
}

// Clear completed tasks
function handleClearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
    closeConfirmDialog();
}

// Format time remaining
function formatTimeRemaining(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff < 0) {
        return 'Overdue';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Check if overdue
function isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
}

// Create task card HTML
function createTaskCard(todo) {
    const timeRemaining = formatTimeRemaining(todo.due);
    const overdue = isOverdue(todo.due);
    
    return `
        <div class="task-card ${todo.completed ? 'completed' : ''} ${todo.reminder && !todo.completed ? 'reminder' : ''} ${overdue && !todo.completed ? 'overdue' : ''}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(todo.title)}</h3>
                <div class="task-actions">
                    <button class="icon-btn ${todo.completed ? 'complete' : ''}" onclick="toggleComplete('${todo.id}')" title="Mark as ${todo.completed ? 'incomplete' : 'complete'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                    ${!todo.completed ? `
                    <button class="icon-btn ${todo.reminder ? 'reminder-active' : ''}" onclick="toggleReminder('${todo.id}')" title="${todo.reminder ? 'Disable' : 'Enable'} reminder">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </button>
                    <button class="icon-btn edit" onclick="openEditModal('${todo.id}')" title="Edit task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button class="icon-btn delete" onclick="deleteTodo('${todo.id}')" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${todo.description ? `<p class="task-description">${escapeHtml(todo.description)}</p>` : ''}
            <div class="task-meta">
                <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                <span class="due-time ${overdue && !todo.completed ? 'overdue' : ''}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${timeRemaining}
                </span>
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update progress bar
function updateProgress() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Complete`;
    taskCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
}

// Render todos
function renderTodos() {
    const active = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);
    
    // Render active tasks
    if (active.length === 0) {
        activeTasks.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        activeTasks.style.display = 'grid';
        emptyState.style.display = 'none';
        activeTasks.innerHTML = active.map(todo => createTaskCard(todo)).join('');
    }
    
    // Render completed tasks
    if (completed.length === 0) {
        completedTasks.style.display = 'none';
        clearCompleted.style.display = 'none';
    } else {
        completedTasks.style.display = 'grid';
        clearCompleted.style.display = 'block';
        completedTasks.innerHTML = completed.map(todo => createTaskCard(todo)).join('');
    }
    
    updateProgress();
}

// Check reminders
function checkReminders() {
    const now = new Date();
    
    todos.forEach(todo => {
        if (todo.completed || !todo.reminder) return;
        
        const due = new Date(todo.due);
        const diff = due - now;
        
        // Remind if task is due within 5 minutes
        if (diff > 0 && diff <= 5 * 60 * 1000) {
            const minutesLeft = Math.ceil(diff / (1000 * 60));
            showNotification(
                '🔔 Task Reminder',
                `"${todo.title}" is due in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}!`
            );
            
            // Disable reminder after showing notification to avoid spam
            todo.reminder = false;
            saveTodos();
        }
    });
}

// Start reminder check
function startReminderCheck() {
    // Check every minute
    setInterval(checkReminders, 60 * 1000);
    // Check immediately on load
    checkReminders();
}

// Initialize app
init();
