## 2026-04-11 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture` and `createFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal. An attacker could provide a `fixtureName` containing `..` sequences to read or write files outside the intended fixtures directory.
**Learning:** `path.join` and `path.resolve` do not prevent directory traversal by themselves if user-controlled input contains `..` segments that resolve to paths outside the base directory.
**Prevention:** Always validate resolved paths using `path.relative(baseDir, resolvedPath)`. Check if the relative path starts with `..` or is absolute to ensure it remains within the intended boundary.
