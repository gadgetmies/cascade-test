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
 * Validates that a target path is safe and contained within a base directory.
 * Prevents directory traversal and usage of the base directory itself.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedPath = path.resolve(baseDir, targetPath);
  const rel = path.relative(baseDir, resolvedPath);
  return (
    rel !== "" &&
    !rel.startsWith(".." + path.sep) &&
    rel !== ".." &&
    !path.isAbsolute(rel)
  );
}
