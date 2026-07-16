## 2026-07-16 - Path Traversal Vulnerabilities in CLI and Fixtures
**Vulnerability:** User-provided paths via CLI arguments (`--output`, `--coverage-dir`) and fixture names were not validated, allowing directory traversal attacks.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal; manual validation using `path.relative` is required to ensure the resolved path remains within the intended base directory.
**Prevention:** Implement an `isPathSafe` utility using `path.relative` and use it to validate all user-provided file system paths early in the execution flow.
