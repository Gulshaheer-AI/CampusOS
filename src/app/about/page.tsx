"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Sparkles, Target, HeartHandshake, Shield, Lightbulb, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const principles = [
    {
      title: "Active Synthesis over Passive Watching",
      desc: "Watching an instructor write code or solve equations creates an illusion of competence. True learning only occurs when students struggle with edge cases, debug runtime errors, and produce solutions themselves.",
      icon: Target,
    },
    {
      title: "Immediate, Non-Judgmental Feedback",
      desc: "Students often hesitate to ask basic questions in large lecture halls for fear of embarrassment. An AI tutor provides a patient, safe space to ask for 5 different analogies until intuition clicks.",
      icon: Lightbulb,
    },
    {
      title: "Privacy & Data Dignity by Default",
      desc: "Student personal queries, rough notes, and practice mistakes belong to the student. They are never sold, published, or exposed to recruiters without explicit, opt-in consent.",
      icon: Shield,
    },
    {
      title: "Classroom Theory Grounded in Industry Practice",
      desc: "Academic algorithms should not exist in an abstract vacuum. We show students how binary search powers database indexes, how recursion drives compilers, and how SQL joins run high-scale services.",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-8 sm:p-14 relative overflow-hidden text-white shadow-xl rounded-3xl mb-12 text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-400/20 blur-[70px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/15 px-3 py-1 rounded-full mb-4">
              Our Purpose &amp; Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              From Classroom to Career
            </h1>
            <p className="mt-4 text-base sm:text-lg text-purple-100 leading-relaxed font-medium">
              CampusOS was conceived with a clear mission: empower every university student to conquer difficult
              technical coursework, build verifiable practical skills, and step into the technology industry with confidence.
            </p>
          </div>
        </div>

        {/* The Problem & The Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl border-2 border-purple-100 bg-white shadow-clay">
            <h3 className="text-xl font-black text-brand-purple mb-3">The Higher-Ed Disconnect</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              Traditional computer science and engineering programs deliver deep theoretical foundations, but large
              class sizes leave professors overloaded and students isolated when homework problems become roadblocks.
              Meanwhile, tech recruiters seek verified hands-on engineering experience that traditional coursework rarely displays.
            </p>
          </div>

          <div className="p-8 rounded-3xl border-2 border-purple-100 bg-white shadow-clay">
            <h3 className="text-xl font-black text-brand-purple mb-3">The CampusOS Vision</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              We connect the loop between learning, testing, and practical demonstration. By pairing personalized
              AI tutoring with interactive simulations, safe coding sandboxes, and student portfolios, students don&apos;t just
              pass exams—they become proficient builders.
            </p>
          </div>
        </div>

        {/* Guiding Principles */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8">
            Our Guiding Pedagogical Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((p, idx) => {
              const Icon = p.icon;
              return (
                <Card key={idx} className="border-2 border-purple-100 bg-white shadow-clay rounded-3xl">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-brand-purple mb-3 shadow-inner">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-black text-brand-purple">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-0">
                    {p.desc}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="clay-card-purple p-8 sm:p-12 text-center rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Join the CampusOS Community</h3>
            <p className="mt-2 text-sm text-purple-100 font-medium max-w-xl mx-auto">
              Explore the platform or get in touch with our team for institutional integration inquiries.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="clay-button-white bg-white text-brand-purple font-black hover:bg-purple-50 shadow-lg px-6 py-2.5 rounded-2xl border-none">
                  Launch Workspace
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="border-2 border-white/40 text-white hover:bg-white/15 font-bold px-6 py-2.5 rounded-2xl">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
