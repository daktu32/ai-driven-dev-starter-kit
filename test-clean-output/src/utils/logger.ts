/**
 * Logger utility for test-clean
 */

export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

class ConsoleLogger implements Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  info(message: string, ...args: any[]): void {
    console.log(`[${this.getTimestamp()}] INFO: ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.getTimestamp()}] ERROR: ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.getTimestamp()}] WARN: ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[${this.getTimestamp()}] DEBUG: ${message}`, ...args);
    }
  }
}

export const logger: Logger = new ConsoleLogger();