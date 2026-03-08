## 2025-10-01 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` allowed reading/writing files outside the fixtures directory via `fixtureName` parameter (e.g., `../../package.json`).
**Learning:** Utilities that map dynamic input to the filesystem must validate that the resolved path stays within a trusted boundary.
**Prevention:** Use `path.relative` to ensure the resolved path does not start with `..`.

## 2025-10-01 - XML Injection and TAP Integrity
**Vulnerability:** `JUnitReporter` did not escape XML special characters in test/suite names, and `TAPReporter` allowed newlines in test names and unindented error messages.
**Learning:** Reporters often handle user-controlled strings (test names, error messages) that can be used to inject malicious content into CI output formats.
**Prevention:** Always escape XML in JUnit reports and sanitize/format TAP output to maintain protocol integrity.
