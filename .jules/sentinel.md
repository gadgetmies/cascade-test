# Sentinel Journal

## 2025-05-15 - Path Traversal in Fixture Loading
**Vulnerability:** The `readFixture` and `assertFixture` utilities were vulnerable to path traversal because they didn't validate that the requested fixture name stayed within the designated fixtures directory.
**Learning:** Utilities that handle file paths based on user-provided strings (even if those "users" are developers) must always validate that the resolved path is within expected boundaries.
**Prevention:** Use `path.relative` to check if a resolved path has escaped the base directory (e.g., checking if it starts with `..`).
