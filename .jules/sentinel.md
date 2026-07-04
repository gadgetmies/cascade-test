## 2026-07-04 - Path Traversal Prevention
**Vulnerability:** The test runner CLI and fixture utilities allowed arbitrary path traversal, potentially leading to unauthorized file deletion (via coverage cleanup) or reading/writing of sensitive files outside the intended directories.
**Learning:** `path.join` and `path.resolve` do not implicitly prevent traversal; manual validation using `path.relative` is necessary to ensure paths remain confined to a base directory.
**Prevention:** Use a centralized `isPathSafe` utility for all user-controlled path inputs to verify they resolve within an expected base directory.
