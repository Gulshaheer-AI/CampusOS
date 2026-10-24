import { TutorMessage, TutorStyle } from "@/types";
import { callGeminiWithAutoFallback, GeminiPart } from "./gemini";

export interface AttachedMedia {
  mimeType: string;
  dataBase64: string;
}

export interface AttachedRagChunk {
  fileName: string;
  section: number;
  content: string;
}

export interface GenerateTutorResponseParams {
  conversationId: string;
  userPrompt: string;
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  style: TutorStyle;
  history: TutorMessage[];
  image?: AttachedMedia;
  ragChunks?: AttachedRagChunk[];
  preferredModel?: string;
}

export interface TutorResponseResult {
  message: TutorMessage;
  isDemoMode: boolean;
  modelUsed: string;
  fallbackTriggered?: boolean;
}

// In-memory rate limiting map: ipOrUserId -> array of timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

export function checkRateLimit(clientKey: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientKey) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  validTimestamps.push(now);
  rateLimitMap.set(clientKey, validTimestamps);
  return { allowed: true };
}

export async function generateTutorResponse({
  conversationId,
  userPrompt,
  subject,
  level,
  style,
  history,
  image,
  ragChunks,
  preferredModel,
}: GenerateTutorResponseParams): Promise<TutorResponseResult> {
  // Input validation
  const sanitizedPrompt = userPrompt.trim();
  if (!sanitizedPrompt) {
    throw new Error("Prompt cannot be empty");
  }
  if (sanitizedPrompt.length > 5000) {
    throw new Error("Prompt exceeds maximum length of 5000 characters");
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.CAMPUSOS_AI_KEY ||
    "";

  // Try real Gemini multi-model call with auto-fallback (3.1 flash lite -> 3.5 flash lite -> 2.5 flash)
  if (apiKey) {
    try {
      const parts: GeminiPart[] = [];

      // If user attached an image, pass it to Gemini Vision
      if (image && image.dataBase64) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType || "image/png",
            data: image.dataBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }

      // If RAG chunks are present, inject grounding context
      let promptText = sanitizedPrompt;
      const citations: string[] = [];

      if (ragChunks && ragChunks.length > 0) {
        const ragContext = ragChunks
          .map((c, i) => {
            citations.push(`${c.fileName} (Section ${c.section})`);
            return `[SOURCE ${i + 1}: ${c.fileName} - Section ${c.section}]\n${c.content}`;
          })
          .join("\n\n---\n\n");

        promptText = `[GROUNDED RAG KNOWLEDGE BASE]
You are a university academic tutor for ${subject}. The student uploaded these documents.
Use this context to inform your answer. Explicitly cite the source filenames when using their facts:

${ragContext}

[STUDENT QUESTION]:
${sanitizedPrompt}`;
      }

      parts.push({ text: promptText });

      const systemInstruction = `You are the CampusOS Academic AI Tutor, a patient, intellectually rigorous educator teaching ${subject} at a ${level} level.
Adopt the '${style}' teaching methodology.
Answer naturally and directly, adapting length and tone to the student's question. Use headings or lists only when they clarify a longer explanation. Include practical examples and fenced, language-labeled code when useful. Do not force a response template, closing section, or follow-up questions. Cite uploaded sources for claims drawn from them; say when the sources are insufficient.`;

      const geminiResult = await callGeminiWithAutoFallback({
        contents: [
          ...history.slice(-4).map((h) => ({
            role: (h.role === "assistant" ? "model" : "user") as "user" | "model",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts,
          },
        ],
        systemInstruction,
        temperature: 0.7,
        apiKey,
        preferredModel: preferredModel || "gemini-3.1-flash-lite",
      });

      // Extract code block if present
      let codeSnippet: { language: string; code: string } | undefined;
      const codeBlockMatch = geminiResult.text.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        codeSnippet = {
          language: codeBlockMatch[1] || "typescript",
          code: codeBlockMatch[2].trim(),
        };
      }

      // Extract follow-ups
      const suggestedFollowups: string[] = [];
      const followUpSection = geminiResult.text.split(/### (?:Next Steps|Suggested Follow-ups|Inquiries)/i)[1];
      if (followUpSection) {
        const lines = followUpSection
          .split("\n")
          .map((l) => l.replace(/^[-*•0-9.]+\s*/, "").trim())
          .filter((l) => l.length > 10 && l.endsWith("?"));
        suggestedFollowups.push(...lines.slice(0, 3));
      }

      if (suggestedFollowups.length === 0) {
        suggestedFollowups.push(
          `Can you provide another practical example in ${subject}?`,
          "What are the most common exam traps for this topic?",
          "Can you test my recall with a quick 2-question checkpoint?"
        );
      }

      return {
        message: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conversationId,
          role: "assistant",
          content: geminiResult.text,
          codeSnippet,
          citations: citations.length > 0 ? Array.from(new Set(citations)) : undefined,
          suggestedFollowups,
          createdAt: new Date().toISOString(),
        },
        isDemoMode: false,
        modelUsed: geminiResult.modelUsed,
        fallbackTriggered: geminiResult.fallbackTriggered,
      };
    } catch (err) {
      console.warn("[CampusOS AI] Live Gemini call failed or quota finished. Engaging verified pedagogical fallback engine:", err);
    }
  }

  // High-fidelity pedagogical local AI engine (Verified Fallback Mode)
  const lower = sanitizedPrompt.toLowerCase();
  let content = "";
  let codeSnippet: { language: string; code: string } | undefined;
  const citations: string[] = [];
  const suggestedFollowups: string[] = [];

  const stylePrefix = "";

  // Check if Grounded RAG chunks were retrieved
  if (ragChunks && ragChunks.length > 0) {
    // Populate citations
    for (const c of ragChunks) {
      citations.push(`${c.fileName} (Section ${c.section})`);
    }

    const primaryChunk = ragChunks[0];
    const sourceFilename = primaryChunk.fileName;

    // Check if any chunk contains code
    for (const c of ragChunks) {
      const codeMatch = c.content.match(/```(\w+)?\n([\s\S]*?)```/) || c.content.match(/(function|const|let|def|class|SELECT|public)\s+[\s\S]{10,250}/);
      if (codeMatch && !codeSnippet) {
        if (codeMatch[2]) {
          codeSnippet = {
            language: codeMatch[1] || "typescript",
            code: codeMatch[2].trim(),
          };
        } else {
          codeSnippet = {
            language: "typescript",
            code: codeMatch[0].trim(),
          };
        }
      }
    }

    // Synthesize grounded response directly from chunks
    const chunkSnippets = ragChunks
      .map((c, idx) => {
        const cleanContent = c.content.trim();
        return `**${c.fileName}, section ${c.section}**\n\n${cleanContent}`;
      })
      .join("\n\n");

    content = `The live tutor is unavailable. These relevant passages from your uploaded materials may help:\n\n${chunkSnippets}`;

    suggestedFollowups.push(
      `Can you explain the main principles from ${sourceFilename} in more detail?`,
      `How are the concepts in ${sourceFilename} tested in exams?`,
      `Can you generate a 3-question practice quiz based on ${sourceFilename}?`
    );
  } else if (lower.includes("binary search") || lower.includes("search")) {
    citations.push("CS101 Lecture 04: Divide-and-Conquer Search Invariants");
    suggestedFollowups.push(
      "How do we prevent 32-bit integer overflow in the midpoint calculation?",
      "Can we use binary search on a rotated sorted array?",
      "Can you generate 3 practice exam questions on binary search?"
    );

    codeSnippet = {
      language: "typescript",
      code: `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    // Avoid integer overflow for massive array bounds
    const mid = low + Math.floor((high - low) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1; // Target absent
}`,
    };

    if (style === "visual") {
      content = `${stylePrefix}
\`\`\`
Sorted Array: [ 2,  5,  8,  12,  16,  23,  38,  45,  56 ]
Indices:        0   1   2    3    4    5    6    7    8
               ▲                     ▲                  ▲
              low                   mid                high
\`\`\`

1. Evaluate middle item: \`arr[4] = 16\`.
2. Compare: Is Target > 16? Yes!
3. Eliminate left half instantly: Next search space is indices [5..8].
4. Each iteration bisects remaining candidates: \`O(log N)\`.`;
    } else {
      content = `${stylePrefix}**Binary Search** is a divide-and-conquer algorithm designed for ordered collections. Rather than scanning each element sequentially in O(N), it inspects the middle value and discards half the remaining candidates with every comparison.

### Invariants & Complexity:
- **Precondition**: The collection MUST be monotonically sorted.
- **Worst-case runtime**: $O(\\log N)$ because the problem size is halved at each step ($N, N/2, N/4, \\dots, 1$).
- **Space complexity**: $O(1)$ iterative, or $O(\\log N)$ recursive auxiliary stack space.
- **Midpoint arithmetic invariant**: Always compute \`mid = low + ((high - low) >> 1)\` to prevent integer wrap-around.`;
    }
  } else if (lower.includes("join") || lower.includes("sql")) {
    citations.push("CS210 Relational Algebra & Database Systems");
    suggestedFollowups.push(
      "When is an OUTER join preferred over an INNER join?",
      "How do database B-Tree indexes speed up nested loop joins?",
      "What is the difference between LEFT JOIN and FULL OUTER JOIN?"
    );

    codeSnippet = {
      language: "sql",
      code: `-- Return all students and their enrolled course (if any)
SELECT 
  s.student_id, 
  s.name, 
  e.course_code
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id;`,
    };

    content = `${stylePrefix}Relational joins combine tuples from two relations based on a common matching predicate.

### Core Join Types:
1. **INNER JOIN**: Returns only tuples where the predicate matches in BOTH tables.
2. **LEFT JOIN (Left Outer)**: Guarantees every row from the left table is returned, filling missing right table attributes with \`NULL\`.
3. **RIGHT JOIN**: Symmetric to LEFT JOIN; preserves all right table rows.
4. **FULL OUTER JOIN**: Preserves rows from both sides regardless of whether a matching counterpart exists.`;
  } else {
    citations.push("CampusOS Core Curriculum Library");
    suggestedFollowups.push(
      `Can you give me a practical exercise for this topic?`,
      "What are the performance tradeoffs to consider?",
      "Can you create a quiz question based on this?"
    );

    content = `The live tutor is unavailable right now, and the local lesson library does not contain a specific answer to “${sanitizedPrompt}”. Upload relevant notes or try again when the live model is available.`;
  }

  return {
    message: {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      role: "assistant",
      content,
      codeSnippet,
      citations: citations.length > 0 ? citations : undefined,
      suggestedFollowups,
      createdAt: new Date().toISOString(),
    },
    isDemoMode: true,
    modelUsed: "CampusOS Local Tutor",
    fallbackTriggered: Boolean(apiKey),
  };
}
