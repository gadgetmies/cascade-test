## 2025-10-01 - Path Traversal Prevention in Coverage Output
**Vulnerability:** Arbitrary directory deletion through unsanitized `--coverage-dir` input. The test runner would `fs.rmSync(config.coverage.directory, { recursive: true, force: true })` before creating the directory, allowing it to delete any folder the process had permissions for.
**Learning:** Even internal tooling or CLI arguments can be vectors for path traversal if they involve destructive file operations.
**Prevention:** Use `path.resolve` and `path.relative` to validate that user-provided paths are within an expected safe boundary (e.g., the current working directory) before performing destructive operations.

## 2025-10-01 - JUnit XML Injection
**Vulnerability:** Improperly escaped test names, suite names, and class names in JUnit XML reports.
**Learning:** Any reporter that generates structured output like XML or HTML MUST escape all user-provided data, including test descriptions and error messages, to prevent injection or malformed reports.
**Prevention:** Consistently apply an `escapeXml` (or equivalent) utility to all data fields inserted into structured reports.
