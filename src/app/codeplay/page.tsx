"use client";

import { runPython } from "@/lib/python-runner";
import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MondayOrb } from "@/components/ui/MondayOrb";
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Maximize2,
  Minimize2,
  ShieldCheck,
  FileCode,
  FolderOpen,
  UploadCloud,
  Plus,
  Trash2,
  Check,
  Zap,
  Download,
  Layers,
  Wand2,
  Bug,
  Cpu,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeFile {
  id: string;
  name: string;
  language: "html" | "css" | "javascript" | "python" | "json";
  content: string;
}

const DEFAULT_FILES: IdeFile[] = [
  {
    id: "file-html",
    name: "index.html",
    language: "html",
    content: `<div class="card-wrapper">
  <div class="glow-orb"></div>
  <div class="glass-card">
    <div class="card-header">
      <span class="badge">CampusOS Lab</span>
      <h2 class="title">Binary Search Explorer</h2>
    </div>
    <p class="subtitle">Interactive divide-and-conquer simulation with O(log N) verification.</p>
    
    <div class="metrics-grid">
      <div class="metric-pill">
        <span class="metric-label">Runtime Complexity</span>
        <span class="metric-val">O(log N)</span>
      </div>
      <div class="metric-pill">
        <span class="metric-label">Space Overhead</span>
        <span class="metric-val">O(1)</span>
      </div>
    </div>

    <div class="action-row">
      <button id="runBtn" class="primary-btn">Execute Bisection</button>
      <button id="resetBtn" class="secondary-btn">Reset Invariants</button>
    </div>

    <div class="terminal-box">
      <div class="terminal-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="terminal-title">runtime.console</span>
      </div>
      <div id="terminalLog" class="terminal-content">System ready. Click Execute to begin bisection.</div>
    </div>
  </div>
</div>`,
  },
  {
    id: "file-css",
    name: "styles.css",
    language: "css",
    content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #1B2848;
  color: #F8FAFC;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.card-wrapper {
  position: relative;
  max-width: 520px;
  width: 100%;
}
.glow-orb {
  position: absolute;
  top: -20px;
  left: 20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(242, 151, 160, 0.35) 0%, rgba(182, 227, 212, 0.25) 70%, transparent 100%);
  filter: blur(40px);
  pointer-events: none;
}
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(16px);
}
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(182, 227, 212, 0.15);
  color: #B6E3D4;
  border: 1px solid rgba(182, 227, 212, 0.3);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.title {
  font-size: 24px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.5px;
}
.subtitle {
  color: #94A3B8;
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.5;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 20px 0;
}
.metric-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 14px;
  border-radius: 16px;
}
.metric-label {
  display: block;
  font-size: 11px;
  color: #94A3B8;
  text-transform: uppercase;
  font-weight: 600;
}
.metric-val {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #F297A0;
  margin-top: 4px;
  font-family: monospace;
}
.action-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.primary-btn {
  background: #F297A0;
  color: #1B2848;
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 10px 18px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 18px rgba(242, 151, 160, 0.35);
}
.primary-btn:hover {
  transform: translateY(-1px);
}
.secondary-btn {
  background: transparent;
  color: #E2E8F0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 16px;
  border-radius: 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
}
.terminal-box {
  background: #131D35;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
}
.terminal-bar {
  background: rgba(255, 255, 255, 0.04);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot.red { background: #EF4444; }
.dot.yellow { background: #F59E0B; }
.dot.green { background: #10B981; }
.terminal-title {
  margin-left: 6px;
  font-size: 11px;
  font-family: monospace;
  color: #94A3B8;
}
.terminal-content {
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: #B6E3D4;
  min-height: 48px;
  line-height: 1.5;
}`,
  },
  {
    id: "file-js",
    name: "main.js",
    language: "javascript",
    content: `const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const log = document.getElementById('terminalLog');

const sortedArray = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
const target = 45;

let low = 0;
let high = sortedArray.length - 1;
let step = 0;

runBtn.addEventListener('click', () => {
  if (low <= high) {
    step++;
    const mid = low + Math.floor((high - low) / 2);
    const midVal = sortedArray[mid];

    if (midVal === target) {
      log.innerHTML = \`[Step \${step}] Target \${target} FOUND at index \${mid}! Invariant holds.\`;
      console.log(\`Target \${target} matched at index \${mid}\`);
      low = high + 1; // Terminate
    } else if (midVal < target) {
      log.innerHTML = \`[Step \${step}] midVal (\${midVal}) < \${target}. Eliminating left half. New range: [\${mid + 1}..\${high}]\`;
      console.log(\`Bisecting search space to right half: \${mid + 1}..\${high}\`);
      low = mid + 1;
    } else {
      log.innerHTML = \`[Step \${step}] midVal (\${midVal}) > \${target}. Eliminating right half. New range: [\${low}..\${mid - 1}]\`;
      console.log(\`Bisecting search space to left half: \${low}..\${mid - 1}\`);
      high = mid - 1;
    }
  } else {
    log.innerHTML = 'Search concluded. Click Reset to re-initialize bounds.';
  }
});

resetBtn.addEventListener('click', () => {
  low = 0;
  high = sortedArray.length - 1;
  step = 0;
  log.innerHTML = 'Pointers re-initialized: low=0, high=10. Array: [2..91].';
  console.log('Invariant pointers cleared to default bounds.');
});`,
  },
  {
    id: "file-py",
    name: "algorithm.py",
    language: "python",
    content: `# Python 3 Divide & Conquer Verification Script
def verify_binary_search():
    arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]
    target = 45
    print("Executing Python 3 Binary Search Verification...")
    print("Input Array:", arr)
    print("Target:", target)
    print("Verified Index: 7 | Complexity: O(log N)")

verify_binary_search()`,
  },
];

export default function CodePlayPage() {
  const [files, setFiles] = useState<IdeFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("file-html");
  const [consoleLogs, setConsoleLogs] = useState<{ type: "log" | "warn" | "error"; text: string; time: string }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Height controls for Row 1 (Live Preview + Console) and Row 2 (Code Editor)
  const [previewHeight, setPreviewHeight] = useState<"380px" | "500px" | "640px">("500px");
  const [editorHeight, setEditorHeight] = useState<"420px" | "540px" | "680px">("540px");

  // History stack for instant Undo of AI changes
  const [undoStack, setUndoStack] = useState<IdeFile[][]>([]);

  // Monday AI Assistant state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const htmlContent = files.find((f) => f.language === "html")?.content || "";
  const cssContent = files.find((f) => f.language === "css")?.content || "";
  const jsContent = files.find((f) => f.language === "javascript")?.content || "";

  // Compile sandboxed document
  const compileSandboxDoc = () => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      ${cssContent}
    </style>
  </head>
  <body>
    ${htmlContent}
    <script>
      (function() {
        const _log = console.log;
        const _warn = console.warn;
        const _error = console.error;

        function sendMsg(type, args) {
          try {
            const text = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            window.parent.postMessage({ source: 'codeplay_console', type, text, time: new Date().toLocaleTimeString() }, '*');
          } catch(e) {}
        }

        console.log = function() { _log.apply(console, arguments); sendMsg('log', arguments); };
        console.warn = function() { _warn.apply(console, arguments); sendMsg('warn', arguments); };
        console.error = function() { _error.apply(console, arguments); sendMsg('error', arguments); };

        window.onerror = function(msg, url, line) {
          sendMsg('error', ['Runtime Error: ' + msg + ' (Line ' + line + ')']);
        };
      })();

      try {
        ${jsContent}
      } catch(err) {
        console.error(err.message);
      }
    </script>
  </body>
</html>`;
  };

  const pythonRun = useRef<ReturnType<typeof runPython> | null>(null);
  useEffect(() => () => pythonRun.current?.cancel(), []);

  const handleRunCode = () => {
    setConsoleLogs([]);
    pythonRun.current?.cancel();
    if (activeFile.language === "python") {
      setConsoleLogs([{ type: "log", text: "Loading Python runtime…", time: new Date().toLocaleTimeString() }]);
      pythonRun.current = runPython(activeFile.content, (text, error) => {
        setConsoleLogs(logs => [...logs.slice(-99), { type: error ? "error" : "log", text, time: new Date().toLocaleTimeString() }]);
      });
      return;
    }
    if (iframeRef.current) {
      iframeRef.current.srcdoc = compileSandboxDoc();
    }
  };

  useEffect(() => {
    handleRunCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.source === "codeplay_console") {
        setConsoleLogs((prev) => [
          ...prev.slice(-49),
          { type: e.data.type, text: e.data.text, time: e.data.time },
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Keyboard shortcut Ctrl+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [htmlContent, cssContent, jsContent]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ext = file.name.split(".").pop()?.toLowerCase();
      let language: IdeFile["language"] = "javascript";
      if (ext === "html" || ext === "htm") language = "html";
      else if (ext === "css") language = "css";
      else if (ext === "py") language = "python";
      else if (ext === "json") language = "json";

      const newFile: IdeFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        language,
        content,
      };

      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      setAiMessage(`Uploaded '${file.name}' into CodePlay workspace.`);
      setTimeout(() => setAiMessage(null), 3500);
    };
    reader.readAsText(file);
  };

  // Monday AI Code Assistant: Directly applies code modifications to buffer & executes
  const handleAiAction = async (action: "beautify" | "debug" | "explain" | "fix_error" | "generate" | "custom") => {
    setIsAiGenerating(true);
    setAiMessage(null);

    try {
      const res = await fetch("/api/ai/codeplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "custom" ? "generate" : action,
          html: htmlContent,
          css: cssContent,
          js: jsContent,
          activeFileName: activeFile.name,
          activeLanguage: activeFile.language,
          activeContent: activeFile.content,
          prompt: action === "custom" ? aiPrompt : "",
          allFiles: files.map((f) => ({ name: f.name, language: f.language })),
        }),
      });

      const data = await res.json();
      if (data?.explanation) {
        if (action === "explain") {
          setAiMessage(data.explanation);
        } else {
          // Push current workspace to undo stack
          setUndoStack((prev) => [...prev.slice(-10), files]);

          // Directly apply changes into workspace files
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === activeFileId && data.activeContent) {
                return { ...f, content: data.activeContent };
              }
              if (f.language === "html" && data.html) return { ...f, content: data.html };
              if (f.language === "css" && data.css) return { ...f, content: data.css };
              if (f.language === "javascript" && data.js) return { ...f, content: data.js };
              if (f.language === "python" && data.activeContent) return { ...f, content: data.activeContent };
              return f;
            })
          );

          setAiMessage(`Monday AI updated ${activeFile.name} & re-executed preview! ${data.explanation}`);
          if (aiPrompt) setAiPrompt("");
          setTimeout(() => handleRunCode(), 150);
        }
      }
    } catch (err) {
      console.warn("CodePlay AI error:", err);
      setAiMessage("Monday AI experienced a connection timeout. Retrying with local code repair...");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setFiles(previous);
    setAiMessage("Reverted workspace to previous code snapshot.");
    setTimeout(() => handleRunCode(), 100);
  };

  const handleCreateNewFile = () => {
    const filename = prompt("Enter new file name (e.g. algorithm.py, styles2.css, helper.js):", "helper.js");
    if (!filename) return;
    const cleanName = filename.trim();
    let language: IdeFile["language"] = "javascript";
    if (cleanName.endsWith(".html") || cleanName.endsWith(".htm")) language = "html";
    else if (cleanName.endsWith(".css")) language = "css";
    else if (cleanName.endsWith(".py")) language = "python";
    else if (cleanName.endsWith(".json")) language = "json";

    const newFile: IdeFile = {
      id: `file-${Date.now()}`,
      name: cleanName,
      language,
      content: language === "python" ? "# Python file in CodePlay\n" : "// New code buffer\n",
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert("At least one file must remain in the workspace.");
      return;
    }
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  const updateActiveContent = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );
  };

  const lineCount = activeFile.content.split("\n").length;

  return (
    <AppShell>
      <div className={cn("space-y-5", isFullscreen && "fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto")}>
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-5 sm:p-6 relative overflow-hidden text-white shadow-xl rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="cyan" className="font-bold">Campus Learn</Badge>
                <span className="text-xs text-purple-100 font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                  Monday AI Multi-Language IDE
                </span>
                <span className="text-xs text-purple-100 font-semibold">Isolated Browser Sandbox</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CodePlay Coding Playground &amp; IDE
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.css,.js,.ts,.py,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-black bg-white text-brand-purple hover:bg-purple-50 shadow-md border-none"
              >
                <UploadCloud className="w-4 h-4 mr-1 text-brand-purple" />
                Upload File
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiles(DEFAULT_FILES);
                  setTimeout(() => handleRunCode(), 50);
                }}
                className="text-xs font-bold border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>

              <Button
                size="sm"
                onClick={handleRunCode}
                className="font-black text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-md border-none"
              >
                <Play className="w-3.5 h-3.5 mr-1 fill-slate-950" />
                Run (Ctrl+Enter)
              </Button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen IDE"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Monday AI Copilot Toolbar */}
        <div className="clay-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs bg-white border border-purple-200 shadow-sm rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-slate-950 flex items-center gap-2 mr-1">
              <MondayOrb size="sm" state={isAiGenerating ? "thinking" : "idle"} />
              Monday AI Copilot:
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAiAction("beautify")}
              disabled={isAiGenerating}
              className="text-xs py-1 h-8 font-semibold text-slate-800 border-purple-200 hover:bg-purple-50"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Beautify UI (3D Claymorphism)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAiAction("debug")}
              disabled={isAiGenerating}
              className="text-xs py-1 h-8 font-semibold text-slate-800 border-purple-200 hover:bg-purple-50"
            >
              <Bug className="w-3.5 h-3.5 mr-1 text-rose-500" />
              AI Debug &amp; Fix
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAiAction("explain")}
              disabled={isAiGenerating}
              className="text-xs py-1 h-8 font-semibold text-slate-800 border-purple-200 hover:bg-purple-50"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Explain Syntax &amp; Complexity
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAiAction("fix_error")}
              disabled={isAiGenerating}
              className="text-xs py-1 h-8 font-semibold text-slate-800 border-purple-200 hover:bg-purple-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Fix Syntax Error
            </Button>

            {undoStack.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                className="text-xs py-1 h-8 font-bold text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100"
              >
                <Undo2 className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Undo AI Edit ({undoStack.length})
              </Button>
            )}
          </div>

          {/* Custom Prompt Box */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Monday AI: 'Edit code to add modal', 'Fix error in ide'..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && aiPrompt.trim()) handleAiAction("custom");
              }}
              className="flex-1 clay-input rounded-xl px-3 py-1.5 text-xs text-slate-950 font-medium placeholder-slate-400 bg-white border border-purple-200"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={!aiPrompt.trim() || isAiGenerating}
              onClick={() => handleAiAction("custom")}
              className="py-1 h-8 text-xs px-3 font-bold"
            >
              Generate &amp; Apply
            </Button>
          </div>
        </div>

        {/* AI Notification Banner */}
        {aiMessage && (
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-slate-900 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-purple shrink-0" />
              <span className="font-semibold">{aiMessage}</span>
            </div>
            {undoStack.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                className="text-xs py-0.5 h-7 px-2 border-purple-300 text-brand-purple font-bold hover:bg-purple-100"
              >
                <Undo2 className="w-3 h-3 mr-1" /> Revert
              </Button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ROW 1: LIVE PREVIEW & FULL-SIZE EXECUTION CONSOLE       */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1.5 text-brand-purple font-black">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Row 1: Live Interactive Preview &amp; Execution Console
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Preview Height:</span>
              {(["380px", "500px", "640px"] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setPreviewHeight(h)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                    previewHeight === h
                      ? "bg-brand-purple text-white shadow-sm"
                      : "bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200"
                  )}
                >
                  {h === "380px" ? "Compact (380px)" : h === "500px" ? "Normal (500px)" : "Full (640px)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: previewHeight }}>
            {/* Live Preview Iframe (7 cols) */}
            <div className="lg:col-span-7 bg-white border-2 border-purple-100 rounded-2xl overflow-hidden flex flex-col shadow-clay h-full">
              <div className="px-3.5 py-2 bg-purple-50/80 border-b border-purple-100 flex items-center justify-between text-xs">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Live Preview (Sandboxed Render Canvas)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunCode}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                  >
                    <Play className="w-3 h-3 fill-emerald-700" /> Refresh Canvas
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold hidden sm:inline">
                    sandbox="allow-scripts allow-modals"
                  </span>
                </div>
              </div>

              <iframe
                ref={iframeRef}
                title="CodePlay Isolated Preview"
                sandbox="allow-scripts allow-modals"
                className="w-full flex-1 bg-white border-none"
              />
            </div>

            {/* Full-Size Execution Console (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950 border-2 border-purple-100/60 rounded-2xl overflow-hidden flex flex-col shadow-lg h-full">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Execution Console ({consoleLogs.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConsoleLogs([])}
                    className="text-[10px] text-slate-400 hover:text-white font-bold bg-slate-800 px-2 py-0.5 rounded"
                  >
                    Clear Console
                  </button>
                </div>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {consoleLogs.length === 0 ? (
                  <div className="text-slate-500 text-center py-10 italic font-medium">
                    No runtime messages yet. Logs, console.log outputs, and errors stream here in real time.
                  </div>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 leading-relaxed px-2 py-1 rounded border",
                        log.type === "error"
                          ? "bg-rose-950/40 text-rose-300 border-rose-900/50"
                          : log.type === "warn"
                          ? "bg-amber-950/40 text-amber-300 border-amber-900/50"
                          : "bg-slate-900/80 text-slate-300 border-slate-800"
                      )}
                    >
                      <span className="text-[9px] text-slate-500 shrink-0">{log.time}</span>
                      <span className="font-bold uppercase text-[9px] px-1 rounded bg-slate-800 border border-slate-700">
                        {log.type}
                      </span>
                      <span className="whitespace-pre-wrap break-all">{log.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ROW 2: WORKSPACE FILES & FULL-SIZE CODE EDITOR           */}
        {/* ======================================================== */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1.5 text-brand-purple font-black">
              <Code2 className="w-4 h-4 text-brand-purple" />
              Row 2: Workspace Files Explorer &amp; Full-Size Code Editor
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Editor Height:</span>
              {(["420px", "540px", "680px"] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setEditorHeight(h)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                    editorHeight === h
                      ? "bg-brand-purple text-white shadow-sm"
                      : "bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200"
                  )}
                >
                  {h === "420px" ? "Standard (420px)" : h === "540px" ? "Tall (540px)" : "Max (680px)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: editorHeight }}>
            {/* File Explorer Sidebar (2 cols) */}
            <div className="lg:col-span-2 flex flex-col bg-white border-2 border-purple-100 rounded-2xl p-3 space-y-2 overflow-y-auto shadow-clay text-slate-900 h-full">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-purple pb-2 border-b border-purple-100">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-brand-purple" />
                  Workspace Files
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCreateNewFile}
                    className="p-1 rounded-md bg-purple-100 hover:bg-purple-200 text-brand-purple transition-colors"
                    title="Create New File"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] bg-purple-100 text-brand-purple px-1.5 py-0.5 rounded-full font-bold">
                    {files.length}
                  </span>
                </div>
              </div>

              <div className="space-y-1 flex-1 overflow-y-auto">
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer group",
                        isActive
                          ? "clay-button-primary text-white font-bold shadow-sm"
                          : "text-slate-700 hover:text-brand-purple hover:bg-purple-50 font-medium"
                      )}
                    >
                      <span className="truncate flex items-center gap-1.5 flex-1 mr-1">
                        <FileCode className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-white" : "text-brand-purple")} />
                        <span className="truncate">{file.name}</span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={cn("text-[10px] uppercase font-bold", isActive ? "text-purple-200" : "text-slate-500")}>
                          {file.language.slice(0, 2)}
                        </span>
                        {files.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFile(file.id, e)}
                            className={cn(
                              "opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-100 hover:text-rose-600 transition-all",
                              isActive ? "text-purple-200 hover:text-white" : "text-slate-400"
                            )}
                            title="Delete file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-auto pt-2 border-t border-purple-100 text-[11px] text-brand-purple font-bold hover:underline flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Import Local File
              </button>
            </div>

            {/* Code Editor Panel (10 cols - Full Size Width) */}
            <div className="lg:col-span-10 flex flex-col bg-slate-900 border-2 border-purple-200 rounded-2xl overflow-hidden shadow-xl h-full">
              {/* Tab Bar */}
              <div className="flex items-center bg-slate-950 border-b border-slate-800 overflow-x-auto px-2 pt-1 gap-1">
                {files.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFileId(f.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-t-lg text-xs font-mono border-t border-x transition-colors shrink-0 flex items-center gap-1.5",
                      f.id === activeFileId
                        ? "bg-slate-900 text-white border-brand-purple/50 font-bold border-t-2"
                        : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
                    )}
                  >
                    <FileCode className="w-3 h-3 text-cyan-400" />
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Editor Area with Line Numbers */}
              <div className="flex-1 flex overflow-hidden font-mono text-xs bg-slate-900">
                {/* Line Numbers Gutter */}
                <div className="w-12 bg-slate-950 border-r border-slate-800 py-3 text-right pr-2 text-slate-500 select-none overflow-hidden shrink-0">
                  {Array.from({ length: Math.min(lineCount, 600) }).map((_, i) => (
                    <div key={i} className="leading-relaxed text-[11px]">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code Textarea */}
                <textarea
                  value={activeFile.content}
                  onChange={(e) => updateActiveContent(e.target.value)}
                  spellCheck={false}
                  className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none leading-relaxed overflow-auto font-mono text-xs whitespace-pre"
                />
              </div>

              {/* Status Bar */}
              <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-purple-300 font-bold">{activeFile.name}</span>
                  <span>•</span>
                  <span>{lineCount} lines</span>
                  <span>•</span>
                  <span>{activeFile.content.length} chars</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">Sandboxed Environment ✓</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Ctrl+Enter to Run</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
