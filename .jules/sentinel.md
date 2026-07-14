## 2026-07-13 - Path Traversal Prevention Pattern
**Vulnerability:** Path traversal in fixture management and CLI arguments (output, coverage).
**Learning:** Implicitly joining paths with `path.join` or `path.resolve` does not prevent a user from using `..` to escape the intended directory.
**Prevention:** Implement a `isPathSafe` utility using `path.relative` to ensure the resolved path remains within the base directory: `!rel.startsWith('..' + path.sep) && rel !== '..'`.
