## 2026-02-09 - [Path Traversal in Fixtures and Insecure Temp Files]
**Vulnerability:** Path traversal in `fixture-utils.ts` allowed reading/writing files outside the fixtures directory. Insecure temporary files in the current working directory were predictable and prone to race conditions.
**Learning:** Using `path.join` with user-provided or dynamic input without validation is dangerous. Predictable file paths in shared or world-writable directories are a security risk.
**Prevention:** Always validate resolved paths using `path.relative`. Use `os.tmpdir()` and unique identifiers (like `crypto.randomBytes`) for temporary files.
