## 2026-04-11 - Path Traversal and Arbitrary Directory Deletion Fixed
**Vulnerability:** Path traversal in `assertFixture` and potential arbitrary directory deletion via `--coverage-dir`.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal by themselves. Validation with `path.relative` is necessary to ensure a path stays within intended boundaries.
**Prevention:** Always validate resolved paths using `path.relative(baseDir, resolvedPath)` and check if it starts with `..` or is absolute.
