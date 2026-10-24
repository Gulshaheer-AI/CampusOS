"use client";
import React from "react";
import type { CvData, CvTemplate } from "@/types";
import { cvSections, CV_STYLES, getTemplateKind } from "@/lib/cv-layout";
import { downloadCvPdf } from "@/lib/pdf-generator";
import { downloadCvDocx } from "@/lib/docx-generator";
import { getCurrentUser, saveUserCv } from "@/lib/store";
import { Button } from "@/components/ui/Button";

interface RegionalCvPreviewProps {
  cvData: CvData;
  template: CvTemplate;
  onChange?: (updated: CvData) => void;
  editable?: boolean;
}
export function RegionalCvPreview({
  cvData,
  template,
  onChange,
  editable = true,
}: RegionalCvPreviewProps) {
  const [saved, setSaved] = React.useState(false);
  const kind = getTemplateKind(template.id);
  const style = CV_STYLES[kind];
  const update = (path: (string | number)[], value: unknown) => {
    if (!editable || !onChange) return;
    const next = structuredClone(cvData);
    let cursor: any = next;
    for (const key of path.slice(0, -1)) cursor = cursor[key];
    cursor[path[path.length - 1]] = value;
    onChange(next);
  };
  const field = (value: string, path: (string | number)[], label: string) => (
    <span
      contentEditable={editable && !!onChange}
      suppressContentEditableWarning
      aria-label={label}
      onBlur={(e) =>
        update(
          path,
          e.currentTarget.innerText ?? e.currentTarget.textContent ?? "",
        )
      }
      className="cv-editable whitespace-pre-wrap break-words outline-offset-2"
      style={{
        minWidth: editable ? "1em" : undefined,
        display: "inline",
      }}
    >
      {value}
    </span>
  );
  const save = () => {
    saveUserCv(getCurrentUser().id, cvData);
    setSaved(true);
  };
  const name = cvData.fullName.replace(/[^a-zA-Z0-9_-]+/g, "_") || "CV";
  const sections = cvSections(cvData, kind);
  const addSection = () =>
    onChange?.({
      ...cvData,
      customSections: [
        ...(cvData.customSections || []),
        { title: "New Section", content: [""] },
      ],
    });
  return (
    <div className="cv-preview space-y-4">
      <div
        className="no-print flex flex-wrap gap-2 items-center bg-white border border-slate-300 rounded-xl p-3"
        role="toolbar"
        aria-label="CV actions"
      >
        <strong className="text-slate-950 mr-auto">{template.name}</strong>
        <Button
          size="sm"
          onClick={() =>
            downloadCvPdf(`${name}_${kind}.pdf`, cvData, template.id)
          }
        >
          Download PDF
        </Button>
        <Button
          size="sm"
          variant="white"
          onClick={() =>
            downloadCvDocx(`${name}_${kind}.docx`, cvData, template.id)
          }
        >
          Download Word
        </Button>
        <Button size="sm" variant="white" onClick={() => window.print()}>
          Print
        </Button>
        {editable && (
          <>
            <Button size="sm" variant="white" onClick={save}>
              {saved ? "Saved" : "Save CV"}
            </Button>
            <Button size="sm" variant="white" onClick={addSection}>
              Add section
            </Button>
          </>
        )}
      </div>
      {editable && (
        <details className="no-print bg-white border border-slate-300 rounded-xl p-3 text-sm">
          <summary className="cursor-pointer font-bold text-slate-900">
            Edit all CV details
          </summary>
          <p className="my-2 text-slate-700">
            Edit structured details below. Empty fields stay empty in every
            export.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(
              [
                "fullName",
                "title",
                "email",
                "phone",
                "location",
                "websiteUrl",
                "linkedinUrl",
                "githubUrl",
              ] as const
            ).map((key) => (
              <label key={key} className="block text-slate-800">
                {key}
                <input
                  aria-label={key}
                  value={cvData[key] || ""}
                  onChange={(e) => update([key], e.target.value)}
                  className="block w-full border border-slate-400 rounded p-2 bg-white text-slate-950"
                />
              </label>
            ))}
          </div>
          {(
            [
              {
                key: "experience",
                fields: ["company", "role", "period", "bullets"],
                empty: { company: "", role: "", period: "", bullets: [] },
              },
              {
                key: "education",
                fields: ["institution", "degree", "year", "gpa", "highlights"],
                empty: { institution: "", degree: "", year: "" },
              },
              {
                key: "projects",
                fields: ["name", "tools", "link", "bullets"],
                empty: { name: "", tools: "", bullets: [] },
              },
              {
                key: "skills",
                fields: ["category", "items"],
                empty: { category: "", items: [] },
              },
              {
                key: "languages",
                fields: ["language", "proficiency", "cefrLevel"],
                empty: { language: "", proficiency: "" },
              },
              {
                key: "customSections",
                fields: ["title", "content"],
                empty: { title: "", content: [] },
              },
            ] as const
          ).map((group) => (
            <fieldset
              key={group.key}
              className="mt-4 border-t border-slate-300 pt-3"
            >
              <legend className="font-bold text-slate-950">{group.key}</legend>
              {(cvData[group.key] || []).map((item, index) => (
                <div
                  key={index}
                  className="grid sm:grid-cols-2 gap-2 my-3 border border-slate-300 rounded p-3"
                >
                  {group.fields.map((key) => {
                    const value =
                      (item as unknown as Record<string, string | string[]>)[
                        key
                      ] || "";
                    const lines = ["bullets", "items", "content"].includes(key);
                    return (
                      <label key={key} className="block text-slate-800">
                        {key}
                        {lines ? (
                          <textarea
                            aria-label={`${group.key} ${index + 1} ${key}`}
                            value={
                              Array.isArray(value) ? value.join("\n") : value
                            }
                            onChange={(e) =>
                              update(
                                [group.key, index, key],
                                e.target.value.split("\n"),
                              )
                            }
                            className="block w-full border border-slate-400 p-2 rounded bg-white text-slate-950"
                          />
                        ) : (
                          <input
                            aria-label={`${group.key} ${index + 1} ${key}`}
                            value={value as string}
                            onChange={(e) =>
                              update([group.key, index, key], e.target.value)
                            }
                            className="block w-full border border-slate-400 p-2 rounded bg-white text-slate-950"
                          />
                        )}
                      </label>
                    );
                  })}
                  <Button
                    size="sm"
                    variant="white"
                    onClick={() =>
                      onChange?.({
                        ...cvData,
                        [group.key]: cvData[group.key]?.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    Remove entry
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="white"
                onClick={() =>
                  onChange?.({
                    ...cvData,
                    [group.key]: [
                      ...(cvData[group.key] || []),
                      structuredClone(group.empty),
                    ],
                  })
                }
              >
                Add {group.key}
              </Button>
            </fieldset>
          ))}
          <label className="block mt-4 text-slate-800">
            Certifications (one per line)
            <textarea
              value={(cvData.certifications || []).join("\n")}
              onChange={(e) =>
                update(["certifications"], e.target.value.split("\n"))
              }
              className="block w-full border border-slate-400 p-2 rounded bg-white text-slate-950"
            />
          </label>
        </details>
      )}
      <article
        id="cv-printable-area"
        data-cv-template={kind}
        className="cv-document bg-white border border-slate-300 shadow-lg mx-auto text-slate-900"
        style={{
          maxWidth: "595.28pt",
          padding: "40pt",
          fontFamily: style.font,
          fontSize: "9pt",
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}
      >
        <div
          className="cv-heading"
          style={{
            textAlign: style.centered ? "center" : "left",
            ...(style.banner
              ? {
                  background: style.accent,
                  color: "white",
                  margin: "-40pt -40pt 14pt",
                  padding: "26pt 40pt 18pt",
                }
              : {}),
          }}
        >
          <h1
            style={{
              fontSize: "22pt",
              lineHeight: 1.4,
              fontWeight: 700,
              color: style.banner ? "white" : style.accent,
              textTransform: style.banner ? "uppercase" : undefined,
            }}
          >
            {field(cvData.fullName, ["fullName"], "Candidate name")}
          </h1>
          <p style={{ fontSize: "11pt", lineHeight: 1.4 }}>
            {field(cvData.title, ["title"], "Professional title")}
          </p>
        </div>
        <div
          style={{
            textAlign: style.centered ? "center" : "left",
            fontSize: "8.5pt",
          }}
        >
          {[cvData.email, cvData.phone, cvData.location]
            .filter(Boolean)
            .join(" | ")}
        </div>
        <div
          style={{
            textAlign: style.centered ? "center" : "left",
            fontSize: "8pt",
          }}
        >
          {[cvData.websiteUrl, cvData.linkedinUrl, cvData.githubUrl]
            .filter(Boolean)
            .join(" | ")}
        </div>
        {sections.map((section, i) => (
          <section
            key={`${i}-${section.title}`}
            className="cv-section"
            style={{ marginTop: "18pt" }}
          >
            <h2
              style={{
                fontSize: "10pt",
                fontWeight: 700,
                color: style.accent,
                borderBottom: `0.6pt solid ${style.accent}`,
                paddingBottom: "4pt",
                marginBottom: "6pt",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </h2>
            {section.lines.map((line, j) => (
              <div
                key={j}
                className="cv-line"
                style={{
                  marginBottom: "3pt",
                  fontWeight: line.kind === "title" ? 700 : 400,
                  fontSize: line.kind === "title" ? "10pt" : "9pt",
                  color: line.kind === "detail" ? style.accent : undefined,
                  paddingLeft: line.kind === "bullet" ? "10pt" : undefined,
                }}
              >
                {line.kind === "bullet" && "• "}
                {line.path
                  ? field(line.text, line.path, `${section.title} ${j + 1}`)
                  : line.text}
              </div>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
