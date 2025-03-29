import { test, expect } from "@playwright/test";
import { TestGenerator } from "../../src/ai/TestGenerator";
import { Logger } from "../../src/utils/Logger";
import * as fs from "fs";
import * as path from "path";

/**
 * Example test demonstrating code generation with Ollama
 */
test("Generate simple login test using LLM", async () => {
  const testGenerator = new TestGenerator();

  // Simple login test specification
  const specification = `
  Feature: User Login
  
  As a user, I want to login to the application
  
  Scenario:
  1. Navigate to login page
  2. Enter username "testuser@example.com"
  3. Enter password "Password123"
  4. Click login button
  5. Verify user is redirected to dashboard
  `;

  // Generate test code
  const testCode = await testGenerator.generateTestFromSpec(specification);

  // Verify generated code
  expect(testCode).toBeTruthy();
  expect(testCode.length).toBeGreaterThan(100);
  expect(testCode).toContain("import");
  expect(testCode).toContain("test");
  expect(testCode).toContain("testuser@example.com");

  Logger.info("Generated test code:");
  Logger.info(testCode);

  // Save the generated test to a file
  const outputDir = path.join(process.cwd(), "test-results", "generated");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "generated-login-test.ts"), testCode);

  // Output the path to the generated file for easy reference
  const fullPath = path.join(outputDir, "generated-login-test.ts");
  Logger.info(`Test code saved to: ${fullPath}`);
});
