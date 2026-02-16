## 2026-02-16 - [Path Traversal in Fixture Utilities]
**Vulnerability:** Path traversal vulnerability in `readFixture` and `createFixture` functions. The framework allowed reading or writing files outside the intended `fixtures` directory by using relative path sequences like `../../` or absolute paths.

**Learning:** Using `path.join` with user-provided paths without validation is dangerous. Even if the path is joined to a base directory, relative segments can escape it. Absolute paths passed as the second argument to `path.join` might also be problematic depending on the OS, but more importantly, `path.resolve` with an absolute path as the second argument completely ignores the first argument.

**Prevention:** Always validate resolved paths against the intended base directory using `path.relative`. Check if the relative path starts with `..` or is absolute to ensure it stays within the boundary.
