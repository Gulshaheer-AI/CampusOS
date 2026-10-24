"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getRoadmaps } from "@/lib/store";
import type { W3Course } from "@/lib/w3schools-data";
import { Roadmap } from "@/types";
import { calculateRoadmapProgress } from "@/lib/scoring";
import { W3CourseStudio } from "@/components/learn/W3CourseStudio";
import { getAllW3Courses } from "@/lib/w3schools-data";
import {
  Map,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Code2,
  Terminal,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeTab, setActiveTab] = useState<"w3-studio" | "sprints">("w3-studio");
  const [selectedW3Course, setSelectedW3Course] = useState<"python" | "javascript" | "html" | "css" | "sql">("python");

  const w3Courses = getAllW3Courses();

  useEffect(() => {
    setRoadmaps(getRoadmaps());
    const course = new URLSearchParams(window.location.search).get("course");
    if (getAllW3Courses().some(c => c.id === course)) setSelectedW3Course(course as W3Course["id"]);
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-6 sm:p-8 relative overflow-hidden text-white shadow-xl rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" className="font-bold">Campus Learn &amp; Grow</Badge>
              <span className="text-xs text-purple-100 font-semibold">
                Official W3Schools Curricula &amp; 4-Week Career Sprints
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Interactive Skill Roadmaps &amp; W3 Code Academy
            </h1>
            <p className="text-sm text-purple-100 max-w-2xl font-medium leading-relaxed">
              Master industry-standard programming tracks with real W3Schools curriculum, live terminal command lines, Try-It-Yourself code sandboxes, and interactive code challenges.
            </p>

            {/* View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
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
                W3Schools Interactive Studio (5 Courses)
              </button>
              <button
                onClick={() => setActiveTab("sprints")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
                  activeTab === "sprints"
                    ? "bg-white text-brand-purple shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                )}
              >
                <Map className="w-4 h-4 text-cyan-300" />
                4-Week Career Sprint Checklists
              </button>
            </div>
          </div>
        </div>

        {/* 5 W3 Core Course Track Selector Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-purple" />
              W3Schools Core Foundation Tracks
            </h2>
            <span className="text-xs text-slate-600 font-medium hidden sm:inline">
              Click any course to load its interactive chapters &amp; terminal labs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {w3Courses.map((c) => {
              const isSelected = selectedW3Course === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedW3Course(c.id);
                    setActiveTab("w3-studio");
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 shadow-sm hover:scale-[1.02]",
                    isSelected
                      ? "border-brand-purple bg-purple-50/80 ring-2 ring-brand-purple/20 shadow-md"
                      : "border-slate-200 bg-white hover:border-purple-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{ backgroundColor: c.accentColor }}
                      className="w-2.5 h-2.5 rounded-full inline-block"
                    />
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 px-1.5">
                      {c.chapters.length} Ch
                    </Badge>
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">{c.categoryBadge}</div>
                  </div>
                  <div className="text-[10px] font-bold text-brand-purple flex items-center gap-1 pt-1 border-t border-purple-100">
                    <span>{isSelected ? "Active Studio" : "Open Track"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: W3SCHOOLS INTERACTIVE ACADEMY STUDIO (Exact Layout from Image)
           ========================================================================= */}
        {activeTab === "w3-studio" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold flex items-center gap-1.5 text-brand-purple">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Live Interactive W3 Learning Studio: {selectedW3Course.toUpperCase()}
              </span>
              <span className="font-mono text-slate-500">
                100% Extracted W3Schools Syllabi &amp; Sandboxes
              </span>
            </div>

            <W3CourseStudio
              initialCourseId={selectedW3Course}
              onTrackChange={(courseId: any) => setSelectedW3Course(courseId)}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 2: 4-WEEK CAREER SPRINT ROADMAPS CATALOG
           ========================================================================= */}
        {activeTab === "sprints" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold text-brand-purple">
                Structured 4-Week Milestone Checklists
              </span>
              <span>{roadmaps.length} Tracks Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadmaps.map((rm) => {
                const progress = calculateRoadmapProgress(rm.weeks);

                return (
                  <Card
                    key={rm.id}
                    className="border-2 border-purple-100 bg-white flex flex-col justify-between hover:border-brand-purple shadow-clay transition-all duration-200 rounded-3xl overflow-hidden"
                  >
                    <CardHeader className="bg-gradient-to-r from-purple-50/70 via-indigo-50/30 to-white pb-4 border-b border-purple-100/70">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-black text-brand-purple uppercase tracking-wider text-[11px]">
                          {rm.durationWeeks}-Week Career Track
                        </span>
                        <Badge variant="violet" className="capitalize font-bold">
                          {rm.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-black text-brand-purple">{rm.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-700 leading-relaxed font-medium">
                        {rm.tagline}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-700 font-mono font-bold">
                          <span>Track Progress</span>
                          <span className="text-brand-purple">{progress.percentage}% ({progress.completedTasks}/{progress.totalTasks} Tasks)</span>
                        </div>
                        <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
                          <div
                            className="h-full bg-gradient-to-r from-[#6653E6] via-[#74B9FF] to-[#38D39F] rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Skills tags */}
                      <div className="pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-2">
                          Target Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rm.skillsGained.map((sk, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-brand-purple font-bold text-[11px]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link href={`/roadmaps/${rm.id}`} className="block pt-2">
                        <Button variant="primary" size="sm" className="w-full font-bold shadow-md rounded-2xl py-2.5">
                          View 4-Week Curriculum &amp; Labs
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
