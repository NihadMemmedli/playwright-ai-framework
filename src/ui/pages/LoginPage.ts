import { Page, Locator } from "@playwright/test";
import { BasePage } from "../BasePage";
import { Config } from "../../config/config";

/**
 * GitHub Login Page object implementing Page Object Model pattern
 */
export class LoginPage extends BasePage {
  // Page locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly createAccountLink: Locator;

  /**
   * Create a new LoginPage object
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page, "/login");

    // Initialize locators for GitHub's login page
    this.usernameInput = page.locator("#login_field");
    this.passwordInput = page.locator("#password");
    this.signInButton = page.locator('input[name="commit"]');
    this.errorMessage = page.locator(
      '.flash-error, .js-flash-alert, .flash-alert, .alert-danger, .error-message, div[role="alert"]',
    );
    this.forgotPasswordLink = page.locator('a[href*="password_reset"]');
    this.createAccountLink = page.locator('a[href*="signup"]');
  }

  /**
   * Login with credentials
   * @param username - GitHub username or email
   * @param password - GitHub password
   */
  async login(
    username: string = Config.TEST_USER,
    password: string = Config.TEST_PASSWORD,
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();

    // Wait for navigation to complete after login
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for page-specific elements to be loaded
   */
  override async waitForPageLoad(timeout?: number): Promise<void> {
    await this.usernameInput.waitFor({ state: "visible", timeout });
    await this.passwordInput.waitFor({ state: "visible", timeout });
    await this.signInButton.waitFor({ state: "visible", timeout });
  }

  /**
   * Click on forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Click on create account link
   */
  async clickCreateAccount(): Promise<void> {
    await this.createAccountLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if login error is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }
}
