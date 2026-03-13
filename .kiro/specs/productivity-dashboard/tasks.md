# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a lightweight productivity dashboard using vanilla HTML, CSS, and JavaScript. The implementation follows a modular architecture with four independent widgets (Greeting, Timer, Tasks, Quick Links) sharing a common Local Storage persistence layer. The plan progresses from foundational structure through individual widget implementation to integration and comprehensive testing.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure (css/, js/)
  - Create index.html with semantic HTML structure for all four widgets
  - Include meta tags, title, and stylesheet/script references
  - _Requirements: 6.1, 6.2, 6.3, 9.3_

- [x] 2. Implement CSS styling
  - Create css/styles.css with complete styling for all widgets
  - Apply visual hierarchy with prominent greeting display
  - Style distinct sections for timer, tasks, and quick links
  - Implement readable typography and consistent spacing
  - Use minimal color palette for readability
  - Style completed tasks with distinct visual indicator
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 3.5, 9.1, 9.5_

- [x] 3. Implement StorageManager module
  - Create js/app.js and implement StorageManager module
  - Implement save(key, data) with JSON serialization and error handling
  - Implement load(key) with JSON parsing and validation
  - Implement isValidData(data) for corrupted data detection
  - Handle QuotaExceededError gracefully
  - _Requirements: 5.1, 5.2, 5.6, 5.7, 5.5_

- [x] 3.1 Write property tests for StorageManager
  - **Property 13: Task storage round trip**
  - **Validates: Requirements 3.7, 5.3**
  - **Property 18: Link storage round trip**
  - **Validates: Requirements 4.6, 5.4**

- [x] 3.2 Write unit tests for StorageManager
  - Test corrupted storage data handling
  - Test storage quota exceeded scenario
  - Test storage unavailable scenario
  - _Requirements: 5.5_

- [-] 4. Implement GreetingWidget module
  - Implement init() to set up initial display and start update interval
  - Implement updateTime() to refresh time, date, and greeting every second
  - Implement getGreeting(hour) with time range logic (Morning/Afternoon/Evening/Night)
  - Implement formatTime(date) for 12-hour format with AM/PM
  - Implement formatDate(date) for readable date format
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 4.1 Write property tests for GreetingWidget
  - **Property 1: Time format validation**
  - **Validates: Requirements 1.1**
  - **Property 2: Date format validation**
  - **Validates: Requirements 1.2**
  - **Property 3: Greeting time range mapping**
  - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

- [ ] 4.2 Write unit tests for GreetingWidget
  - Test specific time formatting examples
  - Test date formatting examples
  - Test greeting transitions at boundary hours
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5. Implement TimerWidget module
  - Implement init() to initialize timer state (1500 seconds, not running)
  - Implement start() to begin countdown with setInterval
  - Implement stop() to pause countdown and clear interval
  - Implement reset() to return to 25 minutes
  - Implement tick() to decrement time and check for completion
  - Implement formatTime(seconds) for MM:SS display format
  - Implement showNotification() for completion message
  - Handle multiple start clicks and stop on stopped timer
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 5.1 Write property tests for TimerWidget
  - **Property 4: Timer stop preserves state**
  - **Validates: Requirements 2.3**
  - **Property 5: Timer reset returns to initial state**
  - **Validates: Requirements 2.4**
  - **Property 6: Timer display format**
  - **Validates: Requirements 2.6**

- [ ] 5.2 Write unit tests for TimerWidget
  - Test timer initialization to 25 minutes
  - Test timer completion notification
  - Test timer at zero edge case
  - Test multiple start clicks prevention
  - Test stop on stopped timer
  - _Requirements: 2.1, 2.5_

- [ ] 6. Checkpoint - Verify greeting and timer functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement TaskWidget module
  - Implement init() to set up event listeners and load tasks
  - Implement loadTasks() to retrieve tasks from Local Storage
  - Implement saveTasks() to persist tasks to Local Storage
  - Implement addTask(text) to create task with unique ID
  - Implement toggleTask(id) to switch completion status
  - Implement editTask(id, newText) to update task text
  - Implement deleteTask(id) to remove task from list
  - Implement renderTasks() to update DOM with current task list
  - Handle empty task text rejection (silent)
  - Ensure all mutations trigger saveTasks()
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 7.1 Write property tests for TaskWidget
  - **Property 7: Task addition increases count**
  - **Validates: Requirements 3.1**
  - **Property 8: Task toggle idempotence**
  - **Validates: Requirements 3.2**
  - **Property 9: Task edit updates text**
  - **Validates: Requirements 3.3**
  - **Property 10: Task deletion removes item**
  - **Validates: Requirements 3.4**
  - **Property 11: Task completion visual distinction**
  - **Validates: Requirements 3.5**
  - **Property 12: Task mutations trigger persistence**
  - **Validates: Requirements 3.6**

- [ ] 7.2 Write unit tests for TaskWidget
  - Test empty task text rejection
  - Test task rendering with completed vs incomplete styling
  - Test task list with multiple tasks
  - _Requirements: 3.1, 3.5_

- [ ] 8. Implement QuickLinksWidget module
  - Implement init() to set up event listeners and load links
  - Implement loadLinks() to retrieve links from Local Storage
  - Implement saveLinks() to persist links to Local Storage
  - Implement addLink(name, url) to create link with unique ID
  - Implement deleteLink(id) to remove link from list
  - Implement validateURL(url) to check for http:// or https:// prefix
  - Implement renderLinks() to update DOM with current link list
  - Handle invalid URL format with error message
  - Handle empty link name with error message
  - Ensure links open in new tabs
  - Ensure all mutations trigger saveLinks()
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 8.1 Write property tests for QuickLinksWidget
  - **Property 14: Link addition increases count**
  - **Validates: Requirements 4.1**
  - **Property 15: Link deletion removes item**
  - **Validates: Requirements 4.3**
  - **Property 16: URL validation**
  - **Validates: Requirements 4.4**
  - **Property 17: Link mutations trigger persistence**
  - **Validates: Requirements 4.5**

- [ ] 8.2 Write unit tests for QuickLinksWidget
  - Test URL validation edge cases (http, https, ftp, no protocol, empty)
  - Test empty link name rejection
  - Test link opening in new tab
  - _Requirements: 4.4, 4.1, 4.2_

- [ ] 9. Implement App module and initialization
  - Implement App.init() to initialize all widgets on DOMContentLoaded
  - Verify all required DOM elements exist on initialization
  - Add error logging for missing DOM elements
  - Wrap event handlers in try-catch blocks
  - Ensure widgets operate independently
  - _Requirements: 6.1, 7.2_

- [ ] 9.1 Write integration tests
  - Test complete workflow: add task → save → reload → verify persistence
  - Test complete workflow: add link → save → reload → verify persistence
  - Test widgets operate independently (timer doesn't affect tasks)
  - Test page load initializes all widgets correctly
  - _Requirements: 3.6, 3.7, 4.5, 4.6, 5.3, 5.4_

- [ ] 10. Checkpoint - Verify all widgets and integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Set up property-based testing framework
  - Install fast-check library for property-based testing
  - Configure test runner (Jest, Mocha, or Vitest)
  - Create test file structure
  - Set up generators for task objects, link objects, time values, URLs
  - Configure minimum 100 iterations per property test
  - _Requirements: All correctness properties_

- [ ] 12. Implement all property-based tests
  - Implement all 18 correctness properties as property tests
  - Tag each test with format: "Feature: productivity-dashboard, Property {N}: {text}"
  - Use appropriate generators for each property
  - Verify all properties pass with 100+ iterations
  - _Requirements: All correctness properties_

- [ ] 13. Performance optimization and validation
  - Test dashboard load time (target: under 500ms)
  - Test interaction response time (target: under 100ms)
  - Test with 100 tasks for performance validation
  - Test with 50 links for performance validation
  - Optimize any performance bottlenecks found
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Browser compatibility verification
  - Test in Chrome 90+ (verify all functionality)
  - Test in Firefox 88+ (verify all functionality)
  - Test in Edge 90+ (verify all functionality)
  - Test in Safari 14+ (verify all functionality)
  - Fix any browser-specific issues
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 15. Final checkpoint - Complete validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness guarantees
- Unit tests validate specific examples and edge cases
- The implementation uses vanilla JavaScript with no external dependencies (except fast-check for testing)
- All data persists in Local Storage with proper error handling
- Checkpoints ensure incremental validation throughout development
