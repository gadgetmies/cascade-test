# Cascade Test

A test framework where context cascades through your test hierarchy. Plain JavaScript objects with automatic context passing.

## Features

- **Nested Test Suites**: Organize tests hierarchically with setup/teardown at any level
- **Async Support**: Full support for async/await and Promise-based tests
- **Timeout Management**: Configurable timeouts for individual tests and test groups
- **Test Skipping**: Skip tests conditionally with custom reasons
- **File Discovery**: Automatic test file discovery with regex filtering
- **CLI Runner**: Command-line tool for running multiple test files

## Installation

```bash
npm install cascade-test
```

## Quick Start

### Basic Test

```javascript
const { test } = require('cascade-test')

test({
  'should pass basic assertion': () => {
    // Return null/undefined for pass, or an error message for fail
    if (1 + 1 !== 2) {
      return 'Math is broken!'
    }
    // Test passes
  },

  'should handle async operations': async () => {
    const result = await someAsyncOperation()
    if (result !== expectedValue) {
      return `Expected ${expectedValue}, got ${result}`
    }
  }
})
```

### Nested Test Suites

```javascript
const { test } = require('cascade-test')

test({
  setup: async () => {
    // Setup code that runs before all tests in this suite
    const db = await connectToDatabase()
    return { db, timeout: 10000 } // Return context for tests
  },

  teardown: async (context) => {
    // Cleanup code that runs after all tests
    await context.db.close()
  },

  'Database Tests': {
    setup: async (parentContext) => {
      // Setup for this specific group
      const table = await parentContext.db.createTable('test')
      return { table }
    },

    'should insert data': async (context) => {
      const result = await context.table.insert({ name: 'test' })
      if (!result.id) {
        return 'Insert failed'
      }
    },

    'should query data': async (context) => {
      const data = await context.table.find({ name: 'test' })
      if (data.length === 0) {
        return 'No data found'
      }
    }
  },

  'API Tests': {
    'should return 200': async () => {
      const response = await fetch('/api/test')
      if (response.status !== 200) {
        return `Expected 200, got ${response.status}`
      }
    }
  }
})
```

### Skipping Tests

```javascript
const { test } = require('cascade-test')

test({
  skip: () => {
    // Skip all tests in this suite
    return 'Feature not implemented yet'
  },

  'should be skipped': () => {
    // This test will be skipped
  },

  'Conditional Tests': {
    skip: () => {
      // Skip conditionally
      return process.env.NODE_ENV === 'production' ? 'Skipping in production' : false
    },

    'should run in development': () => {
      // This test runs only in development
    }
  }
})
```

## API Reference

### `test(suite)`

The main test function that runs a test suite.

**Parameters:**
- `suite` (Object): Test suite configuration

**Suite Structure:**
- `setup` (Function, optional): Setup function that runs before all tests
- `teardown` (Function, optional): Cleanup function that runs after all tests  
- `skip` (Function, optional): Skip function that determines if tests should be skipped
- `timeout` (Number, optional): Timeout in milliseconds for this suite
- Any other properties are treated as test functions or nested suites

**Setup/Teardown Functions:**
- `setup()`: Returns context object that gets passed to all tests
- `teardown(context)`: Receives the context from setup for cleanup

**Test Functions:**
- `testFunction(context)`: Receives context from setup
- Return `null`/`undefined` for pass, or error message string for fail
- Can be async/Promise-based

**Skip Functions:**
- `skip()`: Return `true` to skip all tests, or string for skip reason, or a falsy value (`false, null, undefined`) to run tests

### `fileUtils.recursivelyFindByRegex(base, regex)`

Utility function to find files matching a regex pattern recursively.

**Parameters:**
- `base` (String): Base directory to search
- `regex` (RegExp): Regular expression to match filenames

**Returns:** Array of file paths

## CLI Usage

The framework includes a command-line runner for executing multiple test files:

```bash
# Run all .js files in the test directory
npx cascade-test test/

# Run with custom regex pattern
npx cascade-test test/ --regex "\.spec\.js$"

# Or install globally
npm install -g cascade-test
cascade-test test/
```

### CLI Options

- `path`: Directory to search for test files (required)
- `--regex, -r`: Regex pattern to filter files (default: `/\.js$/`)
- `--help, -h`: Show help information

## Configuration

### Timeouts

- **Default Assertion Timeout**: 5000ms
- **Default Group Timeout**: 10000ms
- **Custom Timeout**: Set `timeout` property in setup return value

```javascript
test({
  setup: () => {
    return { timeout: 15000 } // 15 second timeout for all tests
  }
})
```

## Examples

Check `test/example.test.js`

## License

MIT

