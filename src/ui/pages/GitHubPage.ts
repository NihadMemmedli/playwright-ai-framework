import { Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { Logger } from "../../utils/Logger";

/**
 * GitHub page object for testing GitHub UI
 */
export class GitHubPage extends BasePage {
  // Locators for GitHub homepage elements - updated for current GitHub UI
  readonly searchInput = '[name="q"], .header-search-input';
  readonly signInButton = 'a[href="/login"], .HeaderMenu-link--sign-in';
  readonly signUpButton = 'a[href="/signup"], .HeaderMenu-link--sign-up';
  readonly featuresLink =
    'a[href="/features"], a[data-analytics-event*="features"]';
  readonly pricingLink =
    'a[href="/pricing"], a[data-analytics-event*="pricing"]';
  readonly navbar = 'header[role="banner"], .js-header-wrapper';
  readonly footerLinks = "footer a";
  readonly productNav = '[data-view-component="true"].Overlay-titleArea';
  readonly whyGitHubButton = 'button[aria-controls="drawer-why-github"]';
  readonly exploreRepositoriesSection =
    '[data-target="explore-feed.content"], [data-target="recommendations.content"]';

  /**
   * Create a new GitHub page object
   * @param page - Playwright page
   */
  constructor(page: Page) {
    super(page, "/");
    Logger.info("Created GitHub page object");
  }

  /**
   * Override waitForPageLoad to wait for GitHub-specific elements
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    Logger.info("Waiting for GitHub page to load");
    // Using more reliable locators that are less likely to change
    await this.waitForElement(this.navbar, { state: "visible", timeout });
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  /**
   * Search for a repository
   * @param searchTerm - Repository or term to search for
   */
  async search(searchTerm: string): Promise<void> {
    Logger.info(`Searching for: ${searchTerm}`);

    // Try to click the search box first (GitHub has different search UI elements based on viewport)
    try {
      await this.clickWithRetry('[aria-label="Search"], .header-search', {
        timeout: 5000,
        maxRetries: 2,
      });
    } catch (error) {
      Logger.warn(
        "Could not click search box, will try to fill directly",
        error,
      );
    }

    await this.fillWithRetry(this.searchInput, searchTerm);
    await this.pressKey("Enter");

    // Wait for search results page to load - more flexible URL pattern
    await this.page.waitForURL(/github\.com\/(search|pulls|issues)/, {
      timeout: 10000,
    });
  }

  /**
   * Click on the Sign In button
   */
  async clickSignIn(): Promise<void> {
    Logger.info("Clicking Sign In button");
    await this.clickWithRetry(this.signInButton);
    // Wait for login page to load
    await this.page.waitForURL(/github\.com\/login/, { timeout: 10000 });
  }

  /**
   * Click on the Sign Up button
   */
  async clickSignUp(): Promise<void> {
    Logger.info("Clicking Sign Up button");
    await this.clickWithRetry(this.signUpButton);
    // Wait for signup page to load
    await this.page.waitForURL(/github\.com\/signup/, { timeout: 10000 });
  }

  /**
   * Navigate to Features page
   */
  async goToFeatures(): Promise<void> {
    Logger.info("Navigating to Features page");
    await this.clickWithRetry(this.featuresLink);
    // Wait for features page to load
    await this.expectPageUrlToMatch(/github\.com\/features/);
  }

  /**
   * Navigate to Pricing page
   */
  async goToPricing(): Promise<void> {
    Logger.info("Navigating to Pricing page");
    await this.clickWithRetry(this.pricingLink);
    // Wait for pricing page to load
    await this.expectPageUrlToMatch(/github\.com\/pricing/);
  }

  /**
   * Open the Why GitHub dropdown
   */
  async openWhyGitHub(): Promise<void> {
    Logger.info("Opening Why GitHub dropdown");
    try {
      await this.clickWithRetry(this.whyGitHubButton, { timeout: 5000 });
      // Wait for dropdown to be visible - using a more general selector
      await this.expectToBeVisible('[data-view-component="true"].Overlay');
    } catch (error) {
      Logger.warn(
        "Could not open Why GitHub dropdown, it may have been redesigned",
        error,
      );
    }
  }

  /**
   * Get footer links text
   * @returns Array of footer link texts
   */
  async getFooterLinks(): Promise<string[]> {
    Logger.info("Getting footer links");
    const footerLinks = this.page.locator(this.footerLinks);
    const count = await footerLinks.count();

    const links: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await footerLinks.nth(i).textContent();
      if (text) {
        links.push(text.trim());
      }
    }

    return links;
  }

  /**
   * Check if the explore repositories section is visible
   */
  async isExploreRepositoriesSectionVisible(): Promise<boolean> {
    Logger.info("Checking if explore repositories section is visible");
    return this.isVisible(this.exploreRepositoriesSection);
  }

  /**
   * Get the page title and verify it contains GitHub
   */
  async verifyTitle(): Promise<void> {
    Logger.info("Verifying page title");
    await this.expectPageToHaveTitle(/GitHub/);
  }
}
