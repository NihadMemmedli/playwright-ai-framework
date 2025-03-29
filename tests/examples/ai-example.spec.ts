import { test, expect } from "@playwright/test";
import { LLMUtils } from "../../src/ai/LLMUtils";
import { TestGenerator } from "../../src/ai/TestGenerator";
import { DataGenerator } from "../../src/ai/DataGenerator";
import { TestEnhancer } from "../../src/ai/TestEnhancer";
import { Logger } from "../../src/utils/Logger";
import * as fs from "fs";
import * as path from "path";

/**
 * Example tests demonstrating AI integration with Ollama
 */
test.describe("AI integration examples", () => {
  /**
   * Before all tests, ensure Ollama is running and required model is available
   */
  test.beforeAll(async () => {
    // Check if Ollama is installed
    const ollamaInstalled = await LLMUtils.isOllamaInstalled();
    if (!ollamaInstalled) {
      test.skip(
        true,
        "Ollama is not installed. Please install it first: https://ollama.com/download",
      );
    }

    // Try to start Ollama
    const ollamaRunning = await LLMUtils.startOllama();
    if (!ollamaRunning) {
      test.skip(
        true,
        "Failed to start Ollama. Please start it manually: ollama serve",
      );
    }

    // Get recommended model
    const recommendedModel = LLMUtils.getRecommendedModel();

    // Pull the model if needed
    const modelAvailable = await LLMUtils.pullModelIfNeeded(recommendedModel);
    if (!modelAvailable) {
      test.skip(
        true,
        `Failed to pull model ${recommendedModel}. Please pull it manually: ollama pull ${recommendedModel}`,
      );
    }

    Logger.info(`Ollama is running and model ${recommendedModel} is available`);
  });

  /**
   * Test data generation capabilities
   */
  test("Generate test data using LLM", async () => {
    const dataGenerator = new DataGenerator();

    // Generate a user profile
    const userProfile = await dataGenerator.generateUserProfile(
      "Senior software developer",
    );

    // Verify user profile
    expect(userProfile).toBeTruthy();
    if (userProfile) {
      expect(userProfile).toHaveProperty("name");
      expect(userProfile).toHaveProperty("email");
      // Access properties with type assertion
      expect(typeof (userProfile as any).name).toBe("string");
      Logger.info(
        `Generated user profile: ${JSON.stringify(userProfile, null, 2)}`,
      );
    }

    // Generate todo items
    const todoItems = await dataGenerator.generateTodoItems(
      2,
      "High priority work tasks",
    );

    // Verify todo items
    expect(todoItems).toBeTruthy();
    if (todoItems) {
      expect(Array.isArray(todoItems)).toBeTruthy();
      expect(todoItems.length).toBe(2);
      // Access array item properties with type assertion
      expect(todoItems[0] as any).toHaveProperty("title");
      expect(todoItems[0] as any).toHaveProperty("priority");
      Logger.info(
        `Generated todo items: ${JSON.stringify(todoItems, null, 2)}`,
      );
    }
  });

  /**
   * Test code generation capabilities
   */
  test("Generate test code using LLM", async () => {
    const testGenerator = new TestGenerator();

    // Simple test specification
    const specification = `
    Feature: Todo Item Creation
    
    As a user, I want to add a new todo item to my list
    
    Scenario:
    1. Navigate to Todo application
    2. Enter "Buy groceries" in the input field
    3. Press Enter
    4. Verify the todo "Buy groceries" appears in the list
    `;

    // Generate test code
    const testCode = await testGenerator.generateTestFromSpec(specification);

    // Verify generated code
    expect(testCode).toBeTruthy();
    expect(testCode.length).toBeGreaterThan(100);
    expect(testCode).toContain("import");
    expect(testCode).toContain("test");
    expect(testCode).toContain("Buy groceries");

    Logger.info("Generated test code:");
    Logger.info(testCode);

    // Optional: Save the generated test to a file for inspection
    const outputDir = path.join(process.cwd(), "test-results", "generated");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "generated-todo-test.ts"), testCode);
  });

  /**
   * Test improvement and analysis capabilities
   */
  test("Analyze and improve existing test code", async () => {
    // Sample test code to analyze
    const sampleTestCode = `
    import { test, expect } from '@playwright/test';
    
    test('add todo item', async ({ page }) => {
      await page.goto('https://demo.playwright.dev/todomvc');
      await page.locator('.new-todo').fill('Buy milk');
      await page.locator('.new-todo').press('Enter');
      
      const todoItems = page.locator('.todo-list li');
      await expect(todoItems).toHaveCount(1);
      await expect(todoItems.nth(0)).toHaveText('Buy milk');
    });
    `;

    const testEnhancer = new TestEnhancer();

    // Get improvement suggestions
    const improvements = await testEnhancer.improveTest(sampleTestCode);

    // Verify improvement suggestions
    expect(improvements).toBeTruthy();
    expect(improvements.refactoringSuggestions.length).toBeGreaterThan(0);
    expect(improvements.coverageSuggestions.length).toBeGreaterThan(0);

    Logger.info("Test improvement suggestions:");
    Logger.info(JSON.stringify(improvements, null, 2));

    // Simulate a test failure
    const error = new Error('Element ".todo-list li" not found');
    error.stack =
      'Error: Element ".todo-list li" not found\n    at TodoPage.addTodo (src/ui/pages/TodoPage.ts:25:12)';

    // Analyze the failure
    const analysis = await testEnhancer.analyzeFailure(error, sampleTestCode);

    // Verify analysis
    expect(analysis).toBeTruthy();
    expect(analysis.likelyRootCause).toBeTruthy();
    expect(analysis.suggestedFixes.length).toBeGreaterThan(0);

    Logger.info("Test failure analysis:");
    Logger.info(JSON.stringify(analysis, null, 2));
  });
});
