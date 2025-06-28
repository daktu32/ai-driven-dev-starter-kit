export default {
  default: {
    requireModule: ['ts-node/register'],
    require: ['test/step-definitions/**/*.ts', 'test/support/**/*.ts'],
    format: [
      'progress-bar',
      'json:test/reports/cucumber-report.json',
      'html:test/reports/cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    dryRun: false,
    failFast: false,
    strict: false,
    parallel: 1
  }
};