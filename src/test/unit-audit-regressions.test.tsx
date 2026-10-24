import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { parseRawCvTextToCvData } from "@/lib/cv-parser";
import { cvSections, CV_STYLES, getTemplateKind } from "@/lib/cv-layout";
import { generateCvPdf } from "@/lib/pdf-generator";
import { generateCvDocx } from "@/lib/docx-generator";
import { RegionalCvPreview } from "@/components/cv/RegionalCvPreview";
import { chunkTextContent } from "@/lib/rag-engine";
import {
  getCourses,
  saveCourse,
  getCurrentUser,
  switchRole,
  enrollWithClassCode,
  getRoadmaps,
  getChallenges,
} from "@/lib/store";
import { getAllW3Courses } from "@/lib/w3schools-data";
import type { CvData, CvTemplate } from "@/types";
import fs from "node:fs";
const cv: CvData = {
  fullName: "Ayesha Khan",
  title: "Clinical Researcher",
  email: "ayesha@hospital.org",
  phone: "",
  location: "Lahore",
  summary: "Investigates clinical outcomes.",
  experience: [
    {
      company: "World Health Organization",
      role: "Research Lead • Clinical Outcomes",
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
  projects: [
    { name: "Clinical Trial", tools: "R", bullets: ["Analyzed outcomes"] },
  ],
  skills: [{ category: "Clinical", items: ["Clinical research"] }],
  certifications: [],
  customSections: [
    { title: "Publications", content: ["Khan A. Clinical Outcomes. 2025."] },
  ],
};
const bytes = (blob: Blob) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
beforeEach(() => localStorage.clear());
describe("Audit CV fidelity and flowing exports", () => {
  for (const id of Object.keys(CV_STYLES) as (keyof typeof CV_STYLES)[]) {
    it(`${id} preserves real employers, custom sections and selected template without injections`, async () => {
      const template: CvTemplate = {
        id,
        name: id,
        region:
          id === "pk-hec-pec"
            ? "pakistani"
            : id === "eu-europass"
              ? "european"
              : "us",
        description: "",
        layout: "single_column",
        accentColor: CV_STYLES[id].accent,
        atsScoreRate: 0,
      };
      const html = renderToStaticMarkup(
        <RegionalCvPreview cvData={cv} template={template} editable={false} />,
      );
      const pdf = Buffer.from(await bytes(generateCvPdf(cv, id)));
      const docx = Buffer.from(await bytes(generateCvDocx(cv, id)));
      expect(html).toContain(`data-cv-template="${id}"`);
      for (const text of [html, pdf.toString(), docx.toString()]) {
        expect(text).toContain("World Health Organization");
        expect(text.toLowerCase()).toContain("publications");
        expect(text).not.toMatch(
          /SublimeTechs|COMP\/2026-48192|PEC Reg|HEC\/PEC Accredited/,
        );
      }
      expect(html).not.toContain('contenteditable="true"');
      fs.mkdirSync("/tmp/campus-cv-qa", { recursive: true });
      fs.writeFileSync(`/tmp/campus-cv-qa/${id}.pdf`, pdf);
      fs.writeFileSync(`/tmp/campus-cv-qa/${id}.docx`, docx);
    });
  }
  it("paginates long documents without colliding or clipping text baselines", async () => {
    const long = {
      ...cv,
      experience: Array.from({ length: 12 }, (_, i) => ({
        ...cv.experience[0],
        role: `Research Lead ${i + 1}`,
        bullets: Array.from({ length: 5 }, () =>
          "Measured outcomes and documented reproducible clinical methods. ".repeat(
            8,
          ),
        ),
      })),
    };
    const data = Buffer.from(
      await bytes(generateCvPdf(long, "executive-corporate")),
    );
    const pdf = data.toString();
    const streams = Array.from(pdf.matchAll(/stream\n([\s\S]*?)\nendstream/g));
    expect(streams.length).toBeGreaterThan(3);
    for (const stream of streams) {
      const lines = Array.from(
        stream[1].matchAll(
          /BT \/F\d+ ([\d.]+) Tf [\d. ]+ rg 1 0 0 1 ([\d.]+) ([\d.]+) Tm/g,
        ),
      );
      for (const [index, line] of lines.entries()) {
        expect(Number(line[3])).toBeGreaterThanOrEqual(50);
        expect(Number(line[3])).toBeLessThanOrEqual(820);
        if (index)
          expect(
            Number(lines[index - 1][3]) - Number(line[3]),
          ).toBeGreaterThanOrEqual(12);
      }
    }
    fs.writeFileSync("/tmp/campus-cv-qa/long-multipage.pdf", data);
  });
  it("parses specialized headings and multiline education without inventing facts", () => {
    const parsed = parseRawCvTextToCvData(
      "Ayesha Khan\nClinical Researcher\nEDUCATION\nMBBS\nKing Edward Medical University\n2020\nCLINICAL ROTATIONS\nCardiology, Mayo Hospital\nPUBLICATIONS\nClinical outcomes 2025\nBAR ADMISSIONS\nPunjab Bar Council",
    );
    expect(parsed.education[0]).toMatchObject({
      degree: "MBBS",
      institution: "King Edward Medical University",
      year: "2020",
    });
    expect(parsed.customSections?.map((s) => s.title)).toEqual([
      "CLINICAL ROTATIONS",
      "PUBLICATIONS",
      "BAR ADMISSIONS",
    ]);
    expect(parsed.email).toBe("");
    expect(parsed.phone).toBe("");
    expect(parsed.experience).toEqual([]);
    expect(parsed.summary).toBe("");
  });
  it("keeps unsupported details empty instead of filling missing company, dates or education", () => {
    const parsed = parseRawCvTextToCvData(
      "Ayesha Khan\nResearcher\nExperience\nResearch Lead\n- Analyzed clinical records\nEducation\nMBBS",
    );
    expect(JSON.stringify(parsed)).not.toMatch(
      /2023 - Present|2024 - 2028|Self-Employed|BISE|Delivered core|proven track record/,
    );
  });
  it("uses the exact same facts and section order for every layout", () => {
    expect(getTemplateKind("United States ATS Standard (Harvard FAS OCS / Silicon Valley)")).toBe("us-harvard-ats");
    const sections = cvSections(cv, "modern-tech-ats");
    expect(sections.map((s) => s.title)).toContain("Projects");
    expect(sections.find((s) => s.title === "Certifications")).toBeUndefined();
    expect(sections.flatMap((s) => s.lines).map((l) => l.text)).toContain(
      "World Health Organization | 2022–2026",
    );
  });
});
describe("Semantic indexing", () => {
  it("preserves code fences, indentation, formulas and every sentence", () => {
    const code =
      '```python\ndef greet(name):\n    return "hello " + name\nprint(greet("A"))\n```';
    const formula = "$$E = mc^2$$";
    const chunks = chunkTextContent(
      `A complete sentence.\n\n${code}\n\n${formula}\n\nAnother complete sentence.`,
      "doc",
      "notes.md",
      8,
      2,
    );
    expect(chunks.some((c) => c.content.includes(code))).toBe(true);
    expect(chunks.some((c) => c.content.includes(formula))).toBe(true);
    expect(chunks.map((c) => c.content).join("\n")).toContain(
      "Another complete sentence.",
    );
  });
});
describe("Enrollment and curriculum persistence", () => {
  it("validates the code, persists enrollment, and isolates student accounts", () => {
    switchRole("student");
    const course = {
      ...getCourses()[0],
      id: "new-class",
      classCode: "TEST-CLASS",
      isEnrolled: false,
    };
    saveCourse(course);
    expect(() => enrollWithClassCode("WRONG")).toThrow("No course");
    expect(enrollWithClassCode(" test-class ").isEnrolled).toBe(true);
    expect(getCourses().find((c) => c.id === course.id)?.isEnrolled).toBe(true);
    const saved = localStorage.getItem("campusos_enrollments");
    enrollWithClassCode("TEST-CLASS");
    expect(localStorage.getItem("campusos_enrollments")).toBe(saved);
    expect(switchRole("user-student-2").id).toBe("user-student-2");
    expect(getCourses().find((c) => c.id === course.id)?.isEnrolled).toBe(
      false,
    );
    switchRole("teacher");
    expect(() => enrollWithClassCode("TEST-CLASS")).toThrow("Only students");
  });
  it("contains executable worked examples and meaningful exercises for all advanced topics", () => {
    const courses = getAllW3Courses();
    const python = courses.find((c) => c.id === "python")!;
    for (const topic of [
      "sqlite",
      "mysql",
      "numpy-arrays",
      "pandas-dataframes",
      "matplotlib",
      "ml-regression",
      "deep-learning",
      "generators",
      "decorators",
      "context-managers",
      "dunder-methods",
    ])
      expect(python.chapters.some((c) => c.id === `python-${topic}`)).toBe(
        true,
      );
    for (const course of courses) {
      const roadmap = getRoadmaps().find(
        (r) => r.id === `academy-${course.id}`,
      )!;
      expect(roadmap.weeks.flatMap((w) => w.tasks).length).toBe(
        course.chapters.length,
      );
      for (const chapter of course.chapters.filter(
        (c) => c.categoryGroup === "Applied & Advanced",
      ))
        expect(
          getChallenges().some(
            (c) => c.id === `academy-challenge-${chapter.id}`,
          ),
        ).toBe(true);
      expect(new Set(course.chapters.map((c) => c.id)).size).toBe(
        course.chapters.length,
      );
      for (const chapter of course.chapters.filter(
        (c) => c.categoryGroup === "Applied & Advanced",
      )) {
        expect(chapter.sections.length).toBeGreaterThan(1);
        expect(chapter.exercise.codeTemplate).toContain("___");
        expect(
          chapter.exercise.codeTemplate.replace(
            "___",
            chapter.exercise.blankAnswer,
          ),
        ).toBe(chapter.tryItYourself.starterCode);
      }
    }
  });
});
