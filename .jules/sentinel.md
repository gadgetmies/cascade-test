## 2026-03-15 - Path Traversal Vulnerabilities
**Vulnerability:** Path traversal in `assertFixture` and arbitrary directory deletion in test runner.
**Learning:** `path.join` and `path.resolve` can be subverted by using `..` in inputs if not validated with `path.relative`.
**Prevention:** Always validate that the resolved path is within the intended directory by using `path.relative` and checking for `..` or absolute paths.
