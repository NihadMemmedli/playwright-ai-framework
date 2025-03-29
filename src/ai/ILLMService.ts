/**
 * Defines the common interface and data structures for interacting
 * with different Large Language Model (LLM) services (local or cloud).
 */

export interface LLMRequest {
  prompt: string;
  model?: string; // Model name specific to the service (e.g., 'llama3' or 'gemini-pro')
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

export interface ILLMService {
  /**
   * Generate text based on a prompt.
   * @param request - The parameters for the text generation request.
   * @returns A promise resolving to the LLM response.
   */
  generateText(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Generate text based on a prompt and optional images.
   * @param request - The parameters for the multimodal generation request.
   * @returns A promise resolving to the LLM response.
   */
  generateMultimodalResponse(request: MultimodalLLMRequest): Promise<LLMResponse>;
}
