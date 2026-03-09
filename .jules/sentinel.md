# Sentinel Security Journal

## 2025-10-01 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture`, `createFixture`, and `readFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal. An attacker could provide a `fixtureName` like `../../../etc/passwd` (or a path to a sensitive local file) to read or overwrite files outside the intended `fixtures` directory, especially when `UPDATE_FIXTURES=true` was set.

**Learning:** Path joining (`path.join`) alone does not prevent escaping the base directory. Using `path.relative` from the base directory to the resolved path and checking if it starts with `..` is a reliable way to detect and block path traversal attempts.

**Prevention:** Always validate that resolved file paths remain within their intended root directory. In TypeScript/Node.js, use `path.relative(root, resolved)` and check `relative.startsWith('..')`.
