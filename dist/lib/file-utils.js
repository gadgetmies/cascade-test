import * as fs from 'fs';
import * as path from 'path';
const recursivelyFindByRegex = (base, regex, files, result) => {
    files = files || fs.readdirSync(base);
    result = result || [];
    files.forEach((file) => {
        const newbase = path.join(base, file);
        if (fs.statSync(newbase).isDirectory()) {
            result = recursivelyFindByRegex(newbase, regex, fs.readdirSync(newbase), result);
        }
        else {
            if (file.match(regex)) {
                result.push(newbase);
            }
        }
    });
    return result;
};
const fileUtils = {
    recursivelyFindByRegex
};
export { recursivelyFindByRegex };
export default fileUtils;
//# sourceMappingURL=file-utils.js.map