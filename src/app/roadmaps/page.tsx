"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<"w3-studio" | "sprints">(
    "w3-studio",
  );
  const [selectedW3Course, setSelectedW3Course] = useState<
    "python" | "javascript" | "html" | "css" | "sql"
  >("python");

  useEffect(() => {
    setRoadmaps(getRoadmaps());
    const course = new URLSearchParams(window.location.search).get("course");
    if (getAllW3Courses().some((c) => c.id === course))
      setSelectedW3Course(course as W3Course["id"]);
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="section-heading">
          <div className="relative z-10 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Skill Roadmaps
            </h1>
            <p className="text-sm text-purple-100 max-w-2xl font-medium leading-relaxed">
              Learn a language or follow a career track.
            </p>

            {/* View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setActiveTab("w3-studio")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
                  activeTab === "w3-studio"
                    ? "bg-white text-brand-purple shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25",
                )}
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                Learn to code
              </button>
              <button
                onClick={() => setActiveTab("sprints")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm",
                  activeTab === "sprints"
                    ? "bg-white text-brand-purple shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25",
                )}
              >
                <Map className="w-4 h-4 text-cyan-300" />
                Career tracks
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: W3SCHOOLS INTERACTIVE ACADEMY STUDIO (Exact Layout from Image)
           ========================================================================= */}
        {activeTab === "w3-studio" && (
          <div className="space-y-4">
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
              <span className="font-bold text-brand-purple">Career tracks</span>
              <span>{roadmaps.length} Tracks Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmaps.map((rm) => {
                const progress = calculateRoadmapProgress(rm.weeks);

                return (
                  <Card
                    key={rm.id}
                    className="border-2 border-purple-100 bg-white flex flex-col justify-between hover:border-brand-purple shadow-none transition-all duration-200 rounded-3xl overflow-hidden"
                  >
                    <CardHeader className="bg-gradient-to-r from-purple-50/70 via-indigo-50/30 to-white pb-4 border-b border-purple-100/70">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-brand-purple uppercase tracking-wider text-[11px]">
                          {rm.durationWeeks}-Week Career Track
                        </span>
                        <Badge
                          variant="violet"
                          className="capitalize font-bold"
                        >
                          {rm.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold text-brand-purple">
                        {rm.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-700 leading-relaxed font-medium">
                        {rm.tagline}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-700 font-mono font-bold">
                          <span>Track Progress</span>
                          <span className="text-brand-purple">
                            {progress.percentage}% ({progress.completedTasks}/
                            {progress.totalTasks} Tasks)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
                          <div
                            className="h-full bg-gradient-to-r from-[#153e25] via-[#74B9FF] to-[#38D39F] rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Skills tags */}
                      <div className="pt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block mb-2">
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
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full font-bold shadow-md rounded-2xl py-2.5"
                        >
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
