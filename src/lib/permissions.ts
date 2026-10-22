import { UserRole } from "@/types";

export function isTeacherOrAdmin(role?: UserRole): boolean {
  return role === "teacher" || role === "admin";
}

export function isAdmin(role?: UserRole): boolean {
  return role === "admin";
}

export function canAccessTeacherStudio(role?: UserRole): boolean {
  return role === "teacher" || role === "admin";
}

export function canCreateCourse(role?: UserRole): boolean {
  return role === "teacher" || role === "admin";
}

export function canPublishQuiz(role?: UserRole): boolean {
  return role === "teacher" || role === "admin";
}

export function canEditQuiz(
  quizCreatorId: string,
  userId: string,
  role?: UserRole
): boolean {
  if (role === "admin") return true;
  if (role === "teacher" && quizCreatorId === userId) return true;
  return false;
}

export function canViewStudentSubmissions(
  courseInstructorId: string,
  userId: string,
  role?: UserRole
): boolean {
  if (role === "admin") return true;
  if (role === "teacher" && courseInstructorId === userId) return true;
  return false;
}
