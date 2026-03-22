## 2026-03-15 - Fix Path Traversal in Fixture Utilities
**Vulnerability:** The `getFixturePath` function in `src/lib/fixture-utils.ts` was vulnerable to path traversal. An attacker could provide a `fixtureName` containing `../` sequences (e.g., `../../../package.json`) or an absolute path, allowing them to read or write files outside the intended `fixtures/` directory when `UPDATE_FIXTURES` was enabled.
**Learning:** Functions that join user-provided names with a base directory should always validate that the final resolved path is still within that base directory. `path.join` and `path.resolve` do not prevent traversal by default.
**Prevention:** Use `path.isAbsolute()` to block absolute paths and `path.relative(base, resolved)` to ensure the result doesn't start with `..`.
