import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/main.ts',
    '!**/migrations/**',
    '!**/*.module.ts',
    '!**/config/*'
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
