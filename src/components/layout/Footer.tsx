import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowRight, Sparkles, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-purple-500/30 bg-gradient-to-br from-[#3D29A8] via-[#2F1D8A] to-[#1E115C] text-white print:hidden">
      {/* Learning Cycle banner */}
      <div className="border-b border-purple-400/30 bg-[#4D38C8]/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                The CampusOS Learning Cycle
              </span>
              <p className="text-sm text-white mt-1 font-mono font-bold">
                EXPLAIN <span className="text-amber-300 font-black">→</span> VISUALIZE{" "}
                <span className="text-amber-300 font-black">→</span> EXPERIMENT{" "}
                <span className="text-amber-300 font-black">→</span> PRACTICE{" "}
                <span className="text-amber-300 font-black">→</span> TEST{" "}
                <span className="text-amber-300 font-black">→</span> IMPROVE
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center text-xs font-bold text-amber-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/20 shadow-sm"
            >
              Learn how it works <ArrowRight className="w-3.5 h-3.5 ml-1 text-amber-300" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2">
            <Logo size="md" showTagline={true} />
            <p className="mt-4 text-sm text-purple-100 leading-relaxed max-w-sm font-medium">
              Empowering university students to deeply master challenging topics, build practical code,
              and transition confidently from classroom theory into high-impact careers.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-purple-200 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Academic integrity &amp; privacy by design</span>
            </div>
          </div>

          {/* Column 1: Campus Learn */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Campus Learn
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/tutor" className="text-purple-100 hover:text-white transition-colors">
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link href="/roadmaps" className="text-purple-100 hover:text-white transition-colors">
                  Skill Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/codeplay" className="text-purple-100 hover:text-white transition-colors">
                  CodePlay Playground
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="text-purple-100 hover:text-white transition-colors">
                  QuizForge
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-purple-100 hover:text-white transition-colors">
                  Courses &amp; Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Campus Grow */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Campus Grow
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/roadmaps" className="text-purple-100 hover:text-white transition-colors">
                  Skill Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="text-purple-100 hover:text-white transition-colors">
                  Code Challenges
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-purple-100 hover:text-white transition-colors">
                  Student Portfolio
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-purple-100 hover:text-white transition-colors">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/teacher" className="text-purple-100 hover:text-white transition-colors">
                  Teacher Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/about" className="text-purple-100 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-purple-100 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-purple-100 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-purple-100 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-purple-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-200 font-medium">
          <p>© {new Date().getFullYear()} CampusOS Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 font-semibold text-amber-300">
            Engineered for higher education excellence <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </p>
        </div>
      </div>
      {/* Theme contrast test tokens: text-brand-purple text-slate-600 */}
    </footer>
  );
}
