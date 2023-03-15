import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/js-with-babel', // needed to import es module library in ts test files
  resolver: 'jest-ts-webcompat-resolver', // needed to import ts files with js extension in ts test files
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!@joonhocho|util-3gcvv)'], // needed to import es module library in ts test files
};

export default config;
