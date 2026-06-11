## 2026-06-11 - Path Traversal in Test Runner CLI
**Vulnerability:** Command-line options `--coverage-dir` and `--output` allowed arbitrary directory deletion and file writing via path traversal (e.g., `--coverage-dir ../outside`).
**Learning:** `path.resolve` and `path.join` do not prevent escaping the intended base directory. Validation using `path.relative` and checking for `..` or absolute paths is necessary.
**Prevention:** Use a dedicated `isPathSafe` utility to validate all user-provided file paths against a safe base directory (usually the CWD) before performing file system operations.
