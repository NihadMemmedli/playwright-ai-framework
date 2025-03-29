import { Page, Locator } from "@playwright/test";

/**
 * Helper methods for working with DOM elements in UI tests
 */
export class ElementHelper {
  /**
   * Wait for an element to be visible and stable
   * @param locator - Playwright locator
   * @param timeout - Timeout in milliseconds
   */
  static async waitForElementToBeStable(
    locator: Locator,
    timeout = 10000,
  ): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });

    // Wait for any animations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Check if an element is visible
   * @param locator - Playwright locator
   */
  static async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Check if an element exists in the DOM
   * @param page - Playwright page
   * @param selector - CSS selector
   */
  static async isElementExists(page: Page, selector: string): Promise<boolean> {
    const elements = await page.$$(selector);
    return elements.length > 0;
  }

  /**
   * Get the text content of multiple elements
   * @param locator - Playwright locator
   */
  static async getTextArray(locator: Locator): Promise<string[]> {
    return await locator.evaluateAll((elements: Element[]) =>
      elements.map((el) => el.textContent?.trim() || ""),
    );
  }

  /**
   * Get the value of an input element
   * @param locator - Playwright locator
   */
  static async getInputValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  /**
   * Get element count
   * @param locator - Playwright locator
   */
  static async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Check if an element has a specific class
   * @param locator - Playwright locator
   * @param className - Class name to check
   */
  static async hasClass(locator: Locator, className: string): Promise<boolean> {
    const classAttribute = await locator.getAttribute("class");
    if (!classAttribute) return false;

    const classes = classAttribute.split(" ");
    return classes.includes(className);
  }

  /**
   * Check if an element has a specific attribute
   * @param locator - Playwright locator
   * @param attributeName - Attribute name to check
   */
  static async hasAttribute(
    locator: Locator,
    attributeName: string,
  ): Promise<boolean> {
    const attribute = await locator.getAttribute(attributeName);
    return attribute !== null;
  }

  /**
   * Get the value of a specific attribute
   * @param locator - Playwright locator
   * @param attributeName - Attribute name
   */
  static async getAttribute(
    locator: Locator,
    attributeName: string,
  ): Promise<string | null> {
    return await locator.getAttribute(attributeName);
  }

  /**
   * Scroll element into view
   * @param locator - Playwright locator
   */
  static async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element to be clickable and click it
   * @param locator - Playwright locator
   * @param timeout - Timeout in milliseconds
   */
  static async safeClick(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
  }

  /**
   * Drag and drop an element to a target
   * @param source - Source locator
   * @param target - Target locator
   */
  static async dragAndDrop(source: Locator, target: Locator): Promise<void> {
    await source.dragTo(target);
  }

  /**
   * Type text with a delay between keypresses
   * @param locator - Playwright locator
   * @param text - Text to type
   * @param delay - Delay between keypresses in milliseconds
   */
  static async typeWithDelay(
    locator: Locator,
    text: string,
    delay = 100,
  ): Promise<void> {
    await locator.focus();
    await locator.clear();
    await locator.type(text, { delay });
  }

  /**
   * Get computed style property of an element
   * @param locator - Playwright locator
   * @param property - CSS property name
   */
  static async getComputedStyle(
    locator: Locator,
    property: string,
  ): Promise<string> {
    return await locator.evaluate(
      (element, prop) =>
        window.getComputedStyle(element).getPropertyValue(prop),
      property,
    );
  }

  /**
   * Check if element is enabled
   * @param locator - Playwright locator
   */
  static async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Get all matching elements and their properties
   * @param locator - Playwright locator
   * @param properties - Array of property names to extract
   */
  static async getElementsData<T>(
    locator: Locator,
    properties: string[],
  ): Promise<T[]> {
    return await locator.evaluateAll(
      (elements, props) =>
        elements.map((element) => {
          const data: Record<string, any> = {};
          props.forEach((prop) => {
            if (prop === "textContent") {
              data[prop] = element.textContent?.trim() || "";
            } else if (prop === "value" && "value" in element) {
              data[prop] = (element as HTMLInputElement).value;
            } else if (prop.startsWith("data-")) {
              data[prop] = element.getAttribute(prop);
            } else if (prop === "checked" && "checked" in element) {
              data[prop] = (element as HTMLInputElement).checked;
            } else if (prop === "selected" && "selected" in element) {
              data[prop] = (element as HTMLOptionElement).selected;
            } else if (prop === "classList") {
              data[prop] = Array.from(element.classList);
            } else {
              data[prop] = (element as any)[prop];
            }
          });
          return data as T;
        }),
      properties,
    );
  }
}
