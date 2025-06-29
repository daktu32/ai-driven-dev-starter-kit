/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/test/e2e'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer)/)',
  ],
  collectCoverageFrom: [
    'scripts/**/*.ts',
    '!scripts/**/*.d.ts',
    '!scripts/node_modules/**',
  ],
  coverageDirectory: 'test/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 60000, // E2Eテストのため60秒に設定
  setupFilesAfterEnv: ['<rootDir>/test/e2e/setup.ts'],
  verbose: true,
  // 大きなファイルでのメモリエラーを防ぐ
  maxWorkers: 1,
  // テスト結果の詳細表示
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test/reports',
      filename: 'e2e-test-report.html',
      expand: true
    }]
  ]
};