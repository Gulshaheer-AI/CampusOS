"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getRoadmapById, getRoadmaps, toggleRoadmapTask } from "@/lib/store";
import { Roadmap, RoadmapTask } from "@/types";
import { calculateRoadmapProgress } from "@/lib/scoring";
import { W3InteractiveLab } from "@/components/learn/W3InteractiveLab";
import { W3CourseStudio } from "@/components/learn/W3CourseStudio";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to map roadmap ID or category to W3 course ID
function resolveW3CourseId(roadmapId: string, category: string): "python" | "javascript" | "html" | "css" | "sql" {
  const lower = `${roadmapId} ${category}`.toLowerCase();
  if (lower.includes("python")) return "python";
  if (lower.includes("sql") || lower.includes("data_analytics")) return "sql";
  if (lower.includes("html")) return "html";
  if (lower.includes("css") || lower.includes("ui_ux")) return "css";
  if (lower.includes("js") || lower.includes("javascript") || lower.includes("web_dev") || lower.includes("react")) return "javascript";
  return "python";
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = (params?.roadmapId as string) || "";

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"w3-studio" | "milestones">("w3-studio");

  useEffect(() => {
    if (roadmapId) {
      let found = getRoadmapById(roadmapId);

      // Support alias IDs like w3-python, python, etc.
      if (!found) {
        const all = getRoadmaps();
        if (roadmapId.includes("python")) {
          found = all.find((r) => r.id === "roadmap-w3-python");
        } else if (roadmapId.includes("sql")) {
          found = all.find((r) => r.id === "roadmap-w3-sql");
        } else if (roadmapId.includes("js") || roadmapId.includes("javascript")) {
          found = all.find((r) => r.id === "roadmap-w3-js-es6");
        } else if (roadmapId.includes("html") || roadmapId.includes("css")) {
          found = all.find((r) => r.id === "roadmap-w3-html-css");
        }
      }

      if (found) {
        setRoadmap(found);
        const firstTask = found.weeks[0]?.tasks[0];
        if (firstTask) setExpandedTaskId(firstTask.id);
      }
    }
  }, [roadmapId]);

  if (!roadmap) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Roadmap Not Found</h2>
          <Button variant="outline" onClick={() => router.push("/roadmaps")} className="border-purple-200 text-slate-800 font-bold">
            Back to Roadmaps
          </Button>
        </div>
      </AppShell>
    );
  }

  const progress = calculateRoadmapProgress(roadmap.weeks);
  const resolvedW3Course = resolveW3CourseId(roadmap.id, roadmap.category);

  const handleToggleTask = (weekNumber: number, taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleRoadmapTask(roadmap.id, weekNumber, taskId);
    if (updated) {
      setRoadmap({ ...updated });
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <Link
          href="/roadmaps"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 text-brand-purple" />
          Back to Roadmaps Catalog
        </Link>

        {/* Roadmap Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-6 sm:p-8 space-y-4 text-white shadow-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" className="capitalize font-bold">
                {roadmap.category.replace("_", " ")}
              </Badge>
              <span className="text-xs bg-white/20 text-white font-bold px-3 py-0.5 rounded-full">
                W3Schools Verified Track
              </span>
              <span className="text-xs text-purple-100 font-mono font-semibold">
                {roadmap.durationWeeks}-Week Sprint
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{roadmap.title}</h1>
            <p className="text-sm text-purple-100 max-w-3xl leading-relaxed font-medium">{roadmap.description}</p>

            {/* View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab("w3-studio")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
                  activeTab === "w3-studio"
                    ? "bg-white text-brand-purple shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                )}
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                W3Schools Interactive Studio (Chapters, Terminal, Live Try-It)
              </button>
              <button
                onClick={() => setActiveTab("milestones")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
                  activeTab === "milestones"
                    ? "bg-white text-brand-purple shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                )}
              >
                <Clock className="w-4 h-4 text-cyan-300" />
                4-Week Sprint Checklist ({progress.percentage}% Done)
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: W3SCHOOLS INTERACTIVE ACADEMY STUDIO
           ========================================================================= */}
        {activeTab === "w3-studio" && (
          <div className="space-y-4">
            <W3CourseStudio initialCourseId={resolvedW3Course} />
          </div>
        )}

        {/* =========================================================================
            TAB 2: WEEKLY TASK BREAKDOWN CHECKLIST
           ========================================================================= */}
        {activeTab === "milestones" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-purple" />
                Curriculum Checklist &amp; Interactive Code Labs
              </h2>
              <span className="text-xs text-slate-600 font-medium">
                Click any task to open its interactive Try-It-Yourself sandbox
              </span>
            </div>

            <div className="space-y-6">
              {roadmap.weeks.map((week) => (
                <div key={week.weekNumber} className="rounded-3xl border-2 border-purple-100 bg-white p-6 space-y-4 shadow-clay text-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-100 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-purple">
                        WEEK {week.weekNumber}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">{week.title}</h3>
                    </div>
                    <Badge variant="violet" className="font-bold">{week.tasks.length} Milestones</Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{week.description}</p>

                  <div className="space-y-3 pt-2">
                    {week.tasks.map((task: RoadmapTask) => {
                      const isExpanded = expandedTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-purple-100 bg-purple-50/40 overflow-hidden transition-all shadow-sm"
                        >
                          <div
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-50/80 transition-colors text-xs select-none"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => handleToggleTask(week.weekNumber, task.id, e)}
                                className="text-emerald-600 focus:outline-none"
                                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-400 hover:text-brand-purple" />
                                )}
                              </button>
                              <div>
                                <div
                                  className={cn(
                                    "font-bold text-sm text-slate-900",
                                    task.completed && "line-through text-slate-400"
                                  )}
                                >
                                  {task.title}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                                  Reference: {task.resourceTitle}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex border-purple-200 text-brand-purple font-bold">
                                <Code2 className="w-3 h-3 mr-1 text-brand-purple" />
                                Try It Yourself
                              </Badge>
                              <span className="text-[11px] font-mono font-bold text-slate-600 px-2 py-0.5 rounded-full bg-white border border-purple-100">
                                {task.estimatedHours}h
                              </span>
                              <Badge variant="violet" className="text-[10px] capitalize font-bold">
                                {task.type}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 pt-2 border-t border-purple-100 bg-white">
                              <W3InteractiveLab
                                title={task.title}
                                category={roadmap.category}
                                syntaxNotes={task.syntaxNotes}
                                codeExample={task.codeExample}
                                exercise={task.exercise}
                                onCompleteExercise={() => {
                                  if (!task.completed) {
                                    handleToggleTask(week.weekNumber, task.id);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Notice */}
        <div className="p-4 flex items-start gap-3 text-xs text-amber-950 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">
            <strong className="font-bold">Educational Notice:</strong> W3Schools interactive curricula and skill roadmaps are structured
            learning guides designed to build genuine programming competence.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
