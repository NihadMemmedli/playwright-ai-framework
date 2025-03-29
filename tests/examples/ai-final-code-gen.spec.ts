import { test, expect } from "@playwright/test";
import { TestGenerator } from "../../src/ai/TestGenerator";
import { Logger } from "../../src/utils/Logger";
import * as fs from "fs";
import * as path from "path";

/**
 * Final example demonstrating code generation with precise format requirements
 */
test("Generate todo test with exact format requirements", async () => {
  const testGenerator = new TestGenerator();

  // Specification with exact format requirements
  const specification = `
  Feature: Todo Application Test
  
  Create a Playwright test with this EXACT format:

  \`\`\`typescript
  import { test, expect } from '@playwright/test';
  
  test('todo application', async ({ page }) => {
    // Your code here
  });
  \`\`\`
  
  The test should:
  1. Go to the Playwright todo demo at https://demo.playwright.dev/todomvc
  2. Add 3 todo items: "Buy milk", "Clean house", "Pay bills"
  3. Mark "Clean house" as completed
  4. Verify that 2 items are still active
  5. Filter to show only active items
  6. Verify only the active items are visible
  
  The test must be completely self-contained with no external dependencies or imports beyond the ones shown above.
  `;

  // Generate test code
  const testCode = await testGenerator.generateTestFromSpec(specification);

  // Save regardless of validation
  Logger.info("Generated test code:");
  Logger.info(testCode);

  // Save the generated test to a file
  const outputDir = path.join(process.cwd(), "test-results", "generated");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "generated-todo-final-test.ts"),
    testCode,
  );

  // Output the path to the generated file for easy reference
  const fullPath = path.join(outputDir, "generated-todo-final-test.ts");
  Logger.info(`Test code saved to: ${fullPath}`);
});
