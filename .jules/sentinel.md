## 2026-03-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture`, `createFixture`, and `readFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal because they directly joined the user-provided `fixtureName` with the fixtures directory using `path.join` without validation. This allowed an attacker (or a malicious test) to read or write files anywhere on the filesystem that the process had access to.

**Learning:** `path.join` and `path.resolve` do not automatically restrict the resulting path to be within a specific directory. Even if a base directory is provided, `..` segments in the input can "break out" of that base.

**Prevention:** To prevent path traversal, always:
1. Block absolute paths if only relative names are expected (using `path.isAbsolute`).
2. Resolve the final path and use `path.relative(baseDir, resolvedPath)` to verify that the result does not start with `..` (which indicates it's outside the base directory).
