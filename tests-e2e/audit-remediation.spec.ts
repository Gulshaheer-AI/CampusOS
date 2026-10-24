import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";
test.setTimeout(90000);
test.beforeEach(async ({ page }) => {
  await page.route("**/images.unsplash.com/**", (route) => route.abort());
});
const cv = {
  fullName: "Ayesha Khan",
  title: "Clinical Researcher",
  email: "ayesha@hospital.org",
  phone: "",
  location: "Lahore",
  summary: "Investigates clinical outcomes.",
  experience: [
    {
      company: "World Health Organization",
      role: "Research Lead",
      period: "2022–2026",
      bullets: ["Led a multicentre study. ".repeat(30)],
    },
  ],
  education: [
    {
      degree: "MBBS",
      institution: "King Edward Medical University",
      year: "2020",
    },
  ],
  projects: [],
  skills: [],
  customSections: [
    { title: "Publications", content: ["Clinical Outcomes 2025"] },
  ],
};
test("all five CV previews preserve source facts, export and print without chrome", async ({
  page,
}, info) => {
  await page.addInitScript(
    (data) =>
      localStorage.setItem("campusos_cv_user-student-1", JSON.stringify(data)),
    cv,
  );
  await page.goto("/cv", { waitUntil: "domcontentloaded" });
  const article = page.locator("#cv-printable-area");
  await expect(article).toContainText("World Health Organization");
  for (const id of [
    "pk-hec-pec",
    "us-harvard-ats",
    "modern-tech-ats",
    "eu-europass",
    "executive-corporate",
  ]) {
    await page.locator(`[data-template-id="${id}"]`).click();
    await expect(article).toHaveAttribute("data-cv-template", id);
    await expect(article).toContainText("Publications");
    await expect(article).not.toContainText(/PEC Reg|SublimeTechs|Accredited/);
    const download = page.waitForEvent("download");
    await page
      .locator(".cv-preview")
      .getByRole("button", { name: "Download PDF", exact: true })
      .click();
    expect((await download).suggestedFilename()).toContain(id);
    const word = page.waitForEvent("download");
    await page
      .locator(".cv-preview")
      .getByRole("button", { name: "Download Word", exact: true })
      .click();
    expect((await word).suggestedFilename()).toContain(id);
  }
  await page.screenshot({
    path: info.outputPath("cv-desktop.png"),
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".cv-preview [role=toolbar]")).toBeHidden();
  await expect(article).toBeVisible();
  await page.pdf({
    path: info.outputPath("cv-browser-print.pdf"),
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("faculty dashboard displays teaching metrics", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", {name: /Welcome back/})).toBeVisible();
  await page.getByRole("button", {name: "Switch User Role"}).click();
  await page.getByRole("button", {name: /Teacher \/ Faculty/}).click();
  await expect(
    page.getByRole("heading", { name: "Faculty Teaching Center" }),
  ).toBeVisible();
  await expect(page.getByText("Courses taught", { exact: true })).toBeVisible();
  await expect(page.getByText("Enrolled Courses", { exact: true })).toHaveCount(
    0,
  );
});
test("lecture upload over 5MB survives reload and downloads original bytes", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "campusos_current_user",
      JSON.stringify({
        id: "user-teacher-1",
        name: "Faculty User",
        role: "teacher",
        interests: [],
        learningPace: "regular",
      }),
    ),
  );
  await page.goto("/teacher", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: "Edit Course", exact: true })
    .first()
    .click();
  const original = Buffer.alloc(6 * 1024 * 1024, 65);
  await page
    .locator('input[type="file"][accept*=".md"]')
    .setInputFiles({
      name: "large-lecture.pdf",
      mimeType: "application/pdf",
      buffer: original,
    });
  await expect(
    page.getByText("large-lecture.pdf (6.0 MB)", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Attach Lecture Material" }).click();
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await page.reload({ waitUntil: "domcontentloaded" });
  const record = await page.evaluate(() => {
    const courses = JSON.parse(
      localStorage.getItem("campusos_courses") || "[]",
    );
    return courses
      .flatMap((c: any) => c.materials)
      .find((m: any) => m.fileName === "large-lecture.pdf");
  });
  expect(record.fileStorageKey).toBeTruthy();
  expect(record.fileData).toBeUndefined();
  await page.goto(`/courses/${record.courseId}`, {
    waitUntil: "domcontentloaded",
  });
  const card = page
    .locator("div")
    .filter({ has: page.getByText("large-lecture.pdf", { exact: true }) })
    .filter({ has: page.locator('[title="Download Official Material"]') })
    .last();
  const downloaded = page.waitForEvent("download");
  await card.locator('[title="Download Official Material"]').click();
  const file = await downloaded;
  expect(
    Buffer.compare(await fs.readFile((await file.path())!), original),
  ).toBe(0);
});
test("CodePlay executes real Python variables, loops, functions and errors", async ({
  page,
}) => {
  // Optional exact-version local runtime for CI environments without CDN access.
  if (process.env.CAMPUSOS_PYODIDE_DIR)
    await page.route(
      "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/**",
      async (route) => {
        const filename = new URL(route.request().url()).pathname
          .split("/")
          .pop()!;
        await route.fulfill({
          path: path.join(process.env.CAMPUSOS_PYODIDE_DIR!, filename),
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      },
    );
  await page.goto("/codeplay", { waitUntil: "domcontentloaded" });
  await page.getByText("algorithm.py", { exact: true }).first().click();
  const editor = page.locator("textarea").last();
  await editor.fill(
    "def square(x):\n    return x*x\nprint(sum(square(i) for i in range(5)))",
  );
  await page
    .getByRole("button", { name: "Run (Ctrl+Enter)", exact: true })
    .click();
  await expect(page.getByText("30", { exact: true })).toBeVisible({
    timeout: 60000,
  });
  await editor.fill("raise ValueError('real failure')");
  await page
    .getByRole("button", { name: "Run (Ctrl+Enter)", exact: true })
    .click();
  await expect(page.getByText(/ValueError: real failure/)).toBeVisible({
    timeout: 60000,
  });
});

test("class enrollment validates codes and remains enrolled after reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("campusos_courses"))
      localStorage.setItem(
        "campusos_courses",
        JSON.stringify([
          {
            id: "audit-class",
            code: "AUD101",
            title: "Audit Course",
            description: "Testing persistent enrollment",
            instructorId: "user-teacher-1",
            instructorName: "Faculty User",
            enrolledStudentsCount: 0,
            level: "Beginner",
            category: "Testing",
            modules: [],
            materials: [],
            classCode: "AUDIT-CLASS",
            isEnrolled: false,
          },
        ]),
      );
  });
  await page.goto("/courses", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/Class Code/).fill("WRONG");
  await page.getByRole("button", { name: "Enroll", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(
    "No course matches",
  );
  await page.getByPlaceholder(/Class Code/).fill(" audit-class ");
  await page.getByRole("button", { name: "Enroll", exact: true }).click();
  await expect(
    page.getByText("You are enrolled in Audit Course.", { exact: true }),
  ).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("campusos_enrollments") || "{}")[
          "user-student-1"
        ],
    ),
  ).toContain("audit-class");
});
