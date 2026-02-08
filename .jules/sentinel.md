## 2025-05-14 - Insecure Temporary File for IPC
**Vulnerability:** Predictable temporary file in the current working directory used for communicating test results from child processes to the parent process.
**Learning:** Hardcoding a predictable filename like `.cascade-test-results.json` in `process.cwd()` creates a race condition where concurrent test runs collide. It also provides a symlink attack vector, allowing an attacker to overwrite arbitrary files by creating a symlink at that path.
**Prevention:** Use `os.tmpdir()` with a uniquely generated filename (e.g., using `crypto.randomBytes`) for temporary files. Pass the path to child processes via environment variables to ensure they know where to write, and ensure the parent process cleans up the file after reading.
