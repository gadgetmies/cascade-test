# Code Coverage Implementation

This document describes the code coverage implementation added to cascade-test.

## Overview

Cascade-test now includes built-in code coverage support using c8 (Node.js native V8 coverage). This provides accurate coverage tracking without requiring instrumentation.

The project includes a GitHub Actions workflow that automatically generates and uploads coverage reports to Codecov. A coverage badge is displayed in the README showing the current coverage percentage.

## Implementation Details

### Dependencies
- **c8** (v10.1.2): Native V8 coverage tool for Node.js

### Files Created

1. **.github/workflows/coverage.yml**
   - GitHub Actions workflow for automated coverage reporting
   - Runs on push to main and pull requests
   - Uploads coverage to Codecov
   - Uses the `test:coverage:ci` npm script

2. **.c8rc.json.example**
   - Example configuration file for advanced c8 options

3. **COVERAGE.md**
   - This documentation file

### Files Modified

1. **README.md**
   - Added Codecov badge to display current coverage
   - Added comprehensive coverage documentation

2. **package.json**
   - Added c8 as a dependency
   - Added coverage-related npm scripts:
     - `test:coverage`: Run tests with default coverage
     - `test:coverage:html`: Generate HTML coverage report
     - `test:coverage:lcov`: Generate LCOV coverage report
     - `test:coverage:ci`: Generate text + LCOV reports for CI

2. **src/types.ts**
   - Added `CoverageReporterType` type
   - Added `CoverageConfig` interface with all coverage options
   - Extended `TestConfig` to include optional `coverage` property

3. **src/index.ts**
   - Exported `CoverageConfig` and `CoverageReporterType` types

4. **src/bin/run-tests.ts**
   - Added `CoverageOptions` interface
   - Modified `runTest()` to set `NODE_V8_COVERAGE` environment variable when coverage is enabled
   - Added `processCoverage()` function to invoke c8 report generation
   - Modified `main()` to:
     - Initialize coverage directory
     - Process coverage data after test completion (both success and failure)
   - Added CLI options for coverage:
     - `--coverage`: Enable coverage collection
     - `--coverage-dir`: Coverage output directory
     - `--coverage-reporter`: Coverage reporters (can specify multiple)
     - `--coverage-exclude`: Patterns to exclude
     - `--coverage-include`: Patterns to include
     - `--coverage-all`: Include all files
     - `--coverage-skip-full`: Skip fully covered files

5. **.gitignore**
   - Added `coverage/` directory
   - Added `.nyc_output/` directory

6. **README.md**
   - Added Codecov badge to display current coverage percentage
   - Added comprehensive coverage documentation
   - Added feature list entry for code coverage
   - Added CLI options documentation
   - Added coverage examples
   - Added CI integration examples for:
     - GitHub Actions with Codecov
     - Jenkins with Cobertura
     - Azure DevOps
     - GitLab CI
   - Added package.json scripts examples
   - Updated Quick Reference section

7. **.c8rc.json.example**
   - Created example configuration file for advanced c8 options

## Features

### Coverage Reporters

Supports all c8/istanbul coverage reporters:
- **text**: Terminal-based text summary
- **text-summary**: Compact text summary
- **html**: Interactive HTML report
- **lcov**: LCOV format (for Coveralls, Codecov)
- **json**: JSON format for custom processing
- **cobertura**: Cobertura XML format (for Azure DevOps, Jenkins)

### Coverage Options

- Enable/disable coverage collection
- Custom output directory
- Multiple simultaneous reporters
- Include/exclude patterns for fine-grained control
- Option to include all files (even uncovered)
- Option to skip fully covered files from reports
- Watermark configuration via .c8rc.json

## Usage Examples

### Basic Usage
```bash
# Enable coverage with default settings (text + html)
npx cascade-test test/ --coverage

# View HTML report
open coverage/index.html
```

### Custom Reporters
```bash
# Single reporter
npx cascade-test test/ --coverage --coverage-reporter lcov

# Multiple reporters
npx cascade-test test/ --coverage --coverage-reporter text --coverage-reporter html --coverage-reporter lcov
```

### Pattern Filtering
```bash
# Exclude test files
npx cascade-test test/ --coverage \
  --coverage-exclude "**/*.test.js" \
  --coverage-exclude "**/*.spec.js"

# Include only specific directories
npx cascade-test test/ --coverage \
  --coverage-include "src/**/*.js" \
  --coverage-include "lib/**/*.js"
```

### CI Integration
```bash
# Generate coverage for CI with LCOV format
npx cascade-test test/ --coverage --coverage-reporter lcov

# Combined text and LCOV for CI visibility and upload
npx cascade-test test/ --coverage --coverage-reporter text --coverage-reporter lcov
```

## GitHub Actions Integration

The project includes a GitHub Actions workflow (`.github/workflows/coverage.yml`) that automatically:
1. Runs tests with coverage on every push to main and pull requests
2. Generates LCOV coverage reports
3. Uploads coverage data to Codecov
4. Updates the coverage badge in the README

### Setting Up Codecov

To enable Codecov integration:

1. Sign up at [codecov.io](https://codecov.io) with your GitHub account
2. Add your repository to Codecov
3. Copy your Codecov token
4. Add it as a repository secret named `CODECOV_TOKEN` in GitHub:
   - Go to your repository settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token
   - Click "Add secret"

The workflow will automatically run on the next push, and the coverage badge will display your project's coverage percentage.

### Workflow Configuration

The coverage workflow uses the `test:coverage:ci` npm script which:
- Runs all tests with coverage enabled
- Generates both text (for CI logs) and LCOV (for upload) reports
- Places reports in the `coverage/` directory

You can customize the workflow by editing `.github/workflows/coverage.yml`.

## Advanced Configuration

Create a `.c8rc.json` file in your project root for advanced configuration:

```json
{
  "all": false,
  "include": ["src/**/*.ts", "src/**/*.js"],
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**",
    "**/test/**"
  ],
  "reporter": ["text", "html", "lcov"],
  "reports-dir": "./coverage",
  "watermarks": {
    "statements": [50, 80],
    "functions": [50, 80],
    "branches": [50, 80],
    "lines": [50, 80]
  }
}
```

## Technical Implementation Notes

1. **V8 Coverage**: Uses Node.js native V8 coverage via `NODE_V8_COVERAGE` environment variable
2. **Process Isolation**: Each test file runs in a forked process with coverage enabled
3. **Post-Processing**: After all tests complete, c8 processes the raw V8 coverage data
4. **Report Generation**: c8 is invoked programmatically to generate reports in specified formats
5. **Coverage on Failure**: Coverage reports are generated even when tests fail, ensuring visibility

## Limitations

- Coverage collection adds some overhead to test execution
- Source maps are required for accurate TypeScript coverage
- Very large codebases may generate large coverage data files

## Future Enhancements

Possible future improvements:
- Coverage thresholds with enforcement
- Per-directory or per-file coverage reports
- Coverage badges generation
- Integration with online coverage services
- Differential coverage (only changed files)
