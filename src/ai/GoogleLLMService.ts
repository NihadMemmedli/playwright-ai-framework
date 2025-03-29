// Correct imports using the correct package name and named exports
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerateContentRequest, // Type for the request payload
  Part, // Type for content parts (text, images)
} from "@google/generative-ai"; // Correct package name

import { Config } from "../config/config";
import { Logger } from "../utils/Logger";
import {
  ILLMService,
  LLMRequest,
  LLMResponse,
  MultimodalLLMRequest,
} from "./ILLMService";

// Mapping from base64 prefix to MIME type
const base64MimeMap: { [key: string]: string } = {
  "iVBORw0KGgo": "image/png",
  "/9j/": "image/jpeg",
  "R0lGODlh": "image/gif",
  "UklGR": "image/webp",
};

function getMimeTypeFromBase64(base64String: string): string | undefined {
  for (const prefix in base64MimeMap) {
    if (base64String.startsWith(prefix)) {
      return base64MimeMap[prefix];
    }
  }
  // Default or fallback if prefix not recognized
  Logger.warn("Could not determine MIME type from base64 prefix, defaulting to image/png");
  return "image/png";
}


export class GoogleLLMService implements ILLMService {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;

  constructor() {
    if (!Config.googleApiKey) {
      throw new Error(
        "Google API Key (GOOGLE_API_KEY) is not configured in environment variables.",
      );
    }
    this.genAI = new GoogleGenerativeAI(Config.googleApiKey);
    this.defaultModel = Config.googleGeminiModel || "gemini-pro"; // Default to gemini-pro if not set
    Logger.info(
      `GoogleLLMService initialized with default model: ${this.defaultModel}`,
    );
  }

  private async executeGeneration(
    modelName: string,
    requestPayload: GenerateContentRequest,
  ): Promise<LLMResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(requestPayload);
      const response = result.response;
      const text = response.text();
      return {
        text: text,
        success: true,
      };
    } catch (error) {
      Logger.error(
        `Error calling Google Gemini API with model ${modelName}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const modelToUse = request.model || this.defaultModel;
    Logger.info(`Generating text with Google Gemini model: ${modelToUse}`);

    // Note: Gemini API handles system prompts differently. It's often part of the initial message history or specific config.
    // Here, we'll prepend it to the user prompt if provided.
    const fullPrompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.prompt}`
      : request.prompt;

    const generationConfig = {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 1000,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const requestPayload: GenerateContentRequest = {
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig,
      safetySettings,
    };

    return this.executeGeneration(modelToUse, requestPayload);
  }

  async generateMultimodalResponse(
    request: MultimodalLLMRequest,
  ): Promise<LLMResponse> {
    // Ensure a vision-capable model is used. Default or override if needed.
    // Let's assume the configured model can handle vision, or default to a known vision model.
    // A better approach might be a separate config variable like GOOGLE_GEMINI_VISION_MODEL.
    const modelToUse = request.model || Config.googleGeminiModel || "gemini-pro-vision";
    Logger.info(
      `Generating multimodal response with Google Gemini model: ${modelToUse}`,
    );

    if (!request.images || request.images.length === 0) {
      Logger.warn("generateMultimodalResponse called without images. Falling back to generateText.");
      // Fallback to text generation if no images provided
      return this.generateText(request);
    }

    const imageParts: Part[] = request.images.map((base64String) => {
      const mimeType = getMimeTypeFromBase64(base64String);
      if (!mimeType) {
         // Handle cases where MIME type couldn't be determined, maybe throw error or skip image
         Logger.error("Could not determine MIME type for image, skipping.");
         // Returning an empty part might cause issues, consider how to handle this robustly
         return { text: "[Error: Invalid image format]" }; // Placeholder
      }
      return {
        inlineData: {
          mimeType: mimeType,
          data: base64String,
        },
      };
    });


    // Combine prompt text and image parts
    const promptParts: Part[] = [{ text: request.prompt }, ...imageParts];

    // Prepend system prompt if available
    const fullPromptContent = request.systemPrompt
      ? [{ role: "user", parts: [{ text: request.systemPrompt }] }, { role: "user", parts: promptParts }]
      : [{ role: "user", parts: promptParts }];


    const generationConfig = {
      temperature: request.temperature ?? 0.2, // Lower temp for visual analysis
      maxOutputTokens: request.maxTokens ?? 2048, // Allow more tokens for potentially detailed analysis
    };

     const safetySettings = [ // Re-apply safety settings for multimodal
       { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
     ];

    const requestPayload: GenerateContentRequest = {
      contents: fullPromptContent,
      generationConfig,
      safetySettings,
    };

    return this.executeGeneration(modelToUse, requestPayload);
  }
}
