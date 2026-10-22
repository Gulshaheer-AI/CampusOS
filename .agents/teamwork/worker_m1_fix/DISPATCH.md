## 2026-10-18T21:14:07Z
You are Worker M1 Fix on the CampusOS Platform Overhaul.
Your working directory is: c:\Users\amina\Desktop\CampusOS\.agents\teamwork\worker_m1_fix
Your parent conversation ID is: 8a676417-5045-42a1-971a-68ba0d0e7941

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read these 4 files:
1. c:\Users\amina\Desktop\CampusOS\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Users\amina\Desktop\CampusOS\PROJECT.md
3. c:\Users\amina\Desktop\CampusOS\.agents\teamwork\challenger_m1_1\handoff.md
4. c:\Users\amina\Desktop\CampusOS\.agents\teamwork\challenger_m1_2\handoff.md

Your Task: Resolve the 5 adversarial findings reported by Challengers 1 & 2:
1. `src/lib/rag-parser.ts` (`decompressDeflate`):
   - Catch unhandled promise rejections on `writer.write()` and `writer.close()` when parsing corrupt streams.
   - Attach `.catch(() => {})` to `writer.closed`, `writer.write(bytes as any)`, and `writer.close()`, and handle errors cleanly inside `try/catch`, returning `null` on failure.
   - Verify that corrupt deflate streams return `null` without throwing unhandled process rejections.
2. `src/lib/rag-engine.ts` (`chunkTextContent`):
   - Protect against infinite loops when `chunkSize <= chunkOverlap`.
   - Use safe bounds:
     `const safeChunkSize = Math.max(1, chunkSize);`
     `const safeOverlap = Math.min(Math.max(0, chunkOverlap), safeChunkSize - 1);`
     `const step = Math.max(1, safeChunkSize - safeOverlap);`
     and advance `startIndex += step;`.
3. `src/lib/rag-engine.ts` (`tokenize`):
   - Upgrade regex to Unicode-aware `/[^\p{L}\p{N}_\-\s]/gu` so non-Latin scripts (Urdu, Arabic, CJK, accents) are preserved for university course materials.
4. `src/lib/rag-engine.ts` (`searchKnowledgeChunks`):
   - Fix stop-word filter: change `filter((w) => !STOP_WORDS.has(w) || w.length > 3)` to `filter((w) => !STOP_WORDS.has(w))`.
5. `src/app/teacher/page.tsx`:
   - In `handleExportCSV`: filter attempts with `attempts.filter((a) => !a.isPractice)` so student self-practice attempts are never exported into faculty gradebook CSVs.
   - In published quizzes list (e.g. lines 1200, 1206): filter with `!q.isPractice` so practice quizzes do not leak into course assessments.

Verification Requirements:
1. Run `npx vitest run src/test/adversarial-rag-stress.test.ts` (must pass 100% with exit code 0 and ZERO unhandled rejections).
2. Run `npx vitest run src/test/adversarial-role-separation-isolation.test.ts` (must pass 100%).
3. Run `npm run test` (all test suites must pass).
4. Run `npm run build` (must compile cleanly with 0 errors).
5. Write handoff report to `c:\Users\amina\Desktop\CampusOS\.agents\teamwork\worker_m1_fix\handoff.md` and send message to parent.
