import { test, expect, Page, TestInfo } from "@playwright/test"; // Import TestInfo
// Allure import removed
import * as path from "path"; // Need path
// Import the type along with the function
import { expectPageToMatchVisuallyAI, VisualAIResult } from "../../src/helpers/VisualTestHelper";
import { Logger } from "../../src/utils/Logger"; // Import Logger

// Define paths relative to project root
const baselineDir = path.join(process.cwd(), "tests/visual-baselines");
const actualDir = path.join(process.cwd(), "test-results/visual-actuals");

// Helper function removed

test.describe("Visual AI Tests for playwright.dev", () => {
  // Pass testInfo fixture to the test function
  test("should visually match the baseline for the homepage", async ({ page }, testInfo: TestInfo) => {
    await test.step("Navigate and Wait", async () => {
      await page.goto("https://playwright.dev/");
      await page.waitForSelector("main", { state: "visible", timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await page.waitForTimeout(3000); // Increased wait time to 3 seconds
    });

    const baselineName = "playwright-dev-homepage";
    // Assign result outside the step where it's used for attachment
    const result: VisualAIResult = await test.step(`Perform AI Visual Comparison: ${baselineName}`, async () => {
      return await expectPageToMatchVisuallyAI(page, baselineName); // Return result from step
    });

    // Attach paths using testInfo.attach
    await test.step("Attach Comparison Images", async () => {
        // No need for null check now as result is guaranteed to be assigned if previous step passed
        try {
            await testInfo.attach(`ai-baseline-${baselineName}.png`, { path: result.baselinePath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach baseline image: ${e instanceof Error ? e.message : String(e)}`); }
        try {
            await testInfo.attach(`ai-actual-${baselineName}.png`, { path: result.actualPath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach actual image: ${e instanceof Error ? e.message : String(e)}`); }
    });

    // Assert the result
    expect(result.passed, `Visual comparison failed: ${result.reason}`).toBeTruthy();
  });

  test("should visually match the baseline for search results", async ({ page }, testInfo: TestInfo) => {
    await test.step("Navigate and Search", async () => {
      await page.goto("https://playwright.dev/");
      await page.locator("button.DocSearch-Button").click();
      await page.locator("input.DocSearch-Input").fill("visual comparison");
      await page.waitForSelector(".DocSearch-Hits", { state: "visible", timeout: 15000 });
      await page.waitForTimeout(500);
    });

    const baselineName = "playwright-dev-search-results";
    // Assign result outside the step where it's used for attachment
    const result: VisualAIResult = await test.step(`Perform AI Visual Comparison: ${baselineName}`, async () => {
      return await expectPageToMatchVisuallyAI(page, baselineName); // Return result from step
    });

    // Attach paths using testInfo.attach
    await test.step("Attach Comparison Images", async () => {
        try {
            await testInfo.attach(`ai-baseline-${baselineName}.png`, { path: result.baselinePath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach baseline image: ${e instanceof Error ? e.message : String(e)}`); }
        try {
            await testInfo.attach(`ai-actual-${baselineName}.png`, { path: result.actualPath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach actual image: ${e instanceof Error ? e.message : String(e)}`); }
    });

    // Assert the result
    expect(result.passed, `Visual comparison failed: ${result.reason}`).toBeTruthy();
  });

  test("should visually match the baseline for the Docs page", async ({ page }, testInfo: TestInfo) => {
    await test.step("Navigate and Wait", async () => {
      await page.goto("https://playwright.dev/docs/intro");
      await page.waitForSelector(".theme-doc-markdown", { state: "visible", timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await page.waitForTimeout(1000);
    });

    const baselineName = "playwright-dev-docs-intro";
    // Assign result outside the step where it's used for attachment
    const result: VisualAIResult = await test.step(`Perform AI Visual Comparison: ${baselineName}`, async () => {
      return await expectPageToMatchVisuallyAI(page, baselineName); // Return result from step
    });

    // Attach paths using testInfo.attach
    await test.step("Attach Comparison Images", async () => {
        try {
            await testInfo.attach(`ai-baseline-${baselineName}.png`, { path: result.baselinePath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach baseline image: ${e instanceof Error ? e.message : String(e)}`); }
        try {
            await testInfo.attach(`ai-actual-${baselineName}.png`, { path: result.actualPath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach actual image: ${e instanceof Error ? e.message : String(e)}`); }
    });

    // Assert the result
    expect(result.passed, `Visual comparison failed: ${result.reason}`).toBeTruthy();
  });

  test("should visually match the baseline for the Community page", async ({ page }, testInfo: TestInfo) => {
    await test.step("Navigate and Wait", async () => {
      await page.goto("https://playwright.dev/community/welcome");
      await page.waitForSelector("main", { state: "visible", timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await page.waitForTimeout(3000); // Increased wait time to 3 seconds
    });

    const baselineName = "playwright-dev-community-welcome";
    // Assign result outside the step where it's used for attachment
    const result: VisualAIResult = await test.step(`Perform AI Visual Comparison: ${baselineName}`, async () => {
      return await expectPageToMatchVisuallyAI(page, baselineName); // Return result from step
    });

    // Attach paths using testInfo.attach
    await test.step("Attach Comparison Images", async () => {
        try {
            await testInfo.attach(`ai-baseline-${baselineName}.png`, { path: result.baselinePath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach baseline image: ${e instanceof Error ? e.message : String(e)}`); }
        try {
            await testInfo.attach(`ai-actual-${baselineName}.png`, { path: result.actualPath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach actual image: ${e instanceof Error ? e.message : String(e)}`); }
    });

    // Assert the result
    expect(result.passed, `Visual comparison failed: ${result.reason}`).toBeTruthy();
  });
});

test.describe("Visual AI Tests for GitHub Login (with Masking)", () => {
  test("should visually match the baseline for the login page with masked fields", async ({ page }, testInfo: TestInfo) => {
    await test.step("Navigate and Wait", async () => {
      await page.goto("https://github.com/login");
      await page.waitForSelector("#login_field", { state: "visible", timeout: 15000 });
      await page.waitForSelector("#password", { state: "visible", timeout: 15000 });
      await page.waitForTimeout(500);
    });

    const baselineName = "github-login-masked";
    // Assign result outside the step where it's used for attachment
    const result: VisualAIResult = await test.step(`Perform AI Visual Comparison: ${baselineName}`, async () => {
      return await expectPageToMatchVisuallyAI(page, baselineName, { // Return result from step
        mask: ["#login_field", "#password"],
      });
    });

    // Attach paths using testInfo.attach
    await test.step("Attach Comparison Images", async () => {
        try {
            await testInfo.attach(`ai-baseline-${baselineName}.png`, { path: result.baselinePath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach baseline image: ${e instanceof Error ? e.message : String(e)}`); }
        try {
            await testInfo.attach(`ai-actual-${baselineName}.png`, { path: result.actualPath, contentType: "image/png" }); // Renamed attachment
        } catch (e) { Logger.warn(`Could not attach actual image: ${e instanceof Error ? e.message : String(e)}`); }
    });

    // Assert the result
    expect(result.passed, `Visual comparison failed: ${result.reason}`).toBeTruthy();
  });
});
