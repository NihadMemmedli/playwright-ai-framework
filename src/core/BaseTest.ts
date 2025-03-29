import { test as base, Page, TestFixture } from "@playwright/test";
import { ApiClient } from "../api/ApiClient";
import { TodoPage } from "../ui/pages/TodoPage";
import { Config } from "../config/config";
import { Logger } from "../utils/Logger";

/**
 * Extended test fixtures
 */
type CustomFixtures = {
  apiClient: ApiClient;
  todoPage: TodoPage;
  beforeEach: void;
  afterEach: void;
};

/**
 * Base test fixture that provides common functionality for all tests
 */
export const test = base.extend<CustomFixtures>({
  /**
   * API client fixture available to all tests
   */
  apiClient: async ({}, use) => {
    Logger.info("Setting up API client fixture");
    const client = new ApiClient();
    await use(client);
    Logger.info("Tearing down API client fixture");
  },

  /**
   * TodoPage fixture available to all UI tests
   */
  todoPage: async ({ page }, use) => {
    Logger.info("Setting up TodoPage fixture");
    const todoPage = new TodoPage(page);
    await page.goto(todoPage.url);
    await use(todoPage);
    Logger.info("Tearing down TodoPage fixture");
  },

  /**
   * Setup executed before each test
   */
  beforeEach: [
    async ({ page }, use) => {
      Logger.info("Running global beforeEach hook");

      // Set viewport size
      await page.setViewportSize({
        width: Config.VIEWPORT_WIDTH,
        height: Config.VIEWPORT_HEIGHT,
      });

      // Clear cookies and localStorage if needed
      await page.context().clearCookies();

      // Any other global setup can go here

      await use();
      Logger.info("Finished global beforeEach hook");
    },
    { auto: true },
  ],

  /**
   * Teardown executed after each test
   */
  afterEach: [
    async ({ page }, use) => {
      await use();
      Logger.info("Running global afterEach hook");

      // Perform any cleanup needed after each test

      Logger.info("Finished global afterEach hook");
    },
    { auto: true },
  ],
});
