import { test, expect } from "@playwright/test";
import { TodoPage } from "../../src/ui/pages/TodoPage";
import { DataProvider } from "../../src/utils/DataProvider";
import { Logger } from "../../src/utils/Logger";

/**
 * TodoMVC UI tests using BasePage improvements
 * These tests specifically demonstrate:
 * 1. Retry mechanisms for clicks and fills
 * 2. Custom assertions
 * 3. Data-driven testing
 */
test.describe("TodoMVC UI Tests", () => {
  // Create a data matrix for different test data
  const todoTestData = DataProvider.generateTestMatrix({
    item: ["Buy milk", "Pay bills", "Call mom", "Write tests"],
    priority: ["P1", "P2", "P3"],
  });

  // Test basic todo operations
  test("Create, complete, and delete a todo", async ({ page }) => {
    // Initialize the Todo page
    const todoPage = new TodoPage(page);

    // Navigate to TodoMVC
    await todoPage.goto();

    // Wait for page to load
    await todoPage.waitForPageLoad();

    // Add a new todo
    const todoText = "Buy groceries";
    await todoPage.addTodo(todoText);

    // Verify todo is visible using custom assertion
    await todoPage.expectToBeVisible(todoPage.todoItemByText(todoText));

    // Complete the todo
    await todoPage.completeTodo(todoText);

    // Delete the todo
    await todoPage.deleteTodo(todoText);
  });

  // Test retry mechanism and data-driven testing
  for (const { item, priority } of todoTestData.slice(0, 3)) {
    // Use only first 3 test cases
    test(`Add todo with retry mechanism: ${priority} - ${item}`, async ({
      page,
    }) => {
      // Initialize the Todo page
      const todoPage = new TodoPage(page);

      // Navigate to TodoMVC
      await todoPage.goto();
      await todoPage.waitForPageLoad();

      // Create combined text
      const todoText = `${priority}: ${item}`;

      // Add using retry mechanism
      await todoPage.addTodo(todoText);

      // Edit the todo
      const updatedText = `${todoText} - Updated`;
      await todoPage.editTodo(todoText, updatedText);

      // Verify the updated text
      const todos = await todoPage.getAllTodos();
      expect(todos).toContain(updatedText);
    });
  }

  // Test multiple todos and filtering
  test("Add multiple todos and filter them", async ({ page }) => {
    // Initialize the Todo page
    const todoPage = new TodoPage(page);

    // Navigate to TodoMVC
    await todoPage.goto();
    await todoPage.waitForPageLoad();

    // Add several todos
    await todoPage.addTodo("Todo 1");
    await todoPage.addTodo("Todo 2");
    await todoPage.addTodo("Todo 3");

    // Verify all todos are visible
    let todos = await todoPage.getAllTodos();
    expect(todos.length).toBe(3);

    // Complete one todo
    await todoPage.completeTodo("Todo 2");

    // Filter by active todos
    await todoPage.filterTodos("active");

    // Check that we only see active todos
    todos = await todoPage.getAllTodos();
    expect(todos.length).toBe(2);
    expect(todos).toContain("Todo 1");
    expect(todos).toContain("Todo 3");

    // Filter by completed todos
    await todoPage.filterTodos("completed");

    // Check that we only see completed todos
    todos = await todoPage.getAllTodos();
    expect(todos.length).toBe(1);
    expect(todos).toContain("Todo 2");

    // Filter by all todos
    await todoPage.filterTodos("all");

    // Check that we see all todos
    todos = await todoPage.getAllTodos();
    expect(todos.length).toBe(3);
  });

  // Test for stable element wait
  test("Wait for stable element before interacting", async ({ page }) => {
    // Initialize the Todo page
    const todoPage = new TodoPage(page);

    // Navigate to TodoMVC
    await todoPage.goto();
    await todoPage.waitForPageLoad();

    // Use waitForElementToBeStable before adding todos
    await todoPage.waitForElementToBeStable(todoPage.newTodoInput);

    // Add some todos
    await todoPage.addTodo("Stable Todo 1");
    await todoPage.addTodo("Stable Todo 2");

    // Wait for the todo list to be stable
    await todoPage.waitForElementToBeStable(todoPage.todoItems);

    // Complete a todo
    await todoPage.completeTodo("Stable Todo 1");

    // Check todo count
    const countText = await todoPage.getTodoCount();
    expect(countText).toContain("1 item left");
  });
});
