"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getCourseById, toggleLessonCompletion } from "@/lib/store";
import { Course, Lesson, CourseMaterial } from "@/types";
import { W3InteractiveLab } from "@/components/learn/W3InteractiveLab";
import {
  ArrowLeft,
  Bot,
  FileQuestion,
  Code2,
  FileText,
  Play,
  CheckCircle2,
  Circle,
  Download,
  Layers,
  Save,
  BookOpen,
  Sparkles,
  Upload,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [savedNotesNotice, setSavedNotesNotice] = useState(false);

  useEffect(() => {
    if (courseId) {
      const found = getCourseById(courseId);
      if (found) {
        setCourse(found);
        if (found.modules.length > 0 && found.modules[0].lessons.length > 0) {
          const firstLesson = found.modules[0].lessons[0];
          setActiveLesson(firstLesson);
          loadNotes(courseId, firstLesson.id);
        }
      }
    }
  }, [courseId]);

  const loadNotes = (cId: string, lId: string) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`notes_${cId}_${lId}`);
      setPersonalNotes(stored || "");
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    if (course) {
      loadNotes(course.id, lesson.id);
    }
  };

  const handleToggleComplete = () => {
    if (!course || !activeLesson) return;
    const updated = toggleLessonCompletion(course.id, activeLesson.id);
    if (updated) {
      setCourse(updated);
      for (const m of updated.modules) {
        const found = m.lessons.find((l) => l.id === activeLesson.id);
        if (found) setActiveLesson(found);
      }
    }
  };

  const handleSaveNotes = () => {
    if (!course || !activeLesson) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(`notes_${course.id}_${activeLesson.id}`, personalNotes);
      setSavedNotesNotice(true);
      setTimeout(() => setSavedNotesNotice(false), 2500);
    }
  };

  const handleDownloadMaterial = (mat: CourseMaterial) => {
    if (!course) return;

    // If actual uploaded file data is present, download authentic file
    if (mat.fileData) {
      const fileName = mat.fileName || `${mat.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.${mat.type === "pdf" ? "pdf" : mat.type === "code" ? "ts" : "txt"}`;

      if (mat.fileData.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = mat.fileData;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const mimeType = mat.type === "pdf" ? "application/pdf" : "text/plain;charset=utf-8";
      const blob = new Blob([mat.fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    // Fallback: formatted lecture text notes
    const content = `# CampusOS Course Material: ${mat.title}
Course: ${course.code} - ${course.title}
Instructor: ${course.instructorName}
Category: ${course.category} | Level: ${course.level}
Resource Type: ${mat.type.toUpperCase()} | Upload Date: ${mat.uploadDate || new Date().toISOString().slice(0, 10)}

==================================================
ACADEMIC OVERVIEW & LECTURE SUMMARY
==================================================
${mat.description || "Comprehensive lecture notes and study guide reference."}

==================================================
KEY STUDY INVARIANTS & TAKEAWAYS
==================================================
1. Invariants: Always verify pre-conditions, loop invariants, and post-conditions.
2. Time & Space Complexity: Quantify runtime limits and memory allocation footprints.
3. Edge Case Handling: Test with boundary inputs, null objects, and empty datasets.
4. Active Application: Apply concepts in the CampusOS CodePlay IDE and QuizForge.

---
Verified CampusOS Material - Distributed for University Students`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mat.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportNotes = () => {
    if (!course || !activeLesson || !personalNotes.trim()) return;
    const content = `# Study Notes: ${activeLesson.title}
Course: ${course.code} - ${course.title}
Lesson Duration: ${activeLesson.durationMinutes} mins | Type: ${activeLesson.type}
Export Date: ${new Date().toLocaleDateString()}

---
## Student Notes
${personalNotes}

---
Exported from CampusOS Learning Studio`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.code}_${activeLesson.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPersonalNotes((prev) =>
          prev
            ? `${prev}\n\n[Imported from ${file.name}]:\n${text}`
            : `[Imported from ${file.name}]:\n${text}`
        );
        setSavedNotesNotice(true);
        setTimeout(() => setSavedNotesNotice(false), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!course) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900">Course Not Found</h2>
          <Button variant="outline" onClick={() => router.push("/courses")} className="border-purple-200 text-slate-800 font-bold">
            Back to Courses
          </Button>
        </div>
      </AppShell>
    );
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isCompleted).length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation back & Header Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/courses"
            className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 text-brand-purple" />
            Back to Course Catalog
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="font-mono text-xs">
              Class: {course.classCode}
            </Badge>
            <Badge variant="violet" className="text-xs">
              {progressPercent}% Complete ({completedLessons}/{totalLessons} Lessons)
            </Badge>
          </div>
        </div>

        {/* Course Header Banner */}
        <div className="clay-card-purple p-6 sm:p-8 space-y-4 shadow-xl text-white relative overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full text-xs">
              {course.code}
            </span>
            <Badge variant="outline" className="border-white/30 text-white">{course.category}</Badge>
            <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full font-bold text-white">{course.level}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{course.title}</h1>
          <p className="text-sm text-purple-100 max-w-3xl leading-relaxed">{course.description}</p>

          {/* Progress Bar */}
          <div className="space-y-1.5 max-w-xl pt-2">
            <div className="flex justify-between text-xs text-purple-200 font-mono">
              <span>Syllabus Completion</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-purple-950/40 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-emerald-300 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-purple-200 flex flex-wrap items-center gap-4 pt-3 border-t border-white/15">
            <span>
              Instructor: <strong className="text-white font-bold">{course.instructorName}</strong>
            </span>
            <span>
              Enrolled: <strong className="text-white font-bold">{course.enrolledStudentsCount} Students</strong>
            </span>
            <span>
              Total Modules: <strong className="text-white font-bold">{course.modules.length}</strong>
            </span>
          </div>
        </div>

        {/* Content Workspace: Modules (Left) & Lesson Reader + Materials (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Modules & Lessons Navigator */}
          <div className="space-y-5">
            <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Layers className="w-4 h-4 text-brand-purple" />
                Syllabus & Modules
              </span>
              <span className="text-[11px] text-brand-purple font-mono font-bold">{course.modules.length} Modules</span>
            </h2>

            <div className="space-y-3.5">
              {course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="border border-purple-100 rounded-2xl bg-white overflow-hidden shadow-clay"
                >
                  <div className="p-3 bg-purple-50/70 border-b border-purple-100 text-xs font-extrabold text-slate-950 flex items-center justify-between">
                    <span>{mod.title}</span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {mod.lessons.filter((l) => l.isCompleted).length}/{mod.lessons.length}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {mod.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson)}
                        className={cn(
                          "w-full p-2.5 rounded-xl text-xs text-left flex items-center justify-between transition-colors",
                          activeLesson?.id === lesson.id
                            ? "bg-purple-100 text-brand-purple border border-purple-300 font-bold"
                            : "text-slate-800 hover:bg-purple-50/60 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {lesson.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                          {lesson.durationMinutes}m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Course Reference Materials Section */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <FileText className="w-4 h-4 text-brand-purple" />
                  Course Materials ({course.materials.length})
                </span>
              </h3>
              <div className="space-y-2">
                {course.materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 rounded-2xl border border-purple-100 bg-white flex items-center justify-between text-xs hover:border-purple-300 transition-all shadow-clay"
                  >
                    <div className="truncate mr-2">
                      <div className="font-extrabold text-slate-950 truncate">{mat.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">
                        {mat.size} • {mat.type.toUpperCase()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-brand-purple hover:bg-purple-50"
                      title="Download Official Material"
                      onClick={() => handleDownloadMaterial(mat)}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Active Lesson Content & Interactive Study Studio */}
          <div className="lg:col-span-2 space-y-6">
            {activeLesson ? (
              <Card className="p-6 sm:p-8 space-y-6 shadow-clay bg-white border border-purple-100 text-slate-900 rounded-2xl">
                <div className="pb-4 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" className="uppercase font-mono text-[10px]">
                        {activeLesson.type} Lesson
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono font-medium">
                        {activeLesson.durationMinutes} Minutes
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-1">
                      {activeLesson.title}
                    </h2>
                  </div>

                  {/* Actions: Complete Toggle & Bridge Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={activeLesson.isCompleted ? "secondary" : "primary"}
                      size="sm"
                      onClick={handleToggleComplete}
                      className={cn(
                        "font-bold shadow-md",
                        activeLesson.isCompleted && "text-emerald-700 border-emerald-300 bg-emerald-50"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {activeLesson.isCompleted ? "Completed ✓" : "Mark as Complete"}
                    </Button>

                    <Link href={`/tutor?topic=${encodeURIComponent(activeLesson.title)}`}>
                      <Button variant="outline" size="sm" className="font-semibold text-slate-800 hover:text-brand-purple">
                        <Bot className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                        Ask AI Tutor
                      </Button>
                    </Link>

                    <Link href="/quizzes">
                      <Button variant="outline" size="sm" className="font-semibold text-slate-800 hover:text-brand-purple">
                        <FileQuestion className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                        Take Quiz
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Lesson summary callout */}
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-slate-800 text-xs leading-relaxed font-medium">
                  <span className="font-bold text-brand-purple uppercase tracking-wider block mb-1">
                    Key Lesson Objective & Summary:
                  </span>
                  {activeLesson.summary}
                </div>

                {/* Complete lesson reading & theoretical content */}
                <div className="space-y-4 text-sm text-slate-800 leading-relaxed font-sans font-medium">
                  <h3 className="font-extrabold text-slate-950 text-base">Lecture Analysis & Principles</h3>
                  <p className="whitespace-pre-line leading-relaxed">{activeLesson.content}</p>

                  {/* W3Schools / C4School Interactive Tutorial Lab */}
                  <W3InteractiveLab
                    title={activeLesson.title}
                    category={course.category}
                    syntaxNotes={activeLesson.syntaxNotes}
                    codeExample={activeLesson.codeExample}
                    exercise={activeLesson.exercise}
                  />
                </div>

                {/* Personal Study Notes Studio */}
                <div className="pt-4 border-t border-purple-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label
                      htmlFor="lesson-notes"
                      className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-brand-purple" />
                      My Personal Study Notes & Attached Files
                    </label>
                    <div className="flex items-center gap-2">
                      {savedNotesNotice && (
                        <span className="text-[11px] text-emerald-600 font-bold animate-fade-in">
                          Notes Synchronized Locally ✓
                        </span>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-purple-50 text-brand-purple hover:bg-purple-100 transition-colors border border-purple-200">
                        <FileUp className="w-3.5 h-3.5 text-brand-purple" />
                        Attach File / Notes
                        <input
                          type="file"
                          accept=".txt,.md,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <textarea
                    id="lesson-notes"
                    rows={4}
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Write key equations, mental models, or lecture questions here... (Or click 'Attach File / Notes' to import a document)"
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl p-3 text-xs text-slate-950 placeholder-slate-400 font-medium focus:outline-none focus:border-brand-purple transition-colors resize-y font-mono"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {personalNotes.length} characters • Auto-stored in browser
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportNotes}
                        disabled={!personalNotes.trim()}
                        className="text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Export .md
                      </Button>
                      <Button size="sm" variant="primary" onClick={handleSaveNotes} className="font-bold shadow-md">
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Lesson Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="p-12 text-center text-slate-600 font-medium bg-white rounded-2xl border border-purple-200 shadow-clay">
                Select a lesson from the module navigator to begin studying.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
