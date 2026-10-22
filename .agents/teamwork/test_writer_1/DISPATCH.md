## 2026-10-18T20:45:48Z
You are the E2E Test Writer on the CampusOS Platform Overhaul.
Your working directory is: c:\Users\amina\Desktop\CampusOS\.agents\teamwork\test_writer_1
Your parent conversation ID is: 8a676417-5045-42a1-971a-68ba0d0e7941

MANDATORY FIRST STEP:
Read these 3 files:
1. c:\Users\amina\Desktop\CampusOS\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Users\amina\Desktop\CampusOS\PROJECT.md
3. c:\Users\amina\Desktop\CampusOS\TEST_INFRA.md

Your Mission:
Design and write comprehensive, opaque-box, requirement-driven tests for the CampusOS platform across all 8 requirements using Vitest.

Target Test Files (You exclusively own these test files under `src/test/`):
- `src/test/e2e-rag-notes-quiz.test.ts`:
  - Feature 1: Dynamic RAG chunk parsing (PDF, DOCX, CSV, TXT), cosine vector retrieval, grounded fallback citations, markdown parsing.
  - Feature 2: Dual-tier notes (Teacher CourseMaterial uploads, size, download; Student Personal Notes Locker, multi-file selection into RAG drawer).
  - Feature 3: Dynamic QuizForge (note-grounded generation, question selection, distractor/points editing, student practice isolation from teacher cohort gradebook).
- `src/test/e2e-codeplay-curricula.test.ts`:
  - Feature 4: CodePlay copilot (active file buffer, specialized actions `generate`, `debug`, `explain`, `fix_error`, diff formatting, sandbox error trapping).
  - Feature 5: W3Schools syllabi (HTML/CSS, JS, Python, SQL, React tracks, syntax notes, exercises, class code enrollment persistence, module completion).
  - Feature 6: Challenges & Portfolio (rubric evaluation rendering, submission status tracking, valid ZIP archive generation, shareable URL query `?student=...`).
- `src/test/e2e-cv-templates-export.test.ts`:
  - Feature 7: All 12 Regional CV templates (European: Europass, UK Grad, DIN 5008, Nordic; Pakistani: HEC/PEC, PSEB, Rozee, FPSC/SPSC; US: Harvard CS, Silicon Valley, Wall Street, USAJOBS), AI CV auditor real-time application to `cvData`, clean PDF print formatting and DOCX export.
- `src/test/e2e-theme-contrast.test.ts`:
  - Feature 8: Page background pure white `#FFFFFF`, Royal Purple Clay styling on headers, hero banners, and footers (`clay-card-purple`), zero white text on white/light backgrounds.

CRITICAL CONSTRAINTS:
- You MUST NOT modify any application implementation code in `src/app`, `src/components`, `src/lib`, etc.
- You write ONLY tests under `src/test/`.
- Ensure tests use standard Vitest assertions (`describe`, `it`, `expect`).
- Ensure all existing unit tests in `src/test/unit-*.test.ts` remain intact.
- When done, write `c:\Users\amina\Desktop\CampusOS\.agents\teamwork\test_writer_1\handoff.md`, update `progress.md`, and notify parent.
- If the test suite is ready and meets coverage criteria, also draft or publish `TEST_READY.md` at project root `c:\Users\amina\Desktop\CampusOS\TEST_READY.md`.
