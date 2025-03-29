import { Page, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { Logger } from "../../utils/Logger";

/**
 * Todo page object for testing TodoMVC
 */
export class TodoPage extends BasePage {
  // Locators
  readonly newTodoInput = ".new-todo";
  readonly todoItems = ".todo-list li";
  readonly todoItemByText = (text: string) =>
    `.todo-list li:has-text("${text}")`;
  readonly todoItemCheckbox = (text: string) =>
    `.todo-list li:has-text("${text}") .toggle`;
  readonly todoItemDeleteButton = (text: string) =>
    `.todo-list li:has-text("${text}") .destroy`;
  readonly clearCompletedButton = ".clear-completed";
  readonly todoCount = ".todo-count";
  readonly filterAll = 'a[href="#/"]';
  readonly filterActive = 'a[href="#/active"]';
  readonly filterCompleted = 'a[href="#/completed"]';

  /**
   * Create a new Todo page object
   * @param page - Playwright page
   */
  constructor(page: Page) {
    super(page, "", "https://demo.playwright.dev/todomvc");
    Logger.info("Created Todo page object");
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    Logger.info("Waiting for Todo page to load");
    await this.waitForElement(this.newTodoInput, { state: "visible", timeout });
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  /**
   * Add a new todo item
   * @param text - Todo text
   */
  async addTodo(text: string): Promise<void> {
    Logger.info(`Adding todo: ${text}`);
    await this.fillWithRetry(this.newTodoInput, text);
    await this.pressKey("Enter");
    await this.expectToBeVisible(this.todoItemByText(text));
  }

  /**
   * Complete a todo item
   * @param text - Todo text
   */
  async completeTodo(text: string): Promise<void> {
    Logger.info(`Completing todo: ${text}`);
    await this.clickWithRetry(this.todoItemCheckbox(text));
    // Verify it's marked as completed
    await this.expectToHaveAttribute(
      this.todoItemByText(text),
      "class",
      /completed/,
    );
  }

  /**
   * Delete a todo item
   * @param text - Todo text
   */
  async deleteTodo(text: string): Promise<void> {
    Logger.info(`Deleting todo: ${text}`);

    // Need to hover to make delete button visible
    await this.page.hover(this.todoItemByText(text));
    await this.clickWithRetry(this.todoItemDeleteButton(text));

    // Verify it's removed
    await expect(this.page.locator(this.todoItemByText(text))).toHaveCount(0);
  }

  /**
   * Clear all completed todos
   */
  async clearCompleted(): Promise<void> {
    Logger.info("Clearing completed todos");
    await this.clickWithRetry(this.clearCompletedButton);
  }

  /**
   * Filter todos by status
   * @param filter - Filter to apply (all, active, completed)
   */
  async filterTodos(filter: "all" | "active" | "completed"): Promise<void> {
    Logger.info(`Filtering todos: ${filter}`);
    switch (filter) {
      case "all":
        await this.clickWithRetry(this.filterAll);
        break;
      case "active":
        await this.clickWithRetry(this.filterActive);
        break;
      case "completed":
        await this.clickWithRetry(this.filterCompleted);
        break;
    }
  }

  /**
   * Get todo count text
   */
  async getTodoCount(): Promise<string> {
    Logger.info("Getting todo count");
    return this.getText(this.todoCount);
  }

  /**
   * Get all todo items
   */
  async getAllTodos(): Promise<string[]> {
    Logger.info("Getting all todos");
    const todoElements = this.page.locator(this.todoItems);
    const count = await todoElements.count();

    const todos: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await todoElements.nth(i).textContent();
      if (text) {
        todos.push(text.trim());
      }
    }

    return todos;
  }

  /**
   * Edit a todo item
   * @param oldText - Current todo text
   * @param newText - New todo text
   */
  async editTodo(oldText: string, newText: string): Promise<void> {
    Logger.info(`Editing todo: ${oldText} -> ${newText}`);

    // Double click to enter edit mode
    await this.page.dblclick(this.todoItemByText(oldText));

    // Get the edit input
    const editInput = this.page.locator(
      `${this.todoItemByText(oldText)} .edit`,
    );

    // Clear and fill with new text
    await editInput.clear();
    await this.fillWithRetry(editInput, newText);
    await this.pressKey("Enter");

    // Verify the edit worked
    await this.expectToBeVisible(this.todoItemByText(newText));
  }
}
