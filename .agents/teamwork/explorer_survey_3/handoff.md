# Handoff Report — Explorer Survey 3: Scope R7, R8 & Test/Build Baseline

## 1. Observation

### Baseline Health & Test Suite Execution
- **Command**: `npm run test`
  - Output:
    ```
    RUN v2.1.9 C:/Users/amina/Desktop/CampusOS
    ✓ src/test/unit-scoring.test.ts (5 tests) 14ms
    ✓ src/test/unit-ai-provider.test.ts (3 tests) 18ms
    ✓ src/test/unit-permissions-validators.test.ts (7 tests) 20ms
    Test Files  3 passed (3)
    Tests       15 passed (15)
    Duration    26.04s
    ```
  - Exit code: `0`.
  - Missing tests: No tests exist for CV Studio, regional templates, AI CV auditor, PDF/DOCX exporters, or theme contrast.
- **Command**: `npm run build`
  - Output:
    ```
    ▲ Next.js 14.2.15
    Compiled successfully.
    Generating static pages (26/26)
    Finalizing page optimization ...
    ```
  - Exit code: `0`.
  - Route table in build output contains 26 static/dynamic pages: `/`, `/_not-found`, `/about`, `/challenges`, `/challenges/[challengeId]`, `/codeplay`, `/contact`, `/courses`, `/courses/[courseId]`, `/dashboard`, `/features`, `/for-students`, `/for-teachers`, `/how-it-works`, `/learn/explore`, `/login`, `/opportunities`, `/portfolio`, `/privacy`, `/quizzes`, `/roadmaps`, `/roadmaps/[roadmapId]`, `/settings`, `/signup`, `/teacher`, `/terms`, `/tutor`.
  - Verbatim route observation: **There is NO `/cv` route** in Next.js app router or build output.

---

### Scope R7: Verified Regional CV Studio, Generator & PDF/DOCX Export

#### 1. Missing Dedicated `/cv` Route
- `src/app/cv/page.tsx` does NOT exist.
- In `src/components/layout/AppSidebar.tsx` (lines 106–112):
  ```tsx
  {
    href: "/opportunities",
    label: "Opportunities & CV",
    icon: Briefcase,
    badge: "Live",
    group: "grow",
  },
  ```
- CV Studio is currently embedded as a secondary tab inside `src/app/opportunities/page.tsx` (`activeTab === "cv_builder"` and `activeTab === "cv_audit"`).
- Navigating to `/cv` yields a 404 (`/_not-found`).

#### 2. Template Identification & Scope Mismatches
In `src/app/opportunities/page.tsx` (lines 58–233), 12 templates are defined:
- **European Region**:
  - Line 62: `id: "eu-europass"`, `name: "Official Europass CEDEFOP Standard"` (Matches Europass)
  - Line 76: `id: "eu-din-5008"`, `name: "German DIN 5008 Tabellarischer Standard"` (Matches German Tabellarischer Lebenslauf)
  - Line 90: `id: "eu-swiss-sba"`, `name: "Swiss SBA & SECO Banking Standard"` — **DEFECT**: R7 explicitly mandates **"UK Graduate Scheme"**. Instead, the codebase has Swiss SBA.
  - Line 104: `id: "eu-nordic"`, `name: "Nordic Engineering & Tech Standard"` (Matches Nordic Engineering)
- **Pakistani Region**:
  - Line 120: `id: "pk-hec-pec"`, `name: "Official HEC & PEC Engineering Standard"` (Matches HEC/PEC Engineering)
  - Line 134: `id: "pk-pseb-export"`, `name: "PSEB Software Export House Standard"` (Matches PSEB Software Export House)
  - Line 148: `id: "pk-rozee-corp"`, `name: "Rozee.pk Corporate Pakistan Standard"` (Matches Rozee Corporate)
  - Line 162: `id: "pk-sbp-public"`, `name: "State Bank of Pakistan (SBP) & Public Sector Standard"` — **DEFECT**: R7 mandates **"FPSC/SPSC Civil Service"** standard with BPS-17/18 grades, domicile, quota allocations, academic division hierarchy (Matric, Inter, Graduation, Masters), and government examination record.
- **US Region**:
  - Line 178: `id: "us-harvard-ats"`, `name: "Harvard FAS OCS Classic ATS Standard"` (Matches Ivy League / Harvard CS)
  - Line 192: `id: "us-mit-capd"`, `name: "MIT CAPD EECS Technical Format"` — **DEFECT**: R7 explicitly mandates **"US Federal USAJOBS"**. Instead, the codebase has MIT CAPD.
  - Line 206: `id: "us-silicon-valley"`, `name: "Stanford BEAM Silicon Valley ATS Standard"` (Matches Silicon Valley Tech Startup)
  - Line 220: `id: "us-wall-street"`, `name: "Wall Street Quantitative & Finance Standard"` (Matches Wall Street Quant/Finance)

#### 3. Superficial Styling & Homogenized Regional Layouts
In `src/app/opportunities/page.tsx` (lines 1731–2250):
- Only 3 monolithic layouts exist:
  - Line 1732: `{activeTemplate.region === "european" && (` (Layout 1)
  - Line 1933: `{activeTemplate.region === "pakistani" && (` (Layout 2)
  - Line 2129: `{activeTemplate.region === "us" && (` (Layout 3)
- Within European Layout: all 4 templates share the exact same 2-column sidebar structure; the only variation between them is `style={{ backgroundColor: activeTemplate.accentColor }}` and small blocks for `eu-swiss-sba` and `eu-din-5008`. Nordic has zero distinct layout.
- Within US Layout: all 4 templates share the exact same centered serif layout, only changing `accentColor`. Silicon Valley, Wall Street, and MIT CAPD render identically with no financial models, throughput metrics, or USAJOBS federal schemas.
- This directly violates R7: *"audit all 12 regional CV templates (European, Pakistani, and US standards) to verify each represents an authentic, proven regional recruitment format (not superficial color swaps)"*.

#### 4. AI CV Auditor & Real-Time Fix Disconnect
In `src/app/opportunities/page.tsx`:
- File Upload Parser (lines 530–560): Naively decodes binary buffers using `TextDecoder("utf-8")` and strips non-ASCII bytes. For actual PDF/DOCX binaries, this produces garbage characters, triggering fallback placeholder text (lines 547–549).
- Deficiencies: Audit result returns single `atsScore: number` (line 247 in `src/app/api/ai/cv/route.ts`). There is no section-by-section scoring breakdown (e.g., Contact, Summary, Experience, Projects, Skills, Education).
- **Critical Fix Disconnect** (lines 837–842):
  ```tsx
  const handleApplyAiEnhancedCv = () => {
    if (!auditResult?.enhancedCvText) return;
    setCvInputText(auditResult.enhancedCvText);
    setCvSavedNotice(true);
    setTimeout(() => setCvSavedNotice(false), 3000);
  };
  ```
  `handleApplyAiEnhancedCv` ONLY updates `cvInputText` (the raw text in the auditor tab textarea). It NEVER updates `cvData` (the structured state driving the live CV preview in the CV Studio tab). Thus, applying AI fixes does not update the live rendered CV sheet in real time.

#### 5. PDF & DOCX Export Capabilities
In `src/app/opportunities/page.tsx`:
- Line 803–807:
  ```tsx
  const handlePrintCv = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };
  ```
- Print export relies purely on `window.print()` without print stylesheet isolation (`@media print` rules to hide sidebars, header, action bars, and enforce A4/Letter margins with `print-color-adjust: exact`).
- **DOCX Export is COMPLETELY MISSING**: Grep search for `docx` across `src/` yields 0 export implementations. There is no export function, button, or utility to download a `.docx` or editable text file.

---

### Scope R8: Royal Purple Claymorphism Theme & High-Contrast Typography

#### 1. Global Page Background
- `src/app/layout.tsx` (line 35): `<body className="min-h-screen bg-white text-slate-900 antialiased ...">`
- `src/app/globals.css` (lines 6, 18): `--background: #FFFFFF;`, `body { background-color: #FFFFFF; }`
- Global background is pure white `#FFFFFF`. However, `tailwind.config.ts` line 50 defines `brand.canvas: "#F5F3FE"` and line 72 defines `clay.canvas: "#F5F3FE"`, leading to inadvertent light lilac backgrounds when those classes are used.

#### 2. Royal Purple Clay Styling on Headers, Hero Banners, and Footers
- Hero banners on `LandingPage`, `about`, `contact`, `features`, `for-students`, `for-teachers`, `how-it-works`, `courses`, `quizzes`, `roadmaps`, `settings`, and `teacher` feature `clay-card-purple` (`#6653E6` gradient with drop-shadows).
- **Gaps Identified**:
  - `src/app/challenges/page.tsx` (lines 70–82): Has NO `clay-card-purple` hero banner; renders a plain white heading block.
  - `src/app/tutor/page.tsx` (lines 310–325): Has NO `clay-card-purple` hero banner; starts directly with a flex container.
  - `src/components/layout/Footer.tsx` (line 8): `<footer className="border-t border-purple-100 bg-white text-slate-700">` and line 10 `<div className="border-b border-purple-100 bg-purple-50/60 py-8">`. The footer is plain white and does NOT feature Royal Purple Clay styling as required by R8: *"Main headers, hero banners, and footers must feature the prominent Royal Purple Clay styling (`clay-card-purple`, `#6653E6` gradient, soft drop-shadows)"*.

#### 3. High-Contrast Typography & White Text on Light Background Violations
- **Violation 1: `src/components/rag/FileUploadDropzone.tsx`**:
  - Line 196: Container has `border-midnight-700 bg-midnight-950/70` (`midnight-950` = `#F5F3FE` light lilac).
  - Line 204: `<span className="text-xs sm:text-sm font-semibold text-white">Drop docs, PDFs, Word, CSVs, or images here</span>` — **WHITE TEXT ON LIGHT LILAC CANVAS (ILLEGIBLE)**.
  - Line 242: Uploaded file card container has `bg-midnight-900/90` (`midnight-900` = `#FFFFFF` pure white).
  - Line 259: `<div className="font-semibold text-white truncate">{file.name}</div>` — **WHITE TEXT ON PURE WHITE BACKGROUND (100% INVISIBLE)**.
  - Line 294: Chunks Preview modal has `bg-midnight-900` (`#FFFFFF`).
  - Line 299: `<h3 className="font-bold text-white text-base">{previewFile.name}</h3>` — **WHITE TEXT ON WHITE BACKGROUND IN MODAL**.
  - Line 320: `<pre className="font-sans text-slate-200 ...">` on `bg-midnight-950` (`#F5F3FE`) — nearly white text on light lilac.
- **Violation 2: `src/components/learn/W3InteractiveLab.tsx`**:
  - Line 257: Card container is `<div className="clay-card p-5 space-y-4 border border-white/15">` (`.clay-card` has `background: #FFFFFF`).
  - Line 264: `<h4 className="text-sm font-bold text-white">{activeExample.title}</h4>` — **WHITE TEXT ON WHITE BACKGROUND (100% INVISIBLE)**.
  - Lines 265, 305, 320: `text-slate-300` on white card (fails contrast ratio).
  - Line 335: `<div className="clay-card p-5 space-y-4 border border-clay-pink/30">` (`background: #FFFFFF`).
  - Line 340: `<h4 className="text-sm font-bold text-white flex items-center gap-2">Test Yourself With Exercises ...</h4>` — **WHITE TEXT ON WHITE BACKGROUND (100% INVISIBLE)**.
  - Line 346: `<p className="text-xs text-slate-300">{activeExercise.prompt}</p>` — light gray on white card.
- **Violation 3: `src/components/ui/Button.tsx`**:
  - Line 45: `outline: "border border-white/20 hover:border-brand-cyan/70 text-slate-100 hover:text-white bg-midnight-900/60 ..."` (`text-slate-100` is nearly white). When `<Button variant="outline">` is placed on white backgrounds, text is unreadable unless manually overridden.
  - Line 47: `ghost: "text-slate-200 hover:text-white ..."` (`text-slate-200` is unreadable on light surfaces).
  - Line 43: `secondary: "bg-midnight-800 ... text-white"` (dark midnight legacy styling).
  - Line 37: `focus-visible:ring-offset-midnight-950` (legacy dark token).
- **Violation 4: `src/app/quizzes/page.tsx`**:
  - Line 501: `<h4 className="text-sm font-bold uppercase text-slate-300 tracking-wider">Detailed Explanations & Mistake Review</h4>` on a white page background. `text-slate-300` is unreadable.
  - Line 490: `bg-amber-900/40 border border-amber-500/40 text-amber-200` (legacy dark card on white background).
- **Violation 5: `src/components/ui/Card.tsx`**:
  - Line 55: `CardDescription` uses `text-slate-500` instead of `text-slate-700 font-medium`.
  - Line 80: `CardFooter` has `border-white/10` which is invisible on a white card.

---

## 2. Logic Chain

1. **Missing `/cv` route**:
   - Observation: Original request R7 specifically names `/cv`. The build output contains 26 routes, none of which is `/cv`.
   - Inference: Anyone following the navigation or directly typing `/cv` gets a 404 error. The CV Studio must be exposed as a first-class route at `/cv` while keeping backwards compatibility with `/opportunities`.

2. **Template Mismatches**:
   - Observation: R7 lists:
     - European: Europass, UK Graduate Scheme, German Tabellarischer Lebenslauf, Nordic Engineering.
     - Pakistani: HEC/PEC Engineering, PSEB Software Export House, Rozee Corporate, FPSC/SPSC Civil Service.
     - US: Ivy League/Harvard CS, Silicon Valley Tech Startup, Wall Street Quant/Finance, US Federal USAJOBS.
   - Observation in code: `eu-swiss-sba` is in place of `eu-uk-grad`; `us-mit-capd` is in place of `us-federal-usajobs`; `pk-sbp-public` is named State Bank of Pakistan banking instead of statutory FPSC/SPSC Civil Service.
   - Inference: 3 of 12 templates fail specification conformance. They must be replaced with authentic UK Graduate Scheme, US Federal USAJOBS, and FPSC/SPSC Civil Service templates with appropriate fields and schemas.

3. **Superficial Styling**:
   - Observation: In `opportunities/page.tsx`, lines 1731–2250, all 4 templates in each region share one single JSX branch where only `accentColor` changes.
   - Inference: A Harvard resume looks identical to Silicon Valley and Wall Street (all centered serif), DIN 5008 does not have a true tabular timeline, Europass lacks the CEFR language/DigComp grid, and USAJOBS / UK Graduate / FPSC specific layouts do not exist. Each of the 12 templates must have distinct structural JSX layouts, appropriate fonts (serif vs sans-serif), and regional metadata fields.

4. **AI Auditor Disconnect**:
   - Observation: `handleApplyAiEnhancedCv` sets `cvInputText`, which is an input string for the auditor textarea. It never touches `cvData`.
   - Inference: Users clicking "Apply to CV Studio" see no changes in the CV preview sheet. The handler must parse the AI recommendations into `cvData` (or update individual sections like summary, experience bullet action verbs, and project metrics) so the live CV updates immediately.

5. **Missing DOCX & Clean PDF Export**:
   - Observation: Grep for `docx` yields 0 export code. The only PDF functionality is `window.print()` without print CSS.
   - Inference: The platform does not satisfy acceptance criteria: *"Students can download their finalized CV in both PDF and DOCX formats"*. A client-side or API export utility generating a clean Word-compatible `.docx` (or Word XML `.doc`) and print-isolated PDF stylesheet is required.

6. **Contrast & Theme Violations (R8)**:
   - Observation: `FileUploadDropzone.tsx` and `W3InteractiveLab.tsx` have `text-white` on `.clay-card` (`#FFFFFF`) and `bg-midnight-950` (`#F5F3FE`).
   - Inference: These headings and file names are completely unreadable (white text on pure white). They must be changed to `text-slate-900 font-extrabold` and `text-slate-700 font-medium`.
   - Observation: `Footer.tsx` has `bg-white` and `bg-purple-50/60`.
   - Inference: It fails the requirement that main headers, hero banners, and footers must feature Royal Purple Clay styling (`clay-card-purple`, `#6653E6` gradient, soft drop-shadows).

---

## 3. Caveats

- **No Caveats**: The investigation analyzed the entire codebase, including build logs, test logs, routing table, theme configs, CSS files, UI component libraries, and page-level implementations across all 12 templates and public/authenticated views.

---

## 4. Conclusion & Recommended Action Plan

### Recommended Architectural Fixes

#### A. R7 Implementation Strategy
1. **Create `/cv` Route (`src/app/cv/page.tsx`)**:
   - Build a dedicated, full-featured CV Studio & Auditor page at `src/app/cv/page.tsx` with full AppShell wrapper.
   - Include a banner/link in `src/app/opportunities/page.tsx` that links seamlessly to `/cv` or embeds the studio, ensuring zero disruption to existing tests and bookmarks.
   - Update `AppSidebar.tsx` to include `CV Studio & Auditor` (`/cv`) in the navigation list.
2. **Correct the 12 Regional Templates in `CV_TEMPLATES`**:
   - Replace `eu-swiss-sba` with `eu-uk-grad` ("UK Graduate Scheme Standard" — UCAS Tariff points, A-Levels, 2:1/First Honours, STAR framework).
   - Replace `us-mit-capd` with `us-federal-usajobs` ("US Federal USAJOBS Standard" — GS Grade series, US citizenship, clearance, selective service, hours/week, supervisor contact).
   - Align `pk-sbp-public` to `pk-fpsc-civil` ("FPSC & Provincial Civil Service Standard" — BPS-17/18, CNIC, Domicile/District, Quota allocation, Division marks).
   - Verify and enrich the other 9 templates: Europass (CEFR & DigComp tables), DIN 5008 (two-column Zeit/Werdegang tabular layout), Nordic (clean Scandinavian tech, GitHub commits, flat hierarchy), HEC/PEC (PEC registration No., HEC attestation, F.Sc/SSC breakdown, FYP viva defense), PSEB (software export throughput, foreign remittance, tech stacks), Rozee (PKR metrics, corporate leadership), Harvard CS (classic serif, XYZ bullets), Silicon Valley (modern sans-serif, technical skills at top, scale metrics), Wall Street (compact 1-page, Sharpe ratio, deal sizes, financial toolchain).
3. **Distinct Layout Rendering**:
   - Refactor the CV sheet preview so each template renders its authentic layout rather than falling back to a shared generic format with accent color swaps.
4. **Wire Real-Time AI Fixes to `cvData`**:
   - Enhance the AI Auditor so that applying fixes directly updates `cvData` (summary, bullet action verbs, quantifiable metrics), triggering immediate live re-rendering of the CV sheet.
   - Add section-by-section ATS deficiency scoring.
5. **Implement PDF & DOCX Export**:
   - Add `@media print` CSS rules in `globals.css` ensuring clean print-to-PDF formatting of the CV sheet (hiding navbars/sidebars/controls, zero margins, full printable canvas).
   - Implement a DOCX / Word export utility (`generateDocxBlob(cvData, template)` using standard Word XML MIME `application/vnd.openxmlformats-officedocument.wordprocessingml.document` or `application/msword`) that triggers a download of `<Candidate>_<Template>_CV.docx` alongside clean formatted text.

#### B. R8 Implementation Strategy
1. **Fix Contrast in `FileUploadDropzone.tsx` & `W3InteractiveLab.tsx`**:
   - Replace all instances of `text-white`, `text-slate-200`, `text-slate-300` on white or light backgrounds with `text-slate-900 font-extrabold` / `text-slate-700 font-medium`.
2. **Fix `src/components/ui/Button.tsx` Defaults**:
   - Change `variant="outline"` to default to `border-purple-200 text-slate-800 hover:text-brand-purple hover:bg-purple-50`.
   - Change `variant="ghost"` to default to `text-slate-700 hover:text-brand-purple hover:bg-purple-50`.
   - Change `variant="secondary"` to light purple clay pill `bg-purple-50 text-brand-purple border border-purple-200`.
3. **Fix `src/components/ui/Card.tsx`**:
   - Update `CardDescription` to `text-slate-700 font-medium`.
   - Update `CardFooter` border to `border-purple-100`.
4. **Style Footer and Missing Hero Banners in Royal Purple**:
   - Style `src/components/layout/Footer.tsx` with Royal Purple Clay styling (`clay-card-purple`, `#6653E6` gradient, soft drop-shadows).
   - Add `clay-card-purple` hero banner to `src/app/challenges/page.tsx` and `src/app/tutor/page.tsx`.
5. **Fix Contrast in `src/app/quizzes/page.tsx`**:
   - Change `text-slate-300` at line 501 to `text-slate-900 font-black`.
   - Change `bg-amber-900/40 text-amber-200` to `bg-amber-50 border-amber-300 text-amber-900`.

---

## 5. Verification Method

To verify these findings and confirm fixes after implementation:
1. **Run Vitest Suite**:
   ```powershell
   npm run test
   ```
   Verify 0 failures across all unit test files.
2. **Run Production Build**:
   ```powershell
   npm run build
   ```
   Verify 0 TypeScript compilation errors and confirm `/cv` is listed in the generated route table.
3. **Verify Route `/cv` & Templates**:
   - Inspect `src/app/cv/page.tsx` exists and renders all 12 templates:
     * European: Europass, UK Graduate Scheme, German DIN 5008, Nordic Engineering.
     * Pakistani: HEC/PEC Engineering, PSEB Software Export House, Rozee Corporate, FPSC/SPSC Civil Service.
     * US: Harvard CS, Silicon Valley Tech Startup, Wall Street Quant/Finance, US Federal USAJOBS.
4. **Verify PDF & DOCX Export**:
   - Verify clicking "Download DOCX" creates a downloadable `.docx` file.
   - Verify clicking "Print / PDF" triggers print dialog with clean single/two-page CV formatting without app chrome.
5. **Verify Contrast Compliance**:
   - Search the entire repository for `text-white` on non-dark surfaces:
     ```powershell
     rg -n "text-white" src/components/rag/FileUploadDropzone.tsx src/components/learn/W3InteractiveLab.tsx
     ```
     Ensure zero instances of `text-white` on `bg-white`, `.clay-card`, or light backgrounds.
