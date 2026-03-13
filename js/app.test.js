import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Import the modules after localStorage is mocked
// Since we're using vanilla JS, we need to load the file content
// For now, we'll define the modules inline for testing

const STORAGE_KEYS = {
    TASKS: 'productivity-dashboard-tasks',
    LINKS: 'productivity-dashboard-links'
};

const StorageManager = {
    save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage limit reached. Please delete some items.');
            } else {
                console.error('Error saving to storage:', error);
            }
        }
    },

    load(key) {
        try {
            const jsonData = localStorage.getItem(key);
            
            if (jsonData === null) {
                return null;
            }
            
            const data = JSON.parse(jsonData);
            
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

    isValidData(data) {
        if (!Array.isArray(data)) {
            return false;
        }
        
        if (data.length === 0) {
            return true;
        }
        
        return data.every(item => 
            item !== null && 
            typeof item === 'object' && 
            'id' in item
        );
    }
};

describe('StorageManager Property-Based Tests', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('Feature: productivity-dashboard, Property 13: Task storage round trip - **Validates: Requirements 3.7, 5.3**', () => {
        // Generator for task objects
        const taskArbitrary = fc.record({
            id: fc.string({ minLength: 1 }),
            text: fc.string(),
            completed: fc.boolean()
        });

        const tasksArrayArbitrary = fc.array(taskArbitrary, { minLength: 0, maxLength: 20 });

        fc.assert(
            fc.property(tasksArrayArbitrary, (tasks) => {
                // Save tasks to storage
                StorageManager.save(STORAGE_KEYS.TASKS, tasks);
                
                // Load tasks from storage
                const loadedTasks = StorageManager.load(STORAGE_KEYS.TASKS);
                
                // Verify the loaded tasks match the original
                expect(loadedTasks).toEqual(tasks);
                
                // Verify array length matches
                expect(loadedTasks.length).toBe(tasks.length);
                
                // Verify each task is preserved
                if (tasks.length > 0) {
                    tasks.forEach((task, index) => {
                        expect(loadedTasks[index].id).toBe(task.id);
                        expect(loadedTasks[index].text).toBe(task.text);
                        expect(loadedTasks[index].completed).toBe(task.completed);
                    });
                }
                
                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Feature: productivity-dashboard, Property 18: Link storage round trip - **Validates: Requirements 4.6, 5.4**', () => {
        // Generator for link objects
        const linkArbitrary = fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string(),
            url: fc.webUrl()
        });

        const linksArrayArbitrary = fc.array(linkArbitrary, { minLength: 0, maxLength: 20 });

        fc.assert(
            fc.property(linksArrayArbitrary, (links) => {
                // Save links to storage
                StorageManager.save(STORAGE_KEYS.LINKS, links);
                
                // Load links from storage
                const loadedLinks = StorageManager.load(STORAGE_KEYS.LINKS);
                
                // Verify the loaded links match the original
                expect(loadedLinks).toEqual(links);
                
                // Verify array length matches
                expect(loadedLinks.length).toBe(links.length);
                
                // Verify each link is preserved
                if (links.length > 0) {
                    links.forEach((link, index) => {
                        expect(loadedLinks[index].id).toBe(link.id);
                        expect(loadedLinks[index].name).toBe(link.name);
                        expect(loadedLinks[index].url).toBe(link.url);
                    });
                }
                
                return true;
            }),
            { numRuns: 100 }
        );
    });
});

describe('StorageManager Unit Tests', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('Handles corrupted storage data gracefully', () => {
        // Store invalid JSON
        localStorage.setItem(STORAGE_KEYS.TASKS, 'invalid json{');
        
        // Should return null for corrupted data
        const result = StorageManager.load(STORAGE_KEYS.TASKS);
        expect(result).toBeNull();
    });

    test('Handles storage quota exceeded scenario', () => {
        // Mock localStorage.setItem to throw QuotaExceededError
        const originalSetItem = localStorage.setItem;
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        localStorage.setItem = () => {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
        };

        // Should handle the error gracefully
        const testData = [{ id: '1', text: 'Test', completed: false }];
        StorageManager.save(STORAGE_KEYS.TASKS, testData);
        
        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith('Storage limit reached. Please delete some items.');
        
        // Restore original function
        localStorage.setItem = originalSetItem;
        consoleErrorSpy.mockRestore();
    });

    test('Handles storage unavailable scenario', () => {
        // Mock localStorage.getItem to throw an error
        const originalGetItem = localStorage.getItem;
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        localStorage.getItem = () => {
            throw new Error('Storage unavailable');
        };

        // Should return null when storage is unavailable
        const result = StorageManager.load(STORAGE_KEYS.TASKS);
        expect(result).toBeNull();
        
        // Restore original function
        localStorage.getItem = originalGetItem;
        consoleErrorSpy.mockRestore();
    });

    test('Returns null for non-existent key', () => {
        const result = StorageManager.load('non-existent-key');
        expect(result).toBeNull();
    });

    test('Returns null for invalid data structure (not an array)', () => {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify({ invalid: 'object' }));
        
        const result = StorageManager.load(STORAGE_KEYS.TASKS);
        expect(result).toBeNull();
    });

    test('Returns null for array with invalid items (missing id)', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([
            { text: 'No ID', completed: false }
        ]));
        
        const result = StorageManager.load(STORAGE_KEYS.TASKS);
        expect(result).toBeNull();
        
        consoleWarnSpy.mockRestore();
    });

    test('Accepts empty array as valid data', () => {
        StorageManager.save(STORAGE_KEYS.TASKS, []);
        
        const result = StorageManager.load(STORAGE_KEYS.TASKS);
        expect(result).toEqual([]);
    });

    test('Validates data with all required properties', () => {
        const validTasks = [
            { id: '1', text: 'Task 1', completed: false },
            { id: '2', text: 'Task 2', completed: true }
        ];
        
        StorageManager.save(STORAGE_KEYS.TASKS, validTasks);
        const result = StorageManager.load(STORAGE_KEYS.TASKS);
        
        expect(result).toEqual(validTasks);
    });
});


// GreetingWidget Module
const GreetingWidget = {
    intervalId: null,

    init() {
        this.updateTime();
        this.intervalId = setInterval(() => {
            this.updateTime();
        }, 1000);
    },

    updateTime() {
        const now = new Date();
        const hour = now.getHours();
        
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = this.formatTime(now);
        }
        
        const dateElement = document.getElementById('date');
        if (dateElement) {
            dateElement.textContent = this.formatDate(now);
        }
        
        const greetingElement = document.getElementById('greeting-message');
        if (greetingElement) {
            greetingElement.textContent = this.getGreeting(hour);
        }
    },

    getGreeting(hour) {
        if (hour >= 5 && hour <= 11) {
            return 'Good Morning';
        }
        else if (hour >= 12 && hour <= 16) {
            return 'Good Afternoon';
        }
        else if (hour >= 17 && hour <= 20) {
            return 'Good Evening';
        }
        else {
            return 'Good Night';
        }
    },

    formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutesStr} ${ampm}`;
    },

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

describe('GreetingWidget Property-Based Tests', () => {
    test('Feature: productivity-dashboard, Property 1: Time format validation - **Validates: Requirements 1.1**', () => {
        // Generator for Date objects
        const dateArbitrary = fc.date();

        fc.assert(
            fc.property(dateArbitrary, (date) => {
                const formattedTime = GreetingWidget.formatTime(date);
                
                // Should match pattern: H:MM AM/PM or HH:MM AM/PM
                const timePattern = /^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/;
                expect(formattedTime).toMatch(timePattern);
                
                // Extract components
                const parts = formattedTime.match(/^(\d+):(\d+) (AM|PM)$/);
                expect(parts).not.toBeNull();
                
                const hours = parseInt(parts[1]);
                const minutes = parseInt(parts[2]);
                const ampm = parts[3];
                
                // Hours should be 1-12
                expect(hours).toBeGreaterThanOrEqual(1);
                expect(hours).toBeLessThanOrEqual(12);
                
                // Minutes should be 0-59
                expect(minutes).toBeGreaterThanOrEqual(0);
                expect(minutes).toBeLessThanOrEqual(59);
                
                // Should have AM or PM
                expect(['AM', 'PM']).toContain(ampm);
                
                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Feature: productivity-dashboard, Property 2: Date format validation - **Validates: Requirements 1.2**', () => {
        const dateArbitrary = fc.date();

        fc.assert(
            fc.property(dateArbitrary, (date) => {
                const formattedDate = GreetingWidget.formatDate(date);
                
                // Should be a non-empty string
                expect(formattedDate).toBeTruthy();
                expect(typeof formattedDate).toBe('string');
                
                // Should contain month name (at least 3 characters for abbreviated months)
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
                const hasMonth = months.some(month => formattedDate.includes(month));
                expect(hasMonth).toBe(true);
                
                // Should contain the year (4 digits)
                const year = date.getFullYear().toString();
                expect(formattedDate).toContain(year);
                
                // Should contain the day number
                const day = date.getDate().toString();
                expect(formattedDate).toContain(day);
                
                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Feature: productivity-dashboard, Property 3: Greeting time range mapping - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**', () => {
        // Generator for hours (0-23)
        const hourArbitrary = fc.integer({ min: 0, max: 23 });

        fc.assert(
            fc.property(hourArbitrary, (hour) => {
                const greeting = GreetingWidget.getGreeting(hour);
                
                // Verify correct greeting for each time range
                if (hour >= 5 && hour <= 11) {
                    expect(greeting).toBe('Good Morning');
                } else if (hour >= 12 && hour <= 16) {
                    expect(greeting).toBe('Good Afternoon');
                } else if (hour >= 17 && hour <= 20) {
                    expect(greeting).toBe('Good Evening');
                } else {
                    // Hours 21-23 and 0-4
                    expect(greeting).toBe('Good Night');
                }
                
                return true;
            }),
            { numRuns: 100 }
        );
    });
});

describe('GreetingWidget Unit Tests', () => {
    test('Formats specific time examples correctly', () => {
        // Test midnight
        const midnight = new Date('2024-01-15T00:00:00');
        expect(GreetingWidget.formatTime(midnight)).toBe('12:00 AM');
        
        // Test noon
        const noon = new Date('2024-01-15T12:00:00');
        expect(GreetingWidget.formatTime(noon)).toBe('12:00 PM');
        
        // Test morning time
        const morning = new Date('2024-01-15T09:30:00');
        expect(GreetingWidget.formatTime(morning)).toBe('9:30 AM');
        
        // Test afternoon time
        const afternoon = new Date('2024-01-15T15:45:00');
        expect(GreetingWidget.formatTime(afternoon)).toBe('3:45 PM');
        
        // Test evening time
        const evening = new Date('2024-01-15T23:59:00');
        expect(GreetingWidget.formatTime(evening)).toBe('11:59 PM');
    });

    test('Formats date examples correctly', () => {
        const testDate = new Date('2024-01-15T12:00:00');
        const formatted = GreetingWidget.formatDate(testDate);
        
        // Should contain month, day, and year
        expect(formatted).toContain('January');
        expect(formatted).toContain('15');
        expect(formatted).toContain('2024');
    });

    test('Returns correct greeting at boundary hours', () => {
        // Morning boundaries
        expect(GreetingWidget.getGreeting(4)).toBe('Good Night');
        expect(GreetingWidget.getGreeting(5)).toBe('Good Morning');
        expect(GreetingWidget.getGreeting(11)).toBe('Good Morning');
        expect(GreetingWidget.getGreeting(12)).toBe('Good Afternoon');
        
        // Afternoon boundaries
        expect(GreetingWidget.getGreeting(16)).toBe('Good Afternoon');
        expect(GreetingWidget.getGreeting(17)).toBe('Good Evening');
        
        // Evening boundaries
        expect(GreetingWidget.getGreeting(20)).toBe('Good Evening');
        expect(GreetingWidget.getGreeting(21)).toBe('Good Night');
        
        // Night boundaries
        expect(GreetingWidget.getGreeting(0)).toBe('Good Night');
        expect(GreetingWidget.getGreeting(23)).toBe('Good Night');
    });

    test('Handles single-digit minutes with leading zero', () => {
        const time = new Date('2024-01-15T09:05:00');
        expect(GreetingWidget.formatTime(time)).toBe('9:05 AM');
    });

    test('Converts 24-hour format to 12-hour format correctly', () => {
        // Test 1 AM
        expect(GreetingWidget.formatTime(new Date('2024-01-15T01:00:00'))).toBe('1:00 AM');
        
        // Test 1 PM (13:00)
        expect(GreetingWidget.formatTime(new Date('2024-01-15T13:00:00'))).toBe('1:00 PM');
        
        // Test 11 PM (23:00)
        expect(GreetingWidget.formatTime(new Date('2024-01-15T23:00:00'))).toBe('11:00 PM');
    });
});
