## 2026-07-15 - Directory Traversal Prevention
**Vulnerability:** Unsafe coverage and output paths allowed directory traversal/deletion outside CWD.
**Learning:** Implicit joining and path.resolve do not prevent directory traversal; manual relative check is required.
**Prevention:** Implement `isPathSafe` to validate relative path constraints before fs operations.
