## 2025-10-01 - Path Traversal in Fixture Loading
**Vulnerability:** Path traversal via `fixtureName` parameter in `assertFixture` and `readFixture` allowed reading/writing files outside the intended fixtures directory.
**Learning:** Using `path.join` with user-controlled input can lead to traversal. Even in a test framework, input from tests can be malicious or accidentally dangerous.
**Prevention:** Use `path.resolve` followed by `path.relative` to verify that the final path is still within the expected base directory.

## 2025-10-01 - XML Injection in JUnit Reporter
**Vulnerability:** Test names and class names were inserted directly into XML attributes without escaping, allowing malformed XML or attribute injection.
**Learning:** XML reporters must escape all dynamic content, not just error messages. Attribute injection can break CI/CD pipelines that parse these files.
**Prevention:** Use a dedicated `escapeXml` utility for all data inserted into XML templates.
