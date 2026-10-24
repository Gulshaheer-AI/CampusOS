import type { W3Chapter, W3Course } from "./w3schools-data";
// Original CampusOS lessons; topic coverage is inspired by common programming curricula.
const lessons = [
  {
    course: "python",
    slug: "files-read-write",
    title: "File Reading, Writing & Encodings",
    theory:
      "Use a context manager to close files even when an exception occurs. Read text using an explicit encoding. Mode w replaces an existing file; a appends; x fails if the path exists. Iterate a file rather than reading all of a large file into memory.",
    code: 'with open("notes.txt", "w", encoding="utf-8") as f:\n    f.write("CampusOS\\n")\nwith open("notes.txt", encoding="utf-8") as f:\n    print(f.read().strip())',
    output: "CampusOS",
    answer: "with",
    note: "Do not overwrite an important file without checking its path. The browser filesystem is temporary.",
  },
  {
    course: "python",
    slug: "pathlib",
    title: "Paths, Directories & File Deletion",
    theory:
      "Path objects compose platform-neutral paths. Check exists, is_file and is_dir before choosing an operation. unlink removes a file; rmdir only removes an empty directory. Never construct deletion paths from untrusted user input without validation.",
    code: 'from pathlib import Path\np = Path("demo.txt")\np.write_text("hello", encoding="utf-8")\nprint(p.exists())\np.unlink()\nprint(p.exists())',
    output: "True\nFalse",
    answer: "Path",
    note: "A missing file raises FileNotFoundError unless missing_ok=True is passed to unlink.",
  },
  {
    course: "python",
    slug: "context-managers",
    title: "Context Managers & Resource Cleanup",
    theory:
      "A context manager pairs setup with cleanup. The with statement calls __enter__ and then __exit__, including when an exception is raised. contextlib.contextmanager offers a generator-based alternative; put cleanup inside finally.",
    code: 'from contextlib import contextmanager\n@contextmanager\ndef resource():\n    print("open")\n    try:\n        yield 7\n    finally:\n        print("close")\nwith resource() as value:\n    print(value)',
    output: "open\n7\nclose",
    answer: "yield",
    note: "Cleanup should release resources rather than silently suppress errors.",
  },
  {
    course: "python",
    slug: "generators",
    title: "Iterators & Generators",
    theory:
      "An iterator produces one value at a time through next. A generator uses yield to suspend its state between values, enabling bounded-memory data pipelines. Iterators are consumed once; recreate them when you need another pass.",
    code: "def squares(n):\n    for i in range(n):\n        yield i * i\nprint(list(squares(4)))",
    output: "[0, 1, 4, 9]",
    answer: "yield",
    note: "list(generator) materializes every value; keep iteration lazy for large inputs.",
  },
  {
    course: "python",
    slug: "decorators",
    title: "Decorators & Higher-Order Functions",
    theory:
      "Functions are objects that can be passed into other functions. A decorator returns a replacement callable. functools.wraps preserves the original name and documentation. Forward *args and **kwargs so the wrapper supports the original signature.",
    code: "from functools import wraps\ndef traced(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper\n@traced\ndef add(a, b):\n    return a + b\nprint(add(2, 3))",
    output: "add\n5",
    answer: "wraps",
    note: "A decorator must return the wrapper, rather than the result of calling it immediately.",
  },
  {
    course: "python",
    slug: "dunder-methods",
    title: "Advanced OOP: Dunder Methods & Protocols",
    theory:
      "Python protocols let custom objects support built-in operations. __init__ initializes instance state, __repr__ supplies a useful debugging representation, and __len__ enables len. Prefer explicit composition over inheritance when objects do not have an is-a relationship.",
    code: 'class Team:\n    def __init__(self, names):\n        self.names = names\n    def __len__(self):\n        return len(self.names)\n    def __repr__(self):\n        return f"Team({self.names!r})"\nprint(len(Team(["A", "B"])))',
    output: "2",
    answer: "__len__",
    note: "Do not add methods solely for syntax: each protocol should have a clear meaning for the object.",
  },
  {
    course: "python",
    slug: "dataclasses",
    title: "Dataclasses, Properties & Type Hints",
    theory:
      "Dataclasses generate initialization, equality and repr from annotated fields. Type hints document intent; they do not validate values at runtime. Properties expose computed values while retaining attribute syntax. Use field(default_factory=list) for independent mutable defaults.",
    code: "from dataclasses import dataclass\n@dataclass\nclass Item:\n    price: float\n    quantity: int\n    @property\n    def total(self):\n        return self.price * self.quantity\nprint(Item(2.5, 4).total)",
    output: "10.0",
    answer: "dataclass",
    note: "A frozen dataclass prevents assigning fields but does not recursively freeze nested objects.",
  },
  {
    course: "python",
    slug: "system-modules",
    title: "System Modules: os, sys & argparse",
    theory:
      "Use os.environ for environment settings and sys for interpreter information. argparse validates command-line options and generates help. Keep secrets out of source code and logs. Browser Python has a virtual filesystem rather than access to the host computer.",
    code: 'import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--count", type=int, default=1)\nargs = parser.parse_args(["--count", "3"])\nprint(args.count)',
    output: "3",
    answer: "argparse",
    note: "Use explicit argv in notebooks and browser sandboxes instead of inheriting their process arguments.",
  },
  {
    course: "python",
    slug: "json-datetime-regex",
    title: "JSON, Dates & Regular Expressions",
    theory:
      "json loads structured text into dictionaries and lists; dumps serializes supported values. Use timezone-aware datetimes for real events. Regex is useful for constrained text patterns, while structured formats should use their dedicated parsers.",
    code: 'import json\nfrom datetime import datetime, timezone\nvalue = json.loads(\'{"active": true, "count": 3}\')\nprint(value["count"])\nprint(datetime(2026, 1, 1, tzinfo=timezone.utc).isoformat())',
    output: "3\n2026-01-01T00:00:00+00:00",
    answer: "loads",
    note: "JSON booleans are true/false; Python values are True/False.",
  },
  {
    course: "python",
    slug: "sqlite",
    title: "SQLite & Parameterized Queries",
    theory:
      "sqlite3 provides a transactional relational database without a separate server. Pass query parameters separately from SQL text to avoid SQL injection. Commit successful writes and roll back failures. Close the connection after the unit of work.",
    code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE students (name TEXT, score INTEGER)")\ncon.execute("INSERT INTO students VALUES (?, ?)", ("Gulshaheer", 90))\ncon.commit()\nprint(con.execute("SELECT score FROM students WHERE name = ?", ("Gulshaheer",)).fetchone()[0])\ncon.close()',
    output: "90",
    answer: "execute",
    note: "Use an in-memory database for this lab; it is not persistent production storage.",
  },
  {
    course: "python",
    slug: "mysql",
    title: "MySQL Connections & Transactions",
    theory:
      "MySQL uses a separate database server. Create a connection with credentials from environment variables, use a cursor and parameterized queries, then commit or roll back and close resources. Connector placeholders are %s, unlike SQLite question marks. Never paste passwords into a shared exercise.",
    code: 'query = "SELECT name FROM students WHERE score >= %s"\nparams = (80,)\n# On your machine: cursor.execute(query, params)\nprint(query)\nprint(params)',
    output: "SELECT name FROM students WHERE score >= %s\n(80,)",
    answer: "params",
    note: "Requires mysql-connector-python and a reachable server on your own machine. This browser example shows the query contract without pretending to connect.",
  },
  {
    course: "python",
    slug: "numpy-arrays",
    title: "NumPy Arrays, Shapes & Indexing",
    theory:
      "NumPy arrays store homogeneous numerical data. shape describes dimensions and dtype controls representation. Slices often share memory with the source; use copy when edits must be independent. Boolean masks select values satisfying a vectorized condition.",
    code: "import numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])\nprint(a.shape)\nprint(a[:, 1].tolist())\nprint(a[a > 3].tolist())",
    output: "(2, 3)\n[2, 5]\n[4, 5, 6]",
    answer: "array",
    note: "Indexing is zero-based; verify shapes before combining arrays.",
  },
  {
    course: "python",
    slug: "numpy-broadcasting",
    title: "NumPy Broadcasting & Vectorized Mathematics",
    theory:
      "Broadcasting compares shapes from the right: dimensions must be equal or one. Vectorized operations move loops into optimized numerical routines. Use axis=0 to reduce rows and axis=1 to reduce columns in a two-dimensional matrix.",
    code: "import numpy as np\na = np.array([[1, 2], [3, 4]])\nprint((a + np.array([10, 20])).tolist())\nprint(a.mean(axis=0).tolist())",
    output: "[[11, 22], [13, 24]]\n[2.0, 3.0]",
    answer: "mean",
    note: "Unexpected broadcasting can silently compute the wrong result; inspect both shapes.",
  },
  {
    course: "python",
    slug: "pandas-dataframes",
    title: "Pandas Series, DataFrames & CSV",
    theory:
      "A Series is a labeled column; a DataFrame aligns multiple columns by index. read_csv imports tabular data, loc selects labels and iloc selects positions. Set dtypes and parse dates deliberately when importing business data.",
    code: 'import pandas as pd\nfrom io import StringIO\ndf = pd.read_csv(StringIO("name,score\\nA,80\\nB,90"))\nprint(df.loc[df["score"] >= 85, "name"].tolist())',
    output: "['B']",
    answer: "read_csv",
    note: "Inspect head, info and value counts before trusting an imported dataset.",
  },
  {
    course: "python",
    slug: "pandas-cleaning",
    title: "Pandas Missing Values, Cleaning & Grouping",
    theory:
      "Missing values require a domain decision: drop, impute or retain an explicit unknown. Check duplicates before deduplicating. Grouped aggregates summarize data; merges combine rows by keys and should validate expected cardinality.",
    code: 'import pandas as pd\ndf = pd.DataFrame({"group": ["A", "A", "B"], "score": [80, None, 90]})\ndf["score"] = df["score"].fillna(0)\nprint(df.groupby("group")["score"].sum().to_dict())',
    output: "{'A': 80.0, 'B': 90.0}",
    answer: "fillna",
    note: "Filling a missing score with zero is a demonstration, not a universal cleaning rule.",
  },
  {
    course: "python",
    slug: "matplotlib",
    title: "Matplotlib Line, Scatter, Bar & Histogram Plots",
    theory:
      "Choose a line for ordered trends, scatter for relationships, bars for category comparisons and histograms for distributions. Label axes with units, use a readable legend and close figures after saving. Avoid misleading truncated scales.",
    code: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(2, 2)\naxes[0, 0].plot([1, 2, 3], [2, 4, 3])\naxes[0, 1].scatter([1, 2, 3], [3, 2, 4])\naxes[1, 0].bar(["A", "B"], [4, 6])\naxes[1, 1].hist([1, 1, 2, 3], bins=3)\nfig.savefig("charts.png")\nplt.close(fig)\nprint("Saved charts.png")',
    output: "Saved charts.png",
    answer: "savefig",
    note: "The browser lab writes a virtual PNG; graphical file export is separate from console output.",
  },
  {
    course: "python",
    slug: "statistics",
    title: "Statistics, Distributions & Reproducibility",
    theory:
      "Mean and median summarize different aspects of a distribution. Standard deviation describes spread, not uncertainty in the population mean. A random seed makes a numerical experiment repeatable; it does not make a biased sample representative.",
    code: "from statistics import mean, median, pstdev\nvalues = [1, 2, 3, 4, 100]\nprint(mean(values), median(values))\nprint(round(pstdev(values), 2))",
    output: "22 3\n39.01",
    answer: "median",
    note: "Correlation describes association; it does not establish causation.",
  },
  {
    course: "python",
    slug: "ml-regression",
    title: "Machine Learning: Linear Regression & Metrics",
    theory:
      "Fit model parameters only on training data. Linear regression predicts a numerical target from features; mean squared error penalizes large residuals. Compare against a simple baseline before claiming improvement and examine errors for important subgroups.",
    code: "x = [1, 2, 3]\ny = [3, 5, 7]\nxbar, ybar = sum(x)/len(x), sum(y)/len(y)\nslope = sum((a-xbar)*(b-ybar) for a,b in zip(x,y)) / sum((a-xbar)**2 for a in x)\nintercept = ybar - slope*xbar\nprint(slope, intercept)\nprint(slope*4 + intercept)",
    output: "2.0 1.0\n9.0",
    answer: "sum",
    note: "This exact toy dataset demonstrates mechanics; it is not evidence of real-world predictive accuracy.",
  },
  {
    course: "python",
    slug: "ml-validation",
    title: "Train/Test Splits, Leakage & Evaluation",
    theory:
      "Reserve held-out data before fitting scalers, feature selection or models. Use temporal splits for forecasting and group splits when multiple rows belong to one person. Classification uses precision, recall and confusion matrices; regression uses MAE/MSE and residual diagnostics.",
    code: "actual = [3, 5, 8]\npredicted = [3, 5, 7]\nmae = sum(abs(a-p) for a,p in zip(actual,predicted))/len(actual)\nprint(round(mae, 3))",
    output: "0.333",
    answer: "abs",
    note: "Select hyperparameters with validation data; keep the final test set for a final assessment.",
  },
  {
    course: "python",
    slug: "deep-learning",
    title: "Deep Learning Foundations: Forward Pass & Gradient Descent",
    theory:
      "A neuron computes an affine transform followed by an activation. Training minimizes a loss by differentiating parameters and taking small updates. Deep models require validation, regularization and suitable data. This scalar example explains gradient descent without claiming to train a production neural network.",
    code: "weight = 0.0\nfor _ in range(100):\n    prediction = weight * 2\n    gradient = 2 * (prediction - 4) * 2\n    weight -= 0.1 * gradient\nprint(round(weight, 2))",
    output: "2.0",
    answer: "gradient",
    note: "Framework topics to continue: tensors, autograd, batching, optimizers, dropout and early stopping.",
  },
  {
    course: "python",
    slug: "testing-packaging",
    title: "Testing, Virtual Environments & Packaging",
    theory:
      "Use isolated environments for dependency reproducibility. Separate pure computation from file/network effects to make tests deterministic. Unit tests check behavior at boundaries; integration tests check component contracts. Pin and review dependencies before deployment.",
    code: "import unittest\ndef total(prices):\n    return sum(prices)\nclass TotalTests(unittest.TestCase):\n    def test_empty(self):\n        self.assertEqual(total([]), 0)\nprint(total([2, 3, 4]))",
    output: "9",
    answer: "sum",
    note: "Run python -m venv .venv and python -m unittest on your own machine; the browser runtime is already isolated.",
  },
  {
    course: "python",
    slug: "asyncio",
    title: "Async I/O, Tasks & Cancellation",
    theory:
      "Async functions suspend at await so other tasks can progress. asyncio.gather collects results from concurrent I/O tasks. CPU-bound computation still blocks the event loop; move it to a worker/process. Always set network timeouts and handle cancellation.",
    code: "import asyncio\nasync def fetch_value(n):\n    await asyncio.sleep(0)\n    return n * 2\nvalues = await asyncio.gather(fetch_value(2), fetch_value(3))\nprint(values)",
    output: "[4, 6]",
    answer: "gather",
    note: "Top-level await works in the browser lab. A standalone script should call asyncio.run(main()).",
  },
  {
    course: "javascript",
    slug: "promises",
    title: "Promises & Error Handling",
    theory:
      "A Promise represents a future result. then transforms success while catch handles rejection. Return nested promises so callers can await the complete operation. finally performs cleanup and should not replace the result accidentally.",
    code: "Promise.resolve(4).then(n => n * 2).then(console.log).catch(console.error);",
    output: "8",
    answer: "then",
    note: "A rejected promise must be handled; wrapping async code in synchronous try/catch alone is insufficient.",
  },
  {
    course: "javascript",
    slug: "async-fetch",
    title: "Async/Await, Fetch & HTTP Failures",
    theory:
      "await pauses the async function, not the entire browser. fetch rejects network failures but does not reject HTTP 404/500; check response.ok before parsing. Validate response shape before using external data.",
    code: "async function readJson(response) {\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  return response.json();\n}\nreadJson({ok: true, json: async () => ({count: 3})}).then(v => console.log(v.count));",
    output: "3",
    answer: "ok",
    note: "This deterministic response fixture avoids a dependency on a remote demo API.",
  },
  {
    course: "javascript",
    slug: "concurrency",
    title: "Promise.all, Cancellation & Timeouts",
    theory:
      "Promise.all preserves input order and rejects if any task fails. allSettled retains every outcome. AbortController cancels supported network operations; clear timeout timers after completion to avoid leaks. Limit concurrency for large queues.",
    code: "Promise.all([Promise.resolve(2), Promise.resolve(3)]).then(values => console.log(values.reduce((a,b) => a+b, 0)));",
    output: "5",
    answer: "all",
    note: "Aborting a request does not undo a mutation already accepted by a server.",
  },
  {
    course: "javascript",
    slug: "modules",
    title: "ES Modules, Scope & Testing",
    theory:
      "Modules use explicit export/import boundaries and module scope. Prefer named exports for reusable utilities and keep side effects out of import-time execution. A unit test should assert observable results rather than private implementation details.",
    code: "const tax = (price, rate) => price * rate;\nconsole.assert(tax(100, .1) === 10);\nconsole.log(tax(50, .2));",
    output: "10",
    answer: "const",
    note: "Actual import/export examples need separate module files; CodePlay supports a project workspace.",
  },
  {
    course: "javascript",
    slug: "dom-events",
    title: "DOM Events, Delegation & Accessible State",
    theory:
      "Use addEventListener to separate markup and behavior. Event delegation handles clicks from dynamic descendants with closest. Prefer textContent for untrusted text. Interactive controls need keyboard access, a label and visible focus.",
    code: 'const labels = ["Enroll", "Open course"];\nconsole.log(labels.map(label => ({label, disabled: false})));',
    output:
      '[{"label":"Enroll","disabled":false},{"label":"Open course","disabled":false}]',
    answer: "map",
    note: "Run DOM code in an HTML preview. Console output here models the state separately from rendering.",
  },
  {
    course: "html",
    slug: "accessible-forms",
    title: "Accessible Forms & Browser Validation",
    theory:
      "Associate every input with a visible label using matching for/id values. Choose meaningful input types and autocomplete hints. Required and minlength improve feedback but server validation is still necessary. Announce async errors using a live region.",
    code: '<form><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><button>Join</button><p role="status" aria-live="polite"></p></form>',
    output: "A labeled email field and submit button.",
    answer: "label",
    note: "Placeholder text is not a replacement for a label.",
  },
  {
    course: "html",
    slug: "media",
    title: "Responsive Images, Audio & Video",
    theory:
      "Use srcset and sizes for responsive image selection and explicit width/height to reduce layout shifts. Supply descriptive alt text for meaningful images and empty alt for decoration. Video needs captions and native controls.",
    code: '<figure><img src="campus.jpg" width="640" height="360" alt="Students studying in the campus library"><figcaption>Campus library</figcaption></figure>',
    output: "An image with text alternative and caption.",
    answer: "alt",
    note: "Do not autoplay sound or rely on media as the only way to access important information.",
  },
  {
    course: "html",
    slug: "semantic-landmarks",
    title: "Semantic Landmarks & Keyboard Navigation",
    theory:
      "Landmarks such as main, nav, header and footer help assistive technology locate content. Use one meaningful h1 and an ordered heading hierarchy. Links navigate and buttons perform actions. Add a skip link so keyboard users can bypass repeated navigation.",
    code: '<a href="#content">Skip to content</a><header><nav aria-label="Main"><a href="/courses">Courses</a></nav></header><main id="content"><h1>Courses</h1><article><h2>Python</h2><p>Learn by building.</p></article></main>',
    output: "Semantic navigation and a course article.",
    answer: "main",
    note: "Do not add tabindex to every element; native interactive elements already support keyboard navigation.",
  },
  {
    course: "html",
    slug: "browser-storage",
    title: "Web Storage & Progressive Enhancement",
    theory:
      "HTML supplies a usable baseline while JavaScript enhances interaction. localStorage stores small strings synchronously; IndexedDB stores larger structured data and Blobs asynchronously. Storage can be denied or evicted, so show failures and provide a recovery path.",
    code: '<main><h1>Lecture files</h1><p>Files are stored in this browser.</p><button type="button">Choose file</button><noscript>Enable JavaScript to upload files.</noscript></main>',
    output: "A progressively enhanced upload interface.",
    answer: "button",
    note: "Browser storage is not cross-device cloud storage or a substitute for backups.",
  },
  {
    course: "css",
    slug: "grid-systems",
    title: "CSS Grid: Tracks, Gaps & Responsive Layouts",
    theory:
      "Grid lays out rows and columns together. repeat(auto-fit,minmax()) creates responsive cards without device-specific breakpoints. minmax(0,1fr) allows long content to shrink without overflowing its track. Use gap rather than margins between items.",
    code: ".cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1rem; }\n.cards > * { min-width: 0; overflow-wrap: anywhere; }",
    output: "Responsive equal-width cards with wrapping text.",
    answer: "grid",
    note: "Grid changes presentation; keep DOM order logical for keyboard and screen-reader users.",
  },
  {
    course: "css",
    slug: "responsive",
    title: "Media Queries & Fluid Typography",
    theory:
      "Write a usable small-screen layout first and enhance it at content-driven breakpoints. clamp bounds fluid sizes. Relative units respect user font preferences. Test long names, translated labels, zoom and narrow viewports.",
    code: "h1 { font-size: clamp(1.5rem, 4vw, 3rem); }\n.layout { display: grid; gap: 1rem; }\n@media (min-width: 50rem) { .layout { grid-template-columns: 1fr 2fr; } }",
    output: "A fluid heading and responsive two-column layout.",
    answer: "clamp",
    note: "Avoid fixed heights around text; text can grow when a user increases font size.",
  },
  {
    course: "css",
    slug: "cascade",
    title: "Cascade, Specificity & Custom Properties",
    theory:
      "The cascade considers origin, importance, layers, specificity and source order. Custom properties make design tokens reusable and participate in inheritance. Reduce selector specificity so components can be overridden predictably.",
    code: " :root { --accent: #6653e6; --ink: #0f172a; }\n.button { color: white; background: var(--accent); }\n.button:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }",
    output: "A themed button with visible keyboard focus.",
    answer: "var",
    note: "Use !important sparingly; broad overrides can break contrast in nested components.",
  },
  {
    course: "css",
    slug: "accessibility",
    title: "Contrast, Focus & Reduced Motion",
    theory:
      "Readable text needs sufficient luminance contrast with its actual background. Preserve visible focus and avoid conveying status only through color. prefers-reduced-motion lets users reduce animation. Check hover, disabled and error states separately.",
    code: "a { color: #5b21b6; text-decoration: underline; }\na:focus-visible { outline: 3px solid #0f172a; }\n@media (prefers-reduced-motion: reduce) { * { animation: none !important; scroll-behavior: auto !important; } }",
    output: "High-contrast links, visible focus and reduced motion.",
    answer: "underline",
    note: "Small text generally needs at least 4.5:1 contrast; large text needs 3:1.",
  },
  {
    course: "css",
    slug: "print",
    title: "Print Styles & Fragmentation",
    theory:
      "Print uses paged layout rather than a scrolling viewport. Remove navigation and interactive controls, keep headings with following content, and let long sections paginate. Repeating table headers and avoiding row splits improves printed reports.",
    code: "@media print {\n  nav, button { display: none; }\n  h2 { break-after: avoid; }\n  tr { break-inside: avoid; }\n  thead { display: table-header-group; }\n  .document { overflow: visible; height: auto; }\n}",
    output: "Print-friendly document flow.",
    answer: "print",
    note: "Avoid break-inside:avoid on a section taller than one page; it cannot fit on any page.",
  },
  {
    course: "sql",
    slug: "subqueries",
    title: "Subqueries, EXISTS & Common Table Expressions",
    theory:
      "A subquery can produce a scalar, set or correlated existence check. EXISTS tests whether any matching row exists without multiplying parent rows. CTEs name intermediate queries for readability; they are not always materialized.",
    code: "WITH high_scores AS (SELECT student_id FROM Results WHERE score >= 80)\nSELECT name FROM Students s\nWHERE EXISTS (SELECT 1 FROM high_scores h WHERE h.student_id = s.student_id);",
    output: "Names of students with at least one score >= 80.",
    answer: "EXISTS",
    note: "Use NOT EXISTS rather than NOT IN when null values may appear in the subquery.",
  },
  {
    course: "sql",
    slug: "transactions",
    title: "Transactions, COMMIT & ROLLBACK",
    theory:
      "A transaction groups changes into one unit. Commit only after every required write succeeds; roll back on failure. Isolation controls how concurrent transactions observe changes. Transfers must debit and credit atomically, with constraints protecting balances.",
    code: "BEGIN;\nUPDATE Accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE Accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;",
    output:
      "Both balance changes commit together, or roll back together on failure.",
    answer: "COMMIT",
    note: "Real transfers need a sufficient-balance condition, row locking and verification of affected-row counts.",
  },
  {
    course: "sql",
    slug: "window-functions",
    title: "Window Functions & Ranking",
    theory:
      "Window functions compute across related rows without collapsing them. PARTITION BY defines groups and ORDER BY defines sequence. ROW_NUMBER assigns unique row numbers, RANK leaves gaps for ties and DENSE_RANK does not. Specify a frame for running aggregates.",
    code: "SELECT name, department, score,\nDENSE_RANK() OVER (PARTITION BY department ORDER BY score DESC) AS rank\nFROM Results;",
    output:
      "Each result retains its row and receives a departmental score rank.",
    answer: "DENSE_RANK",
    note: "Filtering window results usually needs a CTE/subquery; WHERE is evaluated before window functions.",
  },
  {
    course: "sql",
    slug: "constraints-indexes",
    title: "Constraints, Indexes & Query Plans",
    theory:
      "Primary keys identify rows, foreign keys protect references and CHECK constraints protect business invariants. Indexes accelerate selected reads at the cost of storage and write work. Use EXPLAIN on representative data rather than indexing every column.",
    code: "CREATE TABLE Enrollments (\n student_id INTEGER NOT NULL,\n course_id INTEGER NOT NULL,\n PRIMARY KEY (student_id, course_id)\n);\nCREATE INDEX enrollments_course ON Enrollments(course_id);",
    output:
      "Duplicate enrollments are rejected and course lookups can use the index.",
    answer: "PRIMARY KEY",
    note: "Check your database dialect: index features, isolation defaults and constraint syntax differ.",
  },
  {
    course: "sql",
    slug: "safe-queries",
    title: "NULL Semantics & Safe Parameterized Queries",
    theory:
      "NULL means unknown and comparisons with it produce unknown. Use IS NULL rather than = NULL. COALESCE supplies a fallback. Bind values as parameters; table and column identifiers require an allowlist because value parameters cannot replace SQL syntax.",
    code: "SELECT name, COALESCE(phone, 'Not provided') AS phone\nFROM Students\nWHERE graduation_date IS NULL;",
    output:
      "Students with unknown graduation dates and readable missing-phone labels.",
    answer: "IS NULL",
    note: "SQL uses three-valued logic; test missing values as well as normal records.",
  },
] as const;
export function advancedChapters(course: W3Course["id"]): W3Chapter[] {
  return lessons
    .filter((s) => s.course === course)
    .map((s) => ({
      id: `${s.course}-${s.slug}`,
      title: s.title,
      categoryGroup: "Applied & Advanced",
      description: s.theory,
      sections: [
        { title: "Concept & workflow", content: s.theory },
        {
          title: "Worked example",
          content: s.note,
          codeSnippet: { language: s.course, code: s.code },
        },
      ],
      tryItYourself: {
        title: s.title,
        language: s.course,
        starterCode: s.code,
        expectedOutput: s.output,
        explanation: s.note,
      },
      exercise: {
        title: `Check: ${s.title}`,
        prompt: `Complete the missing keyword or API in this worked example. ${s.note}`,
        codeTemplate: s.code.replace(s.answer, "___"),
        blankAnswer: s.answer,
        hint: s.theory,
        explanation: s.theory,
        xp: 40,
      },
    }));
}
