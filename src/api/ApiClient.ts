import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Config } from "../config/config";
import * as allureReporter from "allure-playwright";
import { Logger } from "../utils/Logger";

/**
 * API Client implementing Repository design pattern for API interactions
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  /**
   * Create a new API client
   * @param baseUrl - The base URL for API calls
   * @param timeout - Request timeout in milliseconds
   */
  constructor(
    baseUrl: string = Config.API_BASE_URL,
    timeout: number = Config.API_TIMEOUT,
  ) {
    this.baseUrl = baseUrl;

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add request interceptor for logging and authentication
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication if needed
        if (Config.API_KEY) {
          config.headers = config.headers || {};
          config.headers["X-API-Key"] = Config.API_KEY;
        }

        // Log request to Allure
        this.logRequestToAllure(config);

        return config;
      },
      (error: any) => {
        // Log error to Allure
        this.logErrorToAllure("Request Error", error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response to Allure
        this.logResponseToAllure(response);
        return response;
      },
      (error: any) => {
        // Log error response to Allure
        this.logErrorToAllure("Response Error", error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set authentication token
   * @param token - The authentication token
   */
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  /**
   * Perform a GET request
   * @param url - The URL path
   * @param params - Query parameters
   * @param config - Additional Axios configuration
   */
  async get<T>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      allureReporter.allure.step(`GET ${url}`, async () => {
        if (params) {
          allureReporter.allure.attachment(
            "Request Params",
            JSON.stringify(params, null, 2),
            "application/json",
          );
        }
      });

      const requestConfig: AxiosRequestConfig = {
        ...config,
        params,
      };

      return this.axiosInstance.get<T>(url, requestConfig);
    } catch (error) {
      this.logErrorToAllure("GET Request Failed", error);
      throw error;
    }
  }

  /**
   * Perform a POST request
   * @param url - The URL path
   * @param data - Request body
   * @param config - Additional Axios configuration
   */
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      allureReporter.allure.step(`POST ${url}`, async () => {
        if (data) {
          allureReporter.allure.attachment(
            "Request Body",
            JSON.stringify(data, null, 2),
            "application/json",
          );
        }
      });

      return this.axiosInstance.post<T>(url, data, config);
    } catch (error) {
      this.logErrorToAllure("POST Request Failed", error);
      throw error;
    }
  }

  /**
   * Perform a PUT request
   * @param url - The URL path
   * @param data - Request body
   * @param config - Additional Axios configuration
   */
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      allureReporter.allure.step(`PUT ${url}`, async () => {
        if (data) {
          allureReporter.allure.attachment(
            "Request Body",
            JSON.stringify(data, null, 2),
            "application/json",
          );
        }
      });

      return this.axiosInstance.put<T>(url, data, config);
    } catch (error) {
      this.logErrorToAllure("PUT Request Failed", error);
      throw error;
    }
  }

  /**
   * Perform a PATCH request
   * @param url - The URL path
   * @param data - Request body
   * @param config - Additional Axios configuration
   */
  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      allureReporter.allure.step(`PATCH ${url}`, async () => {
        if (data) {
          allureReporter.allure.attachment(
            "Request Body",
            JSON.stringify(data, null, 2),
            "application/json",
          );
        }
      });

      return this.axiosInstance.patch<T>(url, data, config);
    } catch (error) {
      this.logErrorToAllure("PATCH Request Failed", error);
      throw error;
    }
  }

  /**
   * Perform a DELETE request
   * @param url - The URL path
   * @param config - Additional Axios configuration
   */
  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      allureReporter.allure.step(`DELETE ${url}`, async () => {});

      return this.axiosInstance.delete<T>(url, config);
    } catch (error) {
      this.logErrorToAllure("DELETE Request Failed", error);
      throw error;
    }
  }

  /**
   * Log request details to Allure
   * @param config - Request configuration
   */
  private logRequestToAllure(config: InternalAxiosRequestConfig): void {
    try {
      const url = `${config.baseURL || ""}${config.url || ""}`;
      const method = config.method?.toUpperCase() || "UNKNOWN";

      allureReporter.allure.step(`API Request: ${method} ${url}`, async () => {
        // Log request headers
        if (config.headers) {
          const headers = { ...config.headers };

          // Sanitize sensitive information from headers
          if (headers.Authorization) {
            headers.Authorization = "Bearer [REDACTED]";
          }
          if (headers["X-API-Key"]) {
            headers["X-API-Key"] = "[REDACTED]";
          }

          allureReporter.allure.attachment(
            "Request Headers",
            JSON.stringify(headers, null, 2),
            "application/json",
          );
        }

        // Log request params
        if (config.params) {
          allureReporter.allure.attachment(
            "Request Params",
            JSON.stringify(config.params, null, 2),
            "application/json",
          );
        }

        // Log request body
        if (config.data) {
          allureReporter.allure.attachment(
            "Request Body",
            JSON.stringify(config.data, null, 2),
            "application/json",
          );
        }
      });

      Logger.info(`API Request: ${method} ${url}`);
    } catch (error) {
      Logger.error(
        "Failed to log request to Allure",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Log response details to Allure
   * @param response - Response object
   */
  private logResponseToAllure(response: AxiosResponse): void {
    try {
      const url = response.config.url || "";
      const method = response.config.method?.toUpperCase() || "UNKNOWN";
      const status = response.status;

      allureReporter.allure.step(
        `API Response: ${method} ${url} (${status})`,
        async () => {
          // Log response headers
          allureReporter.allure.attachment(
            "Response Headers",
            JSON.stringify(response.headers, null, 2),
            "application/json",
          );

          // Log response body
          if (response.data) {
            allureReporter.allure.attachment(
              "Response Body",
              JSON.stringify(response.data, null, 2),
              "application/json",
            );
          }

          // Log response status
          allureReporter.allure.attachment(
            "Response Status",
            `${response.status} ${response.statusText}`,
            "text/plain",
          );
        },
      );

      Logger.info(`API Response: ${method} ${url} (${status})`);
    } catch (error) {
      Logger.error(
        "Failed to log response to Allure",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Log error details to Allure
   * @param title - Error title
   * @param error - Error object
   */
  private logErrorToAllure(title: string, error: any): void {
    try {
      allureReporter.allure.step(title, async () => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          allureReporter.allure.attachment(
            "Error Response",
            JSON.stringify(
              {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers,
              },
              null,
              2,
            ),
            "application/json",
          );
        } else if (error.request) {
          // The request was made but no response was received
          allureReporter.allure.attachment(
            "Error Request",
            error.request.toString(),
            "text/plain",
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          allureReporter.allure.attachment(
            "Error Message",
            error.message || "Unknown error",
            "text/plain",
          );
        }

        if (error.config) {
          allureReporter.allure.attachment(
            "Error Config",
            JSON.stringify(error.config, null, 2),
            "application/json",
          );
        }

        if (error.stack) {
          allureReporter.allure.attachment(
            "Error Stack",
            error.stack,
            "text/plain",
          );
        }
      });

      Logger.error(
        title,
        error instanceof Error ? error : new Error(String(error)),
      );
    } catch (logError) {
      Logger.error(
        "Failed to log error to Allure",
        logError instanceof Error ? logError : new Error(String(logError)),
      );
    }
  }
}
