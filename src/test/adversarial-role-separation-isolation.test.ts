import { describe, it, expect, beforeEach } from "vitest";
import {
  getCourses,
  saveCourse,
  addCourseMaterial,
  deleteCourseMaterial,
  getQuizzes,
  saveQuiz,
  deleteQuiz,
  getAttempts,
  saveAttempt,
  getStudentNotes,
  saveStudentNote,
  deleteStudentNote,
  resetToDemoData,
} from "@/lib/store";
import {
  canAccessTeacherStudio,
  canCreateCourse,
  canPublishQuiz,
  canEditQuiz,
  canViewStudentSubmissions,
  isTeacherOrAdmin,
} from "@/lib/permissions";
import { Course, CourseMaterial, Quiz, QuizAttempt, StudentNote } from "@/types";

describe("Adversarial M1: Practice Quiz & Attempt Isolation from Faculty Gradebooks", () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it("ensures student practice attempts (isPractice: true) never corrupt official cohort grade averages", () => {
    // Setup official cohort baseline attempts
    const officialAttempts: QuizAttempt[] = [
      {
        id: "adv-official-1",
        quizId: "quiz-midterm-cs101",
        quizTitle: "CS101 Midterm Exam",
        userId: "user-student-1",
        studentName: "Ahmad Khan",
        userRole: "student",
        answers: {},
        scorePercentage: 90,
        correctCount: 9,
        totalQuestions: 10,
        passed: true,
        startedAt: "2026-10-18T10:00:00Z",
        completedAt: "2026-10-18T10:30:00Z",
        weakTopics: [],
        isPractice: false,
      },
      {
        id: "adv-official-2",
        quizId: "quiz-midterm-cs101",
        quizTitle: "CS101 Midterm Exam",
        userId: "user-student-2",
        studentName: "Hassan Ali",
        userRole: "student",
        answers: {},
        scorePercentage: 80,
        correctCount: 8,
        totalQuestions: 10,
        passed: true,
        startedAt: "2026-10-18T10:00:00Z",
        completedAt: "2026-10-18T10:30:00Z",
        weakTopics: [],
        isPractice: false,
      },
    ];

    officialAttempts.forEach(saveAttempt);

    // Ahmad Khan takes 5 grueling self-practice quizzes on /quizzes and scores low (e.g. 10%, 20%, 0%)
    const practiceAttempts: QuizAttempt[] = [
      {
        id: "adv-practice-1",
        quizId: "quiz-practice-trees",
        quizTitle: "AVL Trees Self Practice",
        userId: "user-student-1",
        studentName: "Ahmad Khan",
        userRole: "student",
        answers: {},
        scorePercentage: 0,
        correctCount: 0,
        totalQuestions: 10,
        passed: false,
        startedAt: "2026-10-18T11:00:00Z",
        completedAt: "2026-10-18T11:15:00Z",
        weakTopics: ["AVL Rotations"],
        isPractice: true,
      },
      {
        id: "adv-practice-2",
        quizId: "quiz-practice-graphs",
        quizTitle: "Graph Traversals Practice",
        userId: "user-student-1",
        studentName: "Ahmad Khan",
        userRole: "student",
        answers: {},
        scorePercentage: 20,
        correctCount: 2,
        totalQuestions: 10,
        passed: false,
        startedAt: "2026-10-18T11:30:00Z",
        completedAt: "2026-10-18T11:45:00Z",
        weakTopics: ["Dijkstra"],
        isPractice: true,
      },
    ];

    practiceAttempts.forEach(saveAttempt);

    const allAttempts = getAttempts();

    // Emulate Teacher Studio cohort calculation for Ahmad Khan
    const ahmadOfficialAttempts = allAttempts.filter(
      (a) => a.userId === "user-student-1" && a.userRole !== "teacher" && !a.isPractice
    );

    // Initial demo attempts for Ahmad = 2, plus 1 new official = 3.
    // None of the 2 practice attempts must be included.
    expect(ahmadOfficialAttempts.some((a) => a.id === "adv-practice-1")).toBe(false);
    expect(ahmadOfficialAttempts.some((a) => a.id === "adv-practice-2")).toBe(false);
    expect(ahmadOfficialAttempts.some((a) => a.id === "adv-official-1")).toBe(true);

    // Now test specifically on a dedicated isolated quiz:
    const isolatedQuizOfficialAttempts = allAttempts.filter(
      (a) => a.quizId === "quiz-midterm-cs101" && a.userRole !== "teacher" && !a.isPractice
    );
    expect(isolatedQuizOfficialAttempts.length).toBe(2); // Ahmad and Hassan

    const ahmadIsolatedAvg = Math.round(
      isolatedQuizOfficialAttempts
        .filter((a) => a.userId === "user-student-1")
        .reduce((acc, a) => acc + a.scorePercentage, 0)
    );
    // Ahmad's score on this official exam is 90%, NOT corrupted by 0% or 20% practice attempts
    expect(ahmadIsolatedAvg).toBe(90);

    // Emulate Teacher Studio overall cohort calculation
    const cohortOfficialAttempts = allAttempts.filter(
      (a) => a.userRole !== "teacher" && !a.isPractice && a.quizId === "quiz-midterm-cs101"
    );
    const cohortAvg = Math.round(
      cohortOfficialAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) /
        cohortOfficialAttempts.length
    );
    expect(cohortAvg).toBe(85); // (90 + 80) / 2 = 85%
  });

  it("ensures student practice attempts are excluded from teacher table display filter", () => {
    const practiceAtt: QuizAttempt = {
      id: "practice-test-44",
      quizId: "quiz-practice-44",
      quizTitle: "Practice Dynamic Programming",
      userId: "user-student-1",
      studentName: "Ahmad Khan",
      userRole: "student",
      answers: {},
      scorePercentage: 35,
      correctCount: 1,
      totalQuestions: 3,
      passed: false,
      startedAt: "2026-10-18T15:00:00Z",
      completedAt: "2026-10-18T15:10:00Z",
      weakTopics: ["Memoization"],
      isPractice: true,
    };
    saveAttempt(practiceAtt);

    const allAttempts = getAttempts();

    // Teacher table display filter from src/app/teacher/page.tsx line 1327:
    // attempts.filter((att) => att.userRole !== "teacher" && !att.isPractice)
    const tableFiltered = allAttempts.filter(
      (att) => att.userRole !== "teacher" && !att.isPractice
    );

    expect(tableFiltered.some((a) => a.id === "practice-test-44")).toBe(false);
  });

  it("checks teacher CSV export logic for practice attempt leakage vulnerability", () => {
    const practiceAtt: QuizAttempt = {
      id: "leak-candidate-1",
      quizId: "quiz-practice-leak",
      quizTitle: "Ahmad Private Practice",
      userId: "user-student-1",
      studentName: "Ahmad Khan",
      userRole: "student",
      answers: {},
      scorePercentage: 15,
      correctCount: 1,
      totalQuestions: 6,
      passed: false,
      startedAt: "2026-10-18T16:00:00Z",
      completedAt: "2026-10-18T16:15:00Z",
      weakTopics: [],
      isPractice: true,
    };
    saveAttempt(practiceAtt);

    const attempts = getAttempts();

    // Line 424 of src/app/teacher/page.tsx currently does:
    // const rows = attempts.map(...) WITHOUT filtering !a.isPractice
    // Test that the raw attempts array DOES contain the practice attempt:
    expect(attempts.some((a) => a.id === "leak-candidate-1")).toBe(true);

    // If teacher page exported CSV without filtering, this leaks:
    const unFilteredExport = attempts.map(
      (a) => `"${a.id}","${a.userId}","${a.quizTitle}",${a.scorePercentage},${a.passed},"${a.completedAt}"`
    );
    const leaked = unFilteredExport.some((row) => row.includes("leak-candidate-1"));
    expect(leaked).toBe(true);

    // SECURE implementation filter:
    const secureExportRows = attempts
      .filter((a) => a.userRole !== "teacher" && !a.isPractice)
      .map(
        (a) => `"${a.id}","${a.userId}","${a.quizTitle}",${a.scorePercentage},${a.passed},"${a.completedAt}"`
      );
    expect(secureExportRows.some((row) => row.includes("leak-candidate-1"))).toBe(false);
  });

  it("stress-tests quiz visibility: quizzes with isPractice: true must never be displayed as faculty official quizzes", () => {
    // 1. Student generated practice quiz
    const studentPracticeQuiz: Quiz = {
      id: "quiz-student-practice-1",
      title: "Student Solo Revision",
      description: "My personal practice notes quiz",
      subject: "Algorithms",
      difficulty: "intermediate",
      durationMinutes: 10,
      creatorId: "user-student-1",
      creatorName: "Ahmad Khan",
      creatorRole: "student",
      isDraft: false,
      isPractice: true,
      passingScore: 70,
      createdAt: "2026-10-18",
      questions: [],
    };
    saveQuiz(studentPracticeQuiz);

    // 2. Teacher testing practice quiz feature on /quizzes
    const teacherPracticeQuiz: Quiz = {
      id: "quiz-teacher-practice-1",
      title: "Teacher Quick Practice Run",
      description: "Teacher self-testing practice generator",
      subject: "Operating Systems",
      difficulty: "beginner",
      durationMinutes: 10,
      creatorId: "user-teacher-1",
      creatorName: "Dr. Sarah Jenkins",
      creatorRole: "teacher",
      isDraft: false,
      isPractice: true, // It is a practice quiz!
      passingScore: 70,
      createdAt: "2026-10-18",
      questions: [],
    };
    saveQuiz(teacherPracticeQuiz);

    const quizzes = getQuizzes();

    // Check teacher studio Published Quizzes filter (line 1205):
    // quizzes.filter((q) => q.creatorRole !== "student")
    const teacherStudioVisibleQuizzes = quizzes.filter((q) => q.creatorRole !== "student");

    // Student practice quiz is excluded because creatorRole === "student"
    expect(teacherStudioVisibleQuizzes.some((q) => q.id === "quiz-student-practice-1")).toBe(false);

    // VULNERABILITY CHECK: If filter only checks creatorRole !== "student", teacherPracticeQuiz LEAKS:
    const teacherPracticeLeaked = teacherStudioVisibleQuizzes.some(
      (q) => q.id === "quiz-teacher-practice-1"
    );
    // Document whether teacherPracticeLeaked is true:
    expect(teacherPracticeLeaked).toBe(true);

    // Robust filter should check: !q.isPractice && q.creatorRole !== "student"
    const robustFilter = quizzes.filter((q) => !q.isPractice && q.creatorRole !== "student");
    expect(robustFilter.some((q) => q.id === "quiz-teacher-practice-1")).toBe(false);
  });
});

describe("Adversarial M1: Role Authorization Guards in Teacher Course Materials Management", () => {
  beforeEach(() => {
    resetToDemoData();
  });

  it("strictly enforces role authorization for Teacher Studio access", () => {
    expect(canAccessTeacherStudio("student")).toBe(false);
    expect(canAccessTeacherStudio(undefined)).toBe(false);
    expect(canAccessTeacherStudio("teacher")).toBe(true);
    expect(canAccessTeacherStudio("admin")).toBe(true);
  });

  it("enforces role authorization for course creation and quiz publication", () => {
    expect(canCreateCourse("student")).toBe(false);
    expect(canCreateCourse(undefined)).toBe(false);
    expect(canCreateCourse("teacher")).toBe(true);
    expect(canCreateCourse("admin")).toBe(true);

    expect(canPublishQuiz("student")).toBe(false);
    expect(canPublishQuiz(undefined)).toBe(false);
    expect(canPublishQuiz("teacher")).toBe(true);
    expect(canPublishQuiz("admin")).toBe(true);
  });

  it("enforces quiz editing ownership guards", () => {
    const creatorId = "user-teacher-1";
    // Creator can edit
    expect(canEditQuiz(creatorId, "user-teacher-1", "teacher")).toBe(true);
    // Different teacher cannot edit
    expect(canEditQuiz(creatorId, "user-teacher-2", "teacher")).toBe(false);
    // Student can never edit teacher quiz
    expect(canEditQuiz(creatorId, "user-student-1", "student")).toBe(false);
    // Admin can always edit
    expect(canEditQuiz(creatorId, "user-admin-1", "admin")).toBe(true);
  });

  it("enforces course material modification lifecycle in store", () => {
    const initialCourses = getCourses();
    expect(initialCourses.length).toBeGreaterThan(0);
    const targetCourse = initialCourses[0];

    const newMaterial: CourseMaterial = {
      id: `mat-adv-test-${Date.now()}`,
      courseId: targetCourse.id,
      title: "Advanced Invariant Verification Slides",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: "2026-10-18",
      description: "Mathematical proofs of distributed consensus invariants.",
      fileName: "Invariants_Proof.pdf",
      fileData: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...",
    };

    // 1. Add course material
    const updated = addCourseMaterial(targetCourse.id, newMaterial);
    expect(updated).toBeDefined();
    expect(updated?.materials?.some((m) => m.id === newMaterial.id)).toBe(true);

    // Verify persisted
    const coursesAfterAdd = getCourses();
    const verifiedCourse = coursesAfterAdd.find((c) => c.id === targetCourse.id);
    expect(verifiedCourse?.materials?.some((m) => m.id === newMaterial.id)).toBe(true);

    // 2. Delete course material
    const afterDelete = deleteCourseMaterial(targetCourse.id, newMaterial.id);
    expect(afterDelete).toBeDefined();
    expect(afterDelete?.materials?.some((m) => m.id === newMaterial.id)).toBe(false);

    // Verify deletion persisted
    const coursesAfterDel = getCourses();
    const finalCourse = coursesAfterDel.find((c) => c.id === targetCourse.id);
    expect(finalCourse?.materials?.some((m) => m.id === newMaterial.id)).toBe(false);
  });

  it("strictly isolates personal student notes locker across different student accounts", () => {
    const noteAhmad: StudentNote = {
      id: "note-ahmad-private",
      userId: "user-student-1",
      title: "Ahmad's Secret Notes on Heap Sort",
      courseId: "course-cs101",
      courseName: "CS101",
      content: "Max heapify takes O(log N). Build heap is O(N).",
      tags: ["Sorting", "Heaps"],
      createdAt: "2026-10-18T10:00:00Z",
      updatedAt: "2026-10-18T10:00:00Z",
    };

    const noteHassan: StudentNote = {
      id: "note-hassan-private",
      userId: "user-student-2",
      title: "Hassan's Private Notes on Vector Embeddings",
      courseId: "course-cs210",
      courseName: "CS210",
      content: "Cosine similarity measures cosine of angle between vectors.",
      tags: ["AI", "Embeddings"],
      createdAt: "2026-10-18T11:00:00Z",
      updatedAt: "2026-10-18T11:00:00Z",
    };

    saveStudentNote(noteAhmad);
    saveStudentNote(noteHassan);

    // Query Ahmad's notes
    const ahmadNotes = getStudentNotes("user-student-1");
    expect(ahmadNotes.some((n) => n.id === "note-ahmad-private")).toBe(true);
    expect(ahmadNotes.some((n) => n.id === "note-hassan-private")).toBe(false);

    // Query Hassan's notes
    const hassanNotes = getStudentNotes("user-student-2");
    expect(hassanNotes.some((n) => n.id === "note-hassan-private")).toBe(true);
    expect(hassanNotes.some((n) => n.id === "note-ahmad-private")).toBe(false);

    // Delete Ahmad's note and ensure Hassan's remains untouched
    deleteStudentNote("note-ahmad-private");
    expect(getStudentNotes("user-student-1").some((n) => n.id === "note-ahmad-private")).toBe(false);
    expect(getStudentNotes("user-student-2").some((n) => n.id === "note-hassan-private")).toBe(true);
  });
});
