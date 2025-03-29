import { test, expect } from "@playwright/test";
import { DataGenerator } from "../../src/ai/DataGenerator";
import { Logger } from "../../src/utils/Logger";

test.describe("Simple AI integration tests", () => {
  test("Generate a user profile with AI", async () => {
    const dataGenerator = new DataGenerator();

    // Generate a user profile with a specific context
    const userProfile = await dataGenerator.generateUserProfile(
      "Test automation engineer",
    );

    // Log and verify the result
    expect(userProfile).toBeTruthy();
    if (userProfile) {
      expect(userProfile).toHaveProperty("name");
      expect(userProfile).toHaveProperty("email");

      // Access properties with type assertion
      const user = userProfile as any;
      Logger.info(`Generated user name: ${user.name}`);
      Logger.info(`Generated user email: ${user.email}`);

      // Display full profile for reference
      Logger.info(`Full user profile: ${JSON.stringify(userProfile, null, 2)}`);
    }
  });
});
