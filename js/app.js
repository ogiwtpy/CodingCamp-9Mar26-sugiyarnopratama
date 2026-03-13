// Productivity Dashboard Application

// Storage keys for Local Storage
const STORAGE_KEYS = {
    TASKS: 'productivity-dashboard-tasks',
    LINKS: 'productivity-dashboard-links',
    THEME: 'productivity-dashboard-theme'
};

// Theme Manager Module
const ThemeManager = {
    /**
     * Initialize theme from storage or system preference
     */
    init() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(theme);
        
        // Set up toggle button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },

    /**
     * Set theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
};

// StorageManager Module
// Handles all Local Storage operations with error handling
const StorageManager = {
    /**
     * Save data to Local Storage
     * @param {string} key - Storage key
     * @param {any} data - Data to store (will be JSON serialized)
     */
    save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage limit reached. Please delete some items.');
                // Could display user-facing error message here
            } else {
                console.error('Error saving to storage:', error);
            }
        }
    },

    /**
     * Load data from Local Storage
     * @param {string} key - Storage key
     * @returns {any|null} Parsed data or null if not found/invalid
     */
    load(key) {
        try {
            const jsonData = localStorage.getItem(key);
            
            // Return null if key doesn't exist
            if (jsonData === null) {
                return null;
            }
            
            const data = JSON.parse(jsonData);
            
            // Validate the parsed data
            if (!this.isValidData(data)) {
                console.warn('Invalid data format in storage, returning null');
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    },

    /**
     * Validate data structure
     * @param {any} data - Data to validate
     * @returns {boolean} True if data is valid
     */
    isValidData(data) {
        // Data should be an array for tasks and links
        if (!Array.isArray(data)) {
            return false;
        }
        
        // Empty arrays are valid
        if (data.length === 0) {
            return true;
        }
        
        // Check if all items have required properties
        // Each item should be an object with at least an 'id' property
        return data.every(item => 
            item !== null && 
            typeof item === 'object' && 
            'id' in item
        );
    }
};

// GreetingWidget Module
// Displays current time, date, and time-appropriate greeting
const GreetingWidget = {
    intervalId: null,

    /**
     * Initialize the greeting widget
     * Sets up initial display and starts the update interval
     */
    init() {
        // Display initial time, date, and greeting
        this.updateTime();
        
        // Update every second
        this.intervalId = setInterval(() => {
            this.updateTime();
        }, 1000);
    },

    /**
     * Update the time, date, and greeting display
     */
    updateTime() {
        const now = new Date();
        const hour = now.getHours();
        
        // Update time display
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = this.formatTime(now);
        }
        
        // Update date display
        const dateElement = document.getElementById('date');
        if (dateElement) {
            dateElement.textContent = this.formatDate(now);
        }
        
        // Update greeting message
        const greetingElement = document.getElementById('greeting-message');
        if (greetingElement) {
            greetingElement.textContent = this.getGreeting(hour);
        }
    },

    /**
     * Get time-appropriate greeting based on hour
     * @param {number} hour - Hour of day (0-23)
     * @returns {string} Greeting message
     */
    getGreeting(hour) {
        // Morning: 5:00 AM - 11:59 AM (hours 5-11)
        if (hour >= 5 && hour <= 11) {
            return 'Good Morning';
        }
        // Afternoon: 12:00 PM - 4:59 PM (hours 12-16)
        else if (hour >= 12 && hour <= 16) {
            return 'Good Afternoon';
        }
        // Evening: 5:00 PM - 8:59 PM (hours 17-20)
        else if (hour >= 17 && hour <= 20) {
            return 'Good Evening';
        }
        // Night: 9:00 PM - 4:59 AM (hours 21-23, 0-4)
        else {
            return 'Good Night';
        }
    },

    /**
     * Format time in 12-hour format with AM/PM
     * @param {Date} date - Date object to format
     * @returns {string} Formatted time string (e.g., "3:45 PM")
     */
    formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        
        // Determine AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Hour 0 should be 12
        
        // Pad minutes with leading zero if needed
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutesStr} ${ampm}`;
    },

    /**
     * Format date in readable format
     * @param {Date} date - Date object to format
     * @returns {string} Formatted date string (e.g., "Monday, January 15, 2024")
     */
    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }
};


// TimerWidget Module
// Manages 25-minute focus timer with start/stop/reset controls
const TimerWidget = {
    totalSeconds: 1500, // 25 minutes
    remainingSeconds: 1500,
    isRunning: false,
    intervalId: null,

    /**
     * Initialize the timer widget
     * Sets up event listeners and initial display
     */
    init() {
        // Set initial display
        this.updateDisplay();
        
        // Set up event listeners
        const startBtn = document.getElementById('timer-start');
        const stopBtn = document.getElementById('timer-stop');
        const resetBtn = document.getElementById('timer-reset');
        const displayElement = document.getElementById('timer-display');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Allow clicking on timer display to customize duration
        if (displayElement) {
            displayElement.addEventListener('click', () => {
                if (!this.isRunning) {
                    this.customizeDuration();
                }
            });
            displayElement.style.cursor = 'pointer';
            displayElement.title = 'Click to customize timer duration';
        }
    },

    /**
     * Customize timer duration
     */
    customizeDuration() {
        const minutes = prompt('Enter timer duration in minutes:', Math.floor(this.totalSeconds / 60));
        if (minutes !== null) {
            const parsedMinutes = parseInt(minutes);
            if (!isNaN(parsedMinutes) && parsedMinutes > 0 && parsedMinutes <= 999) {
                this.totalSeconds = parsedMinutes * 60;
                this.remainingSeconds = this.totalSeconds;
                this.updateDisplay();
                
                // Clear notification
                const notificationElement = document.getElementById('timer-notification');
                if (notificationElement) {
                    notificationElement.textContent = '';
                }
            } else {
                alert('Please enter a valid number between 1 and 999');
            }
        }
    },

    /**
     * Start the countdown timer
     * Ignores if timer is already running
     */
    start() {
        // Prevent multiple intervals from running
        if (this.isRunning) {
            return;
        }
        
        this.isRunning = true;
        
        // Start countdown interval (tick every second)
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    },

    /**
     * Stop/pause the countdown timer
     * Preserves current remaining time
     */
    stop() {
        // Ignore if timer is already stopped
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        
        // Clear the interval
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    /**
     * Reset timer to 25 minutes
     * Stops the timer if running
     */
    reset() {
        // Stop the timer if running
        this.stop();
        
        // Reset to initial state
        this.remainingSeconds = this.totalSeconds;
        
        // Clear notification
        const notificationElement = document.getElementById('timer-notification');
        if (notificationElement) {
            notificationElement.textContent = '';
        }
        
        // Update display
        this.updateDisplay();
    },

    /**
     * Decrement timer by one second and check for completion
     * Called every second while timer is running
     */
    tick() {
        // Decrement remaining time
        this.remainingSeconds--;
        
        // Update display
        this.updateDisplay();
        
        // Check if timer reached zero
        if (this.remainingSeconds <= 0) {
            this.remainingSeconds = 0;
            this.stop();
            this.showNotification();
        }
    },

    /**
     * Update the timer display with current remaining time
     */
    updateDisplay() {
        const displayElement = document.getElementById('timer-display');
        if (displayElement) {
            displayElement.textContent = this.formatTime(this.remainingSeconds);
        }
    },

    /**
     * Format seconds as MM:SS
     * @param {number} seconds - Total seconds to format
     * @returns {string} Formatted time string (e.g., "25:00", "03:45")
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        // Pad with leading zeros
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const secsStr = secs < 10 ? '0' + secs : secs;
        
        return `${minutesStr}:${secsStr}`;
    },

    /**
     * Show completion notification when timer reaches zero
     */
    showNotification() {
        const notificationElement = document.getElementById('timer-notification');
        if (notificationElement) {
            notificationElement.textContent = 'Focus session complete!';
        }
    }
};

// TaskWidget Module
// Manages task list with Local Storage persistence
const TaskWidget = {
    tasks: [],
    currentFilter: 'all', // 'all', 'active', 'completed'

    /**
     * Initialize the task widget
     */
    init() {
        this.loadTasks();

        // Set up event listeners
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('task-input');
                if (input && input.value.trim()) {
                    this.addTask(input.value.trim());
                    input.value = '';
                }
            });
        }

        // Set up filter buttons
        const sortAll = document.getElementById('sort-all');
        const sortActive = document.getElementById('sort-active');
        const sortCompleted = document.getElementById('sort-completed');

        if (sortAll) {
            sortAll.addEventListener('click', () => this.setFilter('all'));
        }
        if (sortActive) {
            sortActive.addEventListener('click', () => this.setFilter('active'));
        }
        if (sortCompleted) {
            sortCompleted.addEventListener('click', () => this.setFilter('completed'));
        }

        this.renderTasks();
    },

    /**
     * Set task filter
     * @param {string} filter - 'all', 'active', or 'completed'
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('#task-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`sort-${filter}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderTasks();
    },

    /**
     * Load tasks from Local Storage
     */
    loadTasks() {
        const loadedTasks = StorageManager.load(STORAGE_KEYS.TASKS);
        this.tasks = loadedTasks || [];
    },

    /**
     * Save tasks to Local Storage
     */
    saveTasks() {
        StorageManager.save(STORAGE_KEYS.TASKS, this.tasks);
    },

    /**
     * Check if task already exists (prevent duplicates)
     * @param {string} text - Task text to check
     * @returns {boolean} True if duplicate exists
     */
    isDuplicate(text) {
        return this.tasks.some(task => 
            task.text.toLowerCase() === text.toLowerCase()
        );
    },

    /**
     * Add a new task
     * @param {string} text - Task text
     */
    addTask(text) {
        if (!text || text.trim() === '') {
            return; // Silent rejection
        }

        // Check for duplicates
        if (this.isDuplicate(text)) {
            alert('This task already exists!');
            return;
        }

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    },

    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    },

    /**
     * Edit task text
     * @param {string} id - Task ID
     * @param {string} newText - New task text
     */
    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            // Check if new text is duplicate (excluding current task)
            const isDuplicate = this.tasks.some(t => 
                t.id !== id && t.text.toLowerCase() === newText.toLowerCase()
            );
            
            if (isDuplicate) {
                alert('This task already exists!');
                return;
            }
            
            task.text = newText.trim();
            this.saveTasks();
            this.renderTasks();
        }
    },

    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    },

    /**
     * Get filtered tasks based on current filter
     * @returns {Array} Filtered tasks
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    },

    /**
     * Render tasks to DOM
     */
    renderTasks() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        taskList.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.dataset.id = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('click', () => this.toggleTask(task.id));

            const span = document.createElement('span');
            span.textContent = task.text;
            span.addEventListener('click', () => {
                const newText = prompt('Edit task:', task.text);
                if (newText !== null) {
                    this.editTask(task.id, newText);
                }
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }
};

// QuickLinksWidget Module
// Manages quick links with Local Storage persistence
const QuickLinksWidget = {
    links: [],

    /**
     * Initialize the quick links widget
     */
    init() {
        this.loadLinks();

        // Set up event listeners
        const linkForm = document.getElementById('link-form');
        if (linkForm) {
            linkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('link-name');
                const urlInput = document.getElementById('link-url');
                
                if (nameInput && urlInput) {
                    const name = nameInput.value.trim();
                    const url = urlInput.value.trim();
                    
                    if (name && url) {
                        this.addLink(name, url);
                        nameInput.value = '';
                        urlInput.value = '';
                    }
                }
            });
        }

        this.renderLinks();
    },

    /**
     * Load links from Local Storage
     */
    loadLinks() {
        const loadedLinks = StorageManager.load(STORAGE_KEYS.LINKS);
        this.links = loadedLinks || [];
    },

    /**
     * Save links to Local Storage
     */
    saveLinks() {
        StorageManager.save(STORAGE_KEYS.LINKS, this.links);
    },

    /**
     * Add a new link
     * @param {string} name - Link name
     * @param {string} url - Link URL
     */
    addLink(name, url) {
        // Validate inputs
        if (!name || name.trim() === '') {
            alert('Link name is required');
            return;
        }

        if (!this.validateURL(url)) {
            alert('URL must start with http:// or https://');
            return;
        }

        const link = {
            id: Date.now().toString(),
            name: name,
            url: url
        };

        this.links.push(link);
        this.saveLinks();
        this.renderLinks();
    },

    /**
     * Delete a link
     * @param {string} id - Link ID
     */
    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.saveLinks();
        this.renderLinks();
    },

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    validateURL(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    },

    /**
     * Render links to DOM
     */
    renderLinks() {
        const linkList = document.getElementById('link-list');
        if (!linkList) return;

        linkList.innerHTML = '';

        this.links.forEach(link => {
            const li = document.createElement('li');
            li.dataset.id = link.id;

            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.textContent = link.name;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

            li.appendChild(anchor);
            li.appendChild(deleteBtn);
            linkList.appendChild(li);
        });
    }
};


// App Module
// Main application initialization
const App = {
    /**
     * Initialize the application
     * Called when DOM is fully loaded
     */
    init() {
        try {
            // Verify required DOM elements exist
            const requiredElements = [
                'time', 'date', 'greeting-message',
                'timer-display', 'timer-start', 'timer-stop', 'timer-reset', 'timer-notification'
            ];
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.error('Missing required DOM elements:', missingElements);
            }
            
            // Initialize all widgets
            ThemeManager.init();
            GreetingWidget.init();
            TimerWidget.init();
            TaskWidget.init();
            QuickLinksWidget.init();
            
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
