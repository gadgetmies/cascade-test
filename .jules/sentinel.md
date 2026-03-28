# Sentinel's Journal

## 2026-03-28 - Path Traversal in Fixture Utilities
**Vulnerability:** The `getFixturePath` function in `fixture-utils.ts` was joining a base directory with a user-provided fixture name without validating if the name contained traversal sequences (e.g., `../`).
**Learning:** Utilities that map logical names to file system paths are common targets for traversal if they don't explicitly validate that the resolved path stays within the intended root. In this codebase, the use of `path.join` on a dynamic `fixtureName` allowed creating or reading files anywhere the process had permissions.
**Prevention:** Always use `path.isAbsolute()` to block absolute paths and `path.relative()` to verify that the resolved path is still a child of the intended base directory.
