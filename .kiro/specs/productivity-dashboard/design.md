# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a client-side web application built with vanilla HTML, CSS, and JavaScript. It provides four core productivity widgets in a single-page interface: a time-based greeting display, a 25-minute focus timer, a task management system, and quick links to favorite websites. All data persists locally using the browser's Local Storage API, requiring no backend infrastructure.

The application follows a simple, modular architecture where each widget operates independently but shares a common data persistence layer. The design prioritizes simplicity, performance, and maintainability by avoiding external dependencies and using standard Web APIs.

### Key Design Goals

- **Zero Dependencies**: Pure vanilla JavaScript with no frameworks or libraries
- **Instant Load**: Complete interface renders in under 500ms
- **Data Persistence**: All user data survives browser sessions via Local Storage
- **Clean Separation**: Each widget is self-contained with clear responsibilities
- **Browser Compatibility**: Works consistently across Chrome, Firefox, Edge, and Safari

## Architecture

### System Structure

The application uses a simple three-layer architecture:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (HTML Structure + CSS Styling)         │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Application Layer               │
│  ┌──────────┐  ┌──────────┐            │
│  │ Greeting │  │  Timer   │            │
│  │  Widget  │  │  Widget  │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │   Task   │  │  Quick   │            │
│  │  Widget  │  │  Links   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Data Layer                      │
│  (Local Storage Persistence)            │
└─────────────────────────────────────────┘
```

### Component Responsibilities

**Greeting Widget**
- Displays current time (12-hour format with AM/PM)
- Displays current date in readable format
- Shows time-appropriate greeting (Morning/Afternoon/Evening/Night)
- Updates time display every second

**Focus Timer Widget**
- Manages 25-minute countdown timer
- Provides start, stop, and reset controls
- Displays time in MM:SS format
- Shows completion notification when timer reaches zero
- Updates display every second while running

**Task Widget**
- Creates new tasks from user input
- Toggles task completion status
- Enables task text editing
- Deletes tasks
- Persists all changes to Local Storage
- Loads tasks from Local Storage on initialization

**Quick Links Widget**
- Creates new links with name and URL
- Validates URLs (must start with http:// or https://)
- Opens links in new tabs
- Deletes links
- Persists all changes to Local Storage
- Loads links from Local Storage on initialization

**Data Persistence Module**
- Provides save/load functions for Local Storage
- Handles JSON serialization/deserialization
- Manages unique storage keys for tasks and links
- Handles corrupted or invalid data gracefully

## Components and Interfaces

### File Structure

```
productivity-dashboard/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
└── js/
    └── app.js          # All JavaScript logic
```

### HTML Structure

The HTML file provides semantic structure for all widgets:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Productivity Dashboard</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Greeting Widget -->
    <section id="greeting">
        <div id="time"></div>
        <div id="date"></div>
        <div id="greeting-message"></div>
    </section>

    <!-- Focus Timer Widget -->
    <section id="timer">
        <h2>Focus Timer</h2>
        <div id="timer-display">25:00</div>
        <div id="timer-controls">
            <button id="timer-start">Start</button>
            <button id="timer-stop">Stop</button>
            <button id="timer-reset">Reset</button>
        </div>
        <div id="timer-notification"></div>
    </section>

    <!-- Task List Widget -->
    <section id="tasks">
        <h2>Tasks</h2>
        <form id="task-form">
            <input type="text" id="task-input" placeholder="Add a new task...">
            <button type="submit">Add</button>
        </form>
        <ul id="task-list"></ul>
    </section>

    <!-- Quick Links Widget -->
    <section id="links">
        <h2>Quick Links</h2>
        <form id="link-form">
            <input type="text" id="link-name" placeholder="Link name">
            <input type="url" id="link-url" placeholder="https://example.com">
            <button type="submit">Add</button>
        </form>
        <ul id="link-list"></ul>
    </section>

    <script src="js/app.js"></script>
</body>
</html>
```

### JavaScript Module Structure

The JavaScript file is organized into distinct modules using the revealing module pattern:

**StorageManager Module**
```javascript
const StorageManager = {
    save(key, data),
    load(key),
    isValidData(data)
}
```

**GreetingWidget Module**
```javascript
const GreetingWidget = {
    init(),
    updateTime(),
    getGreeting(hour),
    formatTime(date),
    formatDate(date)
}
```

**TimerWidget Module**
```javascript
const TimerWidget = {
    init(),
    start(),
    stop(),
    reset(),
    tick(),
    formatTime(seconds),
    showNotification()
}
```

**TaskWidget Module**
```javascript
const TaskWidget = {
    init(),
    loadTasks(),
    saveTasks(),
    addTask(text),
    toggleTask(id),
    editTask(id, newText),
    deleteTask(id),
    renderTasks()
}
```

**QuickLinksWidget Module**
```javascript
const QuickLinksWidget = {
    init(),
    loadLinks(),
    saveLinks(),
    addLink(name, url),
    deleteLink(id),
    validateURL(url),
    renderLinks()
}
```

**App Module**
```javascript
const App = {
    init()
}
```

### Interface Contracts

**StorageManager.save(key: string, data: any): void**
- Serializes data to JSON
- Stores in Local Storage with the provided key
- Handles storage quota errors gracefully

**StorageManager.load(key: string): any | null**
- Retrieves data from Local Storage
- Parses JSON and returns object
- Returns null if key doesn't exist or data is invalid

**TimerWidget.tick(): void**
- Decrements remaining seconds by 1
- Updates display
- Checks if timer reached zero
- Calls showNotification() if complete

**TaskWidget.addTask(text: string): void**
- Creates task object with unique ID, text, and completed status
- Adds to tasks array
- Saves to Local Storage
- Re-renders task list

**QuickLinksWidget.validateURL(url: string): boolean**
- Returns true if URL starts with http:// or https://
- Returns false otherwise

## Data Models

### Task Object

```javascript
{
    id: string,           // Unique identifier (timestamp-based)
    text: string,         // Task description
    completed: boolean    // Completion status
}
```

**Constraints:**
- `id` must be unique across all tasks
- `text` must be non-empty string
- `completed` defaults to false for new tasks

### Link Object

```javascript
{
    id: string,           // Unique identifier (timestamp-based)
    name: string,         // Display name for the link
    url: string          // Full URL including protocol
}
```

**Constraints:**
- `id` must be unique across all links
- `name` must be non-empty string
- `url` must start with http:// or https://

### Timer State

```javascript
{
    totalSeconds: number,     // Initial duration (1500 for 25 minutes)
    remainingSeconds: number, // Current countdown value
    isRunning: boolean,       // Whether timer is active
    intervalId: number | null // setInterval reference
}
```

**Constraints:**
- `totalSeconds` is constant at 1500 (25 minutes)
- `remainingSeconds` ranges from 0 to 1500
- `isRunning` is true only when countdown is active
- `intervalId` is null when timer is stopped

### Local Storage Keys

```javascript
const STORAGE_KEYS = {
    TASKS: 'productivity-dashboard-tasks',
    LINKS: 'productivity-dashboard-links'
};
```

### Greeting Time Ranges

```javascript
const GREETING_TIMES = {
    MORNING: { start: 5, end: 11 },      // 5:00 AM - 11:59 AM
    AFTERNOON: { start: 12, end: 16 },   // 12:00 PM - 4:59 PM
    EVENING: { start: 17, end: 20 },     // 5:00 PM - 8:59 PM
    NIGHT: { start: 21, end: 4 }         // 9:00 PM - 4:59 AM
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Format Validation

*For any* Date object, the formatted time output should contain hours in range 1-12, minutes in range 00-59, and either "AM" or "PM" indicator.

**Validates: Requirements 1.1**

### Property 2: Date Format Validation

*For any* Date object, the formatted date output should contain the month name, day number, and year.

**Validates: Requirements 1.2**

### Property 3: Greeting Time Range Mapping

*For any* hour of the day (0-23), the greeting function should return "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16, "Good Evening" for hours 17-20, and "Good Night" for hours 21-4.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 4: Timer Stop Preserves State

*For any* timer state with remaining seconds, stopping the timer should preserve the exact remaining time value.

**Validates: Requirements 2.3**

### Property 5: Timer Reset Returns to Initial State

*For any* timer state, resetting should return the remaining seconds to 1500 (25 minutes).

**Validates: Requirements 2.4**

### Property 6: Timer Display Format

*For any* number of seconds in range 0-1500, the formatted timer display should match the pattern MM:SS where MM is 00-25 and SS is 00-59.

**Validates: Requirements 2.6**

### Property 7: Task Addition Increases Count

*For any* task list and any valid (non-empty) task text, adding the task should increase the task list length by exactly 1 and the new task should contain the provided text.

**Validates: Requirements 3.1**

### Property 8: Task Toggle Idempotence

*For any* task, toggling its completion status twice should return it to its original completion state.

**Validates: Requirements 3.2**

### Property 9: Task Edit Updates Text

*For any* task and any new text value, editing the task should result in the task's text property matching the new text value.

**Validates: Requirements 3.3**

### Property 10: Task Deletion Removes Item

*For any* task list containing a specific task, deleting that task should decrease the list length by exactly 1 and the task should no longer be present in the list.

**Validates: Requirements 3.4**

### Property 11: Task Completion Visual Distinction

*For any* task, the rendered HTML for a completed task should differ from the rendered HTML for an incomplete task (e.g., different CSS class or styling attribute).

**Validates: Requirements 3.5**

### Property 12: Task Mutations Trigger Persistence

*For any* task operation (create, edit, delete, toggle), the operation should result in the updated task list being saved to Local Storage.

**Validates: Requirements 3.6**

### Property 13: Task Storage Round Trip

*For any* array of task objects, saving to Local Storage then loading should produce an equivalent array with the same tasks in the same order.

**Validates: Requirements 3.7, 5.3**

### Property 14: Link Addition Increases Count

*For any* link list and any valid name and URL (starting with http:// or https://), adding the link should increase the link list length by exactly 1.

**Validates: Requirements 4.1**

### Property 15: Link Deletion Removes Item

*For any* link list containing a specific link, deleting that link should decrease the list length by exactly 1 and the link should no longer be present in the list.

**Validates: Requirements 4.3**

### Property 16: URL Validation

*For any* string starting with "http://" or "https://", the URL validation function should return true. For any string not starting with these prefixes, the validation function should return false.

**Validates: Requirements 4.4**

### Property 17: Link Mutations Trigger Persistence

*For any* link operation (create, delete), the operation should result in the updated link list being saved to Local Storage.

**Validates: Requirements 4.5**

### Property 18: Link Storage Round Trip

*For any* array of link objects, saving to Local Storage then loading should produce an equivalent array with the same links in the same order.

**Validates: Requirements 4.6, 5.4**

## Error Handling

### Invalid Input Handling

**Empty Task Text**
- When user attempts to add a task with empty or whitespace-only text, the system should reject the input and display no error message (silent rejection)
- The task list should remain unchanged

**Invalid URL Format**
- When user attempts to add a link with a URL not starting with http:// or https://, the system should reject the input
- Display a user-friendly error message: "URL must start with http:// or https://"
- The link list should remain unchanged

**Empty Link Name**
- When user attempts to add a link with empty name, the system should reject the input
- Display error message: "Link name is required"
- The link list should remain unchanged

### Storage Errors

**Local Storage Quota Exceeded**
- When Local Storage quota is exceeded during save operation, catch the QuotaExceededError
- Display error message: "Storage limit reached. Please delete some items."
- Continue operating with in-memory data only

**Corrupted Storage Data**
- When loading data from Local Storage, wrap JSON.parse in try-catch
- If parsing fails, log error to console and initialize with empty arrays
- Display informational message: "Starting fresh - previous data could not be loaded"

**Storage Unavailable**
- When Local Storage is unavailable (private browsing mode in some browsers), detect on initialization
- Display warning message: "Storage unavailable - data will not persist between sessions"
- Continue operating with in-memory data only

### Timer Edge Cases

**Timer at Zero**
- When timer reaches 0, stop the countdown interval
- Display completion notification: "Focus session complete!"
- Keep timer at 00:00 until user clicks reset

**Multiple Start Clicks**
- When user clicks start while timer is already running, ignore the click
- Prevent multiple intervals from running simultaneously

**Stop on Stopped Timer**
- When user clicks stop while timer is already stopped, ignore the click
- No state change occurs

### DOM Manipulation Errors

**Missing DOM Elements**
- On initialization, verify all required DOM elements exist
- If any element is missing, log error to console with specific element ID
- Gracefully degrade by disabling the affected widget

**Event Handler Errors**
- Wrap all event handlers in try-catch blocks
- Log errors to console with context about which handler failed
- Prevent one widget's error from breaking other widgets

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness guarantees. This ensures both concrete behavior validation and comprehensive input coverage.

### Property-Based Testing

**Framework Selection**
- Use **fast-check** library for JavaScript property-based testing
- Fast-check provides generators for common types and composable arbitraries
- Integrates well with standard test runners (Jest, Mocha, Vitest)

**Configuration**
- Each property test must run minimum 100 iterations to ensure adequate randomization
- Use seed-based randomization for reproducible test failures
- Tag each test with format: **Feature: productivity-dashboard, Property {number}: {property_text}**

**Property Test Implementation**

Each correctness property from the design document must be implemented as a property-based test:

```javascript
// Example: Property 3 - Greeting Time Range Mapping
test('Feature: productivity-dashboard, Property 3: Greeting time range mapping', () => {
    fc.assert(
        fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
            const greeting = getGreeting(hour);
            if (hour >= 5 && hour <= 11) {
                return greeting === "Good Morning";
            } else if (hour >= 12 && hour <= 16) {
                return greeting === "Good Afternoon";
            } else if (hour >= 17 && hour <= 20) {
                return greeting === "Good Evening";
            } else {
                return greeting === "Good Night";
            }
        }),
        { numRuns: 100 }
    );
});
```

**Generators Required**
- Task objects: `fc.record({ id: fc.string(), text: fc.string(), completed: fc.boolean() })`
- Link objects: `fc.record({ id: fc.string(), name: fc.string(), url: fc.webUrl() })`
- Time values: `fc.integer({ min: 0, max: 1500 })` for timer seconds
- Hour values: `fc.integer({ min: 0, max: 23 })` for greeting times
- Valid URLs: `fc.webUrl()` or custom generator ensuring http:// or https:// prefix
- Invalid URLs: `fc.string().filter(s => !s.startsWith('http'))` for validation testing

### Unit Testing

**Focus Areas**
- Specific examples demonstrating correct behavior
- Edge cases identified in requirements (timer at zero, corrupted storage)
- Error conditions and error handling paths
- Integration between components and storage layer

**Example Unit Tests**

```javascript
// Timer initialization
test('Timer initializes to 25 minutes', () => {
    const timer = TimerWidget.init();
    expect(timer.remainingSeconds).toBe(1500);
    expect(timer.isRunning).toBe(false);
});

// Timer completion notification
test('Timer shows notification when reaching zero', () => {
    const timer = { remainingSeconds: 1, isRunning: true };
    TimerWidget.tick(timer);
    expect(timer.remainingSeconds).toBe(0);
    expect(document.querySelector('#timer-notification').textContent)
        .toBe('Focus session complete!');
});

// Corrupted storage handling
test('Handles corrupted storage data gracefully', () => {
    localStorage.setItem('productivity-dashboard-tasks', 'invalid json{');
    const tasks = TaskWidget.loadTasks();
    expect(tasks).toEqual([]);
});

// URL validation edge cases
test('Validates URLs correctly', () => {
    expect(QuickLinksWidget.validateURL('https://example.com')).toBe(true);
    expect(QuickLinksWidget.validateURL('http://example.com')).toBe(true);
    expect(QuickLinksWidget.validateURL('ftp://example.com')).toBe(false);
    expect(QuickLinksWidget.validateURL('example.com')).toBe(false);
    expect(QuickLinksWidget.validateURL('')).toBe(false);
});
```

**Test Organization**
- Group tests by widget/module
- Use descriptive test names that explain the scenario
- Keep tests isolated - each test should set up and tear down its own state
- Mock Local Storage for tests to avoid side effects

### Integration Testing

**Storage Integration**
- Test complete workflows: add task → save → reload page → verify task persists
- Test data migration scenarios if storage format changes
- Verify storage keys are unique and don't conflict

**Widget Interaction**
- Verify widgets operate independently (timer running doesn't affect task list)
- Test that multiple widgets can save to storage without conflicts
- Verify page load initializes all widgets correctly

### Manual Testing Checklist

**Browser Compatibility**
- Test in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Verify Local Storage works in each browser
- Check time/date formatting across browsers

**Performance**
- Load page and verify render time under 500ms
- Add 100 tasks and verify no lag
- Add 50 links and verify no lag
- Run timer for full 25 minutes and verify smooth countdown

**Visual Testing**
- Verify layout on different screen sizes
- Check color contrast for readability
- Verify completed tasks have distinct visual indicator
- Confirm timer notification is visible

**User Workflows**
- Complete full Pomodoro session (start, wait, notification, reset)
- Add, edit, complete, and delete multiple tasks
- Add and delete multiple links
- Close and reopen browser to verify persistence

### Test Coverage Goals

- **Line Coverage**: Minimum 80% of JavaScript code
- **Branch Coverage**: Minimum 75% of conditional branches
- **Property Coverage**: 100% of correctness properties implemented as tests
- **Edge Case Coverage**: All edge cases from Error Handling section tested

### Continuous Testing

- Run unit tests on every code change
- Run property tests before each commit
- Run full test suite including integration tests before deployment
- Use test coverage reports to identify untested code paths

