import fs from "fs";
import path from "path";
import { Logger } from "./Logger";

// We need to install these dependencies
// npm install csv-parse yaml @types/node

/**
 * Utility class for data-driven testing
 * Provides methods to load test data from various sources
 */
export class DataProvider {
  /**
   * Load JSON test data from a file
   * @param filePath - Path to the JSON file
   * @returns Parsed JSON data
   */
  static loadJsonData<T>(filePath: string): T {
    try {
      Logger.info(`Loading JSON data from ${filePath}`);
      const absolutePath = path.resolve(process.cwd(), filePath);
      const rawData = fs.readFileSync(absolutePath, "utf8");
      return JSON.parse(rawData) as T;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(
        `Failed to load JSON data from ${filePath}`,
        error instanceof Error ? error : new Error(errorMessage),
      );
      throw new Error(`Failed to load JSON data: ${errorMessage}`);
    }
  }

  /**
   * Load CSV test data from a file
   * @param filePath - Path to the CSV file
   * @param options - CSV parse options
   * @returns Array of objects representing the CSV data
   */
  static loadCsvData<T>(
    filePath: string,
    options?: {
      columns?: boolean | string[] | ((...args: any[]) => string[]);
      delimiter?: string;
    },
  ): T[] {
    try {
      Logger.info(`Loading CSV data from ${filePath}`);
      const absolutePath = path.resolve(process.cwd(), filePath);
      const rawData = fs.readFileSync(absolutePath, "utf8");

      // Dynamic import to avoid dependency issues
      // You need to install csv-parse: npm install csv-parse
      const { parse } = require("csv-parse/sync");

      const parseOptions = {
        columns: options?.columns ?? true,
        delimiter: options?.delimiter ?? ",",
        skipEmptyLines: true,
        cast: true,
      };

      return parse(rawData, parseOptions) as T[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(
        `Failed to load CSV data from ${filePath}`,
        error instanceof Error ? error : new Error(errorMessage),
      );
      throw new Error(`Failed to load CSV data: ${errorMessage}`);
    }
  }

  /**
   * Load YAML test data from a file
   * @param filePath - Path to the YAML file
   * @returns Parsed YAML data
   */
  static loadYamlData<T>(filePath: string): T {
    try {
      Logger.info(`Loading YAML data from ${filePath}`);
      const absolutePath = path.resolve(process.cwd(), filePath);
      const rawData = fs.readFileSync(absolutePath, "utf8");

      // Dynamic import to avoid dependency issues
      // You need to install yaml: npm install yaml
      const YAML = require("yaml");

      return YAML.parse(rawData) as T;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(
        `Failed to load YAML data from ${filePath}`,
        error instanceof Error ? error : new Error(errorMessage),
      );
      throw new Error(`Failed to load YAML data: ${errorMessage}`);
    }
  }

  /**
   * Load test data from environment variables
   * @param prefix - Optional prefix to filter environment variables
   * @returns Object containing environment variables
   */
  static loadEnvData(prefix?: string): Record<string, string> {
    try {
      Logger.info(
        `Loading environment variables${prefix ? ` with prefix '${prefix}'` : ""}`,
      );
      const envData: Record<string, string> = {};

      Object.entries(process.env).forEach(([key, value]) => {
        if (!prefix || key.startsWith(prefix)) {
          const newKey = prefix ? key.replace(prefix, "") : key;
          if (value !== undefined) {
            envData[newKey] = value;
          }
        }
      });

      return envData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(
        `Failed to load environment variables`,
        error instanceof Error ? error : new Error(errorMessage),
      );
      throw new Error(`Failed to load environment variables: ${errorMessage}`);
    }
  }

  /**
   * Generate a test data matrix for parametrized tests
   * @param params - Parameters for the test matrix
   * @returns Array of test data combinations
   *
   * @example
   * const testData = DataProvider.generateTestMatrix({
   *   browser: ['chrome', 'firefox'],
   *   viewport: ['desktop', 'mobile']
   * });
   * // Result: [
   * //   { browser: 'chrome', viewport: 'desktop' },
   * //   { browser: 'chrome', viewport: 'mobile' },
   * //   { browser: 'firefox', viewport: 'desktop' },
   * //   { browser: 'firefox', viewport: 'mobile' }
   * // ]
   */
  static generateTestMatrix<T extends Record<string, any[]>>(
    params: T,
  ): Array<{ [K in keyof T]: T[K][number] }> {
    try {
      Logger.info("Generating test data matrix");
      const keys = Object.keys(params) as (keyof T)[];
      const combinations: Array<{ [K in keyof T]: T[K][number] }> = [];

      function generateCombination(
        index: number,
        current: Partial<{ [K in keyof T]: T[K][number] }>,
      ): void {
        if (index === keys.length) {
          combinations.push(current as { [K in keyof T]: T[K][number] });
          return;
        }

        const key = keys[index];
        const values = params[key];

        for (const value of values) {
          generateCombination(index + 1, {
            ...current,
            [key]: value,
          });
        }
      }

      generateCombination(0, {});
      Logger.info(`Generated ${combinations.length} test combinations`);
      return combinations;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(
        `Failed to generate test matrix`,
        error instanceof Error ? error : new Error(errorMessage),
      );
      throw new Error(`Failed to generate test matrix: ${errorMessage}`);
    }
  }
}
