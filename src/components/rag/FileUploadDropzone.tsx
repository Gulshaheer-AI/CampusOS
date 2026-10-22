"use client";

import React, { useState, useRef } from "react";
import {
  UploadedKnowledgeFile,
  chunkTextContent,
  parseCsvIntoChunks,
} from "@/lib/rag-engine";
import { parseDocumentFile, validateFileSize } from "@/lib/rag-parser";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  File,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadDropzoneProps {
  files: UploadedKnowledgeFile[];
  onFilesChange: (files: UploadedKnowledgeFile[]) => void;
  maxFiles?: number;
}

export function FileUploadDropzone({
  files,
  onFilesChange,
  maxFiles = 6,
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedKnowledgeFile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (name: string, mime: string): UploadedKnowledgeFile["type"] => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "") || mime.startsWith("image/")) {
      return "image";
    }
    if (ext === "pdf" || mime.includes("pdf")) return "pdf";
    if (["docx", "doc"].includes(ext || "")) return "word";
    if (["csv", "tsv"].includes(ext || "")) return "csv";
    if (["py", "js", "ts", "jsx", "tsx", "html", "css", "json"].includes(ext || "")) return "code";
    return "text";
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (files.length >= maxFiles) {
      setErrorMsg(`Maximum of ${maxFiles} active documents reached.`);
      return;
    }

    try {
      validateFileSize(file);
    } catch (err: any) {
      setErrorMsg(err.message || "File exceeds 10MB limit.");
      return;
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fileType = getFileType(file.name, file.type);

    if (fileType === "image") {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newFile: UploadedKnowledgeFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          mimeType: file.type || "image/png",
          type: "image",
          uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          imageDataUrl: dataUrl,
          rawText: `[Image Document: ${file.name} - Passed to Multimodal Gemini Vision]`,
          chunks: [
            {
              id: `${fileId}-img-1`,
              fileId,
              fileName: file.name,
              chunkIndex: 1,
              content: `Visual diagram or image asset: ${file.name}. Grounded with Gemini Vision multimodal recognition.`,
              wordCount: 15,
            },
          ],
        };
        onFilesChange([...files, newFile]);
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const parsed = await parseDocumentFile(file);
        const newFile: UploadedKnowledgeFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          type: parsed.type,
          uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          rawText: parsed.text,
          chunks: parsed.chunks,
        };
        onFilesChange([...files, newFile]);
      } catch (err: any) {
        console.error("Failed to parse document:", err);
        setErrorMsg(err.message || `Failed to extract text from ${file.name}.`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const loadSampleDataset = () => {
    const sampleCsv = `Student_ID,Name,Major,Midterm_Score,Homework_Avg,Final_Project,Status
101,Alex Chen,Computer Science,94,98,Approved,Passed
102,Jordan Taylor,Data Science,88,92,Approved,Passed
103,Sarah Vance,Software Eng,96,99,Approved,Passed
104,Liam O'Connor,Cybersecurity,72,78,Needs Revision,In Progress
105,Maya Patel,AI & Robotics,91,95,Approved,Passed`;

    const res = parseCsvIntoChunks(sampleCsv, "sample-csv-1", "CS101_Class_Grades.csv");

    const sampleFile: UploadedKnowledgeFile = {
      id: "sample-csv-1",
      name: "CS101_Class_Grades.csv",
      size: 480,
      mimeType: "text/csv",
      type: "csv",
      uploadedAt: "Just now",
      rawText: sampleCsv,
      chunks: res.chunks,
    };

    onFilesChange([...files.filter((f) => f.id !== "sample-csv-1"), sampleFile]);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.csv,.tsv,.txt,.md,.png,.jpg,.jpeg,.webp,.py,.js,.ts,.json"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 select-none",
          isDragging
            ? "border-brand-purple bg-purple-100/50 scale-[1.01]"
            : "border-purple-200 bg-purple-50/60 hover:border-brand-purple hover:bg-purple-100/40"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-brand-purple shadow-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Drop docs, PDFs, Word, CSVs, or images here
            </span>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Supports .pdf, .docx, .csv, .png, .jpg, .txt, .py (Chunked for RAG semantic search &amp; Vision)
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 font-bold text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Load Sample Buttons */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 font-bold">
          Active Knowledge Files ({files.length}/{maxFiles})
        </span>
        <button
          type="button"
          onClick={loadSampleDataset}
          className="text-[11px] text-brand-purple hover:underline font-bold flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Grades CSV
        </button>
      </div>

      {/* Uploaded Files Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-white text-xs transition-colors hover:border-brand-purple shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {file.type === "image" && file.imageDataUrl ? (
                  <img
                    src={file.imageDataUrl}
                    alt={file.name}
                    className="w-8 h-8 rounded object-cover border border-purple-200 shrink-0"
                  />
                ) : file.type === "csv" ? (
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : file.type === "code" ? (
                  <FileCode className="w-6 h-6 text-brand-purple shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-brand-purple shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                    <span>{file.chunks.length} chunks</span>
                    <span>•</span>
                    <span className="uppercase">{file.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="p-1.5 text-slate-600 hover:text-brand-purple rounded hover:bg-purple-50"
                  title="Inspect Chunks"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 text-slate-600 hover:text-rose-700 rounded hover:bg-rose-50"
                  title="Remove Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Chunks Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-purple" />
                <div>
                  <h3 className="font-black text-slate-950 text-base">{previewFile.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {previewFile.chunks.length} Indexable RAG Chunks • Type: {previewFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewFile(null)}>
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {previewFile.chunks.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 text-xs space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span className="font-mono text-brand-purple font-black">Chunk #{c.chunkIndex}</span>
                    <span>{c.wordCount} words</span>
                  </div>
                  <pre className="font-sans text-slate-950 font-medium whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </pre>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setPreviewFile(null)}>
                Done Inspecting
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
