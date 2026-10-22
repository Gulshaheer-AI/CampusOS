import { NextRequest, NextResponse } from "next/server";
import { generateTutorResponse, checkRateLimit } from "@/lib/ai-provider";

export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-local";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      conversationId = "conv-default",
      userPrompt,
      subject = "General Engineering",
      level = "intermediate",
      style = "step_by_step",
      history = [],
      image,
      ragChunks,
      preferredModel,
    } = body;

    if (!userPrompt || typeof userPrompt !== "string" || !userPrompt.trim()) {
      return NextResponse.json({ error: "Missing required userPrompt" }, { status: 400 });
    }

    const result = await generateTutorResponse({
      conversationId,
      userPrompt,
      subject,
      level,
      style,
      history,
      image,
      ragChunks,
      preferredModel,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API/AI/CHAT Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
