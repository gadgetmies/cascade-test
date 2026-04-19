## 2026-04-11 - Path Traversal in Fixture Utilities
**Vulnerability:** Path traversal in `getFixturePath` allowed reading/writing files outside the intended fixtures directory via `assertFixture`, `createFixture`, and `readFixture` when using `..` in fixture names.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal by themselves.
**Prevention:** Use `path.relative(baseDir, resolvedPath)` and check if the result starts with `..` or is an absolute path to ensure it remains within the intended boundary.
