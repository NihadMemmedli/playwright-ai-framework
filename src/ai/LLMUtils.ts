import { exec } from "child_process";
import { promisify } from "util";
import { LocalLLMService } from "./LocalLLMService";
import { Logger } from "../utils/Logger";

const execPromise = promisify(exec);

/**
 * Utility functions for working with Ollama LLMs
 */
export class LLMUtils {
  /**
   * Check if Ollama is installed
   */
  static async isOllamaInstalled(): Promise<boolean> {
    try {
      const { stdout } = await execPromise("which ollama");
      return stdout.trim().length > 0;
    } catch (error) {
      Logger.warn(
        "Ollama is not installed",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Check if Ollama is running
   */
  static async isOllamaRunning(): Promise<boolean> {
    try {
      const llmService = new LocalLLMService();
      const models = await llmService.listAvailableModels();
      return models.length > 0;
    } catch (error) {
      Logger.warn(
        "Ollama is not running",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Start Ollama if not running
   */
  static async startOllama(): Promise<boolean> {
    try {
      // Check if already running
      if (await this.isOllamaRunning()) {
        Logger.info("Ollama is already running");
        return true;
      }

      Logger.info("Starting Ollama...");

      // Run in background
      await execPromise("ollama serve &");

      // Wait for Ollama to start
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (await this.isOllamaRunning()) {
          Logger.info("Ollama started successfully");
          return true;
        }
      }

      Logger.error("Failed to start Ollama after multiple attempts");
      return false;
    } catch (error) {
      Logger.error(
        "Error starting Ollama",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Check if a specific model is available
   */
  static async isModelAvailable(modelName: string): Promise<boolean> {
    try {
      const llmService = new LocalLLMService();
      return await llmService.isModelAvailable(modelName);
    } catch (error) {
      Logger.error(
        `Error checking if model ${modelName} is available`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Pull a model if not available
   */
  static async pullModelIfNeeded(modelName: string): Promise<boolean> {
    try {
      if (await this.isModelAvailable(modelName)) {
        Logger.info(`Model ${modelName} is already available`);
        return true;
      }

      Logger.info(`Model ${modelName} not found, pulling...`);
      const { stdout, stderr } = await execPromise(`ollama pull ${modelName}`);

      Logger.info(`Pull model output: ${stdout}`);
      if (stderr) {
        Logger.warn(`Pull model stderr: ${stderr}`);
      }

      return await this.isModelAvailable(modelName);
    } catch (error) {
      Logger.error(
        `Failed to pull model ${modelName}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * Get a recommended model based on system capabilities
   */
  static getRecommendedModel(): string {
    // We have llama3:latest and mistral:latest available
    return "llama3:latest";
  }
}
