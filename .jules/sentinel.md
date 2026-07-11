## 2026-07-10 - Path Traversal in Test Runner and Fixture Utils
**Vulnerability:** Path traversal via user-provided strings in CLI arguments (`--coverage-dir`, `--output`) and `fixtureName` in `assertFixture`.
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal. Validation using `path.relative` is necessary to ensure resolved paths remain within an intended base directory. Specifically, `!rel.startsWith('..' + path.sep) && rel !== '..'` checks are robust.
**Prevention:** Always validate user-controlled path segments against a trusted base directory using a utility like `isPathSafe`.
