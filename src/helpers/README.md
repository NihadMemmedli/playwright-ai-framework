# Helpers Module

This module contains utility classes that provide reusable helper methods for various aspects of testing.

## Contents

- `DateHelper.ts` - Utilities for date formatting, manipulation, and comparison
- `StringHelper.ts` - Utilities for string manipulation, generation, and validation
- `ElementHelper.ts` - Utilities for working with DOM elements in UI tests

## Usage

### DateHelper

```typescript
import { DateHelper } from "../helpers/DateHelper";
import { test, expect } from "@playwright/test";

test("date manipulation example", async () => {
  // Get current date in ISO format
  const today = DateHelper.getCurrentDateISO();

  // Add 7 days to current date
  const nextWeek = DateHelper.getFutureDate(7);

  // Format a date
  const formattedDate = DateHelper.formatDate(nextWeek, "MM/DD/YYYY");

  // Compare dates
  const isInFuture = DateHelper.getTimeDifference(new Date(), nextWeek) > 0;
  expect(isInFuture).toBeTruthy();
});
```

### StringHelper

```typescript
import { StringHelper } from "../helpers/StringHelper";
import { test, expect } from "@playwright/test";

test("string manipulation example", async () => {
  // Generate random string
  const randomId = StringHelper.generateRandomString(10);

  // Generate UUID
  const uuid = StringHelper.generateUUID();

  // Check if string is valid email
  const isValidEmail = StringHelper.isValidEmail("test@example.com");
  expect(isValidEmail).toBeTruthy();

  // Convert to different case formats
  const snakeCase = StringHelper.toSnakeCase("testCamelCase");
  expect(snakeCase).toBe("test_camel_case");
});
```

### ElementHelper

```typescript
import { ElementHelper } from "../helpers/ElementHelper";
import { test, expect } from "@playwright/test";

test("DOM element utilities example", async ({ page }) => {
  await page.goto("https://example.com");

  // Check if element exists
  const exists = await ElementHelper.isElementExists(page, ".header");

  // Get text from multiple elements
  const items = page.locator(".list-item");
  const itemTexts = await ElementHelper.getTextArray(items);

  // Wait for element to be stable before interacting
  const button = page.locator(".submit-button");
  await ElementHelper.waitForElementToBeStable(button);
  await ElementHelper.safeClick(button);

  // Check element properties
  const hasClass = await ElementHelper.hasClass(button, "primary");
  expect(hasClass).toBeTruthy();
});
```

## Extending

To extend the helpers:

1. Add new methods to existing helper classes for related functionality
2. Create new helper classes for different domains (e.g., `NetworkHelper`, `ValidationHelper`)
3. Keep helper methods static and focused on a single responsibility
4. Document new methods with JSDoc comments
