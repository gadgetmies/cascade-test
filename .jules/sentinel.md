## 2026-07-15 - Directory Traversal Prevention
**Vulnerability:** Path traversal in fixtures and coverage directory CLI parameters.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal; manual validation using `path.relative` is required.
**Prevention:** Implement `isPathSafe` with relative checks and Windows cross-drive absolute path checking.
