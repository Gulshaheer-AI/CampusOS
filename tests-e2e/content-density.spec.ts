import { test, expect } from "@playwright/test";

test("desktop sections share compact content density without scaling the sidebar", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1536, height: 696 });
  await page.route("**/images.unsplash.com/**", (route) => route.abort());
  for (const route of ["dashboard", "courses", "opportunities"]) {
    await page.goto(`/${route}`);
    await expect(page.locator("main h1").first()).toBeVisible();
    const content = page.locator(".workspace-page");
    expect(await content.evaluate((el) => getComputedStyle(el).zoom)).toBe(
      "0.8",
    );
    const sidebar = await page
      .locator("aside .workspace-sidebar")
      .boundingBox();
    expect(sidebar!.width).toBe(220);
    const main = await page.locator("main").boundingBox();
    const body = await content.boundingBox();
    expect(body!.width).toBeGreaterThan(main!.width - 65);
    expect(body!.x + body!.width).toBeLessThanOrEqual(1536);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (route === "dashboard") {
      await expect(
        page.getByText("Career toolkit", { exact: true }),
      ).toBeInViewport();
      await expect(
        page.getByRole("link", { name: "Start challenge" }),
      ).toBeInViewport();
      const toolkit = await page
        .getByText("Career toolkit", { exact: true })
        .locator("..")
        .boundingBox();
      expect(toolkit!.y + toolkit!.height).toBeLessThanOrEqual(696);
      await page.getByRole("button", { name: "Add / Upload Note" }).click();
      const dialog = page.locator(".fixed.inset-0").filter({
        has: page.getByText("Add Private Study Note", { exact: true }),
      });
      await expect(dialog).toBeVisible();
      const overlay = await dialog.boundingBox();
      await page.screenshot({ path: info.outputPath("dialog.png") });
      expect(overlay!.x).toBeCloseTo(0);
      expect(overlay!.y).toBeCloseTo(0);
      expect(overlay!.width).toBeCloseTo(1536, 0);
      expect(overlay!.height).toBeCloseTo(696, 0);
      await dialog.locator("button").first().click();
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.screenshot({ path: info.outputPath(`${route}.png`) });
  }
  await page.emulateMedia({ media: "print" });
  expect(
    await page
      .locator(".workspace-page")
      .evaluate((el) => getComputedStyle(el).zoom),
  ).toBe("1");
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  expect(
    await page
      .locator(".workspace-page")
      .evaluate((el) => getComputedStyle(el).zoom),
  ).toBe("1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
