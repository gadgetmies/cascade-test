# Cascade Test

[![Framework Integration Tests](https://github.com/gadgetmies/cascade-test/actions/workflows/test-framework.yml/badge.svg?branch=main)](https://github.com/gadgetmies/cascade-test/actions/workflows/test-framework.yml)

A test framework where context cascades through your test hierarchy. Plain JavaScript objects with automatic context passing.

## Features

- **Nested Test Suites**: Organize tests hierarchically with setup/teardown at any level
- **Test Suites as Plain Objects**: Easily generate and modify test hierarchies as plain JavaScript objects
- **Zero Global Pollution**: No global magic functions (describe, it, test, etc.)
- **Assertion Library Compatibility**: All assertion libraries that throw errors on assertion failures can be used in the tests.
- **Async Support**: Full support for async/await and Promise-based tests
- **Timeout Management**: Configurable timeouts for individual tests and test groups
- **Test Skipping**: Skip tests conditionally **only** for a duration and with custom reasons
- **File Discovery**: Automatic test file discovery with regex filtering
- **CLI Runner**: Command-line tool for running multiple test files
- **CI Integration**: Native support for Jenkins, Azure DevOps, GitLab CI, and GitHub Actions
- **Multiple Reporters**: JUnit XML, TAP, JSON, and console output formats
- **Auto-Detection**: Automatically detects CI environment and applies appropriate annotations
- **Code Coverage**: Built-in coverage support using c8 with multiple report formats (HTML, LCOV, Cobertura, etc.)

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
    return { db } // Return context for tests
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
    'should return 200': async (context) => {
      // The context is automatically passed down in the hierarchy and thus context.db is available here
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
      until: '2025-12-31' // Skip until end of year
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
        until: '2025-12-31' // Skip until end of year
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
        until: '2024-01-01' // Skip expired in the past
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

#### Test Options
- `path`: Directory to search for test files (required)
- `--regex, -r`: Regex pattern to filter files (default: `/\.(js|ts)$/`)
- `--reporter`: Test reporter to use (`console`, `junit`, `tap`, `json`, `mocha-json`)
- `--output, -o`: Output file for structured reporters
- `--ci`: CI environment for annotations (`jenkins`, `azure`, `gitlab`, `github`, `console`, `auto`)
- `--help, -h`: Show help information

#### Coverage Options
- `--coverage`: Enable code coverage collection (default: `false`)
- `--coverage-dir`: Directory for coverage output (default: `coverage`)
- `--coverage-reporter`: Coverage reporters to use (default: `["text", "html"]`)
  - Available reporters: `text`, `text-summary`, `html`, `lcov`, `json`, `cobertura`
- `--coverage-exclude`: Patterns to exclude from coverage (can be specified multiple times)
- `--coverage-include`: Patterns to include in coverage (can be specified multiple times)
- `--coverage-all`: Include all files in coverage, even uncovered ones (default: `false`)
- `--coverage-skip-full`: Skip files with 100% coverage in reports (default: `false`)

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

### Code Coverage

Cascade Test includes built-in code coverage support using c8 (Node.js native V8 coverage). Coverage is collected during test execution and can be reported in multiple formats.

#### Basic Coverage Usage

```bash
# Enable coverage with default settings (text + html reports)
npx cascade-test test/ --coverage

# View coverage report in browser
open coverage/index.html
```

#### Coverage Options

- `--coverage`: Enable code coverage collection (default: `false`)
- `--coverage-dir`: Directory for coverage output (default: `coverage`)
- `--coverage-reporter`: Coverage reporters to use (default: `["text", "html"]`)
- `--coverage-exclude`: Patterns to exclude from coverage
- `--coverage-include`: Patterns to include in coverage
- `--coverage-all`: Include all files in coverage, even uncovered ones (default: `false`)
- `--coverage-skip-full`: Skip files with 100% coverage in reports (default: `false`)

#### Coverage Reporters

Cascade Test supports all c8/istanbul coverage reporters:

- `text`: Terminal-based text summary (good for CI)
- `text-summary`: Compact text summary
- `html`: Interactive HTML report (great for local development)
- `lcov`: LCOV format (for tools like Coveralls, Codecov)
- `json`: JSON format for custom processing
- `cobertura`: Cobertura XML format (for Azure DevOps, Jenkins)

#### Coverage Examples

```bash
# HTML report for local development
npx cascade-test test/ --coverage --coverage-reporter html

# Multiple reporters
npx cascade-test test/ --coverage --coverage-reporter text --coverage-reporter lcov

# Custom coverage directory
npx cascade-test test/ --coverage --coverage-dir .coverage

# Exclude patterns (test files, node_modules)
npx cascade-test test/ --coverage \
  --coverage-exclude "**/*.test.js" \
  --coverage-exclude "**/*.spec.js" \
  --coverage-exclude "**/node_modules/**"

# Include only specific patterns
npx cascade-test test/ --coverage \
  --coverage-include "src/**/*.js" \
  --coverage-include "lib/**/*.js"

# Include all files (even uncovered)
npx cascade-test test/ --coverage --coverage-all

# Skip files with 100% coverage
npx cascade-test test/ --coverage --coverage-skip-full
```

#### Coverage Configuration File

You can also configure coverage using a `.c8rc.json` file in your project root for more advanced options:

```json
{
  "all": false,
  "include": [
    "src/**/*.ts",
    "src/**/*.js"
  ],
  "exclude": [
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js",
    "**/node_modules/**",
    "**/test/**",
    "**/dist/**",
    "**/*.d.ts"
  ],
  "reporter": [
    "text",
    "html",
    "lcov"
  ],
  "reports-dir": "./coverage",
  "skip-full": false,
  "watermarks": {
    "statements": [50, 80],
    "functions": [50, 80],
    "branches": [50, 80],
    "lines": [50, 80]
  }
}
```

See `.c8rc.json.example` in the repository for a complete example configuration.

#### CI Integration with Coverage

**GitHub Actions with Codecov:**
```yaml
- name: Run Tests with Coverage
  run: npx cascade-test test/ --coverage --coverage-reporter lcov

- name: Upload Coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

**Jenkins with Cobertura:**
```groovy
pipeline {
    agent any
    stages {
        stage('Test with Coverage') {
            steps {
                sh 'npx cascade-test test/ --coverage --coverage-reporter cobertura'
                cobertura coberturaReportFile: 'coverage/cobertura-coverage.xml'
            }
        }
    }
}
```

**Azure DevOps:**
```yaml
- script: npx cascade-test test/ --coverage --coverage-reporter cobertura
  displayName: 'Run Tests with Coverage'

- task: PublishCodeCoverageResults@1
  inputs:
    codeCoverageTool: 'Cobertura'
    summaryFileLocation: 'coverage/cobertura-coverage.xml'
```

**GitLab CI with Coverage Badge:**
```yaml
test:
  stage: test
  script:
    - npx cascade-test test/ --coverage --coverage-reporter text-summary --coverage-reporter lcov
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
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
    "test:json": "npx cascade-test test/ --reporter=json --output=test-results.json",
    "test:coverage": "npx cascade-test test/ --coverage",
    "test:coverage:html": "npx cascade-test test/ --coverage --coverage-reporter html",
    "test:coverage:lcov": "npx cascade-test test/ --coverage --coverage-reporter lcov",
    "test:coverage:ci": "npx cascade-test test/ --coverage --coverage-reporter text --coverage-reporter lcov"
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

# Run tests with code coverage
npx cascade-test test/ --coverage

# Generate JUnit XML for CI
npx cascade-test test/ --reporter=junit --output=test-results.xml

# Run with coverage and CI integration
npx cascade-test test/ --coverage --coverage-reporter lcov --ci=auto

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

