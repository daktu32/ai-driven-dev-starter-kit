import chalk from 'chalk';

// Jest setup for E2E tests
beforeAll(() => {
  console.log(chalk.blue('\n🧪 ===== E2E Test Suite Setup ====='));
  console.log(chalk.gray('Environment: Node.js'));
  console.log(chalk.gray('Test Type: End-to-End Scaffold Generation'));
  console.log(chalk.gray('Target: All Project Types (mcp-server, cli-rust, web-nextjs, api-fastapi)'));
  console.log(chalk.blue('=====================================\n'));
});

afterAll(() => {
  console.log(chalk.blue('\n🏁 ===== E2E Test Suite Complete ====='));
  console.log(chalk.gray('All tests finished.'));
  console.log(chalk.blue('=====================================\n'));
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
});