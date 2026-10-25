import { test, expect } from "@playwright/test";

test("empty CV shows a themed prompt and opens the real editor", async ({
  page,
}, info) => {
  await page.goto("/cv");
  await expect(page.getByText("Create your CV", { exact: true })).toBeVisible();
  await expect(page.locator("#cv-printable-area")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Start writing", exact: true })
    .click();
  const name = page.getByRole("textbox", { name: "fullName", exact: true });
  await expect(name).toBeFocused();
  await name.fill("Preview Check");
  const paper = page.locator("#cv-printable-area");
  await expect(paper).toBeVisible();
  await expect(paper.getByLabel("Candidate name", {exact:true})).toHaveText("Preview Check");
  expect(
    await paper.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  await name.fill("");
  await expect(paper).toHaveCount(0);
  await expect(page.getByText("Create your CV", { exact: true })).toBeVisible();
  await page.getByText("Edit all CV details", { exact: true }).click();
  await page
    .getByText("Create your CV", { exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("cv-empty.png") });
});
