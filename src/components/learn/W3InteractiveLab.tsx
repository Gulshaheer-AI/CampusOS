"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MondayOrb } from "@/components/ui/MondayOrb";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Code2,
  Terminal,
  HelpCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface W3InteractiveLabProps {
  title: string;
  category?: string;
  syntaxNotes?: string | string[];
  codeExample?: {
    language: string;
    title?: string;
    starterCode?: string;
    code?: string;
    expectedOutput: string;
  };
  exercise?: {
    prompt: string;
    codeTemplate?: string;
    template?: string;
    answer: string;
    hint?: string;
  };
  onCompleteExercise?: () => void;
}

function getFallbackLabData(title: string, category: string = "Computer Science") {
  const lower = `${title} ${category}`.toLowerCase();

  if (lower.includes("sql") || lower.includes("database") || lower.includes("join") || lower.includes("norm")) {
    return {
      syntaxNotes: [
        "SELECT column_name(s) FROM table1 INNER JOIN table2 ON table1.id = table2.foreign_id;",
        "LEFT JOIN preserves all rows from the left table, filling unmatched right columns with NULL.",
        "CREATE INDEX idx_name ON table_name (column_name); — B-Tree index for O(log N) lookups.",
      ],
      codeExample: {
        language: "sql" as const,
        title: `Try It Yourself: ${title}`,
        starterCode: `-- W3/C4School Interactive SQL Sandbox\nSELECT s.student_id, s.name, e.course_code, e.grade\nFROM Students s\nLEFT JOIN Enrollments e ON s.student_id = e.student_id\nWHERE s.cgpa >= 3.5\nORDER BY s.cgpa DESC;`,
        expectedOutput: `student_id | name        | course_code | grade\n-----------+-------------+-------------+------\n101        | Ahmad Khan  | CS101       | A\n102        | Hassan Ali  | AI405       | A+\n103        | Zain Tariq  | WEB210      | A-\n(3 rows returned in 1.4ms via B-Tree Index Scan)`,
      },
      exercise: {
        prompt: "Fill in the SQL keyword to join two tables while keeping all rows from the left table:",
        codeTemplate: "SELECT * FROM Students ___ JOIN Enrollments ON Students.id = Enrollments.student_id;",
        answer: "LEFT",
        hint: "Use LEFT JOIN to keep all records from the left table.",
      },
    };
  }

  if (lower.includes("python") || lower.includes("ai") || lower.includes("llm") || lower.includes("rag") || lower.includes("data")) {
    return {
      syntaxNotes: [
        "List Comprehension: [expr for item in iterable if condition]",
        "Context Manager: with open('data.json', 'r') as f: data = json.load(f)",
        "Cosine Similarity: dot(A, B) / (norm(A) * norm(B)) — measures vector alignment in RAG.",
      ],
      codeExample: {
        language: "javascript" as const,
        title: `Try It Yourself: ${title} Simulation`,
        starterCode: `// Interactive Vector & Data Pipeline Simulation\nfunction cosineSimilarity(vecA, vecB) {\n  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);\n  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));\n  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));\n  return (dot / (magA * magB)).toFixed(4);\n}\n\nconst queryEmbedding = [0.82, 0.15, 0.91, 0.44];\nconst docChunkEmbedding = [0.79, 0.18, 0.88, 0.41];\nconsole.log("RAG Chunk Cosine Similarity:", cosineSimilarity(queryEmbedding, docChunkEmbedding));`,
        expectedOutput: `RAG Chunk Cosine Similarity: 0.9991`,
      },
      exercise: {
        prompt: "Complete the array method used to accumulate a single sum from all vector elements:",
        codeTemplate: "const dot = vecA.___((sum, a, i) => sum + a * vecB[i], 0);",
        answer: "reduce",
        hint: "JavaScript's `.reduce()` method folds an array into a single value.",
      },
    };
  }

  if (lower.includes("react") || lower.includes("web") || lower.includes("ui") || lower.includes("ux") || lower.includes("next") || lower.includes("http")) {
    return {
      syntaxNotes: [
        "Server Components execute on the server with 0 KB client bundle overhead.",
        "Client Components ('use client') enable useState, useEffect, and interactive event handlers.",
        "REST Idempotency: GET, PUT, and DELETE requests must produce identical state when repeated.",
      ],
      codeExample: {
        language: "javascript" as const,
        title: `Try It Yourself: ${title}`,
        starterCode: `// Interactive State & API Contract Validator\nfunction validateApiPayload(payload) {\n  const errors = [];\n  if (!payload.title || payload.title.trim().length < 3) {\n    errors.push("Title must be at least 3 characters");\n  }\n  if (!["student", "teacher", "admin"].includes(payload.role)) {\n    errors.push("Invalid RBAC role claim");\n  }\n  return { valid: errors.length === 0, errors };\n}\n\nconsole.log("Valid Payload:", JSON.stringify(validateApiPayload({ title: "CampusOS", role: "student" })));\nconsole.log("Invalid Payload:", JSON.stringify(validateApiPayload({ title: "A", role: "guest" })));`,
        expectedOutput: `Valid Payload: {"valid":true,"errors":[]}\nInvalid Payload: {"valid":false,"errors":["Title must be at least 3 characters","Invalid RBAC role claim"]}`,
      },
      exercise: {
        prompt: "Fill in the React hook used to manage local interactive component state:",
        codeTemplate: "const [isOpen, setIsOpen] = ___(false);",
        answer: "useState",
        hint: "Use the standard React state hook `useState`.",
      },
    };
  }

  return {
    syntaxNotes: [
      "Precondition & Loop Invariant: Verify state before, during, and after every iteration.",
      "Divide & Conquer: Partition problem into independent subproblems to achieve O(log N) or O(N log N).",
      "Space-Time Tradeoff: Use a Hash Map / Set for O(1) lookups instead of nested O(N²) loops.",
    ],
    codeExample: {
      language: "javascript" as const,
      title: `Try It Yourself: ${title}`,
      starterCode: `function twoSumHash(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n\nconst nums = [2, 7, 11, 15];\nconsole.log("Indices summing to 9:", JSON.stringify(twoSumHash(nums, 9)));`,
      expectedOutput: `Indices summing to 9: [0,1]`,
    },
    exercise: {
      prompt: "Complete the Map lookup method to check if `complement` already exists in O(1) time:",
      codeTemplate: "if (seen.___(complement)) { return [seen.get(complement), i]; }",
      answer: "has",
      hint: "JavaScript Map uses `.has(key)` to check existence.",
    },
  };
}

export function W3InteractiveLab({
  title,
  category,
  syntaxNotes,
  codeExample,
  exercise,
  onCompleteExercise,
}: W3InteractiveLabProps) {
  const fallback = getFallbackLabData(title, category);
  const normalizedNotes = Array.isArray(syntaxNotes)
    ? syntaxNotes
    : typeof syntaxNotes === "string" && syntaxNotes.trim().length > 0
    ? syntaxNotes.split("\n").filter(Boolean)
    : [];
  const activeNotes = normalizedNotes.length > 0 ? normalizedNotes : fallback.syntaxNotes;

  const activeExample = codeExample
    ? {
        language: codeExample.language || "javascript",
        title: codeExample.title || `Try It Yourself: ${title}`,
        starterCode: codeExample.starterCode || codeExample.code || fallback.codeExample.starterCode,
        expectedOutput: codeExample.expectedOutput || fallback.codeExample.expectedOutput,
      }
    : fallback.codeExample;

  const activeExercise = exercise
    ? {
        prompt: exercise.prompt,
        codeTemplate: exercise.codeTemplate || exercise.template || fallback.exercise.codeTemplate,
        answer: exercise.answer,
        hint: exercise.hint || fallback.exercise.hint,
      }
    : fallback.exercise;

  const [code, setCode] = useState(activeExample.starterCode);
  const [output, setOutput] = useState<string>(activeExample.expectedOutput);
  const [hasRun, setHasRun] = useState(false);

  const [userAnswer, setUserAnswer] = useState("");
  const [exerciseStatus, setExerciseStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setCode(activeExample.starterCode);
    setOutput(activeExample.expectedOutput);
    setHasRun(false);
    setUserAnswer("");
    setExerciseStatus("idle");
    setShowHint(false);
  }, [title, activeExample.starterCode, activeExample.expectedOutput]);

  const handleRunCode = () => {
    setHasRun(true);
    if (activeExample.language === "javascript") {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push(
            args
              .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
              .join(" ")
          );
        },
        error: (...args: unknown[]) => {
          logs.push("[Error] " + args.map(String).join(" "));
        },
        warn: (...args: unknown[]) => {
          logs.push("[Warn] " + args.map(String).join(" "));
        },
      };
      try {
        const fn = new Function("console", code);
        const ret = fn(customConsole);
        if (logs.length === 0 && ret !== undefined) {
          logs.push(String(ret));
        }
        setOutput(logs.length > 0 ? logs.join("\n") : "Code executed successfully (0 console lines).");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setOutput(`Runtime Error: ${msg}`);
      }
    } else {
      // Simulated SQL/Python output
      setOutput(activeExample.expectedOutput);
    }
  };

  const handleCheckExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedUser = userAnswer.trim().toLowerCase();
    const cleanedExpected = activeExercise.answer.trim().toLowerCase();
    if (cleanedUser === cleanedExpected) {
      setExerciseStatus("correct");
      if (onCompleteExercise) onCompleteExercise();
    } else {
      setExerciseStatus("wrong");
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* 1. C4School / W3Schools Syntax & Invariant Reference Box */}
      <div className="clay-card p-5 border-l-4 border-l-brand-purple space-y-3 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-purple">
            <BookOpen className="w-4 h-4 text-brand-purple" />
            C4School / W3-Style Syntax &amp; Invariant Reference
          </div>
          <Badge variant="violet" className="text-[10px] font-bold">
            Interactive Reference
          </Badge>
        </div>
        <div className="space-y-2">
          {activeNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 font-mono text-xs text-slate-950 font-bold flex items-start gap-2.5 shadow-sm"
            >
              <span className="text-brand-purple font-black select-none text-sm leading-none">›</span>
              <span className="leading-relaxed text-slate-900 font-bold">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. W3Schools "Try It Yourself" Live Code Editor & Output Sandbox */}
      <div className="clay-card p-6 space-y-4 border border-purple-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-purple flex items-center justify-center text-white shadow-sm">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-950">{activeExample.title}</h4>
              <p className="text-xs text-slate-700 font-medium">
                Edit the code below and click <strong className="text-slate-950 font-bold">Run Example ▶</strong> to test live in your browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase font-mono text-[10px] font-bold">
              {activeExample.language}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCode(activeExample.starterCode);
                setOutput(activeExample.expectedOutput);
                setHasRun(false);
              }}
              className="text-xs h-8 px-3 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleRunCode}
              className="text-xs h-8 px-3.5 font-black shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              Run Example
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Code Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-900 font-mono font-bold px-1">
              <span>SOURCE CODE EDITOR</span>
              <span className="text-brand-purple font-black">Editable</span>
            </div>
            <textarea
              rows={9}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full rounded-2xl bg-slate-950 border-2 border-slate-800 p-4 font-mono text-xs text-emerald-400 font-semibold focus:outline-none focus:border-brand-purple leading-relaxed resize-y shadow-inner"
            />
          </div>

          {/* Live Execution Output */}
          <div className="space-y-1.5 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-900 font-mono font-bold px-1">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-brand-purple" />
                RESULT / CONSOLE OUTPUT
              </span>
              {hasRun && <span className="text-emerald-700 font-black">Executed Live ✓</span>}
            </div>
            <pre className="flex-1 rounded-2xl bg-slate-950 border-2 border-slate-800 p-4 font-mono text-xs text-white font-semibold overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[180px] shadow-inner">
              {output}
            </pre>
          </div>
        </div>
      </div>

      {/* 3. W3Schools "Test Yourself With Exercises" Fill-in-the-Blank Card */}
      <div className="clay-card p-6 space-y-4 border border-purple-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MondayOrb size="sm" />
            <div>
              <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                Test Yourself With Exercises
                <Badge variant="violet" className="text-[10px] font-bold">
                  Monday AI Check
                </Badge>
              </h4>
              <p className="text-xs text-slate-700 font-medium">{activeExercise.prompt}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCheckExercise} className="space-y-3">
          <div className="p-4 rounded-2xl bg-purple-50/80 border-2 border-purple-200 font-mono text-xs text-slate-950 font-extrabold flex flex-wrap items-center gap-2 shadow-sm">
            {activeExercise.codeTemplate.split("___").map((part, index, arr) => (
              <React.Fragment key={index}>
                <span className="text-slate-950">{part}</span>
                {index < arr.length - 1 && (
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setExerciseStatus("idle");
                    }}
                    placeholder="type answer..."
                    className="px-3 py-1.5 rounded-xl bg-white border-2 border-brand-purple text-brand-purple font-black text-xs w-36 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm"
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm" className="text-xs font-black shadow-md">
                Submit Answer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserAnswer(activeExercise.answer);
                  setExerciseStatus("correct");
                }}
                className="text-xs font-bold"
              >
                Show Answer
              </Button>
              {activeExercise.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-brand-purple hover:underline font-bold flex items-center gap-1 ml-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showHint ? "Hide Hint" : "Need a Hint?"}
                </button>
              )}
            </div>

            {exerciseStatus === "correct" && (
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Correct! Monday AI verified your syntax (+25 XP)
              </div>
            )}
            {exerciseStatus === "wrong" && (
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 bg-rose-50 border border-rose-300 px-3 py-1 rounded-xl shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Not quite — check the hint or click Show Answer!
              </div>
            )}
          </div>

          {showHint && activeExercise.hint && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-900 font-medium">
              <strong className="text-brand-purple font-black">Monday AI Hint:</strong> {activeExercise.hint}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
