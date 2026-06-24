import * as path from 'path';

export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  if (path.isAbsolute(relative)) {
    return false;
  }

  return (
    relative === "" ||
    (!relative.startsWith(".." + path.sep) && relative !== "..")
  );
}

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
