## 2026-04-11 - Path Traversal in Coverage Directory Selection
**Vulnerability:** Arbitrary directory clearing/deletion via the `--coverage-dir` option.
**Learning:** The application was using `fs.rmSync(dir, { recursive: true, force: true })` on a user-provided directory path without sufficient validation. This allowed an attacker to specify sensitive directories (like the project root or outside directories) to be cleared.
**Prevention:** Always validate user-provided file paths for destructive operations. Use `path.resolve()` and `path.relative()` to ensure the target path is a safe subdirectory of the intended base directory and not the base directory itself.
