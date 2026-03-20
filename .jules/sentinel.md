## 2026-03-15 - [Path Traversal in Fixture Utilities]
**Vulnerability:** Arbitrary file read and write was possible through the `fixtureName` parameter in `assertFixture`, `createFixture`, and `readFixture`.
**Learning:** `path.join` and `path.resolve` with user-supplied (or test-supplied) paths require validation using `path.relative` to ensure the final path remains within the intended base directory.
**Prevention:** Always validate resolved paths against a base directory using `!path.relative(base, resolved).startsWith('..')`.
