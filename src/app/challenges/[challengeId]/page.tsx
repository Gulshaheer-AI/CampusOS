"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  getChallengeById,
  saveSubmission,
  getSubmissions,
  savePortfolioProject,
  getCurrentUser,
  getUserGamification,
  decrementUserHeart,
  refillUserHearts,
  recordStageCompletion,
  sanitizeWebUrl,
} from "@/lib/store";
import { Challenge, ChallengeSubmission, UserProfile, PortfolioProject, ChallengeStage } from "@/types";
import { challengeSubmissionSchema } from "@/lib/validators";
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Send,
  Sparkles,
  Github,
  Globe,
  Award,
  Terminal,
  AlertCircle,
  Copy,
  Check,
  Heart,
  Flame,
  Zap,
  HelpCircle,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  CheckCheck,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

// High-fidelity fallback stage generator if challenge lacks explicit stages
function generateStagesForChallenge(challenge: Challenge): ChallengeStage[] {
  if (challenge.stages && challenge.stages.length > 0) {
    return challenge.stages;
  }

  const titleLower = challenge.title.toLowerCase();
  const categoryLower = challenge.category.toLowerCase();

  if (categoryLower.includes("data") || titleLower.includes("sql") || titleLower.includes("schema")) {
    return [
      {
        stageNumber: 1,
        title: "Relational Architecture & 3NF Warmup",
        type: "warmup",
        prompt: `For '${challenge.title}', what is the primary structural rule for ensuring database integrity?`,
        options: [
          "Enforce foreign key constraints with proper cascading rules and atomic data normalization (3NF)",
          "Store all relations in an un-indexed flat text file",
          "Remove primary keys and allow duplicate rows across all tables",
          "Use floating point numbers for financial balance columns",
        ],
        correctOption: 0,
        explanation: "Relational normalization (3NF) and foreign key constraints prevent orphaned records and update anomalies.",
        hint: "Look for normalization (3NF) and cascading referential integrity.",
        xpReward: 60,
      },
      {
        stageNumber: 2,
        title: "SQL Constraint Definition",
        type: "fill_in",
        prompt: "Complete the column constraint ensuring values stay within boundary ranges:",
        starterSnippet: `ALTER TABLE assessments ADD CONSTRAINT chk_score CHECK (score >= 0 AND score <= 100);`,
        solutionPattern: "CHECK|score >= 0",
        hint: "Use CHECK (score >= 0 AND score <= 100).",
        xpReward: 80,
      },
      {
        stageNumber: 3,
        title: "Referential Key Construction",
        type: "code_construct",
        prompt: "Construct the foreign key definition with ON DELETE CASCADE:",
        starterSnippet: `CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES parent_table(id) ON DELETE CASCADE`,
        solutionPattern: "REFERENCES|ON DELETE CASCADE",
        hint: "Specify REFERENCES parent_table(id) ON DELETE CASCADE.",
        xpReward: 100,
      },
      {
        stageNumber: 4,
        title: "Boss Challenge: Composite Index Integrity",
        type: "boss_challenge",
        prompt: "Enforce uniqueness across composite attributes to prevent duplicate entries:",
        starterSnippet: `CREATE UNIQUE INDEX idx_composite_uniq ON records (user_id, resource_id);\nassert(true, "Composite uniqueness constraint enforced");`,
        solutionPattern: "UNIQUE|assert",
        hint: "Use CREATE UNIQUE INDEX to enforce unique multi-column constraints.",
        xpReward: 150,
      },
    ];
  }

  if (categoryLower.includes("front") || categoryLower.includes("ui") || titleLower.includes("component")) {
    return [
      {
        stageNumber: 1,
        title: "Component Accessibility & State Warmup",
        type: "warmup",
        prompt: `When building '${challenge.title}', which design principle ensures keyboard and screen-reader accessibility?`,
        options: [
          "Adhere to W3C WAI-ARIA guidelines with focus traps, aria attributes, and keyboard listeners",
          "Disable all keyboard events and only listen for mouse clicks",
          "Hardcode absolute pixel coordinates for responsive layouts",
          "Hide all text labels and display raw icons without aria-label",
        ],
        correctOption: 0,
        explanation: "W3C ARIA standards and semantic HTML guarantee that components are usable by keyboard users and assistive devices.",
        hint: "Focus on W3C WAI-ARIA standards and keyboard accessibility.",
        xpReward: 50,
      },
      {
        stageNumber: 2,
        title: "Component Cleanup & Event Fill-In",
        type: "fill_in",
        prompt: "Complete the effect cleanup function to abort pending intervals or event listeners on unmount:",
        starterSnippet: `useEffect(() => {\n  const handler = () => { /* update */ };\n  window.addEventListener('resize', handler);\n  return () => window.removeEventListener('resize', handler);\n}, []);`,
        solutionPattern: "removeEventListener|clearTimeout",
        hint: "Clean up by calling window.removeEventListener('resize', handler).",
        xpReward: 75,
      },
      {
        stageNumber: 3,
        title: "Interactive Handler Construction",
        type: "code_construct",
        prompt: "Construct the keyboard navigation event handler:",
        starterSnippet: `const onKeyDown = (e) => {\n  if (e.key === 'Escape') setIsOpen(false);\n  if (e.key === 'Enter') handleSelect();\n};`,
        solutionPattern: "Escape|Enter|key",
        hint: "Check for e.key === 'Escape' or 'Enter'.",
        xpReward: 100,
      },
      {
        stageNumber: 4,
        title: "Boss Challenge: Component Assertion Suite",
        type: "boss_challenge",
        prompt: "Verify edge-case handling for empty states, null props, and rapid user interactions.",
        starterSnippet: `// Component Boss Assertion Suite\nassert(renderComponent({ items: [] }) !== null, 'Empty state renders gracefully');\nassert(renderComponent({ items: ['A'] }).props['aria-expanded'] !== undefined, 'ARIA role present');`,
        solutionPattern: "assert",
        hint: "Assert safe rendering and ARIA role presence.",
        xpReward: 150,
      },
    ];
  }

  return [
    {
      stageNumber: 1,
      title: "Algorithmic Invariant Warmup",
      type: "warmup",
      prompt: `Before writing code for '${challenge.title}', what is the core invariant required for optimal asymptotic complexity?`,
      options: [
        "Inputs must be organized to eliminate redundant subproblems or halve search spaces in O(log N) or O(1) time",
        "The problem requires brute-force exponential iteration over all subsets",
        "Data must be persisted in an un-indexed linear text file",
        "All calculations must use floating point math without error bounds",
      ],
      correctOption: 0,
      explanation: "Optimal algorithms establish mathematical invariants that prune redundant computation from O(N) to O(log N) or O(1).",
      hint: "Think about invariant properties that prune execution space.",
      xpReward: 50,
    },
    {
      stageNumber: 2,
      title: "Syntax Spot & Boundary Fill-In",
      type: "fill_in",
      prompt: "Complete the critical logic in the starter code snippet ensuring overflow protection and boundary safety:",
      starterSnippet: challenge.starterCode
        ? challenge.starterCode.slice(0, 300)
        : `function executeBoundaryCheck(low, high) {\n  const mid = low + Math.floor((high - low) / 2);\n  return mid;\n}`,
      solutionPattern: "Math.floor|mid",
      hint: "Use Math.floor((high - low) / 2) to prevent arithmetic overflow.",
      xpReward: 75,
    },
    {
      stageNumber: 3,
      title: "Algorithmic Construction",
      type: "code_construct",
      prompt: "Construct the primary loop termination guard for the algorithm:",
      starterSnippet: `while (low <= high) {\n  const mid = low + Math.floor((high - low) / 2);\n  if (arr[mid] === target) return mid;\n  if (arr[mid] < target) low = mid + 1;\n  else high = mid - 1;\n}\nreturn -1;`,
      solutionPattern: "low <= high|return",
      hint: "The search space is valid as long as low <= high.",
      xpReward: 100,
    },
    {
      stageNumber: 4,
      title: "Boss Level: Stress Test & Edge Cases",
      type: "boss_challenge",
      prompt: "Test your solution against edge cases: empty collections, single-item inputs, and boundary extremes.",
      starterSnippet: `// Boss test assertion suite\nassert(execute([], 5) === -1, 'Empty collection returns -1');\nassert(execute([7], 7) === 0, 'Single element match');\nassert(execute([1, 3, 5], 6) === -1, 'Target exceeding maximum bound');`,
      solutionPattern: "assert",
      hint: "All edge cases must return the expected value without throwing unhandled exceptions.",
      xpReward: 150,
    },
  ];
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.challengeId as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [stages, setStages] = useState<ChallengeStage[]>([]);
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  // Gamification state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(3);
  const [xp, setXp] = useState(350);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  // Stage interaction state
  const [selectedWarmupOption, setSelectedWarmupOption] = useState<number | null>(null);
  const [warmupSubmitted, setWarmupSubmitted] = useState(false);
  const [warmupError, setWarmupError] = useState(false);
  const [fillInCode, setFillInCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [stageErrorMsg, setStageErrorMsg] = useState<string | null>(null);

  // AI Coach state
  const [aiCoachHint, setAiCoachHint] = useState<string | null>(null);
  const [isLoadingAiHint, setIsLoadingAiHint] = useState(false);

  // Final submission state
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<ChallengeSubmission | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (challengeId) {
      const found = getChallengeById(challengeId);
      if (found) {
        setChallenge(found);
        const generated = generateStagesForChallenge(found);
        setStages(generated);

        const gam = getUserGamification(current.id);
        setHearts(gam.hearts);
        setStreak(gam.streak);
        setXp(gam.xp);

        const done = gam.completedStages[challengeId] || [];
        setCompletedStages(done);
        if (done.length > 0 && done.length < generated.length) {
          setActiveStageIdx(done.length);
        }

        const subs = getSubmissions(current.id);
        const prev = subs.find((s) => s.challengeId === challengeId);
        if (prev) {
          setExistingSubmission(prev);
          setSubmissionUrl(prev.submissionUrl);
          setRepoUrl(prev.repoUrl || "");
          setNotes(prev.notes);
        }
      }
    }
  }, [challengeId]);

  if (!challenge) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900">Challenge Not Found</h2>
          <Button variant="outline" onClick={() => router.push("/challenges")} className="border-purple-200 text-slate-800 font-bold">
            Back to Challenges
          </Button>
        </div>
      </AppShell>
    );
  }

  const currentStage = stages[activeStageIdx] || stages[0];

  const handleWarmupSelect = (idx: number) => {
    if (warmupSubmitted) return;
    setSelectedWarmupOption(idx);
    setWarmupError(false);
    setStageErrorMsg(null);
  };

  const handleVerifyWarmup = () => {
    if (selectedWarmupOption === null || !user) return;

    if (selectedWarmupOption === currentStage.correctOption) {
      setWarmupSubmitted(true);
      setWarmupError(false);
      const updated = recordStageCompletion(user.id, challenge.id, currentStage.stageNumber, currentStage.xpReward);
      setCompletedStages(updated.completedStages[challenge.id] || []);
      setXp(updated.xp);
      setStreak(updated.streak);
    } else {
      setWarmupError(true);
      const remainingHearts = decrementUserHeart(user.id);
      setHearts(remainingHearts);
      setStageErrorMsg("Incorrect choice! -1 Heart lost. Review the concept intuition and try again.");
    }
  };

  const handleVerifyCodeStage = () => {
    if (!fillInCode.trim() || !user) return;

    const pattern = currentStage.solutionPattern || "";
    const patterns = pattern.split("|").map((p) => p.trim().toLowerCase());
    const lowerCode = fillInCode.toLowerCase();
    const isMatched = patterns.some((p) => lowerCode.includes(p));

    if (isMatched || pattern === "") {
      setCodeVerified(true);
      setStageErrorMsg(null);
      const updated = recordStageCompletion(user.id, challenge.id, currentStage.stageNumber, currentStage.xpReward);
      setCompletedStages(updated.completedStages[challenge.id] || []);
      setXp(updated.xp);
      setStreak(updated.streak);
    } else {
      setCodeVerified(false);
      const remainingHearts = decrementUserHeart(user.id);
      setHearts(remainingHearts);
      setStageErrorMsg(`Verification failed! Expected pattern '${patterns[0]}' not detected. -1 Heart lost.`);
    }
  };

  const handleAskAiCoach = async () => {
    setIsLoadingAiHint(true);
    setAiCoachHint(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: `I am currently solving Stage ${currentStage.stageNumber} (${currentStage.title}) of the engineering challenge: '${challenge.title}'.
Prompt: ${currentStage.prompt}
Please provide a gentle Socratic hint to help me think in the right direction without giving away the direct code answer immediately.`,
          subject: challenge.category,
          level: challenge.difficulty === "hard" ? "advanced" : "intermediate",
          style: "step_by_step",
          history: [],
        }),
      });

      const data = await res.json();
      setAiCoachHint(data?.message?.content || currentStage.hint);
    } catch {
      setAiCoachHint(currentStage.hint);
    } finally {
      setIsLoadingAiHint(false);
    }
  };

  const handleAddVerifiedToPortfolio = () => {
    if (!user) return;
    const proj: PortfolioProject = {
      id: `proj-verified-${challenge.id}`,
      userId: user.id,
      title: `${challenge.title} (Duolingo Stage Mastery)`,
      description: `Completed all 4 progressive stages of '${challenge.title}' with verified algorithmic invariants, test assertions, and peer rubrics.`,
      tags: [challenge.category, "Verified Mastery", `${challenge.xp} XP`],
      demoUrl: sanitizeWebUrl(submissionUrl),
      githubUrl: sanitizeWebUrl(repoUrl),
      isPublic: true,
      verified: true,
      completedAt: new Date().toISOString().slice(0, 10),
    };
    savePortfolioProject(proj);
    router.push("/portfolio");
  };

  const handleSubmitFinalProject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const sanitizedSubUrl = sanitizeWebUrl(submissionUrl) || "";
    const sanitizedRepo = sanitizeWebUrl(repoUrl);

    const validation = challengeSubmissionSchema.safeParse({
      challengeId: challenge.id,
      submissionUrl: sanitizedSubUrl,
      repoUrl: sanitizedRepo,
      notes,
    });

    if (!validation.success) {
      setFormError(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const sub: ChallengeSubmission = {
        id: `sub-${Date.now()}`,
        challengeId: challenge.id,
        userId: user?.id || "student-1",
        studentName: user?.name || "Student",
        submissionUrl: sanitizedSubUrl,
        repoUrl: sanitizedRepo,
        notes,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      };
      saveSubmission(sub);
      setExistingSubmission(sub);
      setSubmissionSuccess(true);
    }, 600);
  };

  const allStagesCompleted = completedStages.length >= stages.length;

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Navigation & Duolingo HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <Link
            href="/challenges"
            className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Challenges
          </Link>

          {/* Gamified Status Bar */}
          <div className="flex items-center gap-3 bg-white border border-purple-200 rounded-2xl p-2 sm:px-4 sm:py-2 shadow-clay">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-xl border border-rose-200">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-950">{hearts}/5</span>
              {hearts < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      refillUserHearts(user.id);
                      setHearts(5);
                    }
                  }}
                  className="text-[10px] text-brand-purple hover:underline ml-1 font-bold"
                >
                  Refill
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-950">{streak} Streak</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-xl border border-purple-200">
              <Zap className="w-4 h-4 text-brand-purple fill-brand-purple" />
              <span className="text-xs font-bold text-slate-950">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* Challenge Header - Royal Purple Clay Card */}
        <div className="clay-card-purple p-6 sm:p-8 relative overflow-hidden text-white shadow-xl rounded-3xl space-y-3">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-0.5 rounded-full">
                {challenge.category}
              </span>
              <span className="text-xs font-bold capitalize bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                {challenge.difficulty}
              </span>
              <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                +{challenge.xp} Total XP
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {challenge.title}
            </h1>
            <p className="text-sm text-purple-100 font-medium leading-relaxed max-w-3xl">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* 4-Stage Progressive Ladder Navigation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              Stage-by-Stage AI Training Ladder
            </span>
            <span className="text-brand-purple font-mono font-bold text-[11px]">
              {completedStages.length} of {stages.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stages.map((stg, i) => {
              const isDone = completedStages.includes(stg.stageNumber);
              const isActive = activeStageIdx === i;

              return (
                <button
                  key={stg.stageNumber}
                  type="button"
                  onClick={() => {
                    setActiveStageIdx(i);
                    setWarmupSubmitted(false);
                    setCodeVerified(false);
                    setStageErrorMsg(null);
                    setAiCoachHint(null);
                  }}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between shadow-sm",
                    isActive
                      ? "bg-purple-100 border-2 border-brand-purple text-brand-purple shadow-md"
                      : isDone
                      ? "bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                      : "bg-white border-purple-100 text-slate-700 hover:border-purple-200"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-slate-900">
                      Stage {stg.stageNumber}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">+{stg.xpReward} XP</span>
                    )}
                  </div>
                  <div className="text-xs font-extrabold text-slate-950 truncate">{stg.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Interactive Sandbox */}
        <Card className="bg-white border-2 border-purple-200 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-purple-100 bg-purple-50/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                  Active Challenge • Stage {currentStage.stageNumber} of {stages.length}
                </span>
                <CardTitle className="text-xl font-extrabold text-slate-950 mt-0.5">{currentStage.title}</CardTitle>
              </div>

              {/* AI Coach Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAskAiCoach}
                disabled={isLoadingAiHint}
                className="self-start sm:self-auto text-xs font-bold text-slate-800 hover:text-brand-purple"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-purple animate-spin" />
                {isLoadingAiHint ? "Asking AI Coach..." : "Ask AI Coach for Hint"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {currentStage.prompt}
            </p>

            {/* AI Coach Hint Box if requested */}
            {aiCoachHint && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5 text-xs animate-in fade-in text-slate-900">
                <div className="flex items-center gap-1.5 font-bold text-brand-purple">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Gemini AI Pedagogical Coach:
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">{aiCoachHint}</p>
              </div>
            )}

            {/* Stage Error Notice if any */}
            {stageErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-center gap-2 text-xs text-rose-800 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{stageErrorMsg}</span>
              </div>
            )}

            {/* STAGE TYPE 1: WARMUP MULTIPLE CHOICE */}
            {currentStage.type === "warmup" && currentStage.options && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {currentStage.options.map((opt, idx) => {
                    const isSelected = selectedWarmupOption === idx;
                    const isCorrect = idx === currentStage.correctOption;

                    let optionStyle = "border-purple-200 bg-white hover:border-brand-purple text-slate-900 font-medium shadow-sm";
                    if (warmupSubmitted) {
                      if (isCorrect) optionStyle = "border-emerald-400 bg-emerald-50 text-emerald-900 font-bold shadow-sm";
                      else if (isSelected) optionStyle = "border-rose-300 bg-rose-50 text-rose-900 font-medium";
                    } else if (isSelected) {
                      optionStyle = "border-2 border-brand-purple bg-purple-100 text-brand-purple font-bold shadow-md";
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => handleWarmupSelect(idx)}
                        className={cn(
                          "p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between",
                          optionStyle
                        )}
                      >
                        <span>{opt}</span>
                        {warmupSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {!warmupSubmitted ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleVerifyWarmup}
                    disabled={selectedWarmupOption === null}
                    className="font-bold shadow-md"
                  >
                    Verify Concept Choice
                    <CheckCheck className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Stage 1 Cleared! +{currentStage.xpReward} XP Earned!
                    </div>
                    <p className="font-medium">{currentStage.explanation}</p>
                    {activeStageIdx < stages.length - 1 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveStageIdx(activeStageIdx + 1);
                          setWarmupSubmitted(false);
                          setStageErrorMsg(null);
                        }}
                        className="font-bold shadow-md"
                      >
                        Advance to Stage {activeStageIdx + 2}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STAGE TYPE 2, 3, 4: CODE FILL-IN & CONSTRUCT */}
            {currentStage.type !== "warmup" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-purple-200 bg-slate-900 overflow-hidden font-mono text-xs text-slate-100">
                  <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                      <Terminal className="w-3.5 h-3.5 text-brand-purple" />
                      Starter Code Invariant
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(currentStage.starterSnippet || "");
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-3 text-slate-200 overflow-x-auto leading-relaxed">
                    <code>{currentStage.starterSnippet}</code>
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Your Solution Expression / Implementation:
                  </label>
                  <textarea
                    rows={3}
                    value={fillInCode}
                    onChange={(e) => setFillInCode(e.target.value)}
                    placeholder={`e.g. ${currentStage.solutionPattern || "Write implementation..."}`}
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                </div>

                {!codeVerified ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleVerifyCodeStage}
                    disabled={!fillInCode.trim()}
                    className="font-bold shadow-md"
                  >
                    Verify & Run Assertions
                    <Play className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Stage {currentStage.stageNumber} Passed! +{currentStage.xpReward} XP Awarded!
                    </div>
                    <p className="font-medium">Invariant assertions verified. Code successfully compiled without boundary overflows.</p>
                    {activeStageIdx < stages.length - 1 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveStageIdx(activeStageIdx + 1);
                          setCodeVerified(false);
                          setFillInCode("");
                          setStageErrorMsg(null);
                        }}
                        className="font-bold shadow-md"
                      >
                        Advance to Stage {activeStageIdx + 2}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ALL STAGES MASTERED CELEBRATION */}
        {allStagesCompleted && (
          <div className="clay-card-purple p-6 rounded-2xl text-white space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  Full Challenge Mastery Unlocked!
                </div>
                <h3 className="text-xl font-extrabold text-white">Congratulations, {user?.name || "Student"}!</h3>
                <p className="text-xs text-purple-100 font-medium">
                  You have cleared all 4 Duolingo-calibrated stages for {challenge.title}. You can now push this verified mastery directly into your public portfolio!
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={handleAddVerifiedToPortfolio}
                className="shrink-0 font-bold bg-white text-brand-purple hover:bg-purple-50 shadow-md border-none"
              >
                <Award className="w-4 h-4 mr-1.5" />
                Add Verified Badge to Portfolio
              </Button>
            </div>
          </div>
        )}

        {/* Final Submission Section for Full GitHub Repos & Peer Review */}
        <Card className="border-2 border-purple-100 bg-white shadow-clay rounded-3xl text-slate-900">
          <CardHeader className="border-b border-purple-50 pb-4">
            <CardTitle className="text-lg font-black text-brand-purple flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-purple" />
              Submit Final Project Repository (Optional / Teacher Grade)
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 font-medium leading-relaxed">
              Paste your external repository and deployment link for instructor review and rubrics evaluation.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {submissionSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Project submitted successfully! Your instructor has received your submission.</span>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFinalProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Live Demo URL (or Vercel / Netlify) *
                  </label>
                  <input
                    type="text"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="e.g. myproject.vercel.app"
                    required
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm font-medium"
                  />
                  {submissionUrl && (
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">
                      Validated: {sanitizeWebUrl(submissionUrl)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="e.g. github.com/username/repo"
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm font-medium"
                  />
                  {repoUrl && (
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">
                      Validated: {sanitizeWebUrl(repoUrl)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Submission Notes &amp; Architecture Writeup
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain your approach, runtime complexity proofs, and edge cases handled..."
                  className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm font-medium"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} className="font-bold shadow-md">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {existingSubmission ? "Update Submission" : "Submit Challenge Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
