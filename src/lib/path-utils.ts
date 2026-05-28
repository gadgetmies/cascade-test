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
 * Prevents directory traversal and operations on the base directory itself.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(baseDir, targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Block paths that go outside baseDir or are absolute
    if (relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
