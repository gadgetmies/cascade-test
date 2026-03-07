# Sentinel Security Journal

This journal tracks critical security learnings and vulnerability patterns found in the cascade-test codebase.

## 2025-05-15 - Initial Journal Setup
**Vulnerability:** N/A
**Learning:** Initializing the security journal to track future findings.
**Prevention:** N/A

## 2026-03-07 - Path Traversal in Fixture Utilities
**Vulnerability:** Path traversal in `readFixture`, `createFixture`, and `assertFixture`.
**Learning:** Using `path.join` with user-supplied input (fixture names) without validation allowed accessing files outside the intended `fixtures` directory.
**Prevention:** Always validate that the resolved path is a subdirectory of the intended base directory using `path.relative` and checking for `..` prefix.
