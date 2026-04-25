## 2026-04-25 - Fix Path Traversal in Fixture Utilities
**Vulnerability:** Path traversal in `assertFixture`, `createFixture`, and `readFixture` allowed accessing files outside the intended fixtures directory.
**Learning:** Using `path.join` with user-provided or caller-provided filenames is insecure as segments like `..` can escape the base directory. `path.resolve` and `path.relative` are necessary to validate the final destination.
**Prevention:** Always resolve the final path and verify it starts with the expected base directory using `path.relative`.
