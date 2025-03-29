# Fixtures Module

This module contains test fixtures - data used for setting up test environments and providing test inputs.

## Contents

- `test-data.ts` - Contains predefined test data for various test scenarios including user data, todo data, and random data generators.

## Usage

### Test Data

Import the test data and use it in your tests:

```typescript
import { userData, todoData, getRandomEmail } from "../fixtures/test-data";
import { test, expect } from "@playwright/test";

test("should create a new user", async ({ request }) => {
  // Use predefined test data
  const response = await request.post("/api/users", {
    data: userData.newUser,
  });

  expect(response.ok()).toBeTruthy();
});

test("should add multiple todo items", async ({ page, todoPage }) => {
  // Use todo items from fixtures
  for (const item of todoData.todoItems) {
    await todoPage.addTodo(item);
  }

  // Check that all items were added
  const count = await todoPage.getTodoCount();
  expect(count).toBe(todoData.todoItems.length);
});

test("should register with random email", async ({ page }) => {
  // Use random data generator
  const email = getRandomEmail();

  // Use the generated email in test
  await page.fill("#email", email);
  // Rest of the test...
});
```

### Data-Driven Tests

Use the test matrix generators for data-driven testing:

```typescript
import { generateTodoTestMatrix } from "../fixtures/test-data";
import { test, expect } from "@playwright/test";

// Generate test cases dynamically
const testMatrix = generateTodoTestMatrix();

for (const testCase of testMatrix) {
  test(`Todo with category ${testCase.category} and priority ${testCase.priority}`, async ({
    page,
    todoPage,
  }) => {
    // Setup using the generated test case
    await todoPage.addTodoWithAttributes({
      title: `Task for ${testCase.category}`,
      category: testCase.category,
      priority: testCase.priority,
    });

    // Test assertions
    // ...
  });
}
```

## Extending

To extend the fixtures:

1. Add new objects to `test-data.ts` for commonly used test data
2. Create domain-specific data files for specialized test areas
3. Add utility functions for generating random or dynamic test data
