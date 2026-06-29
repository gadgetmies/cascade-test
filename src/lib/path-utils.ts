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
 * Checks if a path is safe to use (within the base directory and not the base directory itself)
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedPath = path.resolve(baseDir, targetPath);
  const relative = path.relative(baseDir, resolvedPath);

  return (
    relative !== "" &&
    !relative.startsWith(".." + path.sep) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}
