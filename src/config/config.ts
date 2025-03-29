import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration class for managing test environment settings.
 * Uses environment variables and provides defaults when not set.
 */
export class Config {
  // API Configuration
  static readonly API_BASE_URL: string =
    process.env.API_BASE_URL || "https://jsonplaceholder.typicode.com";
  static readonly API_TIMEOUT: number = parseInt(
    process.env.API_TIMEOUT || "30000",
    10,
  );
  static readonly API_KEY: string = process.env.API_KEY || "";
  static readonly API_MAX_RETRY: number = parseInt(
    process.env.API_MAX_RETRY || "3",
    10,
  );
  static readonly API_RETRY_DELAY: number = parseInt(
    process.env.API_RETRY_DELAY || "1000",
    10,
  );

  // UI Configuration
  static readonly BASE_URL: string =
    process.env.BASE_URL || "https://demo.playwright.dev/todomvc";
  static readonly HEADLESS: boolean =
    process.env.HEADLESS?.toLowerCase() === "true";
  static readonly DEFAULT_TIMEOUT: number = parseInt(
    process.env.DEFAULT_TIMEOUT || "30000",
    10,
  );
  static readonly SLOWMO: number = parseInt(process.env.SLOWMO || "0", 10);
  static readonly UI_MAX_RETRY: number = parseInt(
    process.env.UI_MAX_RETRY || "3",
    10,
  );
  static readonly UI_RETRY_DELAY: number = parseInt(
    process.env.UI_RETRY_DELAY || "1000",
    10,
  );
  static readonly VIEWPORT_WIDTH: number = parseInt(
    process.env.VIEWPORT_WIDTH || "1280",
    10,
  );
  static readonly VIEWPORT_HEIGHT: number = parseInt(
    process.env.VIEWPORT_HEIGHT || "720",
    10,
  );

  // Test Configuration
  static readonly TEST_ENV: string = process.env.TEST_ENV || "dev";
  static readonly TEST_USER: string =
    process.env.TEST_USER || "test@example.com";
  static readonly TEST_PASSWORD: string =
    process.env.TEST_PASSWORD || "Password123";
  static readonly RETRY_COUNT: number = parseInt(
    process.env.RETRY_COUNT || "2",
    10,
  );

  // Performance Metrics
  static readonly PERF_CPU_THROTTLE: number = parseInt(
    process.env.PERF_CPU_THROTTLE || "4",
    10,
  );
  static readonly PERF_NETWORK_THROTTLE: string =
    process.env.PERF_NETWORK_THROTTLE || "Fast 3G";
  static readonly PERF_MAX_RESPONSE_TIME: number = parseInt(
    process.env.PERF_MAX_RESPONSE_TIME || "5000",
    10,
  );
  static readonly PERF_MAX_FIRST_PAINT: number = parseInt(
    process.env.PERF_MAX_FIRST_PAINT || "2000",
    10,
  );
  static readonly PERF_MAX_DOM_CONTENT_LOADED: number = parseInt(
    process.env.PERF_MAX_DOM_CONTENT_LOADED || "3000",
    10,
  );

   // AI / Ollama Configuration
   static readonly ollamaBaseUrl: string =
     process.env.OLLAMA_BASE_URL || "http://localhost:11434/api"; // Default Ollama API base URL (includes /api)
   static readonly ollamaDefaultModel: string =
     process.env.OLLAMA_DEFAULT_MODEL || "llama3:latest"; // Default model for general tasks
  static readonly ollamaVisualModel: string =
    process.env.OLLAMA_VISUAL_MODEL || "llava:latest"; // Default model for visual tasks

  // AI Service Selection
  static readonly aiServiceMode: "local" | "google" =
    (process.env.AI_SERVICE_MODE?.toLowerCase() as "local" | "google") || "local";

  // Google AI Configuration (if AI_SERVICE_MODE=google)
  static readonly googleApiKey: string = process.env.GOOGLE_API_KEY || "";
  static readonly googleGeminiModel: string =
    process.env.GOOGLE_GEMINI_MODEL || "gemini-pro";

  // Reporting
  static readonly ALLURE_RESULTS_DIR: string =
    process.env.ALLURE_RESULTS_DIR || "allure-results";
  static readonly SCREENSHOT_DIR: string =
    process.env.SCREENSHOT_DIR || "screenshots";
  static readonly VIDEO_DIR: string = process.env.VIDEO_DIR || "videos";
  static readonly TRACE_DIR: string = process.env.TRACE_DIR || "traces";

  /**
   * Check if we're running in CI environment
   */
  static get isCI(): boolean {
    return !!process.env.CI;
  }

  /**
   * Get configuration for specific test environment
   */
  static getEnvConfig(): Record<string, any> {
    const envConfigs: Record<string, Record<string, any>> = {
      dev: {
        apiUrl: "https://jsonplaceholder.typicode.com",
        baseUrl: "https://github.com",
      },
      staging: {
        apiUrl: "https://jsonplaceholder.typicode.com",
        baseUrl: "https://github.com",
      },
      prod: {
        apiUrl: "https://jsonplaceholder.typicode.com",
        baseUrl: "https://github.com",
      },
    };

    return envConfigs[this.TEST_ENV] || envConfigs.dev;
  }

  /**
   * Get paths for test data and fixtures
   */
  static getDataPath(dataFile?: string): string {
    const basePath = path.resolve(process.cwd(), "test-data");
    return dataFile ? path.join(basePath, dataFile) : basePath;
  }

  /**
   * Get path to test data fixtures
   */
  static getFixturesPath(fixtureFile?: string): string {
    const basePath = path.resolve(__dirname, "../../src/fixtures");
    return fixtureFile ? path.join(basePath, fixtureFile) : basePath;
  }

  /**
   * Get screenshot path
   */
  static getScreenshotPath(screenshotName?: string): string {
    const basePath = path.resolve(process.cwd(), this.SCREENSHOT_DIR);
    return screenshotName
      ? path.join(basePath, `${screenshotName}.png`)
      : basePath;
  }
}

export default Config;
