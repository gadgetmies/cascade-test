import * as path from 'path';

export function getDisplayTestFile(testFile: string, basePath?: string): string {
  try {
    let actualPath = testFile;
    if (testFile.startsWith('file://')) {
      actualPath = testFile.replace('file://', '');
    }

    const relativeBase = basePath || process.cwd();
    return path.relative(relativeBase, actualPath);
  } catch {
    return testFile;
  }
}

/**
 * Validates if a target path is a safe subdirectory of a base directory.
 * Prevents directory traversal and ensures the target is not the base directory itself.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(baseDir, targetPath);
    const relative = path.relative(resolvedBase, resolvedPath);

    // Block if:
    // 1. It's the same directory (relative is empty)
    // 2. It goes up (starts with ..)
    // 3. It's an absolute path outside the base (path.isAbsolute(relative) is true in some cases)
    if (
      relative === "" ||
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
