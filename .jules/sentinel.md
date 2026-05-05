## 2026-04-11 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` library was vulnerable to path traversal because it used `path.join` with unsanitized user-provided fixture names, allowing access to files outside the intended fixtures directory.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal by themselves. Using `..` in the input can still resolve to parent directories.
**Prevention:** Always validate resolved paths using `path.relative(baseDir, resolvedPath)`. If the result starts with `..` or is absolute, it indicates the path has escaped the intended boundary.
