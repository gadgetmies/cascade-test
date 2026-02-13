# Sentinel Journal

## 2025-05-14 - Path Traversal in Fixture Utilities
**Vulnerability:** The `readFixture`, `createFixture`, and `assertFixture` functions were vulnerable to path traversal. A malicious test or an attacker who can control the `fixtureName` parameter could read or write files outside the intended fixtures directory.

**Learning:** Using `path.join` with user-controlled input can lead to path traversal if the input contains `..` sequences. Even if the base directory is trusted, the final resolved path can point anywhere on the filesystem.

**Prevention:** Always resolve the final path and verify that it starts with the expected base directory. Using `path.relative` and checking if the result starts with `..` or is absolute is a reliable way to ensure the path remains within the intended boundaries.
