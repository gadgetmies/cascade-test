## 2026-07-07 - Path Traversal Prevention in CLI and Fixtures
**Vulnerability:** Path traversal via `--output`, `--coverage-dir` CLI arguments and `fixtureName` in fixture utilities allowed arbitrary file read/write/deletion outside the intended directories.
**Learning:** Functions like `path.join` and `path.resolve` do not prevent directory traversal (e.g., `path.join('dir', '..')` resolves to `.`). Explicit validation using `path.relative` to ensure the resolved path remains under the base directory is required.
**Prevention:** Use a centralized `isPathSafe(baseDir, targetPath)` utility that checks if the relative path between base and target starts with `..` or is empty (to prevent operations on the base directory itself).
