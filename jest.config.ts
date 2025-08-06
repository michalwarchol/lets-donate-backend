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
    '!src/**/*.controller.ts',
    '!src/**/constants/**',
    '!src/**/decorators/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/decorators/',
    '\\.dto\\.ts$',
    '\\.entity\\.ts$',
    '\\.controller\\.ts$',
    'src/data-source.ts$',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
