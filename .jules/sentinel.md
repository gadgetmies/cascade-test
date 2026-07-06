## 2026-07-05 - Path Traversal Protection
**Vulnerability:** Path traversal via CLI arguments (`--output`, `--coverage-dir`) and fixture names. User-supplied paths could resolve outside the intended directory, potentially allowing overwriting or reading sensitive files.
**Learning:** `path.join()` and `path.resolve()` do not prevent directory traversal (e.g., using `..` segments). Explicit validation using `path.relative()` and checking for `..` prefixes is required to ensure the resolved path remains within a designated base directory.
**Prevention:** Use a utility like `isPathSafe(baseDir, targetPath)` to validate all user-supplied file paths before performing file system operations.
