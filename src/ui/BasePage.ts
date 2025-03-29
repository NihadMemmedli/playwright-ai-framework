import { Page, Locator, expect } from "@playwright/test";
import { Config } from "../config/config";
import { Logger } from "../utils/Logger";

/**
 * Base Page Object class implementing Page Object Model pattern
 * Provides common functionality for all page objects
 */
export abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  /**
   * Create a new Page Object
   * @param page - Playwright Page object
   * @param path - The URL path for this page, will be appended to base URL
   * @param customUrl - Optional full URL that overrides the base URL + path
   */
  constructor(page: Page, path: string = "", customUrl?: string) {
    this.page = page;
    this.url = customUrl || `${Config.BASE_URL}${path}`;
  }

  /**
   * Navigate to the page
   * @param options - Navigation options
   */
  async goto(options?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  }): Promise<void> {
    Logger.info(`Navigating to: ${this.url}`);
    await this.page.goto(this.url, options);
  }

  /**
   * Wait for the page to be loaded
   * Override in specific page objects to implement page-specific wait logic
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    // Default implementation, should be overridden by specific pages
    Logger.info("Waiting for page load (networkidle)");
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    Logger.debug(`Page title: ${title}`);
    return title;
  }

  /**
   * Check if an element is visible
   * @param locator - Element locator
   * @param timeout - Maximum time to wait for element to be visible
   */
  async isVisible(
    locator: Locator | string,
    timeout?: number,
  ): Promise<boolean> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    try {
      await loc.waitFor({ state: "visible", timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to be visible
   * @param locator - Element locator
   * @param options - Wait options
   */
  async waitForElement(
    locator: Locator | string,
    options?: {
      state?: "attached" | "detached" | "visible" | "hidden";
      timeout?: number;
    },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    await loc.waitFor(options);
  }

  /**
   * Click on an element with retry
   * @param locator - Element locator
   * @param options - Click options
   */
  async clickWithRetry(
    locator: Locator | string,
    options?: {
      force?: boolean;
      timeout?: number;
      noWaitAfter?: boolean;
      maxRetries?: number;
      retryDelay?: number;
    },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const maxRetries = options?.maxRetries || 3;
    const retryDelay = options?.retryDelay || 1000;
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < maxRetries) {
      try {
        if (attempt > 0) {
          Logger.warn(`Retrying click (attempt ${attempt + 1}/${maxRetries})`);
        }

        // Wait for element to be visible before clicking
        await loc.waitFor({ state: "visible", timeout: options?.timeout });
        await loc.click({
          force: options?.force,
          timeout: options?.timeout,
          noWaitAfter: options?.noWaitAfter,
        });
        return; // Success, exit the function
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt < maxRetries) {
          Logger.warn(
            `Click failed, waiting ${retryDelay}ms before retry`,
            error,
          );
          await this.page.waitForTimeout(retryDelay);
        }
      }
    }

    // If we get here, all attempts failed
    Logger.error(`Click failed after ${maxRetries} attempts`, lastError);
    throw lastError;
  }

  /**
   * Click on an element
   * @param locator - Element locator
   * @param options - Click options
   */
  async click(
    locator: Locator | string,
    options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    await loc.click(options);
  }

  /**
   * Fill a form field with retry
   * @param locator - Element locator
   * @param value - Value to fill
   * @param options - Fill options
   */
  async fillWithRetry(
    locator: Locator | string,
    value: string,
    options?: {
      force?: boolean;
      timeout?: number;
      noWaitAfter?: boolean;
      maxRetries?: number;
      retryDelay?: number;
    },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const maxRetries = options?.maxRetries || 3;
    const retryDelay = options?.retryDelay || 1000;
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < maxRetries) {
      try {
        if (attempt > 0) {
          Logger.warn(`Retrying fill (attempt ${attempt + 1}/${maxRetries})`);
        }

        // Wait for element to be visible before filling
        await loc.waitFor({ state: "visible", timeout: options?.timeout });
        await loc.fill(value, {
          force: options?.force,
          timeout: options?.timeout,
          noWaitAfter: options?.noWaitAfter,
        });
        return; // Success, exit the function
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt < maxRetries) {
          Logger.warn(
            `Fill failed, waiting ${retryDelay}ms before retry`,
            error,
          );
          await this.page.waitForTimeout(retryDelay);
        }
      }
    }

    // If we get here, all attempts failed
    Logger.error(`Fill failed after ${maxRetries} attempts`, lastError);
    throw lastError;
  }

  /**
   * Fill a form field
   * @param locator - Element locator
   * @param value - Value to fill
   * @param options - Fill options
   */
  async fill(
    locator: Locator | string,
    value: string,
    options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    await loc.fill(value, options);
  }

  /**
   * Select an option from a dropdown
   * @param locator - Element locator
   * @param value - Value to select
   */
  async selectOption(
    locator: Locator | string,
    value:
      | string
      | string[]
      | { label?: string; value?: string; index?: number }
      | { label?: string; value?: string; index?: number }[],
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    await loc.selectOption(value);
  }

  /**
   * Get text from an element
   * @param locator - Element locator
   */
  async getText(locator: Locator | string): Promise<string> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    return (await loc.textContent()) || "";
  }

  /**
   * Get the attribute value of an element
   * @param locator - Element locator
   * @param attributeName - Name of the attribute
   */
  async getAttribute(
    locator: Locator | string,
    attributeName: string,
  ): Promise<string | null> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    return await loc.getAttribute(attributeName);
  }

  /**
   * Take screenshot of the page
   * @param name - Screenshot name
   */
  async takeScreenshot(name?: string): Promise<Buffer> {
    const path = name ? `./screenshots/${name}.png` : undefined;
    Logger.info(`Taking screenshot${name ? `: ${name}` : ""}`);
    return await this.page.screenshot({
      path,
      fullPage: true,
    });
  }

  /**
   * Press a key on the keyboard
   * @param key - Key to press (e.g., 'Enter', 'Escape')
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for navigation to complete
   * @param options - Navigation options
   */
  async waitForNavigation(options?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  }): Promise<void> {
    await this.page.waitForNavigation(options);
  }

  /**
   * Wait for element to be stable (not moving) in the DOM
   * @param locator - Element locator
   * @param options - Wait options
   */
  async waitForElementToBeStable(
    locator: Locator | string,
    options?: {
      timeout?: number;
      checkInterval?: number;
      maxPositionDifference?: number;
    },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const timeout = options?.timeout || 10000;
    const checkInterval = options?.checkInterval || 500;
    const maxPositionDifference = options?.maxPositionDifference || 3;

    Logger.info(
      `Waiting for element to be stable: ${typeof locator === "string" ? locator : "Locator"}`,
    );

    let previousBox: { x: number; y: number } | null = null;
    let stableCount = 0;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Get the bounding box of the element
        const boundingBox = await loc.boundingBox();

        if (!boundingBox) {
          Logger.warn(
            "Element not visible or not found when checking stability",
          );
          await this.page.waitForTimeout(checkInterval);
          continue;
        }

        const currentPosition = {
          x: Math.round(boundingBox.x),
          y: Math.round(boundingBox.y),
        };

        if (previousBox) {
          const xDiff = Math.abs(currentPosition.x - previousBox.x);
          const yDiff = Math.abs(currentPosition.y - previousBox.y);

          if (
            xDiff <= maxPositionDifference &&
            yDiff <= maxPositionDifference
          ) {
            stableCount++;

            // Consider element stable after 2 consecutive stable checks
            if (stableCount >= 2) {
              Logger.debug("Element is stable");
              return;
            }
          } else {
            // Reset the stable count if the element moved
            stableCount = 0;
            Logger.debug(`Element moved: x diff=${xDiff}, y diff=${yDiff}`);
          }
        }

        previousBox = currentPosition;
        await this.page.waitForTimeout(checkInterval);
      } catch (error) {
        Logger.warn("Error checking element stability", error);
        await this.page.waitForTimeout(checkInterval);
      }
    }

    // If we get here, the timeout was reached
    Logger.warn(`Timeout waiting for element to be stable after ${timeout}ms`);
  }

  /**
   * Expect element to be visible
   * @param locator - Element locator
   * @param options - Visibility options
   */
  async expectToBeVisible(
    locator: Locator | string,
    options?: { timeout?: number },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const timeout = options?.timeout || 5000;

    try {
      await expect(loc).toBeVisible({ timeout });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Element not visible: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Expect element to have specific text
   * @param locator - Element locator
   * @param text - Expected text (exact match or regex)
   * @param options - Assertion options
   */
  async expectToHaveText(
    locator: Locator | string,
    text: string | RegExp,
    options?: { timeout?: number; useInnerText?: boolean },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const timeout = options?.timeout || 5000;

    try {
      if (options?.useInnerText) {
        await expect(loc).toHaveText(text, { timeout });
      } else {
        await expect(loc).toContainText(text, { timeout });
      }
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Text assertion failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Expect element to be enabled
   * @param locator - Element locator
   * @param options - Assertion options
   */
  async expectToBeEnabled(
    locator: Locator | string,
    options?: { timeout?: number },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const timeout = options?.timeout || 5000;

    try {
      await expect(loc).toBeEnabled({ timeout });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Element not enabled: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Expect element to be disabled
   * @param locator - Element locator
   * @param options - Assertion options
   */
  async expectToBeDisabled(
    locator: Locator | string,
    options?: { timeout?: number },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const timeout = options?.timeout || 5000;

    try {
      await expect(loc).toBeDisabled({ timeout });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Element not disabled: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Expect element to have attribute with specific value
   * @param locator - Element locator
   * @param attribute - Attribute name
   * @param value - Expected attribute value
   * @param options - Assertion options
   */
  async expectToHaveAttribute(
    locator: Locator | string,
    attribute: string,
    value: string | RegExp,
    options?: { timeout?: number },
  ): Promise<void> {
    const loc =
      typeof locator === "string" ? this.page.locator(locator) : locator;
    const timeout = options?.timeout || 5000;

    try {
      await expect(loc).toHaveAttribute(attribute, value, { timeout });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Attribute assertion failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Expect page URL to match a pattern
   * @param urlPattern - Expected URL pattern (string or regex)
   * @param options - Assertion options
   */
  async expectPageUrlToMatch(
    urlPattern: string | RegExp,
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout || 5000;

    try {
      await expect(this.page).toHaveURL(urlPattern, { timeout });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(
          `URL assertion failed: ${error.message}, current URL: ${this.page.url()}`,
        );
      }
      throw error;
    }
  }

  /**
   * Expect page to have a specific title
   * @param titlePattern - Expected title pattern (string or regex)
   * @param options - Assertion options
   */
  async expectPageToHaveTitle(
    titlePattern: string | RegExp,
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout || 5000;

    try {
      await expect(this.page).toHaveTitle(titlePattern, { timeout });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Title assertion failed: ${error.message}`);
      }
      throw error;
    }
  }
}
