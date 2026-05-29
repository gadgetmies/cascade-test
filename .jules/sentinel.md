
## 2025-10-01 - Path Traversal in CLI Options
**Vulnerability:** The test runner used `fs.rmSync` on the `--coverage-dir` path without validation, allowing arbitrary directory deletion. Similarly, `--output` allowed arbitrary file writes.
**Learning:** CLI options that accept file paths must be validated against a base directory (like CWD) before performing file system operations, especially destructive ones like cleanup.
**Prevention:** Use a utility like `isPathSafe` that utilizes `path.relative` to ensure the resolved target path remains within the intended base directory.
