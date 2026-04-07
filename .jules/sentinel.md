## 2026-03-15 - [CRITICAL] Arbitrary Directory Deletion via Coverage Directory
**Vulnerability:** The test runner (`src/bin/run-tests.ts`) allowed users to specify a `--coverage-dir` which was then recursively deleted using `fs.rmSync` without any path validation.
**Learning:** `path.join` and `path.resolve` alone do not prevent directory traversal if the resulting path is used in destructive operations.
**Prevention:** Always validate that destructive file operations are restricted to intended directories using `path.relative(process.cwd(), resolvedPath)` and checking for `..` or absolute paths, as well as ensuring it's not the workspace itself.
