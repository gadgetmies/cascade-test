## 2026-06-15 - Path Traversal in CLI and Fixtures
**Vulnerability:** The CLI runner and fixture utility allowed unsanitized file paths, enabling directory traversal via `--output`, `--coverage-dir`, and `fixtureName`.
**Learning:** `path.resolve` and `path.join` do not prevent traversal; manual validation using `path.relative` to ensure a target remains within a base boundary is necessary.
**Prevention:** Use a centralized `isPathSafe` utility for all user-controlled file operations and explicitly block using the CWD as a target for destructive operations like coverage cleanup.
