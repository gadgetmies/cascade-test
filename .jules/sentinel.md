## 2026-03-15 - [CRITICAL] Fixed arbitrary directory deletion via coverage directory option
**Vulnerability:** The test runner (`src/bin/run-tests.ts`) used `fs.rmSync` on the user-provided `coverage-dir` without validating if the path was within the workspace. This allowed an attacker (or accidental misconfiguration) to delete any directory the process had permissions to, such as `fs.rmSync('/', { recursive: true })`.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal by themselves. They only resolve the path.
**Prevention:** Always validate that a user-provided path for destructive operations (like deletion or writing) is within an expected boundary using `path.relative` and checking if it starts with `..` or is absolute.
