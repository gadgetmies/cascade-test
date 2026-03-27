## 2026-03-15 - [Path Traversal in Fixture Loading]
**Vulnerability:** The `readFixture` function allowed reading arbitrary files on the filesystem by passing a path with `../` segments, as it didn't validate if the resolved path was within the intended fixtures directory.
**Learning:** `path.join` and `path.resolve` do not prevent path traversal by themselves. Using `path.relative` to compare the base directory with the resolved path is a robust way to ensure the result stays within the base.
**Prevention:** Always validate that user-provided or dynamically generated paths stay within their intended scope using `path.relative` and check for `..` or absolute results. Explicitly block absolute paths if they are not expected.

## 2026-03-15 - [XML Injection in JUnit Reports]
**Vulnerability:** The `JUnitReporter` only escaped XML in failure messages, but not in other attributes like `testName`, `className`, or the testsuite `name`. This could lead to malformed XML or injection if these strings contained characters like `<` or `"`.
**Learning:** All user-controlled or external data embedded in structured formats like XML must be properly escaped, even if they appear to be "system" values like filenames or test names.
**Prevention:** Use a consistent escaping function for all dynamic content in XML templates.
