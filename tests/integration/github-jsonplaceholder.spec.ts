import { test, expect } from "@playwright/test";
import { ApiClient } from "../../src/api/ApiClient";
import { ContractValidator } from "../../src/api/ContractValidator";
import { DataProvider } from "../../src/utils/DataProvider";
import fs from "fs";
import path from "path";

// Create directory for test data if it doesn't exist
const dataDir = path.resolve(process.cwd(), "test-data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create a sample test data file for demonstration
const usersTestData = [
  { id: 1, name: "Leanne Graham", username: "Bret" },
  { id: 2, name: "Ervin Howell", username: "Antonette" },
  { id: 3, name: "Clementine Bauch", username: "Samantha" },
];
fs.writeFileSync(
  path.resolve(dataDir, "users.json"),
  JSON.stringify(usersTestData, null, 2),
);

// JSON Schema for User object from JSONPlaceholder
const userSchema = {
  type: "object",
  required: ["id", "name", "username", "email"],
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        suite: { type: "string" },
        city: { type: "string" },
        zipcode: { type: "string" },
        geo: {
          type: "object",
          properties: {
            lat: { type: "string" },
            lng: { type: "string" },
          },
        },
      },
    },
    phone: { type: "string" },
    website: { type: "string" },
    company: {
      type: "object",
      properties: {
        name: { type: "string" },
        catchPhrase: { type: "string" },
        bs: { type: "string" },
      },
    },
  },
};

// Array schema for multiple users
const usersArraySchema = {
  type: "array",
  items: userSchema,
};

/**
 * Integration test suite demonstrating contract testing and data-driven testing
 */
test.describe("Integration Tests - JSONPlaceholder API", () => {
  // Initialize API client for JSONPlaceholder
  const apiClient = new ApiClient("https://jsonplaceholder.typicode.com");

  test("Validate user schema for all users from test data", async () => {
    // Load test data from the JSON file we created
    const testUsers = DataProvider.loadJsonData<
      Array<{ id: number; name: string; username: string }>
    >("test-data/users.json");

    // For each user in the test data, validate the API response
    for (const testUser of testUsers) {
      // Start the timer for response time validation
      const startTime = Date.now();

      // Make API request to get user by ID
      const response = await apiClient.get<any>(`/users/${testUser.id}`);

      // End the timer
      const endTime = Date.now();

      // Validate the API contract
      const validationResult = ContractValidator.validateContract(response, {
        schema: userSchema,
        expectedStatus: 200,
        expectedHeaders: {
          "content-type": /application\/json/,
        },
        responseTime: {
          start: startTime,
          end: endTime,
          maxDuration: 5000, // 5 seconds max
        },
      });

      // Verify validation passed
      expect(
        validationResult.valid,
        `Contract validation failed for user ${testUser.id}: ${JSON.stringify(validationResult.errors)}`,
      ).toBeTruthy();

      // Verify specific data values from test data match the response
      expect(response.data.id).toBe(testUser.id);
      expect(response.data.name).toBe(testUser.name);
      expect(response.data.username).toBe(testUser.username);
    }
  });

  test("Generate test matrix for different post IDs and validate comments", async () => {
    // Generate a test matrix for different post IDs and comment indexes
    const testMatrix = DataProvider.generateTestMatrix({
      postId: [1, 2, 3],
      commentIndex: [0, 1], // Get the first two comments for each post
    });

    // Expected schema for comments
    const commentSchema = {
      type: "object",
      required: ["id", "postId", "name", "email", "body"],
      properties: {
        id: { type: "number" },
        postId: { type: "number" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        body: { type: "string" },
      },
    };

    // Expected schema for array of comments
    const commentsArraySchema = {
      type: "array",
      items: commentSchema,
    };

    // For each test case in the matrix
    for (const testCase of testMatrix) {
      // Start the timer for response time validation
      const startTime = Date.now();

      // Get comments for the post
      const response = await apiClient.get<any>(
        `/posts/${testCase.postId}/comments`,
      );

      // End timer
      const endTime = Date.now();

      // Validate schema for array of comments
      const arrayValidation = ContractValidator.validateResponse(
        response,
        commentsArraySchema,
      );
      expect(
        arrayValidation.valid,
        `Comments array schema validation failed: ${JSON.stringify(arrayValidation.errors)}`,
      ).toBeTruthy();

      // Make sure we have comments
      expect(response.data.length).toBeGreaterThan(testCase.commentIndex);

      // Get the specific comment
      const comment = response.data[testCase.commentIndex];

      // Validate the specific comment schema
      const commentValidation = ContractValidator.validateResponse(
        { ...response, data: comment }, // Create a new response object with just the comment
        commentSchema,
      );

      expect(
        commentValidation.valid,
        `Comment schema validation failed: ${JSON.stringify(commentValidation.errors)}`,
      ).toBeTruthy();

      // Validate the comment belongs to the correct post
      expect(comment.postId).toBe(testCase.postId);
    }
  });

  test("Fetch and validate all posts from a user", async () => {
    // Choose a user ID
    const userId = 1;

    // Start the timer
    const startTime = Date.now();

    // Get user posts
    const response = await apiClient.get<any>(`/users/${userId}/posts`);

    // End timer
    const endTime = Date.now();

    // Expected schema for post
    const postSchema = {
      type: "object",
      required: ["id", "userId", "title", "body"],
      properties: {
        id: { type: "number" },
        userId: { type: "number" },
        title: { type: "string" },
        body: { type: "string" },
      },
    };

    // Expected schema for array of posts
    const postsArraySchema = {
      type: "array",
      items: postSchema,
    };

    // Validate the response
    const validationResult = ContractValidator.validateContract(response, {
      schema: postsArraySchema,
      expectedStatus: 200,
      expectedHeaders: {
        "content-type": /application\/json/,
      },
      responseTime: {
        start: startTime,
        end: endTime,
        maxDuration: 5000,
      },
    });

    expect(
      validationResult.valid,
      `Contract validation failed for user posts: ${JSON.stringify(validationResult.errors)}`,
    ).toBeTruthy();

    // Verify all posts belong to the correct user
    for (const post of response.data) {
      expect(post.userId).toBe(userId);
    }
  });
});
