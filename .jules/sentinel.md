# Sentinel Journal - Cascade Test

## 2026-03-15 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture` and `createFixture` functions in `fixture-utils.ts` were vulnerable to path traversal. By providing a `fixtureName` with traversal components (e.g., `../../etc/passwd`), an attacker (or a malicious test) could read or write files outside the intended fixtures directory.
**Learning:** `path.join` does not prevent escaping the base directory if the second argument contains `..`. Always validate the resolved path against the base directory using `path.relative` and check if it starts with `..`.
**Prevention:** Implement a helper function to resolve and validate paths, ensuring they remain within the intended boundary. Use `path.isAbsolute` to reject absolute paths if only relative ones are expected.
