## 2025-10-01 - Arbitrary Directory Deletion via CLI Arguments
**Vulnerability:** The `--coverage-dir` CLI option was used directly in `fs.rmSync(..., { recursive: true, force: true })` without validation. An attacker could specify critical directories like `.` or `..` or absolute paths to cause arbitrary directory deletion when the test runner is executed.
**Learning:** CLI arguments that lead to file system operations (especially destructive ones like `rm`) must be validated against a safe base directory (e.g., `process.cwd()`).
**Prevention:** Always use `path.resolve` and `path.relative` to verify that a user-provided path remains within the intended scope.

## 2025-10-01 - XML Injection in JUnit Reporter
**Vulnerability:** Test names, class names, and suite names were inserted directly into the JUnit XML output without escaping. Malicious test names could inject arbitrary XML elements or attributes.
**Learning:** Any dynamic content included in structured formats like XML or HTML must be properly escaped using context-aware functions.
**Prevention:** Use a dedicated `escapeXml` helper for all dynamic strings in the `JUnitReporter` and similar reporters.
