import { Page, expect } from "@playwright/test";
import * as fs from "fs/promises";
import * as path from "path";
// PNG, pixelmatch, and allure removed
import { LocalLLMService, MultimodalLLMRequest } from "../ai/LocalLLMService";
import { Logger } from "../utils/Logger";
import { Config } from "../config/config"; // Use Config class import

// Define default paths
const baselineFolder = path.resolve(
  process.cwd(),
  "tests/visual-baselines",
);
const actualFolder = path.resolve(process.cwd(), "test-results/visual-actuals");

// Ensure directories exist
async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

// Instantiate the LLM Service
const llmService = new LocalLLMService(
  Config.ollamaBaseUrl,
  Config.ollamaDefaultModel,
);
const visualModel = Config.ollamaVisualModel || "llava:latest";

// --- Interface for the return value ---
export interface VisualAIResult {
  passed: boolean;
  reason: string;
  baselinePath: string;
  actualPath: string;
}

/**
 * Performs AI-driven visual comparison of a page screenshot against a baseline.
 * Returns an object indicating pass/fail status and image paths.
 * Instructs AI to return structured JSON.
 */
export async function expectPageToMatchVisuallyAI(
  page: Page,
  baselineName: string,
  options: {
    updateBaselines?: boolean;
    failureThreshold?: number; // Placeholder for now
    mask?: string[]; // Array of locators to mask
  } = {},
): Promise<VisualAIResult> {
  await ensureDir(baselineFolder);
  await ensureDir(actualFolder);

  const baselinePath = path.join(baselineFolder, `${baselineName}.png`);
  const actualPath = path.join(actualFolder, `${baselineName}.png`);

  Logger.info(`Starting AI visual comparison for: ${baselineName}`);

  // Take screenshot
  const screenshotOptions: Parameters<Page["screenshot"]>[0] = {
    path: actualPath,
    fullPage: true,
  };
  if (options.mask && options.mask.length > 0) {
    screenshotOptions.mask = options.mask.map((selector) => page.locator(selector));
  }
  await page.screenshot(screenshotOptions);
  Logger.info(`Actual screenshot saved to: ${actualPath}`);

  const actualBuffer = await fs.readFile(actualPath);
  const actualBase64 = actualBuffer.toString("base64");

  // Check if baseline exists
  let baselineExists = false;
  try {
    await fs.access(baselinePath);
    baselineExists = true;
  } catch {
    baselineExists = false;
  }

  // --- Baseline Creation / Update ---
  if (options.updateBaselines || !baselineExists) {
    await fs.copyFile(actualPath, baselinePath);
    Logger.info(
      `Baseline ${baselineExists ? "updated" : "created"}: ${baselinePath}`,
    );
    return { passed: true, reason: "Baseline created/updated.", baselinePath, actualPath };
  }

  // --- Comparison Logic ---
  Logger.info(`Comparing actual screenshot with baseline: ${baselinePath}`);
  const baselineBuffer = await fs.readFile(baselinePath);
  const baselineBase64 = baselineBuffer.toString("base64");

  // Log image sizes before sending
  Logger.info(`Baseline image base64 size: ${baselineBase64.length} characters`);
  Logger.info(`Actual image base64 size: ${actualBase64.length} characters`);

  // Prepare request for LLM with JSON output instruction - REFINED PROMPT
  const prompt = `
    Analyze the differences between the following two screenshots of a web UI.
    Image 1 is the baseline. Image 2 is the current state.
    Focus STRICTLY on SIGNIFICANT visual regressions that clearly impact user experience or functionality. Examples of SIGNIFICANT regressions include:
    - Missing or newly added interactive elements (buttons, links, form fields).
    - Major layout breaks causing content to overlap, become unreadable, or shift position drastically (e.g., > 10% of viewport width/height).
    - Text content changes that alter core information or instructions.
    - Complete failure to load images or critical sections.
    - Major color changes that affect readability or branding consistency (e.g., white text on white background).

    IGNORE the following types of differences:
    - Minor pixel shifts (less than ~10 pixels).
    - Anti-aliasing or font rendering variations between environments.
    - Subtle color variations (unless they impact readability as mentioned above).
    - Dynamic content like dates, times, or randomly generated data (unless its absence indicates a failure).
    - Minor spacing or alignment differences that don't break the layout.
    - Ad variations or third-party content changes.

    Respond ONLY with a JSON object in the following format, with no other text or markdown:
    If there are NO significant differences based on the criteria above: {"passed": true, "reason": "No significant visual regressions detected."}
    If there ARE significant differences: {"passed": false, "reason": "[Brief description of the MOST significant difference(s) found, focusing on impact]"}
    If you cannot perform the comparison (e.g., missing images): {"passed": false, "reason": "Comparison could not be performed due to missing visual content."}
    `;

  const request: MultimodalLLMRequest = {
    model: visualModel,
    prompt: prompt,
    images: [baselineBase64, actualBase64],
    temperature: 0.1, // Keep temperature low for consistency
    // Consider adding format: "json" if Ollama API supports it for the model
    // systemPrompt: "You are an expert visual QA analyst. Respond only in the requested JSON format." // Optional system prompt
  };

  // Call the LLM
  const response = await llmService.generateMultimodalResponse(request);

  if (!response.success) {
    const errorReason = `LLM service error during comparison for ${baselineName}: ${response.error}`;
    Logger.error(errorReason); // Log the specific error
    return {
        passed: false,
        reason: errorReason, // Include more context in the reason
        baselinePath,
        actualPath
    };
  }

  Logger.info(`Raw AI analysis response for ${baselineName}: ${response.text}`);

  // --- AI Response Interpretation (JSON Parsing) ---
  const analysisResult = interpretAIJsonResponse(response.text); // Using updated function below

  // Return the result object
  return { ...analysisResult, baselinePath, actualPath };
}

// --- Interface for the JSON structure we expect ---
interface AIResponseJson {
    passed: boolean;
    reason: string;
}

// --- Interface for the interpretation result ---
interface AnalysisResult {
  passed: boolean;
  reason: string;
}

// Updated interpretation logic for JSON - More robust extraction and cleaning
function interpretAIJsonResponse(responseText: string): AnalysisResult {
  let jsonString = responseText;

  try {
    // 1. Remove potential markdown fences and surrounding whitespace
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```$/g, '').trim();

    // 2. Find the first '{' and the last '}' to isolate the JSON part
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error("Could not find valid JSON object delimiters {} in response.");
    }
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);

    // 3. Replace unescaped newlines within the string values (simplistic approach)
    // This assumes newlines are only problematic within the "reason" string.
    // A more robust solution might involve a proper JSON string escaping function if needed.
    // jsonString = jsonString.replace(/(?<!\\)\n/g, ' '); // Replace \n only if not preceded by \ (might be too complex/slow)
    // Simpler: Replace all newlines with spaces, potentially flattening intended formatting in 'reason'
    jsonString = jsonString.replace(/\n/g, ' ');
    jsonString = jsonString.replace(/\r/g, ' '); // Handle carriage returns too

    // 4. Attempt to fix missing comma between "passed" and "reason" before parsing
    // Looks for "passed": true/false followed by "reason": without a comma in between
    jsonString = jsonString.replace(/(?<="passed":\s*(?:true|false))(\s*)"reason":/g, ',$1"reason":');
    Logger.info(`Attempting to parse JSON: ${jsonString}`); // Log the string we attempt to parse

    // 5. Parse the cleaned (and potentially fixed) JSON string
    const parsed: AIResponseJson = JSON.parse(jsonString);

    // 6. Validate the parsed structure
    if (typeof parsed.passed === 'boolean' && typeof parsed.reason === 'string') {
      Logger.info(`Parsed AI JSON response: { passed: ${parsed.passed}, reason: "${parsed.reason.substring(0, 50)}..." }`);
      return { passed: parsed.passed, reason: parsed.reason };
    } else {
      Logger.warn("Parsed JSON response lacked expected 'passed' or 'reason' fields.", parsed);
      return { passed: false, reason: `AI response was valid JSON but lacked expected fields: ${responseText.substring(0, 200)}...` };
    }
   } catch (e: unknown) { // Catch as unknown
     // Handle JSON parsing errors
     const errorMessage = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(errorMessage);
      Logger.error("Failed to parse AI response as JSON:", logError);
      // Logger.error expects an Error object for the second argument if provided
      Logger.error("Original response text that failed parsing:", new Error(responseText)); // Wrap original text in Error
      return { passed: false, reason: `AI response could not be parsed as valid JSON: ${errorMessage} (Original: ${responseText.substring(0, 100)}...)` };
    }
}
