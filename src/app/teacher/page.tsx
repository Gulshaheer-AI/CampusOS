"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  getCourses,
  saveCourse,
  updateCourse,
  addCourseMaterial,
  deleteCourseMaterial,
  getQuizzes,
  saveQuiz,
  deleteQuiz,
  getAttempts,
  getCurrentUser,
  getStudents,
} from "@/lib/store";
import { Course, CourseModule, CourseMaterial, Quiz, Question, QuizAttempt, UserProfile } from "@/types";
import { saveMaterialFile } from "@/lib/material-storage";
import { parseDocumentFile } from "@/lib/rag-parser";
import { generateQuizFromText } from "@/lib/rag-engine";
import {
  GraduationCap,
  Plus,
  BookOpen,
  FileQuestion,
  Users,
  BarChart3,
  Download,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  FileUp,
  Share2,
  Check,
  AlertCircle,
  FileText,
  UploadCloud,
  X,
  Layers,
  FileCode,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherStudioPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Create Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("Computer Science");
  const [newCourseLevel, setNewCourseLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");

  // Edit Course Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialType, setNewMaterialType] = useState<"pdf" | "notes" | "code" | "link">("notes");
  const [newMaterialDesc, setNewMaterialDesc] = useState("");
  const [materialFile, setMaterialFile] = useState<{ name: string; size: string; storageKey: string } | null>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Create/Edit Quiz Modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [quizSubject, setQuizSubject] = useState("Algorithms");
  const [quizDifficulty, setQuizDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [quizDuration, setQuizDuration] = useState(15);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizDraftQuestions, setQuizDraftQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Notes to Quiz Generator
  const [notesInputText, setNotesInputText] = useState("");
  const [uploadedNotesFile, setUploadedNotesFile] = useState<{ name: string; size: string } | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const notesFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = getCurrentUser();
    const ownQuizzes = getQuizzes().filter(q => q.creatorId === current.id && !q.isPractice);
    const quizIds = new Set(ownQuizzes.map(q => q.id));
    setUser(current);
    setCourses(getCourses().filter(c => c.instructorId === current.id));
    setQuizzes(ownQuizzes);
    setAttempts(getAttempts().filter(a => quizIds.has(a.quizId)));
    setStudents(getStudents());
  }, []);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle || !user) return;

    const course: Course = {
      id: `course-${Date.now()}`,
      code: newCourseCode.toUpperCase().trim(),
      title: newCourseTitle.trim(),
      description: newCourseDesc.trim() || "Course syllabus and assessment modules.",
      instructorId: user.id,
      instructorName: user.name,
      enrolledStudentsCount: 1,
      level: newCourseLevel,
      category: newCourseCategory,
      classCode: `${newCourseCode.toUpperCase().trim()}-${Math.floor(100 + Math.random() * 900)}`,
      isEnrolled: true,
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: "Module 1: Foundations & Architecture",
          order: 1,
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: "Course Overview & Key Invariants",
              durationMinutes: 20,
              type: "reading",
              summary: "Fundamental principles and course expectations.",
              content: "Welcome to the course. Here we establish formal invariant proofs, theoretical runtime bounds, and practical implementation paradigms.",
            },
          ],
        },
      ],
      materials: [
        {
          id: `mat-${Date.now()}-1`,
          courseId: `course-${Date.now()}`,
          title: "Syllabus & Course Learning Outcomes",
          type: "pdf",
          size: "1.2 MB",
          uploadDate: new Date().toISOString().slice(0, 10),
          description: "Formal syllabus, lecture timetable, grading rubrics, and recommended readings.",
        },
      ],
    };

    saveCourse(course);
    setCourses(getCourses().filter(c => c.instructorId === getCurrentUser().id));
    setShowCourseModal(false);
    setNewCourseCode("");
    setNewCourseTitle("");
    setNewCourseDesc("");
  };

  const handleSaveEditedCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    updateCourse(editingCourse);
    setCourses(getCourses().filter(c => c.instructorId === getCurrentUser().id));
    setEditSuccessMsg("Course updated successfully!");
    setTimeout(() => {
      setEditSuccessMsg(null);
      setEditingCourse(null);
    }, 1200);
  };

  const handleAddModuleToEditingCourse = () => {
    if (!editingCourse || !newModuleTitle.trim()) return;

    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      title: newModuleTitle.trim(),
      order: (editingCourse.modules?.length || 0) + 1,
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          title: `${newModuleTitle.trim()} - Core Concepts`,
          durationMinutes: 25,
          type: "reading",
          summary: "Core theoretical definitions and principles.",
          content: "Detailed lecture material covering mathematical proofs, architectural invariants, and real-world system applications.",
        },
      ],
    };

    setEditingCourse({
      ...editingCourse,
      modules: [...(editingCourse.modules || []), newMod],
    });
    setNewModuleTitle("");
  };

  const handleMaterialFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    try {
      const storageKey = `material-${crypto.randomUUID()}`;
      await saveMaterialFile(storageKey, file);
      setMaterialFile({ name: file.name, size: sizeStr, storageKey });
      if (!newMaterialTitle.trim()) setNewMaterialTitle(file.name);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save upload. Please retry.");
    }
  };

  const handleAddMaterialToEditingCourse = () => {
    if (!editingCourse || !newMaterialTitle.trim()) return;

    const newMat: CourseMaterial = {
      id: `mat-${Date.now()}`,
      courseId: editingCourse.id,
      title: newMaterialTitle.trim(),
      type: newMaterialType,
      size: materialFile ? materialFile.size : "1.8 MB",
      uploadDate: new Date().toISOString().slice(0, 10),
      description: newMaterialDesc.trim() || "Uploaded lecture reading material and reference notes.",
      fileName: materialFile?.name,
      fileStorageKey: materialFile?.storageKey,
    };

    setEditingCourse({
      ...editingCourse,
      materials: [...(editingCourse.materials || []), newMat],
    });
    setNewMaterialTitle("");
    setNewMaterialDesc("");
    setMaterialFile(null);
  };

  const handleDeleteMaterialFromEditingCourse = (materialId: string) => {
    if (!editingCourse) return;
    deleteCourseMaterial(editingCourse.id, materialId);
    setEditingCourse({
      ...editingCourse,
      materials: (editingCourse.materials || []).filter((m) => m.id !== materialId),
    });
    setCourses(getCourses().filter(c => c.instructorId === getCurrentUser().id));
  };

  // Notes file upload for quiz drafting (PDF, DOCX, CSV, TXT)
  const handleNotesFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseDocumentFile(file);
      setNotesInputText(parsed.text);
      setUploadedNotesFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
    } catch (err: any) {
      console.warn("RAG Parser notice, falling back to FileReader:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        setNotesInputText((event.target?.result as string) || "");
        setUploadedNotesFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateAiQuizFromNotes = async () => {
    setIsGeneratingDraft(true);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceNotes: notesInputText || "University lecture on algorithmic invariants and system design.",
          topic: quizSubject,
          difficulty: quizDifficulty,
          questionCount: 3,
        }),
      });

      const data = await res.json();
      let newQuestions: Question[] = [];

      if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        newQuestions = data.questions.map((q: Question) => ({
          ...q,
          points: q.points || 10,
        }));
        if (data.title && !quizTitle) {
          setQuizTitle(data.title);
        }
      } else {
        // High-fidelity local grounded fallback directly from lecture notes
        const localGenerated = generateQuizFromText(notesInputText || quizSubject, quizSubject, quizDifficulty, 3);
        newQuestions = localGenerated.questions;
        if (!quizTitle) setQuizTitle(localGenerated.title);
      }

      setQuizDraftQuestions((prev) => {
        const combined = [...prev, ...newQuestions];
        setSelectedQuestionIds(new Set(combined.map((q) => q.id)));
        return combined;
      });
    } catch (err) {
      console.warn("Quiz generation error, engaging grounded local generator:", err);
      const localGenerated = generateQuizFromText(notesInputText || quizSubject, quizSubject, quizDifficulty, 3);
      setQuizDraftQuestions((prev) => {
        const combined = [...prev, ...localGenerated.questions];
        setSelectedQuestionIds(new Set(combined.map((q) => q.id)));
        return combined;
      });
      if (!quizTitle) setQuizTitle(localGenerated.title);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Question Curation Actions
  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllQuestions = () => {
    setSelectedQuestionIds(new Set(quizDraftQuestions.map((q) => q.id)));
  };

  const deselectAllQuestions = () => {
    setSelectedQuestionIds(new Set());
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuizDraftQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const updateQuestionOption = (id: string, optIndex: number, val: string) => {
    setQuizDraftQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || !q.options) return q;
        const opts = [...q.options];
        opts[optIndex] = val;
        return { ...q, options: opts };
      })
    );
  };

  const updateQuestionCorrectAnswer = (id: string, correctAnswer: number | string) => {
    setQuizDraftQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, correctAnswer } : q)));
  };

  const updateQuestionPoints = (id: string, points: number) => {
    setQuizDraftQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, points: Math.max(1, points) } : q)));
  };

  const updateQuestionExplanation = (id: string, explanation: string) => {
    setQuizDraftQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, explanation } : q)));
  };

  const deleteDraftQuestion = (id: string) => {
    setQuizDraftQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSaveQuiz = () => {
    if (!quizTitle.trim() || !user) return;

    // Filter to curated selected questions only
    const curated = quizDraftQuestions.filter((q) => selectedQuestionIds.has(q.id));
    if (curated.length === 0) {
      alert("Please select at least one curated question for the assessment.");
      return;
    }

    const newQuiz: Quiz = {
      id: `quiz-teacher-${Date.now()}`,
      title: quizTitle.trim(),
      description: quizDesc.trim() || "Faculty assigned course assessment.",
      subject: quizSubject,
      difficulty: quizDifficulty,
      durationMinutes: quizDuration,
      questions: curated,
      creatorId: user.id,
      creatorName: user.name,
      creatorRole: "teacher",
      isDraft: false,
      isPractice: false,
      passingScore: quizPassingScore,
      createdAt: new Date().toISOString(),
    };

    saveQuiz(newQuiz);
    setQuizzes(getQuizzes().filter(q => q.creatorId === getCurrentUser().id && !q.isPractice));
    setShowQuizModal(false);
    setQuizTitle("");
    setQuizDesc("");
    setQuizDraftQuestions([]);
    setSelectedQuestionIds(new Set());
    setNotesInputText("");
    setUploadedNotesFile(null);
  };

  const handleDeleteQuizItem = (id: string) => {
    deleteQuiz(id);
    setQuizzes(getQuizzes().filter(q => q.creatorId === getCurrentUser().id && !q.isPractice));
  };

  const handleExportCSV = () => {
    const headers = "Attempt ID,Student ID,Quiz Title,Score Percentage,Passed,Completed At\n";
    const rows = attempts
      .filter((a) => a.userRole !== "teacher" && !a.isPractice)
      .map(
        (a) =>
          `"${a.id}","${a.userId}","${a.quizTitle}",${a.scorePercentage},${a.passed},"${a.completedAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cohort_assessment_grades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  if (user.role !== "teacher" && user.role !== "admin") {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
          <div className="inline-flex p-3 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Faculty and Administrator privileges are required to access Teacher Studio. You are currently logged in as a student (<strong className="text-slate-900 font-bold">{user.name}</strong>).
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="outline" className="border-purple-200 text-slate-800 font-bold">
                Return to Student Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-6 sm:p-8 relative overflow-hidden text-white shadow-xl rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="cyan" className="font-bold">Faculty Studio</Badge>
                <span className="text-xs text-purple-100 font-semibold">Instructor Portal &amp; Assessment Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Teacher Studio &amp; Course Authoring
              </h1>
              <p className="mt-2 text-sm text-purple-100 max-w-2xl font-medium leading-relaxed">
                Manage courses, edit modules, upload lecture materials, generate AI quizzes from notes, and inspect learning gaps for your students.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={handleExportCSV} className="bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30">
                <Download className="w-4 h-4 mr-1.5 text-white" />
                Export CSV
              </Button>
              <Button size="sm" onClick={() => setShowCourseModal(true)} className="bg-white text-brand-purple hover:bg-purple-50 font-black shadow-md border-none">
                <Plus className="w-4 h-4 mr-1.5 text-brand-purple" />
                New Course
              </Button>
              <Button size="sm" onClick={() => setShowQuizModal(true)} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-black shadow-md border-none">
                <FileQuestion className="w-4 h-4 mr-1.5 text-slate-950" />
                Create Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODAL: CREATE COURSE                                           */}
        {/* ============================================================== */}
        {showCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8 text-slate-900">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-purple" />
                  Create New University Course
                </h3>
                <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      placeholder="e.g. CS220"
                      required
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-mono font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Academic Level
                    </label>
                    <select
                      value={newCourseLevel}
                      onChange={(e) => setNewCourseLevel(e.target.value as any)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-2 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Cloud Infrastructure & Distributed Systems"
                    required
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-medium focus:outline-none focus:border-brand-purple shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                    Category Domain
                  </label>
                  <input
                    type="text"
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    placeholder="Computer Science, Web Development, Databases"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-medium focus:outline-none focus:border-brand-purple shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                    Description &amp; Syllabus Overview
                  </label>
                  <textarea
                    rows={3}
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    placeholder="Course objectives, prerequisites, and learning outcomes..."
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-medium focus:outline-none focus:border-brand-purple shadow-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-purple-100">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowCourseModal(false)} className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold shadow-md">
                    Publish Course
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: EDIT COURSE & UPLOAD LECTURE MATERIALS                  */}
        {/* ============================================================== */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 text-slate-900">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div>
                  <Badge variant="violet" className="text-[10px] mb-1 font-mono font-bold">{editingCourse.code}</Badge>
                  <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-brand-purple" />
                    Edit Course Syllabus &amp; Materials
                  </h3>
                </div>
                <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditedCourse} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">Title</label>
                    <input
                      type="text"
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">Category</label>
                    <input
                      type="text"
                      value={editingCourse.category}
                      onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">Description</label>
                  <textarea
                    rows={2}
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-medium focus:outline-none focus:border-brand-purple shadow-sm"
                  />
                </div>

                {/* Modules Editor Section */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 text-xs">
                      <Layers className="w-3.5 h-3.5 text-brand-purple" />
                      Modules ({editingCourse.modules?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {editingCourse.modules?.map((m, idx) => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between text-xs shadow-sm">
                        <span className="font-bold text-slate-950">Module {idx + 1}: {m.title}</span>
                        <span className="text-slate-600 text-[11px] font-mono font-semibold">{m.lessons.length} Lessons</span>
                      </div>
                    ))}
                  </div>

                  {/* Add New Module Input */}
                  <div className="flex gap-2 pt-1 border-t border-purple-200">
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="New module title (e.g. Distributed Consensus & Raft)..."
                      className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddModuleToEditingCourse}
                      disabled={!newModuleTitle.trim()}
                      className="text-xs font-bold"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Module
                    </Button>
                  </div>
                </div>

                {/* Lecture Materials Upload Section */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                  <span className="font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-brand-purple" />
                    Lecture Notes &amp; Student Materials ({editingCourse.materials?.length || 0})
                  </span>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {editingCourse.materials?.map((mat) => (
                      <div key={mat.id} className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between text-xs shadow-sm">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-950 truncate">{mat.title}</div>
                          <div className="text-[10px] text-slate-600 font-mono font-semibold">
                            {mat.type.toUpperCase()} • {mat.size} • {mat.uploadDate || "Recent"}
                            {mat.fileName && <span className="ml-1 text-brand-purple">({mat.fileName})</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="violet" className="text-[10px] font-bold">Active</Badge>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterialFromEditingCourse(mat.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Material Inputs & Genuine File Upload */}
                  <div className="space-y-2 pt-2 border-t border-purple-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={materialFileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt,.csv,.py,.ts,.json,.md"
                        onChange={handleMaterialFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => materialFileInputRef.current?.click()}
                        className="text-xs font-bold border-purple-200 text-slate-800 hover:bg-purple-100/70"
                      >
                        <FileUp className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                        {materialFile ? "Change File" : "Upload Document"}
                      </Button>
                      {materialFile ? (
                        <span className="text-xs text-brand-purple font-semibold truncate max-w-xs">
                          {materialFile.name} ({materialFile.size})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Supports PDF, DOCX, TXT, CSV, Code</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newMaterialTitle}
                        onChange={(e) => setNewMaterialTitle(e.target.value)}
                        placeholder="Material title (e.g. Lecture 05 Slides.pdf)..."
                        className="sm:col-span-2 bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm"
                      />
                      <select
                        value={newMaterialType}
                        onChange={(e) => setNewMaterialType(e.target.value as any)}
                        className="bg-white border border-purple-200 rounded-xl px-2 py-1.5 text-xs text-slate-950 font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                      >
                        <option value="notes">Lecture Notes</option>
                        <option value="pdf">PDF Slides</option>
                        <option value="code">Source Code</option>
                        <option value="link">Reference Link</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleAddMaterialToEditingCourse}
                        disabled={!newMaterialTitle.trim()}
                        className="text-xs font-bold"
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" />
                        Attach Lecture Material
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-purple-100">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditingCourse(null)} className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold shadow-md">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: CREATE QUIZ WITH LECTURE NOTES & FILE UPLOAD            */}
        {/* ============================================================== */}
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div>
                  <Badge variant="violet" className="text-[10px] mb-1 font-bold">Gemini Multi-Model Assessment</Badge>
                  <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-brand-purple" />
                    Create Assessment from Lecture Notes
                  </h3>
                </div>
                <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Assessment Title *
                    </label>
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="e.g. Midterm Check: Algorithmic Invariants"
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-medium focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={quizSubject}
                      onChange={(e) => setQuizSubject(e.target.value)}
                      placeholder="Algorithms, Databases, Web Systems"
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-950 text-xs font-medium focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Difficulty
                    </label>
                    <select
                      value={quizDifficulty}
                      onChange={(e) => setQuizDifficulty(e.target.value as any)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Timer (Mins)
                    </label>
                    <input
                      type="number"
                      value={quizDuration}
                      onChange={(e) => setQuizDuration(Number(e.target.value))}
                      className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1 text-[11px]">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={quizPassingScore}
                      onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                      className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-slate-950 text-xs font-bold focus:outline-none focus:border-brand-purple shadow-sm"
                    />
                  </div>
                </div>

                {/* Auto-Draft from Lecture Notes & File Upload */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold uppercase tracking-wider text-slate-950 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-4 h-4 text-brand-purple" />
                      Auto-Generate Questions from Lecture Notes &amp; Documents
                    </span>

                    <input
                      ref={notesFileInputRef}
                      type="file"
                      accept=".txt,.pdf,.docx,.doc,.csv,.md"
                      onChange={handleNotesFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => notesFileInputRef.current?.click()}
                      className="text-xs py-1 h-7 font-bold border-purple-200 text-slate-800 hover:bg-white"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                      Upload Lecture Document
                    </Button>
                  </div>

                  {uploadedNotesFile && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-300 text-[11px] shadow-sm">
                      <span className="font-mono text-emerald-800 font-bold">
                        📄 {uploadedNotesFile.name} ({uploadedNotesFile.size})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedNotesFile(null);
                          setNotesInputText("");
                        }}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    value={notesInputText}
                    onChange={(e) => setNotesInputText(e.target.value)}
                    placeholder="Type or paste lecture slides, exam syllabus, or invariant proofs here. Gemini will parse your text and formulate rigorous multiple choice questions with answers and explanations..."
                    className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm"
                  />

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleGenerateAiQuizFromNotes}
                      isLoading={isGeneratingDraft}
                      className="font-bold shadow-md text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Generate Questions with Gemini
                    </Button>
                  </div>
                </div>

                {/* Drafted Questions Bank with Full Question Curation */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between border-b border-purple-200 pb-1.5">
                    <div>
                      <span className="font-extrabold uppercase text-slate-800 text-[11px]">
                        Drafted Assessment Questions ({quizDraftQuestions.length})
                      </span>
                      <span className="ml-2 text-xs font-bold text-brand-purple">
                        {quizDraftQuestions.filter((q) => selectedQuestionIds.has(q.id)).length} Selected (
                        {quizDraftQuestions
                          .filter((q) => selectedQuestionIds.has(q.id))
                          .reduce((sum, q) => sum + (q.points || 10), 0)}{" "}
                        Total Points)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={selectAllQuestions}
                        className="text-[11px] font-bold text-brand-purple hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={deselectAllQuestions}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {quizDraftQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIds.has(q.id);

                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "p-3 rounded-xl border transition-all text-xs space-y-2 shadow-sm",
                          isSelected
                            ? "bg-white border-brand-purple/50 ring-1 ring-brand-purple/20"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        )}
                      >
                        {/* Header: Select Checkbox, Question Title, Points, Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleQuestionSelection(q.id)}
                              className="w-4 h-4 rounded text-brand-purple border-purple-300 focus:ring-brand-purple cursor-pointer"
                              title="Include in assessment"
                            />
                            <span className="font-extrabold text-slate-900 text-xs shrink-0">
                              Q{idx + 1}:
                            </span>
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => updateQuestionText(q.id, e.target.value)}
                              placeholder="Question prompt..."
                              className="flex-1 bg-white border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-950 focus:outline-none focus:border-brand-purple"
                            />
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={q.points || 10}
                                onChange={(e) => updateQuestionPoints(q.id, Number(e.target.value))}
                                className="w-12 bg-white border border-purple-200 rounded px-1 py-0.5 text-center text-xs font-bold text-brand-purple"
                                title="Points value"
                              />
                              <span className="text-[10px] text-slate-500 font-bold">pts</span>
                            </div>
                            <Badge variant="violet" className="text-[10px] font-bold uppercase">
                              {q.type}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => deleteDraftQuestion(q.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="Remove question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Distractor Choices & Correct Answer Selector */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-1.5 pl-6 pt-1 border-t border-purple-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Distractor Options (Select radio for correct answer):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-1.5">
                                  <input
                                    type="radio"
                                    name={`correct-${q.id}`}
                                    checked={Number(q.correctAnswer) === oi}
                                    onChange={() => updateQuestionCorrectAnswer(q.id, oi)}
                                    className="text-brand-purple cursor-pointer"
                                    title="Mark as correct choice"
                                  />
                                  <span className="font-bold text-[10px] text-slate-600 shrink-0">
                                    {String.fromCharCode(65 + oi)})
                                  </span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateQuestionOption(q.id, oi, e.target.value)}
                                    className="flex-1 bg-white border border-purple-200 rounded px-2 py-0.5 text-xs text-slate-900 font-medium focus:border-brand-purple"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Explanation Field */}
                        <div className="pl-6 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-brand-purple uppercase shrink-0">
                            Explanation:
                          </span>
                          <input
                            type="text"
                            value={q.explanation || ""}
                            onChange={(e) => updateQuestionExplanation(q.id, e.target.value)}
                            placeholder="Explanation for student feedback..."
                            className="flex-1 bg-white border border-purple-100 rounded px-2 py-0.5 text-[11px] text-slate-700 font-medium focus:border-brand-purple"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <Button variant="outline" size="sm" onClick={() => setShowQuizModal(false)} className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveQuiz}
                  disabled={!quizTitle.trim() || quizDraftQuestions.filter((q) => selectedQuestionIds.has(q.id)).length === 0}
                  className="font-bold shadow-md"
                >
                  Publish Curated Assessment ({quizDraftQuestions.filter((q) => selectedQuestionIds.has(q.id)).length} Questions)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Active Courses & Class Enrollment Codes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-purple" />
              Your Managed Courses &amp; Syllabi
            </h2>
            <span className="text-xs font-bold text-brand-purple">{courses.length} Active Courses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <Card key={c.id} className="bg-white border border-purple-100 shadow-clay flex flex-col justify-between hover:border-brand-purple/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-brand-purple px-2 py-0.5 rounded bg-purple-100">
                      {c.code}
                    </span>
                    <Badge variant="cyan" className="font-mono text-xs font-bold">
                      Enroll Code: {c.classCode}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-extrabold text-slate-950">{c.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 font-medium line-clamp-2">
                    {c.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium border-t border-purple-100 pt-2">
                    <span>{c.enrolledStudentsCount} Students</span>
                    <span>{c.modules.length} Modules</span>
                    <span>{c.materials?.length || 0} Materials</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCourse(c)}
                      className="flex-1 text-xs font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                      Edit Course
                    </Button>

                    <Link href={`/courses/${c.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full text-xs font-bold shadow-md">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 2: Published Quizzes & Question Banks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-brand-purple" />
              Published Quizzes &amp; Question Banks (Synced to Student Portal)
            </h2>
            <span className="text-xs font-bold text-brand-purple">
              {quizzes.filter((q) => !q.isPractice && q.creatorRole !== "student").length} Official Faculty Quizzes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes
              .filter((q) => !q.isPractice && q.creatorRole !== "student")
              .map((quiz) => (
                <Card key={quiz.id} className="bg-white border border-purple-100 shadow-clay flex flex-col justify-between hover:border-brand-purple/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-brand-purple">{quiz.subject}</span>
                      <Badge
                        variant={
                          quiz.difficulty === "advanced"
                            ? "tag1"
                            : quiz.difficulty === "intermediate"
                            ? "tag2"
                            : "tag10"
                        }
                        className="capitalize text-[10px] font-bold"
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-extrabold text-slate-950">{quiz.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-600 font-medium line-clamp-2">
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>{quiz.questions.length} Questions</span>
                      <span>{quiz.durationMinutes} Mins</span>
                      <span>Pass: {quiz.passingScore}%</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                      <Link href="/quizzes" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold border-purple-200 text-slate-800 hover:bg-purple-50">
                          Preview Quiz
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuizItem(quiz.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Section 3: Cohort Learning Analytics & Gaps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-purple" />
              Student Cohort Performance &amp; Learning Gaps
            </h2>
            <span className="text-xs text-brand-purple font-mono font-bold">
              {attempts.filter((a) => a.userRole !== "teacher" && !a.isPractice).length} Student Attempts
            </span>
          </div>

          {/* 3-Student Roster Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students.map((stu) => {
              const stuAttempts = attempts.filter(
                (a) => a.userId === stu.id && a.userRole !== "teacher" && !a.isPractice
              );
              const stuAvg =
                stuAttempts.length > 0
                  ? Math.round(
                      stuAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) / stuAttempts.length
                    )
                  : 0;
              const stuGaps = Array.from(new Set(stuAttempts.flatMap((a) => a.weakTopics || [])));

              return (
                <Card key={stu.id} className="p-4 space-y-2.5 bg-white border border-purple-100 shadow-clay rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-slate-950">{stu.name}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{stu.degree || stu.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-brand-purple">{stuAvg}%</div>
                      <div className="text-[10px] text-slate-500 font-medium">{stuAttempts.length} Attempts</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-purple-100 text-[11px]">
                    <span className="text-slate-700 font-bold">Weak Topics: </span>
                    {stuGaps.length > 0 ? (
                      <span className="text-rose-700 font-bold">{stuGaps.join(", ")}</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">All Topics Mastered</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="overflow-hidden bg-white border border-purple-100 shadow-clay rounded-2xl">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 bg-purple-50/80 text-slate-800">
                    <th className="p-3.5 font-bold">Student</th>
                    <th className="p-3.5 font-bold">Assessment</th>
                    <th className="p-3.5 font-bold">Score</th>
                    <th className="p-3.5 font-bold">Outcome</th>
                    <th className="p-3.5 font-bold">Learning Gap Invariants</th>
                    <th className="p-3.5 font-bold">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {attempts
                    .filter((att) => att.userRole !== "teacher" && !att.isPractice)
                    .map((att) => {
                      const studentDisplayName = att.studentName || students.find(student => student.id === att.userId)?.name || "Student";
                      return (
                        <tr key={att.id} className="hover:bg-purple-50/50 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-brand-purple">{studentDisplayName}</div>
                            <div className="font-mono text-[10px] text-slate-500">{att.userId}</div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-950">{att.quizTitle}</td>
                          <td className="p-3.5 font-bold font-mono">
                            <span
                              className={cn(
                                att.scorePercentage >= 70 ? "text-emerald-700" : "text-rose-700"
                              )}
                            >
                              {att.scorePercentage}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            <Badge variant={att.passed ? "tag10" : "tag1"} className="text-[10px] font-bold">
                              {att.passed ? "Passed" : "Retake Needed"}
                            </Badge>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {att.weakTopics.length > 0 ? (
                                att.weakTopics.map((t, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold"
                                  >
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="text-emerald-700 font-bold italic">None (Mastered)</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                            {new Date(att.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
