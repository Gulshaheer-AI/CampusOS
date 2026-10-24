"use client";

import { academyRoadmaps, academyChallenges } from "./academy-paths";
import {
  UserProfile,
  UserRole,
  Course,
  CourseMaterial,
  CourseModule,
  Quiz,
  QuizAttempt,
  TutorConversation,
  Roadmap,
  Challenge,
  ChallengeSubmission,
  PortfolioProject,
  Opportunity,
  CvData,
  StudentNote,
} from "@/types";
import {
  DEMO_USERS,
  DEMO_COURSES,
  DEMO_QUIZZES,
  DEMO_ATTEMPTS,
  DEMO_ROADMAPS,
  DEMO_CHALLENGES,
  DEMO_PORTFOLIO_PROJECTS,
  DEMO_OPPORTUNITIES,
} from "./demo-data";

const STORAGE_KEYS = {
  CURRENT_USER: "campusos_current_user",
  COURSES: "campusos_courses",
  ENROLLMENTS: "campusos_enrollments",
  QUIZZES: "campusos_quizzes",
  ATTEMPTS: "campusos_attempts",
  CONVERSATIONS: "campusos_conversations",
  ROADMAPS: "campusos_roadmaps",
  CHALLENGES: "campusos_challenges",
  SUBMISSIONS: "campusos_submissions",
  PORTFOLIO: "campusos_portfolio",
  OPPORTUNITIES: "campusos_opportunities",
  STUDENT_NOTES: "campusos_student_notes",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to persist to localStorage for key: ${key}`, err);
  }
}

// User state
export function getCurrentUser(): UserProfile {
  const stored = safeGet<UserProfile>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.student);

  return stored;
}

export function setCurrentUser(user: UserProfile): void {
  safeSet(STORAGE_KEYS.CURRENT_USER, user);
}

export function switchRole(roleOrKey: UserRole | "ahmad" | "hassan" | "zain" | string): UserProfile {
  const targetUser = DEMO_USERS[roleOrKey] || Object.values(DEMO_USERS).find(user => user.id === roleOrKey) || DEMO_USERS.student;
  setCurrentUser(targetUser);
  return targetUser;
}

export function getAllStudents(): UserProfile[] {
  return [DEMO_USERS.ahmad, DEMO_USERS.hassan, DEMO_USERS.zain];
}
export const getStudents = getAllStudents;

// Courses
export function getCourses(): Course[] {
  const user = getCurrentUser();
  const all = safeGet<Course[]>(STORAGE_KEYS.COURSES, DEMO_COURSES);
  const enrollments = safeGet<Record<string, string[]>>(STORAGE_KEYS.ENROLLMENTS, {});
  const ids = enrollments[user.id] || (user.id === DEMO_USERS.student.id ? DEMO_COURSES.filter(c => c.isEnrolled).map(c => c.id) : []);
  return all.map(c => ({ ...c, isEnrolled: ids.includes(c.id) }));
}

export function enrollWithClassCode(code: string): Course {
  const user = getCurrentUser();
  if (user.role !== "student") throw new Error("Only students can enroll in classes.");
  const course = getCourses().find(c => c.classCode.trim().toUpperCase() === code.trim().toUpperCase());
  if (!course) throw new Error("No course matches that class code.");
  if (!course.isEnrolled) {
    const enrollments = safeGet<Record<string, string[]>>(STORAGE_KEYS.ENROLLMENTS, {});
    enrollments[user.id] = [...getCourses().filter(c => c.isEnrolled).map(c => c.id), course.id];
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  }
  return { ...course, isEnrolled: true };
}

export function getCourseById(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id);
}

export function saveCourse(course: Course): void {
  const courses = getCourses();
  const existingIdx = courses.findIndex((c) => c.id === course.id);
  if (existingIdx >= 0) {
    courses[existingIdx] = course;
  } else {
    courses.unshift(course);
  }
  safeSet(STORAGE_KEYS.COURSES, courses);
}

export function toggleLessonCompletion(courseId: string, lessonId: string): Course | undefined {
  const courses = getCourses();
  const course = courses.find((c) => c.id === courseId);
  if (!course) return undefined;

  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      lesson.isCompleted = !lesson.isCompleted;
      break;
    }
  }

  saveCourse(course);
  return course;
}

// Quizzes
export function getQuizzes(): Quiz[] {
  const stored = safeGet<Quiz[]>(STORAGE_KEYS.QUIZZES, DEMO_QUIZZES);
  // Ensure all official DEMO_QUIZZES are present
  const existingIds = new Set(stored.map((q) => q.id));
  let updated = false;
  for (const dq of DEMO_QUIZZES) {
    if (!existingIds.has(dq.id)) {
      stored.push(dq);
      updated = true;
    }
  }
  if (updated) {
    safeSet(STORAGE_KEYS.QUIZZES, stored);
  }
  return stored;
}

export function getQuizById(id: string): Quiz | undefined {
  return getQuizzes().find((q) => q.id === id);
}

export function saveQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes();
  const existingIdx = quizzes.findIndex((q) => q.id === quiz.id);
  if (existingIdx >= 0) {
    quizzes[existingIdx] = quiz;
  } else {
    quizzes.unshift(quiz);
  }
  safeSet(STORAGE_KEYS.QUIZZES, quizzes);
}

export function deleteQuiz(id: string): void {
  const quizzes = getQuizzes().filter((q) => q.id !== id);
  safeSet(STORAGE_KEYS.QUIZZES, quizzes);
}

// Quiz Attempts (strictly isolated by userId when provided)
export function getAttempts(userId?: string): QuizAttempt[] {
  const attempts = safeGet<QuizAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
  return userId ? attempts.filter(attempt => attempt.userId === userId) : attempts;
}

export function saveAttempt(attempt: QuizAttempt): void {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  safeSet(STORAGE_KEYS.ATTEMPTS, attempts);
}

// Conversations (AI Tutor)
export function getConversations(userId?: string): TutorConversation[] {
  const all = safeGet<TutorConversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  if (!userId) return all;
  return all.filter((c) => c.userId === userId);
}

export function getConversationById(id: string): TutorConversation | undefined {
  return safeGet<TutorConversation[]>(STORAGE_KEYS.CONVERSATIONS, []).find((c) => c.id === id);
}

export function saveConversation(conversation: TutorConversation): void {
  const conversations = safeGet<TutorConversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const existingIdx = conversations.findIndex((c) => c.id === conversation.id);
  if (existingIdx >= 0) {
    conversations[existingIdx] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  safeSet(STORAGE_KEYS.CONVERSATIONS, conversations);
}

export function deleteConversation(id: string): void {
  const conversations = safeGet<TutorConversation[]>(STORAGE_KEYS.CONVERSATIONS, []).filter(
    (c) => c.id !== id
  );
  safeSet(STORAGE_KEYS.CONVERSATIONS, conversations);
}

// Roadmaps
export function getRoadmaps(): Roadmap[] {
  const stored = safeGet<Roadmap[]>(STORAGE_KEYS.ROADMAPS, DEMO_ROADMAPS);
  if (!stored || stored.length === 0) return [...DEMO_ROADMAPS, ...academyRoadmaps()];

  return [...DEMO_ROADMAPS, ...academyRoadmaps()].map((demo) => {
    const r = stored.find((s) => s.id === demo.id);
    if (!r) return demo;
    return {
      ...demo,
      weeks: demo.weeks.map((dw) => {
        const rw = r.weeks?.find((w) => w.weekNumber === dw.weekNumber);
        if (!rw) return dw;
        return {
          ...dw,
          tasks: dw.tasks.map((dt) => {
            const rt = rw.tasks?.find((t) => t.id === dt.id);
            return {
              ...dt,
              completed: rt !== undefined ? rt.completed : dt.completed,
            };
          }),
        };
      }),
    };
  });
}

export function getRoadmapById(id: string): Roadmap | undefined {
  return getRoadmaps().find((r) => r.id === id);
}

export function toggleRoadmapTask(roadmapId: string, weekNumber: number, taskId: string): Roadmap | undefined {
  const roadmaps = getRoadmaps();
  const rm = roadmaps.find((r) => r.id === roadmapId);
  if (!rm) return undefined;

  const week = rm.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week) return rm;

  const task = week.tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
  }

  safeSet(STORAGE_KEYS.ROADMAPS, roadmaps);
  return rm;
}

// Challenges & Submissions
export function getChallenges(): Challenge[] {
  const stored = safeGet<Challenge[]>(STORAGE_KEYS.CHALLENGES, DEMO_CHALLENGES);
  return [...DEMO_CHALLENGES, ...academyChallenges()].map((dc) => {
    const sc = stored?.find((c) => c.id === dc.id);
    return sc ? { ...dc, ...sc, stages: dc.stages || sc.stages } : dc;
  });
}

export function getChallengeById(id: string): Challenge | undefined {
  return getChallenges().find((c) => c.id === id);
}

export function getSubmissions(userId?: string): ChallengeSubmission[] {
  const subs = safeGet<ChallengeSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  if (!userId) return subs;
  return subs.filter((s) => s.userId === userId);
}

export function saveSubmission(submission: ChallengeSubmission): void {
  const subs = safeGet<ChallengeSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  subs.unshift(submission);
  safeSet(STORAGE_KEYS.SUBMISSIONS, subs);
}

// Portfolio
export function getPortfolioProjects(userId?: string): PortfolioProject[] {
  const projects = safeGet<PortfolioProject[]>(STORAGE_KEYS.PORTFOLIO, []);
  return userId ? projects.filter(project => project.userId === userId) : projects;
}

export function savePortfolioProject(project: PortfolioProject): void {
  const projs = getPortfolioProjects();
  const existingIdx = projs.findIndex((p) => p.id === project.id);
  if (existingIdx >= 0) {
    projs[existingIdx] = project;
  } else {
    projs.unshift(project);
  }
  safeSet(STORAGE_KEYS.PORTFOLIO, projs);
}

export function togglePortfolioVisibility(projectId: string): void {
  const projs = getPortfolioProjects();
  const p = projs.find((item) => item.id === projectId);
  if (p) {
    p.isPublic = !p.isPublic;
    safeSet(STORAGE_KEYS.PORTFOLIO, projs);
  }
}

// Opportunities
export function getOpportunities(): Opportunity[] {
  const stored = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, []);
  if (!Array.isArray(stored)) return [];
  // Never turn seed directories or stale checks into live opportunities.
  return stored.filter(o => o.verified && o.verifiedAt && Date.now() - Date.parse(o.verifiedAt) < 24 * 60 * 60 * 1000 && (!/^\d{4}-\d{2}-\d{2}$/.test(o.deadline) || Date.parse(o.deadline + "T23:59:59Z") >= Date.now()));
}

export function saveOpportunities(opportunities: Opportunity[]): void {
  safeSet(STORAGE_KEYS.OPPORTUNITIES, opportunities);
}

export function toggleOpportunityBookmark(id: string): void {
  const opps = getOpportunities();
  const opp = opps.find((o) => o.id === id);
  if (opp) {
    opp.isBookmarked = !opp.isBookmarked;
    safeSet(STORAGE_KEYS.OPPORTUNITIES, opps);
  }
}

export function updateOpportunityStatus(id: string, status: Opportunity["userStatus"]): void {
  const opps = getOpportunities();
  const opp = opps.find((o) => o.id === id);
  if (opp) {
    opp.userStatus = status;
    safeSet(STORAGE_KEYS.OPPORTUNITIES, opps);
  }
}

// URL Sanitizer Helper
export function sanitizeWebUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Gamification & Challenge Multi-Stage State
export interface UserGamificationState {
  hearts: number;
  streak: number;
  xp: number;
  lastActiveDate: string;
  completedStages: Record<string, number[]>;
}

export function getUserGamification(userId: string): UserGamificationState {
  const defaultState: UserGamificationState = {
    hearts: 5, streak: 0, xp: 0, lastActiveDate: "", completedStages: {},
  };
  return safeGet<UserGamificationState>(`campusos_gamification_${userId}`, defaultState);
}

export function decrementUserHeart(userId: string): number {
  const state = getUserGamification(userId);
  state.hearts = Math.max(0, state.hearts - 1);
  safeSet(`campusos_gamification_${userId}`, state);
  return state.hearts;
}

export function refillUserHearts(userId: string): number {
  const state = getUserGamification(userId);
  state.hearts = 5;
  safeSet(`campusos_gamification_${userId}`, state);
  return state.hearts;
}

export function recordStageCompletion(
  userId: string,
  challengeId: string,
  stageNumber: number,
  xpReward: number
): UserGamificationState {
  const state = getUserGamification(userId);
  const stages = state.completedStages[challengeId] || [];
  if (!stages.includes(stageNumber)) {
    stages.push(stageNumber);
    state.completedStages[challengeId] = stages;
    state.xp += xpReward;
    state.streak += 1;
    state.lastActiveDate = new Date().toISOString().slice(0, 10);
    safeSet(`campusos_gamification_${userId}`, state);
  }
  return state;
}

// Course Editing & Lecture Materials
export function addCourseMaterial(courseId: string, material: CourseMaterial): Course | undefined {
  const courses = getCourses();
  const c = courses.find((course) => course.id === courseId);
  if (c) {
    c.materials = c.materials || [];
    c.materials.push(material);
    saveCourse(c);
    return c;
  }
  return undefined;
}

export function deleteCourseMaterial(courseId: string, materialId: string): Course | undefined {
  const courses = getCourses();
  const c = courses.find((course) => course.id === courseId);
  if (c && c.materials) {
    c.materials = c.materials.filter((m) => m.id !== materialId);
    saveCourse(c);
    return c;
  }
  return undefined;
}

export function addCourseModule(courseId: string, mod: CourseModule): Course | undefined {
  const courses = getCourses();
  const c = courses.find((course) => course.id === courseId);
  if (c) {
    c.modules = c.modules || [];
    c.modules.push(mod);
    saveCourse(c);
    return c;
  }
  return undefined;
}

export function updateCourse(updatedCourse: Course): void {
  saveCourse(updatedCourse);
}

// Student Personal Notes Studio & Locker
export function getStudentNotes(userId?: string): StudentNote[] {
  const notes = safeGet<StudentNote[]>(STORAGE_KEYS.STUDENT_NOTES, []);
  if (!userId) return notes;
  return notes.filter((n) => n.userId === userId);
}

export function getStudentNoteById(id: string): StudentNote | undefined {
  return safeGet<StudentNote[]>(STORAGE_KEYS.STUDENT_NOTES, []).find((n) => n.id === id);
}

export function saveStudentNote(note: StudentNote): void {
  const notes = safeGet<StudentNote[]>(STORAGE_KEYS.STUDENT_NOTES, []);
  const existingIdx = notes.findIndex((n) => n.id === note.id);
  if (existingIdx >= 0) {
    notes[existingIdx] = note;
  } else {
    notes.unshift(note);
  }
  safeSet(STORAGE_KEYS.STUDENT_NOTES, notes);
}

export function deleteStudentNote(id: string): void {
  const notes = safeGet<StudentNote[]>(STORAGE_KEYS.STUDENT_NOTES, []).filter(
    (n) => n.id !== id
  );
  safeSet(STORAGE_KEYS.STUDENT_NOTES, notes);
}

// CV Builder & Review Storage
export function getUserCv(userId: string): CvData | null {
  return safeGet<CvData | null>(`campusos_cv_${userId}`, null);
}

export function saveUserCv(userId: string, cv: CvData): void {
  safeSet(`campusos_cv_${userId}`, cv);
}

// Reset data helper
export function resetToDemoData(): void {
  if (typeof window === "undefined") return;
  localStorage.clear();
  safeSet(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.student);
  safeSet(STORAGE_KEYS.COURSES, DEMO_COURSES);
  safeSet(STORAGE_KEYS.QUIZZES, DEMO_QUIZZES);
  safeSet(STORAGE_KEYS.ATTEMPTS, DEMO_ATTEMPTS);
  safeSet(STORAGE_KEYS.ROADMAPS, DEMO_ROADMAPS);
  safeSet(STORAGE_KEYS.CHALLENGES, DEMO_CHALLENGES);
  safeSet(STORAGE_KEYS.PORTFOLIO, DEMO_PORTFOLIO_PROJECTS);
  safeSet(STORAGE_KEYS.OPPORTUNITIES, DEMO_OPPORTUNITIES);
}
