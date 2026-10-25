"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LearningOrbit } from "@/components/ui/LearningOrbit";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import {
  getCurrentUser,
  getCourses,
  getQuizzes,
  getAttempts,
  getRoadmaps,
  getChallenges,
  getOpportunities,
  getStudentNotes,
  saveStudentNote,
  deleteStudentNote,
} from "@/lib/store";
import {
  UserProfile,
  Course,
  Quiz,
  QuizAttempt,
  Roadmap,
  Challenge,
  Opportunity,
  StudentNote,
} from "@/types";
import { calculateRoadmapProgress } from "@/lib/scoring";
import { parseDocumentFile } from "@/lib/rag-parser";
import {
  Sparkles,
  Bot,
  Compass,
  Code2,
  FileQuestion,
  BookOpen,
  Map,
  Trophy,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  Play,
  FileText,
  Lock,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileUp,
  X,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);

  // Notes locker state
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<StudentNote | null>(null);
  const [viewingNote, setViewingNote] = useState<StudentNote | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCourse, setNoteCourse] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [uploadedNoteFile, setUploadedNoteFile] = useState<{
    name: string;
    size: string;
    data?: string;
  } | null>(null);
  const noteFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setCourses(getCourses());
    setAttempts(getAttempts(currentUser.id));
    setRoadmaps(getRoadmaps());
    setChallenges(getChallenges());
    setOpportunities(getOpportunities());
    setNotes(getStudentNotes(currentUser.id));
  }, []);

  if (!user) return null;

  // Derive stats dynamically from data
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.scorePercentage, 0) /
            totalAttempts,
        )
      : 0;

  // Collect weak topics from all attempts
  const allWeakTopics = Array.from(
    new Set(attempts.flatMap((a) => a.weakTopics || [])),
  );

  // Active roadmap progress
  const activeRoadmap = roadmaps[0];
  const roadmapStats = activeRoadmap
    ? calculateRoadmapProgress(activeRoadmap.weeks)
    : { completedTasks: 0, totalTasks: 0, percentage: 0 };

  const savedOpps = opportunities.filter((o) => o.isBookmarked || o.userStatus);

  // Note Actions
  const handleCreateNoteFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseDocumentFile(file);
      setNoteContent(parsed.text);
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      setUploadedNoteFile({
        name: file.name,
        size: sizeStr,
        data: parsed.text,
      });
      if (!noteTitle.trim()) {
        setNoteTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
    } catch (err: any) {
      console.warn("RAG Parser note upload fallback:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        setNoteContent(text);
        setUploadedNoteFile({
          name: file.name,
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          data: text,
        });
        if (!noteTitle.trim()) {
          setNoteTitle(
            file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !user) return;

    const tagsArray = noteTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      userId: user.id,
      title: noteTitle.trim(),
      courseName: noteCourse.trim() || undefined,
      content: noteContent.trim(),
      fileName: uploadedNoteFile?.name,
      fileSize:
        uploadedNoteFile?.size ||
        `${Math.max(1, Math.round(noteContent.length / 1024))} KB`,
      fileType: uploadedNoteFile?.name?.endsWith(".pdf")
        ? "pdf"
        : uploadedNoteFile?.name?.endsWith(".docx")
          ? "docx"
          : "text",
      fileData: uploadedNoteFile?.data || noteContent,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStudentNote(newNote);
    setNotes(getStudentNotes(user.id));
    setShowNewNoteModal(false);
    setNoteTitle("");
    setNoteContent("");
    setNoteCourse("");
    setNoteTags("");
    setUploadedNoteFile(null);
  };

  const handleSaveEditedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editingNote.title.trim() || !user) return;

    const updatedNote: StudentNote = {
      ...editingNote,
      updatedAt: new Date().toISOString(),
    };

    saveStudentNote(updatedNote);
    setNotes(getStudentNotes(user.id));
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    if (!user) return;
    deleteStudentNote(id);
    setNotes(getStudentNotes(user.id));
    if (viewingNote?.id === id) setViewingNote(null);
    if (editingNote?.id === id) setEditingNote(null);
  };

  if (user.role !== "student") {
    const taught = courses.filter((c) => c.instructorId === user.id);
    const quizzes = getQuizzes().filter(
      (q) => q.creatorId === user.id && !q.isPractice,
    );
    const quizIds = new Set(quizzes.map((q) => q.id));
    const submissions = getAttempts().filter((a) => quizIds.has(a.quizId));
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="clay-card-purple p-8">
            <h1 className="text-3xl font-bold text-white">
              Faculty Teaching Center
            </h1>
            <p className="text-white mt-2">Welcome back, {user.name}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Courses taught", taught.length],
              [
                "Course enrollments",
                taught.reduce((n, c) => n + c.enrolledStudentsCount, 0),
              ],
              ["Quiz submissions", submissions.length],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-slate-700">{label}</p>
                  <strong className="text-3xl text-slate-950">{value}</strong>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link href="/teacher">
            <Button>
              Open Teacher Studio · Courses, rosters &amp; assessments
            </Button>
          </Link>
          <h2 className="text-xl font-bold">Your courses</h2>
          {taught.length === 0 && <p>No courses assigned yet.</p>}
          {taught.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <Link
                  href={`/courses/${c.id}`}
                  className="font-bold text-purple-800"
                >
                  {c.code}: {c.title}
                </Link>
                <p>
                  {c.enrolledStudentsCount} enrollments ·{" "}
                  {
                    quizzes.filter(
                      (q) =>
                        q.classCode === c.classCode ||
                        q.assignedClass === c.classCode,
                    ).length
                  }{" "}
                  assessments
                </p>
              </CardContent>
            </Card>
          ))}
          <h2 className="text-xl font-bold">Assessment review</h2>
          <p>
            Quizzes are graded automatically. Review submissions and learning
            gaps in Teacher Studio.
          </p>
          {quizzes.map((q) => (
            <Link
              key={q.id}
              href="/teacher"
              className="block text-purple-800 underline"
            >
              {q.title} · {submissions.filter((a) => a.quizId === q.id).length}{" "}
              submissions
            </Link>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="dashboard-overview space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-xs text-[#a1b8a8] mt-1.5">
              A little progress today. A bigger future tomorrow.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="ui-button border border-[#365c45] px-4 py-2.5 text-xs text-[#d8f2df] inline-flex items-center gap-3 hover:bg-[#10271a]"
          >
            View my portfolio <ArrowRight size={15} />
          </Link>
        </div>

        <section className="dashboard-hero" aria-label="AI learning companion">
          <div className="dashboard-hero-copy">
            <span className="dashboard-kicker">YOUR AI LEARNING COMPANION</span>
            <h2>What will you build today?</h2>
            <p>Learn a concept, solve a challenge, or plan your next step.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                href="/tutor"
                className="ui-button inline-flex gap-2.5 items-center px-4 py-2.5 text-xs"
                data-tone="primary"
              >
                <Sparkles size={17} />
                Ask Monday AI
              </Link>
              <Link
                href="/roadmaps"
                className="ui-button inline-flex gap-2.5 items-center px-4 py-2.5 text-xs"
                data-tone="outline"
              >
                <Map size={17} />
                Explore roadmaps
              </Link>
            </div>
          </div>
          <LearningOrbit />
        </section>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              label: "Enrolled courses",
              value: String(enrolledCourses.length).padStart(2, "0"),
              icon: BookOpen,
              href: "/courses",
            },
            {
              label: "Quiz average",
              value: `${avgScore}%`,
              icon: TrendingUp,
              href: "/quizzes",
            },
            {
              label: "Saved opportunities",
              value: String(savedOpps.length).padStart(2, "0"),
              icon: Briefcase,
              href: "/opportunities",
            },
            {
              label: "Roadmap progress",
              value: `${roadmapStats.percentage}%`,
              icon: Map,
              href: "/roadmaps",
            },
          ].map(({ label, value, icon: Icon, href }) => (
            <Link
              href={href}
              key={label}
              className="ui-card dashboard-stat hover:border-[#4a7857] transition-colors"
            >
              <span className="dashboard-icon">
                <Icon size={21} strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-[#b1c5b8]">{label}</p>
                <p className="text-2xl font-semibold tracking-tight mt-1">
                  {value}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-3">
          <section className="ui-card dashboard-panel">
            <div className="dashboard-panel-title">
              <h2>Continue learning</h2>
              <Link
                href="/courses"
                className="text-xs text-[#a5efae] inline-flex items-center gap-2"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {enrolledCourses.length === 0 && (
              <div className="border-t border-[#1e3827] pt-6">
                <p className="text-sm text-[#a1b8a8] mb-4">
                  Your next chapter starts here. Join a course to track your
                  progress.
                </p>
                <Link
                  href="/courses"
                  className="text-xs text-[#a5efae] inline-flex items-center gap-2"
                >
                  Explore courses <ArrowRight size={14} />
                </Link>
              </div>
            )}
            {enrolledCourses.slice(0, 2).map((course) => {
              const lessons = course.modules.flatMap((m) => m.lessons);
              const progress = lessons.length
                ? Math.round(
                    (lessons.filter((l) => l.isCompleted).length /
                      lessons.length) *
                      100,
                  )
                : 0;
              const next = lessons.find((l) => !l.isCompleted);
              return (
                <div className="dashboard-course" key={course.id}>
                  <span className="dashboard-icon !w-12 !h-12">
                    <BookOpen size={23} strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-widest text-[#84cc99] mb-1.5">
                      {course.code}
                    </p>
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-sm font-medium hover:text-[#a5efae]"
                    >
                      {course.title}
                    </Link>
                    <p className="text-[11px] text-[#a1b8a8] mt-1.5 truncate">
                      {next?.title ||
                        (lessons.length
                          ? "All lessons complete"
                          : course.instructorName)}
                    </p>
                  </div>
                  <div className="w-28 sm:w-36 flex items-center gap-3">
                    <div
                      className="dashboard-course-progress flex-1"
                      role="progressbar"
                      aria-label={`${course.title} progress`}
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[11px]">{progress}%</span>
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    aria-label={`Resume ${course.title}`}
                    className="dashboard-icon !w-9 !h-9 hover:border-[#a5efae]"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </section>
          <section className="ui-card dashboard-panel flex flex-col">
            <div className="dashboard-panel-title">
              <h2>Your next opportunity</h2>
              <Briefcase size={17} className="text-[#a5efae]" />
            </div>
            {savedOpps[0] ? (
              <>
                <p className="text-sm font-medium">{savedOpps[0].title}</p>
                <p className="text-xs text-[#a1b8a8] mt-2">
                  {savedOpps[0].organization} · {savedOpps[0].location}
                </p>
                <p className="text-xs leading-relaxed text-[#a1b8a8] mt-4 line-clamp-2">
                  {savedOpps[0].description}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className="dashboard-icon">
                    <Briefcase size={23} />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Find your next step</p>
                    <p className="text-xs text-[#a1b8a8] mt-1">
                      Internships, scholarships &amp; more
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[#a1b8a8] my-4">
                  Find a role that fits your skills.
                </p>
              </>
            )}
            <Link
              href="/opportunities"
              className="ui-button mt-auto text-xs py-2.5 text-center inline-flex justify-center items-center gap-3"
              data-tone="outline"
            >
              Explore opportunities <ArrowRight size={14} />
            </Link>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-3">
          <section className="ui-card dashboard-panel dashboard-recommendation">
            <h2 className="text-xs text-[#d2e5d8] mb-4">
              Recommended challenge
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <span className="dashboard-icon">
                <Code2 size={23} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {challenges[0]?.title || "Build something new"}
                </p>
                <p className="text-xs text-[#a1b8a8] mt-2 line-clamp-1">
                  {challenges[0]?.summary ||
                    "Turn what you know into something you can show."}
                </p>
              </div>
              <Link
                href={
                  challenges[0]
                    ? `/challenges/${challenges[0].id}`
                    : "/challenges"
                }
                className="ui-button inline-flex items-center gap-3 text-xs px-4 py-3"
                data-tone="primary"
              >
                Start challenge <ArrowRight size={15} />
              </Link>
            </div>
          </section>
          <section className="ui-card dashboard-panel">
            <h2 className="text-xs text-[#d2e5d8] mb-4">Career toolkit</h2>
            <div className="flex items-center gap-4">
              <FileText
                className="text-[#a5efae] shrink-0"
                size={26}
                strokeWidth={1.4}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Polish your CV</p>
                <p className="text-[11px] text-[#a1b8a8] mt-2">
                  Make your next application count.
                </p>
              </div>
              <Link
                href="/cv"
                aria-label="Open CV Studio"
                className="dashboard-icon !h-9 !w-9"
              >
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>
        </div>

        {/* Study notes */}
        <div className="bg-white border border-purple-100 shadow-clay rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 border border-purple-200 flex items-center justify-center text-brand-purple shrink-0 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-950">
                    Study notes
                  </h2>
                  <Badge variant="violet" className="text-[10px] font-bold">
                    {notes.length} Private Notes
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Your private study notes.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNoteTitle("");
                setNoteContent("");
                setNoteCourse("");
                setNoteTags("");
                setUploadedNoteFile(null);
                setShowNewNoteModal(true);
              }}
              className="font-bold shadow-md text-xs shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add / Upload Note
            </Button>
          </div>

          {/* Notes Grid */}
          {notes.length === 0 ? (
            <div className="flex flex-wrap items-center gap-3 py-4 text-xs text-slate-500">
              <FileText className="w-5 h-5 text-brand-purple/60" />
              <p className="text-xs font-bold text-slate-800">No notes yet.</p>
              <p className="text-[11px] text-slate-500">
                Add a note or upload a document.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 hover:border-brand-purple/40 hover:bg-purple-50/60 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-slate-950 leading-snug truncate flex-1">
                        {note.title}
                      </h3>
                      <Badge
                        variant="violet"
                        className="text-[9px] uppercase font-bold shrink-0"
                      >
                        {note.fileType || "text"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{note.fileSize || "1.2 KB"}</span>
                      {note.courseName && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px] font-sans font-semibold text-brand-purple">
                            {note.courseName}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed font-medium">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-100 flex items-center justify-between gap-2">
                    <Link href={`/tutor?noteId=${note.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs font-bold text-brand-purple hover:bg-purple-100/70 p-1 flex items-center gap-1"
                        title="Study this note with Monday AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Study with Monday AI</span>
                      </Button>
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingNote(note)}
                        className="p-1.5 text-slate-400 hover:text-brand-purple rounded transition-colors"
                        title="View Note"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNote(note)}
                        className="p-1.5 text-slate-400 hover:text-brand-purple rounded transition-colors"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Learning & Weak Topics */}
        <details className="workspace-disclosure">
          <summary>Study insights</summary>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main 2-col: Continue Learning & Recent Lessons */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Career Roadmap Tracker */}
              {activeRoadmap && (
                <Card className="border-purple-100 bg-white shadow-clay text-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-purple-50">
                    <div>
                      <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <Map className="w-5 h-5 text-brand-purple" />
                        Active Roadmap: {activeRoadmap.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {activeRoadmap.tagline}
                      </CardDescription>
                    </div>
                    <Link href={`/roadmaps/${activeRoadmap.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-brand-purple hover:bg-purple-50 font-bold"
                      >
                        View Roadmap
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-4">
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-bold">
                        <span>Progress</span>
                        <span className="text-brand-purple font-mono">
                          {roadmapStats.percentage}% Complete
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
                        <div
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-mint rounded-full transition-all duration-500"
                          style={{ width: `${roadmapStats.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Immediate weekly tasks */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Week 1 Milestones
                      </span>
                      {activeRoadmap.weeks[0].tasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                t.completed
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            />
                            <span
                              className={
                                t.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800 font-semibold"
                              }
                            >
                              {t.title}
                            </span>
                          </div>
                          <Badge
                            variant="violet"
                            className="text-[10px] font-mono"
                          >
                            {t.estimatedHours}h
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Weak Topics & Opportunities */}
            <div className="space-y-6">
              {/* Weak Topics Diagnostic Card */}
              <Card className="border-purple-100 bg-white shadow-clay text-slate-900">
                <CardHeader className="pb-3 border-b border-purple-50">
                  <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Topics to review
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Diagnosed from your recent quiz attempts
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {allWeakTopics.length > 0 ? (
                    allWeakTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-amber-200 bg-amber-50/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-amber-950">
                            {topic}
                          </div>
                          <div className="text-[11px] text-amber-800">
                            Score &lt; 70% in recent tests
                          </div>
                        </div>
                        <Link
                          href={`/tutor?topic=${encodeURIComponent(topic)}`}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-brand-purple font-bold hover:underline p-1"
                          >
                            Revise with AI
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-purple-50/40 text-center text-xs text-slate-600 border border-purple-100">
                      Take a quiz to find topics to review.
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href="/quizzes">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold border-purple-200 text-slate-800 hover:bg-purple-50"
                      >
                        Practice quiz
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Opportunities & Deadlines */}
              <Card className="border-purple-100 bg-white shadow-clay text-slate-900">
                <CardHeader className="pb-3 border-b border-purple-50">
                  <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-purple" />
                    Tracked Deadlines
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Saved scholarships &amp; internships
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {savedOpps.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[170px]">
                          {opp.title}
                        </span>
                        <span className="text-[10px] text-brand-purple font-mono font-semibold">
                          {opp.deadline}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{opp.organization}</span>
                        <Badge
                          variant="violet"
                          className="text-[9px] uppercase font-bold"
                        >
                          {opp.userStatus || "saved"}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Link href="/opportunities">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-brand-purple font-bold hover:bg-purple-50"
                      >
                        View opportunities
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </details>

        {/* Modal: New Note */}
        {showNewNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-purple-200 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-brand-purple">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-base">
                      Add Private Study Note
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload documents or write notes for AI study grounding
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSaveNewNote}
                className="space-y-3.5 flex-1 overflow-y-auto pr-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-700">
                      Upload Document File (Optional)
                    </label>
                    <input
                      ref={noteFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.csv,.py,.ts,.json,.md"
                      onChange={handleCreateNoteFile}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => noteFileInputRef.current?.click()}
                      className="text-[11px] h-7 px-2.5 font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
                    >
                      <FileUp className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                      {uploadedNoteFile
                        ? "Change File"
                        : "Choose File (.pdf, .docx, .txt)"}
                    </Button>
                  </div>

                  {uploadedNoteFile && (
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-950 truncate max-w-xs">
                        📄 {uploadedNoteFile.name} ({uploadedNoteFile.size})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedNoteFile(null);
                          setNoteContent("");
                        }}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. CS101 Lecture 04 Invariant Proofs"
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Course Tag
                    </label>
                    <input
                      type="text"
                      value={noteCourse}
                      onChange={(e) => setNoteCourse(e.target.value)}
                      placeholder="e.g. CS101: Algorithms"
                      className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={noteTags}
                      onChange={(e) => setNoteTags(e.target.value)}
                      placeholder="e.g. Algorithms, Search"
                      className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Note Content / Transcript
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write or paste your key lecture notes, formulas, or takeaways..."
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-purple-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewNoteModal(false)}
                    className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-md"
                  >
                    Save to Locker
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Note */}
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-purple-200 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-brand-purple">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    Edit Note
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSaveEditedNote}
                className="space-y-3.5 flex-1 overflow-y-auto pr-1"
              >
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingNote.title}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Course Tag
                  </label>
                  <input
                    type="text"
                    value={editingNote.courseName || ""}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        courseName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Note Content
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={editingNote.content}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        content: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-purple-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingNote(null)}
                    className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-md"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Note */}
        {viewingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-purple-200 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-brand-purple">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-base">
                      {viewingNote.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {viewingNote.courseName || "General Note"} •{" "}
                      {viewingNote.fileSize || "1.2 KB"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingNote(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {viewingNote.content}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-purple-100">
                <Link href={`/tutor?noteId=${viewingNote.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-md text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Study with Monday AI
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingNote(null)}
                  className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
