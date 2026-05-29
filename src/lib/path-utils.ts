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
 * Prevents directory traversal attacks.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  // Check if the path is outside the base directory
  const isOutside = relative === ".." || relative.startsWith(".." + path.sep);

  // Also check if it's an absolute path that doesn't resolve within the base
  // (though path.relative should handle this, it's safer to be explicit)
  const isAbsoluteUnsafe = path.isAbsolute(targetPath) && !resolvedTarget.startsWith(resolvedBase);

  return !isOutside && !isAbsoluteUnsafe;
}
