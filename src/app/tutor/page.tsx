"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  getCurrentUser,
  getConversations,
  saveConversation,
  deleteConversation,
  getStudentNotes,
  getCourses,
} from "@/lib/store";
import {
  TutorConversation,
  TutorMessage,
  TutorStyle,
  UserProfile,
  StudentNote,
  CourseMaterial,
} from "@/types";
import { checkRateLimit } from "@/lib/ai-provider";
import {
  UploadedKnowledgeFile,
  searchKnowledgeChunks,
  parseCsvIntoChunks,
  chunkTextContent,
} from "@/lib/rag-engine";
import { FileUploadDropzone } from "@/components/rag/FileUploadDropzone";
import { MondayOrb } from "@/components/ui/MondayOrb";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Code,
  CheckCircle,
  Copy,
  Lightbulb,
  FileQuestion,
  HelpCircle,
  AlertCircle,
  Terminal,
  Paperclip,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  CheckSquare,
  Square,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TutorPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "intermediate",
  );
  const [style, setStyle] = useState<TutorStyle>("step_by_step");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isRagDrawerOpen, setIsRagDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedKnowledgeFile[]>(
    [],
  );
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<
    Array<CourseMaterial & { courseTitle: string }>
  >([]);
  const [drawerTab, setDrawerTab] = useState<"locker" | "upload">("locker");
  const [activeModelName, setActiveModelName] = useState(
    "gemini-3.1-flash-lite",
  );
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sample dataset on mount
  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    const existing = getConversations(current.id);

    if (existing.length > 0) {
      setConversations(existing);
      setActiveConvId(existing[0].id);
      setSubject(existing[0].subject);
      setLevel(existing[0].level);
      setStyle(existing[0].style);
    } else {
      const initialConv: TutorConversation = {
        id: `conv-${Date.now()}`,
        userId: current.id,
        title: "Binary Search & Algorithmic Invariants",
        subject: "Algorithms",
        level: "intermediate",
        style: "step_by_step",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: "msg-init-1",
            conversationId: `conv-${Date.now()}`,
            role: "assistant",
            content: `Hello ${current.name.split(" ")[0]}! I am Monday AI, your CampusOS academic tutor (powered by Gemini 3.1 Flash Lite with automatic fallback to 3.5 Flash Lite). You can upload documents, PDFs, images, CSVs, or lecture notes to ground my answers in your exact ${current.major || "course"} materials using RAG.`,
            createdAt: new Date().toISOString(),
            suggestedFollowups: [
              "Explain how binary search avoids integer overflow",
              "How do SQL INNER and LEFT joins differ under the hood?",
              "Analyze the uploaded student grades dataset",
            ],
          },
        ],
      };
      saveConversation(initialConv);
      setConversations([initialConv]);
      setActiveConvId(initialConv.id);
    }

    // Load student notes from locker
    const userNotes = getStudentNotes(current.id);
    setStudentNotes(userNotes);

    // Load course materials from enrolled courses
    const enrolled = getCourses().filter((c) => c.isEnrolled);
    const mats = enrolled.flatMap((c) =>
      (c.materials || []).map((m) => ({ ...m, courseTitle: c.title })),
    );
    setCourseMaterials(mats);

    // Seed default knowledge document
    const sampleCsv = `Student_ID,Name,Major,Midterm_Score,Homework_Avg,Final_Project,Status
101,Ahmad Khan,Computer Science & AI,94,98,Approved,Passed
102,Hassan Ali,Software Engineering,88,92,Approved,Passed
103,Zain Tariq,Data Science & Robotics,96,99,Approved,Passed`;

    const csvRes = parseCsvIntoChunks(
      sampleCsv,
      "init-sample-csv",
      "CS101_Class_Grades.csv",
    );

    const sampleDoc: UploadedKnowledgeFile = {
      id: "init-sample-doc",
      name: "Lecture_04_Algorithmic_Invariants.pdf",
      size: 2450000,
      mimeType: "application/pdf",
      type: "pdf",
      uploadedAt: "Pre-indexed",
      chunks: chunkTextContent(
        `Lecture 04: Algorithmic Invariants & Divide-and-Conquer Search.
A loop invariant is a formal predicate that holds true before the loop starts, is preserved by each iteration, and upon termination proves algorithm correctness.
In binary search, the invariant states that if the search target exists in the array, it MUST reside within the closed index range [low, high].
Midpoint computation invariant: To prevent 32-bit signed integer overflow when low + high exceeds 2^31 - 1, always evaluate mid = low + ((high - low) >> 1).
Time complexity: Logarithmic O(log N) as the search space bisects at every step.`,
        "init-sample-doc",
        "Lecture_04_Algorithmic_Invariants.pdf",
      ),
    };

    const sampleCsvDoc: UploadedKnowledgeFile = {
      id: "init-sample-csv",
      name: "CS101_Class_Grades.csv",
      size: 480,
      mimeType: "text/csv",
      type: "csv",
      uploadedAt: "Pre-indexed",
      rawText: sampleCsv,
      chunks: csvRes.chunks,
    };

    let initialFiles = [sampleDoc, sampleCsvDoc];

    // Check if ?noteId= was passed in URL to auto-ground
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const targetNoteId = urlParams.get("noteId");
      if (targetNoteId) {
        const foundNote = userNotes.find((n) => n.id === targetNoteId);
        if (foundNote) {
          const noteDoc: UploadedKnowledgeFile = {
            id: foundNote.id,
            name: foundNote.title,
            size: 1024,
            mimeType: "text/plain",
            type: (foundNote.fileType as any) || "text",
            uploadedAt: "From Locker",
            rawText: foundNote.content,
            chunks: chunkTextContent(
              foundNote.content,
              foundNote.id,
              foundNote.title,
              250,
              40,
            ),
          };
          initialFiles = [noteDoc, ...initialFiles];
          setIsRagDrawerOpen(true);
        }
      }
    }

    setUploadedFiles(initialFiles);
  }, []);

  const isItemActiveInRag = (itemId: string) =>
    uploadedFiles.some((f) => f.id === itemId);

  const toggleNoteInRag = (note: StudentNote) => {
    if (isItemActiveInRag(note.id)) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== note.id));
    } else {
      const noteDoc: UploadedKnowledgeFile = {
        id: note.id,
        name: note.title,
        size: 1024,
        mimeType: "text/plain",
        type: (note.fileType as any) || "text",
        uploadedAt: "From Locker",
        rawText: note.content,
        chunks: chunkTextContent(note.content, note.id, note.title, 250, 40),
      };
      setUploadedFiles((prev) => [noteDoc, ...prev]);
    }
  };

  const toggleMaterialInRag = (
    mat: CourseMaterial & { courseTitle: string },
  ) => {
    if (isItemActiveInRag(mat.id)) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== mat.id));
    } else {
      const content = mat.description || `${mat.title} - ${mat.courseTitle}`;
      const matDoc: UploadedKnowledgeFile = {
        id: mat.id,
        name: mat.title,
        size: 2048,
        mimeType: "text/plain",
        type: mat.type === "pdf" ? "pdf" : "text",
        uploadedAt: mat.courseTitle,
        rawText: content,
        chunks: chunkTextContent(content, mat.id, mat.title, 250, 40),
      };
      setUploadedFiles((prev) => [matDoc, ...prev]);
    }
  };

  const selectAllLockerNotes = () => {
    const newDocs: UploadedKnowledgeFile[] = studentNotes
      .filter((n) => !isItemActiveInRag(n.id))
      .map((n) => ({
        id: n.id,
        name: n.title,
        size: 1024,
        mimeType: "text/plain",
        type: (n.fileType as any) || "text",
        uploadedAt: "From Locker",
        rawText: n.content,
        chunks: chunkTextContent(n.content, n.id, n.title, 250, 40),
      }));
    setUploadedFiles((prev) => [...newDocs, ...prev]);
  };

  const clearAllSelectedNotes = () => {
    const lockerIds = new Set(studentNotes.map((n) => n.id));
    setUploadedFiles((prev) => prev.filter((f) => !lockerIds.has(f.id)));
  };

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isLoading]);

  const handleStartNewConv = () => {
    if (!user) return;
    const newConv: TutorConversation = {
      id: `conv-${Date.now()}`,
      userId: user.id,
      title: "New Tutoring Session",
      subject,
      level,
      style,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          conversationId: `conv-${Date.now()}`,
          role: "assistant",
          content: `New session created for ${subject}. Ask me any question or upload course documents for grounded RAG synthesis.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    saveConversation(newConv);
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const handleDeleteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeConvId === id && remaining.length > 0) {
      setActiveConvId(remaining[0].id);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || !activeConv || isLoading || !user) return;

    // Rate limit check
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      setRateLimitError(
        `Rate limit reached: please wait ${rateCheck.retryAfterSeconds} seconds.`,
      );
      setTimeout(() => setRateLimitError(null), 5000);
      return;
    }

    const userMessage: TutorMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    let newTitle = activeConv.title;
    if (activeConv.messages.filter((m) => m.role === "user").length === 0) {
      newTitle = text.slice(0, 35) + (text.length > 35 ? "..." : "");
    }

    const updatedConv: TutorConversation = {
      ...activeConv,
      title: newTitle,
      subject,
      level,
      style,
      updatedAt: new Date().toISOString(),
      messages: [...activeConv.messages, userMessage],
    };

    saveConversation(updatedConv);
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c)),
    );
    setInputPrompt("");
    setIsLoading(true);

    try {
      // 1. RAG Retrieval across uploaded knowledge files
      const relevantChunks = searchKnowledgeChunks(text, uploadedFiles, 4).map(
        (r) => ({
          fileName: r.chunk.fileName,
          section: r.chunk.chunkIndex,
          content: r.chunk.content,
        }),
      );

      // 2. Check if an image is in uploaded files
      const attachedImageFile = uploadedFiles.find(
        (f) => f.type === "image" && f.imageDataUrl,
      );
      const attachedImage = attachedImageFile
        ? {
            mimeType: attachedImageFile.mimeType,
            dataBase64: attachedImageFile.imageDataUrl!,
          }
        : undefined;

      // 3. Call server-side API with Gemini 3.1 Flash Lite -> 3.5 Flash Lite auto-cascade
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: updatedConv.id,
          userPrompt: text,
          subject,
          level,
          style,
          history: updatedConv.messages,
          ragChunks: relevantChunks,
          image: attachedImage,
          preferredModel: "gemini-3.1-flash-lite",
        }),
      });

      if (!res.ok) {
        throw new Error(`AI Service returned status ${res.status}`);
      }

      const data = await res.json();
      setActiveModelName(data.modelUsed || "gemini-3.1-flash-lite");
      if (data.fallbackTriggered) {
        setFallbackTriggered(true);
      }

      const finalConv: TutorConversation = {
        ...updatedConv,
        messages: [...updatedConv.messages, data.message],
      };
      saveConversation(finalConv);
      setConversations((prev) =>
        prev.map((c) => (c.id === finalConv.id ? finalConv : c)),
      );
    } catch (err: any) {
      console.warn("Client AI call fallback:", err);
      const errorMessage: TutorMessage = {
        id: `msg-${Date.now()}`,
        conversationId: updatedConv.id,
        role: "assistant",
        content: `Pedagogical Engine fallback active: ${err.message || "Failed to contact upstream model."}`,
        createdAt: new Date().toISOString(),
      };
      const finalConv: TutorConversation = {
        ...updatedConv,
        messages: [...updatedConv.messages, errorMessage],
      };
      saveConversation(finalConv);
      setConversations((prev) =>
        prev.map((c) => (c.id === finalConv.id ? finalConv : c)),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell>
      <h1 className="sr-only">Monday AI Tutor</h1>
      <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-4">
        {/* Left: Conversations Sidebar */}
        <div className="hidden lg:flex flex-col w-72 bg-white border border-purple-100 rounded-3xl p-4 shrink-0 overflow-hidden shadow-clay text-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
              <MondayOrb size="sm" state={isLoading ? "thinking" : "idle"} />
              Monday AI Tutor
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleStartNewConv}
              title="New Conversation"
              className="hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 text-brand-purple" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 mt-3 pr-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConvId(c.id);
                  setSubject(c.subject);
                  setLevel(c.level);
                  setStyle(c.style);
                }}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-2xl text-xs cursor-pointer transition-all group",
                  c.id === activeConvId
                    ? "clay-card-purple text-white font-bold shadow-md"
                    : "text-slate-700 hover:text-brand-purple hover:bg-purple-50/80 font-medium",
                )}
              >
                <div className="truncate flex-1 mr-2">
                  <div className="truncate font-bold">{c.title}</div>
                  <div
                    className={cn(
                      "text-[10px]",
                      c.id === activeConvId
                        ? "text-purple-200"
                        : "text-slate-500",
                    )}
                  >
                    {c.subject} • {c.level}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConv(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Model Status Card */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-[11px] text-slate-700 mt-3 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-950 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-purple" />
                Monday AI Engine
              </span>
              <Badge
                variant="violet"
                className="text-[10px] px-1.5 py-0 font-bold"
              >
                Active
              </Badge>
            </div>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">
              Primary:{" "}
              <strong className="text-brand-purple font-bold">
                3.1 Flash Lite
              </strong>
              <br />
              RPM Fallback:{" "}
              <strong className="text-pink-600 font-bold">
                3.5 Flash Lite
              </strong>
            </p>
            {fallbackTriggered && (
              <div className="text-[10px] text-emerald-700 font-bold pt-1">
                Auto-switched to fallback model ✓
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Chat Area */}
        <div className="min-w-0 flex-1 flex flex-col bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-clay">
          {/* Controls Header: Subject, Level, Style & RAG Drawer Toggle */}
          <div className="p-3 border-b border-purple-100 bg-purple-50/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-800 font-bold">Topic:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-white border border-purple-200 rounded-xl px-2.5 py-1 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Algorithms">Algorithms &amp; Complexity</option>
                <option value="Databases">Databases &amp; SQL</option>
                <option value="Artificial Intelligence">
                  Applied AI &amp; RAG
                </option>
                <option value="Distributed Systems">Distributed Systems</option>
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="bg-white border border-purple-200 rounded-xl px-2.5 py-1 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
              >
                <option value="beginner">Beginner Level</option>
                <option value="intermediate">Intermediate Level</option>
                <option value="advanced">Advanced Level</option>
              </select>

              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="bg-white border border-purple-200 text-brand-purple font-bold rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-brand-purple shadow-sm"
              >
                <option value="step_by_step">Step-by-Step Breakdown</option>
                <option value="beginner">First Principles &amp; Analogy</option>
                <option value="example_based">Concrete Worked Examples</option>
                <option value="visual">Visual / Diagram Model</option>
                <option value="exam_revision">
                  Exam Revision &amp; Pitfalls
                </option>
              </select>
            </div>

            {/* RAG Knowledge Base Toggle Button */}
            <Button
              variant={isRagDrawerOpen ? "primary" : "outline"}
              size="sm"
              onClick={() => setIsRagDrawerOpen(!isRagDrawerOpen)}
              className="text-xs font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
              RAG Files ({uploadedFiles.length})
              {isRagDrawerOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </Button>
          </div>

          {/* Collapsible RAG Document Studio Drawer with Notes Locker Multi-Select */}
          {isRagDrawerOpen && (
            <div className="p-4 bg-purple-50/90 border-b border-purple-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                    RAG Knowledge Base &amp; Notes Locker Grounding
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Active Grounded Files: {uploadedFiles.length} • Monday AI
                    grounds answers strictly in these materials.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-purple-200 bg-white p-0.5 text-xs font-bold shadow-sm">
                    <button
                      type="button"
                      onClick={() => setDrawerTab("locker")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-colors",
                        drawerTab === "locker"
                          ? "bg-brand-purple text-white shadow-sm"
                          : "text-slate-700 hover:text-brand-purple",
                      )}
                    >
                      <FolderOpen className="w-3.5 h-3.5 inline mr-1" />
                      Notes Locker ({studentNotes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerTab("upload")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-colors",
                        drawerTab === "upload"
                          ? "bg-brand-purple text-white shadow-sm"
                          : "text-slate-700 hover:text-brand-purple",
                      )}
                    >
                      <Paperclip className="w-3.5 h-3.5 inline mr-1" />
                      Upload Files
                    </button>
                  </div>
                  <Badge
                    variant="violet"
                    className="font-mono text-[10px] font-bold"
                  >
                    Model: {activeModelName}
                  </Badge>
                </div>
              </div>

              {drawerTab === "locker" ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Select Notes to Inject into Active Conversation Context:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllLockerNotes}
                        className="text-[11px] font-bold text-brand-purple hover:underline"
                      >
                        Select All Notes
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={clearAllSelectedNotes}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Clear Locker Selection
                      </button>
                    </div>
                  </div>

                  {studentNotes.length === 0 && courseMaterials.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-purple-200 bg-white/60 text-center text-xs text-slate-500">
                      No personal notes or course materials found. Switch to
                      &ldquo;Upload Files&rdquo; or save notes in your Dashboard
                      Locker.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                      {/* Personal Notes */}
                      {studentNotes.map((note) => {
                        const active = isItemActiveInRag(note.id);
                        return (
                          <div
                            key={note.id}
                            onClick={() => toggleNoteInRag(note)}
                            className={cn(
                              "p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none shadow-sm",
                              active
                                ? "bg-white border-brand-purple ring-1 ring-brand-purple/30 text-slate-950"
                                : "bg-white/70 border-purple-100 hover:border-purple-300 text-slate-700",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => {}} // handled by parent onClick
                              className="mt-0.5 rounded text-brand-purple border-purple-300 focus:ring-brand-purple pointer-events-none"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs truncate text-slate-950">
                                {note.title}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-mono">
                                <span className="uppercase text-brand-purple font-bold">
                                  Locker Note
                                </span>
                                <span>•</span>
                                <span>{note.fileSize || "1.2 KB"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Course Materials */}
                      {courseMaterials.map((mat) => {
                        const active = isItemActiveInRag(mat.id);
                        return (
                          <div
                            key={mat.id}
                            onClick={() => toggleMaterialInRag(mat)}
                            className={cn(
                              "p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none shadow-sm",
                              active
                                ? "bg-white border-brand-purple ring-1 ring-brand-purple/30 text-slate-950"
                                : "bg-white/70 border-purple-100 hover:border-purple-300 text-slate-700",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => {}} // handled by parent onClick
                              className="mt-0.5 rounded text-brand-purple border-purple-300 focus:ring-brand-purple pointer-events-none"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs truncate text-slate-950">
                                {mat.title}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-mono">
                                <span className="uppercase text-emerald-700 font-bold">
                                  Course Material
                                </span>
                                <span>•</span>
                                <span>{mat.size}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <FileUploadDropzone
                  files={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                  maxFiles={6}
                />
              )}
            </div>
          )}

          {rateLimitError && (
            <div className="px-4 py-2.5 bg-rose-50 border-b-2 border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{rateLimitError}</span>
            </div>
          )}

          {/* Messages Feed */}
          <div
            data-testid="chat-messages"
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            {activeConv?.messages.map((msg) => (
              <div
                key={msg.id}
                data-message-role={msg.role}
                className={cn(
                  "flex gap-3 max-w-3xl",
                  msg.role === "user"
                    ? "ml-auto justify-end"
                    : "mr-auto justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <MondayOrb
                    size="sm"
                    state="idle"
                    className="shrink-0 mt-0.5"
                  />
                )}

                <div
                  className={cn(
                    "rounded-2xl p-4 text-xs sm:text-sm leading-relaxed",
                    msg.role === "user"
                      ? "clay-button-primary text-white rounded-tr-none max-w-lg shadow-md font-medium"
                      : "bg-white border border-purple-100 text-slate-900 rounded-tl-none space-y-3 shadow-md",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-line font-medium text-white">
                      {msg.content}
                    </div>
                  )}

                  {/* Code snippet block */}
                  {msg.codeSnippet && !msg.content.includes("```") && (
                    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-inner">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 uppercase font-bold text-[10px] text-purple-300">
                          <Terminal className="w-3.5 h-3.5 text-brand-purple" />
                          {msg.codeSnippet.language}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyCode(msg.codeSnippet!.code, msg.id)
                          }
                          className="hover:text-white transition-colors flex items-center gap-1 text-[11px] text-slate-400"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 text-slate-200 overflow-x-auto leading-normal">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Citations / Source links */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-purple-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800 uppercase text-[10px]">
                        RAG Grounded In:
                      </span>
                      {msg.citations.map((cite, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-brand-purple font-bold"
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-ups */}
                  {msg.suggestedFollowups &&
                    msg.suggestedFollowups.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-purple-100">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                          Monday AI Recommended Next Inquiries
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowups.map((followup, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendMessage(followup)}
                              className="px-2.5 py-1 rounded-full border border-purple-200 bg-purple-50/70 hover:bg-purple-100 hover:border-brand-purple text-brand-purple font-semibold text-[11px] text-left transition-colors shadow-sm"
                            >
                              {followup}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 mr-auto items-center text-xs text-brand-purple font-bold animate-pulse">
                <MondayOrb size="sm" state="thinking" />
                <span>
                  Monday AI is formulating grounded explanation via Gemini 3.1
                  Flash Lite...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Bar */}
          <div className="px-4 py-2 bg-purple-50/70 border-t border-purple-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-700 shrink-0">
              Prompts:
            </span>
            {[
              "Explain with a concrete analogy",
              "Show worked mathematical steps",
              "Query the uploaded CSV dataset",
              "What are the common exam pitfalls?",
              "Give me a visual ASCII diagram",
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl border border-purple-200 bg-white hover:bg-purple-100 hover:text-brand-purple text-slate-800 font-bold text-[11px] transition-colors shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Prompt Input */}
          <div className="p-3 bg-white border-t border-purple-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setIsRagDrawerOpen(!isRagDrawerOpen)}
                className="p-2.5 rounded-xl border border-purple-200 bg-white text-brand-purple hover:bg-purple-50 hover:border-brand-purple transition-colors shadow-sm"
                title="Attach & Manage RAG Documents"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about a lecture topic, query uploaded CSV, or analyze document invariants..."
                className="flex-1 bg-white border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 transition-colors shadow-sm"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={!inputPrompt.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl shrink-0 font-bold shadow-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
