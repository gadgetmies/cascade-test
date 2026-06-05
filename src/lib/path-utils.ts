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
 * Validates if a target path is safe and stays within a base directory.
 * Prevents path traversal and also prevents the base directory itself from being used.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, targetPath);
    const relative = path.relative(resolvedBase, resolvedTarget);

    return (
      relative !== "" &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative)
    );
  } catch {
    return false;
  }
}
