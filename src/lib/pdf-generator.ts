/** Searchable PDF 1.4 export with flowing, bounded page layout. */

import { CvData } from "@/types";

import { getTemplateKind, cvSections, CV_STYLES } from "./cv-layout";
export { getTemplateKind } from "./cv-layout";
export type { CvTemplateKind } from "./cv-layout";

function cleanMojibake(str: string = ""): string {
  return (str || "")
    .replace(/â€¢/g, " • ")
    .replace(/â€[—–-]/g, " - ")
    .replace(/â€/g, " - ")
    .replace(/â[^\w\s]/g, " ")
    .replace(/•/g, " • ");
}

function escapePdf(str: string = ""): string {
  const cleaned = cleanMojibake(str);
  let res = "";
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned.charAt(i);
    const code = cleaned.charCodeAt(i);
    if (ch === "\\") res += "\\\\";
    else if (ch === "(") res += "\\(";
    else if (ch === ")") res += "\\)";
    else if (ch === "•")
      res += "\\225"; // WinAnsi bullet
    else if (ch === "–")
      res += "\\226"; // WinAnsi en-dash
    else if (ch === "—")
      res += "\\227"; // WinAnsi em-dash
    else if (code === 8216 || code === 8217) res += "'";
    else if (code === 8220 || code === 8221) res += '"';
    else if (code === 8230) res += "...";
    else if (code >= 32 && code <= 126) res += ch;
    else if (code >= 160 && code <= 255) {
      res += "\\" + code.toString(8).padStart(3, "0");
    } else {
      res += " ";
    }
  }
  return res;
}

export function generateCvPdf(
  cvData: CvData,
  templateName: string = "Standard ATS",
): Blob {
  const templateKind = getTemplateKind(templateName);

  // Flow layout: every rendered line reserves its own height, including long tokens.
  const pages: string[] = [];
  let currentCommands: string[] = [];
  let y = 790;
  const serif = templateKind === "us-harvard-ats";
  const regularFont = serif ? "F4" : "F1";
  const boldFont = serif ? "F5" : "F2";
  const hex = CV_STYLES[templateKind].accent.slice(1);
  const accent = [0, 2, 4].map((offset) =>
    Number((parseInt(hex.slice(offset, offset + 2), 16) / 255).toFixed(3)),
  ) as [number, number, number];
  const ink: [number, number, number] = [0.06, 0.09, 0.16];
  const ensureSpace = (height: number) => {
    if (y - height < 50) {
      pages.push(currentCommands.join("\n"));
      currentCommands = [];
      y = 790;
    }
  };
  // Conservative font-width upper bound (in ems); never assume fixed character count.
  const width = (text: string, size: number) =>
    Array.from(text).reduce(
      (n, c) =>
        n +
        (/\s/.test(c)
          ? 0.28
          : /[ilI.,'!:;|]/.test(c)
            ? 0.34
            : /[mwMW@%]/.test(c)
              ? 1
              : /[A-Z]/.test(c)
                ? 0.78
                : 0.62),
      0,
    ) * size;
  const wrap = (text: string, size: number, available: number) => {
    const lines: string[] = [];
    for (const paragraph of text.split(/\r?\n/)) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (line && width(line + " " + word, size) > available) {
          lines.push(line);
          line = "";
        }
        let piece = "";
        for (const c of word) {
          if (width(piece + c, size) > available) {
            if (line) {
              lines.push(line);
              line = "";
            }
            lines.push(piece);
            piece = "";
          }
          piece += c;
        }
        line = line ? line + " " + piece : piece;
      }
      if (line) lines.push(line);
    }
    return lines;
  };
  const text = (
    value: string = "",
    bold = false,
    size = 9,
    color = ink,
    indent = 0,
    center = false,
  ) => {
    const leading = Math.max(13, size * 1.4);
    for (const line of wrap(value, size, 515 - indent)) {
      ensureSpace(leading);
      const x = center
        ? Math.max(40, (595.28 - width(line, size)) / 2)
        : 40 + indent;
      currentCommands.push(
        `BT /${bold ? boldFont : regularFont} ${size} Tf ${color.join(" ")} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdf(line)}) Tj ET`,
      );
      y -= leading;
    }
  };
  const heading = (label: string) => {
    ensureSpace(48);
    y -= 12;
    text(label.toUpperCase(), true, 10, accent);
    currentCommands.push(
      `.6 w ${accent.join(" ")} RG 40 ${(y + 8).toFixed(2)} m 555 ${(y + 8).toFixed(2)} l S`,
    );
    y -= 6;
  };
  if (templateKind === "executive-corporate") {
    const nameLines = wrap(cvData.fullName.toUpperCase(), 22, 515).length;
    const titleLines = wrap(cvData.title, 11, 515).length;
    const height = Math.max(100, 45 + nameLines * 31 + titleLines * 16);
    currentCommands.push(
      `${accent.join(" ")} rg 0 ${(841.89 - height).toFixed(2)} 595.28 ${height} re f`,
    );
    text(cvData.fullName.toUpperCase(), true, 22, [1, 1, 1]);
    text(cvData.title, false, 11, [1, 1, 1]);
    y = Math.min(y - 12, 841.89 - height - 18);
  } else {
    text(cvData.fullName, true, 22, accent, 0, serif);
    text(cvData.title, true, 11, ink, 0, serif);
  }
  text(
    [cvData.email, cvData.phone, cvData.location].filter(Boolean).join(" | "),
    false,
    8.5,
    ink,
    0,
    serif,
  );
  text(
    [cvData.websiteUrl, cvData.linkedinUrl, cvData.githubUrl]
      .filter(Boolean)
      .join(" | "),
    false,
    8,
    ink,
    0,
    serif,
  );
  for (const section of cvSections(cvData, templateKind)) {
    heading(section.title);
    for (const line of section.lines) {
      if (line.kind === "title") ensureSpace(40);
      text(
        (line.kind === "bullet" ? "• " : "") + line.text,
        line.kind === "title",
        line.kind === "title" ? 10 : 9,
        line.kind === "detail" ? accent : ink,
        line.kind === "bullet" ? 10 : 0,
      );
    }
  }
  pages.push(currentCommands.join("\n"));

  // Build PDF 1.4 Binary Structure
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];

  const addObj = (content: string) => {
    offsets.push(new TextEncoder().encode(out).length);
    out += content + "\n";
  };

  // Obj 1: Catalog
  addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  const pageCount = pages.length;
  const fontObjStart = 3 + pageCount * 2;
  const f1Obj = fontObjStart;
  const f2Obj = fontObjStart + 1;
  const f3Obj = fontObjStart + 2;
  const f4Obj = fontObjStart + 3;
  const f5Obj = fontObjStart + 4;

  // Obj 2: Pages tree
  const kids: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    kids.push(`${3 + i * 2} 0 R`);
  }
  addObj(
    `2 0 obj\n<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageCount} >>\nendobj`,
  );

  // Obj 3..N: Page and Stream pairs
  for (let i = 0; i < pageCount; i++) {
    const pageNumObj = 3 + i * 2;
    const streamNumObj = pageNumObj + 1;
    const streamBytes = new TextEncoder().encode(pages[i]);

    addObj(
      `${pageNumObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${streamNumObj} 0 R /Resources << /Font << /F1 ${f1Obj} 0 R /F2 ${f2Obj} 0 R /F3 ${f3Obj} 0 R /F4 ${f4Obj} 0 R /F5 ${f5Obj} 0 R >> >> >>\nendobj`,
    );
    addObj(
      `${streamNumObj} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${pages[i]}\nendstream\nendobj`,
    );
  }

  // Font definitions with WinAnsiEncoding (clean bullet & dash display)
  addObj(
    `${f1Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`,
  );
  addObj(
    `${f2Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`,
  );
  addObj(
    `${f3Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj`,
  );
  addObj(
    `${f4Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj`,
  );
  addObj(
    `${f5Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>\nendobj`,
  );

  // Cross-reference table
  const startxref = new TextEncoder().encode(out).length;
  out += `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    out += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const bytes = new TextEncoder().encode(out);
  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadCvPdf(
  fileName: string,
  cvData: CvData,
  templateName: string = "Standard ATS",
): void {
  const safeName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  const blob = generateCvPdf(cvData, templateName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
