## 2026-06-04 - [CRITICAL] Path Traversal in CLI Arguments
**Vulnerability:** The `--coverage-dir` CLI option allowed arbitrary directory deletion because `fs.rmSync` was called on the provided path without validation.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal. A malicious user could provide `../../` or absolute paths to delete sensitive data.
**Prevention:** Always validate user-provided paths against a safe base directory (e.g., CWD) using `path.relative` and checking for `..` prefixes or absolute results.
