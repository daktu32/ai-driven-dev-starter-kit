// Oraのmock実装
class MockSpinner {
  constructor(options) {
    this.text = typeof options === 'string' ? options : (options?.text || '');
    this.isSpinning = false;
  }

  start(text) {
    if (text) this.text = text;
    this.isSpinning = true;
    console.log(`[SPINNER START] ${this.text}`);
    return this;
  }

  stop() {
    this.isSpinning = false;
    console.log(`[SPINNER STOP] ${this.text}`);
    return this;
  }

  succeed(text) {
    if (text) this.text = text;
    this.isSpinning = false;
    console.log(`[SPINNER SUCCESS] ${this.text}`);
    return this;
  }

  fail(text) {
    if (text) this.text = text;
    this.isSpinning = false;
    console.log(`[SPINNER FAIL] ${this.text}`);
    return this;
  }

  warn(text) {
    if (text) this.text = text;
    this.isSpinning = false;
    console.log(`[SPINNER WARN] ${this.text}`);
    return this;
  }

  info(text) {
    if (text) this.text = text;
    this.isSpinning = false;
    console.log(`[SPINNER INFO] ${this.text}`);
    return this;
  }
}

const ora = (options) => new MockSpinner(options);

module.exports = ora;
module.exports.default = ora;