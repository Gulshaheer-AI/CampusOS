# E2E Test Infra: CampusOS Platform Overhaul

## Test Philosophy
- Opaque-box, requirement-driven derived from `ORIGINAL_REQUEST.md`.
- No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Test Runner
- Command: `npm run test`
- Framework: Vitest v2.1.9 with jsdom environment
- Pass Criteria: Exit code 0, 0 failed tests, 100% assertions passing.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Source | Tier 1 (Features) | Tier 2 (Boundaries) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) |
|---|---------|--------|:-----------------:|:-------------------:|:---------------------:|:-------------------:|
| F1 | Dynamic RAG & Monday AI Engine | R1 | ≥5 cases | ≥5 cases | Pairwise with Notes | Real Lecture Q&A |
| F2 | Dual-Tier Lecture Notes System | R2 | ≥5 cases | ≥5 cases | Pairwise with RAG | Student Study Locker |
| F3 | Dynamic QuizForge & Isolation | R3 | ≥5 cases | ≥5 cases | Pairwise with Teacher | Practice Exam Generation |
| F4 | CodePlay AI Copilot & IDE | R4 | ≥5 cases | ≥5 cases | Pairwise with Sandboxed | Debugging Python/JS Buffer |
| F5 | W3Schools Curricula & Courses | R5 | ≥5 cases | ≥5 cases | Pairwise with Dashboard | Multi-week Curriculum Progress |
| F6 | Challenges & Portfolio ZIP Export | R6 | ≥5 cases | ≥5 cases | Pairwise with Recruiter | ZIP Download & Share Link |
| F7 | 12 Regional CVs & PDF/DOCX | R7 | ≥5 cases | ≥5 cases | Pairwise with AI Auditor | Exporting Europass/USAJOBS |
| F8 | Royal Purple Theme & Contrast | R8 | ≥5 cases | ≥5 cases | Pairwise with UI Elements | Full Platform Contrast Audit |

## Test Architecture
- Test files located in `src/test/`:
  - `src/test/e2e-rag-notes-quiz.test.ts` (Features F1, F2, F3)
  - `src/test/e2e-codeplay-curricula.test.ts` (Features F4, F5, F6)
  - `src/test/e2e-cv-templates-export.test.ts` (Feature F7)
  - `src/test/e2e-theme-contrast.test.ts` (Feature F8)
  - Existing unit tests (`src/test/unit-*.test.ts`) preserved and passing.
- Total target test count: ≥ 88 test cases across Tiers 1-4.
