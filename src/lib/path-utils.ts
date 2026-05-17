import * as path from 'path';

/**
 * Validates if a target path is a safe subdirectory of a base directory.
 * Returns false if the path is outside the base directory or if it is the base directory itself.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);
    const relative = path.relative(resolvedBase, resolvedPath);

    if (
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative) ||
      relative === ""
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

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
