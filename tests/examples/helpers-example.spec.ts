import { test, expect } from "@playwright/test";
import { StringHelper } from "../../src/helpers/StringHelper";
import { DateHelper } from "../../src/helpers/DateHelper";
import { TestDataBuilder } from "../../src/core/TestDataBuilder";
import { todoData } from "../../src/fixtures/test-data";

/**
 * Example tests that demonstrate usage of helper classes
 */
test.describe("Helper classes examples", () => {
  test("StringHelper example", async () => {
    // Generate random string
    const randomString = StringHelper.generateRandomString(10);
    expect(randomString.length).toBe(10);

    // Check email validation
    expect(StringHelper.isValidEmail("test@example.com")).toBeTruthy();
    expect(StringHelper.isValidEmail("invalid-email")).toBeFalsy();

    // Test string transformations
    const camelCase = StringHelper.toCamelCase("hello world");
    expect(camelCase).toBe("helloWorld");

    const snakeCase = StringHelper.toSnakeCase("helloWorld");
    expect(snakeCase).toBe("hello_world");

    const kebabCase = StringHelper.toKebabCase("helloWorld");
    expect(kebabCase).toBe("hello-world");

    // Mask sensitive information
    const masked = StringHelper.maskString("4111111111111111", 4);
    expect(masked).toBe("4111************");
  });

  test("DateHelper example", async () => {
    // Get current date
    const todayISO = DateHelper.getCurrentDateISO();
    expect(todayISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Test date formatting
    const date = new Date(2023, 0, 15); // Jan 15, 2023
    const formatted = DateHelper.formatDate(date, "YYYY-MM-DD");
    expect(formatted).toBe("2023-01-15");

    // Test date manipulation
    const future = DateHelper.addDays(date, 5);
    expect(future.getDate()).toBe(20);

    // Test date comparison
    const date1 = new Date(2023, 0, 1);
    const date2 = new Date(2023, 0, 10);
    const daysDiff = DateHelper.getDaysDifference(date1, date2);
    expect(daysDiff).toBe(9);

    // Test weekend detection
    const weekday = new Date(2023, 0, 2); // Monday
    const weekend = new Date(2023, 0, 7); // Saturday
    expect(DateHelper.isWeekend(weekday)).toBeFalsy();
    expect(DateHelper.isWeekend(weekend)).toBeTruthy();
  });

  test("TestDataBuilder example", async () => {
    // Create test data using builder pattern
    const testData = TestDataBuilder.create()
      .withRandomUser()
      .withDefaultTodos()
      .withTimestamp()
      .build();

    // Verify user data
    expect(testData.user).toBeDefined();
    expect(testData.user.name).toContain("User");
    expect(testData.user.email).toContain("@");

    // Verify todos
    expect(testData.todos).toHaveLength(3);
    expect(testData.todos[0].title).toBe("Complete task 1");

    // Check timestamp
    expect(testData.timestamp).toBeDefined();

    // Create specific data
    const customData = TestDataBuilder.create()
      .withUser({ name: "Custom User", email: "custom@example.com" })
      .withTodo({ title: "Special task", priority: "high" })
      .build();

    expect(customData.user.name).toBe("Custom User");
    expect(customData.todos[0].title).toBe("Special task");
    expect(customData.todos[0].priority).toBe("high");
  });

  test("Fixtures example", async () => {
    // Use data from fixtures
    expect(todoData.todoItems).toHaveLength(5);
    expect(todoData.completedItems).toContain("Buy groceries");

    // Create random todos
    const randomTodos = TestDataBuilder.create().withRandomTodos(3).build();

    expect(randomTodos.todos).toHaveLength(3);
    expect(randomTodos.todos[0].title).toContain("Todo 1:");
  });
});
