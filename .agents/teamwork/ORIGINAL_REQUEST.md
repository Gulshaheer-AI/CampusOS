# Original User Request

## 2026-10-18T20:32:03Z

# Teamwork Project Prompt — CampusOS Platform Bug Fix & Full Feature Overhaul

> Status: Launched — delegated to teamwork_preview multi-agent system
> Goal: Fix all platform bugs, implement dynamic RAG document grounding, add shared & personal lecture notes, fix CodePlay AI copilot, integrate authentic W3Schools curricula, verify authentic regional CV templates with PDF/DOCX export, and enforce royal purple headers/footers with high-contrast text.
> Working directory: c:\Users\amina\Desktop\CampusOS
> Integrity mode: development
> Requested team: Full autonomous multi-agent engineering team
> AI Architecture: Direct Gemini API with high-fidelity local RAG fallback (real dynamic LLM inference when online, intelligent semantic vector matching when offline)

CampusOS is an AI-powered student learning, teaching, skill development, and career-readiness platform. This project resolves all identified bugs, implements genuine dynamic RAG document grounding for Monday AI and QuizForge, adds teacher/student lecture notes systems, fixes CodePlay AI Copilot, upgrades roadmaps with verified W3Schools curricula, verifies authentic regional CV standards with PDF/DOCX downloads, and polishes the royal purple claymorphism design with high-contrast readable typography.

## Requirements

### R1. Dynamic Multimodal RAG & AI Chatbot Response Engine
- Replace canned/predefined responses in Monday AI Tutor (`/tutor`) with real dynamic in-browser RAG parsing and chunk retrieval (cosine similarity / TF-IDF scoring over uploaded PDF, DOCX, CSV, and text lecture slides).
- When a user uploads a new document or slide deck, the chatbot must ground its answers strictly in the uploaded document's extracted chunks with citation attribution.
- Professional markdown rendering: Eliminate raw unparsed symbols, asterisks (such as `***`), or escaped characters; render clean headings, bullet points, and highlighted code blocks.
- Include fallback error handling for oversized files and API rate limits.

### R2. Dual-Tier Lecture Notes & Materials System (Campus Learner)
- **Teacher Course Materials (`/teacher`, `/courses/[courseId]`)**:
  - Instructors can upload lecture slides, PDF notes, and supplementary files for their course roster.
  - Published materials display upload timestamps, file size, download links, and are visible to enrolled students.
  - Strict role authorization: Only teachers can upload, update, and delete course materials.
- **Student Personal Notes Studio (`/tutor`, `/dashboard`)**:
  - Students have a dedicated private notes locker where they can upload and organize course notes.
  - In Monday AI Tutor, provide a multi-file selection drawer where students can choose 1 or multiple specific notes to feed into the active RAG conversation.

### R3. Dynamic RAG QuizForge with Question Selection & Role Separation
- **Teacher Quiz Studio (`/teacher`)**:
  - Dynamic RAG quiz generation: Upload custom lecture notes or slides to generate fresh, relevant quiz questions directly from the provided text (not hardcoded fixtures).
  - Question Selection: Teachers can review generated draft questions, select/unselect questions, edit question text and distractors, and specify point values before assigning to a class.
- **Student QuizForge (`/quizzes`)**:
  - Students can upload their own notes to generate personalized practice quizzes dynamically.
  - Clean separation between teacher-created assessments and student self-practice attempts so student quizzes do not leak into teacher course grading tables.

### R4. CodePlay AI Copilot & Real-Time IDE Debugging
- Fix CodePlay (`/codeplay`) AI Copilot for inline code generation, bug fixing, and syntax error explanation.
- Ensure the AI Copilot accepts active file buffer context, identifies syntax/runtime errors, and generates formatted code diffs or complete drop-in replacements.
- File explorer, tab switching, and sandboxed preview must run seamlessly without UI freezing or unhandled promise rejections.

### R5. Real W3Schools Curricula & Skill Roadmaps Integration
- Audit and resolve all bugs in Student and Teacher "My Courses" views (enrollment persistence, progress calculation, module completion).
- Expand Skill Roadmaps (`/roadmaps`, `/roadmaps/[roadmapId]`) with real, structured multi-week learning paths and coding tasks extracted from official W3Schools syllabi (HTML5/CSS3, Modern JavaScript ES6+, Python 3, SQL Relational Databases, and React).
- Eliminate superficial or empty placeholder tasks; provide concrete practice milestones and direct links to interactive exercises.

### R6. Challenges & Portfolio Overhaul
- Fix bugs in Challenge execution (`/challenges`, `/challenges/[challengeId]`) including code submission, rubric evaluation, and status tracking.
- Fix student portfolio (`/portfolio`) features: Ensure codebase ZIP archive upload and downloading work smoothly with proper MIME type headers, and validate shareable web URLs.

### R7. Verified Regional CV Studio, Generator & PDF/DOCX Export
- Audit all 12 regional CV templates (European, Pakistani, and US standards) to verify each represents an authentic, proven regional recruitment format (not superficial color swaps).
  - European: Europass Standard, UK Graduate Scheme, German Tabellarischer Lebenslauf, Nordic Engineering.
  - Pakistani: HEC/PEC Engineering, PSEB Software Export House, Rozee Corporate, FPSC/SPSC Civil Service.
  - US: Ivy League/Harvard CS, Silicon Valley Tech Startup, Wall Street Quant/Finance, US Federal USAJOBS.
- AI CV Auditor: Support user CV file upload, perform realistic section-by-section ATS scoring and deficiency analysis, allow users to apply AI fixes, and render the updated CV in real time.
- Download capabilities: Provide both clean formatted PDF and editable text/DOCX export options.

### R8. Royal Purple Claymorphism Theme & High-Contrast Typography
- Enforce pure white canvas (`#FFFFFF`) as the global page background.
- Main headers, hero banners, and footers must feature the prominent Royal Purple Clay styling (`clay-card-purple`, `#6653E6` gradient, soft drop-shadows).
- Text contrast: All text on white/light surfaces must be dark and readable (`text-slate-900`/`text-slate-950 font-black` or `text-brand-purple font-extrabold` for headings; `text-slate-700 font-medium` for body copy).
- Never render white text (`text-white`) on white or light backgrounds.

---

## Acceptance Criteria

### Dynamic RAG & Monday AI
- [ ] Uploading a custom document in `/tutor` dynamically parses text, chunks content, and grounds Monday AI answers in the uploaded file.
- [ ] Monday AI responses format clean Markdown without raw `***` or unrendered syntax.
- [ ] Uploading a new file generates answers specific to that file rather than fallback fixtures.

### Notes System
- [ ] Teachers can upload, view, edit, and delete course lecture notes with timestamps in `/teacher` and `/courses/[courseId]`.
- [ ] Enrolled students can view and download published teacher notes.
- [ ] Students can upload personal notes in their private locker and toggle them into the AI tutor RAG drawer.

### QuizForge Overhaul
- [ ] Teachers can upload notes in `/teacher` to generate new quiz questions dynamically.
- [ ] Teachers can select, edit, and curate questions before saving or assigning.
- [ ] Students can generate practice quizzes from their own uploaded notes in `/quizzes`.
- [ ] Teacher-assigned quizzes and student self-practice attempts maintain strict data isolation.

### CodePlay Copilot
- [ ] CodePlay AI Copilot successfully analyzes the current editor buffer and provides actionable code generation, bug fixes, and explanations.

### W3Schools Curricula
- [ ] Roadmaps contain real, structured syllabi and tasks mapped to W3Schools tracks with verifiable learning objectives.
- [ ] My Courses displays correct enrollment state and module progress for both students and instructors.

### Portfolio & Challenges
- [ ] Challenge submissions persist correctly with rubric evaluation.
- [ ] Portfolio ZIP upload, download, and public share links work without errors.

### Regional CV Studio & Export
- [ ] All 12 regional CV templates exhibit distinct, authentic regional layouts and ATS structures.
- [ ] AI CV Auditor accepts uploaded CVs, generates actionable recommendations, and allows instant application of fixes.
- [ ] Students can download their finalized CV in both PDF and DOCX formats.

### Visual Styling & Accessibility
- [ ] Page background is pure white (`#FFFFFF`).
- [ ] Main headers, hero banners, and footers use Royal Purple styling.
- [ ] Zero unreadable or invisible text across all pages.
- [ ] Full Vitest test suite passes with 0 failures (`npm run test`).
- [ ] Production build succeeds with 0 TypeScript errors (`npm run build`).
