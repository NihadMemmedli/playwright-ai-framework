import { LocalLLMService, LLMRequest } from "./LocalLLMService";
import { Logger } from "../utils/Logger";
import { LLMUtils } from "./LLMUtils";

/**
 * Service for generating test cases using LLM
 */
export class TestGenerator {
  private llmService: LocalLLMService;
  private readonly defaultModel: string;

  /**
   * Create a new TestGenerator
   * @param llmService - Optional LLM service instance
   */
  constructor(llmService?: LocalLLMService) {
    this.defaultModel = LLMUtils.getRecommendedModel();
    this.llmService =
      llmService ||
      new LocalLLMService("http://localhost:11434/api", this.defaultModel);
  }

  /**
   * Generate a test case from a specification
   * @param specification - The test specification
   */
  async generateTestFromSpec(specification: string): Promise<string> {
    const systemPrompt = `You are a test automation expert. Your task is to create Playwright test cases 
based on specifications. Follow these guidelines:
- Write clean, maintainable TypeScript code
- Use the Page Object Model pattern when appropriate
- Include proper assertions and error handling
- Follow the AAA (Arrange-Act-Assert) pattern
- Return ONLY valid TypeScript code with no explanations or markdown formatting`;

    const prompt = `Create Playwright test cases for the following specification:

${specification}

IMPORTANT: 
- Return only TypeScript code
- Include necessary imports
- Use TypeScript features (types, interfaces, etc.)`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.2, // Lower temperature for more consistent code generation
      maxTokens: 2000,
      model: this.defaultModel,
    };

    Logger.info("Generating test from specification");
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error("Failed to generate test", new Error(response.error));
      return "";
    }

    // Clean up the response to ensure it's valid TypeScript
    return this.cleanGeneratedCode(response.text);
  }

  /**
   * Generate a test data file with reasonable test data
   * @param entityName - The entity to generate data for (e.g., "User", "Product")
   * @param fields - Fields to include in the test data
   */
  async generateTestData(
    entityName: string,
    fields: string[],
  ): Promise<string> {
    const systemPrompt = `You are a test data generator. Generate realistic test data in TypeScript format.`;

    const prompt = `Create a TypeScript file with test data for ${entityName} with the following fields: ${fields.join(", ")}.

Example of output format:
export const testUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', ... },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com', ... },
  ...
];

Generate at least 5 realistic ${entityName} objects with varied data.
Only return valid TypeScript code without explanations.`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.4,
      maxTokens: 1500,
      model: this.defaultModel,
    };

    Logger.info(`Generating test data for ${entityName}`);
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error("Failed to generate test data", new Error(response.error));
      return "";
    }

    return this.cleanGeneratedCode(response.text);
  }

  /**
   * Generate test improvement suggestions
   * @param testCode - The current test code
   */
  async generateTestImprovements(testCode: string): Promise<string[]> {
    const systemPrompt = `You are a test review expert. Analyze test code and suggest improvements.`;

    const prompt = `Review the following test code and suggest specific improvements:

\`\`\`typescript
${testCode}
\`\`\`

Provide specific, actionable suggestions for improving:
1. Test structure
2. Assertions
3. Code quality
4. Test coverage
5. Error handling

Return a JSON array of improvement suggestions. Each item should be a string with a specific improvement.`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1000,
      model: this.defaultModel,
    };

    Logger.info("Generating test improvement suggestions");
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error(
        "Failed to generate test improvements",
        new Error(response.error),
      );
      return [];
    }

    try {
      // Parse the response as JSON
      return JSON.parse(response.text);
    } catch (error) {
      // If parsing fails, try to extract suggestions from the text
      Logger.warn(
        "Failed to parse JSON response, extracting suggestions from text",
        error instanceof Error ? error : new Error(String(error)),
      );
      return this.extractSuggestionsFromText(response.text);
    }
  }

  /**
   * Clean up generated code to ensure it's valid TypeScript
   * @param code - The generated code
   */
  private cleanGeneratedCode(code: string): string {
    // Remove markdown code blocks if present
    let cleanedCode = code
      .replace(/```typescript|```ts|```javascript|```js|```/g, "")
      .trim();

    // Remove any "typescript" or "javascript" language indicators
    cleanedCode = cleanedCode.replace(/^typescript|^javascript/i, "").trim();

    return cleanedCode;
  }

  /**
   * Extract suggestions from text when JSON parsing fails
   * @param text - The response text
   */
  private extractSuggestionsFromText(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      // Look for numbered or bulleted list items
      const match = line.match(/^(\d+[\.\)]\s*|[-*•]\s*)(.+)/);
      if (match) {
        suggestions.push(match[2].trim());
      }
    }

    return suggestions.length > 0 ? suggestions : [text.trim()];
  }
}
