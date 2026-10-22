import { describe, it, expect } from "vitest";
import {
  chunkTextContent,
  parseCsvIntoChunks,
  searchKnowledgeChunks,
  buildGroundedRagPrompt,
  generateQuizFromText,
  UploadedKnowledgeFile,
} from "@/lib/rag-engine";
import {
  validateFileSize,
  MAX_FILE_SIZE_BYTES,
  FileSizeExceededError,
  extractTextFromPdf,
  extractTextFromDocx,
  extractTextFromCsv,
  extractTextFromTextFile,
  detectDocumentType,
  parseDocumentFile,
} from "@/lib/rag-parser";
import {
  generateTutorResponse,
  checkRateLimit,
} from "@/lib/ai-provider";

describe("Adversarial Stress Test: File Size Rejection & Boundaries", () => {
  it("rejects files exceeding 10MB limit (>10MB)", () => {
    const oversizedBytes = MAX_FILE_SIZE_BYTES + 1; // 10,485,761 bytes
    expect(() => {
      validateFileSize({ name: "oversized.pdf", size: oversizedBytes });
    }).toThrow(FileSizeExceededError);

    // Huge 50MB file
    expect(() => {
      validateFileSize({ name: "massive_slides.pptx", size: 50 * 1024 * 1024 });
    }).toThrow(/exceeds maximum allowed size of 10 MB/);
  });

  it("accepts files exactly at or below 10MB boundary", () => {
    // Exactly 10MB
    expect(() => {
      validateFileSize({ name: "exact-boundary.pdf", size: MAX_FILE_SIZE_BYTES });
    }).not.toThrow();

    // 10MB minus 1 byte
    expect(() => {
      validateFileSize({ name: "under-boundary.docx", size: MAX_FILE_SIZE_BYTES - 1 });
    }).not.toThrow();

    // 0 bytes
    expect(() => {
      validateFileSize({ name: "empty.txt", size: 0 });
    }).not.toThrow();
  });

  it("parseDocumentFile throws FileSizeExceededError when file exceeds 10MB", async () => {
    // Mock a File with oversized size property
    const oversizedFile = {
      name: "giant_dataset.csv",
      size: MAX_FILE_SIZE_BYTES + 500,
      type: "text/csv",
      text: async () => "A,B\n1,2",
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as File;

    await expect(parseDocumentFile(oversizedFile)).rejects.toThrow(FileSizeExceededError);
  });
});

describe("Adversarial Stress Test: Empty & Degenerate Files", () => {
  it("handles completely empty text files without throwing", () => {
    const res = extractTextFromTextFile("");
    expect(res).toBe("");

    const chunks = chunkTextContent("", "empty-1", "empty.txt");
    expect(chunks).toEqual([]);
  });

  it("handles whitespace-only text files", () => {
    const whitespace = "   \n\n\t\r\n   \t  \n";
    const res = extractTextFromTextFile(whitespace);
    expect(res).toBe("");

    const chunks = chunkTextContent(whitespace, "empty-2", "whitespace.txt");
    expect(chunks).toEqual([]);
  });

  it("protects against infinite loops when chunkSize <= chunkOverlap", () => {
    const text = "Word ".repeat(100);
    // chunkSize equals chunkOverlap
    const chunksEqual = chunkTextContent(text, "loop-1", "equal.txt", 25, 25);
    expect(chunksEqual.length).toBeGreaterThan(0);

    // chunkSize less than chunkOverlap
    const chunksLess = chunkTextContent(text, "loop-2", "less.txt", 10, 50);
    expect(chunksLess.length).toBeGreaterThan(0);

    // 0 or negative values
    const chunksZero = chunkTextContent(text, "loop-3", "zero.txt", 0, 0);
    expect(chunksZero.length).toBeGreaterThan(0);
  });

  it("handles empty CSV files and whitespace-only CSVs", () => {
    const emptyRes = extractTextFromCsv("");
    expect(emptyRes.summary).toBe("Empty CSV");
    expect(emptyRes.rows).toEqual([]);
    expect(emptyRes.formattedText).toBe("");

    const wsCsv = extractTextFromCsv("   \n\r\n  \n");
    expect(wsCsv.rows).toEqual([]);

    const csvChunks = parseCsvIntoChunks("", "csv-empty", "empty.csv");
    expect(csvChunks.summary).toBe("Empty CSV file");
    expect(csvChunks.chunks).toEqual([]);
  });

  it("handles 0-byte PDF and DOCX array buffers gracefully", async () => {
    const emptyBuffer = new ArrayBuffer(0);

    const pdfText = await extractTextFromPdf(emptyBuffer);
    expect(pdfText).toBe("");

    const docxText = await extractTextFromDocx(emptyBuffer);
    expect(docxText).toBe("");
  });

  it("parseDocumentFile handles empty text file gracefully", async () => {
    const mockEmptyFile = {
      name: "empty_notes.txt",
      size: 0,
      type: "text/plain",
      text: async () => "",
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as File;

    const result = await parseDocumentFile(mockEmptyFile);
    expect(result.text).toBe("");
    expect(result.chunks).toEqual([]);
    expect(result.fileName).toBe("empty_notes.txt");
  });

  it("parseDocumentFile handles empty PDF gracefully with fallback notice", async () => {
    const mockEmptyPdf = {
      name: "empty_slides.pdf",
      size: 0,
      type: "application/pdf",
      text: async () => "",
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as File;

    const result = await parseDocumentFile(mockEmptyPdf);
    expect(result.text).toContain("empty_slides.pdf");
    expect(result.text).toContain("No uncompressed text stream was found");
    expect(result.chunks.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Adversarial Stress Test: Binary Corrupt Streams & Malformed Archives", () => {
  it("handles completely random binary noise as PDF without crashing", async () => {
    // Generate 4KB of random bytes
    const randomBytes = new Uint8Array(4096);
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }

    const result = await extractTextFromPdf(randomBytes.buffer);
    expect(typeof result).toBe("string");
  });

  it("handles malformed PDF stream blocks with corrupt FlateDecode data", async () => {
    // PDF structure with /Filter /FlateDecode but garbage compressed payload
    const corruptPdfString = `%PDF-1.4
1 0 obj
<< /Length 50 /Filter /FlateDecode >>
stream
\xFF\xFF\xFF\x00\x01\x02\x03\x04\xDE\xAD\xBE\xEF\x12\x34\x56\x78
endstream
endobj
xref
0 2
trailer
<< /Root 1 0 R >>
%%EOF`;

    const encoder = new TextEncoder();
    const buffer = encoder.encode(corruptPdfString).buffer;

    const result = await extractTextFromPdf(buffer);
    // Should safely decompress (fail gracefully) and not throw an unhandled error
    expect(typeof result).toBe("string");
  });

  it("handles unclosed BT blocks and corrupted TJ operators in PDF", async () => {
    const malformedBtPdf = `%PDF-1.4
stream
BT
[ (Unclosed string without closing bracket
10 20 Td
(Another piece) Tj
<48656c6c6f Tj
ET
endstream`;

    const buffer = new TextEncoder().encode(malformedBtPdf).buffer;
    const result = await extractTextFromPdf(buffer);
    expect(typeof result).toBe("string");
  });

  it("handles completely random binary noise as DOCX without crashing", async () => {
    const randomBytes = new Uint8Array(2048);
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }

    const result = await extractTextFromDocx(randomBytes.buffer);
    expect(result).toBe("");
  });

  it("handles DOCX with valid ZIP local header but corrupted/truncated payload", async () => {
    // Build a mock ZIP with local header signature 0x04034b50 and fileName "word/document.xml"
    const buffer = new ArrayBuffer(100);
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);

    // Signature PK\x03\x04
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true); // version
    view.setUint16(6, 0, true); // flags
    view.setUint16(8, 8, true); // method = 8 (deflated)
    view.setUint32(18, 40, true); // compSize = 40
    view.setUint32(22, 100, true); // uncompSize = 100
    const fileName = "word/document.xml";
    view.setUint16(26, fileName.length, true);
    view.setUint16(28, 0, true); // extraFieldLen = 0

    // Write filename
    for (let i = 0; i < fileName.length; i++) {
      uint8[30 + i] = fileName.charCodeAt(i);
    }
    // Fill remaining payload with corrupt non-deflate bytes
    for (let i = 30 + fileName.length; i < 100; i++) {
      uint8[i] = 0xee;
    }

    const result = await extractTextFromDocx(buffer);
    // Decompression of 0xee bytes will fail gracefully and return empty string
    expect(result).toBe("");
  });

  it("handles CSV with unclosed quotes and nested newlines without freezing", () => {
    const unclosedCsv = `"ID","Title","Notes
1,"Intro to Algorithms","Line 1 of unclosed note
Line 2 of unclosed note without final quote
2,"Second Topic","Valid note"`;

    const res = extractTextFromCsv(unclosedCsv);
    expect(res.rows.length).toBeGreaterThanOrEqual(1);
    expect(res.rows[0][0]).toBe("ID");
  });

  it("handles CSV with thousands of empty commas or giant cells", () => {
    const sparseCsv = ",,,,,,,,\n,,,,,,,,";
    const res = extractTextFromCsv(sparseCsv);
    expect(typeof res.summary).toBe("string");

    const hugeCell = "A," + "X".repeat(50000) + ",B";
    const hugeRes = extractTextFromCsv(hugeCell);
    expect(hugeRes.rows.length).toBe(1);
    expect(hugeRes.rows[0][1].length).toBe(50000);
  });
});

describe("Adversarial Stress Test: Unicode, Emojis, RTL & Special Characters", () => {
  it("preserves non-ASCII, Urdu/Arabic RTL, CJK, and Emojis in text extractor", () => {
    const multilingual = `CS101 لیکچر ۰۱: الگورتھم کی مبادیات 🚀
Algorithme: Tri fusion et complexité temporelle O(N log N).
计算机科学导论: 动态规划 (Dynamic Programming) 💡
مفاهيم قواعد البيانات: جدول الطلاب والمعاملات 📚
Mathematical Invariants: ∀x ∈ S, f(x) ≥ 0 ∧ ∑(x_i) = 1.`;

    const extracted = extractTextFromTextFile(multilingual);
    expect(extracted).toContain("الگورتھم کی مبادیات 🚀");
    expect(extracted).toContain("Tri fusion");
    expect(extracted).toContain("计算机科学导论");
    expect(extracted).toContain("∀x ∈ S");

    const chunks = chunkTextContent(extracted, "uni-1", "unicode-slides.txt", 100, 20);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].content).toContain("الگورتھم");
  });

  it("handles CSV containing Urdu, Arabic, CJK and Emojis", () => {
    const unicodeCsv = `رول نمبر,نام,کورس,گریڈ
101,احمد خان,کمپیوٹر سائنس 💻,A+
102,علی رضا,مصنوعی ذہانت 🤖,A
103,张伟,软件工程,A-`;

    const { summary, rows, formattedText } = extractTextFromCsv(unicodeCsv);
    expect(rows).toHaveLength(4);
    expect(rows[1][1]).toBe("احمد خان");
    expect(rows[1][2]).toBe("کمپیوٹر سائنس 💻");
    expect(rows[3][1]).toBe("张伟");
    expect(formattedText).toContain("احمد خان");
  });

  it("does not crash on null bytes and non-printable control characters", () => {
    const rawWithNulls = "Lecture 1\x00Introduction\x01\x02to\x03Distributed\x04Systems\x1b[31m";
    const cleaned = extractTextFromTextFile(rawWithNulls);
    expect(cleaned).toContain("Introduction");

    const chunks = chunkTextContent(cleaned, "null-1", "notes.txt");
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it("handles adversarial queries with regex operators without Regex SyntaxError", () => {
    const testFile: UploadedKnowledgeFile = {
      id: "f-regex",
      name: "regex_notes.txt",
      size: 512,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "now",
      chunks: [
        {
          id: "c-reg-1",
          fileId: "f-regex",
          fileName: "regex_notes.txt",
          chunkIndex: 1,
          content: "Regular expressions support metacharacters like .*+?^${}()|[] and escape sequences.",
          wordCount: 10,
        },
      ],
    };

    // Adversarial queries that crash naive RegExp constructors
    const adversarialQueries = [
      ".*+?^${}()|[]\\",
      "((((([unclosed-regex",
      "[a-z0-9_++",
      "\\k<invalid_group>",
      "*?+{}",
      "'; DROP TABLE users; --",
      "<script>alert('xss')</script>",
    ];

    for (const q of adversarialQueries) {
      expect(() => {
        searchKnowledgeChunks(q, [testFile], 3);
      }).not.toThrow();
    }
  });

  it("indexes and retrieves non-ASCII CJK and Urdu vector terms via Unicode tokenization", () => {
    const chineseFile: UploadedKnowledgeFile = {
      id: "f-cjk",
      name: "algorithms_cjk.txt",
      size: 512,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "now",
      chunks: [
        {
          id: "cjk-1",
          fileId: "f-cjk",
          fileName: "algorithms_cjk.txt",
          chunkIndex: 1,
          content: "计算机科学 算法 排序: 快速排序 和 归并排序 的 时间复杂度 是 O(N log N)",
          wordCount: 15,
        },
      ],
    };

    // Query with 2-character Chinese keyword for "algorithm" (算法)
    const results = searchKnowledgeChunks("算法", [chineseFile], 3);
    // Unicode-aware tokenize preserves non-ASCII scripts in matchedTerms
    expect(results[0]?.matchedTerms).toContain("算法");
  });

  it("strictly filters stop-words regardless of word length", () => {
    // In rag-engine.ts line 179:
    // filter((w) => !STOP_WORDS.has(w))
    // Common long stopwords like 'because', 'through', 'themselves' are properly filtered
    const stopwordQuery = "because through themselves";
    const fileForTest: UploadedKnowledgeFile = {
      id: "f-stop",
      name: "test.txt",
      size: 100,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "now",
      chunks: [
        {
          id: "c-stop-1",
          fileId: "f-stop",
          fileName: "test.txt",
          chunkIndex: 1,
          content: "Explanation given because through themselves.",
          wordCount: 5,
        },
      ],
    };

    const results = searchKnowledgeChunks(stopwordQuery, [fileForTest], 3);
    // Stop-words must not be included in matched informative terms
    expect(results[0]?.matchedTerms).not.toContain("because");
  });
});

describe("Adversarial Stress Test: Retrieval Quality (Broad vs Specific Queries)", () => {
  const file1: UploadedKnowledgeFile = {
    id: "f-algo",
    name: "algorithms_lecture.txt",
    size: 2048,
    mimeType: "text/plain",
    type: "text",
    uploadedAt: "now",
    chunks: [
      {
        id: "chunk-algo-1",
        fileId: "f-algo",
        fileName: "algorithms_lecture.txt",
        chunkIndex: 1,
        content: "Syllabus and Course Overview: CS201 Algorithms and Data Structures covers divide and conquer, greedy heuristics, and dynamic programming.",
        wordCount: 19,
      },
      {
        id: "chunk-algo-2",
        fileId: "f-algo",
        fileName: "algorithms_lecture.txt",
        chunkIndex: 2,
        content: "Binary Search is a divide and conquer algorithm running in O(log N) time on sorted arrays. The invariant is low <= high with midpoint calculation.",
        wordCount: 25,
      },
      {
        id: "chunk-algo-3",
        fileId: "f-algo",
        fileName: "algorithms_lecture.txt",
        chunkIndex: 3,
        content: "Dijkstra algorithm computes single source shortest paths on non-negative weighted graphs in O((V + E) log V) using a min priority queue.",
        wordCount: 23,
      },
      {
        id: "chunk-algo-4",
        fileId: "f-algo",
        fileName: "algorithms_lecture.txt",
        chunkIndex: 4,
        content: "Dynamic programming solves subproblems once and stores results in a memoization table to achieve polynomial runtime on optimal substructures.",
        wordCount: 21,
      },
    ],
  };

  it("specifically ranks exact matching chunks first for narrow technical queries", () => {
    const results = searchKnowledgeChunks("Dijkstra priority queue shortest path", [file1], 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].chunk.id).toBe("chunk-algo-3");
    expect(results[0].matchedTerms).toContain("dijkstra");
    expect(results[0].score).toBeGreaterThan(0.2);
  });

  it("rewards exact phrase match with phrase boost multiplier", () => {
    // "divide and conquer algorithm" appears as exact consecutive sequence in chunk 2
    const results = searchKnowledgeChunks("divide and conquer algorithm", [file1], 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].chunk.id).toBe("chunk-algo-2");
    // Should have a high score due to phrase boost
    expect(results[0].score).toBeGreaterThan(0.4);
  });

  it("triggers broad semantic fallback on overview/summary queries", () => {
    const broadQueries = [
      "what is this document about?",
      "summarize the lecture notes",
      "overview of topics covered",
      "table of contents",
      "syllabus",
    ];

    for (const q of broadQueries) {
      const results = searchKnowledgeChunks(q, [file1], 3);
      expect(results.length).toBeGreaterThan(0);
      // Chunk 1 is the syllabus/overview and should be present in top results
      const hasChunk1 = results.some((r) => r.chunk.id === "chunk-algo-1");
      expect(hasChunk1).toBe(true);
      expect(results[0].score).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("handles queries with zero matches gracefully via fallback", () => {
    const zeroMatchQuery = "quantum superconducting qubit decoherence cryogenic";
    const results = searchKnowledgeChunks(zeroMatchQuery, [file1], 3);

    // Should return fallback early chunks rather than empty array
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedTerms).toContain("document-overview");
    expect(results[0].chunk.chunkIndex).toBeLessThanOrEqual(2);
  });

  it("handles stopword-only queries gracefully", () => {
    const stopwordQuery = "is the a to of and";
    const results = searchKnowledgeChunks(stopwordQuery, [file1], 3);
    expect(results.length).toBeGreaterThan(0);
  });

  it("handles massive 1000-character queries without performance degradation", () => {
    const longQuery = "Binary Search " + "divide and conquer algorithm runtime invariant ".repeat(25);
    const start = performance.now();
    const results = searchKnowledgeChunks(longQuery, [file1], 3);
    const elapsed = performance.now() - start;

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].chunk.id).toBe("chunk-algo-2");
    expect(elapsed).toBeLessThan(100); // Should execute under 100ms
  });

  it("handles single-character and 2-character queries", () => {
    const res1 = searchKnowledgeChunks("b", [file1], 2);
    expect(Array.isArray(res1)).toBe(true);

    const res2 = searchKnowledgeChunks("O(", [file1], 2);
    expect(Array.isArray(res2)).toBe(true);
  });
});

describe("Adversarial Stress Test: Grounded RAG Prompt Builder & Citations", () => {
  it("builds clean grounded prompt with source and section numbers", () => {
    const searchResults = [
      {
        chunk: {
          id: "c-1",
          fileId: "f-1",
          fileName: "Lecture_04.pdf",
          chunkIndex: 2,
          content: "Binary search divides the search space in half at each step.",
          wordCount: 11,
        },
        score: 0.95,
        matchedTerms: ["binary", "search"],
      },
    ];

    const prompt = buildGroundedRagPrompt(searchResults, "How fast is binary search?");
    expect(prompt).toContain("[GROUNDED DOCUMENT CONTEXT FOR RAG RETRIEVAL]");
    expect(prompt).toContain("[SOURCE 1: Lecture_04.pdf (Section 2)]");
    expect(prompt).toContain("Binary search divides the search space in half at each step.");
    expect(prompt).toContain("[STUDENT QUESTION]:\nHow fast is binary search?");
  });

  it("returns raw user query when retrieval results are empty", () => {
    const prompt = buildGroundedRagPrompt([], "Explain quicksort");
    expect(prompt).toBe("Explain quicksort");
  });
});

describe("Adversarial Stress Test: Dynamic Quiz Generation from Text", () => {
  it("generates questions when text has no standard definition keywords", () => {
    const textWithoutDef = `The experimental procedure recorded observations at five second intervals.
All data points converged toward the steady-state equilibrium boundary.
Thermal dissipation was compensated using active feedback loops.`;

    const quiz = generateQuizFromText(textWithoutDef, "Physics Lab", "intermediate", 3);
    expect(quiz.title).toBe("Physics Lab Dynamic Assessment");
    expect(quiz.questions).toHaveLength(3);
    for (const q of quiz.questions) {
      expect(q.text.length).toBeGreaterThan(10);
      expect(q.options?.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswer).toBe(0);
      expect(q.points).toBe(10);
      expect(typeof q.explanation).toBe("string");
    }
  });

  it("generates questions from single-sentence documents without crashing", () => {
    const singleSentence = "Recursion is a programming technique where a function calls itself to solve a smaller instance of the problem.";
    const quiz = generateQuizFromText(singleSentence, "Computer Science", "beginner", 3);
    expect(quiz.questions).toHaveLength(3);
    expect(quiz.questions[0].text).toContain("Recursion");
  });

  it("handles completely empty text by providing fallback grounded questions", () => {
    const quiz = generateQuizFromText("", "Empty Module", "intermediate", 3);
    expect(quiz.questions).toHaveLength(3);
    expect(quiz.questions[0].topic).toBe("Empty Module");
  });
});

describe("Adversarial Stress Test: AI Provider Fallback & Rate Limiting", () => {
  it("generates structured grounded response from RAG chunks in offline/fallback mode", async () => {
    const response = await generateTutorResponse({
      conversationId: "test-conv-1",
      userPrompt: "What is the runtime of binary search?",
      subject: "Algorithms",
      level: "intermediate",
      style: "step_by_step",
      history: [],
      ragChunks: [
        {
          fileName: "Lecture_04.pdf",
          section: 2,
          content: "Binary search achieves O(log N) runtime by halving the search space in each iteration.",
        },
      ],
    });

    expect(response.message.role).toBe("assistant");
    expect(response.message.content).toContain("Lecture_04.pdf");
    expect(response.message.content).toContain("O(log N)");
    expect(response.message.citations).toBeDefined();
    expect(response.message.citations).toContain("Lecture_04.pdf (Section 2)");
    expect(response.message.suggestedFollowups?.length).toBeGreaterThanOrEqual(1);
    expect(response.isDemoMode).toBe(true);
  });

  it("throws validation error for empty prompts and oversized prompts", async () => {
    await expect(
      generateTutorResponse({
        conversationId: "conv-err-1",
        userPrompt: "   ",
        subject: "Math",
        level: "beginner",
        style: "step_by_step",
        history: [],
      })
    ).rejects.toThrow("Prompt cannot be empty");

    await expect(
      generateTutorResponse({
        conversationId: "conv-err-2",
        userPrompt: "A".repeat(5001),
        subject: "Math",
        level: "beginner",
        style: "step_by_step",
        history: [],
      })
    ).rejects.toThrow("Prompt exceeds maximum length of 5000 characters");
  });

  it("enforces rate limit of 15 requests per minute per client key", () => {
    const testClient = `stress-client-${Date.now()}`;

    // First 15 requests should be allowed
    for (let i = 0; i < 15; i++) {
      const res = checkRateLimit(testClient);
      expect(res.allowed).toBe(true);
    }

    // 16th request must be rejected
    const blockedRes = checkRateLimit(testClient);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });
});
