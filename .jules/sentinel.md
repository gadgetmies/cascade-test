## 2026-06-11 - Path Traversal Vulnerability in CLI and Fixtures
**Vulnerability:** Command-line options (`--coverage-dir`, `--output`) and fixture utility functions allowed arbitrary file system access and potential file deletion (e.g., `fs.rmSync` on CWD) via directory traversal patterns like `../../`.
**Learning:** `path.resolve` and `path.join` do not implicitly prevent traversal outside of a target directory. Explicit validation using `path.relative` is necessary to ensure a resolved path remains within a safe boundary.
**Prevention:** Implement and use a utility like `isPathSafe` that resolves both base and target paths, and verifies that the relative path between them does not start with `..` and is not absolute.
