import { test, expect } from "@playwright/test";

test("simplified controls retain CV layouts, roadmap tracks, quizzes and study insights", async ({
  page,
}, info) => {
  await page.route("**/images.unsplash.com/**", (route) => route.abort());
  await page.goto("/cv");
  await expect(
    page.getByRole("heading", { name: "CV Studio", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-template-id]")).toHaveCount(5);
  const layout = page.locator('[data-template-id="modern-tech-ats"]');
  await layout.click();
  await expect(layout).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "AI review", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "CV review", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await expect(page.locator("#cv-printable-area")).toBeVisible();
  await page.screenshot({ path: info.outputPath("cv-layouts.png") });
  await page.goto("/roadmaps");
  await page
    .getByRole("button", { name: "Career tracks", exact: true })
    .click();
  await expect(
    page.getByText("Tracks Available", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Learn to code", exact: true })
    .click();
  await page.getByRole("button", { name: "JAVASCRIPT", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "JS HOME", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: info.outputPath("roadmaps.png") });
  await page.goto("/quizzes");
  await page
    .getByRole("button", { name: "Generate Custom Quiz", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Generate Instant Quiz", exact: true }),
  ).toBeVisible();
  await page.goto("/dashboard");
  const insights = page.locator("details.workspace-disclosure");
  await expect(insights).not.toHaveAttribute("open", "");
  await page.getByText("Study insights", { exact: true }).click();
  await expect(insights).toHaveAttribute("open", "");
  await expect(
    page.getByText("Topics to review", { exact: true }),
  ).toBeVisible();
});
