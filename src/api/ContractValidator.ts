import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { AxiosResponse } from "axios";
import { Logger } from "../utils/Logger";

// We need to install these dependencies
// npm install ajv ajv-formats

/**
 * Utility class for API contract validation
 * Uses JSON Schema to validate API responses
 */
export class ContractValidator {
  private static ajv = ContractValidator.setupAjv();

  /**
   * Setup Ajv validator instance
   */
  private static setupAjv(): Ajv {
    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });

    // Add string formats like email, date-time, etc.
    addFormats(ajv);

    return ajv;
  }

  /**
   * Validate an API response against a JSON schema
   * @param response - Axios response object
   * @param schema - JSON schema to validate against
   * @returns Validation result with any errors
   */
  static validateResponse<T>(
    response: AxiosResponse<T>,
    schema: object,
  ): { valid: boolean; errors: any[] } {
    try {
      Logger.info("Validating API response against schema");

      // Compile schema
      const validate = this.ajv.compile(schema);

      // Validate response data against schema
      const valid = validate(response.data);

      if (!valid) {
        Logger.warn("API response validation failed", validate.errors);
        return { valid: false, errors: validate.errors || [] };
      }

      Logger.info("API response validation passed");
      return { valid: true, errors: [] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(
        "Error validating API response",
        error instanceof Error ? error : new Error(errorMessage),
      );
      return { valid: false, errors: [{ message: errorMessage }] };
    }
  }

  /**
   * Validate API response status code
   * @param response - Axios response object
   * @param expectedStatus - Expected HTTP status code or array of allowed codes
   * @returns Validation result
   */
  static validateStatus(
    response: AxiosResponse,
    expectedStatus: number | number[],
  ): boolean {
    const allowedStatuses = Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus];
    const isValid = allowedStatuses.includes(response.status);

    if (!isValid) {
      Logger.warn(
        `Expected status ${JSON.stringify(allowedStatuses)}, got ${response.status}`,
      );
    } else {
      Logger.debug(`Status validation passed: ${response.status}`);
    }

    return isValid;
  }

  /**
   * Validate response headers
   * @param response - Axios response object
   * @param expectedHeaders - Map of header names to expected values (string or RegExp)
   * @returns Validation result with any errors
   */
  static validateHeaders(
    response: AxiosResponse,
    expectedHeaders: Record<string, string | RegExp>,
  ): {
    valid: boolean;
    errors: {
      header: string;
      expected: string | RegExp;
      actual: string | undefined;
    }[];
  } {
    const errors: {
      header: string;
      expected: string | RegExp;
      actual: string | undefined;
    }[] = [];

    for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
      const actualValue = response.headers[header.toLowerCase()];
      let isValid = false;

      if (expectedValue instanceof RegExp) {
        isValid = actualValue !== undefined && expectedValue.test(actualValue);
      } else {
        isValid = actualValue === expectedValue;
      }

      if (!isValid) {
        Logger.warn(
          `Header validation failed for ${header}. Expected: ${expectedValue}, Actual: ${actualValue}`,
        );
        errors.push({ header, expected: expectedValue, actual: actualValue });
      }
    }

    const valid = errors.length === 0;
    if (valid) {
      Logger.debug("Headers validation passed");
    }

    return { valid, errors };
  }

  /**
   * Validate response time
   * @param startTime - Request start time in milliseconds
   * @param endTime - Request end time in milliseconds
   * @param maxDuration - Maximum allowed duration in milliseconds
   * @returns Whether the response time is within limits
   */
  static validateResponseTime(
    startTime: number,
    endTime: number,
    maxDuration: number,
  ): boolean {
    const duration = endTime - startTime;
    const isValid = duration <= maxDuration;

    if (!isValid) {
      Logger.warn(
        `Response time validation failed. Expected <= ${maxDuration}ms, Actual: ${duration}ms`,
      );
    } else {
      Logger.debug(`Response time validation passed: ${duration}ms`);
    }

    return isValid;
  }

  /**
   * Validate a complete API contract (status, headers, schema, response time)
   * @param response - Axios response object
   * @param options - Validation options
   * @returns Validation result
   */
  static validateContract<T>(
    response: AxiosResponse<T>,
    options: {
      schema?: object;
      expectedStatus?: number | number[];
      expectedHeaders?: Record<string, string | RegExp>;
      responseTime?: { start: number; end: number; maxDuration: number };
    },
  ): {
    valid: boolean;
    statusValid?: boolean;
    headersValid?: boolean;
    schemaValid?: boolean;
    responseTimeValid?: boolean;
    errors: {
      schemaErrors?: any[];
      headerErrors?: {
        header: string;
        expected: string | RegExp;
        actual: string | undefined;
      }[];
    };
  } {
    const result = {
      valid: true,
      errors: {},
    } as any;

    // Validate status if provided
    if (options.expectedStatus) {
      result.statusValid = this.validateStatus(
        response,
        options.expectedStatus,
      );
      result.valid = result.valid && result.statusValid;
    }

    // Validate headers if provided
    if (options.expectedHeaders) {
      const headersResult = this.validateHeaders(
        response,
        options.expectedHeaders,
      );
      result.headersValid = headersResult.valid;
      if (!headersResult.valid) {
        result.errors.headerErrors = headersResult.errors;
      }
      result.valid = result.valid && result.headersValid;
    }

    // Validate schema if provided
    if (options.schema) {
      const schemaResult = this.validateResponse(response, options.schema);
      result.schemaValid = schemaResult.valid;
      if (!schemaResult.valid) {
        result.errors.schemaErrors = schemaResult.errors;
      }
      result.valid = result.valid && result.schemaValid;
    }

    // Validate response time if provided
    if (options.responseTime) {
      const { start, end, maxDuration } = options.responseTime;
      result.responseTimeValid = this.validateResponseTime(
        start,
        end,
        maxDuration,
      );
      result.valid = result.valid && result.responseTimeValid;
    }

    return result;
  }
}
