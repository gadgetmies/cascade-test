## 2026-05-25 - Path Traversal in CLI and Fixture Utils
**Vulnerability:** CLI options (`--coverage-dir`, `--output`) and fixture resolution logic were vulnerable to directory traversal, allowing reading/writing/deleting files outside the project root.
**Learning:** `path.resolve` and `path.join` do not prevent traversal; they only calculate the target path. Validation using `path.relative` against a base directory is required to ensure safety.
**Prevention:** Use a dedicated `isPathSafe` utility to verify that resolved paths are strictly subdirectories of the intended base and not the base itself.
