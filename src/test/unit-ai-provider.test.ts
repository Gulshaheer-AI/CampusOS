import { describe, it, expect } from "vitest";
import { generateTutorResponse } from "@/lib/ai-provider";

describe("AI Tutor Provider Engine", () => {
  it("generates structured pedagogical response for binary search topic", async () => {
    const res = await generateTutorResponse({
      conversationId: "test-conv",
      userPrompt: "How does binary search work?",
      subject: "Algorithms",
      level: "beginner",
      style: "step_by_step",
      history: [],
    });

    expect(res.message.content).toContain("Binary Search");
    expect(res.message.role).toBe("assistant");
    expect(res.isDemoMode).toBe(true);
    expect(res.message.codeSnippet).toBeDefined();
    expect(res.message.codeSnippet?.language).toBe("typescript");
    expect(res.message.suggestedFollowups?.length).toBeGreaterThan(0);
  });

  it("produces visual ASCII diagram representation when visual style is selected", async () => {
    const res = await generateTutorResponse({
      conversationId: "test-conv-2",
      userPrompt: "Explain binary search visually",
      subject: "Algorithms",
      level: "intermediate",
      style: "visual",
      history: [],
    });

    expect(res.message.content).toContain("low");
    expect(res.message.content).toContain("high");
    expect(res.message.content).toContain("mid");
  });

  it("rejects empty prompt submissions gracefully", async () => {
    await expect(
      generateTutorResponse({
        conversationId: "test-conv-3",
        userPrompt: "   ",
        subject: "Algorithms",
        level: "intermediate",
        style: "step_by_step",
        history: [],
      })
    ).rejects.toThrow("Prompt cannot be empty");
  });
});
