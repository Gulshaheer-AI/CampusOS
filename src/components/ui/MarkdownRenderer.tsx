"use client";

import React, { useState } from "react";
import { Terminal, Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-md">
      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
        <span className="flex items-center gap-1.5 uppercase font-bold text-[10px] text-purple-300 tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-brand-purple" />
          {language || "CODE"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1.5 text-[11px] text-slate-400 font-medium py-0.5 px-1.5 rounded hover:bg-slate-800"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-slate-100 overflow-x-auto leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parses inline markdown: bold, italic, code, links, and removes raw syntax artifacts
 */
function renderInlineText(text: string): React.ReactNode[] {
  // Normalize raw syntax residues like ***, isolated backticks, etc.
  let sanitized = text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // strip 3 asterisks to bold text
    .replace(/^\s*\*\*\*\s*$/g, "") // strip isolated line with ***
    .replace(/^---\s*$/g, "");

  const nodes: React.ReactNode[] = [];
  // Tokenize by inline code `...`, bold **...**, italic *...*
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(sanitized)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(sanitized.substring(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      const code = token.slice(1, -1);
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-purple-100/80 border border-purple-200 text-purple-900 font-mono text-[11px] font-semibold"
        >
          {code}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key} className="font-extrabold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("__") && token.endsWith("__")) {
      nodes.push(
        <strong key={key} className="font-extrabold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const textMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (textMatch) {
        nodes.push(
          <a
            key={key}
            href={textMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-purple hover:underline font-bold"
          >
            {textMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < sanitized.length) {
    nodes.push(sanitized.substring(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  // Split by code blocks first
  const blocks: Array<{ type: "code" | "markdown"; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w+)?\r?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "markdown",
        content: content.substring(lastIndex, match.index),
      });
    }

    blocks.push({
      type: "code",
      language: match[1] || "typescript",
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: "markdown",
      content: content.substring(lastIndex),
    });
  }

  return (
    <div className={cn("space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-900", className)}>
      {blocks.map((block, bIdx) => {
        if (block.type === "code") {
          return <CodeBlock key={`block-${bIdx}`} language={block.language || "code"} code={block.content} />;
        }

        // Parse markdown text lines
        const lines = block.content.split(/\r?\n/);
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];
        let isNumbered = false;

        const flushList = (listKey: string) => {
          if (listItems.length === 0) return;
          if (isNumbered) {
            elements.push(
              <ol key={listKey} className="list-decimal pl-5 space-y-1 my-2 text-slate-800 font-medium">
                {listItems.map((item, i) => (
                  <li key={i}>{renderInlineText(item)}</li>
                ))}
              </ol>
            );
          } else {
            elements.push(
              <ul key={listKey} className="list-disc pl-5 space-y-1 my-2 text-slate-800 font-medium">
                {listItems.map((item, i) => (
                  <li key={i}>{renderInlineText(item)}</li>
                ))}
              </ul>
            );
          }
          listItems = [];
          isNumbered = false;
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          // Horizontal rule
          if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
            flushList(`list-hr-${i}`);
            elements.push(<hr key={`hr-${i}`} className="border-t border-purple-200 my-3" />);
            continue;
          }

          // Headings
          if (trimmed.startsWith("#### ")) {
            flushList(`list-h4-${i}`);
            elements.push(
              <h5 key={`h4-${i}`} className="text-xs font-black uppercase tracking-wider text-purple-900 mt-2 mb-1">
                {renderInlineText(trimmed.replace(/^####\s+/, ""))}
              </h5>
            );
            continue;
          }
          if (trimmed.startsWith("### ")) {
            flushList(`list-h3-${i}`);
            elements.push(
              <h4 key={`h3-${i}`} className="text-sm font-extrabold text-slate-950 mt-3 mb-1">
                {renderInlineText(trimmed.replace(/^###\s+/, ""))}
              </h4>
            );
            continue;
          }
          if (trimmed.startsWith("## ")) {
            flushList(`list-h2-${i}`);
            elements.push(
              <h3 key={`h2-${i}`} className="text-base font-extrabold text-slate-950 mt-3 mb-1">
                {renderInlineText(trimmed.replace(/^##\s+/, ""))}
              </h3>
            );
            continue;
          }
          if (trimmed.startsWith("# ")) {
            flushList(`list-h1-${i}`);
            elements.push(
              <h2 key={`h1-${i}`} className="text-lg font-black text-slate-950 mt-4 mb-1.5">
                {renderInlineText(trimmed.replace(/^#\s+/, ""))}
              </h2>
            );
            continue;
          }

          // Blockquote
          if (trimmed.startsWith("> ")) {
            flushList(`list-quote-${i}`);
            elements.push(
              <blockquote
                key={`quote-${i}`}
                className="border-l-4 border-brand-purple/60 bg-purple-50/60 pl-3 py-1.5 my-2 rounded-r-lg text-slate-700 italic text-xs leading-relaxed"
              >
                {renderInlineText(trimmed.replace(/^>\s+/, ""))}
              </blockquote>
            );
            continue;
          }

          // Bullet list: - or *
          if (/^[-*+]\s+/.test(trimmed)) {
            if (isNumbered && listItems.length > 0) {
              flushList(`list-prev-${i}`);
            }
            isNumbered = false;
            listItems.push(trimmed.replace(/^[-*+]\s+/, ""));
            continue;
          }

          // Numbered list: 1. or 2.
          if (/^\d+\.\s+/.test(trimmed)) {
            if (!isNumbered && listItems.length > 0) {
              flushList(`list-prev-${i}`);
            }
            isNumbered = true;
            listItems.push(trimmed.replace(/^\d+\.\s+/, ""));
            continue;
          }

          // Empty line
          if (!trimmed) {
            flushList(`list-empty-${i}`);
            continue;
          }

          // Regular paragraph
          flushList(`list-p-${i}`);
          elements.push(
            <p key={`p-${i}`} className="font-medium text-slate-900 leading-relaxed my-1">
              {renderInlineText(trimmed)}
            </p>
          );
        }

        flushList(`list-final-${bIdx}`);

        return <React.Fragment key={`block-frag-${bIdx}`}>{elements}</React.Fragment>;
      })}
    </div>
  );
}
