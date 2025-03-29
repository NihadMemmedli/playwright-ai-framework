/**
 * Logger utility for standardized logging across the framework
 */
export class Logger {
  private static readonly LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  private static logLevel = Logger.LOG_LEVELS.INFO;

  /**
   * Set the log level
   * @param level - The log level to set
   */
  static setLogLevel(level: "DEBUG" | "INFO" | "WARN" | "ERROR"): void {
    this.logLevel = this.LOG_LEVELS[level];
  }

  /**
   * Log a debug message
   * @param message - The message to log
   * @param data - Optional data to log
   */
  static debug(message: string, data?: any): void {
    if (this.logLevel <= this.LOG_LEVELS.DEBUG) {
      console.debug(
        `[DEBUG] ${this.timestamp()}: ${message}`,
        data !== undefined ? data : "",
      );
    }
  }

  /**
   * Log an info message
   * @param message - The message to log
   * @param data - Optional data to log
   */
  static info(message: string, data?: any): void {
    if (this.logLevel <= this.LOG_LEVELS.INFO) {
      console.log(
        `[INFO] ${this.timestamp()}: ${message}`,
        data !== undefined ? data : "",
      );
    }
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param data - Optional data to log
   */
  static warn(message: string, data?: any): void {
    if (this.logLevel <= this.LOG_LEVELS.WARN) {
      console.warn(
        `[WARN] ${this.timestamp()}: ${message}`,
        data !== undefined ? data : "",
      );
    }
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param error - Optional error to log
   */
  static error(message: string, error?: Error): void {
    if (this.logLevel <= this.LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${this.timestamp()}: ${message}`, error || "");
    }
  }

  /**
   * Log a step in a test
   * @param step - The step number
   * @param description - The step description
   */
  static step(step: number, description: string): void {
    this.info(`Step ${step}: ${description}`);
  }

  /**
   * Log the start of a test
   * @param testName - The test name
   */
  static testStart(testName: string): void {
    this.info(`========== TEST START: ${testName} ==========`);
  }

  /**
   * Log the end of a test
   * @param testName - The test name
   * @param status - The test status
   */
  static testEnd(
    testName: string,
    status: "PASSED" | "FAILED" | "SKIPPED",
  ): void {
    this.info(`========== TEST END: ${testName} (${status}) ==========`);
  }

  /**
   * Get a timestamp string
   */
  private static timestamp(): string {
    return new Date().toISOString();
  }
}
