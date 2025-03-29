import { LocalLLMService, LLMRequest } from "./LocalLLMService";
import { Logger } from "../utils/Logger";
import { LLMUtils } from "./LLMUtils";

/**
 * Service for generating test data using LLM
 */
export class DataGenerator {
  private llmService: LocalLLMService;
  private readonly defaultModel: string;

  /**
   * Create a new DataGenerator
   * @param llmService - Optional LLM service instance
   */
  constructor(llmService?: LocalLLMService) {
    this.defaultModel = LLMUtils.getRecommendedModel();
    this.llmService =
      llmService ||
      new LocalLLMService("http://localhost:11434/api", this.defaultModel);
  }

  /**
   * Generate realistic test data based on a schema
   * @param schema - JSON schema or object describing the data structure
   * @param context - Additional context for data generation
   * @param count - Number of items to generate
   */
  async generateData(
    schema: object,
    context: string,
    count: number = 5,
  ): Promise<object[] | null> {
    const systemPrompt = `You are a test data generator. Generate realistic test data based on schemas.`;

    const prompt = `Generate ${count} realistic test data items based on this schema and context.
Return a JSON array of objects that match the schema.

SCHEMA:
${JSON.stringify(schema, null, 2)}

CONTEXT:
${context}

RESPONSE FORMAT:
Return only a valid JSON array with ${count} items that match the schema.`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.7, // Higher temperature for more varied data
      maxTokens: 2000,
      model: this.defaultModel,
    };

    Logger.info(`Generating ${count} data items`);
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error("Failed to generate data", new Error(response.error));
      return null;
    }

    try {
      // Extract and parse the JSON array
      const extractedJson = this.extractJsonArray(response.text);
      return JSON.parse(extractedJson);
    } catch (error) {
      Logger.error(
        "Failed to parse generated data",
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Generate a user profile with realistic data
   * @param context - Optional context for the user (e.g., "senior developer", "student")
   */
  async generateUserProfile(context: string = ""): Promise<object | null> {
    const schema = {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        username: { type: "string" },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            zipcode: { type: "string" },
            country: { type: "string" },
          },
        },
        phone: { type: "string" },
        website: { type: "string" },
        company: { type: "string" },
        jobTitle: { type: "string" },
      },
    };

    const data = await this.generateData(
      schema,
      `Generate a realistic user profile. ${context}`,
      1,
    );
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Generate realistic todo items
   * @param count - Number of todo items to generate
   * @param context - Optional context for the todos
   */
  async generateTodoItems(
    count: number = 5,
    context: string = "",
  ): Promise<object[] | null> {
    const schema = {
      type: "object",
      properties: {
        id: { type: "number" },
        title: { type: "string" },
        completed: { type: "boolean" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        dueDate: { type: "string", format: "date" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    };

    return await this.generateData(
      schema,
      `Generate realistic todo items. ${context}`,
      count,
    );
  }

  /**
   * Generate test case scenarios based on a feature description
   * @param featureDescription - Description of the feature to test
   * @param count - Number of test scenarios to generate
   */
  async generateTestScenarios(
    featureDescription: string,
    count: number = 5,
  ): Promise<string[] | null> {
    const systemPrompt = `You are a test scenario generator. Create realistic test scenarios for features.`;

    const prompt = `Generate ${count} test scenarios for this feature:

FEATURE DESCRIPTION:
${featureDescription}

Consider different user flows, edge cases, and potential issues.
Return a JSON array of test scenario descriptions.`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.6,
      maxTokens: 1500,
      model: this.defaultModel,
    };

    Logger.info(`Generating ${count} test scenarios`);
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error(
        "Failed to generate test scenarios",
        new Error(response.error),
      );
      return null;
    }

    try {
      // Extract and parse the JSON array
      const extractedJson = this.extractJsonArray(response.text);
      return JSON.parse(extractedJson);
    } catch (error) {
      Logger.error(
        "Failed to parse test scenarios",
        error instanceof Error ? error : new Error(String(error)),
      );

      // Fallback to extracting scenarios from text
      return this.extractLinesFromText(response.text);
    }
  }

  /**
   * Extract a JSON array from the response text
   * @param text - The response text
   */
  private extractJsonArray(text: string): string {
    // Look for array pattern [...]
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }

    // If no array pattern found, try extracting from a code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      const codeContent = codeBlockMatch[1].trim();
      // Check if the code content starts with [ and ends with ]
      if (codeContent.startsWith("[") && codeContent.endsWith("]")) {
        return codeContent;
      }
    }

    throw new Error("No JSON array found in response");
  }

  /**
   * Extract scenarios or other lines from text
   * @param text - The response text
   */
  private extractLinesFromText(text: string): string[] {
    const lines = text.split("\n");
    const scenarios: string[] = [];

    for (const line of lines) {
      // Look for numbered or bulleted items
      const match = line.match(/^(\d+[\.\)]\s*|[-*•]\s*)(.+)/);
      if (match) {
        scenarios.push(match[2].trim());
      } else if (line.trim().length > 20) {
        // Also include lines that look like sentences (more than 20 chars)
        scenarios.push(line.trim());
      }
    }

    return scenarios.length > 0 ? scenarios.slice(0, 10) : [text.trim()];
  }
}
