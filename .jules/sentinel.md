## 2026-03-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture`, `readFixture`, and `createFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal. An attacker (or a malicious test) could provide a fixture name like `../../../etc/passwd` to read or write files outside the intended `fixtures/` directory.

**Learning:** `path.join` and `path.resolve` alone do not prevent path traversal if the resulting path is not validated against the base directory.

**Prevention:** After resolving a path, use `path.relative(baseDir, resolvedPath)` and check if the result starts with `..` or is an absolute path. This ensures the resolved path is contained within `baseDir`.
