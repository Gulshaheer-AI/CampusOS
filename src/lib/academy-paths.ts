import type { Roadmap, Challenge } from "@/types";
import { getAllW3Courses } from "./w3schools-data";
/** Derive roadmap tasks and challenges from the actual lesson catalog, so coverage cannot drift. */
export function academyRoadmaps(): Roadmap[] {
  return getAllW3Courses().map((course) => {
    const groups = Array.from(
      { length: Math.ceil(course.chapters.length / 6) },
      (_, week) => ({
        weekNumber: week + 1,
        title: `${course.name} · Part ${week + 1}`,
        description:
          "Study each concept, run its worked example, then complete the exercise.",
        tasks: course.chapters.slice(week * 6, week * 6 + 6).map((chapter) => ({
          id: `academy-task-${chapter.id}`,
          title: chapter.title,
          type: "exercise" as const,
          completed: false,
          estimatedHours: 1,
          resourceTitle: chapter.title,
          resourceUrl: `/roadmaps?course=${course.id}&chapter=${chapter.id}`,
          syntaxNotes: chapter.sections.map((s) => s.content),
          codeExample: {
            language: course.id,
            starterCode: chapter.tryItYourself.starterCode,
            expectedOutput: chapter.tryItYourself.expectedOutput,
          },
          exercise: {
            prompt: chapter.exercise.prompt,
            codeTemplate: chapter.exercise.codeTemplate,
            answer: chapter.exercise.blankAnswer,
            hint: chapter.exercise.hint,
          },
        })),
      }),
    );
    return {
      id: `academy-${course.id}`,
      title: `${course.name} Complete Learning Path`,
      category:
        course.id === "python"
          ? "python"
          : course.id === "sql"
            ? "sql"
            : "web_dev",
      tagline: course.tagline,
      description: "A learning path linked to every current Academy chapter.",
      durationWeeks: groups.length,
      weeks: groups,
      recommendedCareers: ["Application Developer"],
      skillsGained: course.chapters.map((c) => c.title),
    };
  });
}
export function academyChallenges(): Challenge[] {
  return getAllW3Courses().flatMap((course) =>
    course.chapters
      .filter((c) => c.categoryGroup === "Applied & Advanced")
      .map((chapter) => ({
        id: `academy-challenge-${chapter.id}`,
        title: chapter.title,
        category: course.name,
        difficulty: "medium" as const,
        xp: chapter.exercise.xp,
        summary: chapter.description,
        description: `${chapter.description}\n\n${chapter.exercise.prompt}`,
        starterCode: chapter.tryItYourself.starterCode,
        deliverables: [
          "Working code with the requested behavior",
          "An explanation of one edge case and how you checked it",
        ],
        rubric: [
          { criterion: "Correct behavior", points: 60 },
          { criterion: "Edge case handling", points: 25 },
          { criterion: "Clear explanation", points: 15 },
        ],
        stages: [
          {
            stageNumber: 1,
            title: "Read & trace",
            type: "warmup" as const,
            prompt: `Trace this example before running it. ${chapter.description}`,
            starterSnippet: chapter.tryItYourself.starterCode,
            hint: chapter.sections[0].content,
            xpReward: 10,
          },
          {
            stageNumber: 2,
            title: "Complete the code",
            type: "fill_in" as const,
            prompt: chapter.exercise.prompt,
            starterSnippet: chapter.exercise.codeTemplate,
            solutionPattern: chapter.exercise.blankAnswer,
            hint: chapter.exercise.hint,
            xpReward: 10,
          },
          {
            stageNumber: 3,
            title: "Run & explain",
            type: "code_construct" as const,
            prompt:
              "Run the completed example in the Academy, then explain the output in your own words.",
            starterSnippet: chapter.tryItYourself.starterCode,
            hint:
              chapter.tryItYourself.explanation ||
              "Inspect intermediate values.",
            xpReward: 10,
          },
          {
            stageNumber: 4,
            title: "Extend & verify",
            type: "boss_challenge" as const,
            prompt:
              "Change the input, predict the result, and verify an edge case. Submit the modified code and evidence of its behavior.",
            hint: chapter.sections[1].content,
            xpReward: 10,
          },
        ],
      })),
  );
}
