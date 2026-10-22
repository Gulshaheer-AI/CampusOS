import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid university or personal email"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
  role: z.enum(["student", "teacher", "other"]).default("student"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const quizGeneratorSchema = z.object({
  topicOrText: z.string().min(10, "Please provide at least 10 characters of topic or source material"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  questionCount: z.number().int().min(3).max(20),
  questionType: z.enum(["multiple_choice", "true_false", "mixed"]),
  durationMinutes: z.number().int().min(1).max(60),
  isPracticeMode: z.boolean().default(true),
});

export type QuizGeneratorInput = z.infer<typeof quizGeneratorSchema>;

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  department: z.string().optional(),
  degree: z.string().optional(),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  interests: z.array(z.string()).default([]),
  learningPace: z.enum(["casual", "regular", "intensive"]).default("regular"),
  emailNotifications: z.boolean().default(true),
  themePreference: z.enum(["dark", "light", "system"]).default("dark"),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const courseCreateSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  code: z.string().min(2, "Course code must be at least 2 characters (e.g. CS101)"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Please select or enter a category"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

export const challengeSubmissionSchema = z.object({
  challengeId: z.string().min(1),
  submissionUrl: z.string().url("Must be a valid URL (e.g. deployed link or repo)"),
  repoUrl: z.string().url("Must be a valid repository URL").optional().or(z.literal("")),
  notes: z.string().min(10, "Please include brief notes on how you built your solution"),
});

export type ChallengeSubmissionInput = z.infer<typeof challengeSubmissionSchema>;
