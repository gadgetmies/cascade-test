# Sentinel's Journal

## 2026-03-28 - Path Traversal in Fixture Utilities
**Vulnerability:** The `getFixturePath` function in `fixture-utils.ts` was joining a base directory with a user-provided fixture name without validating if the name contained traversal sequences (e.g., `../`).
**Learning:** Utilities that map logical names to file system paths are common targets for traversal if they don't explicitly validate that the resolved path stays within the intended root. In this codebase, the use of `path.join` on a dynamic `fixtureName` allowed creating or reading files anywhere the process had permissions.
**Prevention:** Always use `path.isAbsolute()` to block absolute paths and `path.relative()` to verify that the resolved path is still a child of the intended base directory.

## 2026-03-28 - Arbitrary Directory Deletion in CLI
**Vulnerability:** The `run-tests.ts` script uses `fs.rmSync` on a user-provided `--coverage-dir` without validation.
**Learning:** CLI arguments that specify directories for deletion/cleanup must be strictly validated to ensure they are within the project boundaries and are not critical system directories.
**Prevention:** Resolve the target directory and use `path.relative(process.cwd(), resolvedDir)` to ensure it is a sub-path of the current working directory before performing destructive operations.
