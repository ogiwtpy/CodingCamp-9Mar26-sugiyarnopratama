# Test Setup Instructions

## Prerequisites

You need Node.js and npm installed to run the tests.

## Installation

Run the following command to install test dependencies:

```bash
npm install
```

This will install:
- `vitest` - Fast unit test framework
- `fast-check` - Property-based testing library
- `jsdom` - DOM environment for testing

## Running Tests

### Run all tests once:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

## Test Coverage

The test suite includes:

### Property-Based Tests (Task 3.1)
- **Property 13**: Task storage round trip - validates that tasks can be saved and loaded without data loss
- **Property 18**: Link storage round trip - validates that links can be saved and loaded without data loss

Each property test runs 100 iterations with randomly generated data.

### Unit Tests (Task 3.2)
- Corrupted storage data handling
- Storage quota exceeded scenario
- Storage unavailable scenario
- Non-existent key handling
- Invalid data structure validation
- Empty array validation
- Valid data with all required properties

## Test Files

- `js/app.test.js` - All StorageManager tests
- `vitest.config.js` - Vitest configuration
- `package.json` - Dependencies and test scripts
