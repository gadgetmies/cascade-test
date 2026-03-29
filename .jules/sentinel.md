## 2026-03-15 - [CRITICAL] Fix path traversal in fixture-utils

**Vulnerability:** The `assertFixture`, `createFixture`, and `readFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal. An attacker (or a malicious test case) could provide a `fixtureName` with directory traversal sequences (like `../../../`) to read, write, or overwrite arbitrary files on the system that the Node.js process has access to.

**Learning:** Path joining utilities like `path.join` and `path.resolve` do not automatically prevent directory traversal. Even when joining with a base directory, the resulting path can point outside that directory if the input contains traversal sequences. Validation using `path.relative` is necessary to ensure the resolved path remains within the expected boundaries. Additionally, absolute paths should be explicitly blocked if the intention is to only allow paths within a specific directory.

**Prevention:** Always validate resolved file paths using `path.relative(baseDir, resolvedPath)`. If the result starts with `..` or is an absolute path (on some systems), it indicates a path outside the intended directory. Use strict input validation to block absolute paths when only relative paths are expected.
