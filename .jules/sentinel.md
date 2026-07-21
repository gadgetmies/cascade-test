# Sentinel Journal

This journal documents critical security learnings discovered during Sentinel tasks.

## 2026-07-15 - Directory Traversal Prevention in Fixture Utilities
**Vulnerability:** Path traversal attacks in custom fixture handling helper functions.
**Learning:** Using standard `path.join` on dynamic user/test input does not prevent traversal outside the intended directory.
**Prevention:** Always normalize the paths using `path.resolve` and check them against the base directory using `path.relative` to ensure they do not escape (e.g., verifying that the relative path doesn't start with `..` or is absolute).
