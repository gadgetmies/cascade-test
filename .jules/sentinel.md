# Sentinel Journal

## 2025-05-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture`, `createFixture`, and `readFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal. An attacker could provide a `fixtureName` like `../../../../etc/passwd` to read or overwrite arbitrary files on the system, depending on the process permissions.
**Learning:** Utilities that handle file paths based on user-provided strings (even if those "users" are developers writing tests) must always validate that the resolved path remains within an expected boundary. In this case, the `fixturesDir` (defaulting to `fixtures/`) was the intended boundary.
**Prevention:** Use `path.resolve()` to get an absolute path, then use `path.relative()` to check if the path escapes the base directory. If the relative path starts with `..` or is an absolute path itself (which shouldn't happen with `path.relative` if both are absolute), it indicates an attempt to access a location outside the boundary.
