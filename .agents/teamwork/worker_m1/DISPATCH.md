## 2026-10-18T20:45:06Z

You are Worker 1 for Milestone 1 (M1: Dynamic RAG, Notes & QuizForge) on the CampusOS Platform Overhaul.
Your working directory is: c:\Users\amina\Desktop\CampusOS\.agents\teamwork\worker_m1
Your parent conversation ID is: 8a676417-5045-42a1-971a-68ba0d0e7941

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read these 3 files before starting any work:
1. c:\Users\amina\Desktop\CampusOS\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Users\amina\Desktop\CampusOS\PROJECT.md
3. c:\Users\amina\Desktop\CampusOS\.agents\teamwork\explorer_survey_1\handoff.md

Your Exclusive Scope (Features 1–12, covering R1, R2, R3):
1. R1: Dynamic In-Browser RAG Parser & Monday AI Engine
   - Create `src/lib/rag-parser.ts`: Implement robust in-browser text extractors for PDF (stream text object decoder), DOCX (XML <w:t> tags extractor), CSV (structured rows/columns), and plain text/slides. Enforce 10MB maximum file size validation.
   - Update `src/lib/rag-engine.ts`: Implement L2-normalized cosine vector similarity retrieval over TF-IDF vectors, add exact phrase match boosts, and semantic fallback for broad queries.
   - Update `src/lib/ai-provider.ts`: In local/offline fallback mode, synthesize responses directly grounded in the top retrieved `ragChunks` with citations ([Source: filename, Section X]) instead of canned binary search text.
   - Create `src/components/ui/MarkdownRenderer.tsx`: Build a clean markdown renderer that parses headings, bold/italic, bullet/numbered lists, horizontal rules, and syntax-highlighted code blocks with language badge and copy button. Eliminate all raw unparsed syntax, `***`, or backticks. Integrate it into `src/app/tutor/page.tsx`.
   - Update `src/components/rag/FileUploadDropzone.tsx`: Wire the new parser in `rag-parser.ts`.

2. R2: Dual-Tier Lecture Notes & Materials System
   - Update `src/types/index.ts`: Add `StudentNote` interface and update `CourseMaterial` with `fileData?: string` and `fileName?: string`.
   - Update `src/lib/store.ts`: Add CRUD functions for `StudentNote` (`getStudentNotes`, `saveStudentNote`, `deleteStudentNote`), `deleteCourseMaterial(courseId, materialId)`.
   - Update `src/app/teacher/page.tsx`: Provide genuine file upload inputs for course materials with accurate file size, timestamp, and delete material actions.
   - Update `src/app/courses/[courseId]/page.tsx`: Download actual uploaded lecture material file content or formatted lecture text.
   - Update `src/app/dashboard/page.tsx`: Add "Student Personal Notes Locker" component where students can upload, view, edit, and delete private notes, with a "Study with Monday AI" shortcut.
   - Update `src/app/tutor/page.tsx`: Add a multi-file selection drawer allowing students to select 1 or multiple personal notes from their locker (or course materials) to inject into the active RAG conversation context.

3. R3: Dynamic RAG QuizForge with Question Selection & Role Separation
   - Update `src/types/index.ts`: Add `points?: number` to `Question` interface, and `isPractice?: boolean` to `Quiz` and `QuizAttempt`.
   - Update `src/app/teacher/page.tsx`: In Quiz Studio, generate dynamic questions from uploaded lecture notes using AI / local grounded RAG. Implement full question curation: selection checkboxes (select/unselect questions for the assignment), inline editing of question prompt and distractor options, and configurable point values per question.
   - Update `src/app/quizzes/page.tsx`: Allow students to upload notes or paste text to generate personalized practice quizzes dynamically. Mark student practice quizzes with `isPractice: true`.
   - Data Isolation: In `src/app/teacher/page.tsx`, strictly filter cohort performance and gradebook tables so student self-practice attempts (`isPractice: true`) do NOT appear in teacher course grading.

Your Exclusive Write Boundaries:
- `src/lib/rag-parser.ts`
- `src/lib/rag-engine.ts`
- `src/lib/ai-provider.ts`
- `src/components/ui/MarkdownRenderer.tsx`
- `src/components/rag/FileUploadDropzone.tsx`
- `src/types/index.ts`
- `src/lib/store.ts`
- `src/app/tutor/page.tsx`
- `src/app/courses/[courseId]/page.tsx`
- `src/app/teacher/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/quizzes/page.tsx`

Verification Requirements:
1. Run `npm run test` and ensure all tests pass.
2. Run `npm run build` and ensure production build compiles cleanly with 0 TypeScript errors.
3. Write your complete handoff report to `c:\Users\amina\Desktop\CampusOS\.agents\teamwork\worker_m1\handoff.md` with:
   - Summary of implemented components and exact file diffs.
   - Verification commands and outputs (`npm run test` and `npm run build`).
4. Update your `progress.md`.
5. Send a completion message to parent conversation ID `8a676417-5045-42a1-971a-68ba0d0e7941`.
