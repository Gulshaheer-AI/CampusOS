import { describe, it, expect } from "vitest";
import { evaluateQuizSubmission, calculateRoadmapProgress } from "@/lib/scoring";
import { Question } from "@/types";

describe("Quiz Scoring Engine", () => {
  const sampleQuestions: Question[] = [
    {
      id: "q1",
      text: "What is the runtime of binary search?",
      type: "multiple_choice",
      options: ["O(1)", "O(log N)", "O(N)"],
      correctAnswer: 1,
      explanation: "Binary search halves the remaining search space.",
      topic: "Algorithms",
      difficulty: "beginner",
    },
    {
      id: "q2",
      text: "Is binary search applicable to unsorted arrays?",
      type: "true_false",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "Binary search requires monotonic order.",
      topic: "Algorithms",
      difficulty: "beginner",
    },
    {
      id: "q3",
      text: "Which SQL clause joins tables?",
      type: "short_answer",
      correctAnswer: "join",
      explanation: "JOIN combines tables.",
      topic: "Databases",
      difficulty: "intermediate",
    },
  ];

  it("calculates 100% score when all answers are correct", () => {
    const userAnswers = {
      q1: 1,
      q2: 1,
      q3: "join",
    };
    const result = evaluateQuizSubmission(sampleQuestions, userAnswers, 70);

    expect(result.scorePercentage).toBe(100);
    expect(result.correctCount).toBe(3);
    expect(result.passed).toBe(true);
    expect(result.weakTopics).toHaveLength(0);
  });

  it("flags weak topics when topic score is below 70%", () => {
    const userAnswers = {
      q1: 1,
      q2: 0, // incorrect for q2 (Algorithms)
      q3: "join", // correct for q3 (Databases)
    };
    const result = evaluateQuizSubmission(sampleQuestions, userAnswers, 70);

    expect(result.scorePercentage).toBe(67);
    expect(result.correctCount).toBe(2);
    expect(result.passed).toBe(false);
    expect(result.weakTopics).toContain("Algorithms");
    expect(result.weakTopics).not.toContain("Databases");
  });

  it("handles case-insensitive and trimmed short answers correctly", () => {
    const userAnswers = {
      q1: 1,
      q2: 1,
      q3: "   JOIN   ", // extra whitespace and uppercase
    };
    const result = evaluateQuizSubmission(sampleQuestions, userAnswers, 70);
    expect(result.questionResults[2].isCorrect).toBe(true);
  });
});

describe("Roadmap Progress Calculation", () => {
  it("calculates accurate percentage from nested weeks and tasks", () => {
    const weeks = [
      {
        tasks: [{ completed: true }, { completed: true }],
      },
      {
        tasks: [{ completed: false }, { completed: false }],
      },
    ];

    const stats = calculateRoadmapProgress(weeks);
    expect(stats.totalTasks).toBe(4);
    expect(stats.completedTasks).toBe(2);
    expect(stats.percentage).toBe(50);
  });

  it("returns 0% when there are no completed tasks", () => {
    const weeks = [
      {
        tasks: [{ completed: false }],
      },
    ];
    const stats = calculateRoadmapProgress(weeks);
    expect(stats.percentage).toBe(0);
  });
});
