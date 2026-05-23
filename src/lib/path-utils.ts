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
 * Checks if a target path is a safe subdirectory of a base directory.
 * It prevents directory traversal and also ensures the target is NOT the base directory itself.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, targetPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  return (
    relative !== "" &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}
