import { test, expect } from "@playwright/test";
import { ApiClient } from "../../src/api/ApiClient";
import { UserRepository } from "../../src/api/UserRepository";
import { User } from "../../src/models/User";
import { DataGenerator } from "../../src/utils/DataGenerator";

// Set up test fixtures using Playwright's built-in fixture mechanism
test.describe("JSONPlaceholder User API Tests", () => {
  let apiClient: ApiClient;
  let userRepository: UserRepository;

  // Setup before each test
  test.beforeEach(() => {
    apiClient = new ApiClient("https://jsonplaceholder.typicode.com");
    userRepository = new UserRepository(apiClient);
  });

  test("should get all users", async () => {
    // When: Fetching all users
    const users = await userRepository.getAllUsers();

    // Then: Should return a non-empty array of users
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toBeInstanceOf(User);

    // Verify some known JSONPlaceholder data
    const leanne = users.find((user) => user.id === 1);
    expect(leanne).toBeDefined();
    expect(leanne?.name).toBe("Leanne Graham");
    expect(leanne?.email).toBe("Sincere@april.biz");
  });

  test("should get user by ID", async () => {
    // Given: A valid user ID
    const userId = 2;

    // When: Fetching user by ID
    const user = await userRepository.getUserById(userId);

    // Then: Should return the user with the given ID
    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    expect(user.name).toBe("Ervin Howell");
    expect(user.email).toBe("Shanna@melissa.tv");
    expect(user.username).toBe("Antonette");
  });

  test("should create a new user", async () => {
    // Given: A new user object
    const newUser = User.builder()
      .withName(DataGenerator.randomString(10))
      .withEmail(DataGenerator.randomEmail())
      .withUsername(DataGenerator.randomString(8))
      .withPhone(DataGenerator.randomPhone())
      .withWebsite(`www.${DataGenerator.randomString(6)}.com`)
      .build();

    // When: Creating a new user
    const createdUser = await userRepository.createUser(newUser);

    // Then: Should return the created user with an ID
    // Note: JSONPlaceholder doesn't actually create the user but returns it with ID 11
    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.email).toBe(newUser.email);
  });

  test("should update an existing user", async () => {
    // Given: A user ID and updated user data
    const userId = 1;
    const updatedName = `Updated ${DataGenerator.randomString(8)}`;
    const user = User.builder()
      .withId(userId)
      .withName(updatedName)
      .withEmail(DataGenerator.randomEmail())
      .build();

    // When: Updating the user
    const updatedUser = await userRepository.updateUser(userId, user);

    // Then: Should return the updated user
    // Note: JSONPlaceholder doesn't actually update but returns mocked response
    expect(updatedUser).toBeDefined();
    expect(updatedUser.id).toBe(userId);
    expect(updatedUser.name).toBe(updatedName);
  });

  test("should delete a user", async () => {
    // Given: A user ID
    const userId = 1;

    // When: Deleting the user
    const result = await userRepository.deleteUser(userId);

    // Then: Should return true indicating successful deletion
    // Note: JSONPlaceholder returns a 200 status code without actually deleting
    expect(result).toBe(true);
  });

  test("should perform partial update with PATCH", async () => {
    // Given: A user ID and partial user data
    const userId = 1;
    const partialUpdate = {
      name: `Patched ${DataGenerator.randomString(8)}`,
    };

    // When: Patching the user
    const patchedUser = await userRepository.patchUser(userId, partialUpdate);

    // Then: Should return the patched user with updated name
    // Note: JSONPlaceholder returns a mocked response
    expect(patchedUser).toBeDefined();
    expect(patchedUser.id).toBe(userId);
    expect(patchedUser.name).toBe(partialUpdate.name);
  });
});
