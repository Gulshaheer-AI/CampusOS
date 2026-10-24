import { test, expect } from "@playwright/test";

test.setTimeout(180000);
test.beforeEach(async ({ page }) => {
  await page.route("**/images.unsplash.com/**", (route) => route.abort());
});

test("workspace routes keep their features and fit the viewport", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "dashboard",
    "courses",
    "tutor",
    "codeplay",
    "quizzes",
    "roadmaps",
    "challenges",
    "cv",
    "opportunities",
    "portfolio",
    "settings",
  ]) {
    await page.goto(`/${route}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main h1").first()).toBeAttached();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      ),
    ).toBe("rgb(6, 16, 11)");
    await page.screenshot({
      path: info.outputPath(`${route}.png`),
      fullPage: route === "dashboard",
    });
  }
  expect(errors).toEqual([]);
});

test("hero rings move slowly and respect reduced motion", async ({
  page,
}, info) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "What will you build today?" }),
  ).toBeVisible();
  const rings = page.locator(".orb-motion");
  expect(await rings.count()).toBeGreaterThanOrEqual(9);
  const first = rings.first();
  expect(
    parseFloat(
      await first.evaluate((el) => getComputedStyle(el).animationDuration),
    ),
  ).toBeGreaterThanOrEqual(30);
  const initial = await first.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => first.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(initial);
  await page.screenshot({ path: info.outputPath("dashboard-viewport.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await first.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "none",
  );
});

test("navigation, profile and keyboard controls work", async ({ page }) => {
  await page.goto("/dashboard");
  const opener = page.getByRole("button", { name: "Open sidebar" });
  if (await opener.isVisible()) {
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await opener.click();
    await dialog.getByRole("link", { name: "CV Studio", exact: true }).click();
  } else {
    await page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "CV Studio", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/cv$/);
  await page.getByRole("button", { name: "User profile menu" }).click();
  await page.getByRole("link", { name: "Profile & Settings" }).click();
  await expect(page).toHaveURL(/\/settings$/);
});

test("workspace search opens a real course or tool", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  if ((page.viewportSize()?.width || 0) < 640) {
    // Small screens retain the same routes through the mobile drawer.
    await page.getByRole("button", { name: "Open sidebar" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "CodePlay", exact: true })
      .click();
  } else {
    await page.keyboard.press("Control+k");
    const search = page.getByRole("textbox", { name: "Search workspace" });
    await expect(search).toBeFocused();
    await search.fill("CodePlay");
    await page
      .getByLabel("Search results")
      .getByRole("link", { name: "CodePlay", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/codeplay$/);
});

test("private notes can still be created, edited and deleted", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Add / Upload Note" }).click();
  await page
    .getByPlaceholder("e.g. CS101 Lecture 04 Invariant Proofs")
    .fill("Emerald UI regression note");
  await page
    .getByPlaceholder(
      "Write or paste your key lecture notes, formulas, or takeaways...",
    )
    .fill("A complete note retained through the visual redesign.");
  await page.getByRole("button", { name: "Save to Locker" }).click();
  await page.reload();
  await expect(
    page.getByText("Emerald UI regression note", { exact: true }),
  ).toBeVisible();
  await page.getByTitle("Edit Note", { exact: true }).click();
  const modal = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: /Save Changes/ }) });
  await modal
    .locator('input[type="text"]')
    .first()
    .fill("Updated emerald note");
  await modal.getByRole("button", { name: /Save Changes/ }).click();
  await expect(
    page.getByText("Updated emerald note", { exact: true }),
  ).toBeVisible();
  await page.getByTitle("Delete Note", { exact: true }).click();
  await expect(
    page.getByText("Updated emerald note", { exact: true }),
  ).toHaveCount(0);
});

test("CV preview stays white while app controls use emerald surfaces", async ({
  page,
}) => {
  await page.goto("/cv");
  const paper = page.locator("#cv-printable-area");
  await expect(paper).toBeVisible();
  expect(
    await paper.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  const button = page
    .locator(".cv-preview")
    .getByRole("button", { name: "Download PDF", exact: true });
  expect(await button.evaluate((el) => getComputedStyle(el).color)).toBe(
    "rgb(8, 32, 18)",
  );
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".workspace-header")).toBeHidden();
  await expect(paper).toBeVisible();
});
