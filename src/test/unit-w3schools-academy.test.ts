import { describe, it, expect } from "vitest";
import {
  getAllW3Courses,
  getW3CourseById,
  W3_COURSES,
} from "@/lib/w3schools-data";
import { DEMO_CHALLENGES } from "@/lib/demo-data";

describe("W3Schools Academy & Curriculum System", () => {
  it("should provide the 5 core W3Schools courses with valid IDs and metadata", () => {
    const courses = getAllW3Courses();
    expect(courses).toHaveLength(5);

    const courseIds = courses.map((c) => c.id);
    expect(courseIds).toEqual(["python", "javascript", "html", "css", "sql"]);

    // Verify all courses have required UI labels
    courses.forEach((course) => {
      expect(course.name).toBeTruthy();
      expect(course.tabLabel).toBeTruthy();
      expect(course.sidebarTitle).toBeTruthy();
      expect(course.tagline).toBeTruthy();
      expect(course.chapters.length).toBeGreaterThan(0);
    });
  });

  it("should extract Python curriculum matching W3Schools layout, syntax and terminal blocks", () => {
    const pythonCourse = getW3CourseById("python");
    expect(pythonCourse).toBeDefined();
    expect(pythonCourse?.sidebarTitle).toBe("PYTHON TUTORIAL");
    expect(pythonCourse?.tabLabel).toBe("PYTHON");

    // Verify chapters exist
    const chapterIds = pythonCourse?.chapters.map((c) => c.id) || [];
    expect(chapterIds).toContain("python-home");
    expect(chapterIds).toContain("python-intro");
    expect(chapterIds).toContain("python-getstarted");
    expect(chapterIds).toContain("python-syntax");
    expect(chapterIds).toContain("python-output");
    expect(chapterIds).toContain("python-comments");
    expect(chapterIds).toContain("python-variables");
    expect(chapterIds).toContain("python-datatypes");
    expect(chapterIds).toContain("python-numbers");
    expect(chapterIds).toContain("python-casting");
    expect(chapterIds).toContain("python-strings");
    expect(chapterIds).toContain("python-booleans");
    expect(chapterIds).toContain("python-operators");
    expect(chapterIds).toContain("python-lists");
    expect(chapterIds).toContain("python-tuples");
    expect(chapterIds).toContain("python-sets");
    expect(chapterIds).toContain("python-dictionaries");
    expect(chapterIds).toContain("python-ifelse");
    expect(chapterIds).toContain("python-whileloops");
    expect(chapterIds).toContain("python-forloops");
    expect(chapterIds).toContain("python-functions");
    expect(chapterIds).toContain("python-lambda");
    expect(chapterIds).toContain("python-classes");
    expect(chapterIds).toContain("python-inheritance");
    expect(chapterIds).toContain("python-modules");
    expect(chapterIds).toContain("python-tryexcept");
    expect(chapterIds).toContain("python-filehandling");

    // Verify Python Syntax chapter specifics matching user screenshot
    const syntaxChapter = pythonCourse?.chapters.find((c) => c.id === "python-syntax");
    expect(syntaxChapter).toBeDefined();
    expect(syntaxChapter?.title).toBe("Python Syntax");
    expect(syntaxChapter?.subtopics).toEqual(["Syntax", "Statements", "Code Challenge"]);

    // Verify terminal command-line blocks
    const terminalSection = syntaxChapter?.sections.find(
      (s) => s.terminalCommand && s.terminalCommand.includes("print(\"Hello, World!\")")
    );
    expect(terminalSection).toBeDefined();
    expect(terminalSection?.terminalOutput).toBe("Hello, World!");

    // Verify Try-It-Yourself
    expect(syntaxChapter?.tryItYourself).toBeDefined();
    expect(syntaxChapter?.tryItYourself.language).toBe("python");
    expect(syntaxChapter?.tryItYourself.starterCode).toContain("Five is greater than two!");

    // Verify Code Challenge Exercise
    expect(syntaxChapter?.exercise).toBeDefined();
    expect(syntaxChapter?.exercise.codeTemplate).toContain("___");
    expect(syntaxChapter?.exercise.blankAnswer.trim()).toBe("");
    expect(syntaxChapter?.exercise.xp).toBeGreaterThan(0);
  });

  it("should extract JavaScript, HTML, CSS, and SQL courses with Try-It-Yourself and exercises", () => {
    const jsCourse = getW3CourseById("javascript");
    expect(jsCourse).toBeDefined();
    expect(jsCourse?.sidebarTitle).toBe("JAVASCRIPT TUTORIAL");
    expect(jsCourse?.chapters.length).toBeGreaterThan(5);

    const htmlCourse = getW3CourseById("html");
    expect(htmlCourse).toBeDefined();
    expect(htmlCourse?.sidebarTitle).toBe("HTML TUTORIAL");
    expect(htmlCourse?.chapters.length).toBeGreaterThan(4);

    const cssCourse = getW3CourseById("css");
    expect(cssCourse).toBeDefined();
    expect(cssCourse?.sidebarTitle).toBe("CSS TUTORIAL");
    expect(cssCourse?.chapters.length).toBeGreaterThan(3);

    const sqlCourse = getW3CourseById("sql");
    expect(sqlCourse).toBeDefined();
    expect(sqlCourse?.sidebarTitle).toBe("SQL TUTORIAL");
    expect(sqlCourse?.chapters.length).toBeGreaterThan(4);
  });

  it("should provide authentic W3Schools challenges in DEMO_CHALLENGES with 4 progressive stages", () => {
    const w3ChallengeIds = [
      "challenge-w3-python-syntax",
      "challenge-w3-javascript-functions",
      "challenge-w3-html5-semantic",
      "challenge-w3-css3-flex-grid",
      "challenge-w3-sql-joins",
    ];

    w3ChallengeIds.forEach((id) => {
      const challenge = DEMO_CHALLENGES.find((c) => c.id === id);
      expect(challenge).toBeDefined();
      expect(challenge?.stages).toHaveLength(4);
      expect(challenge?.rubric.length).toBeGreaterThan(0);
      expect(challenge?.deliverables.length).toBeGreaterThan(0);

      // Verify stage progression
      const stages = challenge?.stages || [];
      expect(stages[0].type).toBe("warmup");
      expect(stages[1].type).toBe("fill_in");
      expect(stages[2].type).toBe("code_construct");
      expect(stages[3].type).toBe("boss_challenge");
    });
  });
});
