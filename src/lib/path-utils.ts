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
 * Checks if a path is safe (within the base directory)
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedTarget = path.resolve(targetPath);
    const resolvedBase = path.resolve(baseDir);
    const relative = path.relative(resolvedBase, resolvedTarget);
    return (relative === "" || !relative.startsWith("..")) && !path.isAbsolute(relative);
  } catch {
    return false;
  }
}
