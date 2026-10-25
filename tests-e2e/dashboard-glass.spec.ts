import { test, expect } from "@playwright/test";

test("compact glass dashboard keeps desktop navigation visible", async ({
  page,
}, info) => {
  await page.route("**/images.unsplash.com/**", (route) => route.abort());
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1536, height: 696 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "What will you build today?" }),
    ).toBeVisible();
    const sidebar = page.locator("aside .workspace-sidebar");
    const nav = sidebar.getByRole("navigation");
    await expect(
      nav.getByRole("link", { name: "Opportunities", exact: true }),
    ).toBeInViewport();
    await expect(
      nav.getByRole("link", { name: "Portfolio", exact: true }),
    ).toBeInViewport();
    const space = await sidebar.evaluate((el) => {
      const nav = el.querySelector("nav")!;
      const links = nav.querySelectorAll("a");
      const bottom = links[links.length - 1].getBoundingClientRect().bottom;
      const profile = el
        .querySelector(".workspace-profile")!
        .getBoundingClientRect().top;
      return {
        gap: profile - bottom,
        overflow: nav.scrollHeight > nav.clientHeight,
        blur: getComputedStyle(el).backdropFilter,
      };
    });
    expect(space.gap).toBeGreaterThan(28);
    expect(space.overflow).toBe(false);
    expect(space.blur).toContain("blur");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`dashboard-${viewport.width}.png`),
    });
  }
  await page.getByRole("button", { name: "User profile menu" }).click();
  await expect(
    page.getByRole("link", { name: "Profile & Settings" }),
  ).toBeVisible();
});

test("compact shell keeps the mobile navigation accessible", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/images.unsplash.com/**", (route) => route.abort());
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "What will you build today?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("dashboard-mobile.png") });
  await page.getByRole("button", { name: "Open sidebar" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(
    drawer.getByRole("link", { name: "Opportunities", exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Close sidebar" }).click();
  await expect(drawer).toBeHidden();
});
