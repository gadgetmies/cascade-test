## 2026-03-15 - [CRITICAL] Fix arbitrary directory deletion via coverage-dir

**Vulnerability:** The test runner used `fs.rmSync(config.coverage.directory, { recursive: true, force: true })` on the user-provided coverage directory without validation. This allowed an attacker (or a misconfigured CI) to delete arbitrary directories outside the project, including root-level system directories if run with sufficient privileges.

**Learning:** Trusting user-provided paths for destructive operations like `rmSync` or `unlink` is dangerous. Even if the intent is to "clean up" a directory, the path must be constrained.

**Prevention:** Always validate that destructive operations are performed within a safe, expected boundary. Use `path.resolve()` to get the absolute path and `path.relative()` to ensure the target is a subdirectory of the current working directory and not the CWD itself.

## 2026-03-15 - [HIGH] Fix XML Injection in JUnitReporter

**Vulnerability:** The `JUnitReporter` was not escaping XML-special characters (like `"` or `<`) in the `name` and `classname` attributes of the `<testcase>` tag. This allowed malicious test names to inject arbitrary XML attributes or tags into the generated JUnit report.

**Learning:** Any data coming from the test suite (like test names) must be treated as untrusted input when generating structured output like XML or HTML, even if it's "just a test name".

**Prevention:** Ensure all dynamic data inserted into XML attributes or text nodes is properly escaped using a utility like `escapeXml`.
