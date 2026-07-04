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
 * Checks if a target path is safe (remains within the base directory)
 * @param baseDir The base directory that should contain the target path
 * @param targetPath The path to check
 * @returns true if the path is safe and within baseDir
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedPath = path.resolve(baseDir, targetPath);
  const relative = path.relative(baseDir, resolvedPath);

  // Path is outside the base directory if it starts with .. or is absolute
  if (relative.startsWith(".." + path.sep) || relative === ".." || path.isAbsolute(relative)) {
    return false;
  }

  // Reject if it is the base directory itself (relative is empty)
  if (relative === "") {
    return false;
  }

  return true;
}
