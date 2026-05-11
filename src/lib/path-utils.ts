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
 * Checks if a path is safe to use (contained within a base directory and not the base directory itself)
 */
export function isPathSafe(targetPath: string, baseDir: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Check if it's outside the base directory or the base directory itself
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
