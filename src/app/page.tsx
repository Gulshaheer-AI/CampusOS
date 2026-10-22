"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  Sparkles,
  Bot,
  Code2,
  FileQuestion,
  GraduationCap,
  Map,
  UserCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  Terminal,
  Zap,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"learn" | "experiment" | "test">("learn");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      {/* Main Hero Section - Prominent Royal Purple Clay Card */}
      <section className="relative overflow-hidden mx-4 my-6 sm:mx-6 lg:mx-8 rounded-3xl clay-card-purple p-8 sm:p-14 lg:p-20 text-white shadow-2xl">
        {/* Subtle 3D background lighting inside purple card */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-pink-400/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/15 text-white text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Introducing CampusOS • The Complete AI Student Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Learn Better. Build Real Skills.{" "}
            <span className="text-emerald-300 drop-shadow-sm">
              Grow Together.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed font-medium">
            CampusOS bridges the gap from classroom theory to engineering readiness. Master difficult
            academic concepts with Monday AI tutor, experiment in an isolated code playground, test your
            knowledge with QuizForge, and showcase your skills to real opportunities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto font-black bg-white text-brand-purple hover:bg-purple-50 shadow-xl border-none text-base px-8 h-12">
                Start Learning
                <ArrowRight className="w-5 h-5 ml-2 text-brand-purple" />
              </Button>
            </Link>
            <Link href="#preview">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold border-white/30 bg-white/10 text-white hover:bg-white/20 text-base px-8 h-12">
                Explore the Platform
              </Button>
            </Link>
          </div>

          {/* Value Highlights Pill bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-purple-100 font-bold">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Full Student &amp; Faculty Workspaces</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>Isolated Sandboxed CodePlay</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-pink-300 shrink-0" />
              <span>Instant Note-to-Quiz Generation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview Section */}
      <section id="preview" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="violet" className="mb-3 font-bold">
              Interactive Workspace
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-purple tracking-tight">
              A Connected Ecosystem for Learning and Creation
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
              Switch between learning concepts, writing live code, and evaluating your recall without
              leaving the unified CampusOS interface.
            </p>
          </div>

          {/* Interactive Mock Window */}
          <div className="rounded-3xl border-2 border-purple-100 bg-white shadow-clay overflow-hidden">
            {/* Window titlebar */}
            <div className="px-5 py-3.5 bg-purple-50/70 border-b border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-700 font-mono ml-2 font-semibold">campusos://workspace/cs101</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-purple-100 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("learn")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "learn"
                      ? "clay-button-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  1. Monday AI Tutor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("experiment")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "experiment"
                      ? "clay-button-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  2. CodePlay Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("test")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "test"
                      ? "clay-button-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  3. QuizForge Practice
                </button>
              </div>
            </div>

            {/* Window Body */}
            <div className="p-6 sm:p-8 min-h-[380px] flex items-center bg-white">
              {activeTab === "learn" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-purple uppercase tracking-wider">
                      <Bot className="w-4 h-4" />
                      <span>Contextual Monday AI Tutor</span>
                    </div>
                    <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-2xl text-xs space-y-1.5 text-slate-800">
                      <p className="font-bold text-brand-purple">Student Prompt:</p>
                      <p className="italic text-slate-700">&quot;Why does binary search require a sorted array, and how does the midpoint invariant work?&quot;</p>
                    </div>
                    <div className="clay-card-purple p-4 rounded-2xl text-xs space-y-1.5 text-white shadow-md">
                      <p className="font-bold text-emerald-200">Monday AI Tutor Explanation:</p>
                      <p className="leading-relaxed">
                        Binary search relies on the <strong>monotonic ordering invariant</strong>. Because elements
                        are sorted, comparing your target with the midpoint guarantees that all elements on one side
                        can be safely pruned without inspecting them.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-purple-100 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="text-xs font-bold text-brand-purple uppercase tracking-wider mb-1">
                        Interactive Step Visualization
                      </div>
                      <p className="text-xs text-slate-600 mb-4 font-medium">
                        Array size: 11 | Target: 23 | Comparison Step 1 of 2
                      </p>
                      <div className="grid grid-cols-11 gap-1 text-center font-mono text-xs">
                        {[2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91].map((val, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border ${
                              idx === 5
                                ? "bg-purple-100 border-brand-purple text-brand-purple font-black shadow-sm"
                                : idx === 0 || idx === 10
                                ? "border-purple-100 bg-purple-50/50 text-slate-800 font-semibold"
                                : "border-slate-100 text-slate-400"
                            }`}
                          >
                            <span className="block text-[9px] text-slate-500 mb-0.5">{idx}</span>
                            {val}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-xs text-slate-800 bg-purple-50 p-3 rounded-xl border border-purple-100 font-mono font-semibold">
                        mid = 0 + (10 - 0) / 2 = 5 → array[5] === 23 → Target found!
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-100 flex justify-end">
                      <Link href="/codeplay">
                        <Button size="sm" variant="primary" className="font-bold shadow-md">
                          Open CodePlay IDE
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "experiment" && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-brand-purple" />
                      <span>CodePlay Web Sandbox: Binary Search in TypeScript</span>
                    </span>
                    <span className="text-emerald-600 flex items-center gap-1 font-mono">
                      ● Sandboxed &amp; Safe
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-sm">
                      <pre className="text-cyan-400 font-bold mb-1">// Editable in CodePlay</pre>
                      <code>{`function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`}</code>
                    </div>
                    <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-brand-purple uppercase mb-2">Live Output</div>
                        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 font-mono text-xs text-emerald-700 font-semibold">
                          {`> binarySearch([2, 5, 8, 12, 16, 23, 38], 23)
Result: Index 5
Execution Time: 0.08ms
Tests Passed: 4 / 4`}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link href="/codeplay">
                          <Button size="sm" variant="primary" className="font-bold shadow-md">
                            Launch CodePlay Environment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "test" && (
                <div className="w-full max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span className="font-bold text-slate-900">QuizForge Assessment Mode</span>
                    <span className="text-brand-purple font-mono">Question 2 of 5</span>
                  </div>
                  <div className="bg-white border-2 border-purple-100 p-6 rounded-2xl space-y-4 shadow-sm">
                    <p className="text-sm font-bold text-slate-900">
                      In languages with fixed 32-bit integers, which midpoint formula safely prevents integer overflow?
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-700 font-medium">
                        A. mid = (low + high) / 2
                      </div>
                      <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-sm">
                        <span>B. mid = low + (high - low) / 2</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-700 font-medium">
                        C. mid = (high - low) / 2
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href="/quizzes">
                      <Button size="sm" variant="primary" className="font-bold shadow-md">
                        Generate Custom Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Pillars of CampusOS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="violet" className="mb-3 font-bold">
            Core Modules
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-purple tracking-tight">
            Built for Academic Rigor and Career Readiness
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            Every module is designed to reinforce understanding through active synthesis, not passive video consumption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Monday AI Tutor */}
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Monday AI Academic Tutor</h3>
              <p className="mt-3 text-sm text-white font-medium leading-relaxed">
                Multi-style contextual tutoring that adapts to your subject, academic level, and preferred
                learning method—from visual diagrams to worked exam steps.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Link href="/tutor" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/30 transition-all shadow-sm">
                Ask Monday AI <ArrowRight className="w-3.5 h-3.5 ml-1 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 2. Personalized Skill Roadmaps */}
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-sm">
                <Map className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Personalized Skill Roadmaps</h3>
              <p className="mt-3 text-sm text-white font-medium leading-relaxed">
                Step-by-step career syllabi extracted from authentic W3Schools tracks with interactive Try-It-Yourself code sandboxes and progress tracking.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Link href="/roadmaps" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/30 transition-all shadow-sm">
                Explore Roadmaps <ArrowRight className="w-3.5 h-3.5 ml-1 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 3. CodePlay */}
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-sm">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">CodePlay Coding IDE Lab</h3>
              <p className="mt-3 text-sm text-white font-medium leading-relaxed">
                A secure, sandboxed programming environment with Monday AI Copilot, file uploads, instant preview,
                and real-time syntax diagnostics.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Link href="/codeplay" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/30 transition-all shadow-sm">
                Open IDE lab <ArrowRight className="w-3.5 h-3.5 ml-1 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 4. QuizForge */}
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-sm">
                <FileQuestion className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">QuizForge Assessment Engine</h3>
              <p className="mt-3 text-sm text-white font-medium leading-relaxed">
                Generate targeted quizzes from pasted lecture notes or course syllabi. Complete practice runs with
                detailed explanations and weak-topic diagnostics.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Link href="/quizzes" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/30 transition-all shadow-sm">
                Build a quiz <ArrowRight className="w-3.5 h-3.5 ml-1 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 5. Teacher Studio */}
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Teacher Studio</h3>
              <p className="mt-3 text-sm text-white font-medium leading-relaxed">
                Instructors manage Ahmad, Hassan, and Zain rosters, publish quizzes, upload subject lecture notes,
                edit courses, and review score analytics.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Link href="/teacher" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/30 transition-all shadow-sm">
                Teacher dashboard <ArrowRight className="w-3.5 h-3.5 ml-1 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 6. Grow & Portfolio */}
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-sm">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Skill Roadmaps &amp; Portfolio</h3>
              <p className="mt-3 text-sm text-white font-medium leading-relaxed">
                Follow structured 4-week roadmaps across Web Dev, Data, and Design. Complete challenges to build a
                verified student portfolio for internship applications.
              </p>
            </div>
            <div className="pt-6 mt-auto">
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl border border-white/30 transition-all shadow-sm">
                View portfolio <ArrowRight className="w-3.5 h-3.5 ml-1 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Student Growth Cycle */}
      <section className="py-20 bg-purple-50/50 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="violet" className="mb-3 font-bold">
              The Learning Cycle
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-purple tracking-tight">
              From Concept to Applied Mastery
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
              Rote memorization fades within weeks. The CampusOS cycle turns knowledge into lasting practical skill.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { step: "01", name: "EXPLAIN", desc: "Monday AI clarifies foundational theory & definitions" },
              { step: "02", name: "ROADMAP", desc: "Structured W3Schools tracks build step-by-step mastery" },
              { step: "03", name: "EXPERIMENT", desc: "CodePlay playground validates edge cases" },
              { step: "04", name: "PRACTICE", desc: "Targeted problem sets reinforce recall" },
              { step: "05", name: "TEST", desc: "QuizForge evaluates exam readiness" },
              { step: "06", name: "IMPROVE", desc: "Weak topics feed into roadmap challenges" },
            ].map((cycle, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border-2 border-purple-100 bg-white shadow-clay flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-black text-brand-purple">{cycle.step}</span>
                  <h4 className="mt-2 text-base font-black text-slate-900 tracking-wider">{cycle.name}</h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">{cycle.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Use Cases: Students vs Teachers */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Students */}
          <div className="p-8 sm:p-10 rounded-3xl border-2 border-purple-100 bg-white shadow-clay relative overflow-hidden">
            <div className="inline-flex items-center gap-2 text-brand-purple text-xs font-black uppercase tracking-wider mb-4">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>For University Students</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Turn Study Time Into Tangible Skills</h3>
            <ul className="mt-6 space-y-3.5 text-sm text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Get unblocked 24/7 on tough course material with Monday AI without waiting for office hours.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Paste lecture slides or notes to generate realistic mock exams before midterms.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Follow guided 4-week career roadmaps and build an attractive public portfolio.</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/for-students">
                <Button variant="primary" className="font-bold shadow-md">
                  Explore Student Journey
                </Button>
              </Link>
            </div>
          </div>

          {/* For Teachers */}
          <div className="p-8 sm:p-10 rounded-3xl border-2 border-purple-200 bg-purple-50/60 shadow-clay relative overflow-hidden">
            <div className="inline-flex items-center gap-2 text-brand-purple text-xs font-black uppercase tracking-wider mb-4">
              <GraduationCap className="w-4 h-4 text-brand-purple" />
              <span>For Teachers &amp; Faculty</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Effortless Assessments &amp; Learning Analytics</h3>
            <ul className="mt-6 space-y-3.5 text-sm text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                <span>Generate draft quiz questions from course PDFs with full editorial control.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                <span>Assign quizzes with strict timers, passing scores, and publish directly to student portals.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                <span>Identify individual student weaknesses (Ahmad, Hassan, Zain) and export grades to CSV.</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/for-teachers">
                <Button variant="primary" className="font-bold shadow-md">
                  Explore Teacher Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-purple-50/40 border-t border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="violet" className="mb-3 font-bold">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl font-black text-brand-purple tracking-tight">Everything You Need to Know</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What makes CampusOS different from standard study apps?",
                a: "CampusOS unites the entire learning pipeline in one place: conceptual AI explanations with Monday AI, interactive algorithm simulations, isolated code execution, automatic quiz generation, and verified student portfolios.",
              },
              {
                q: "How does CodePlay run student code securely?",
                a: "CodePlay runs frontend code inside an isolated, sandboxed iframe with strict Content Security Policies (CSP) and zero access to parent cookies, authentication credentials, or server APIs.",
              },
              {
                q: "Can professors review and edit AI-generated quiz questions before assigning them?",
                a: "Yes. In Teacher Studio, all AI-generated questions are created as drafts. Instructors must explicitly review, adjust, add custom questions, and publish the quiz before students can access it.",
              },
              {
                q: "Is there a demo mode if external LLM API keys are not provided?",
                a: "Yes. CampusOS features a transparent Demo Mode with built-in pedagogical knowledge bases for key computer science, algorithm, and database topics, so all workflows remain fully functional without external keys.",
              },
              {
                q: "Can students control what is visible on their public portfolio?",
                a: "Absolutely. Students can toggle project visibility individually. Private notes, test attempts, grades, and personal tutor conversations are never made public.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="border-2 border-purple-100 rounded-2xl bg-white shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 hover:text-brand-purple transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180 text-brand-purple" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-purple-50 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action - Prominent Royal Purple Clay Card */}
      <section className="mx-4 my-12 sm:mx-6 lg:mx-8 rounded-3xl clay-card-purple p-10 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to elevate your academic and engineering journey?
          </h2>
          <p className="mt-4 text-purple-100 text-base max-w-xl mx-auto font-medium">
            Join students and instructors experiencing active, interactive, and career-aligned education.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-brand-purple hover:bg-purple-50 font-black shadow-xl border-none text-base px-8 h-12">
                Get Started with CampusOS
                <ArrowRight className="w-5 h-5 ml-2 text-brand-purple" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold text-base px-8 h-12">
                Launch Interactive Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
