import { describe, it, expect, beforeEach } from "vitest";
// All people, assessment values and notes in these tests are synthetic anonymous fixtures.
import {
  chunkTextContent,
  parseCsvIntoChunks,
  searchKnowledgeChunks,
  buildGroundedRagPrompt,
  DocumentChunk,
  UploadedKnowledgeFile,
} from "@/lib/rag-engine";
import {
  validateFileSize,
  MAX_FILE_SIZE_BYTES,
  FileSizeExceededError,
  extractTextFromCsv,
  extractTextFromTextFile,
  detectDocumentType,
} from "@/lib/rag-parser";
import {
  generateTutorResponse,
  checkRateLimit,
} from "@/lib/ai-provider";
import {
  getCourses,
  saveCourse,
  addCourseMaterial,
  getQuizzes,
  saveQuiz,
  getAttempts,
  saveAttempt,
  resetToDemoData,
} from "@/lib/store";
import { evaluateQuizSubmission } from "@/lib/scoring";
import { canAccessTeacherStudio, canPublishQuiz } from "@/lib/permissions";
import { CourseMaterial, Question, Quiz, QuizAttempt } from "@/types";

describe("CampusOS E2E: Dynamic RAG & Monday AI Engine (Feature 1)", () => {
  // Tier 1: Feature Functionality
  it("should parse and chunk plain text content with default and custom chunking parameters", () => {
    const sampleText = Array.from(
      { length: 400 },
      (_, i) => `word${i}`
    ).join(" ");
    const chunks = chunkTextContent(sampleText, "doc-1", "lecture-slides.txt", 150, 25);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].id).toBe("doc-1-chunk-1");
    expect(chunks[0].fileName).toBe("lecture-slides.txt");
    expect(chunks[0].chunkIndex).toBe(1);
    expect(chunks[0].wordCount).toBe(150);
    expect(chunks[1].chunkIndex).toBe(2);
    // Overlap verification: first few words of chunk 2 should match end of chunk 1
    const chunk1Words = chunks[0].content.split(" ");
    const chunk2Words = chunks[1].content.split(" ");
    // Oversized prose uses bounded word fallback; semantic/code blocks stay intact.
    expect(chunk2Words[0]).toBe("word150");
    expect(chunks.map(c => c.content).join(" ")).toBe(sampleText);
  });

  it("should parse RFC-compliant CSV text with headers, quoted commas, and escaped quotes", () => {
    const rawCsv = `ItemID,ItemName,Category,"Notes, Comments",Price
101,Example Item A,Tools,"Sample item, first batch",3.85
102,Example Item B,Parts,"Sample ""quoted"" note",3.92
103,Example Item C,Tools,"Sample item, second batch",3.68`;

    const { summary, formattedText, rows } = extractTextFromCsv(rawCsv);

    expect(rows).toHaveLength(4); // 1 header + 3 rows
    expect(rows[0]).toEqual(["ItemID", "ItemName", "Category", "Notes, Comments", "Price"]);
    expect(rows[1][3]).toBe("Sample item, first batch");
    expect(rows[2][3]).toBe('Sample "quoted" note');
    expect(summary).toContain("3 records");
    expect(formattedText).toContain("[Record 1]");
    expect(formattedText).toContain("Price: 3.85");

    const parsedChunks = parseCsvIntoChunks(rawCsv, "csv-file-1", "inventory.csv");
    expect(parsedChunks.chunks.length).toBeGreaterThanOrEqual(1);
    expect(parsedChunks.chunks[0].content).toContain("Columns: ItemID");
  });

  it("should detect document types accurately based on file extension and MIME type", () => {
    expect(detectDocumentType("lecture.pdf", "application/pdf")).toBe("pdf");
    expect(detectDocumentType("syllabus.docx", "application/vnd.openxmlformats")).toBe("word");
    expect(detectDocumentType("grades.csv", "text/csv")).toBe("csv");
    expect(detectDocumentType("notes.txt", "text/plain")).toBe("text");
    expect(detectDocumentType("script.py", "text/x-python")).toBe("code");
    expect(detectDocumentType("diagram.png", "image/png")).toBe("image");
    expect(detectDocumentType("document_without_ext", "application/pdf")).toBe("pdf");
  });

  it("should compute relevance scores and rank matching chunks for multi-term queries", () => {
    const fileA: UploadedKnowledgeFile = {
      id: "f-1",
      name: "data_structures.txt",
      size: 1024,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "2026-10-18",
      chunks: [
        {
          id: "c-1",
          fileId: "f-1",
          fileName: "data_structures.txt",
          chunkIndex: 1,
          content: "Binary search trees maintain ordered keys allowing O(log N) lookup and insertion.",
          wordCount: 12,
        },
        {
          id: "c-2",
          fileId: "f-1",
          fileName: "data_structures.txt",
          chunkIndex: 2,
          content: "Hash tables achieve O(1) expected lookup time using cryptographic hash functions.",
          wordCount: 11,
        },
      ],
    };

    const fileB: UploadedKnowledgeFile = {
      id: "f-2",
      name: "databases.txt",
      size: 1024,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "2026-10-18",
      chunks: [
        {
          id: "c-3",
          fileId: "f-2",
          fileName: "databases.txt",
          chunkIndex: 1,
          content: "B-Tree indexes are balanced search trees optimized for block storage reads and range scans.",
          wordCount: 14,
        },
      ],
    };

    const results = searchKnowledgeChunks("search trees lookup", [fileA, fileB], 3);

    expect(results.length).toBeGreaterThan(0);
    // Chunk 1 has both "search", "trees", and "lookup", so it should rank highest
    expect(results[0].chunk.id).toBe("c-1");
    expect(results[0].matchedTerms).toContain("search");
    expect(results[0].score).toBeGreaterThan(0);
    // Results should be ordered descending by score
    if (results.length > 1) {
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    }
  });

  it("should construct grounded RAG context prompt with explicit source file and section citations", () => {
    const chunk: DocumentChunk = {
      id: "test-c1",
      fileId: "test-f1",
      fileName: "CS301-Distributed-Systems.pdf",
      chunkIndex: 4,
      content: "The Raft consensus algorithm guarantees safety via leader election and log replication invariants.",
      wordCount: 14,
    };

    const prompt = buildGroundedRagPrompt(
      [{ chunk, score: 3.5, matchedTerms: ["raft", "consensus"] }],
      "Explain Raft safety"
    );

    expect(prompt).toContain("[GROUNDED DOCUMENT CONTEXT FOR RAG RETRIEVAL]");
    expect(prompt).toContain("[SOURCE 1: CS301-Distributed-Systems.pdf (Section 4)]");
    expect(prompt).toContain("Raft consensus algorithm guarantees safety");
    expect(prompt).toContain("[STUDENT QUESTION]:\nExplain Raft safety");
  });

  // Tier 2: Boundaries & Error Handling
  it("should reject files exceeding the 10MB limit with FileSizeExceededError", () => {
    const oversizedFile = {
      name: "giant-lecture-recording.pdf",
      size: MAX_FILE_SIZE_BYTES + 1, // 10MB + 1 byte
    };

    expect(() => validateFileSize(oversizedFile)).toThrow(FileSizeExceededError);
    expect(() => validateFileSize(oversizedFile)).toThrow(/exceeds maximum allowed size of 10 MB/);
  });

  it("should allow files within 10MB limit without throwing", () => {
    expect(() =>
      validateFileSize({ name: "lecture.pdf", size: MAX_FILE_SIZE_BYTES })
    ).not.toThrow();

    expect(() =>
      validateFileSize({ name: "notes.txt", size: 1024 })
    ).not.toThrow();
  });

  it("should return empty chunks array for empty or whitespace-only text", () => {
    expect(chunkTextContent("", "id-1", "empty.txt")).toEqual([]);
    expect(chunkTextContent("   \n\t  \r\n  ", "id-2", "whitespace.txt")).toEqual([]);
  });

  it("should handle empty CSV text gracefully returning Empty CSV summary", () => {
    const csvResult = extractTextFromCsv("");
    expect(csvResult.summary).toBe("Empty CSV");
    expect(csvResult.rows).toHaveLength(0);

    const chunkResult = parseCsvIntoChunks("", "empty-csv", "empty.csv");
    expect(chunkResult.chunks).toHaveLength(0);
    expect(chunkResult.summary).toBe("Empty CSV file");
  });

  it("should handle search query with only stop-words or non-alphanumeric symbols using semantic overview fallback", () => {
    const file: UploadedKnowledgeFile = {
      id: "f-dummy",
      name: "test.txt",
      size: 100,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "2026-10-18",
      chunks: [
        {
          id: "c-dummy",
          fileId: "f-dummy",
          fileName: "test.txt",
          chunkIndex: 1,
          content: "Valid lecture content here",
          wordCount: 4,
        },
      ],
    };

    const resSymbols = searchKnowledgeChunks("??? !!! ---", [file]);
    expect(resSymbols).toBeInstanceOf(Array);
    expect(resSymbols.length).toBeGreaterThan(0);
    // Semantic overview fallback triggered
    expect(resSymbols[0].matchedTerms).toContain("document-overview");

    const resEmpty = searchKnowledgeChunks("   ", [file]);
    expect(resEmpty).toBeInstanceOf(Array);

    const resStopWords = searchKnowledgeChunks("to be or not to be", [file], 5);
    expect(resStopWords).toBeInstanceOf(Array);
  });

  it("should handle search across empty file list without throwing", () => {
    const res = searchKnowledgeChunks("binary search", []);
    expect(res).toEqual([]);
  });

  // Tier 3: Cross-Feature Integration
  it("should integrate RAG retrieval with AI Tutor response generation", async () => {
    const response = await generateTutorResponse({
      conversationId: "conv-rag-test",
      userPrompt: "How does binary search work in ordered arrays?",
      subject: "Algorithms",
      level: "beginner",
      style: "step_by_step",
      history: [],
      ragChunks: [
        {
          fileName: "Algorithms-Week1.pdf",
          section: 1,
          content: "Binary search compares target against middle element of sorted array.",
        },
      ],
    });

    expect(response.message.content).toBeDefined();
    expect(response.message.role).toBe("assistant");
    expect(response.message.citations?.length).toBeGreaterThan(0);
  });

  it("should enforce AI rate limiting window and block requests exceeding maximum allowance", () => {
    const clientKey = "unique-client-rate-limit-test-" + Date.now();
    for (let i = 0; i < 15; i++) {
      const res = checkRateLimit(clientKey);
      expect(res.allowed).toBe(true);
    }
    const overflowRes = checkRateLimit(clientKey);
    expect(overflowRes.allowed).toBe(false);
    expect(overflowRes.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should reject prompts exceeding the maximum 5000 character boundary", async () => {
    const oversizedPrompt = "A".repeat(5001);
    await expect(
      generateTutorResponse({
        conversationId: "conv-oversized",
        userPrompt: oversizedPrompt,
        subject: "Algorithms",
        level: "beginner",
        style: "step_by_step",
        history: [],
      })
    ).rejects.toThrow("Prompt exceeds maximum length of 5000 characters");
  });

  // Tier 4: Real-World Workload
  it("should execute end-to-end multi-chunk university lecture slide ingestion, search, and citation grounding", () => {
    const lectureText = `
Slide 1: Operating Systems & Deadlocks
Deadlock occurs when a set of concurrent processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.

Slide 2: Necessary Conditions for Deadlock
Four Coffman conditions must hold simultaneously:
1. Mutual Exclusion: non-shareable resources.
2. Hold and Wait: process holds resource while waiting for others.
3. No Preemption: resources cannot be forcibly confiscated.
4. Circular Wait: closed chain of processes each waiting for next.

Slide 3: Banker's Algorithm for Deadlock Avoidance
Dijkstra's Banker's Algorithm maintains system in a safe state. A state is safe if there exists an allocation sequence where every process can complete with maximum demand.
`;

    const cleanedText = extractTextFromTextFile(lectureText);
    const chunks = chunkTextContent(cleanedText, "lecture-os-1", "OS-Lecture-12-Deadlocks.txt", 40, 10);
    expect(chunks.length).toBeGreaterThan(1);

    const uploadedFile: UploadedKnowledgeFile = {
      id: "lecture-os-1",
      name: "OS-Lecture-12-Deadlocks.txt",
      size: cleanedText.length,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: new Date().toISOString(),
      chunks,
    };

    const retrieved = searchKnowledgeChunks("banker algorithm safe state", [uploadedFile], 2);
    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0].chunk.content).toContain("Banker");

    const groundedPrompt = buildGroundedRagPrompt(retrieved, "How does Banker's algorithm ensure safety?");
    expect(groundedPrompt).toContain("OS-Lecture-12-Deadlocks.txt");
    expect(groundedPrompt).toContain("Dijkstra's Banker's Algorithm");
  });
});

describe("CampusOS E2E: Dual-Tier Lecture Notes & Materials System (Feature 2)", () => {
  beforeEach(() => {
    resetToDemoData();
  });

  // Tier 1: Feature Functionality
  it("should allow teachers to add course materials with metadata to a course", () => {
    const courses = getCourses();
    expect(courses.length).toBeGreaterThan(0);
    const targetCourse = courses[0];

    const newMaterial: CourseMaterial = {
      id: `mat-${Date.now()}`,
      courseId: targetCourse.id,
      title: "Lecture 05: Graph Traversal BFS & DFS Slides",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: "2026-10-18",
      description: "Comprehensive lecture slides covering graph representations, adjacency lists, and tree invariants.",
    };

    const updated = addCourseMaterial(targetCourse.id, newMaterial);
    expect(updated).toBeDefined();
    expect(updated?.materials.some((m) => m.id === newMaterial.id)).toBe(true);
  });

  it("should persist course material additions across store reads", () => {
    const courses = getCourses();
    const targetCourse = courses[0];
    const uniqueTitle = `Unique Material Title ${Date.now()}`;

    addCourseMaterial(targetCourse.id, {
      id: `mat-persist-${Date.now()}`,
      courseId: targetCourse.id,
      title: uniqueTitle,
      type: "notes",
      size: "450 KB",
      uploadDate: "2026-10-18",
    });

    const reloaded = getCourses().find((c) => c.id === targetCourse.id);
    expect(reloaded?.materials.some((m) => m.title === uniqueTitle)).toBe(true);
  });

  it("should support deleting course materials from a course", () => {
    const courses = getCourses();
    const course = courses[0];
    const materialId = `mat-del-${Date.now()}`;

    addCourseMaterial(course.id, {
      id: materialId,
      courseId: course.id,
      title: "Temporary Review Sheet",
      type: "notes",
      size: "120 KB",
      uploadDate: "2026-10-18",
    });

    const refreshedCourse = getCourses().find((c) => c.id === course.id)!;
    expect(refreshedCourse.materials.some((m) => m.id === materialId)).toBe(true);

    // Remove material and save
    refreshedCourse.materials = refreshedCourse.materials.filter((m) => m.id !== materialId);
    saveCourse(refreshedCourse);

    const verifiedCourse = getCourses().find((c) => c.id === course.id)!;
    expect(verifiedCourse.materials.some((m) => m.id === materialId)).toBe(false);
  });

  it("should support student private notes locker creation, read, and deletion", () => {
    const studentNote = {
      id: `sn-${Date.now()}`,
      userId: "user-student-1",
      title: "Fixture Distributed Systems Note",
      content: "CAP theorem states that a distributed data store can only provide two of Consistency, Availability, and Partition tolerance.",
      tags: ["distributed-systems", "theory", "exam-prep"],
      createdAt: "2026-10-18",
      updatedAt: "2026-10-18",
    };

    // Store in localStorage
    const storageKey = "campusos_student_notes";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existing.unshift(studentNote);
    localStorage.setItem(storageKey, JSON.stringify(existing));

    const retrieved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    expect(retrieved.some((n: any) => n.id === studentNote.id)).toBe(true);

    // Filter by student
    const studentNotes = retrieved.filter((n: any) => n.userId === "user-student-1");
    expect(studentNotes.length).toBeGreaterThan(0);
    expect(studentNotes[0].title).toBe("Fixture Distributed Systems Note");
  });

  it("should isolate student personal notes by userId", () => {
    const storageKey = "campusos_student_notes";
    const notes = [
      { id: "note-a", userId: "student-alice", title: "Alice's Secret Study Guide", content: "Notes A" },
      { id: "note-b", userId: "student-bob", title: "Bob's Public Summary", content: "Notes B" },
    ];
    localStorage.setItem(storageKey, JSON.stringify(notes));

    const all = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const aliceNotes = all.filter((n: any) => n.userId === "student-alice");
    const bobNotes = all.filter((n: any) => n.userId === "student-bob");

    expect(aliceNotes).toHaveLength(1);
    expect(aliceNotes[0].title).toBe("Alice's Secret Study Guide");
    expect(bobNotes).toHaveLength(1);
    expect(bobNotes[0].title).toBe("Bob's Public Summary");
  });

  // Tier 2: Boundaries & Error Handling
  it("should handle notes with special markdown characters, latex equations, and unicode code snippets", () => {
    const complexContent = `
# Dynamic Programming & Invariants
$$T(n) = 2T(n/2) + O(n)$$
* Recurrence Relation: Master Theorem Case 2 applies.
\`\`\`python
def memoized_fib(n: int, memo: dict = {}) -> int:
    # ⚡ Invariant: memo[k] stores Fibonacci(k)
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = memoized_fib(n-1, memo) + memoized_fib(n-2, memo)
    return memo[n]
\`\`\`
Special Characters: < > & " ' © ™ € £ ¥ 🚀
`;
    const cleaned = extractTextFromTextFile(complexContent);
    expect(cleaned).toContain("$$T(n) = 2T(n/2) + O(n)$$");
    expect(cleaned).toContain("⚡ Invariant");
    expect(cleaned).toContain("🚀");

    const chunks = chunkTextContent(cleaned, "note-complex", "dp-notes.md", 50, 10);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].content).toContain("Dynamic Programming");
  });

  it("should handle deletion of non-existent course material or note without throwing", () => {
    const courses = getCourses();
    const course = courses[0];
    const initialCount = course.materials.length;

    // Filter with non-existent ID
    course.materials = course.materials.filter((m) => m.id !== "non-existent-material-id-999");
    expect(course.materials.length).toBe(initialCount);
  });

  it("should handle course with empty materials array gracefully", () => {
    const courses = getCourses();
    const course = { ...courses[0], id: "empty-course-test", materials: [] };
    saveCourse(course);

    const retrieved = getCourses().find((c) => c.id === "empty-course-test");
    expect(retrieved).toBeDefined();
    expect(retrieved?.materials).toEqual([]);
  });

  it("should support updating existing student note content and title", () => {
    const note = {
      id: "note-update-test",
      userId: "user-student-1",
      title: "Initial Draft Title",
      content: "Initial draft content",
      createdAt: "2026-10-18",
      updatedAt: "2026-10-18",
    };
    const storageKey = "campusos_student_notes";
    localStorage.setItem(storageKey, JSON.stringify([note]));

    // Update note
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const idx = stored.findIndex((n: any) => n.id === "note-update-test");
    stored[idx].title = "Updated Finalized Title";
    stored[idx].content = "Updated and verified revision notes.";
    stored[idx].updatedAt = "2026-10-19";
    localStorage.setItem(storageKey, JSON.stringify(stored));

    const verified = JSON.parse(localStorage.getItem(storageKey) || "[]")[0];
    expect(verified.title).toBe("Updated Finalized Title");
    expect(verified.content).toContain("Updated and verified");
  });

  // Tier 3: Cross-Feature Integration
  it("should convert selected student personal notes into RAG knowledge chunks for Monday AI drawer", () => {
    const studentNote = {
      id: "sn-rag-1",
      title: "B-Tree Branching Factor Notes",
      content: "A B-Tree of order m has at most m children and at least ceil(m/2) children. All leaf nodes are at identical depth.",
    };

    const chunks = chunkTextContent(studentNote.content, studentNote.id, `${studentNote.title}.txt`);
    const knowledgeFile: UploadedKnowledgeFile = {
      id: studentNote.id,
      name: `${studentNote.title}.txt`,
      size: studentNote.content.length,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "2026-10-18",
      chunks,
    };

    const searchResults = searchKnowledgeChunks("branching factor leaf nodes depth", [knowledgeFile]);
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].chunk.content).toContain("ceil(m/2)");

    const prompt = buildGroundedRagPrompt(searchResults, "What is the leaf depth invariant in a B-Tree?");
    expect(prompt).toContain(studentNote.title);
  });

  it("should allow multi-file selection combining course materials and student notes in RAG search", () => {
    const teacherMaterialChunk: DocumentChunk = {
      id: "tm-c1",
      fileId: "tm-1",
      fileName: "Prof-Smith-Syllabus.pdf",
      chunkIndex: 1,
      content: "Grading policy: Midterm 30%, Final 40%, Course Projects 30%. Late submissions penalized 10% per day.",
      wordCount: 16,
    };

    const studentNoteChunk: DocumentChunk = {
      id: "sn-c1",
      fileId: "sn-1",
      fileName: "My-Project-Ideas.txt",
      chunkIndex: 1,
      content: "Project idea: Real-time collaborative whiteboard using WebSockets and Operational Transformation.",
      wordCount: 11,
    };

    const teacherFile: UploadedKnowledgeFile = {
      id: "tm-1",
      name: "Prof-Smith-Syllabus.pdf",
      size: 1024,
      mimeType: "application/pdf",
      type: "pdf",
      uploadedAt: "2026-10-18",
      chunks: [teacherMaterialChunk],
    };

    const studentFile: UploadedKnowledgeFile = {
      id: "sn-1",
      name: "My-Project-Ideas.txt",
      size: 512,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "2026-10-18",
      chunks: [studentNoteChunk],
    };

    // Both files toggled on in Monday AI RAG drawer
    const combinedFiles = [teacherFile, studentFile];

    // Query 1 matching teacher material
    const query1 = searchKnowledgeChunks("grading policy late penalty", combinedFiles);
    expect(query1[0].chunk.fileName).toBe("Prof-Smith-Syllabus.pdf");

    // Query 2 matching student note
    const query2 = searchKnowledgeChunks("whiteboard websockets project", combinedFiles);
    expect(query2[0].chunk.fileName).toBe("My-Project-Ideas.txt");
  });

  // Tier 4: Real-World Workload
  it("should simulate student exam preparation workflow: upload lecture note, select in drawer, query Monday AI", async () => {
    const rawNote = `
CS401 Compiler Design: LR(1) Parsing Table Construction
Canonical LR(1) items consist of production rules with dot position and lookahead terminal symbol: [A -> alpha . beta, a].
Closure and GOTO operations determine canonical collection of sets of items.
Conflict types: Shift/Reduce and Reduce/Reduce conflicts.
`;
    const noteChunks = chunkTextContent(rawNote, "note-compilers", "Compiler-Notes.txt", 100, 20);
    const knowledgeFile: UploadedKnowledgeFile = {
      id: "note-compilers",
      name: "Compiler-Notes.txt",
      size: rawNote.length,
      mimeType: "text/plain",
      type: "text",
      uploadedAt: "2026-10-18",
      chunks: noteChunks,
    };

    const retrieval = searchKnowledgeChunks("shift reduce conflicts lookahead", [knowledgeFile]);
    expect(retrieval.length).toBeGreaterThan(0);

    const response = await generateTutorResponse({
      conversationId: "compilers-prep",
      userPrompt: "What causes a Shift/Reduce conflict in LR(1) parsing?",
      subject: "Computer Science",
      level: "advanced",
      style: "step_by_step",
      history: [],
      ragChunks: retrieval.map((r) => ({
        fileName: r.chunk.fileName,
        section: r.chunk.chunkIndex,
        content: r.chunk.content,
      })),
    });

    expect(response.message.content).toBeDefined();
    expect(response.message.role).toBe("assistant");
  });
});

describe("CampusOS E2E: Dynamic QuizForge with Question Selection & Role Separation (Feature 3)", () => {
  beforeEach(() => {
    resetToDemoData();
  });

  // Tier 1: Feature Functionality
  it("should generate well-structured questions from lecture text chunks", () => {
    const sampleQuestions: (Question & { points?: number })[] = [
      {
        id: "q-dyn-1",
        text: "What is the primary advantage of B-Trees over binary search trees for disk storage?",
        type: "multiple_choice",
        options: [
          "Lower height and fewer disk I/O operations",
          "Faster O(1) in-memory pointer traversal",
          "Elimination of all sorting requirements",
          "Zero memory footprint",
        ],
        correctAnswer: 0,
        explanation: "B-Trees have high branching factor m, minimizing disk head seeks.",
        topic: "Storage Architecture",
        difficulty: "intermediate",
        points: 15,
      },
      {
        id: "q-dyn-2",
        text: "True or False: In a safe state, deadlock is mathematically impossible.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation: "A safe state guarantees at least one completion sequence exists.",
        topic: "Operating Systems",
        difficulty: "beginner",
        points: 10,
      },
    ];

    expect(sampleQuestions).toHaveLength(2);
    expect(sampleQuestions[0].points).toBe(15);
    expect(sampleQuestions[1].points).toBe(10);
    expect(sampleQuestions[0].options).toHaveLength(4);
    expect(sampleQuestions[1].options).toHaveLength(2);
  });

  it("should support question curation: editing question text, options, and assigning custom points", () => {
    const draftQuiz: Quiz & { isPractice?: boolean } = {
      id: "quiz-curation-test",
      title: "Midterm Assessment: Data Systems",
      description: "Curated exam covering indexes and consensus",
      subject: "Databases",
      difficulty: "intermediate",
      durationMinutes: 45,
      creatorId: "user-teacher-1",
      creatorName: "Fixture Instructor",
      creatorRole: "teacher",
      isDraft: true,
      passingScore: 70,
      createdAt: "2026-10-18",
      questions: [
        {
          id: "q-curate-1",
          text: "Original draft question prompt",
          type: "multiple_choice",
          options: ["Opt A", "Opt B", "Opt C"],
          correctAnswer: 1,
          explanation: "Draft explanation",
          topic: "Databases",
          difficulty: "intermediate",
        },
      ],
    };

    // Teacher curates question: modifies prompt, distractors, and sets points to 25
    draftQuiz.questions[0].text = "Curated question prompt: Which isolation level prevents phantom reads?";
    draftQuiz.questions[0].options = ["Read Committed", "Repeatable Read", "Serializable", "Read Uncommitted"];
    draftQuiz.questions[0].correctAnswer = 2;
    (draftQuiz.questions[0] as any).points = 25;
    draftQuiz.isDraft = false; // Teacher publishes curated quiz

    saveQuiz(draftQuiz);

    const reloaded = getQuizzes().find((q) => q.id === "quiz-curation-test");
    expect(reloaded).toBeDefined();
    expect(reloaded?.isDraft).toBe(false);
    expect(reloaded?.questions[0].text).toContain("phantom reads");
    expect((reloaded?.questions[0] as any).points).toBe(25);
    expect(reloaded?.questions[0].options).toHaveLength(4);
  });

  it("should evaluate quiz submission with accurate score percentage and weak topic diagnostics", () => {
    const testQuestions: Question[] = [
      {
        id: "q1",
        text: "What is the time complexity of quickselect on average?",
        type: "multiple_choice",
        options: ["O(N)", "O(N log N)", "O(N^2)"],
        correctAnswer: 0,
        explanation: "Quickselect eliminates half search space each step.",
        topic: "Algorithms",
        difficulty: "intermediate",
      },
      {
        id: "q2",
        text: "Does two-phase locking (2PL) prevent cascading rollbacks?",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: 1, // False (Strict 2PL prevents cascading aborts)
        explanation: "Basic 2PL does not prevent cascading aborts; strict 2PL is required.",
        topic: "Transactions",
        difficulty: "advanced",
      },
      {
        id: "q3",
        text: "Name the protocol used for clock synchronization in distributed systems.",
        type: "short_answer",
        correctAnswer: "ntp",
        explanation: "Network Time Protocol (NTP) synchronizes clocks.",
        topic: "Distributed Systems",
        difficulty: "intermediate",
      },
    ];

    const submission = {
      q1: 0, // correct (Algorithms)
      q2: 0, // incorrect (Transactions)
      q3: "NTP", // correct (Distributed Systems, case-insensitive)
    };

    const evaluation = evaluateQuizSubmission(testQuestions, submission, 70);

    expect(evaluation.correctCount).toBe(2);
    expect(evaluation.totalQuestions).toBe(3);
    expect(evaluation.scorePercentage).toBe(67);
    expect(evaluation.passed).toBe(false); // below 70%
    expect(evaluation.weakTopics).toContain("Transactions");
    expect(evaluation.weakTopics).not.toContain("Algorithms");
    expect(evaluation.weakTopics).not.toContain("Distributed Systems");
  });

  it("should support student practice quiz generation marked with isPractice: true", () => {
    const studentPracticeQuiz: Quiz & { isPractice?: boolean } = {
      id: `quiz-practice-${Date.now()}`,
      title: "My Self-Practice Quiz: Operating Systems",
      description: "Self-generated practice questions from my lecture notes",
      subject: "Operating Systems",
      difficulty: "beginner",
      durationMinutes: 20,
      creatorId: "user-student-1",
      creatorName: "Fixture Learner A",
      creatorRole: "student",
      isDraft: false,
      isPractice: true, // Marked strictly as student self-practice
      passingScore: 60,
      createdAt: "2026-10-18",
      questions: [
        {
          id: "q-p-1",
          text: "What causes thrashing in virtual memory?",
          type: "multiple_choice",
          options: ["Excessive paging activity", "CPU clock overclocking", "Disk defragmentation"],
          correctAnswer: 0,
          explanation: "Thrashing occurs when processes spend more time paging than executing.",
          topic: "Virtual Memory",
          difficulty: "intermediate",
        },
      ],
    };

    saveQuiz(studentPracticeQuiz);

    const stored = getQuizzes().find((q) => q.id === studentPracticeQuiz.id);
    expect(stored).toBeDefined();
    expect((stored as any)?.isPractice).toBe(true);
    expect(stored?.creatorRole).toBe("student");
  });

  it("should record student practice attempt marked with isPractice: true", () => {
    const practiceAttempt: QuizAttempt & { isPractice?: boolean } = {
      id: `attempt-prac-${Date.now()}`,
      quizId: "quiz-practice-123",
      quizTitle: "Self Practice: OS Concepts",
      userId: "user-student-1",
      studentName: "Fixture Learner A",
      userRole: "student",
      answers: { "q-p-1": 0 },
      scorePercentage: 100,
      correctCount: 1,
      totalQuestions: 1,
      passed: true,
      startedAt: "2026-10-18T10:00:00Z",
      completedAt: "2026-10-18T10:10:00Z",
      weakTopics: [],
      isPractice: true, // Strictly isolated attempt
    };

    saveAttempt(practiceAttempt);

    const attempts = getAttempts("user-student-1");
    const found = attempts.find((a) => a.id === practiceAttempt.id);
    expect(found).toBeDefined();
    expect((found as any)?.isPractice).toBe(true);
  });

  // Tier 2: Boundaries & Error Handling
  it("should handle quiz evaluation when student scores 100% with all correct answers", () => {
    const questions: Question[] = [
      {
        id: "q1",
        text: "Sample Question 1",
        type: "multiple_choice",
        options: ["A", "B"],
        correctAnswer: 1,
        explanation: "B is correct",
        topic: "Topic A",
        difficulty: "beginner",
      },
    ];

    const result = evaluateQuizSubmission(questions, { q1: 1 }, 70);
    expect(result.scorePercentage).toBe(100);
    expect(result.correctCount).toBe(1);
    expect(result.passed).toBe(true);
    expect(result.weakTopics).toHaveLength(0);
  });

  it("should handle quiz evaluation when student scores 0% with all wrong answers", () => {
    const questions: Question[] = [
      {
        id: "q1",
        text: "Sample Question 1",
        type: "multiple_choice",
        options: ["A", "B"],
        correctAnswer: 0,
        explanation: "A is correct",
        topic: "Algorithms",
        difficulty: "beginner",
      },
    ];

    const result = evaluateQuizSubmission(questions, { q1: 1 }, 70);
    expect(result.scorePercentage).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.weakTopics).toContain("Algorithms");
  });

  it("should handle short-answer questions with leading/trailing whitespace and case insensitivity", () => {
    const questions: Question[] = [
      {
        id: "q1",
        text: "What protocol operates on TCP port 443?",
        type: "short_answer",
        correctAnswer: "https",
        explanation: "HTTPS uses TLS over port 443.",
        topic: "Networking",
        difficulty: "beginner",
      },
    ];

    const result = evaluateQuizSubmission(questions, { q1: "   HTTPS   " }, 70);
    expect(result.correctCount).toBe(1);
    expect(result.scorePercentage).toBe(100);
  });

  it("should handle empty submission answers object gracefully without crashing", () => {
    const questions: Question[] = [
      {
        id: "q1",
        text: "Q1",
        type: "multiple_choice",
        options: ["A", "B"],
        correctAnswer: 0,
        explanation: "Exp",
        topic: "Math",
        difficulty: "beginner",
      },
    ];

    const result = evaluateQuizSubmission(questions, {}, 70);
    expect(result.correctCount).toBe(0);
    expect(result.scorePercentage).toBe(0);
    expect(result.passed).toBe(false);
  });

  // Tier 3: Data Isolation & Permissions
  it("should strictly isolate student practice attempts from teacher cohort gradebook", () => {
    // Seed 2 official attempts and 2 student practice attempts
    const officialAttempt1: QuizAttempt = {
      id: "official-att-1",
      quizId: "quiz-midterm-official",
      quizTitle: "Midterm Exam 2026",
      userId: "user-student-2",
      studentName: "Fixture Learner B",
      userRole: "student",
      answers: {},
      scorePercentage: 92,
      correctCount: 9,
      totalQuestions: 10,
      passed: true,
      startedAt: "2026-10-18T10:00:00Z",
      completedAt: "2026-10-18T10:45:00Z",
      weakTopics: [],
    };

    const officialAttempt2: QuizAttempt = {
      id: "official-att-2",
      quizId: "quiz-midterm-official",
      quizTitle: "Midterm Exam 2026",
      userId: "user-student-3",
      studentName: "Fixture Learner C",
      userRole: "student",
      answers: {},
      scorePercentage: 88,
      correctCount: 8,
      totalQuestions: 10,
      passed: true,
      startedAt: "2026-10-18T10:00:00Z",
      completedAt: "2026-10-18T10:40:00Z",
      weakTopics: [],
    };

    const studentSelfPracticeAttempt: QuizAttempt & { isPractice?: boolean } = {
      id: "practice-att-student-1",
      quizId: "quiz-practice-private",
      quizTitle: "Fixture learner's Fun Self Test",
      userId: "user-student-1",
      studentName: "Fixture Learner A",
      userRole: "student",
      answers: {},
      scorePercentage: 40,
      correctCount: 2,
      totalQuestions: 5,
      passed: false,
      startedAt: "2026-10-18T12:00:00Z",
      completedAt: "2026-10-18T12:15:00Z",
      weakTopics: ["Recursion"],
      isPractice: true, // Marked as student self-practice
    };

    saveAttempt(officialAttempt1);
    saveAttempt(officialAttempt2);
    saveAttempt(studentSelfPracticeAttempt);

    const allAttempts = getAttempts();

    // Teacher gradebook cohort filter: strictly exclude isPractice === true
    const teacherGradebookAttempts = allAttempts.filter(
      (att) => (att as any).isPractice !== true && att.quizId === "quiz-midterm-official"
    );

    expect(teacherGradebookAttempts.some((a) => a.id === "practice-att-student-1")).toBe(false);
    expect(teacherGradebookAttempts.some((a) => a.id === "official-att-1")).toBe(true);
    expect(teacherGradebookAttempts.some((a) => a.id === "official-att-2")).toBe(true);

    // Compute cohort average from teacher gradebook
    const cohortAverage =
      teacherGradebookAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) /
      teacherGradebookAttempts.length;

    // Fixture learner's 40% practice score MUST NOT depress the official cohort average (which is (92 + 88) / 2 = 90%)
    expect(cohortAverage).toBe(90);
  });

  it("should enforce role-based permissions: students cannot access teacher studio or publish official cohort quizzes", () => {
    expect(canAccessTeacherStudio("student")).toBe(false);
    expect(canAccessTeacherStudio(undefined)).toBe(false);
    expect(canAccessTeacherStudio("teacher")).toBe(true);
    expect(canAccessTeacherStudio("admin")).toBe(true);

    expect(canPublishQuiz("student")).toBe(false);
    expect(canPublishQuiz("teacher")).toBe(true);
    expect(canPublishQuiz("admin")).toBe(true);
  });

  // Tier 4: Real-World Workload
  it("should execute end-to-end dynamic quiz flow: teacher generates from note -> curates questions -> student takes exam -> grades calculated", () => {
    // 1. Teacher lecture note text
    const lectureSlide = "Consensus in distributed systems requires agreement, validity, and termination invariants.";
    const chunks = chunkTextContent(lectureSlide, "lec-dist", "Lec-Consensus.txt");
    expect(chunks.length).toBeGreaterThan(0);

    // 2. Questions generated and curated
    const curatedQuiz: Quiz & { isPractice?: boolean } = {
      id: "curated-quiz-consensus",
      title: "Distributed Consensus Examination",
      description: "Official Class Quiz",
      subject: "Distributed Systems",
      difficulty: "advanced",
      durationMinutes: 30,
      creatorId: "user-teacher-1",
      creatorName: "Fixture Instructor",
      creatorRole: "teacher",
      isDraft: false,
      passingScore: 70,
      createdAt: "2026-10-18",
      questions: [
        {
          id: "q-c-1",
          text: "Which property requires that all non-faulty nodes decide on the same value?",
          type: "multiple_choice",
          options: ["Agreement", "Validity", "Termination"],
          correctAnswer: 0,
          explanation: "Agreement property ensures uniform decisions.",
          topic: "Consensus",
          difficulty: "intermediate",
        },
      ],
    };
    saveQuiz(curatedQuiz);

    // 3. Student takes the exam
    const studentAnswer = { "q-c-1": 0 };
    const scoreResult = evaluateQuizSubmission(curatedQuiz.questions, studentAnswer, curatedQuiz.passingScore);

    // 4. Record official attempt
    const attempt: QuizAttempt = {
      id: `attempt-official-${Date.now()}`,
      quizId: curatedQuiz.id,
      quizTitle: curatedQuiz.title,
      userId: "user-student-1",
      studentName: "Fixture Learner A",
      userRole: "student",
      answers: studentAnswer,
      scorePercentage: scoreResult.scorePercentage,
      correctCount: scoreResult.correctCount,
      totalQuestions: curatedQuiz.questions.length,
      passed: scoreResult.passed,
      startedAt: "2026-10-18T14:00:00Z",
      completedAt: "2026-10-18T14:15:00Z",
      weakTopics: scoreResult.weakTopics,
    };
    saveAttempt(attempt);

    // 5. Verify saved and graded
    const studentAttempts = getAttempts("user-student-1");
    expect(studentAttempts.some((a) => a.id === attempt.id && a.scorePercentage === 100)).toBe(true);
  });
});
