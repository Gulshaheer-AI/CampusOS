import { generateZipArchive } from "./zip-generator";
import { CvData } from "@/types";
import { cvSections, CV_STYLES, getTemplateKind } from "./cv-layout";
export { getTemplateKind } from "./cv-layout";
export type { CvTemplateKind } from "./cv-layout";
const xml = (s: string = "") =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
export function generateCvDocx(
  cv: CvData,
  templateName = "Standard ATS",
): Blob {
  const kind = getTemplateKind(templateName);
  const style = CV_STYLES[kind];
  const accent = style.accent.slice(1);
  const paragraph = (
    value: string,
    size = 18,
    bold = false,
    color = "0F172A",
    heading = false,
    center = false,
    banner = false,
  ) =>
    `<w:p><w:pPr><w:spacing w:before="${heading ? 240 : 0}" w:after="80" w:line="280" w:lineRule="auto"/>${heading ? `<w:keepNext/><w:keepLines/><w:pBdr><w:bottom w:val="single" w:sz="6" w:color="${accent}"/></w:pBdr>` : ""}${center ? '<w:jc w:val="center"/>' : ""}${banner ? `<w:shd w:fill="${accent}"/>` : ""}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="${style.font}" w:hAnsi="${style.font}"/><w:sz w:val="${size}"/><w:color w:val="${color}"/>${bold ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${xml(value)}</w:t></w:r></w:p>`;
  const body = [
    paragraph(
      style.banner ? cv.fullName.toUpperCase() : cv.fullName,
      44,
      true,
      style.banner ? "FFFFFF" : accent,
      false,
      style.centered,
      style.banner,
    ),
    paragraph(
      cv.title,
      22,
      true,
      style.banner ? "FFFFFF" : "0F172A",
      false,
      style.centered,
      style.banner,
    ),
    paragraph(
      [cv.email, cv.phone, cv.location].filter(Boolean).join(" | "),
      17,
      false,
      "0F172A",
      false,
      style.centered,
    ),
    paragraph(
      [cv.websiteUrl, cv.linkedinUrl, cv.githubUrl].filter(Boolean).join(" | "),
      16,
      false,
      "0F172A",
      false,
      style.centered,
    ),
  ];
  for (const section of cvSections(cv, kind)) {
    body.push(paragraph(section.title.toUpperCase(), 20, true, accent, true));
    for (const line of section.lines)
      body.push(
        paragraph(
          (line.kind === "bullet" ? "• " : "") + line.text,
          line.kind === "title" ? 20 : 18,
          line.kind === "title",
          line.kind === "detail" ? accent : "0F172A",
        ),
      );
  }
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join("\n")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="800" w:bottom="1000" w:left="800"/></w:sectPr></w:body></w:document>`;
  const archive = generateZipArchive([
    {
      name: "[Content_Types].xml",
      content:
        '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    },
    {
      name: "_rels/.rels",
      content:
        '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    },
    { name: "word/document.xml", content: document },
  ]);
  return new Blob([archive.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function downloadCvDocx(
  fileName: string,
  cvData: CvData,
  templateName: string = "Standard ATS",
): void {
  const safeName = fileName.endsWith(".docx") ? fileName : `${fileName}.docx`;
  const blob = generateCvDocx(cvData, templateName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
