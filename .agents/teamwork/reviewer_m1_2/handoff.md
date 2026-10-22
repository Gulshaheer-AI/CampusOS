# Milestone 1 (M1) Independent Review & Adversarial Challenge Report

**Reviewer**: Reviewer 2 (`reviewer_m1_2`)  
**Roles**: Reviewer & Adversarial Critic  
**Scope**: Milestone 1 (M1), focusing specifically on Requirements **R2** (Dual-Tier Lecture Notes System) and **R3** (Dynamic QuizForge, Curation & Cohort Data Isolation)  
**Verdict**: **APPROVE**  
**Overall Risk Assessment**: **LOW** (3 minor non-blocking edge-case recommendations noted)

---

## 1. Observation

Directly observed verification executions and codebase artifacts:

1. **Test Execution (`npm run test`)**:
   - Command: `npm run test` (Vitest v2.1.9)
   - Result: Exit code 0 across all 7 test files, 128 tests passed:
     - `src/test/e2e-theme-contrast.test.ts` (18 tests passed)
     - `src/test/unit-scoring.test.ts` (5 tests passed)
     - `src/test/unit-ai-provider.test.ts` (3 tests passed)
     - `src/test/unit-permissions-validators.test.ts` (7 tests passed)
     - `src/test/e2e-cv-templates-export.test.ts` (18 tests passed)
     - `src/test/e2e-rag-notes-quiz.test.ts` (39 tests passed)
     - `src/test/e2e-codeplay-curricula.test.ts` (38 tests passed)
   - Zero test failures, zero skipped tests.

2. **Next.js Production Build (`npm run build`)**:
   - Command: `npm run build` (Next.js 14.2.15)
   - Result: Exit code 0.
   - All 26 static (`○`) and dynamic (`ƒ`) routes compiled without errors:
     - `/` (8.12 kB)
     - `/dashboard` (7.29 kB)
     - `/courses/[courseId]` (5.16 kB)
     - `/quizzes` (8.9 kB)
     - `/teacher` (11.7 kB)
     - `/tutor` (14.1 kB)
     - `/api/ai/quiz` (0 B, dynamic)
     - `/api/ai/chat` (0 B, dynamic)
   - Zero TypeScript diagnostics errors, zero ESLint blocking errors.

3. **Dual-Tier Lecture Notes & Materials System (R2)**:
   - `src/app/teacher/page.tsx` (lines 606–811):
     - Teacher course material upload dialog with hidden file input (`materialFileInputRef`, accept: `.pdf,.docx,.txt,.csv,.py,.ts,.json,.md`).
     - Real file size formatting in `handleMaterialFileChange` (`file.size > 1024*1024 ? ... MB : ... KB`).
     - Persistent file storage: `fileData` read as Data URL (`reader.readAsDataURL(file)`) and attached to `CourseMaterial`.
     - Materials list with title, type, size, upload date, and active badge.
     - Material deletion wired to `deleteCourseMaterial(editingCourse.id, materialId)`.
     - Strict authorization barrier (lines 442–463): If `user.role !== "teacher" && user.role !== "admin"`, access is denied with "Access Restricted" view.
   - `src/app/courses/[courseId]/page.tsx` (lines 91–153, 337–368):
     - Displays all course materials (`Course Materials (${course.materials.length})`).
     - Genuine file download in `handleDownloadMaterial`:
       - If `mat.fileData.startsWith("data:")`, creates download anchor with authentic `mat.fileName`.
       - If text, creates Blob with `application/pdf` or `text/plain;charset=utf-8`.
       - Fallback generates structured lecture notes text file with study invariants and academic metadata.
   - `src/app/dashboard/page.tsx` (lines 357–481):
     - Student Personal Notes Locker displays private notes count badge.
     - "Add / Upload Note" modal parses documents via `parseDocumentFile(file)` (with FileReader fallback).
     - Full note cards with title, file type badge, file size, course tag, preview, and actions: View, Edit, Delete.
     - "Study with Monday AI" shortcut button linking directly to `/tutor?noteId=${note.id}`.
   - `src/app/tutor/page.tsx` (lines 535–708):
     - Collapsible knowledge drawer (`isRagDrawerOpen`) with dual tabs: `"locker"` (Notes Locker) and `"upload"` (`FileUploadDropzone`).
     - Notes Locker tab renders student's personal notes locker and course materials with selection checkboxes.
     - Controls: `toggleNoteInRag`, `selectAllLockerNotes`, `clearAllSelectedNotes`.
     - Automatically parses `?noteId=` query parameter on mount to auto-select and activate the target note into active RAG context.
     - Real-time TF-IDF cosine retrieval in `handleSendMessage` ranks chunks across selected files and attaches citations to prompt and response.

4. **Dynamic QuizForge, Curation & Role Separation (R3)**:
   - `src/app/teacher/page.tsx` (lines 816–1132):
     - Assessment generator accepts uploaded lecture documents (`parseDocumentFile`) or raw text paste.
     - Drafts questions via `/api/ai/quiz` (Gemini API with fallback to `generateQuizFromText`).
     - Curation interface provides:
       - Question selection checkboxes (`toggleQuestionSelection`, `selectAllQuestions`, `deselectAllQuestions`).
       - Selected question count and total points counter (`quizDraftQuestions.filter(q => selectedQuestionIds.has(q.id)).reduce((sum, q) => sum + (q.points || 10), 0)`).
       - Editable prompt input (`updateQuestionText`).
       - Editable distractor inputs (`updateQuestionOption`).
       - Radio buttons to designate the correct answer index (`updateQuestionCorrectAnswer`).
       - Custom points input per question (`updateQuestionPoints`), min 1.
       - Explanation editor (`updateQuestionExplanation`).
       - Trash button to delete individual draft questions (`deleteDraftQuestion`).
       - Save handler (`handleSaveQuiz`) verifies that only curated selected questions are published (`isDraft: false`, `isPractice: false`).
   - `src/app/quizzes/page.tsx` (lines 132–233, 667–840):
     - Students upload lecture notes or paste text to generate custom practice quizzes.
     - Generated quizzes are saved with `creatorRole: "student"`, `isPractice: true`.
     - Completed attempts are saved with `isPractice: true`.
     - Catalog separates Official Faculty Quizzes, "My Personal Practice Quizzes (Ahmad Khan)", and isolated past student attempts.
   - `src/app/teacher/page.tsx` (lines 1257–1384):
     - Strict data isolation from faculty gradebook:
       `attempts.filter((a) => a.userRole !== "teacher" && !a.isPractice)`
     - Student roster cards (Ahmad, Hassan, Zain) and cohort table compute averages and weak topics strictly excluding self-practice attempts.

5. **Integrity Check**:
   - Grep search for `bypass|mock|dummy|fake` returned zero matches.
   - Algorithms in `rag-engine.ts` use genuine TF-IDF vectorization with L2 normalization and cosine dot-product scoring.
   - Client document parsing in `rag-parser.ts` implements genuine PDF stream decoding (`BT...ET`, `Tj`, `TJ`) and pure TypeScript DOCX ZIP decompression.
   - Data stores in `store.ts` use reactive `safeGet`/`safeSet` to `localStorage` with initial demo dataset seeding.

---

## 2. Logic Chain

1. **R2 Compliance (Dual-Tier Lecture Notes)**:
   - *Observation*: Instructors can attach files in `/teacher`, and materials are displayed with metadata and deletion capabilities.
   - *Observation*: Students viewing `/courses/[courseId]` can download materials matching their uploaded content.
   - *Observation*: Students in `/dashboard` have a dedicated Notes Locker for uploading, editing, and deleting private notes, and can launch Monday AI with a single click.
   - *Observation*: Students in `/tutor` can toggle 1 or more personal notes and course materials via the drawer into the RAG context.
   - *Inference*: Requirement R2 is fully implemented with complete end-to-end functionality across both teacher and student roles.

2. **R3 Compliance (Dynamic QuizForge & Data Isolation)**:
   - *Observation*: Teachers can auto-generate questions from uploaded notes, toggle question inclusion with checkboxes, edit text, options, and explanations, and set custom point values per question.
   - *Observation*: Students in `/quizzes` can generate personalized practice quizzes from their own notes, tagged with `isPractice: true`.
   - *Observation*: In `/teacher`, the gradebook analytics and student gap diagnostics filter explicitly by `!a.isPractice`.
   - *Observation*: Vitest E2E test `should strictly isolate student practice attempts from teacher cohort gradebook` proves that a student's 40% self-practice score does not alter the 90% official cohort average.
   - *Inference*: Requirement R3 is fully implemented with complete cohort data isolation.

3. **Build & Test Verification**:
   - *Observation*: `npm run test` executes 7 test files, passing 128 of 128 tests.
   - *Observation*: `npm run build` compiles 26 Next.js routes with exit code 0.
   - *Inference*: The implementation causes zero regressions and complies with TypeScript and production build requirements.

---

## 3. Review Report

### Verdict
**APPROVE**

### Findings

#### [Minor] Finding 1: CSV Export in Teacher Studio Omits `!isPractice` Filter
- **What**: The "Export CSV" action in `/teacher` exports all attempts in state without filtering out practice attempts or non-student records.
- **Where**: `src/app/teacher/page.tsx`, lines 422–438:
  ```typescript
  const handleExportCSV = () => {
    const headers = "Attempt ID,Student ID,Quiz Title,Score Percentage,Passed,Completed At\n";
    const rows = attempts
      .map(
        (a) =>
          `"${a.id}","${a.userId}","${a.quizTitle}",${a.scorePercentage},${a.passed},"${a.completedAt}"`
      )
      .join("\n");
  ```
- **Why**: While the on-screen gradebook table and student cards strictly filter by `!a.isPractice && a.userRole !== "teacher"`, downloading the CSV file could inadvertently include student self-practice attempts.
- **Suggestion**: Update `rows` generation to filter `attempts.filter((a) => a.userRole !== "teacher" && !a.isPractice).map(...)`.

#### [Minor] Finding 2: Course Material Base64 Data URL Persistence Quota
- **What**: Course materials with uploaded files store the raw Base64 data URL directly in `localStorage` via `CourseMaterial.fileData`.
- **Where**: `src/app/teacher/page.tsx`, lines 201–226.
- **Why**: Standard browser `localStorage` is restricted to ~5MB per origin. Uploading multiple files approaching the 10MB limit could trigger a `QuotaExceededError`.
- **Suggestion**: For files larger than ~2MB, store file data in `IndexedDB` or provide an alert if `localStorage` space is nearly exhausted.

#### [Minor] Finding 3: Dashboard Note Upload Fallback Ignores Size Limit
- **What**: In `DashboardPage`, `handleCreateNoteFile` catches errors from `parseDocumentFile(file)` (which includes `FileSizeExceededError`) and unconditionally falls back to `reader.readAsText(file)` without checking the 10MB limit in the catch block.
- **Where**: `src/app/dashboard/page.tsx`, lines 125–141.
- **Why**: A file >10MB will throw `FileSizeExceededError` in `parseDocumentFile`, but the fallback FileReader will attempt to read the entire file into memory as raw text anyway.
- **Suggestion**: In the catch handler, inspect `if (err instanceof FileSizeExceededError)` and notify the user with an error alert rather than reading the file.

---

## 4. Adversarial Challenge Report

### Overall Risk Assessment: LOW

### Challenges

#### [Low] Challenge 1: LocalStorage Quota Saturation under Multi-MB File Uploads
- **Assumption challenged**: Assumes client `localStorage` can persist multiple uploaded lecture documents and notes indefinitely.
- **Attack scenario**: A teacher uploads three 1.5MB PDF lecture slides. Base64 encoding expands this to ~6MB, exceeding typical 5MB `localStorage` limits. `safeSet` catches the error and logs a warning, but the course material changes fail to persist on refresh.
- **Blast radius**: Course materials uploaded during that session will not persist across browser reloads.
- **Mitigation**: Move large binary attachments (`fileData`) to an `IndexedDB` key-value store (e.g. `idb-keyval`), leaving only lightweight metadata in `localStorage`.

#### [Low] Challenge 2: CSV Gradebook Export Leakage
- **Assumption challenged**: Assumes teachers exporting cohort grades via CSV expect the file to reflect the exact rows displayed on screen.
- **Attack scenario**: A teacher exports the cohort CSV expecting only official exam grades, but receives student personal study attempts.
- **Blast radius**: Gradebook discrepancies if the teacher imports the raw CSV into an external grading spreadsheet.
- **Mitigation**: Synchronize the export filter with the table filter: `attempts.filter(a => !a.isPractice && a.userRole !== "teacher")`.

### Stress Test Results
1. **Empty / Special Character Notes in RAG**:
   - Input: Unicode equations, emojis, markdown fences (`$$T(n) = 2T(n/2) + O(n)$$`, `🚀`).
   - Expected: Clean chunking and vector retrieval without crash.
   - Result: **PASS** (Verified in unit and E2E tests).
2. **Teacher Deselecting All Questions in Curation**:
   - Action: Teacher deselects all draft questions and attempts to publish.
   - Expected: Publishing blocked with a validation notification.
   - Result: **PASS** (Blocked at line 384: `if (curated.length === 0) { alert(...); return; }`).
3. **Student Practice Quiz Impact on Teacher Gradebook**:
   - Action: Student scores 40% on self-practice quiz.
   - Expected: Class cohort average in teacher studio remains 90%.
   - Result: **PASS** (Strictly filtered out by `!a.isPractice`).

---

## 5. Verified Claims

| Claim | Method | Result |
|---|---|---|
| 128 Vitest tests pass | `npm run test` | **PASS** (128/128 passed) |
| Next.js production build succeeds | `npm run build` | **PASS** (Exit code 0, 26/26 routes) |
| Teacher can upload, size, and delete materials | Code inspection & unit tests | **PASS** (`teacher/page.tsx:213-245`) |
| Course materials authentic file download | Code inspection & test | **PASS** (`courses/[courseId]/page.tsx:91-153`) |
| Student Personal Notes Locker CRUD | Code inspection & E2E tests | **PASS** (`dashboard/page.tsx:106-203`) |
| Multi-file selection drawer in AI Tutor | Code inspection & E2E tests | **PASS** (`tutor/page.tsx:195-250, 552-708`) |
| Teacher dynamic quiz generation & question curation | Code inspection & E2E tests | **PASS** (`teacher/page.tsx:970-1132`) |
| Student practice quiz isolation from gradebook | Code inspection & E2E tests | **PASS** (`teacher/page.tsx:1265-1380`) |
| Zero integrity violations (hardcoded/facade) | Global codebase search | **PASS** (No dummy facades found) |

---

## 6. Caveats

- **Client Storage Quotas**: Browser `localStorage` quotas (~5MB) apply to stored base64 lecture notes and course materials; very large files should ideally migrate to `IndexedDB`.
- **Browser FlateDecode Support**: Standard modern browsers (Chrome, Edge, Firefox, Safari) support `DecompressionStream('deflate-raw')`. Older legacy browsers without `DecompressionStream` fall back to text reading.

---

## 7. Conclusion

Milestone 1 (M1) successfully meets all functional, architectural, and data isolation requirements for **R2** (Dual-Tier Lecture Notes System) and **R3** (Dynamic QuizForge & Curation). All 128 tests pass without errors, and the Next.js production build compiles cleanly. There are zero integrity violations or dummy facades. The work is **APPROVED**.

---

## 8. Verification Method

To independently reproduce this verification:
1. Run Vitest test suite:
   ```powershell
   npm run test
   ```
   *Expected*: 7 test files pass, 128 tests pass.
2. Run Next.js production build:
   ```powershell
   npm run build
   ```
   *Expected*: Exit code 0, 26 routes compiled without errors.
3. Review key implementation files:
   - `src/app/teacher/page.tsx`
   - `src/app/courses/[courseId]/page.tsx`
   - `src/app/dashboard/page.tsx`
   - `src/app/tutor/page.tsx`
   - `src/app/quizzes/page.tsx`
   - `src/types/index.ts`
   - `src/lib/store.ts`
   - `src/test/e2e-rag-notes-quiz.test.ts`
