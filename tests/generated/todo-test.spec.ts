import { test, expect } from "@playwright/test";

/**
 * This test was generated using our AI test generation service
 * Demo of LLM-generated code for todo application testing
 */
test("todo application", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Add 3 todo items
  const todoInput = page.locator(".new-todo");

  await todoInput.fill("Buy milk");
  await todoInput.press("Enter");

  await todoInput.fill("Clean house");
  await todoInput.press("Enter");

  await todoInput.fill("Pay bills");
  await todoInput.press("Enter");

  // Mark "Clean house" as completed
  await page.locator('.todo-list li:has-text("Clean house") .toggle').click();

  // Verify that 2 items are still active
  await expect(page.locator(".todo-count")).toContainText("2");

  // Filter to show only active items
  await page.locator("text=Active").click();

  // Verify only the active items are visible
  const todoItems = page.locator(".todo-list li");
  await expect(todoItems).toHaveCount(2);

  // Verify individual items instead of the collection
  await expect(
    page.locator('.todo-list li:has-text("Buy milk")'),
  ).toBeVisible();
  await expect(
    page.locator('.todo-list li:has-text("Pay bills")'),
  ).toBeVisible();
  await expect(
    page.locator('.todo-list li:has-text("Clean house")'),
  ).not.toBeVisible();
});
