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

test("hollow energy curves flow and respect reduced motion", async ({
  page,
}, info) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "What will you build today?" }),
  ).toBeVisible();
  const canvas = page.getByTestId("energy-ribbons");
  await expect(canvas).toHaveAttribute("data-motion", "flowing");
  const snapshot = () =>
    canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  await expect
    .poll(async () => (await snapshot()).length)
    .toBeGreaterThan(10000);
  const luminousFraction = await canvas.evaluate((el) => {
    const target = el as HTMLCanvasElement;
    const pixels = target
      .getContext("2d")!
      .getImageData(0, 0, target.width, target.height).data;
    let bright = 0;
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] > 180 && pixels[i + 1] * (pixels[i + 3] / 255) > 165)
        bright++;
    return bright / (pixels.length / 4);
  });
  // Count bright opaque material, excluding the deliberately broad translucent vapor.
  // A filled luminous ball exceeds this budget; thin cores with smoky fringes do not.
  expect(luminousFraction).toBeGreaterThan(0.001);
  expect(luminousFraction).toBeLessThan(0.25);
  const sample = () =>
    canvas.evaluate((el) => {
      const target = el as HTMLCanvasElement;
      const { data } = target
        .getContext("2d")!
        .getImageData(0, 0, target.width, target.height);
      const values: number[] = [];
      for (let y = 0; y < target.height; y += 8)
        for (let x = 0; x < target.width; x += 8) {
          const i = (y * target.width + x) * 4;
          values.push((data[i + 1] * data[i + 3]) / 255);
        }
      return values;
    });
  const before = await sample();
  await page.waitForTimeout(1000); // Measure clearly visible movement over one second.
  const after = await sample();
  const changed =
    after.filter((value, i) => Math.abs(value - before[i]) > 15).length /
    after.length;
  expect(changed).toBeGreaterThan(0.02);
  const initial = await snapshot();
  await expect.poll(snapshot).not.toBe(initial);
  await page.screenshot({ path: info.outputPath("dashboard-viewport.png") });
  await page
    .locator(".dashboard-hero")
    .screenshot({ path: info.outputPath("banner.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-motion", "still");
  const still = await snapshot();
  await page.waitForTimeout(150); // Verify actual pixels stay static while reduced motion is active.
  expect(await snapshot()).toBe(still);
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-motion", "flowing");
  await expect.poll(snapshot).not.toBe(still);
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-motion", "still");
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(canvas).toHaveAttribute("data-motion", "flowing");
  await expect.poll(snapshot).not.toBe(still);
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
