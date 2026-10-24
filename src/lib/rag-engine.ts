/**
 * CampusOS Retrieval-Augmented Generation (RAG) & Document Indexing Engine
 *
 * Implements:
 * - L2-normalized cosine vector similarity retrieval over TF-IDF vectors
 * - Exact phrase match boost
 * - Semantic fallback for broad document queries
 * - Grounded prompt builder with source citations
 * - Dynamic quiz question generation from document text
 */

import { Question, QuestionType } from "@/types";

export interface DocumentChunk {
  id: string;
  fileId: string;
  fileName: string;
  chunkIndex: number;
  content: string;
  wordCount: number;
}

export interface UploadedKnowledgeFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  type: "image" | "pdf" | "word" | "csv" | "text" | "code";
  uploadedAt: string;
  rawText?: string;
  imageDataUrl?: string; // base64 preview & multimodal Vision payload
  chunks: DocumentChunk[];
  metadata?: Record<string, any>;
}

export interface RagSearchResult {
  chunk: DocumentChunk;
  score: number;
  matchedTerms: string[];
}

/**
 * Splits text into overlapping semantic chunks of ~250-300 words with 40-50 words overlap
 */
export function chunkTextContent(
  text: string,
  fileId: string,
  fileName: string,
  chunkSize = 250,
  chunkOverlap = 40
): DocumentChunk[] {
  if (!text.trim()) return [];
  const target = Number.isFinite(chunkSize) ? Math.max(1, Math.floor(chunkSize)) : 250;
  const overlap = Number.isFinite(chunkOverlap) ? Math.min(Math.max(0, chunkOverlap), target - 1) : 0;
  const count = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  // Fences, display equations and paragraphs are atomic. Newlines/indentation survive.
  const blocks = text.match(/```[^\n]*\n[\s\S]*?(?:```|$)|~~~[^\n]*\n[\s\S]*?(?:~~~|$)|\$\$[\s\S]*?\$\$|(?:(?!```|~~~|\$\$)[^\n]+(?:\n(?!\s*\n|```|~~~|\$\$)[^\n]+)*)/g) || [];
  const codeFile = /\.(py|js|ts|tsx|jsx|java|cpp|c|sql)$/i.test(fileName);
  const atoms = blocks.flatMap(block => {
    if (codeFile || /^(?:```|~~~|\$\$)/.test(block) || count(block) <= target) return [block];
    // Prefer complete sentences; only a single oversized prose sentence uses a word fallback.
    return (block.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [block]).flatMap(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length <= target) return [sentence.trim()];
      const pieces: string[] = [];
      for (let i = 0; i < words.length; i += target) pieces.push(words.slice(i, i + target).join(" "));
      return pieces;
    });
  });
  const contents: string[] = [];
  let current: string[] = [];
  for (const atom of atoms) {
    if (current.length && count(current.join("\n\n")) + count(atom) > target) {
      contents.push(current.join("\n\n"));
      const tail: string[] = [];
      for (let i = current.length - 1; i >= 0 && count([current[i], ...tail].join(" ")) <= overlap; i--) tail.unshift(current[i]);
      current = count([...tail, atom].join(" ")) <= target ? tail : [];
    }
    current.push(atom);
  }
  if (current.length) contents.push(current.join("\n\n"));
  return contents.map((content, index) => ({ id: `${fileId}-chunk-${index + 1}`, fileId, fileName, chunkIndex: index + 1, content, wordCount: count(content) }));
}

/**
 * Parses CSV raw text into readable structured chunks
 */
export function parseCsvIntoChunks(
  csvText: string,
  fileId: string,
  fileName: string
): { summary: string; chunks: DocumentChunk[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { summary: "Empty CSV file", chunks: [] };
  }

  const header = lines[0];
  const dataRows = lines.slice(1);
  const summary = `CSV dataset '${fileName}' containing ${dataRows.length} records with columns: ${header}`;

  // Batch every 15 rows into a chunk
  const chunks: DocumentChunk[] = [];
  const rowsPerChunk = 15;
  for (let i = 0; i < dataRows.length; i += rowsPerChunk) {
    const rowBatch = dataRows.slice(i, i + rowsPerChunk);
    const content = `Columns: ${header}\nRows (${i + 1} to ${i + rowBatch.length}):\n${rowBatch.join("\n")}`;
    chunks.push({
      id: `${fileId}-csv-${Math.floor(i / rowsPerChunk) + 1}`,
      fileId,
      fileName,
      chunkIndex: Math.floor(i / rowsPerChunk) + 1,
      content,
      wordCount: content.split(/\s+/).length,
    });
  }

  return { summary, chunks };
}

// Common English stopwords to ignore during term indexing
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
  "by", "can", "did", "do", "does", "doing", "don", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
  "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
  "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she",
  "should", "so", "some", "such", "t", "than", "that", "the", "their", "theirs", "them",
  "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
  "while", "who", "whom", "why", "will", "with", "you", "your", "yours", "yourself",
]);

/**
 * Tokenizes text into lowercase word tokens, stripping punctuation (Unicode-aware)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\-\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Checks if query is a broad overview question
 */
function isBroadOverviewQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  const broadPatterns = [
    /what is this (document|file|notes|paper|slide) about/i,
    /summar(y|ize)/i,
    /overview/i,
    /topics covered/i,
    /what does this cover/i,
    /explain this document/i,
    /table of contents/i,
    /syllabus/i,
  ];
  return broadPatterns.some((pattern) => pattern.test(q)) || (q.split(/\s+/).length <= 2 && /^(notes|slides|document|lecture|summary)$/i.test(q));
}

/**
 * Semantic Vector Retrieval using L2-Normalized Cosine Similarity over TF-IDF vectors,
 * with exact phrase match boosts and broad query fallback.
 */
export function searchKnowledgeChunks(
  query: string,
  files: UploadedKnowledgeFile[],
  topK = 5
): RagSearchResult[] {
  const allChunks: DocumentChunk[] = [];
  for (const f of files) {
    if (f.chunks && f.chunks.length > 0) {
      allChunks.push(...f.chunks);
    }
  }

  if (allChunks.length === 0) return [];

  const rawQuery = query.trim().toLowerCase();
  const queryTokens = tokenize(query).filter((w) => !STOP_WORDS.has(w));
  const effectiveQueryTokens = queryTokens;

  const N = allChunks.length;

  // 1. Compute Document Frequencies df[term] across all chunks
  const df: Record<string, number> = {};
  const chunkTokenFreqs: Array<{ termCounts: Record<string, number>; totalWords: number }> = [];

  for (const chunk of allChunks) {
    const tokens = tokenize(chunk.content);
    const counts: Record<string, number> = {};
    const seenInThisChunk = new Set<string>();

    for (const t of tokens) {
      counts[t] = (counts[t] || 0) + 1;
      if (!seenInThisChunk.has(t)) {
        seenInThisChunk.add(t);
        df[t] = (df[t] || 0) + 1;
      }
    }
    chunkTokenFreqs.push({ termCounts: counts, totalWords: Math.max(tokens.length, 1) });
  }

  // 2. Query vector weights and L2 norm
  const queryWeights: Record<string, number> = {};
  let queryNormSq = 0;

  for (const term of effectiveQueryTokens) {
    const docFreq = df[term] || 0;
    // Smoothed BM25 / Lucene-style IDF
    const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
    const tf = 1.0;
    const w = tf * idf;
    queryWeights[term] = w;
    queryNormSq += w * w;
  }

  const queryNorm = Math.sqrt(queryNormSq);

  // 3. Score each chunk using L2-normalized cosine similarity
  const scored: RagSearchResult[] = [];

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const { termCounts, totalWords } = chunkTokenFreqs[i];
    const chunkLower = chunk.content.toLowerCase();

    let dotProduct = 0;
    let chunkNormSq = 0;
    const matchedTerms: string[] = [];

    // Calculate norm over chunk terms that appear in query
    for (const term of effectiveQueryTokens) {
      const count = termCounts[term] || 0;
      if (count > 0) {
        matchedTerms.push(term);
        const docFreq = df[term] || 0;
        const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
        // Sublinear TF normalized by chunk length
        const tf = Math.log(1 + count) / Math.log(1 + totalWords);
        const chunkWeight = tf * idf;
        const qWeight = queryWeights[term] || 0;

        dotProduct += qWeight * chunkWeight;
      }
    }

    // Total chunk L2 vector norm across all its distinct terms
    for (const [t, cnt] of Object.entries(termCounts)) {
      const docFreq = df[t] || 1;
      const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
      const tf = Math.log(1 + cnt) / Math.log(1 + totalWords);
      const w = tf * idf;
      chunkNormSq += w * w;
    }

    const chunkNorm = Math.sqrt(chunkNormSq);
    let cosineSim = 0;
    if (queryNorm > 0 && chunkNorm > 0) {
      cosineSim = dotProduct / (queryNorm * chunkNorm);
    }

    // 4. Exact Phrase Match Boost
    let phraseBoost = 0;
    if (rawQuery.length >= 3 && chunkLower.includes(rawQuery)) {
      phraseBoost += 0.45; // exact match of the entire query string
    } else if (effectiveQueryTokens.length >= 2) {
      // Check for 2-word consecutive phrase matches
      for (let j = 0; j < effectiveQueryTokens.length - 1; j++) {
        const bigram = `${effectiveQueryTokens[j]} ${effectiveQueryTokens[j + 1]}`;
        if (chunkLower.includes(bigram)) {
          phraseBoost += 0.15;
        }
      }
    }

    const totalScore = cosineSim + phraseBoost;

    if (totalScore > 0.001) {
      scored.push({
        chunk,
        score: Number(totalScore.toFixed(4)),
        matchedTerms,
      });
    }
  }

  // 5. Semantic fallback for broad queries or when no terms matched
  if (scored.length === 0 || isBroadOverviewQuery(query)) {
    // Return early chunks (typically document overview, syllabus, slide 1)
    const fallbackResults: RagSearchResult[] = [];
    const seenFiles = new Set<string>();

    for (const chunk of allChunks) {
      if (!seenFiles.has(chunk.fileId) || chunk.chunkIndex <= 2) {
        seenFiles.add(chunk.fileId);
        fallbackResults.push({
          chunk,
          score: chunk.chunkIndex === 1 ? 0.75 : 0.60,
          matchedTerms: ["document-overview"],
        });
      }
      if (fallbackResults.length >= topK) break;
    }

    if (scored.length === 0) {
      return fallbackResults.slice(0, topK);
    }

    // Merge high scored with overview fallback if broad
    const mergedMap = new Map<string, RagSearchResult>();
    for (const r of scored) mergedMap.set(r.chunk.id, r);
    for (const r of fallbackResults) {
      if (!mergedMap.has(r.chunk.id)) {
        mergedMap.set(r.chunk.id, r);
      }
    }
    return Array.from(mergedMap.values()).sort((a, b) => b.score - a.score).slice(0, topK);
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Formats retrieved chunks into grounded RAG context block for LLM prompts
 */
export function buildGroundedRagPrompt(
  retrievalResults: RagSearchResult[],
  userQuery: string
): string {
  if (retrievalResults.length === 0) {
    return userQuery;
  }

  const contextBlocks = retrievalResults
    .map(
      (r, idx) =>
        `[SOURCE ${idx + 1}: ${r.chunk.fileName} (Section ${r.chunk.chunkIndex})]\n${r.chunk.content.trim()}`
    )
    .join("\n\n---\n\n");

  return `[GROUNDED DOCUMENT CONTEXT FOR RAG RETRIEVAL]
The student has uploaded relevant source materials. Use the factual information below to synthesize your answer.
When answering, explicitly cite the source file (e.g., "[According to ${retrievalResults[0]?.chunk.fileName} (Section ${retrievalResults[0]?.chunk.chunkIndex})...]"):

${contextBlocks}

[STUDENT QUESTION]:
${userQuery}`;
}

/**
 * Extracts key sentences and concepts from text to generate genuine dynamic quiz questions
 */
export function generateQuizFromText(
  text: string,
  topic = "Course Material",
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
  count = 3
): { title: string; questions: Question[] } {
  const cleaned = text.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 250);

  // Extract key terms (capitalized words, terms followed by is/are/defines/invariants)
  const definitionMatches: { term: string; definition: string; sentence: string }[] = [];
  const defRegex = /([A-Z][a-zA-Z0-9_\s-]{2,25})\s+(?:is|are|refers to|defines|states that|represents)\s+([^,.;]{10,120})/g;
  let match: RegExpExecArray | null;

  while ((match = defRegex.exec(cleaned)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();
    if (!STOP_WORDS.has(term.toLowerCase()) && term.length > 2) {
      definitionMatches.push({ term, definition, sentence: match[0] });
    }
  }

  // Extract invariant/rule statements
  const invariantSentences = sentences.filter((s) =>
    /\b(invariant|property|algorithm|runtime|complexity|bound|guarantee|precondition|postcondition|step|key|rule|benefit)\b/i.test(s)
  );

  const pool = [...definitionMatches, ...invariantSentences];
  const questions: Question[] = [];

  // Question 1: Multiple choice definition or concept question
  if (definitionMatches.length > 0) {
    const topDef = definitionMatches[0];
    const wrongAnswers = [
      "An asynchronous event listener for UI transitions",
      "A constant-time O(1) buffer allocation pattern",
      "A redundant verification check excluded during compiler optimization",
      "A memory compression heuristic applied to heap objects",
    ];

    questions.push({
      id: `q-rag-${Date.now()}-1`,
      text: `According to the lecture text, what does "${topDef.term}" describe?`,
      type: "multiple_choice",
      options: [
        `${topDef.definition.charAt(0).toUpperCase() + topDef.definition.slice(1)}`,
        wrongAnswers[0],
        wrongAnswers[1],
        wrongAnswers[2],
      ],
      correctAnswer: 0,
      explanation: `Directly stated in the source notes: "${topDef.sentence}".`,
      topic,
      difficulty,
      points: 10,
    });
  } else if (sentences.length > 0) {
    const s = sentences[0];
    questions.push({
      id: `q-rag-${Date.now()}-1`,
      text: `Based on the provided notes on ${topic}, which statement is explicitly verified?`,
      type: "multiple_choice",
      options: [
        s,
        `The concepts in ${topic} strictly apply only to single-threaded embedded kernels`,
        `Preconditions and invariant boundaries are automatically discarded at runtime`,
        `All operations evaluate in constant time O(1) with zero heap allocation`,
      ],
      correctAnswer: 0,
      explanation: `The source material directly establishes: "${s}".`,
      topic,
      difficulty,
      points: 10,
    });
  }

  // Question 2: True / False question
  if (sentences.length > 1) {
    const s = sentences[Math.min(1, sentences.length - 1)];
    questions.push({
      id: `q-rag-${Date.now()}-2`,
      text: `True or False: According to the source material, "${s}"`,
      type: "true_false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: `True. The uploaded document explicitly articulates this principle: "${s}".`,
      topic,
      difficulty,
      points: 10,
    });
  }

  // Question 3: Concept / short answer or 2nd multiple choice
  if (sentences.length > 2) {
    const s = sentences[2];
    questions.push({
      id: `q-rag-${Date.now()}-3`,
      text: `What core operational takeaway is highlighted regarding ${topic}?`,
      type: "multiple_choice",
      options: [
        s,
        "It eliminates all need for testing or formal verification in production",
        "It mandates quadratic O(N^2) time space trade-offs across all modules",
        "It restricts usage exclusively to monolithic relational architectures",
      ],
      correctAnswer: 0,
      explanation: `Derived from the lecture transcript: "${s}".`,
      topic,
      difficulty,
      points: 10,
    });
  }

  // If questions are fewer than count, add general grounded questions
  while (questions.length < count) {
    const idx = questions.length + 1;
    questions.push({
      id: `q-rag-${Date.now()}-${idx}`,
      text: `In the context of ${topic}, how should edge cases and boundary conditions be handled?`,
      type: "multiple_choice",
      options: [
        "Verified with explicit preconditions, base checks, and invariant preservation",
        "Silently ignored to maximize instruction pipeline throughput",
        "Deferred to client-side browsers without runtime validation",
        "Replaced with non-deterministic random sampling heuristics",
      ],
      correctAnswer: 0,
      explanation: `Engineering rigor mandates verifying preconditions, base conditions, and invariants.`,
      topic,
      difficulty,
      points: 10,
    });
  }

  return {
    title: `${topic} Dynamic Assessment`,
    questions: questions.slice(0, count),
  };
}
