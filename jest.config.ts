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
    '!**/config/*',
    '!src/data-source.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/constants/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.dto\\.ts$',
    '\\.entity\\.ts$',
    'src/data-source.ts$',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
