# Project: CampusOS Platform Bug Fix & Full Feature Overhaul

## Architecture
- Module/package boundaries, data flow, shared interfaces:
  - **Framework**: Next.js 14 App Router (`src/app`), React 18, TypeScript, Tailwind CSS with Claymorphism styling.
  - **State & Persistence**: Reactive LocalStorage-backed client store in `src/lib/store.ts`, data contracts in `src/types/index.ts`.
  - **AI Engine**: Direct Gemini API with Grounded Local Fallback in `src/lib/ai-provider.ts` and `/api/ai/*` routes.
  - **Dynamic In-Browser RAG**: Multi-format document parser in `src/lib/rag-parser.ts`, L2-normalized cosine vector retrieval in `src/lib/rag-engine.ts`, clean Markdown renderer in `src/components/ui/MarkdownRenderer.tsx`.
  - **Dual-Tier Lecture Notes**: Teacher `CourseMaterial` with genuine file uploads and downloads in `/teacher` and `/courses/[courseId]`; Student `StudentNote` private locker in `/dashboard` and multi-file selection drawer in `/tutor`.
  - **QuizForge Studio**: Dynamic note-grounded question generator, curation UI (checkboxes, question/distractor editing, point values) in `/teacher`, student self-practice in `/quizzes` with cohort data isolation.
  - **CodePlay IDE & Copilot**: Active buffer context, specialized AI copilot actions (`generate`, `debug`, `explain`, `fix_error`, `beautify`), formatted code diffs and drop-in replacements, unhandled rejection trapping in `/codeplay`.
  - **W3Schools Curricula & Courses**: 5 official W3Schools syllabi (HTML5/CSS3, JS ES6+, Python 3, SQL, React) with syntax notes and interactive exercises in `/roadmaps`, class code enrollment persistence in `/courses` and `store.ts`, multi-module progress tracking in `scoring.ts`.
  - **Challenges & Portfolio**: Challenge rubrics and submission status tracking in `/challenges`, valid ZIP archive generation and shareable public recruiter view (`?student=...`) in `/portfolio`.
  - **Regional CV Studio & Exporters**: Dedicated `/cv` route, 12 authentic regional recruitment templates (European: Europass, UK Grad, DIN 5008, Nordic; Pakistani: HEC/PEC, PSEB, Rozee, FPSC/SPSC; US: Harvard CS, Silicon Valley, Wall Street, USAJOBS), real-time AI fixes wired to `cvData`, clean print-to-PDF styles and Word `.docx` generator.
  - **Royal Purple Claymorphism Theme**: Pure white canvas `#FFFFFF`, Royal Purple Clay (`clay-card-purple`, `#6653E6` gradient, soft drop-shadows) on headers, hero banners, and footers, zero white-on-white text violations.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dynamic In-Browser RAG Parser | Client-side parser for PDF, DOCX, CSV, and text slides with 10MB guard | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Normalized Cosine Vector Retrieval | L2-normalized TF-IDF scoring and phrase-match boost in `rag-engine.ts` | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Grounded Local AI Fallback | Ground fallback responses strictly in retrieved RAG chunks with citations | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Markdown Rendering Engine | Clean markdown typography without raw `***` or unrendered syntax | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Teacher Course Materials Upload & Management | Real file upload, size calculation, download, and deletion in `/teacher` | M1 | ORIGINAL_REQUEST §R2 |
| 6 | Course Materials Download | Genuine file download matching uploaded content in `/courses/[courseId]` | M1 | ORIGINAL_REQUEST §R2 |
| 7 | Student Personal Notes Locker | Private notes locker on `/dashboard` with upload, view, edit, delete | M1 | ORIGINAL_REQUEST §R2 |
| 8 | Multi-File RAG Selection Drawer | Drawer in `/tutor` allowing toggling 1+ student notes into active chat context | M1 | ORIGINAL_REQUEST §R2 |
| 9 | Teacher Dynamic QuizForge Studio | Upload lecture notes to generate quiz questions via AI/grounded fallback | M1 | ORIGINAL_REQUEST §R3 |
| 10 | Quiz Question Curation & Points | Selection checkboxes, question/distractor editing, point inputs in teacher studio | M1 | ORIGINAL_REQUEST §R3 |
| 11 | Student Practice QuizForge | Upload notes/text on `/quizzes` to generate personalized practice quizzes | M1 | ORIGINAL_REQUEST §R3 |
| 12 | Quiz Data Isolation | Exclude student self-practice attempts from teacher cohort gradebook tables | M1 | ORIGINAL_REQUEST §R3 |
| 13 | CodePlay Buffer Context Integration | Accept active file buffer (HTML, CSS, JS, Python, etc.) in copilot | M2 | ORIGINAL_REQUEST §R4 |
| 14 | CodePlay AI Copilot Specialized Actions | Implement `generate`, `debug`, `explain`, `fix_error`, `beautify` handlers | M2 | ORIGINAL_REQUEST §R4 |
| 15 | CodePlay Diff & Drop-in Replacement UI | Side-by-side/inline diff preview with "Apply Replacement" button | M2 | ORIGINAL_REQUEST §R4 |
| 16 | Sandboxed Preview Error Handling | Capture unhandled promise rejections and syntax errors without freezing | M2 | ORIGINAL_REQUEST §R4 |
| 17 | CodePlay Gutter & Workspace Controls | Synchronized line numbers scroll and file creation/deletion controls | M2 | ORIGINAL_REQUEST §R4 |
| 18 | Official W3Schools Syllabi | 5 tracks: HTML5/CSS3, JS ES6+, Python 3, SQL, React with syntax/examples/labs | M2 | ORIGINAL_REQUEST §R5 |
| 19 | Course Enrollment Persistence | Class code enrollment saved to user profile in `store.ts` | M2 | ORIGINAL_REQUEST §R5 |
| 20 | Course Progress & Module Calculation | Accurate lesson & module completion across multi-module courses | M2 | ORIGINAL_REQUEST §R5 |
| 21 | Challenge Rubric Evaluation | Render rubric criteria and points in `/challenges/[challengeId]` | M2 | ORIGINAL_REQUEST §R6 |
| 22 | Challenge Submission Status Tracking | Status badges (Submitted, Reviewed, Approved) in catalog & detail views | M2 | ORIGINAL_REQUEST §R6 |
| 23 | Valid Portfolio ZIP Generation | Generate genuine, extractable ZIP archives for codebase download | M2 | ORIGINAL_REQUEST §R6 |
| 24 | Shareable Recruiter Portfolio URLs | Read `?student=...` param to render target student's public projects | M2 | ORIGINAL_REQUEST §R6 |
| 25 | Dedicated `/cv` Route & Sidebar Nav | First-class route at `/cv` for CV Studio & AI Auditor, linked in sidebar | M3 | ORIGINAL_REQUEST §R7 |
| 26 | 12 Authentic Regional CV Templates | Authentic formats: Europass, UK Grad, DIN 5008, Nordic; HEC/PEC, PSEB, Rozee, FPSC/SPSC; Harvard CS, Silicon Valley, Wall Street, USAJOBS | M3 | ORIGINAL_REQUEST §R7 |
| 27 | AI CV Auditor Real-Time Application | Section-by-section scoring and direct wiring of fixes into live `cvData` | M3 | ORIGINAL_REQUEST §R7 |
| 28 | Formatted PDF & DOCX CV Export | Clean `@media print` PDF styles and Word `.docx` file generator | M3 | ORIGINAL_REQUEST §R7 |
| 29 | Pure White Background Canvas | Enforce `#FFFFFF` global canvas across all pages and layouts | M4 | ORIGINAL_REQUEST §R8 |
| 30 | Royal Purple Clay Headers, Heros & Footers | Apply `clay-card-purple` gradient & styling to headers, hero banners, footer | M4 | ORIGINAL_REQUEST §R8 |
| 31 | High-Contrast Typography & Contrast Fixes | Eliminate white text on white/light surfaces in dropzone, labs, buttons, cards | M4 | ORIGINAL_REQUEST §R8 |
| 32 | Full E2E Test Suite & Adversarial Hardening | Comprehensive test coverage across all 8 requirements (Tiers 1-5) | M5 | ORIGINAL_REQUEST §Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dynamic RAG, Notes & QuizForge | Features 1–12 (R1, R2, R3) | none | IN_PROGRESS |
| M2 | CodePlay, W3Schools & Challenges | Features 13–24 (R4, R5, R6) | none | PLANNED |
| M3 | Regional CV Studio & Exporters | Features 25–28 (R7) | none | PLANNED |
| M4 | Theme, Typography & Contrast | Features 29–31 (R8) | none | PLANNED |
| M5 | E2E Testing, Adversarial Hardening & Final Verification | Feature 32, Full E2E Suite, Vitest & Build | M1, M2, M3, M4 | PLANNED |

## Code Layout
- Exclusive File Boundaries for Milestones:
  - **M1 (R1, R2, R3)**:
    - `src/lib/rag-parser.ts` (NEW)
    - `src/lib/rag-engine.ts`
    - `src/lib/ai-provider.ts`
    - `src/components/ui/MarkdownRenderer.tsx` (NEW)
    - `src/app/tutor/page.tsx`
    - `src/app/courses/[courseId]/page.tsx`
    - `src/app/teacher/page.tsx` (course materials & quiz studio sections)
    - `src/app/dashboard/page.tsx` (student notes locker section)
    - `src/app/quizzes/page.tsx` (custom quiz generator & attempt isolation)
    - `src/types/index.ts` (StudentNote, CourseMaterial, Question points, isPractice)
    - `src/lib/store.ts` (note locker CRUD, delete material, practice attempts)
  - **M2 (R4, R5, R6)**:
    - `src/app/codeplay/page.tsx`
    - `src/app/api/ai/codeplay/route.ts`
    - `src/components/codeplay/*`
    - `src/lib/demo-data.ts` (W3Schools syllabi: HTML/CSS, JS, Python, SQL, React; challenge rubrics & submissions)
    - `src/app/roadmaps/page.tsx` & `src/app/roadmaps/[roadmapId]/page.tsx`
    - `src/components/learn/W3InteractiveLab.tsx`
    - `src/app/courses/page.tsx` (class code enrollment)
    - `src/lib/scoring.ts` (course progress calculation)
    - `src/app/challenges/page.tsx` & `src/app/challenges/[challengeId]/page.tsx`
    - `src/app/portfolio/page.tsx` (valid zip download, ?student= query param)
    - `src/lib/zip-generator.ts` (NEW: valid client-side ZIP generator)
  - **M3 (R7)**:
    - `src/app/cv/page.tsx` (NEW dedicated route)
    - `src/components/cv/CvRegionalPreview.tsx` (NEW authentic 12-template renderer)
    - `src/components/cv/CvAiAuditor.tsx` (NEW or extracted auditor component)
    - `src/lib/cv-templates-data.ts` (NEW or updated 12 authentic regional definitions)
    - `src/lib/docx-generator.ts` (NEW client Word .docx generator)
    - `src/components/layout/AppSidebar.tsx` (nav link to `/cv`)
    - `src/app/opportunities/page.tsx` (link/embed `/cv`)
    - `src/app/api/ai/cv/route.ts` (section ATS scoring)
  - **M4 (R8)**:
    - `src/components/rag/FileUploadDropzone.tsx` (contrast fixes)
    - `src/components/ui/Button.tsx` (contrast fixes)
    - `src/components/ui/Card.tsx` (contrast fixes)
    - `src/components/layout/Footer.tsx` (Royal Purple Clay styling)
    - `src/app/globals.css` (print styles, royal purple variables)
    - `src/app/challenges/page.tsx` (hero banner)
  - **M5 (E2E & Test Infra)**:
    - `src/test/e2e-rag-notes.test.ts`
    - `src/test/e2e-codeplay-curricula.test.ts`
    - `src/test/e2e-cv-templates.test.ts`
    - `src/test/e2e-theme-contrast.test.ts`
