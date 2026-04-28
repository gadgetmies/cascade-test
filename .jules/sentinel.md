## 2026-04-28 - [CRITICAL] Arbitrary Directory Deletion via --coverage-dir
**Vulnerability:** The test runner cleared the coverage directory using `fs.rmSync(dir, { recursive: true })` without validating the path. A user could provide `--coverage-dir` pointing to any directory (e.g., `.`, `/`, or a parent directory), causing catastrophic data loss.
**Learning:** Never perform recursive deletions on user-provided paths without strict validation that the path is within an expected boundary (e.g., a subdirectory of CWD) and is not the boundary itself.
**Prevention:** Use a robust path validation utility (like `isPathSafe`) that resolves paths and checks their relationship using `path.relative` to ensure they stay within intended limits.
