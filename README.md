# CampusOS: From Classroom to Career 🎓🚀

CampusOS is a complete, production-quality AI-powered student empowerment platform connecting interactive learning, concept exploration, coding sandboxes, automatic quiz generation, skill roadmaps, and career-readiness opportunities.

---

## 🌟 Product Pillars & Architecture

### 1. Campus Learn
- **AI Academic Tutor (`/tutor`)**: Contextual tutoring that adapts to the student's level and pedagogical style (Beginner, Step-by-Step, Example-based, Visual diagram, Exam revision) with rate limiting and code explanations.
- **Interactive Concept Explorer (`/learn/explore`)**: Dynamic, step-by-step simulations of difficult concepts:
  - *Binary Search*: Interactive low/mid/high pointer traversal and array bisecting.
  - *Recursion & Call Stack*: Factorial execution frame pushing, base-case evaluation, and unwinding.
  - *SQL Joins Studio*: Real-time Venn diagrams and resulting relations for `INNER`, `LEFT`, `RIGHT`, and `FULL` joins.
- **CodePlay Sandbox (`/codeplay`)**: Sandboxed browser programming playground (HTML/CSS/JS) with restricted CSP iframe execution, live console logger, 5 starter exercises, hints, and AI syntax debugging.
- **QuizForge (`/quizzes`)**: Student assessment suite supporting topic or note-based quiz generation, timed test taking, accurate scoring, and detailed mistake explanations with weak-topic diagnostics.
- **Teacher Studio (`/teacher`)**: Faculty workspace for course management, class enrollment codes, AI draft question bank generation, assessment publishing, and grade CSV export.
- **Course Catalog (`/courses`, `/courses/[courseId]`)**: Syllabus, module navigation, attached reference notes, and shortcuts into the learning cycle.

### 2. Campus Grow
- **Skill Roadmaps (`/roadmaps`, `/roadmaps/[roadmapId]`)**: Structured 4-week career tracks (Web Dev, Data Analytics, UI/UX, Marketing) with interactive weekly task checklists.
- **Engineering Challenges (`/challenges`, `/challenges/[challengeId]`)**: Practical problem sets with deliverables, rubric point weights, and submission links.
- **Student Portfolio (`/portfolio`)**: Publicly shareable student showcase with granular visibility controls and verified project badges.

### 3. Campus Opportunities
- **Opportunities Directory (`/opportunities`)**: Internships, undergraduate fellowships, ICPC competitions, and student grants with bookmarking and application tracking boards.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict checking)
- **Styling**: Tailwind CSS with custom midnight navy and electric violet design tokens
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library (Unit & Integration), Playwright (E2E)
- **Database Readiness**: PostgreSQL / Supabase migration with Row-Level Security (RLS)

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```powershell
npm.cmd install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```powershell
Copy-Item .env.example .env.local
```
> **Note on Demo Mode**: No API keys are required to explore or test CampusOS. In the absence of an external API key, the platform automatically runs its transparent, pedagogically verified engine with rich seeded fixtures.

### 3. Run the Development Server
```powershell
npm.cmd run dev
```
Open [http://localhost:3002](http://localhost:3002) in your browser.

### 4. Build for Production
```powershell
npm.cmd run build
```

---

## 🧪 Automated Testing

### Unit & Integration Tests (Vitest)
Executes scoring logic, timer/submission rules, roadmap calculations, permission helpers, and schema validation:
```powershell
npm.cmd run test
```

### End-to-End Browser Tests (Playwright)
Validates critical user workflows across desktop, tablet, and mobile viewports:
```powershell
npm.cmd run test:e2e
```

---

## 🔒 Security & Privacy Architecture

1. **Sandboxed CodePlay Execution**: Client code in CodePlay runs inside an isolated iframe with `sandbox="allow-scripts"`, preventing access to cookies, parent window data, or host credentials.
2. **Server-Side AI Provider Abstraction**: LLM keys are read exclusively server-side. Prompts are sanitized with length limits and in-memory rate limiting (15 requests/minute).
3. **Role-Based Access Control**: Teacher Studio (`/teacher`) is strictly protected. Student sessions attempting to access faculty routes are intercepted by access restriction boundaries.
4. **Student Privacy Guarantee**: Grades, quiz attempts, and tutor chats are private by design and never displayed on public portfolios.

---

## 📄 License
Educational Open-Source License. Built with academic integrity.
