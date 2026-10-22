import { Question } from "@/types";
export { formatTimeRemaining } from "./utils";

export interface ScoreResult {
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  questionResults: {
    questionId: string;
    isCorrect: boolean;
    userAnswer: string | number | undefined;
    correctAnswer: string | number;
    explanation: string;
    topic: string;
  }[];
  weakTopics: string[];
  topicScores: Record<string, { correct: number; total: number; percentage: number }>;
}

export function evaluateQuizSubmission(
  questions: Question[],
  userAnswers: Record<string, string | number | undefined>,
  passingPercentage: number = 70
): ScoreResult {
  let correctCount = 0;
  const questionResults: ScoreResult["questionResults"] = [];
  const topicCounts: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q) => {
    const rawUserAnswer = userAnswers[q.id];
    let isCorrect = false;

    if (q.type === "multiple_choice" || q.type === "true_false") {
      isCorrect = Number(rawUserAnswer) === Number(q.correctAnswer);
    } else {
      // short_answer
      const userStr = String(rawUserAnswer || "").trim().toLowerCase();
      const correctStr = String(q.correctAnswer).trim().toLowerCase();
      isCorrect = userStr.length > 0 && (userStr === correctStr || userStr.includes(correctStr));
    }

    if (isCorrect) {
      correctCount++;
    }

    const topic = q.topic || "General";
    if (!topicCounts[topic]) {
      topicCounts[topic] = { correct: 0, total: 0 };
    }
    topicCounts[topic].total += 1;
    if (isCorrect) {
      topicCounts[topic].correct += 1;
    }

    questionResults.push({
      questionId: q.id,
      isCorrect,
      userAnswer: rawUserAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topic,
    });
  });

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = scorePercentage >= passingPercentage;

  const topicScores: Record<string, { correct: number; total: number; percentage: number }> = {};
  const weakTopics: string[] = [];

  for (const [topic, stats] of Object.entries(topicCounts)) {
    const pct = Math.round((stats.correct / stats.total) * 100);
    topicScores[topic] = {
      correct: stats.correct,
      total: stats.total,
      percentage: pct,
    };
    if (pct < 70) {
      weakTopics.push(topic);
    }
  }

  return {
    scorePercentage,
    correctCount,
    totalQuestions,
    passed,
    questionResults,
    weakTopics,
    topicScores,
  };
}

export function calculateRoadmapProgress(
  weeks: { tasks: { completed: boolean }[] }[]
): { completedTasks: number; totalTasks: number; percentage: number } {
  let completedTasks = 0;
  let totalTasks = 0;

  weeks.forEach((w) => {
    w.tasks.forEach((t) => {
      totalTasks++;
      if (t.completed) completedTasks++;
    });
  });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return { completedTasks, totalTasks, percentage };
}
