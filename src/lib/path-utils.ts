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
 * Checks if a target path is safe (within the base directory)
 * Prevents directory traversal attacks
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, targetPath);
    const relative = path.relative(resolvedBase, resolvedTarget);

    return (
      (relative === "" || !relative.startsWith("..")) &&
      !path.isAbsolute(relative)
    );
  } catch {
    return false;
  }
}
