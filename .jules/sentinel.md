## 2026-03-15 - [CRITICAL] Fix Path Traversal in fixture utilities
**Vulnerability:** Path traversal in `getFixturePath` allowing access to files outside the intended fixtures directory.
**Learning:** `path.join` alone is not sufficient to prevent path traversal when user-provided input contains `..` or is an absolute path.
**Prevention:** Use `path.resolve` followed by `path.relative` to verify that the resolved path is a descendant of the expected base directory.
