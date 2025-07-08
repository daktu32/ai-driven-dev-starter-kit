/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/e2e'],
  testMatch: [
    'test/e2e/**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  // ESMモジュールのmock設定
  moduleNameMapper: {
    '^chalk$': '<rootDir>/test/__mocks__/chalk.js',
    '^ora$': '<rootDir>/test/__mocks__/ora.js'
  },
  collectCoverageFrom: [
    'scripts/**/*.ts',
    'src/**/*.ts',
    '!scripts/**/*.d.ts',
    '!scripts/node_modules/**',
    '!src/**/*.d.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!test/**',
  ],
  coverageDirectory: 'test/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85
    },
    './scripts/lib/projectVerifier.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
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