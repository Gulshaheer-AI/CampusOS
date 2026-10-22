/**
 * CampusOS Pure Client-Side ZIP Archive Generator
 * Standard PKZIP 2.04g compatible binary builder without external dependencies.
 * Produces 100% valid, extractable ZIP archives for portfolio codebases and DOCX files.
 */

// Precomputed CRC-32 Table
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

export function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  content: string | Uint8Array;
}

/**
 * Encodes text or returns Uint8Array directly
 */
function toUint8Array(input: string | Uint8Array): Uint8Array {
  if (typeof input === "string") {
    return new TextEncoder().encode(input);
  }
  return input;
}

/**
 * Converts JS Date to MS-DOS date and time integers
 */
function getDosDateTime(date: Date = new Date()): { dosTime: number; dosDate: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { dosTime, dosDate };
}

/**
 * Builds a standard PKZIP archive buffer in Uint8Array format
 */
export function generateZipArchive(files: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const { dosTime, dosDate } = getDosDateTime();

  interface PreparedFile {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    localHeaderOffset: number;
  }

  const prepared: PreparedFile[] = [];
  let currentOffset = 0;
  let totalLocalSize = 0;

  // First pass: encode and compute offsets
  for (const file of files) {
    const nameBytes = encoder.encode(file.name.replace(/\\/g, "/"));
    const dataBytes = toUint8Array(file.content);
    const crc = computeCrc32(dataBytes);

    const localHeaderLen = 30 + nameBytes.length;
    const fileTotalLen = localHeaderLen + dataBytes.length;

    prepared.push({
      nameBytes,
      dataBytes,
      crc,
      localHeaderOffset: currentOffset,
    });

    currentOffset += fileTotalLen;
    totalLocalSize += fileTotalLen;
  }

  // Calculate Central Directory size
  let centralDirectorySize = 0;
  for (const p of prepared) {
    centralDirectorySize += 46 + p.nameBytes.length;
  }

  const endOfCentralDirSize = 22;
  const totalArchiveSize = totalLocalSize + centralDirectorySize + endOfCentralDirSize;

  const output = new Uint8Array(totalArchiveSize);
  const view = new DataView(output.buffer);

  // Second pass: Write Local File Headers and Data
  let writePos = 0;
  for (const p of prepared) {
    // 0x04034b50 - Local File Header Signature
    view.setUint32(writePos, 0x04034b50, true);
    view.setUint16(writePos + 4, 20, true); // Version needed (2.0)
    view.setUint16(writePos + 6, 0x0800, true); // UTF-8 filename flag (bit 11)
    view.setUint16(writePos + 8, 0, true); // Compression method: 0 = stored (no compression)
    view.setUint16(writePos + 10, dosTime, true);
    view.setUint16(writePos + 12, dosDate, true);
    view.setUint32(writePos + 14, p.crc, true);
    view.setUint32(writePos + 18, p.dataBytes.length, true); // Compressed size
    view.setUint32(writePos + 22, p.dataBytes.length, true); // Uncompressed size
    view.setUint16(writePos + 26, p.nameBytes.length, true); // Filename length
    view.setUint16(writePos + 28, 0, true); // Extra field length

    output.set(p.nameBytes, writePos + 30);
    output.set(p.dataBytes, writePos + 30 + p.nameBytes.length);

    writePos += 30 + p.nameBytes.length + p.dataBytes.length;
  }

  const centralDirectoryStartOffset = writePos;

  // Third pass: Write Central Directory Headers
  for (const p of prepared) {
    // 0x02014b50 - Central Directory Header Signature
    view.setUint32(writePos, 0x02014b50, true);
    view.setUint16(writePos + 4, 20, true); // Version made by (2.0)
    view.setUint16(writePos + 6, 20, true); // Version needed to extract (2.0)
    view.setUint16(writePos + 8, 0x0800, true); // UTF-8 filename flag
    view.setUint16(writePos + 10, 0, true); // Compression: stored
    view.setUint16(writePos + 12, dosTime, true);
    view.setUint16(writePos + 14, dosDate, true);
    view.setUint32(writePos + 16, p.crc, true);
    view.setUint32(writePos + 20, p.dataBytes.length, true);
    view.setUint32(writePos + 24, p.dataBytes.length, true);
    view.setUint16(writePos + 28, p.nameBytes.length, true);
    view.setUint16(writePos + 30, 0, true); // Extra field length
    view.setUint16(writePos + 32, 0, true); // Comment length
    view.setUint16(writePos + 34, 0, true); // Disk number start
    view.setUint16(writePos + 36, 0, true); // Internal attributes
    view.setUint32(writePos + 38, 0, true); // External attributes
    view.setUint32(writePos + 42, p.localHeaderOffset, true); // Relative offset of local header

    output.set(p.nameBytes, writePos + 46);
    writePos += 46 + p.nameBytes.length;
  }

  // Fourth pass: End of Central Directory Record (EOCD)
  // 0x06054b50 - EOCD Signature
  view.setUint32(writePos, 0x06054b50, true);
  view.setUint16(writePos + 4, 0, true); // Number of this disk
  view.setUint16(writePos + 6, 0, true); // Disk where central directory starts
  view.setUint16(writePos + 8, prepared.length, true); // Records on this disk
  view.setUint16(writePos + 10, prepared.length, true); // Total records in central dir
  view.setUint32(writePos + 12, centralDirectorySize, true); // Size of central dir
  view.setUint32(writePos + 16, centralDirectoryStartOffset, true); // Offset of central dir
  view.setUint16(writePos + 20, 0, true); // Comment length

  return output;
}

/**
 * Creates a valid ZIP Blob
 */
export function createZipBlob(files: ZipEntry[]): Blob {
  const archive = generateZipArchive(files);
  return new Blob([archive.buffer as ArrayBuffer], { type: "application/zip" });
}

/**
 * Triggers a download in the client's browser
 */
export function downloadZipArchive(fileName: string, files: ZipEntry[]): void {
  const safeName = fileName.endsWith(".zip") ? fileName : `${fileName}.zip`;
  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Generates an authentic starter codebase ZIP for any Portfolio project
 */
export function generateProjectZip(project: {
  title: string;
  description?: string;
  tags?: string[];
  demoUrl?: string;
  githubUrl?: string;
}): Blob {
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const readmeContent = `# ${project.title}

${project.description || "CampusOS Verified Portfolio Project"}

## Tech Stack
${(project.tags || ["TypeScript", "Next.js"]).map((t) => `- ${t}`).join("\n")}

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## Links
${project.demoUrl ? `- **Live Demo**: ${project.demoUrl}` : ""}
${project.githubUrl ? `- **GitHub**: ${project.githubUrl}` : ""}

---
*Verified on CampusOS Academic & Career Platform.*
`;

  const packageJson = JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      description: project.description || "CampusOS Verified Project",
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "^14.2.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
      },
    },
    null,
    2
  );

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #FAF9FE; color: #1E194B; margin: 40px; }
    h1 { color: #6653E6; }
    .badge { background: #EAE6FD; color: #5542D0; padding: 4px 10px; border-radius: 999px; font-weight: bold; }
  </style>
</head>
<body>
  <span class="badge">CampusOS Verified</span>
  <h1>${project.title}</h1>
  <p>${project.description || ""}</p>
</body>
</html>`;

  return createZipBlob([
    { name: "README.md", content: readmeContent },
    { name: "package.json", content: packageJson },
    { name: "index.html", content: indexHtml },
    { name: "src/main.js", content: `console.log("Initialized ${project.title}");` },
  ]);
}
