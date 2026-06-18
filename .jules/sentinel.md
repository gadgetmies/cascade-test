
## 2025-05-14 - Path Traversal in Fixture Utilities
**Vulnerability:** The fixture utility functions (`readFixture`, `createFixture`, `assertFixture`) were vulnerable to path traversal because they didn't validate that the provided fixture name stayed within the designated fixtures directory. A malicious test could read or overwrite arbitrary files on the system.
**Learning:** Using `path.join` with user-controlled (or even test-controlled) input can lead to path traversal if not validated. `path.resolve` followed by `path.relative` is a reliable way to ensure a path stays within a target directory.
**Prevention:** Always validate that resolved file paths are within the expected base directory. Added a check in `getFixturePath` that throws an "Access denied" error if traversal is detected.
