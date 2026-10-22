"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getQuizzes, saveQuiz, getAttempts, saveAttempt, getCurrentUser } from "@/lib/store";
import { Quiz, Question, QuizAttempt, UserProfile } from "@/types";
import { evaluateQuizSubmission, formatTimeRemaining } from "@/lib/scoring";
import { parseDocumentFile } from "@/lib/rag-parser";
import { generateQuizFromText } from "@/lib/rag-engine";
import {
  FileQuestion,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Filter,
  Check,
  X,
  FileText,
  Upload,
  UploadCloud,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizzesPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Generator modal state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorTopic, setGeneratorTopic] = useState("");
  const [generatorDifficulty, setGeneratorDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [generatorCount, setGeneratorCount] = useState(5);
  const [generatorPastedText, setGeneratorPastedText] = useState("");
  const [generatorFile, setGeneratorFile] = useState<{ name: string; size: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active quiz taking state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastAttemptResult, setLastAttemptResult] = useState<ReturnType<typeof evaluateQuizSubmission> | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setQuizzes(getQuizzes());
    setAttempts(getAttempts(currentUser.id));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0 || isSubmitted || !activeQuiz) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, isSubmitted, activeQuiz]);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setLastAttemptResult(null);
    if (quiz.durationMinutes && quiz.durationMinutes > 0) {
      setSecondsRemaining(quiz.durationMinutes * 60);
    } else {
      setSecondsRemaining(null);
    }
  };

  const handleSelectAnswer = (qId: string, answer: string | number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz || !user) return;

    const result = evaluateQuizSubmission(activeQuiz.questions, userAnswers, activeQuiz.passingScore || 70);
    setLastAttemptResult(result);
    setIsSubmitted(true);

    const isPracticeAttempt = Boolean(activeQuiz.isPractice || activeQuiz.creatorRole === "student");

    const newAttempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      userId: user.id,
      studentName: user.name,
      userRole: user.role,
      isPractice: isPracticeAttempt,
      answers: userAnswers,
      scorePercentage: result.scorePercentage,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      passed: result.passed,
      startedAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date().toISOString(),
      weakTopics: result.weakTopics,
    };

    saveAttempt(newAttempt);
    setAttempts((prev) => [newAttempt, ...prev]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseDocumentFile(file);
      setGeneratorPastedText(parsed.text);
      setGeneratorFile({
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      });
      if (!generatorTopic.trim()) {
        setGeneratorTopic(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
    } catch (err: any) {
      console.warn("Failed to parse file with RAG parser, falling back:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        setGeneratorPastedText((event.target?.result as string) || "");
        setGeneratorFile({
          name: file.name,
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        });
        if (!generatorTopic.trim()) {
          setGeneratorTopic(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateCustomQuiz = async () => {
    if (!generatorTopic.trim() && !generatorPastedText.trim()) return;

    setIsAiLoading(true);
    const topicName = generatorTopic.trim() || generatorFile?.name || "Uploaded Lecture Material";
    let generatedQuestions: Question[] = [];

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceNotes: generatorPastedText || topicName,
          topic: topicName,
          difficulty: generatorDifficulty,
          questionCount: generatorCount,
        }),
      });

      const data = await res.json();
      if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        generatedQuestions = data.questions.map((q: Question) => ({
          ...q,
          points: q.points || 10,
        }));
      } else {
        const local = generateQuizFromText(
          generatorPastedText || topicName,
          topicName,
          generatorDifficulty,
          generatorCount
        );
        generatedQuestions = local.questions;
      }
    } catch {
      const local = generateQuizFromText(
        generatorPastedText || topicName,
        topicName,
        generatorDifficulty,
        generatorCount
      );
      generatedQuestions = local.questions;
    } finally {
      setIsAiLoading(false);
    }

    const generatedQuiz: Quiz = {
      id: `quiz-practice-${Date.now()}`,
      title: `${topicName} Practice Assessment`,
      description: `Targeted personal practice quiz generated by Monday AI from ${topicName} notes.`,
      subject: "Computer Science",
      difficulty: generatorDifficulty,
      durationMinutes: Math.max(5, generatorCount * 2),
      creatorId: user?.id || "user-student-1",
      creatorName: user?.name || "Student",
      creatorRole: "student",
      isDraft: false,
      isPractice: true,
      passingScore: 70,
      createdAt: new Date().toISOString(),
      questions: generatedQuestions,
    };

    saveQuiz(generatedQuiz);
    setQuizzes(getQuizzes());
    setIsGenerating(false);
    setGeneratorTopic("");
    setGeneratorPastedText("");
    setGeneratorFile(null);
    startQuiz(generatedQuiz);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-6 sm:p-8 relative overflow-hidden text-white shadow-xl rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="cyan" className="font-bold">Campus Learn</Badge>
                <span className="text-xs text-purple-100 font-semibold">QuizForge Active Recall Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                QuizForge Student Assessment Studio
              </h1>
              <p className="mt-2 text-sm text-purple-100 max-w-2xl font-medium leading-relaxed">
                Practice course topics with timed quizzes, review mistake explanations, and generate mock tests from lecture notes.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsGenerating(true)}
              className="bg-white text-brand-purple hover:bg-purple-50 font-black shadow-md border-none shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-2 text-brand-purple" />
              Generate Custom Quiz
            </Button>
          </div>
        </div>

        {/* QUIZ GENERATION MODAL */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 text-brand-purple">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950">Generate Instant Quiz</h3>
                    <p className="text-xs text-slate-500 font-medium">From topic keywords or pasted study notes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGenerating(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Subject / Topic Name
                  </label>
                  <input
                    type="text"
                    value={generatorTopic}
                    onChange={(e) => setGeneratorTopic(e.target.value)}
                    placeholder="e.g. Binary Search Trees & AVL Rotations"
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2 text-sm text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-700">
                      Upload Lecture Notes or Paste Text
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt,.csv,.py,.ts,.json,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] h-7 px-2.5 font-bold border-purple-200 text-slate-800 hover:bg-purple-50"
                      >
                        <FileUp className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                        {generatorFile ? "Change Document" : "Upload File (.pdf, .docx, .txt)"}
                      </Button>
                    </div>
                  </div>

                  {generatorFile && (
                    <div className="mb-2 p-2 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-purple" />
                        <span className="font-bold text-slate-950">{generatorFile.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({generatorFile.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratorFile(null);
                          setGeneratorPastedText("");
                        }}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    value={generatorPastedText}
                    onChange={(e) => setGeneratorPastedText(e.target.value)}
                    placeholder="Paste textbook definitions, lecture slide bullets, or exam review topics..."
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={generatorDifficulty}
                      onChange={(e) => setGeneratorDifficulty(e.target.value as any)}
                      className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced Exam Prep</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Number of Questions
                    </label>
                    <select
                      value={generatorCount}
                      onChange={(e) => setGeneratorCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none"
                    >
                      <option value={3}>3 Questions (Quick Sprint)</option>
                      <option value={5}>5 Questions (Standard)</option>
                      <option value={10}>10 Questions (Mock Exam)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <Button variant="outline" size="sm" onClick={() => setIsGenerating(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!generatorTopic.trim() && !generatorPastedText.trim()}
                  onClick={handleGenerateCustomQuiz}
                  isLoading={isAiLoading}
                  className="font-bold shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-white" />
                  Generate & Start Quiz
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE QUIZ TAKING INTERFACE */}
        {activeQuiz && (
          <div className="clay-card p-6 sm:p-8 bg-white border-2 border-purple-200 shadow-2xl space-y-6 text-slate-900">
            {!isSubmitted ? (
              // IN-PROGRESS TAKING VIEW
              <div className="space-y-6">
                {/* Quiz header with Timer & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-100 gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-brand-purple uppercase">
                      {activeQuiz.subject} • {activeQuiz.difficulty}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5">
                      {activeQuiz.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    {secondsRemaining !== null && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 font-mono text-sm font-bold">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{formatTimeRemaining(secondsRemaining)}</span>
                      </div>
                    )}
                    <span className="text-xs text-slate-500 font-mono font-bold">
                      Question {currentQIndex + 1} of {activeQuiz.questions.length}
                    </span>
                  </div>
                </div>

                {/* Question presentation */}
                {activeQuiz.questions[currentQIndex] && (
                  <div className="space-y-4 max-w-3xl">
                    <div className="text-xs text-brand-purple font-mono font-bold uppercase">
                      Topic: {activeQuiz.questions[currentQIndex].topic}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">
                      {activeQuiz.questions[currentQIndex].text}
                    </h3>

                    {/* Multiple choice or true/false options */}
                    {activeQuiz.questions[currentQIndex].options ? (
                      <div className="space-y-2.5 pt-2">
                        {activeQuiz.questions[currentQIndex].options!.map((opt, idx) => {
                          const isSelected =
                            userAnswers[activeQuiz.questions[currentQIndex].id] === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                handleSelectAnswer(
                                  activeQuiz.questions[currentQIndex].id,
                                  idx
                                )
                              }
                              className={cn(
                                "w-full p-4 rounded-xl border text-sm text-left flex items-center justify-between transition-all",
                                isSelected
                                  ? "bg-purple-50 border-2 border-brand-purple text-slate-950 font-bold shadow-md"
                                  : "bg-white border border-purple-200 text-slate-800 hover:bg-purple-50/50 hover:border-purple-300 font-medium"
                              )}
                            >
                              <span>{opt}</span>
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3",
                                  isSelected
                                    ? "border-brand-purple bg-brand-purple text-white"
                                    : "border-slate-300"
                                )}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      // Short answer input
                      <div className="pt-2">
                        <label className="block text-xs uppercase text-slate-700 font-bold mb-1">
                          Your Short Answer:
                        </label>
                        <input
                          type="text"
                          value={String(userAnswers[activeQuiz.questions[currentQIndex].id] || "")}
                          onChange={(e) =>
                            handleSelectAnswer(
                              activeQuiz.questions[currentQIndex].id,
                              e.target.value
                            )
                          }
                          placeholder="Type answer..."
                          className="w-full bg-slate-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-slate-950 font-medium focus:outline-none focus:border-brand-purple font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-purple-100">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentQIndex < activeQuiz.questions.length - 1 ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentQIndex((prev) => prev + 1)}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSubmitQuiz}
                        className="font-bold shadow-md"
                      >
                        Submit Assessment
                        <CheckCircle2 className="w-4 h-4 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // RESULTS & REVIEW VIEW
              <div className="space-y-6">
                <div className="text-center max-w-lg mx-auto space-y-2 py-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xl",
                      lastAttemptResult?.passed
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-rose-100 text-rose-700 border border-rose-300"
                    )}
                  >
                    {lastAttemptResult?.scorePercentage}%
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    {lastAttemptResult?.passed
                      ? "Assessment Passed! Excellent Mastery"
                      : "Needs Practice — Review Recommended"}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    You scored {lastAttemptResult?.correctCount} of {lastAttemptResult?.totalQuestions} questions correctly. Passing score requirement: {activeQuiz.passingScore}%.
                  </p>
                </div>

                {/* Weak Topics Diagnostics */}
                {lastAttemptResult && lastAttemptResult.weakTopics.length > 0 && (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Identified Weak Topics For Revision
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {lastAttemptResult.weakTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-amber-900/40 border border-amber-500/40 text-amber-200 text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question-by-Question Review */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-bold uppercase text-slate-300 tracking-wider">
                    Detailed Explanations & Mistake Review
                  </h4>
                  {lastAttemptResult?.questionResults.map((qRes, i) => {
                    const qObj = activeQuiz.questions.find((q) => q.id === qRes.questionId);
                    return (
                      <div
                        key={i}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-xs sm:text-sm space-y-2 shadow-sm",
                          qRes.isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-slate-800"
                            : "bg-rose-50 border-rose-300 text-slate-800"
                        )}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">Question {i + 1}: {qObj?.text}</span>
                          <span
                            className={cn(
                              "text-xs font-black uppercase px-2 py-0.5 rounded-full",
                              qRes.isCorrect
                                ? "bg-emerald-200 text-emerald-900"
                                : "bg-rose-200 text-rose-900"
                            )}
                          >
                            {qRes.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>

                        <div className="text-xs space-y-1 pt-1 font-medium">
                          <div>
                            <span className="text-slate-600 font-bold">Your Answer: </span>
                            <span className={qRes.isCorrect ? "text-emerald-800 font-bold" : "text-rose-700 font-mono font-bold"}>
                              {qObj?.options
                                ? qObj.options[Number(qRes.userAnswer)] || "Unanswered"
                                : String(qRes.userAnswer || "Unanswered")}
                            </span>
                          </div>
                          {!qRes.isCorrect && (
                            <div>
                              <span className="text-slate-600 font-bold">Correct Answer: </span>
                              <span className="text-emerald-700 font-bold font-mono">
                                {qObj?.options
                                  ? qObj.options[Number(qRes.correctAnswer)]
                                  : String(qRes.correctAnswer)}
                              </span>
                            </div>
                          )}
                          <div className="mt-2.5 p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-slate-800 text-xs leading-relaxed font-medium">
                            <strong className="text-brand-purple font-bold">Explanation: </strong>
                            {qRes.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-purple-100">
                  <Button variant="outline" size="sm" onClick={() => startQuiz(activeQuiz)} className="font-bold border-purple-200 text-slate-800 hover:bg-purple-50">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Retake Quiz
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setActiveQuiz(null)} className="font-bold shadow-md">
                    Return to Quiz Catalog
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pre-existing Quiz Catalog */}
        {!activeQuiz && (
          <div className="space-y-8">
            {/* Official Teacher-Assigned Assessments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-brand-purple" />
                  Available Practice Quizzes & Assessments
                </h2>
                <span className="text-xs text-brand-purple font-bold">
                  Synced Live from Faculty Studio
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes
                  .filter(
                    (q) =>
                      !q.isDraft &&
                      (q.creatorRole === "teacher" ||
                        q.creatorId === "user-teacher-1" ||
                        !q.creatorRole)
                  )
                  .map((quiz) => {
                    const userAttemptOnQuiz = attempts.find((a) => a.quizId === quiz.id);
                    return (
                      <Card
                        key={quiz.id}
                        className="bg-white border border-purple-100 shadow-clay flex flex-col justify-between hover:border-purple-300 transition-all"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-brand-purple">{quiz.subject}</span>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="purple" className="text-[10px]">
                                Faculty Official
                              </Badge>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {quiz.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg font-extrabold text-slate-950">{quiz.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-600 font-medium leading-relaxed">
                            {quiz.description}
                          </CardDescription>
                          <div className="text-[11px] text-slate-600 pt-1">
                            Instructor: <strong className="text-slate-950 font-bold">{quiz.creatorName}</strong>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="flex items-center justify-between text-xs text-slate-700 font-mono font-medium">
                            <span>{quiz.questions.length} Questions</span>
                            <span>{quiz.durationMinutes} Mins</span>
                            {userAttemptOnQuiz && (
                              <span className="text-emerald-700 font-bold">
                                Last: {userAttemptOnQuiz.scorePercentage}%
                              </span>
                            )}
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full font-bold shadow-md"
                            onClick={() => startQuiz(quiz)}
                          >
                            Start Assessment
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Personal Practice Quizzes (isolated to the logged-in student) */}
            {quizzes.some((q) => q.creatorRole === "student" && q.creatorId === user?.id) && (
              <div className="space-y-4 pt-2 border-t border-purple-100">
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  My Personal Practice Quizzes ({user?.name})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes
                    .filter((q) => q.creatorRole === "student" && q.creatorId === user?.id)
                    .map((quiz) => (
                      <Card key={quiz.id} className="bg-white border border-purple-100 shadow-clay flex flex-col justify-between hover:border-purple-300">
                        <CardHeader>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-brand-purple">{quiz.subject}</span>
                            <Badge variant="outline" className="text-[10px]">
                              Personal AI Practice
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-extrabold text-slate-950">{quiz.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-600 font-medium">
                            {quiz.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full font-bold"
                            onClick={() => startQuiz(quiz)}
                          >
                            Practice Now
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Historical Attempts Table (Strictly isolated to current student) */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-950">
                  Your Past Assessment Attempts ({user?.name})
                </h3>
                <span className="text-xs text-brand-purple font-mono font-bold">
                  Isolated Student Record • {attempts.length} Attempt{attempts.length === 1 ? "" : "s"}
                </span>
              </div>
              {attempts.length > 0 ? (
                <div className="clay-card overflow-hidden bg-white border border-purple-200">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-purple-50 text-slate-900 border-b border-purple-200 font-bold">
                      <tr>
                        <th className="p-3.5">Student</th>
                        <th className="p-3.5">Quiz Title</th>
                        <th className="p-3.5">Score</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Date Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100 text-slate-800">
                      {attempts.map((att) => (
                        <tr key={att.id} className="hover:bg-purple-50/50">
                          <td className="p-3.5 text-brand-purple font-bold">
                            {att.studentName || user?.name}
                          </td>
                          <td className="p-3.5 font-extrabold text-slate-950">{att.quizTitle}</td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {att.scorePercentage}% ({att.correctCount}/{att.totalQuestions})
                          </td>
                          <td className="p-3.5">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                att.passed
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border border-rose-300"
                              )}
                            >
                              {att.passed ? "Passed" : "Needs Review"}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{att.completedAt.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="clay-card p-6 text-center text-xs text-slate-600 font-medium bg-white border border-purple-200">
                  No quiz attempts recorded yet for <strong>{user?.name}</strong>. Start an assessment above!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
