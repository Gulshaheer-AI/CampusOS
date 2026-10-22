export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  degree?: string;
  major?: string;
  semester?: string;
  cgpa?: string;
  bio?: string;
  interests: string[];
  themePreference: "dark" | "light" | "system";
  emailNotifications: boolean;
  learningPace: "casual" | "regular" | "intensive";
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  isCompleted?: boolean;
  type: "reading" | "interactive" | "exercise";
  summary: string;
  content: string;
  syntaxNotes?: string | string[];
  codeExample?: {
    language: string;
    title?: string;
    starterCode?: string;
    code?: string;
    expectedOutput: string;
  };
  exercise?: {
    prompt: string;
    codeTemplate?: string;
    template?: string;
    answer: string;
    hint?: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface StudentNote {
  id: string;
  userId: string;
  title: string;
  courseId?: string;
  courseName?: string;
  content: string;
  fileName?: string;
  fileType?: "pdf" | "docx" | "csv" | "text" | "code" | "image";
  fileSize?: string;
  fileData?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: "pdf" | "notes" | "code" | "link";
  size: string;
  uploadDate: string;
  url?: string;
  description?: string;
  fileData?: string;
  fileName?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  enrolledStudentsCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  modules: CourseModule[];
  materials: CourseMaterial[];
  classCode: string;
  isEnrolled?: boolean;
}

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // for multiple_choice & true_false
  correctAnswer: number | string; // index for choice or string for text
  explanation: string;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  questions: Question[];
  creatorId: string;
  creatorName: string;
  creatorRole?: UserRole;
  isDraft: boolean;
  isPractice?: boolean;
  classCode?: string;
  assignedClass?: string;
  passingScore: number; // percentage
  allowedAttempts?: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  studentName?: string;
  userRole?: UserRole;
  isPractice?: boolean;
  answers: Record<string, string | number>;
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  weakTopics: string[];
}

export type TutorStyle =
  | "beginner"
  | "step_by_step"
  | "example_based"
  | "visual"
  | "exam_revision";

export interface TutorMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  citations?: string[];
  suggestedFollowups?: string[];
}

export interface TutorConversation {
  id: string;
  userId: string;
  title: string;
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  style: TutorStyle;
  createdAt: string;
  updatedAt: string;
  messages: TutorMessage[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  type: "reading" | "exercise" | "project";
  completed: boolean;
  estimatedHours: number;
  resourceTitle: string;
  resourceUrl?: string;
  syntaxNotes?: string | string[];
  codeExample?: {
    language: string;
    title?: string;
    starterCode?: string;
    code?: string;
    expectedOutput: string;
  };
  exercise?: {
    prompt: string;
    codeTemplate?: string;
    template?: string;
    answer: string;
    hint?: string;
  };
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  description: string;
  tasks: RoadmapTask[];
}

export interface Roadmap {
  id: string;
  title: string;
  category: "web_dev" | "data_analytics" | "ui_ux" | "digital_marketing" | "python" | "sql";
  tagline: string;
  description: string;
  durationWeeks: number;
  weeks: RoadmapWeek[];
  recommendedCareers: string[];
  skillsGained: string[];
}

export interface ChallengeStage {
  stageNumber: number;
  title: string;
  type: "warmup" | "fill_in" | "code_construct" | "boss_challenge";
  prompt: string;
  starterSnippet?: string;
  solutionPattern?: string;
  hint: string;
  xpReward: number;
  options?: string[];
  correctOption?: number;
  explanation?: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  summary: string;
  description: string;
  deliverables: string[];
  starterCode?: string;
  rubric: { criterion: string; points: number }[];
  stages?: ChallengeStage[];
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  studentName: string;
  submissionUrl: string;
  repoUrl?: string;
  notes: string;
  submittedAt: string;
  status: "submitted" | "reviewed" | "approved";
  feedback?: string;
  score?: number;
}

export interface PortfolioProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  zipFileName?: string;
  zipFileSize?: number;
  zipFileUrl?: string;
  isPublic: boolean;
  verified: boolean;
  completedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: "internship" | "scholarship" | "competition" | "mentorship" | "project" | "job" | "fellowship";
  location: string;
  remote: boolean;
  deadline: string;
  stipendOrAward?: string;
  description: string;
  requirements: string[];
  applicationUrl: string;
  isBookmarked?: boolean;
  userStatus?: "saved" | "applied" | "interviewing" | "offered";
  matchScore?: number;
  tailoredPitch?: string;
  /** Live web-verification metadata (set by /api/ai/opportunity search pipeline) */
  verified?: boolean;
  verifiedAt?: string;
  httpStatus?: number;
  finalUrl?: string;
  sourceDomain?: string;
  deadlineStatus?: "open" | "rolling";
  matchedKeywords?: string[];
}

export interface ConceptVisualizationStep {
  stepIndex: number;
  label: string;
  explanation: string;
  dataState: any;
  highlightedIndices?: number[];
  foundIndex?: number;
}

export interface InteractiveConcept {
  id: string;
  title: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  summary: string;
  theory: string[];
  realWorldUse: string;
  initialParams: any;
  steps: ConceptVisualizationStep[];
  checkpointQuestion: Question;
}

export type CvRegion = "european" | "pakistani" | "us";

export interface CvTemplate {
  id: string;
  name: string;
  region: CvRegion;
  description: string;
  atsScoreRate: number;
  layout: "single_column" | "two_column" | "modern_split" | "minimalist_academic";
  accentColor: string;
  governingBody?: string;
  standardsCode?: string;
  complianceRef?: string;
  atsTestedOn?: string;
  verifiedOfficial?: boolean;
}

export interface CvData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  summary: string;
  education: { institution: string; degree: string; year: string; gpa?: string; highlights?: string }[];
  experience: { company: string; role: string; period: string; bullets: string[] }[];
  projects: { name: string; tools: string; link?: string; bullets: string[] }[];
  skills: { category: string; items: string[] }[];
  certifications?: string[];
  // Regional Standards Fields:
  pecRegistrationNumber?: string;
  domicile?: string;
  cnic?: string;
  fatherName?: string;
  matricDivision?: string;
  fscDivision?: string;
  fypTitle?: string;
  fypSupervisor?: string;
  nationality?: string;
  dateOfBirth?: string;
  drivingLicence?: string;
  languages?: { language: string; proficiency: string; cefrLevel?: string }[];
  projectExperienceNarrative?: string;
  additionalInfo?: string;
}

export interface CvAuditResult {
  atsScore: number;
  overallVerdict: "Exceptional" | "Competitive" | "Needs Improvement";
  strengths: string[];
  improvements: { section: string; issue: string; suggestion: string }[];
  actionVerbSuggestions: { weak: string; replacement: string; reason: string }[];
  enhancedCvText?: string;
  enhancedCvData?: CvData;
}

