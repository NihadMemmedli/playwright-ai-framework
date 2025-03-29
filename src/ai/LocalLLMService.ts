import axios from "axios";
import { Logger } from "../utils/Logger";

export interface LLMRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface MultimodalLLMRequest extends LLMRequest {
  images?: string[]; // Array of base64 encoded images
}

/**
 * Service for interacting with local LLM using Ollama
 */
export class LocalLLMService {
  private baseUrl: string;
  private defaultModel: string;

  /**
   * Create a new LocalLLMService
   * @param baseUrl - The base URL for Ollama API (default: http://localhost:11434/api)
   * @param defaultModel - The default model to use (default: llama3:latest)
   */
  constructor(
    baseUrl: string = "http://localhost:11434/api",
    defaultModel: string = "llama3:latest",
  ) {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    Logger.info(`LocalLLMService initialized with model: ${defaultModel}`);
  }

  /**
   * Generate text using the local LLM
   * @param request - The LLM request parameters
   */
  async generateText(request: LLMRequest): Promise<LLMResponse> {
    try {
      Logger.info(
        `Generating text with model: ${request.model || this.defaultModel}`,
      );

      const response = await axios.post(`${this.baseUrl}/generate`, {
        model: request.model || this.defaultModel,
        prompt: request.prompt,
        system: request.systemPrompt,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
        stream: false,
      });

      return {
        text: response.data.response,
        success: true,
      };
    } catch (error) {
      Logger.error(
        "Error calling local LLM",
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate text using the local LLM, potentially with images
   * @param request - The multimodal LLM request parameters
   */
  async generateMultimodalResponse(
    request: MultimodalLLMRequest,
  ): Promise<LLMResponse> {
    try {
      const modelToUse = request.model || this.defaultModel;
      Logger.info(
        `Generating multimodal response with model: ${modelToUse}`,
      );

      const payload: any = {
        model: modelToUse,
        prompt: request.prompt,
        system: request.systemPrompt,
        temperature: request.temperature || 0.2, // Lower temp for more deterministic visual analysis
        max_tokens: request.maxTokens || 1000,
        stream: false,
      };

      if (request.images && request.images.length > 0) {
         payload.images = request.images;
       } else {
         Logger.warn("generateMultimodalResponse called without images.");
       }

       // Increase max_tokens for potentially longer JSON responses from visual analysis
       payload.max_tokens = request.maxTokens || 2048; // Increased from 1000

       // Ensure correct JSON structure when sending payload
       const response = await axios.post(`${this.baseUrl}/generate`, payload, {
         headers: {
           'Content-Type': 'application/json',
         },
       });

       return {
        text: response.data.response,
        success: true,
      };
    } catch (error) {
      Logger.error(
        "Error calling local LLM for multimodal response",
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if the model is available
   */
  async isModelAvailable(model: string = this.defaultModel): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`);
      const availableModels = response.data.models || [];
      return availableModels.some((m: any) => m.name === model);
    } catch (error) {
      Logger.error(
        "Error checking model availability",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  /**
   * List all available models
   */
  async listAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`);
      const models = response.data.models || [];
      return models.map((m: any) => m.name);
    } catch (error) {
      Logger.error(
        "Error listing models",
        error instanceof Error ? error : new Error(String(error)),
      );
      return [];
    }
  }
}
