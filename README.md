# Cascade Test

[![Framework Integration Tests](https://github.com/gadgetmies/cascade-test/actions/workflows/test-framework.yml/badge.svg?branch=main)](https://github.com/gadgetmies/cascade-test/actions/workflows/test-framework.yml)

A test framework where context cascades through your test hierarchy. Plain JavaScript objects with automatic context passing.

## Features

- **Nested Test Suites**: Organize tests hierarchically with setup/teardown at any level
- **Async Support**: Full support for async/await and Promise-based tests
- **Timeout Management**: Configurable timeouts for individual tests and test groups
- **Test Skipping**: Skip tests conditionally with custom reasons
- **File Discovery**: Automatic test file discovery with regex filtering
- **CLI Runner**: Command-line tool for running multiple test files
- **CI Integration**: Native support for Jenkins, Azure DevOps, GitLab CI, and GitHub Actions
- **Multiple Reporters**: JUnit XML, TAP, JSON, and console output formats
- **Auto-Detection**: Automatically detects CI environment and applies appropriate annotations

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
    // Skip all tests in this suite until a specific date
    return {
      reason: 'Feature not implemented yet',
      until: new Date('2024-12-31') // Skip until end of year
    }
  },

  'should be skipped': () => {
    // This test will be skipped until the specified date
  },

  'Conditional Tests': {
    skip: () => {
      // Skip conditionally with expiration
      return process.env.NODE_ENV === 'production' ? {
        reason: 'Skipping in production',
        until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      } : null
    },

    'should run in development': () => {
      // This test runs only in development
    }
  },

  'Expired Skip Example': {
    skip: () => {
      // This will cause the test to FAIL because the skip date is in the past
      return {
        reason: 'This skip has expired',
        until: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    },

    'should fail due to expired skip': () => {
      // This test will fail because the skip date has passed
    }
  }
})
```

#### Skip Configuration

The `skip` function must return an object with:
- `reason` (string): Explanation for why the test is being skipped
- `until` (Date | string): Date until which the test should be skipped

If the `until` date is in the past, the test will **fail** instead of being skipped, ensuring that temporary skips don't become permanent.

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
- `skip()`: Return a `SkipConfig` object to skip tests until a specific date, or `null`/`undefined` to run tests
- If the skip date is in the past, the test will fail instead of being skipped

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
- `--regex, -r`: Regex pattern to filter files (default: `/\.(js|ts)$/`)
- `--reporter`: Test reporter to use (`console`, `junit`, `tap`, `json`)
- `--output, -o`: Output file for structured reporters
- `--ci`: CI environment for annotations (`jenkins`, `azure`, `gitlab`, `github`, `console`, `auto`)
- `--help, -h`: Show help information

### Test Reporters

Cascade Test supports multiple output formats for different CI systems and use cases:

#### Console Reporter (Default)
```bash
npx cascade-test test/
# Outputs colored console output with test results
```

#### JUnit XML Reporter
```bash
npx cascade-test test/ --reporter=junit --output=test-results.xml
# Generates JUnit XML format for Jenkins, Azure DevOps, and most CI systems
```

#### TAP Reporter
```bash
npx cascade-test test/ --reporter=tap --output=test-results.tap
# Generates TAP (Test Anything Protocol) format for universal CI support
```

#### JSON Reporter
```bash
npx cascade-test test/ --reporter=json --output=test-results.json
# Generates structured JSON output for custom integrations
```

### CI Integration

Cascade Test automatically detects CI environments and provides platform-specific annotations for failed tests.

#### Auto-Detection
The framework automatically detects CI environments from environment variables:
- `JENKINS_URL` → Jenkins
- `AZURE_DEVOPS` or `TF_BUILD` → Azure DevOps  
- `GITLAB_CI` → GitLab CI
- `GITHUB_ACTIONS` → GitHub Actions

#### Manual CI Configuration
```bash
# Jenkins annotations
npx cascade-test test/ --ci=jenkins

# Azure DevOps annotations  
npx cascade-test test/ --ci=azure

# GitLab CI annotations
npx cascade-test test/ --ci=gitlab

# GitHub Actions annotations
npx cascade-test test/ --ci=github
```

#### CI-Specific Annotations
When tests fail, the framework outputs platform-specific annotations:

**Jenkins:**
```
##[error]Test failures detected
##[error]Error Handling → should fail with custom error: This test intentionally fails
```

**Azure DevOps:**
```
##vso[task.logissue type=error]Test failures detected
##vso[task.logissue type=error]Error Handling → should fail with custom error: This test intentionally fails
```

**GitLab CI / GitHub Actions:**
```
::error::Test failures detected
::error::Error Handling → should fail with custom error: This test intentionally fails
```

#### CI Platform Setup Examples

**Jenkins Pipeline:**
```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npx cascade-test test/ --reporter=junit --output=test-results.xml'
                junit 'test-results.xml'
            }
        }
    }
}
```

**Azure DevOps Pipeline:**
```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
- script: |
    npm install
    npx cascade-test test/ --reporter=junit --output=test-results.xml --ci=azure
  displayName: 'Run Tests'
- task: PublishTestResults@2
  inputs:
    testResultsFiles: 'test-results.xml'
    testRunTitle: 'Cascade Test Results'
```

**GitLab CI:**
```yaml
test:
  stage: test
  script:
    - npm install
    - npx cascade-test test/ --reporter=junit --output=test-results.xml --ci=gitlab
  artifacts:
    reports:
      junit: test-results.xml
```

**GitHub Actions:**
```yaml
- name: Run Tests
  run: |
    npm install
    npx cascade-test test/ --reporter=junit --output=test-results.xml --ci=github
- name: Publish Test Results
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Cascade Test Results
    path: test-results.xml
    reporter: java-junit
```

### Environment Variables

The framework supports environment variables through standard Node.js `process.env`. You can use dotenv or other environment variable solutions with the CLI runner.

#### Using dotenv-cli (Recommended)

Install dotenv-cli globally and use it with npx:

```bash
# Install dotenv-cli
npm install -g dotenv-cli

# Run tests with .env file
dotenv npx cascade-test test/

# Use specific environment file
dotenv -e .env.test npx cascade-test test/
```

#### `package.json` Scripts

Add scripts to your `package.json` for easy environment management and different reporter configurations:

```json
{
  "scripts": {
    "test": "dotenv npx cascade-test test/",
    "test:ci": "NODE_ENV=test dotenv -e .env.ci npx cascade-test test/ --reporter=junit --output=test-results.xml --ci=auto",
    "test:dev": "NODE_ENV=development API_URL=http://localhost:3000 dotenv -e .env.dev npx cascade-test test/",
    "test:junit": "npx cascade-test test/ --reporter=junit --output=test-results.xml",
    "test:tap": "npx cascade-test test/ --reporter=tap --output=test-results.tap",
    "test:json": "npx cascade-test test/ --reporter=json --output=test-results.json"
  }
}
```

#### Reporter Configuration via Environment Variables

You can also configure reporters using environment variables:

```bash
# Set reporter via environment variable
CASCADE_TEST_REPORTER=junit npx cascade-test test/

# Set output file via environment variable  
CASCADE_TEST_OUTPUT=my-results.xml npx cascade-test test/

# Set CI environment
CASCADE_TEST_CI=jenkins npx cascade-test test/
```

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

## Quick Reference

### Common Commands

```bash
# Run tests with console output
npx cascade-test test/

# Generate JUnit XML for CI
npx cascade-test test/ --reporter=junit --output=test-results.xml

# Run with CI annotations
npx cascade-test test/ --ci=auto

# Use environment variables
CASCADE_TEST_REPORTER=junit npx cascade-test test/
```

### Reporter Formats

| Reporter | Output Format | Best For |
|----------|---------------|----------|
| `console` | Colored terminal output | Development, debugging |
| `junit` | XML format | Jenkins, Azure DevOps, most CI systems |
| `tap` | TAP format | Universal CI support, TAP consumers |
| `json` | Structured JSON | Custom integrations, data processing |

### CI Environment Variables

| Environment Variable | Detected CI |
|---------------------|-------------|
| `JENKINS_URL` | Jenkins |
| `AZURE_DEVOPS` or `TF_BUILD` | Azure DevOps |
| `GITLAB_CI` | GitLab CI |
| `GITHUB_ACTIONS` | GitHub Actions |

## License

MIT

