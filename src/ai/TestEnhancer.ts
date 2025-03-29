import { ILLMService, LLMRequest } from "./ILLMService"; // Import interface and shared types
import { Logger } from "../utils/Logger";
import { LLMUtils } from "./LLMUtils";

/**
 * Interface for failure analysis results
 */
export interface FailureAnalysis {
  likelyRootCause: string;
  suggestedFixes: string[];
  confidence: number;
}

/**
 * Interface for test improvement suggestions
 */
export interface TestImprovements {
  refactoringSuggestions: string[];
  coverageSuggestions: string[];
  performanceSuggestions: string[];
  maintenanceSuggestions: string[];
}

/**
import { ILLMService, LLMRequest } from "./ILLMService"; // Import interface and shared types
import { Logger } from "../utils/Logger";
import { LLMUtils } from "./LLMUtils";

/**
 * Interface for failure analysis results
 */
export interface FailureAnalysis {
  likelyRootCause: string;
  suggestedFixes: string[];
  confidence: number;
}

/**
 * Interface for test improvement suggestions
 */
export interface TestImprovements {
  refactoringSuggestions: string[];
  coverageSuggestions: string[];
  performanceSuggestions: string[];
  maintenanceSuggestions: string[];
}

/**
 * Service for enhancing tests using LLM
 */
export class TestEnhancer {
  private llmService: ILLMService; // Use the interface type
  private readonly defaultModel: string; // Keep this if needed for specific requests, or remove if model comes from config

  /**
   * Create a new TestEnhancer
   * Uses the factory function to get the configured LLM service.
   */
  constructor() {
    // Get the configured service instance via the factory
    this.llmService = LLMUtils.getLLMService();
    // Note: defaultModel might need adjustment depending on the service used.
    // Consider getting the appropriate default model from Config based on aiServiceMode.
    this.defaultModel = LLMUtils.getRecommendedModel(); // Keeping this for now, might need refinement
  }

  /**
   * Analyze a test failure and suggest fixes
   * @param error - The error that occurred
   * @param testCode - The test code that failed
   * @param logs - Optional test logs
   */
  async analyzeFailure(
    error: Error,
    testCode: string,
    logs?: string,
  ): Promise<FailureAnalysis> {
    const systemPrompt = `You are a test failure analysis expert. Analyze test failures and suggest fixes.`;

    const prompt = `Analyze this test failure and provide a root cause analysis with suggested fixes.

TEST CODE:
\`\`\`typescript
${testCode}
\`\`\`

ERROR:
${error.stack || error.message}

${logs ? `LOGS:\n${logs}\n` : ""}

Return your analysis as a JSON object with the following structure:
{
  "likelyRootCause": "Detailed explanation of the most likely cause",
  "suggestedFixes": ["Fix 1", "Fix 2", "Fix 3"],
  "confidence": 0.8 // Between 0.0 and 1.0
}`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.2,
      maxTokens: 1500,
      model: this.defaultModel,
    };

    Logger.info("Analyzing test failure");
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error("Failed to analyze test failure", new Error(response.error));
      return {
        likelyRootCause: "Failed to analyze with LLM",
        suggestedFixes: [],
        confidence: 0,
      };
    }

    try {
      // Extract and parse the JSON response
      const responseText = response.text.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (error) {
      Logger.warn(
        "Failed to parse failure analysis JSON",
        error instanceof Error ? error : new Error(String(error)),
      );

      // Fallback to a basic analysis
      return {
        likelyRootCause: response.text.substring(0, 200),
        suggestedFixes: [
          "Review the error message and stack trace",
          "Check element selectors and timing",
          "Review test preconditions",
        ],
        confidence: 0.4,
      };
    }
  }

  /**
   * Generate comprehensive improvements for a test file
   * @param testCode - The test code to improve
   */
  async improveTest(testCode: string): Promise<TestImprovements> {
    const systemPrompt = `You are a test improvement expert. Analyze test code and suggest comprehensive improvements.`;

    const prompt = `Analyze this test code and suggest comprehensive improvements:

\`\`\`typescript
${testCode}
\`\`\`

Return your suggestions as a JSON object with the following categories:
{
  "refactoringSuggestions": ["Suggestion 1", "Suggestion 2", ...],
  "coverageSuggestions": ["Suggestion 1", "Suggestion 2", ...],
  "performanceSuggestions": ["Suggestion 1", "Suggestion 2", ...],
  "maintenanceSuggestions": ["Suggestion 1", "Suggestion 2", ...]
}`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
      model: this.defaultModel,
    };

    Logger.info("Generating test improvements");
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error(
        "Failed to generate test improvements",
        new Error(response.error),
      );
      return {
        refactoringSuggestions: [],
        coverageSuggestions: [],
        performanceSuggestions: [],
        maintenanceSuggestions: [],
      };
    }

    try {
      // Extract and parse the JSON response
      const responseText = response.text.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (error) {
      Logger.warn(
        "Failed to parse test improvements JSON",
        error instanceof Error ? error : new Error(String(error)),
      );

      // Fallback to empty improvements
      return {
        refactoringSuggestions: [
          "Consider breaking down complex tests into smaller ones",
        ],
        coverageSuggestions: ["Add more edge case testing"],
        performanceSuggestions: [
          "Review wait operations for performance impact",
        ],
        maintenanceSuggestions: ["Add more descriptive comments"],
      };
    }
  }

  /**
   * Extract common test patterns from an existing test suite
   * @param testFiles - Array of test file contents
   */
  async extractTestPatterns(testFiles: string[]): Promise<string[]> {
    const systemPrompt = `You are a test pattern recognition expert. Extract common patterns from test files.`;

    const prompt = `Analyze these test files and extract common patterns, idioms, and best practices:

${testFiles.map((file, index) => `TEST FILE ${index + 1}:\n\`\`\`typescript\n${file}\n\`\`\`\n`).join("\n")}

Return a JSON array of patterns you've identified, with each entry being a string describing the pattern.`;

    const request: LLMRequest = {
      prompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1500,
      model: this.defaultModel,
    };

    Logger.info("Extracting test patterns");
    const response = await this.llmService.generateText(request);

    if (!response.success) {
      Logger.error(
        "Failed to extract test patterns",
        new Error(response.error),
      );
      return [];
    }

    try {
      // Parse the JSON array response
      return JSON.parse(response.text);
    } catch (error) {
      Logger.warn(
        "Failed to parse test patterns JSON",
        error instanceof Error ? error : new Error(String(error)),
      );

      // Fallback to extracting patterns from text
      return this.extractPatternsFromText(response.text);
    }
  }

  /**
   * Extract patterns from text when JSON parsing fails
   * @param text - The response text
   */
  private extractPatternsFromText(text: string): string[] {
    const patterns: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      // Look for numbered or bulleted list items
      const match = line.match(/^(\d+[\.\)]\s*|[-*•]\s*)(.+)/);
      if (match) {
        patterns.push(match[2].trim());
      }
    }

    return patterns.length > 0 ? patterns : [text.trim()];
  }
}
