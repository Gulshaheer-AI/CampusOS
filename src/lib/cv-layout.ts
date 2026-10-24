import type { CvData } from "@/types";
export type CvTemplateKind =
  | "executive-corporate"
  | "pk-hec-pec"
  | "eu-europass"
  | "us-harvard-ats"
  | "modern-tech-ats";
export function getTemplateKind(nameOrId = ""): CvTemplateKind {
  const name = nameOrId.toLowerCase();
  if (/executive|multi-track|dual-focus/.test(name))
    return "executive-corporate";
  if (/pakistan|hec|pec|^pk-/.test(name)) return "pk-hec-pec";
  if (/europass|european|cefr|^eu-/.test(name)) return "eu-europass";
  if (/harvard|ivy/.test(name)) return "us-harvard-ats";
  if (/modern|silicon|clean.sans/.test(name)) return "modern-tech-ats";
  if (/harvard|ivy|united states|^us/.test(name)) return "us-harvard-ats";
  return "executive-corporate";
}
export const CV_STYLES = {
  "executive-corporate": {
    accent: "#0F172A",
    font: "Arial",
    centered: false,
    banner: true,
  },
  "pk-hec-pec": {
    accent: "#047857",
    font: "Arial",
    centered: false,
    banner: false,
  },
  "eu-europass": {
    accent: "#1E3A8A",
    font: "Arial",
    centered: false,
    banner: false,
  },
  "us-harvard-ats": {
    accent: "#000000",
    font: "Times New Roman",
    centered: true,
    banner: false,
  },
  "modern-tech-ats": {
    accent: "#2563EB",
    font: "Arial",
    centered: false,
    banner: false,
  },
} as const;
export interface CvLine {
  text: string;
  kind?: "title" | "detail" | "bullet";
  path?: (string | number)[];
}
export interface CvSection {
  title: string;
  lines: CvLine[];
}
/** One factual document model feeds the preview, PDF and Word export. No inferred claims. */
export function cvSections(cv: CvData, kind: CvTemplateKind): CvSection[] {
  const sections: CvSection[] = [];
  const add = (title: string, lines: CvLine[]) => {
    const present = lines.filter((l) => l.text?.trim());
    if (present.length) sections.push({ title, lines: present });
  };
  add("Professional Summary", [{ text: cv.summary, path: ["summary"] }]);
  add(
    "Skills & Expertise",
    (cv.skills || []).map((s) => ({
      text: [s.category, s.items.join(", ")].filter(Boolean).join(": "),
    })),
  );
  add(
    "Professional Experience",
    (cv.experience || []).flatMap((e, i): CvLine[] => [
      { text: e.role, kind: "title", path: ["experience", i, "role"] },
      {
        text: [e.company, e.period].filter(Boolean).join(" | "),
        kind: "detail",
      },
      ...e.bullets.map(
        (text, j): CvLine => ({
          text,
          kind: "bullet",
          path: ["experience", i, "bullets", j],
        }),
      ),
    ]),
  );
  add(
    "Projects",
    (cv.projects || []).flatMap((p, i): CvLine[] => [
      { text: p.name, kind: "title", path: ["projects", i, "name"] },
      { text: [p.tools, p.link].filter(Boolean).join(" | "), kind: "detail" },
      ...(p.bullets || []).map(
        (text, j): CvLine => ({
          text,
          kind: "bullet",
          path: ["projects", i, "bullets", j],
        }),
      ),
    ]),
  );
  add("Project Experience", [
    {
      text: cv.projectExperienceNarrative || "",
      path: ["projectExperienceNarrative"],
    },
  ]);
  add(
    "Academic Qualifications",
    (cv.education || []).flatMap((e, i): CvLine[] => [
      { text: e.degree, kind: "title", path: ["education", i, "degree"] },
      {
        text: [e.institution, e.year].filter(Boolean).join(" | "),
        kind: "detail",
      },
      {
        text: [e.gpa && `Grade / CGPA: ${e.gpa}`, e.highlights]
          .filter(Boolean)
          .join(" | "),
      },
    ]),
  );
  add(
    kind === "eu-europass" ? "Languages — CEFR Language Passport" : "Languages",
    (cv.languages || []).map((l) => ({
      text: `${l.language}: ${l.proficiency}${l.cefrLevel ? ` (${l.cefrLevel})` : ""}`,
    })),
  );
  add(
    "Certifications",
    (cv.certifications || []).map((text, i) => ({
      text,
      path: ["certifications", i],
    })),
  );
  for (const [i, section] of (cv.customSections || []).entries())
    add(
      section.title,
      section.content.map((text, j) => ({
        text,
        path: ["customSections", i, "content", j],
      })),
    );
  const regional =
    kind === "pk-hec-pec"
      ? [
          cv.fatherName && `Father: ${cv.fatherName}`,
          cv.cnic && `CNIC: ${cv.cnic}`,
          cv.domicile && `Domicile: ${cv.domicile}`,
        ]
      : [];
  add(
    "Additional Information",
    [
      ...regional,
      cv.nationality && `Nationality: ${cv.nationality}`,
      cv.drivingLicence && `Driving Licence: ${cv.drivingLicence}`,
      cv.additionalInfo,
    ]
      .filter(Boolean)
      .map((text) => ({ text: text as string })),
  );
  return sections;
}
