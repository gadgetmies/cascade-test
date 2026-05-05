## 2026-03-15 - [CRITICAL] Directory Traversal Vulnerability in Test Runner
**Vulnerability:** The test runner `src/bin/run-tests.ts` would recursively delete any directory specified in the `--coverage-dir` option before starting a test run. A malicious user or CI configuration could provide a path like `../../` to delete arbitrary directories outside the repository.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal by themselves. Using `fs.rmSync` with user-supplied paths without validation is extremely dangerous.
**Prevention:** Always validate that resolved paths are within an intended boundary (e.g., the current working directory) using `path.relative` and checking for `..` prefixes before performing destructive operations.
