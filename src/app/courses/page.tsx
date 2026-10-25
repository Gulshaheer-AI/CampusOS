"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getCourses, enrollWithClassCode } from "@/lib/store";
import { Course } from "@/types";
import { BookOpen, Users, ArrowRight, Search, Play, FileText, CheckCircle2 } from "lucide-react";

export default function CoursesPage() {
  const [loaded, setLoaded] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCourses(getCourses());
    setLoaded(true);
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnrollWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollCode.trim()) return;
    setEnrollError(null);
    setEnrollSuccess(null);

    try {
      const course = enrollWithClassCode(enrollCode);
      setCourses(getCourses());
      setEnrollSuccess(`You are enrolled in ${course.title}.`);
    } catch (error) {
      setEnrollError(error instanceof Error ? error.message : "Enrollment failed.");
      return;
    }
    setEnrollCode("");
    setTimeout(() => setEnrollSuccess(null), 4000);
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="section-heading">

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Courses</h1>
              <p className="mt-2 text-sm text-purple-100 max-w-2xl font-medium leading-relaxed">Your courses, materials, and progress.</p>
            </div>

            {/* Quick Class Code Enrollment Form */}
            <form onSubmit={handleEnrollWithCode} className="flex items-center gap-2 bg-white/15 p-2 rounded-2xl border border-white/20">
              <input
                type="text"
                disabled={!loaded}
                value={enrollCode}
                onChange={(e) => setEnrollCode(e.target.value)}
                placeholder="Class Code (e.g. CS101-FALL)"
                className="bg-white border-none rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none uppercase font-mono shadow-sm"
              />
              <Button disabled={!loaded} size="sm" type="submit" className="bg-white text-brand-purple hover:bg-purple-50 font-semibold shadow-md border-none">
                Enroll
              </Button>
            </form>
          </div>
        </div>

        {enrollError && <p role="alert" className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-900">{enrollError}</p>}
        {enrollSuccess && (
          <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{enrollSuccess}</span>
          </div>
        )}

        <Link href="/roadmaps" className="workspace-quick-link">
          <BookOpen size={18} />
          <span>Practice coding</span>
          <span className="ml-auto text-xs text-slate-500">Python, JavaScript, HTML, CSS, SQL</span>
          <ArrowRight size={16} />
        </Link>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by code, title, or instructor..."
            className="w-full bg-white border border-purple-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm"
          />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((course) => {
            const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
            const completedLessons = course.modules.reduce(
              (sum, m) => sum + m.lessons.filter((l) => l.isCompleted).length,
              0
            );
            const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            return (
              <Card key={course.id} className="bg-white border border-purple-100 shadow-none flex flex-col justify-between hover:border-purple-300 transition-all rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-brand-purple bg-purple-100 px-2 py-0.5 rounded">
                      {course.code}
                    </span>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-950">{course.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 font-medium line-clamp-1">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium font-mono">
                      <span>Progress</span>
                      <span>{progress}% ({completedLessons}/{totalLessons} Lessons)</span>
                    </div>
                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-purple rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-purple-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-brand-purple" />
                      {course.instructorName}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium">
                      <FileText className="w-3.5 h-3.5 text-brand-purple" />
                      {course.materials.length} Materials
                    </span>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <Button variant="primary" size="sm" className="w-full mt-2 font-bold shadow-md">
                      Open course
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
