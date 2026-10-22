import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithAutoFallback } from "@/lib/gemini";

export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceNotes = "",
      topic = "Data Structures",
      difficulty = "intermediate",
      questionCount = 3,
    } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.CAMPUSOS_AI_KEY ||
      "";

    if (!apiKey) {
      // Demo response
      return NextResponse.json({
        title: `${topic} Assessment (${difficulty})`,
        questions: [
          {
            id: `q-${Date.now()}-1`,
            text: `What is the primary computational benefit when applying ${topic} invariants?`,
            type: "multiple_choice",
            options: [
              "Guaranteed optimal runtime bounds",
              "Reduction of memory overhead",
              "Simplified compiler optimization",
              "Automated type checking",
            ],
            correctAnswer: 0,
            explanation: `Applying invariants ensures the algorithm guarantees correct termination within optimal complexity bounds.`,
            topic,
            difficulty,
          },
        ],
        modelUsed: "CampusOS Pedagogical Generator (Demo)",
      });
    }

    const systemPrompt = `You are the CampusOS Assessment Engineer. 
Generate a high-quality academic quiz based on the user's provided notes/topic.
Output STRICT JSON format matching this schema:
{
  "title": string,
  "questions": [
    {
      "id": string,
      "text": string,
      "type": "multiple_choice",
      "options": string[],
      "correctAnswer": number,
      "explanation": string,
      "topic": string,
      "difficulty": "beginner" | "intermediate" | "advanced"
    }
  ]
}`;

    const promptText = `Generate ${questionCount} multiple choice questions for topic "${topic}" at difficulty "${difficulty}".
Source Reference / Uploaded Notes:
${sourceNotes ? sourceNotes.slice(0, 3000) : "Use standard university curriculum principles."}`;

    const result = await callGeminiWithAutoFallback({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      systemInstruction: systemPrompt,
      temperature: 0.4,
      apiKey,
      preferredModel: "gemini-3.1-flash-lite",
    });

    // Parse JSON from response text
    let parsed: any;
    try {
      const jsonMatch = result.text.match(/```json([\s\S]*?)```/) || [null, result.text];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      // Fallback object if LLM formatting had markdown wrap
      const clean = result.text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    }

    return NextResponse.json({
      ...parsed,
      modelUsed: result.modelUsed,
      fallbackTriggered: result.fallbackTriggered,
    });
  } catch (err: any) {
    console.warn("[API/AI/QUIZ] Failed to generate quiz with upstream Gemini, returning fallback:", err);
    return NextResponse.json({
      title: "Generated Course Practice Quiz",
      questions: [
        {
          id: `q-fallback-1`,
          text: "Which Big-O complexity represents a divide-and-conquer recurrence T(N) = T(N/2) + O(1)?",
          type: "multiple_choice",
          options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
          correctAnswer: 1,
          explanation: "Halving the subproblem size with constant work per step produces a logarithmic O(log N) depth.",
          topic: "Complexity Analysis",
          difficulty: "intermediate",
        },
      ],
      modelUsed: "CampusOS Emergency Backup",
    });
  }
}
