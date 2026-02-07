# Sentinel's Journal

## 2025-05-15 - Insecure Temporary File Pattern
**Vulnerability:** Use of a hardcoded, predictable filename (`.cascade-test-results.json`) in the current working directory for inter-process communication.
**Learning:** This pattern is vulnerable to symlink attacks and race conditions in shared environments. In a test framework, users often run tests in directories they have write access to, making the project root a common target.
**Prevention:** Always use `os.tmpdir()` combined with unique, randomized filenames for temporary files. Communicate these paths to child processes via environment variables rather than relying on hardcoded relative paths.
