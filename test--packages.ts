/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import { readdirSync, statSync } from 'fs';
import { createRequire } from 'module'
import { resolve } from 'path';

const require = createRequire(import.meta.url)

const isDirectory = (source: string): boolean => statSync(source).isDirectory();

const getTestFiles = (dir: string, startDir: string = dir): string[] => {
    let filelist: string[] = [];
    const files = readdirSync(dir);

    files.forEach((file: string) => {
        if (isDirectory(`${dir}${file}`)) {
            filelist = [...filelist, ...getTestFiles(`${dir}${file}/`, startDir)];
            return;
        }

        const isNodeModules = /node_modules/.test(dir);
        const isTestFile = /\.test\.[j|t]s$/.test(file);

        if (!isNodeModules && isTestFile) {
            filelist.push(`${dir}${file}`);
        }
    });

    return filelist;
};

const getPackages = (): string[] => {
    const packagesFolder: string = resolve('packages');
    return readdirSync(packagesFolder).map((filename: string) => resolve(packagesFolder, filename)).filter(isDirectory);
};

const describePackage = (packagePath: string): void => {
    const packageJson = resolve(packagePath, 'package.json');
    const { name: packageName } = require(packageJson);

    describe(packageName, () => {
        getTestFiles(`${packagePath}/`).forEach(require);
    });
};

getPackages().forEach(describePackage);
