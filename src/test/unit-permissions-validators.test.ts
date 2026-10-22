import { describe, it, expect } from "vitest";
import {
  canAccessTeacherStudio,
  canCreateCourse,
  canPublishQuiz,
  canEditQuiz,
} from "@/lib/permissions";
import {
  contactFormSchema,
  quizGeneratorSchema,
  userProfileSchema,
  challengeSubmissionSchema,
} from "@/lib/validators";
import { checkRateLimit } from "@/lib/ai-provider";

describe("Role Permissions Helper", () => {
  it("allows teachers and admins to access Teacher Studio", () => {
    expect(canAccessTeacherStudio("teacher")).toBe(true);
    expect(canAccessTeacherStudio("admin")).toBe(true);
  });

  it("strictly forbids students from accessing Teacher Studio", () => {
    expect(canAccessTeacherStudio("student")).toBe(false);
    expect(canAccessTeacherStudio(undefined)).toBe(false);
  });

  it("allows only the quiz creator or admin to edit quizzes", () => {
    const creatorId = "teacher-123";
    expect(canEditQuiz(creatorId, "teacher-123", "teacher")).toBe(true);
    expect(canEditQuiz(creatorId, "different-teacher", "teacher")).toBe(false);
    expect(canEditQuiz(creatorId, "any-id", "admin")).toBe(true);
    expect(canEditQuiz(creatorId, "student-id", "student")).toBe(false);
  });
});

describe("Zod Validation Schemas", () => {
  it("validates well-formed contact form submissions", () => {
    const validData = {
      name: "Alex Chen",
      email: "alex.chen@university.edu",
      subject: "Bug in binary search simulation",
      message: "The midpoint calculation steps look great!",
      role: "student",
    };
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid emails and short messages in contact form", () => {
    const invalidData = {
      name: "A",
      email: "not-an-email",
      subject: "Hi",
      message: "Too short",
    };
    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("enforces challenge submission schema constraints", () => {
    const validSub = {
      challengeId: "c-1",
      submissionUrl: "https://my-demo.com",
      repoUrl: "https://github.com/my/repo",
      notes: "Implemented accessible combobox with ARIA roles.",
    };
    expect(challengeSubmissionSchema.safeParse(validSub).success).toBe(true);

    const invalidSub = {
      challengeId: "",
      submissionUrl: "not-a-url",
      notes: "short",
    };
    expect(challengeSubmissionSchema.safeParse(invalidSub).success).toBe(false);
  });
});

describe("AI Rate Limiter", () => {
  it("allows up to maximum requests within window and blocks exceeding attempts", () => {
    const testKey = "test-client-unique-123";
    for (let i = 0; i < 15; i++) {
      const res = checkRateLimit(testKey);
      expect(res.allowed).toBe(true);
    }
    const overflowRes = checkRateLimit(testKey);
    expect(overflowRes.allowed).toBe(false);
    expect(overflowRes.retryAfterSeconds).toBeGreaterThan(0);
  });
});
