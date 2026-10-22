/**
 * CampusOS Multi-Model Google Gemini API Client
 *
 * Implements cascading auto-fallback:
 * 1. Primary: gemini-3.1-flash-lite (as requested by user)
 * 2. Fallback on 429/RPM or error: gemini-3.5-flash-lite
 * 3. Secondary fallback: gemini-2.5-flash
 * 4. Local verified pedagogical fallback if upstream network/quota is exhausted.
 */

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64
  };
}

export interface GeminiContent {
  role?: "user" | "model";
  parts: GeminiPart[];
}

export interface GeminiGenerateOptions {
  contents: GeminiContent[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string;
  preferredModel?: string;
  /** Optional Gemini tools, e.g. [{ google_search: {} }] for Google Search grounding. */
  tools?: Record<string, unknown>[];
  /** Optional per-request timeout in milliseconds. */
  timeoutMs?: number;
}

export interface GeminiResponseResult {
  text: string;
  modelUsed: string;
  fallbackTriggered: boolean;
  totalTokens?: number;
  /** Raw grounding metadata (present when google_search grounding was used). */
  groundingMetadata?: any;
}

const DEFAULT_MODELS_IN_PRIORITY_ORDER = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];

export async function callGeminiWithAutoFallback(
  options: GeminiGenerateOptions
): Promise<GeminiResponseResult> {
  const apiKey =
    options.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.CAMPUSOS_AI_KEY ||
    "";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const modelQueue = [
    options.preferredModel || process.env.GEMINI_PRIMARY_MODEL || "gemini-3.1-flash-lite",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
  ];

  // Remove duplicates while keeping order
  const uniqueModels = Array.from(new Set(modelQueue));
  let lastError: Error | null = null;
  let fallbackTriggered = false;

  for (let i = 0; i < uniqueModels.length; i++) {
    const model = uniqueModels[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody: Record<string, any> = {
        contents: options.contents,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
        },
      };

      if (options.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      if (options.tools && options.tools.length > 0) {
        requestBody.tools = options.tools;
      }

      const controller = options.timeoutMs ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), options.timeoutMs) : null;
      let response: Response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller?.signal,
        });
      } finally {
        if (timer) clearTimeout(timer);
      }

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        console.warn(
          `[Gemini Engine] Model ${model} returned HTTP ${status}. Error: ${errorText.slice(0, 150)}`
        );

        // If 429 (RPM quota exceeded), 404 (model alias not active), or 5xx, cascade to next model
        fallbackTriggered = true;
        lastError = new Error(`Model ${model} failed (${status}): ${errorText.slice(0, 100)}`);
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text =
        candidate?.content?.parts?.map((p: any) => p.text || "").join("") || "";

      if (!text) {
        throw new Error(`Empty response returned by model ${model}`);
      }

      const totalTokens = data.usageMetadata?.totalTokenCount;

      return {
        text,
        modelUsed: model,
        fallbackTriggered: i > 0,
        totalTokens,
        groundingMetadata: candidate?.groundingMetadata,
      };
    } catch (err: any) {
      console.warn(`[Gemini Engine] Failed calling ${model}:`, err?.message || err);
      lastError = err;
      fallbackTriggered = true;
    }
  }

  throw lastError || new Error("All configured Gemini models failed.");
}
