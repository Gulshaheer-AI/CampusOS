# Milestone 1 (M1) Adversarial Challenge Report: Role Separation & Data Isolation

**Author**: Challenger 2 (`challenger_m1_2`)  
**Target**: Milestone 1 Implementation (Worker 1)  
**Empirical Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### Obs 1: Faculty Gradebook CSV Export Leaks Student Practice Quizzes (`isPractice: true`)
In `src/app/teacher/page.tsx`, lines 422–438:
```typescript
422:   const handleExportCSV = () => {
423:     const headers = "Attempt ID,Student ID,Quiz Title,Score Percentage,Passed,Completed At\n";
424:     const rows = attempts
425:       .map(
426:         (a) =>
427:           `"${a.id}","${a.userId}","${a.quizTitle}",${a.scorePercentage},${a.passed},"${a.completedAt}"`
428:       )
429:       .join("\n");
430:     const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
431:     const url = URL.createObjectURL(blob);
432:     const link = document.createElement("a");
433:     link.href = url;
434:     link.setAttribute("download", `cohort_assessment_grades_${Date.now()}.csv`);
435:     document.body.appendChild(link);
436:     link.click();
437:     document.body.removeChild(link);
438:   };
```
While the UI grading table on line 1327 filters:
```typescript
attempts.filter((att) => att.userRole !== "teacher" && !att.isPractice)
```
and the cohort performance average on line 1276 filters:
```typescript
attempts.filter((a) => a.userId === stu.id && a.userRole !== "teacher" && !a.isPractice)
```
the `handleExportCSV` handler directly maps over the unfiltered `attempts` state (line 424), outputting student practice quiz attempts into `cohort_assessment_grades_${Date.now()}.csv`.

### Obs 2: Teacher Studio Published Quizzes Filters by `creatorRole !== "student"`, Leaking Non-Student Practice Quizzes
In `src/app/teacher/page.tsx`, lines 1200 and 1205–1207:
```typescript
1200:   {quizzes.filter((q) => q.creatorRole !== "student").length} Official Faculty Quizzes
...
1205:   {quizzes
1206:     .filter((q) => q.creatorRole !== "student")
1207:     .map((quiz) => (
```
If a teacher tests or creates a practice quiz on `/quizzes` (where `creatorRole` is `"teacher"` and `isPractice: true`), or if a practice quiz is created without `creatorRole === "student"`, the quiz bypasses the filter and is displayed under "Published Quizzes & Question Banks (Synced to Student Portal)" on `/teacher`.

### Obs 3: Test Execution Failures on `npm run test`
Command: `npm run test`
Result: Exit code 1 with unhandled rejection errors:
```text
⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
Serialized Error: { code: 'Z_DATA_ERROR' }
This error originated in "src/test/adversarial-rag-stress.test.ts" test file.
Caused by: Error: invalid block type / invalid distance too far back
 ❯ genericNodeError node:internal/errors:985:15
 ❯ Zlib.zlibOnError [as onerror] node:zlib:190:17
 ❯ handleKnownInternalErrors node:internal/webstreams/adapters:129:21
```
Additionally, concurrent jsdom worker threads during full test runs triggered:
`FATAL ERROR: Zone Allocation failed - process out of memory` / `Error: Worker exited unexpectedly`.

In contrast, targeted test execution:
- `npx vitest run src/test/e2e-rag-notes-quiz.test.ts`: **39 passed (39)** in 144ms.
- `npx vitest run src/test/adversarial-role-separation-isolation.test.ts`: **9 passed (9)** in 15ms.
- `npm run build`: **Compiled successfully (26/26 routes)** with 0 TypeScript errors.

### Obs 4: Role Authorization Guards Verification
1. `src/app/teacher/page.tsx:442`:
   ```typescript
   if (user.role !== "teacher" && user.role !== "admin") {
     return (
       <AppShell>
         <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
           ...
           <h2>Access Restricted</h2>
   ```
   Verified: Students and unauthenticated users receive the Access Restricted barrier and cannot access course authoring or materials management.
2. `src/lib/permissions.ts`:
   - `canAccessTeacherStudio("student")` -> `false`
   - `canPublishQuiz("student")` -> `false`
   - `canEditQuiz("creator-id", "different-user", "teacher")` -> `false`
   All verified by unit test assertions.
3. `src/app/courses/[courseId]/page.tsx`:
   Course materials section only exposes `handleDownloadMaterial(mat)` with blob/data-URL downloads. No upload, edit, or delete controls are exposed on the student-facing course view.

---

## 2. Logic Chain

1. **Requirement R3 & Acceptance Criteria Mandate Strict Data Isolation**:
   - `ORIGINAL_REQUEST.md` line 39: "Clean separation between teacher-created assessments and student self-practice attempts so student quizzes do not leak into teacher course grading tables."
   - `PROJECT.md` line 31: "Exclude student self-practice attempts from teacher cohort gradebook tables."
2. **Obs 1 Demonstrates Gradebook CSV Leakage**:
   - Faculty Gradebook is not merely the on-screen table; the `handleExportCSV` button on the `/teacher` hero banner is the primary tool instructors use to import grades into LMS (Canvas, Blackboard).
   - In `src/app/teacher/page.tsx:424`, mapping unfiltered `attempts` leaks student self-practice scores (e.g. low 0–40% practice sprint scores) into the official exported CSV gradebook.
   - This violates the isolation contract.
3. **Obs 2 Demonstrates Published Quiz Contamination**:
   - The filter in `/teacher:1206` only checks `q.creatorRole !== "student"`.
   - When a quiz is flagged `isPractice: true`, it represents a self-practice assessment. Filtering must be `!q.isPractice && q.creatorRole !== "student"`.
4. **Obs 3 Demonstrates Vitest Test Suite Instability**:
   - Acceptance criteria require: "Full Vitest test suite passes with 0 failures (`npm run test`)."
   - `npm run test` fails with exit code 1 due to unhandled stream rejections from corrupt zip tests in `src/test/adversarial-rag-stress.test.ts`.

---

## 3. Caveats

- **UI Table and Cohort Cards Are Correctly Filtered**: On-screen student cards (Ahmad, Hassan, Zain) and the HTML gradebook table in `/teacher` properly apply `!a.isPractice` and `a.userRole !== "teacher"`. The leak is specifically located in `handleExportCSV` and the quiz publication filter.
- **Course Material Storage**: `store.ts` helper functions (`addCourseMaterial`, `deleteCourseMaterial`) are client-side localStorage mutations. They rely on caller-level role guards (which are securely enforced in `src/app/teacher/page.tsx`).

---

## 4. Conclusion

Empirical Verdict: **REQUEST_CHANGES**.

The following fixes are required before Milestone 1 can be approved:

1. **Fix Gradebook CSV Export in `src/app/teacher/page.tsx`**:
   Filter `attempts` in `handleExportCSV` to exclude practice attempts and teacher attempts:
   ```typescript
   const rows = attempts
     .filter((a) => a.userRole !== "teacher" && !a.isPractice)
     .map(...)
   ```
2. **Harden Published Quizzes Filter in `src/app/teacher/page.tsx`**:
   Ensure `!q.isPractice` is checked in the count badge and card list:
   ```typescript
   quizzes.filter((q) => !q.isPractice && q.creatorRole !== "student")
   ```
3. **Resolve `npm run test` Unhandled Rejections**:
   In `src/lib/rag-parser.ts` or `src/test/adversarial-rag-stress.test.ts`, wrap `DecompressionStream` error events or stream piping in proper error trapping so corrupt ZIP payloads do not emit unhandled rejections that crash Vitest.

---

## 5. Verification Method

1. **Verify Role Separation & Data Isolation Test**:
   ```powershell
   npx vitest run src/test/adversarial-role-separation-isolation.test.ts
   ```
   Expected: 9 tests pass.
2. **Verify Official E2E Suite**:
   ```powershell
   npx vitest run src/test/e2e-rag-notes-quiz.test.ts
   ```
   Expected: 39 tests pass.
3. **Verify Full Project Test Command**:
   ```powershell
   npm run test
   ```
   Expected: Exit code 0, all test suites pass without unhandled rejections.
4. **Verify Production Build**:
   ```powershell
   npm run build
   ```
   Expected: Exit code 0, 26 routes successfully generated.
