## 2025-05-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` library was vulnerable to path traversal. By using `..` in fixture names, a user could read or write files outside the intended `fixtures/` directory.
**Learning:** Standard path joining using `path.join` or `path.resolve` does not automatically restrict access to a specific base directory.
**Prevention:** Always validate resolved paths against the intended base directory using `path.relative` and checking for `..` prefixes or absolute paths.

## 2025-05-15 - XML Injection in JUnit Reporter
**Vulnerability:** The `JUnitReporter` was not escaping test names, class names, and suite names in the generated XML output, allowing for XML injection if test names contained special characters like `<` or `"`.
**Learning:** All user-provided or dynamically generated strings that are inserted into XML or HTML must be properly escaped.
**Prevention:** Use a consistent escaping function (like `escapeXml`) for all attributes and text content in XML output.
