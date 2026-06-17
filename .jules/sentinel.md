## 2025-05-15 - XML Injection in JUnitReporter
**Vulnerability:** Test metadata (names, file paths) were directly interpolated into XML attributes in `JUnitReporter` without escaping, allowing for XML injection if test names contained special characters like `"` or `<`.
**Learning:** Even internal metadata like test names can be a vector for injection if it's eventually rendered in a format like XML or HTML, especially when those reports are consumed by CI/CD systems or dashboards.
**Prevention:** Always escape all dynamic content when generating structured output (XML, JSON, HTML). Use specialized libraries or built-in escaping functions for all attributes and text nodes.

## 2025-05-15 - Path Traversal in Fixture Utilities
**Vulnerability:** `readFixture` and `createFixture` used `path.join` with user-provided fixture names, allowing access to any file on the system via `..` segments (e.g., `readFixture('../../../etc/passwd')`).
**Learning:** Any utility that takes a file name and combines it with a base directory is a potential path traversal risk.
**Prevention:** Validate that the resolved absolute path of the requested file is still within the intended base directory using `path.relative` or similar checks.
