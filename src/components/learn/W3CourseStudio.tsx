"use client";

import { runPython } from "@/lib/python-runner";
import React, { useState, useEffect, useRef } from "react";
import { W3Course, W3Chapter, getAllW3Courses, getW3CourseById } from "@/lib/w3schools-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Share2,
  Search,
  Code2,
  Terminal as TerminalIcon,
  HelpCircle,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface W3CourseStudioProps {
  initialCourseId?: "python" | "javascript" | "html" | "css" | "sql";
  initialChapterId?: string;
  onTrackChange?: (courseId: string) => void;
}

export function W3CourseStudio({
  initialCourseId = "python",
  initialChapterId,
  onTrackChange,
}: W3CourseStudioProps) {
  const allCourses = getAllW3Courses();

  // State
  const [activeCourseId, setActiveCourseId] = useState<"python" | "javascript" | "html" | "css" | "sql">(
    initialCourseId
  );
  const currentCourse = getW3CourseById(activeCourseId) || allCourses[0];

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [sidebarSearch, setSidebarSearch] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Active Chapter
  const activeChapter: W3Chapter = currentCourse.chapters[activeChapterIndex] || currentCourse.chapters[0];

  // Try-It-Yourself Code Sandbox State
  const [editorCode, setEditorCode] = useState<string>(activeChapter.tryItYourself.starterCode);
  const [sandboxOutput, setSandboxOutput] = useState<string>("Run the example to see its output.");
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  // Exercise Code Challenge State
  const [exerciseInput, setExerciseInput] = useState<string>("");
  const [exerciseStatus, setExerciseStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  // Sync when course changes or initial props change
  useEffect(() => {
    if (initialCourseId && initialCourseId !== activeCourseId) {
      setActiveCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  useEffect(() => {
    const requestedChapter = initialChapterId || new URLSearchParams(window.location.search).get("chapter");
    if (requestedChapter) {
      const idx = currentCourse.chapters.findIndex((c) => c.id === requestedChapter);
      if (idx !== -1) setActiveChapterIndex(idx);
    } else {
      setActiveChapterIndex(0);
    }
  }, [activeCourseId, initialChapterId]);

  // Reset editor & exercise when active chapter changes
  useEffect(() => {
    if (activeChapter) {
      setEditorCode(activeChapter.tryItYourself.starterCode);
      setSandboxOutput("Expected example result (not executed):\n" + activeChapter.tryItYourself.expectedOutput);
      setExerciseInput("");
      setExerciseStatus("idle");
      setShowHint(false);
      setShowAnswer(false);
    }
  }, [activeChapter]);

  // Switch Course Track
  const handleSelectCourse = (courseId: "python" | "javascript" | "html" | "css" | "sql") => {
    setActiveCourseId(courseId);
    setActiveChapterIndex(0);
    setSidebarSearch("");
    if (onTrackChange) onTrackChange(courseId);
  };

  // Previous / Next Chapter Navigation
  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < currentCourse.chapters.length - 1) {
      setActiveChapterIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    setBookmarkedChapters((prev) => ({
      ...prev,
      [activeChapter.id]: !prev[activeChapter.id],
    }));
  };

  // Share Copy Link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/roadmaps?course=${activeCourseId}&chapter=${activeChapter.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const pythonRun = useRef<ReturnType<typeof runPython> | null>(null);
  useEffect(() => () => pythonRun.current?.cancel(), [activeCourseId, activeChapter.id]);

  // Execute Code in Sandbox
  const handleRunCode = () => {
    pythonRun.current?.cancel();
    setIsRunningCode(true);
    if (activeChapter.tryItYourself.language === "python") {
      setSandboxOutput("");
      pythonRun.current = runPython(editorCode, (text) => setSandboxOutput(previous => previous ? previous + "\n" + text : text));
      pythonRun.current.done.then(() => setIsRunningCode(false));
      return;
    }

    setTimeout(() => {
      try {
        if (activeChapter.tryItYourself.language === "javascript") {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => {
              logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
              setSandboxOutput(logs.join("\n"));
            },
            error: (...args: any[]) => logs.push("Error: " + args.join(" ")),
            warn: (...args: any[]) => logs.push("Warning: " + args.join(" ")),
          };

          // Safe evaluation with simulated console
          const runFn = new Function("console", editorCode);
          runFn(customConsole);
          setSandboxOutput(logs.length > 0 ? logs.join("\n") : "Code executed successfully with no console output.");
        } else {
          // SQL, HTML, CSS: display formatted expected result
          setSandboxOutput("Expected example result (not executed):\n" + activeChapter.tryItYourself.expectedOutput);
        }
      } catch (err: any) {
        setSandboxOutput(`Runtime Exception: ${err?.message || "Execution error"}`);
      } finally {
        setIsRunningCode(false);
      }
    }, 250);
  };

  // Reset Sandbox Code
  const handleResetCode = () => {
    setEditorCode(activeChapter.tryItYourself.starterCode);
    setSandboxOutput("Expected example result (not executed):\n" + activeChapter.tryItYourself.expectedOutput);
  };

  // Check Code Challenge Exercise
  const handleSubmitExercise = () => {
    const cleanInput = exerciseInput.trim();
    const correct = activeChapter.exercise.blankAnswer.trim();
    const acceptable = activeChapter.exercise.acceptableAnswers?.map((a) => a.trim()) || [correct];

    const isMatch = acceptable.some((ans) => ans.toLowerCase() === cleanInput.toLowerCase());

    if (isMatch) {
      setExerciseStatus("correct");
      setEarnedXp((prev) => prev + activeChapter.exercise.xp);
    } else {
      setExerciseStatus("incorrect");
    }
  };

  // Filtered Chapters for Sidebar
  const filteredChapters = currentCourse.chapters.filter((ch) =>
    ch.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    ch.description.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden text-slate-900 font-sans">
      {/* =========================================================================
          TOP COURSE SWITCHER BAR (Matches W3Schools dark navbar from user image)
         ========================================================================= */}
      <div className="bg-[#282A35] text-white px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-700 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-2">
          {allCourses.map((c) => {
            const isActive = c.id === activeCourseId;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCourse(c.id)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white text-[#282A35] shadow-md font-black"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                )}
              >
                {c.tabLabel}
              </button>
            );
          })}

          {/* Additional static course badges for complete W3Schools fidelity */}
          <span className="hidden md:inline-flex px-3 py-1.5 text-xs text-slate-400 uppercase font-semibold">
            JAVA
          </span>
          <span className="hidden lg:inline-flex px-3 py-1.5 text-xs text-slate-400 uppercase font-semibold">
            PHP
          </span>
          <span className="hidden xl:inline-flex px-3 py-1.5 text-xs text-slate-400 uppercase font-semibold">
            REACT
          </span>
        </div>

        {/* Right side course badge & mobile toggle */}
        <div className="flex items-center gap-2 pl-2">
          <Badge
            style={{ backgroundColor: currentCourse.accentColor }}
            className="text-white text-[11px] font-bold border-none hidden sm:inline-flex"
          >
            {currentCourse.categoryBadge}
          </Badge>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            aria-label="Toggle Chapters Sidebar"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Sidebar + Center Content */}
      <div className="flex flex-col lg:flex-row min-h-[780px]">
        {/* =====================================================================
            LEFT SIDEBAR: CHAPTER NAVIGATION (Exact W3Schools Sidebar from screenshot)
           ===================================================================== */}
        <aside
          className={cn(
            "w-full lg:w-64 xl:w-72 border-r border-slate-200 bg-[#F1F3F5] flex flex-col shrink-0 transition-all",
            mobileMenuOpen ? "block" : "hidden lg:flex"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                {currentCourse.sidebarTitle}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {currentCourse.chapters.length} Chapters
              </span>
            </div>

            {/* Quick Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* Chapter List */}
          <div className="overflow-y-auto max-h-[calc(100vh-220px)] lg:max-h-[750px] p-2 space-y-0.5 scrollbar-thin">
            {filteredChapters.map((ch, idx) => {
              const originalIndex = currentCourse.chapters.findIndex((c) => c.id === ch.id);
              const isActive = originalIndex === activeChapterIndex;
              const isBookmarked = bookmarkedChapters[ch.id];

              return (
                <div key={ch.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveChapterIndex(originalIndex);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between group",
                      isActive
                        ? "bg-[#E7E9EB] text-slate-950 font-bold border-l-4 border-[#04AA6D] shadow-xs"
                        : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
                    )}
                  >
                    <span className="truncate">{ch.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isBookmarked && (
                        <Bookmark className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                      {ch.subtopics && ch.subtopics.length > 0 && (
                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 text-slate-400 transition-transform",
                            isActive && "rotate-90 text-[#04AA6D]"
                          )}
                        />
                      )}
                    </div>
                  </button>

                  {/* Expandable subtopics matching user's screenshot (e.g., Syntax -> Syntax, Statements, Code Challenge) */}
                  {isActive && ch.subtopics && ch.subtopics.length > 0 && (
                    <div className="pl-5 pr-2 py-1 space-y-0.5 border-l-2 border-slate-300 ml-3">
                      {ch.subtopics.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 rounded cursor-pointer hover:bg-slate-200/60"
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* =====================================================================
            MAIN CONTENT AREA (Matches W3Schools Layout from screenshot)
           ===================================================================== */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-x-hidden bg-white">
          {/* Header Bar with Bookmark & Previous/Next Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {activeChapter.title}
              </h1>
              <button
                onClick={handleToggleBookmark}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition-colors"
                title="Bookmark this lesson"
                aria-label="Bookmark this lesson"
              >
                <Bookmark
                  className={cn(
                    "w-5 h-5",
                    bookmarkedChapters[activeChapter.id]
                      ? "text-amber-500 fill-amber-500"
                      : "text-slate-400"
                  )}
                />
              </button>
            </div>

            {/* Navigation Buttons: < Previous and Next > (Green button matching screenshot) */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevChapter}
                disabled={activeChapterIndex === 0}
                className="border-slate-300 text-slate-800 font-bold hover:bg-slate-100 rounded-lg px-3.5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextChapter}
                disabled={activeChapterIndex === currentCourse.chapters.length - 1}
                className="bg-[#04AA6D] hover:bg-[#059862] text-white font-bold rounded-lg px-4 border-none shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Social Share & Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-medium text-slate-700">{activeChapter.description}</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 font-bold text-slate-700 hover:text-brand-purple hover:border-brand-purple transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Share Lesson
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sections with Conceptual Explanations & Terminal Command Boxes */}
          <div className="space-y-6">
            {activeChapter.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {sec.title}
                </h2>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {sec.content}
                </p>

                {/* Dark Terminal / Command-Line Box (Matching screenshot: >>> print("Hello, World!") Hello, World!) */}
                {sec.terminalCommand && (
                  <div className="rounded-xl bg-[#000000] text-white p-4 font-mono text-xs sm:text-sm border border-slate-800 shadow-md space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800 mb-2">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <TerminalIcon className="w-3.5 h-3.5" />
                        Command Line / Interactive Shell
                      </span>
                      <span className="text-slate-500">W3 / CampusOS Terminal</span>
                    </div>
                    <div className="text-emerald-300 font-semibold">{sec.terminalCommand}</div>
                    {sec.terminalOutput && (
                      <div className="text-slate-200 pt-0.5 whitespace-pre-wrap">
                        {sec.terminalOutput}
                      </div>
                    )}
                  </div>
                )}

                {/* Code Snippet Box */}
                {sec.codeSnippet && (
                  <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs sm:text-sm border border-slate-800">
                    <pre className="overflow-x-auto whitespace-pre-wrap">{sec.codeSnippet.code}</pre>
                  </div>
                )}

                {/* Warning / Note Alert */}
                {sec.note && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{sec.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* =========================================================================
              "TRY IT YOURSELF" LIVE CODE SANDBOX (Interactive Run & Terminal Output)
             ========================================================================= */}
          <div className="rounded-2xl border-2 border-slate-300 bg-[#F1F3F5] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                  Interactive Practice
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {activeChapter.tryItYourself.title}
                </h3>
              </div>
              <Badge variant="cyan" className="font-bold uppercase text-[11px]">
                {activeChapter.tryItYourself.language}
              </Badge>
            </div>

            {/* Editable Code Editor */}
            <div className="space-y-2">
              <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-inner">
                <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span>Editor ({activeChapter.tryItYourself.language})</span>
                  <button
                    onClick={handleResetCode}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  rows={Math.max(4, editorCode.split("\n").length + 1)}
                  className="w-full p-4 font-mono text-xs sm:text-sm text-slate-900 bg-white focus:outline-none resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Action Buttons: Green "Run Code »" Button */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="bg-[#04AA6D] hover:bg-[#059862] text-white font-bold rounded-xl px-5 shadow-sm border-none"
                >
                  <Play className="w-4 h-4 mr-1.5 fill-current" />
                  {isRunningCode ? "Executing..." : "Run Code »"}
                </Button>
                <span className="text-xs text-slate-600 font-medium">
                  Click 'Run Code' to execute and inspect the console output.
                </span>
              </div>
            </div>

            {/* Live Terminal Output Panel */}
            <div className="rounded-xl bg-[#000000] text-emerald-400 p-4 font-mono text-xs sm:text-sm border border-slate-800 space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                <span className="font-bold flex items-center gap-1 text-slate-300">
                  <TerminalIcon className="w-3 h-3 text-emerald-400" />
                  Console Result / Terminal Output:
                </span>
                <span className="text-slate-500">status: ok</span>
              </div>
              <pre className="text-white whitespace-pre-wrap pt-1 font-mono text-xs sm:text-sm">
                {sandboxOutput}
              </pre>
            </div>

            {activeChapter.tryItYourself.explanation && (
              <p className="text-xs text-slate-600 font-medium">
                <strong>Concept:</strong> {activeChapter.tryItYourself.explanation}
              </p>
            )}
          </div>

          {/* =========================================================================
              "TEST YOURSELF WITH EXERCISES" (Code Challenge with Fill-in-the-Blank)
             ========================================================================= */}
          <div className="rounded-2xl border-2 border-slate-800 bg-[#282A35] text-white p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                  Test Yourself With Exercises
                </span>
                <h3 className="text-lg font-black text-white">{activeChapter.exercise.title}</h3>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                +{activeChapter.exercise.xp} XP
              </Badge>
            </div>

            <p className="text-sm text-slate-200 font-medium">{activeChapter.exercise.prompt}</p>

            {/* Interactive Code Exercise Box */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-700 p-4 space-y-3 font-mono text-xs sm:text-sm">
              <div className="text-slate-400 text-xs">Fill in the blank:</div>
              <div className="flex flex-wrap items-center gap-2 text-white">
                {activeChapter.exercise.codeTemplate.split("___").map((chunk, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span className="whitespace-pre">{chunk}</span>
                    {idx < arr.length - 1 && (
                      <input
                        type="text"
                        value={exerciseInput}
                        onChange={(e) => {
                          setExerciseInput(e.target.value);
                          if (exerciseStatus !== "idle") setExerciseStatus("idle");
                        }}
                        placeholder="answer"
                        className={cn(
                          "px-2.5 py-1 rounded-md font-mono text-xs sm:text-sm border-2 font-bold text-center transition-all bg-slate-950 focus:outline-none min-w-[90px]",
                          exerciseStatus === "correct"
                            ? "border-emerald-500 text-emerald-400 bg-emerald-950/30"
                            : exerciseStatus === "incorrect"
                            ? "border-red-500 text-red-400 bg-red-950/30"
                            : "border-slate-500 text-white focus:border-[#04AA6D]"
                        )}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Submit & Hint Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSubmitExercise}
                className="bg-[#04AA6D] hover:bg-[#059862] text-white font-bold rounded-xl px-5 border-none shadow-sm"
              >
                Submit Answer »
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700/60 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswer(!showAnswer)}
                className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/60 font-medium"
              >
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </Button>
            </div>

            {/* Status Notifications */}
            {exerciseStatus === "correct" && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Correct!</strong> Great job! You earned +{activeChapter.exercise.xp} XP. {activeChapter.exercise.explanation}
                </span>
              </div>
            )}

            {exerciseStatus === "incorrect" && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>Not quite right!</strong> Review the syntax and try again, or check the hint.
                </span>
              </div>
            )}

            {showHint && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                <strong>Hint:</strong> {activeChapter.exercise.hint}
              </div>
            )}

            {showAnswer && (
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-600 text-slate-200 text-xs">
                <strong>Answer:</strong>{" "}
                <code className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  {activeChapter.exercise.blankAnswer}
                </code>
              </div>
            )}
          </div>

          {/* Bottom Previous / Next Chapter Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevChapter}
              disabled={activeChapterIndex === 0}
              className="border-slate-300 text-slate-800 font-bold hover:bg-slate-100 rounded-lg px-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous Lesson
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextChapter}
              disabled={activeChapterIndex === currentCourse.chapters.length - 1}
              className="bg-[#04AA6D] hover:bg-[#059862] text-white font-bold rounded-lg px-5 border-none shadow-sm"
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
