"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  getChallenges,
  getUserGamification,
  refillUserHearts,
  getCurrentUser,
} from "@/lib/store";
import { Challenge, UserProfile } from "@/types";
import {
  Trophy,
  ArrowRight,
  Sparkles,
  Filter,
  Code2,
  Award,
  Heart,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState({
    hearts: 5,
    streak: 3,
    xp: 350,
    completedStages: {} as Record<string, number[]>,
  });

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setChallenges(getChallenges());
    if (current) {
      setGamification(getUserGamification(current.id));
    }
  }, []);

  const handleRefill = () => {
    if (user) {
      refillUserHearts(user.id);
      setGamification(getUserGamification(user.id));
    }
  };

  const categories = ["All", ...Array.from(new Set(challenges.map((c) => c.category)))];

  const filtered = challenges.filter(
    (c) => selectedCategory === "All" || c.category === selectedCategory
  );

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header & Gamification Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="purple">Campus Grow</Badge>
              <Badge variant="cyan" className="font-bold">W3Schools Academy Challenges</Badge>
              <span className="text-xs text-slate-500 font-medium">Duolingo-Calibrated AI Training Ladder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Skill Challenges &amp; Stage Ladders
            </h1>
            <p className="mt-1 text-sm text-slate-600 font-medium">
              Train stage-by-stage from W3Schools concept warmups to code construction, terminal labs, and boss edge-case challenges with Gemini AI coaching.
            </p>
          </div>

          {/* Gamified HUD */}
          <div className="flex items-center gap-3 bg-white border border-purple-200 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-clay shrink-0">
            {/* Hearts / Lives */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-xl border border-rose-200">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-950">{gamification.hearts}/5</span>
              {gamification.hearts < 5 && (
                <button
                  type="button"
                  onClick={handleRefill}
                  className="ml-1 text-[10px] text-brand-purple hover:underline font-bold"
                  title="Refill Hearts"
                >
                  Refill
                </button>
              )}
            </div>

            {/* Daily Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-950">{gamification.streak} Days</span>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-xl border border-purple-200">
              <Zap className="w-4 h-4 text-brand-purple fill-brand-purple" />
              <span className="text-xs font-bold text-slate-950">{gamification.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedCategory === cat
                  ? "clay-button-primary text-white shadow-md"
                  : "bg-white border border-purple-200 text-slate-700 hover:text-brand-purple hover:border-purple-300 shadow-sm"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((challenge) => {
            const completed = gamification.completedStages[challenge.id] || [];
            const stagesCount = 4;
            const progressPct = Math.round((completed.length / stagesCount) * 100);

            const difficultyBadge = {
              easy: "tag10",
              medium: "tag2",
              hard: "tag1",
            }[challenge.difficulty] as any;

            return (
              <Card
                key={challenge.id}
                className="bg-white border border-purple-100 shadow-clay flex flex-col justify-between hover:border-purple-300 transition-all hover:-translate-y-0.5 rounded-2xl"
              >
                <CardHeader>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-brand-purple">{challenge.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={difficultyBadge} className="capitalize text-[10px]">
                        {challenge.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
                        <Award className="w-3.5 h-3.5" />
                        <span>+{challenge.xp} XP</span>
                      </div>
                    </div>
                  </div>

                  <CardTitle className="text-lg font-extrabold text-slate-950">{challenge.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    {challenge.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Duolingo Stage Ladder Progress */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-bold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-purple" />
                        Stage Ladder Progress
                      </span>
                      <span className="text-slate-950 font-extrabold">
                        {completed.length} / {stagesCount} Stages
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-purple rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(8, progressPct)}%` }}
                      />
                    </div>

                    {/* Stage Step Indicators */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {["Warmup", "Fill-in", "Construct", "Boss"].map((label, idx) => {
                        const isDone = completed.includes(idx + 1);
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "text-center py-1 rounded text-[9px] font-bold border",
                              isDone
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                : "bg-white border-purple-100 text-slate-500 font-medium"
                            )}
                          >
                            {isDone ? "✓ " : `${idx + 1}. `}
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link href={`/challenges/${challenge.id}`}>
                    <Button variant="primary" size="sm" className="w-full font-bold shadow-md">
                      {completed.length === 0 ? "Start Stage 1 Warmup" : `Continue Stage ${completed.length + 1}`}
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
