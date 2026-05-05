## 2026-04-24 - [Fixture Path Traversal Prevention]
**Vulnerability:** Path traversal in `fixture-utils.ts` allowed reading and writing files outside the intended fixtures directory via `assertFixture`, `createFixture`, and `readFixture`.
**Learning:** `path.join` does not prevent directory traversal if one of the components contains `..`.
**Prevention:** Always resolve the final path and use `path.relative` to verify it remains within the expected base directory.
