## 2026-05-11 - Arbitrary Directory Deletion via Path Traversal in CLI
**Vulnerability:** CLI options like `--coverage-dir` were used in `fs.rmSync` without validation, allowing deletion of arbitrary directories outside the project root via path traversal (e.g., `../target`).
**Learning:** `path.resolve` and `path.join` do not inherently prevent traversal; validation against a base directory using `path.relative` is required.
**Prevention:** Implement a robust `isPathSafe` utility that uses `path.relative` to ensure resolved paths are subdirectories of the intended base and not the base itself.
