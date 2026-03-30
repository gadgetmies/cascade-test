import * as fs from 'fs';
import * as path from 'path';
import { minimatch } from 'minimatch';
import { FileUtils } from '../types';

export const runnableTestFileAllowlist = /\.(js|ts)$/;

export function filterTestPathsByBasenameRegex(
  paths: string[],
  regex: RegExp
): string[] {
  return paths.filter((p) => regex.test(path.basename(p)));
}

export function filterTestPathsByBasenameGlob(
  paths: string[],
  globPattern: string
): string[] {
  return paths.filter((p) =>
    minimatch(path.basename(p), globPattern, {
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