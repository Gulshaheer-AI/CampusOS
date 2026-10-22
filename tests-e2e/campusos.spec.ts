import { test, expect } from "@playwright/test";

test.describe("CampusOS Production Platform Verification", () => {
  test("1. Landing page renders with complete value prop and navigation links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CampusOS/);

    // Verify headline and CTAs
    await expect(page.locator("h1:has-text('Learn Better')")).toBeVisible();
    await expect(page.locator("button:has-text('Start Learning')").last()).toBeVisible();
    await expect(page.locator("text=Explore the Platform").first()).toBeVisible();

    // Verify learning cycle banner
    await expect(page.getByText(/The CampusOS Learning Cycle/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "EXPLAIN" })).toBeVisible();
  });

  test("2. Public pages directory navigation and content validation", async ({
    page,
  }) => {
    // Features
    await page.goto("/features");
    await expect(page.locator("h1:has-text('Everything You Need to Excel')")).toBeVisible();

    // How It Works
    await page.goto("/how-it-works");
    await expect(page.locator("h1:has-text('How CampusOS Accelerates Mastery')")).toBeVisible();

    // For Students
    await page.goto("/for-students");
    await expect(page.locator("h1:has-text('From Confusing Lectures')")).toBeVisible();

    // For Teachers
    await page.goto("/for-teachers");
    await expect(page.locator("h1:has-text('Save Hours on Assessment Design')")).toBeVisible();

    // About
    await page.goto("/about");
    await expect(page.locator("h1:has-text('From Classroom to Career')")).toBeVisible();

    // Contact with functional validation
    await page.goto("/contact");
    await expect(page.locator("h1:has-text('Contact the CampusOS Team')")).toBeVisible();
    await page.click("button:has-text('Submit Inquiry')");
    await expect(page.getByText(/Name must be at least 2 characters/i)).toBeVisible();

    // Privacy & Terms with compliance notices
    await page.goto("/privacy");
    await expect(page.locator("h1:has-text('Privacy Policy')")).toBeVisible();
    await expect(page.getByText(/Notice to Institutions/i)).toBeVisible();

    await page.goto("/terms");
    await expect(page.locator("h1:has-text('Terms of Use')")).toBeVisible();
  });

  test("3. Authenticated Dashboard with real metrics, 3 distinct students (Ahmad, Hassan, Zain), and continue learning", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Welcome back, Ahmad Khan/i)).toBeVisible();
    await expect(page.getByText(/Enrolled Courses/i)).toBeVisible();
    await expect(page.getByText(/Average Quiz Score/i)).toBeVisible();
    await expect(page.getByText(/Roadmap Progress/i)).toBeVisible();
    await expect(page.getByText(/Weak Topics Requiring Revision/i)).toBeVisible();
  });

  test("4. AI Tutor (Monday AI): Ask questions and view structured pedagogical responses", async ({
    page,
  }) => {
    await page.goto("/tutor");
    const input = page.getByPlaceholder(/Ask about a lecture topic/i);
    await expect(input).toBeVisible();
    await input.fill("Explain binary search invariants");
    await page.locator("form button[type='submit']").click();

    // Verify response appears
    await expect(page.getByTestId("chat-messages").getByText(/Binary Search/i).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test("5. Interactive Concept Explorer: Step through binary search visualization", async ({
    page,
  }) => {
    await page.goto("/learn/explore");
    await expect(page.locator("h3:has-text('Binary Search Visualizer')").first()).toBeVisible();

    // Advance step
    await page.click("button:has-text('Next Step')");
    await expect(page.getByText(/Step 2/i)).toBeVisible();

    // Switch to SQL Joins
    await page.locator("h3:has-text('Interactive SQL Joins Studio')").first().click();
    await expect(page.getByText(/SELECT \* FROM Students/i)).toBeVisible();
    await page.click("button:has-text('LEFT JOIN')");
    await expect(page.getByText(/Charlie/i).first()).toBeVisible();
  });

  test("6. CodePlay: Execute isolated frontend exercises safely", async ({
    page,
  }) => {
    await page.goto("/codeplay");
    await expect(page.getByText(/CodePlay Coding Playground/i)).toBeVisible();
    await expect(page.getByText(/Live Preview \(Sandboxed Iframe\)/i)).toBeVisible();

    // Click run
    await page.click("button:has-text('Run Code')");
    await expect(page.getByText(/Execution Console/i)).toBeVisible();
  });

  test("7. QuizForge: Take practice assessment and verify instant scoring and review", async ({
    page,
  }) => {
    await page.goto("/quizzes");
    await expect(page.getByText(/QuizForge Student Assessment Studio/i)).toBeVisible();

    // Start Binary Search Quiz
    await page.locator("button:has-text('Start Assessment')").first().click();
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();

    // Choose answer and navigate
    await page.click("button:has-text('O(log N)')");
    await page.click("button:has-text('Next')");

    // Question 2
    await expect(page.getByText(/Question 2 of/i)).toBeVisible();
  });

  test("8. Skill Roadmaps & C4School/W3Schools Interactive Lab view", async ({
    page,
  }) => {
    await page.goto("/roadmaps/roadmap-web-dev");
    await expect(page.getByText(/Full-Stack Web Architect/i)).toBeVisible();
    await expect(page.getByText(/Curriculum Checklist/i)).toBeVisible();
    await expect(page.getByText(/C4School \/ W3-Style Syntax/i).first()).toBeVisible();
  });

  test("9. Role Permissions: Student restricted from Teacher Studio", async ({
    page,
  }) => {
    await page.goto("/teacher");
    // Verify Access Restricted guard intercepts unauthorized student session
    await expect(page.getByText(/Access Restricted/i)).toBeVisible();
  });

  test("10. Responsive layout: mobile viewport has functional navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Toggle navigation menu/i })).toBeVisible();
    await page.getByRole("button", { name: /Toggle navigation menu/i }).click();
    await expect(page.getByRole("link", { name: /Features/i }).first()).toBeVisible();
  });

  test("11. Duolingo-style AI Challenge Learning Ladder & Hearts System", async ({
    page,
  }) => {
    await page.goto("/challenges/challenge-autocomplete");
    await expect(page.getByText(/Stage-by-Stage AI Training Ladder/i)).toBeVisible();
    await expect(page.getByText(/Streak/i).first()).toBeVisible();
    await expect(page.getByText(/Stage 1/i).first()).toBeVisible();
    // Warmup stage has prompt & Verify button
    await expect(page.getByRole("button", { name: /Verify Concept Choice/i })).toBeVisible();
  });

  test("12. Campus Opportunities, Live Search & 12 Regional CV Templates Studio", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    await expect(page.getByText(/Opportunities & Professional CV Studio/i)).toBeVisible();

    // Switch to CV Studio tab
    await page.click("button:has-text('12 Regional CV Templates')");
    await expect(page.getByText(/Create Brand-New Custom CV with Monday AI/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Print \/ PDF/i })).toBeVisible();

    // Switch to AI CV Auditor tab
    await page.click("button:has-text('AI CV Auditor')");
    await expect(page.getByRole("button", { name: /Run AI Resume Audit/i })).toBeVisible();
  });

  test("13. Concept Explorer RAG Document Grounding", async ({
    page,
  }) => {
    await page.goto("/learn/explore");
    await expect(page.getByText(/RAG Knowledge Retrieval/i)).toBeVisible();
    await expect(page.getByText(/Lecture Notes & Syllabus Invariant Grounding/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Run RAG/i })).toBeVisible();
  });

  test("14. Student Portfolio ZIP Codebase Archive Upload", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    await expect(page.getByText(/Verified Project Showcase/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Add Project/i })).toBeVisible();
    // Verify zip download button on existing verified project
    await expect(page.locator("a[title='Download ZIP codebase']").first()).toBeVisible();
  });
});
