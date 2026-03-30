import * as fs from 'fs';
import * as path from 'path';
import { minimatch } from 'minimatch';
import { FileUtils } from '../types';

export const runnableTestFileAllowlist =
  /^(?!.*\.(d\.ts|js\.map)$).*\.(js|ts)$/;

export function testFileBasenameStem(basename: string): string {
  if (basename.endsWith('.d.ts')) {
    return basename.slice(0, -'.d.ts'.length);
  }
  if (basename.endsWith('.js')) {
    return basename.slice(0, -'.js'.length);
  }
  if (basename.endsWith('.ts')) {
    return basename.slice(0, -'.ts'.length);
  }
  return basename;
}

export function filterTestPathsByStemRegex(
  paths: string[],
  stemRegex: RegExp
): string[] {
  return paths.filter((p) =>
    stemRegex.test(testFileBasenameStem(path.basename(p)))
  );
}

export function normalizeGlobPatternForStemMatch(pattern: string): string {
  if (pattern.endsWith('.d.ts')) {
    return pattern.slice(0, -'.d.ts'.length);
  }
  if (pattern.endsWith('.js')) {
    return pattern.slice(0, -'.js'.length);
  }
  if (pattern.endsWith('.ts')) {
    return pattern.slice(0, -'.ts'.length);
  }
  return pattern;
}

export function filterTestPathsByStemGlob(
  paths: string[],
  globPattern: string
): string[] {
  const normalized = normalizeGlobPatternForStemMatch(globPattern);
  return paths.filter((p) =>
    minimatch(testFileBasenameStem(path.basename(p)), normalized, {
      dot: true,
    })
  );
}

const recursivelyFindByRegex = (
  base: string, 
  regex: RegExp, 
  files?: string[], 
  result?: string[]
): string[] => {
  files = files || fs.readdirSync(base);
  result = result || [];

  files.forEach((file: string) => {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recursivelyFindByRegex(newbase, regex, fs.readdirSync(newbase), result);
    } else {
      if (file.match(regex)) {
        result!.push(newbase);
      }
    }
  });
  return result;
};

const fileUtils: FileUtils = {
  recursivelyFindByRegex
};

export { recursivelyFindByRegex };
export default fileUtils;