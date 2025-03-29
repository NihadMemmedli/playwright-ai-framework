import { test, expect } from "@playwright/test";
import { TestGenerator } from "../../src/ai/TestGenerator";
import { Logger } from "../../src/utils/Logger";
import * as fs from "fs";
import * as path from "path";

/**
 * Example test demonstrating code generation with Ollama that produces a complete, runnable test
 */
test("Generate complete, runnable test using LLM", async () => {
  const testGenerator = new TestGenerator();

  // Specification for a complete test
  const specification = `
  Feature: Todo Application
  
  Create a complete runnable Playwright test that:
  1. Goes to the Playwright todo demo at https://demo.playwright.dev/todomvc
  2. Adds 3 todo items: "Buy milk", "Clean house", "Pay bills"
  3. Marks "Clean house" as completed
  4. Verifies that 2 items are still active
  5. Filters to show only active items
  6. Verifies only the active items are visible
  
  Important requirements:
  - The test must be completely self-contained with no external dependencies
  - Use the standard Playwright test format with { page } fixture
  - Include proper assertions for all verification steps
  - Use async/await properly
  - Include appropriate selector strategies
  `;

  // Generate test code
  const testCode = await testGenerator.generateTestFromSpec(specification);

  // Verify generated code
  expect(testCode).toBeTruthy();
  expect(testCode.length).toBeGreaterThan(100);
  expect(testCode).toContain("import");
  expect(testCode).toContain("test");
  expect(testCode).toContain("expect");
  expect(testCode).toContain("demo.playwright.dev/todomvc");

  Logger.info("Generated test code:");
  Logger.info(testCode);

  // Save the generated test to a file
  const outputDir = path.join(process.cwd(), "test-results", "generated");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "generated-todo-test.ts"), testCode);

  // Output the path to the generated file for easy reference
  const fullPath = path.join(outputDir, "generated-todo-test.ts");
  Logger.info(`Test code saved to: ${fullPath}`);
});
