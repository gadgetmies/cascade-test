## 2026-05-23 - [Path Traversal in CLI and Fixture Utils]
**Vulnerability:** CLI options like `--coverage-dir` and fixture names were used in file system operations (like recursive deletion or file reading) without validation, allowing directory traversal.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal on their own. Validation using `path.relative` against a base directory is required.
**Prevention:** Use a centralized `isPathSafe` utility to validate that all user-provided paths remain within the intended boundaries (e.g., CWD or specific fixtures directory) before performing file system operations.
