import { test, expect } from "@playwright/test";

test.describe("CampusOS Production Platform Verification", () => {
  test("1. Landing page renders with complete value prop and navigation links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CampusOS/);

    // Verify headline and CTAs
    await expect(page.locator("h1:has-text('Learn Better')")).toBeVisible();
    await expect(
      page.locator("button:has-text('Start Learning')").last(),
    ).toBeVisible();
    await expect(
      page.locator("text=Explore the Platform").first(),
    ).toBeVisible();

    // Verify learning cycle banner
    await expect(page.getByText(/The CampusOS Learning Cycle/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "EXPLAIN" })).toBeVisible();
  });

  test("2. Public pages directory navigation and content validation", async ({
    page,
  }) => {
    // Features
    await page.goto("/features");
    await expect(
      page.locator("h1:has-text('Everything You Need to Excel')"),
    ).toBeVisible();

    // How It Works
    await page.goto("/how-it-works");
    await expect(
      page.locator("h1:has-text('How CampusOS Accelerates Mastery')"),
    ).toBeVisible();

    // For Students
    await page.goto("/for-students");
    await expect(
      page.locator("h1:has-text('From Confusing Lectures')"),
    ).toBeVisible();

    // For Teachers
    await page.goto("/for-teachers");
    await expect(
      page.locator("h1:has-text('Save Hours on Assessment Design')"),
    ).toBeVisible();

    // About
    await page.goto("/about");
    await expect(
      page.locator("h1:has-text('From Classroom to Career')"),
    ).toBeVisible();

    // Contact with functional validation
    await page.goto("/contact");
    await expect(
      page.locator("h1:has-text('Contact the CampusOS Team')"),
    ).toBeVisible();
    await page.click("button:has-text('Submit Inquiry')");
    await expect(
      page.getByText(/Name must be at least 2 characters/i),
    ).toBeVisible();

    // Privacy & Terms with compliance notices
    await page.goto("/privacy");
    await expect(page.locator("h1:has-text('Privacy Policy')")).toBeVisible();
    await expect(page.getByText(/Notice to Institutions/i)).toBeVisible();

    await page.goto("/terms");
    await expect(page.locator("h1:has-text('Terms of Use')")).toBeVisible();
  });

  test("3. Authenticated dashboard preserves learning and revision metrics", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Welcome back,/i)).toBeVisible();
    await expect(page.getByText(/Enrolled Courses/i)).toBeVisible();
    await expect(page.getByText(/Quiz average/i)).toBeVisible();
    await expect(page.getByText(/Roadmap Progress/i)).toBeVisible();
    await expect(
      page.getByText(/Weak Topics Requiring Revision/i),
    ).toBeVisible();
  });

  test("4. AI Tutor (Monday AI): Ask questions and view structured pedagogical responses", async ({
    page,
  }) => {
    await page.goto("/tutor");
    const input = page.getByPlaceholder(/Ask about a lecture topic/i);
    await expect(input).toBeVisible();
    const assistants = page.locator('[data-message-role="assistant"]');
    await expect(assistants.first()).toBeVisible();
    const before = await assistants.count();
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/ai/chat") &&
        response.request().method() === "POST",
    );
    await input.fill("Explain binary search invariants");
    await page.locator("form button[type='submit']").click();
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
    await expect(assistants).toHaveCount(before + 1);
    expect((await assistants.last().innerText()).length).toBeGreaterThan(30);
  });

  test("5. Concept Explorer retains its Monday AI integration", async ({
    page,
  }) => {
    await page.goto("/learn/explore");
    await expect(page).toHaveURL(/\/tutor$/);
    await expect(
      page.getByPlaceholder(/Ask about a lecture topic/i),
    ).toBeVisible();
  });

  test("6. CodePlay: Execute isolated frontend exercises safely", async ({
    page,
  }) => {
    await page.goto("/codeplay");
    await expect(page.getByText(/CodePlay Coding Playground/i)).toBeVisible();
    await expect(
      page.getByText(/Live Preview \(Sandboxed Render Canvas\)/i),
    ).toBeVisible();

    // Click run
    await page.click("button:has-text('Run (Ctrl+Enter)')");
    await expect(page.getByText(/^Execution Console \(/i)).toBeVisible();
  });

  test("7. QuizForge: Take practice assessment and verify instant scoring and review", async ({
    page,
  }) => {
    await page.goto("/quizzes");
    await expect(
      page.getByRole("heading", { name: "Quizzes", exact: true }),
    ).toBeVisible();

    // Start Binary Search Quiz
    await page.locator("button:has-text('Start Assessment')").first().click();
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();

    // Choose answer and navigate
    await page.click("button:has-text('O(log N)')");
    await page.click("button:has-text('Next')");

    // Question 2
    await expect(page.getByText(/Question 2 of/i)).toBeVisible();
  });

  test("8. Skill roadmap tasks and Academy course lab are available", async ({
    page,
  }) => {
    await page.goto("/roadmaps/roadmap-web-dev");
    await expect(
      page.getByText(/Full-Stack Web Architect/i).first(),
    ).toBeVisible();
    await expect(page.locator("main")).toContainText(/JavaScript|Curriculum/);
    await page.goto("/roadmaps");
    await expect(page.locator("main")).toContainText(/Python/);
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
    await expect(
      page.getByRole("button", { name: /Toggle navigation menu/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Toggle navigation menu/i }).click();
    await expect(
      page.getByRole("link", { name: /Features/i }).first(),
    ).toBeVisible();
  });

  test("11. Duolingo-style AI Challenge Learning Ladder & Hearts System", async ({
    page,
  }) => {
    await page.goto("/challenges/challenge-autocomplete");
    await expect(
      page.getByText(/Stage-by-Stage AI Training Ladder/i),
    ).toBeVisible();
    await expect(page.getByText(/Streak/i).first()).toBeVisible();
    await expect(page.getByText(/Stage 1/i).first()).toBeVisible();
    // Warmup stage has prompt & Verify button
    await expect(
      page.getByRole("button", { name: /Verify Concept Choice/i }),
    ).toBeVisible();
  });

  test("12. Opportunity discovery links to the dedicated CV studio and auditor", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    await expect(
      page.getByPlaceholder("Role, skill, or location"),
    ).toBeVisible();
    await page.getByRole("link", { name: /Open CV Studio/ }).click();
    await expect(page).toHaveURL(/\/cv$/);
    await expect(
      page
        .locator(".cv-preview")
        .getByRole("button", { name: "Download PDF", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /^AI review$/ })
      .click();
    await expect(
      page.getByRole("button", { name: "Audit with Monday AI", exact: true }),
    ).toBeVisible();
  });

  test("13. Tutor retains RAG upload and document grounding controls", async ({
    page,
  }) => {
    await page.goto("/tutor");
    await page
      .getByRole("button", { name: "Attach & Manage RAG Documents" })
      .click();
    await page
      .getByRole("button", { name: "Upload Files", exact: true })
      .click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "ui-grounding.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "The emerald interface preserves document grounding for student notes.",
      ),
    });
    await expect(
      page.getByText("ui-grounding.txt", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(/Ask about a lecture topic/i),
    ).toBeVisible();
  });

  test("14. Student portfolio can create a real project with a ZIP archive", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    await page
      .getByRole("button", { name: "Add Project", exact: true })
      .click();
    await page
      .getByPlaceholder("e.g. Distributed Consensus Engine")
      .fill("UI regression project");
    await page
      .getByPlaceholder(
        "Brief summary of architectural decisions and results...",
      )
      .fill(
        "A functional portfolio project retained after the emerald redesign.",
      );
    await page.locator('input[type="file"]').setInputFiles({
      name: "project.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("PK\x03\x04test"),
    });
    await expect(page.getByText("project.zip", { exact: true })).toBeVisible();
    await page.locator('form button[type="submit"]').click();
    await expect(
      page.getByText("UI regression project", { exact: true }),
    ).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByTitle("Download verifiable codebase ZIP archive").click();
    expect((await download).suggestedFilename()).toBe("project.zip");
  });
});
