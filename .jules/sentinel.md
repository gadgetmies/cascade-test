## 2026-05-04 - Arbitrary Directory Deletion via Coverage Directory
**Vulnerability:** The CLI runner used `fs.rmSync` on the user-provided `--coverage-dir` without validation, allowing arbitrary directory deletion (e.g., if set to `.` or `..`).
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal. Always validate that user-controlled paths are within the intended boundaries.
**Prevention:** Use a utility like `isPathSafe` that checks `path.relative(base, target)` and blocks empty strings (CWD), `..` (parent), and absolute paths.
