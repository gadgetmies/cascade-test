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
 * Prevents directory traversal and ensures the target is within the base.
 * It also blocks the base directory itself.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedTarget);

    // Unsafe if:
    // 1. It is exactly '..'
    // 2. It starts with '../' or '..\ '
    // 3. It is an absolute path (meaning it resolved outside the base on some systems/edge cases)
    // 4. It is empty (meaning it's the base directory itself)
    const isUnsafe =
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative) ||
      relative === "";

    return !isUnsafe;
  } catch {
    // Fail secure
    return false;
  }
}
