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

export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  const resolvedPath = path.resolve(baseDir, targetPath);
  const relative = path.relative(baseDir, resolvedPath);
  return (relative === "" || !relative.startsWith("..")) && !path.isAbsolute(relative);
}
