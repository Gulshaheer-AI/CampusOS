import { advancedChapters } from "./w3-advanced";
// People, grades and contact examples below are anonymous synthetic teaching fixtures.
// They are not identities or records loaded from a student information system.
export interface W3Section {
  title: string;
  content: string;
  terminalCommand?: string;
  terminalOutput?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  note?: string;
}

export interface W3Exercise {
  title: string;
  prompt: string;
  codeTemplate: string;
  blankAnswer: string;
  acceptableAnswers?: string[];
  hint: string;
  explanation: string;
  xp: number;
}

export interface W3TryItYourself {
  title: string;
  language: "python" | "javascript" | "html" | "css" | "sql";
  starterCode: string;
  expectedOutput: string;
  explanation?: string;
}

export interface W3Chapter {
  id: string;
  title: string;
  categoryGroup?: string;
  subtopics?: string[];
  description: string;
  sections: W3Section[];
  tryItYourself: W3TryItYourself;
  exercise: W3Exercise;
}

export interface W3Course {
  id: "python" | "javascript" | "html" | "css" | "sql";
  name: string;
  tabLabel: string;
  tagline: string;
  sidebarTitle: string;
  categoryBadge: string;
  accentColor: string;
  chapters: W3Chapter[];
}

export const W3_COURSES: W3Course[] = [
  // =========================================================================
  // 1. PYTHON COURSE (Exact W3Schools Curriculum matching user screenshot)
  // =========================================================================
  {
    id: "python",
    name: "Python",
    tabLabel: "PYTHON",
    tagline: "The world's most popular backend, AI, automation and data science language.",
    sidebarTitle: "PYTHON TUTORIAL",
    categoryBadge: "Backend & AI",
    accentColor: "#04AA6D",
    chapters: [
      {
        id: "python-home",
        title: "Python HOME",
        categoryGroup: "Python Tutorial",
        description: "Python is a popular programming language created by Guido van Rossum, and released in 1991. It is used for web development, software development, mathematics, and system scripting.",
        sections: [
          {
            title: "Learn Python",
            content: "Python is easy to learn and its syntax allows developers to write programs with fewer lines than some other programming languages. Python runs on an interpreter system, meaning that code can be executed as soon as it is written.",
          },
          {
            title: "Learning by Doing",
            content: "With our 'Try it Yourself' editor, you can edit Python code and view the result in your browser.",
            terminalCommand: "python --version",
            terminalOutput: "Python 3.12.2",
          },
        ],
        tryItYourself: {
          title: "Example: First Python Program",
          language: "python",
          starterCode: `print("Hello, World!")`,
          expectedOutput: "Hello, World!",
          explanation: "The print() function outputs the specified message to the screen or console.",
        },
        exercise: {
          title: "Exercise: Output Text",
          prompt: "Insert the missing part of the code below to output 'Hello World'.",
          codeTemplate: `___("Hello World")`,
          blankAnswer: "print",
          acceptableAnswers: ["print", "print()"],
          hint: "Use the print function to output text in Python.",
          explanation: "In Python, the print() function outputs text to the standard output console.",
          xp: 25,
        },
      },
      {
        id: "python-intro",
        title: "Python Intro",
        categoryGroup: "Python Tutorial",
        description: "What is Python? Python is a high-level, general-purpose programming language widely used in AI, Machine Learning, Data Analytics, and Web Development.",
        sections: [
          {
            title: "What can Python do?",
            content: "Python can be used on a server to create web applications, alongside software to create workflows, to connect to database systems, to handle big data and perform complex mathematics, and for rapid prototyping or production-ready software development.",
          },
          {
            title: "Why Python?",
            content: "Python works on different platforms (Windows, Mac, Linux, Raspberry Pi, etc.). Python has a simple syntax similar to the English language. Python runs on an interpreter system, allowing code to be executed immediately.",
          },
        ],
        tryItYourself: {
          title: "Example: Python Calculations",
          language: "python",
          starterCode: `x = 10\ny = 5\nprint("Sum:", x + y)\nprint("Product:", x * y)`,
          expectedOutput: "Sum: 15\nProduct: 50",
          explanation: "Python handles variable assignment dynamically and performs arithmetic effortlessly.",
        },
        exercise: {
          title: "Exercise: Comments in Python",
          prompt: "Comments in Python are written with a special character, which one?",
          codeTemplate: `___ This is a single-line comment\nprint("Comments ignored")`,
          blankAnswer: "#",
          acceptableAnswers: ["#"],
          hint: "Python comments start with the hash or pound character.",
          explanation: "Comments in Python begin with the hash character '#' and extend to the end of the line.",
          xp: 25,
        },
      },
      {
        id: "python-getstarted",
        title: "Python Get Started",
        categoryGroup: "Python Tutorial",
        description: "To check if Python is installed on a Windows PC, search in the start bar for Python or run the command line command.",
        sections: [
          {
            title: "Python Quickstart",
            content: "Python is an interpreted programming language, meaning that as a developer you write Python (.py) files in a text editor and then put those files into the python interpreter to be executed.",
            terminalCommand: "C:\\Users\\Your Name>python --version",
            terminalOutput: "Python 3.12.0",
          },
          {
            title: "The Python Command Line",
            content: "To test a short amount of code in python sometimes it is quickest and easiest not to write the code in a file. This is possible because Python can be run as a command line itself.",
            terminalCommand: "C:\\Users\\Your Name>python",
            terminalOutput: ">>> print('Hello, World!')\nHello, World!",
          },
        ],
        tryItYourself: {
          title: "Example: Running Commands",
          language: "python",
          starterCode: `import sys\nprint("Python Version Info:", sys.version.split()[0])`,
          expectedOutput: "Python Version Info: 3.12.0",
          explanation: "The sys module provides access to variables used or maintained by the interpreter.",
        },
        exercise: {
          title: "Exercise: Exit Command Line",
          prompt: "Which command is used to exit the Python command line interface?",
          codeTemplate: `>>> ___()`,
          blankAnswer: "exit",
          acceptableAnswers: ["exit", "quit"],
          hint: "Type exit() or quit() to leave the REPL.",
          explanation: "exit() or quit() terminates the interactive Python REPL session.",
          xp: 25,
        },
      },
      {
        id: "python-syntax",
        title: "Python Syntax",
        categoryGroup: "Python Tutorial",
        subtopics: ["Syntax", "Statements", "Code Challenge"],
        description: "Python syntax can be executed directly by writing in the Command Line, or by creating a python file on the server.",
        sections: [
          {
            title: "Execute Python Syntax",
            content: "As we learned in the previous page, Python syntax can be executed by writing directly in the Command Line:",
            terminalCommand: ">>> print(\"Hello, World!\")",
            terminalOutput: "Hello, World!",
          },
          {
            title: "Running a Python File",
            content: "Or by creating a python file on the server, using the .py file extension, and running it in the Command Line:",
            terminalCommand: "C:\\Users\\Your Name>python myfile.py",
            terminalOutput: "Hello, World!",
          },
          {
            title: "Python Indentation",
            content: "Indentation refers to the spaces at the beginning of a code line. Where in other programming languages the indentation in code is for readability only, the indentation in Python is very important! Python uses indentation to indicate a block of code.",
            codeSnippet: {
              language: "python",
              code: "if 5 > 2:\n    print('Five is greater than two!')",
            },
            note: "Python will give you an error if you skip the indentation: IndentationError: expected an indented block",
          },
        ],
        tryItYourself: {
          title: "Example: Python Indentation",
          language: "python",
          starterCode: `if 5 > 2:\n    print("Five is greater than two!")\n    print("Indented code block executed successfully.")`,
          expectedOutput: "Five is greater than two!\nIndented code block executed successfully.",
          explanation: "The number of spaces is up to you as a programmer (the most common use is four), but it has to be at least one.",
        },
        exercise: {
          title: "Exercise: Correct Indentation",
          prompt: "Insert the missing indentation keyword to complete the valid conditional statement:",
          codeTemplate: `if 5 > 2:\n____print("Five is greater than two!")`,
          blankAnswer: "    ",
          acceptableAnswers: ["    ", "  ", "\t"],
          hint: "Python requires at least one space or standard 4 spaces of indentation inside conditional blocks.",
          explanation: "Without indentation, Python raises an IndentationError. Four spaces is the PEP 8 standard.",
          xp: 30,
        },
      },
      {
        id: "python-output",
        title: "Python Output",
        categoryGroup: "Python Tutorial",
        description: "In Python, the print() function is often used to output variables and text to the screen.",
        sections: [
          {
            title: "The print() Function",
            content: "To print multiple variables in the print() function, separate them with commas, which even support different data types.",
            codeSnippet: {
              language: "python",
              code: "name = 'CampusOS'\nyear = 2026\nprint('Platform:', name, 'Year:', year)",
            },
          },
          {
            title: "Formatting Output",
            content: "You can also use f-strings (formatted string literals) to format output cleanly by prefixing the string with f or F.",
            codeSnippet: {
              language: "python",
              code: "score = 98\nprint(f'Your ATS score is {score}%')",
            },
          },
        ],
        tryItYourself: {
          title: "Example: Print Multiple Values",
          language: "python",
          starterCode: `name = "DemoA"\nrole = "Full-Stack Engineer"\nprint(f"Candidate: {name} | Position: {role}")`,
          expectedOutput: "Candidate: DemoA | Position: Full-Stack Engineer",
          explanation: "F-strings provide an elegant, readable way to interpolate variables into strings.",
        },
        exercise: {
          title: "Exercise: Print with Separator",
          prompt: "Fill in the parameter to print values separated by a hyphen:",
          codeTemplate: `print("Python", "W3Schools", "CampusOS", ___="-")`,
          blankAnswer: "sep",
          acceptableAnswers: ["sep"],
          hint: "The sep parameter in print() specifies how multiple arguments are separated.",
          explanation: "The 'sep' parameter defines the string inserted between values, default is space.",
          xp: 25,
        },
      },
      {
        id: "python-comments",
        title: "Python Comments",
        categoryGroup: "Python Tutorial",
        description: "Comments can be used to explain Python code, make the code more readable, and prevent execution when testing code.",
        sections: [
          {
            title: "Creating a Comment",
            content: "Comments starts with a #, and Python will ignore them. A comment does not have to be text that explains the code, it can also be used to prevent Python from executing code.",
            codeSnippet: {
              language: "python",
              code: "# This is a comment\nprint('Hello, World!')",
            },
          },
          {
            title: "Multiline Comments",
            content: "Python does not really have a syntax for multiline comments. To add a multiline comment you could insert a # for each line, or use a multiline string (triple quotes \"\"\").",
          },
        ],
        tryItYourself: {
          title: "Example: Single and Multiline Comments",
          language: "python",
          starterCode: `# Calculation module for CampusOS\n\"\"\"\nThis block is a multiline docstring\nexplaining the mathematical algorithm.\n\"\"\"\nx = 42\nprint("Active Value:", x)`,
          expectedOutput: "Active Value: 42",
          explanation: "Python ignores unassigned string literals, effectively treating them as multiline comments.",
        },
        exercise: {
          title: "Exercise: Comment Out Code",
          prompt: "Comment out the first line so only line 2 prints:",
          codeTemplate: `___ print("Do not print this")\nprint("Print this")`,
          blankAnswer: "#",
          acceptableAnswers: ["#"],
          hint: "Use # at the beginning of the line.",
          explanation: "The # symbol prevents Python from interpreting that line of code.",
          xp: 25,
        },
      },
      {
        id: "python-variables",
        title: "Python Variables",
        categoryGroup: "Python Tutorial",
        description: "Variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable.",
        sections: [
          {
            title: "Creating Variables",
            content: "A variable is created the moment you first assign a value to it. Variables do not need to be declared with any particular type, and can even change type after they have been set.",
            codeSnippet: {
              language: "python",
              code: "x = 5\ny = 'CampusOS'\nprint(x)\nprint(y)",
            },
          },
          {
            title: "Casting & Variable Names",
            content: "If you want to specify the data type of a variable, this can be done with casting (str, int, float). A variable name must start with a letter or underscore, and is case-sensitive (age, Age, and AGE are three different variables).",
          },
        ],
        tryItYourself: {
          title: "Example: Variables and Types",
          language: "python",
          starterCode: `student_name = "Demo"\nage = 21\ngpa = 3.85\nprint(f"Name: {student_name}, Age: {age}, GPA: {gpa}")\nprint("Types:", type(student_name).__name__, type(age).__name__, type(gpa).__name__)`,
          expectedOutput: "Name: Demo, Age: 21, GPA: 3.85\nTypes: str int float",
          explanation: "Variables store values dynamically and their type can be verified with type().",
        },
        exercise: {
          title: "Exercise: Assigning Variables",
          prompt: "Create a variable named carname and assign the value Volvo to it.",
          codeTemplate: `carname = ___`,
          blankAnswer: '"Volvo"',
          acceptableAnswers: ['"Volvo"', "'Volvo'"],
          hint: "Wrap string values in double or single quotes.",
          explanation: "String variables in Python must be enclosed in quotes.",
          xp: 25,
        },
      },
      {
        id: "python-datatypes",
        title: "Python Data Types",
        categoryGroup: "Python Tutorial",
        description: "In programming, data type is an important concept. Variables can store data of different types, and different types can do different things.",
        sections: [
          {
            title: "Built-in Data Types",
            content: "Python has the following data types built-in by default: Text Type (str), Numeric Types (int, float, complex), Sequence Types (list, tuple, range), Mapping Type (dict), Set Types (set, frozenset), Boolean Type (bool), Binary Types (bytes, bytearray, memoryview).",
          },
        ],
        tryItYourself: {
          title: "Example: Check Data Types",
          language: "python",
          starterCode: `items = [10, 3.14, "Hello", True, [1, 2], {"key": "val"}]\nfor item in items:\n    print(f"{repr(item):15} -> {type(item).__name__}")`,
          expectedOutput: "10              -> int\n3.14            -> float\n'Hello'         -> str\nTrue            -> bool\n[1, 2]          -> list\n{'key': 'val'}  -> dict",
          explanation: "Python provides built-in reflection allowing dynamic type inspection.",
        },
        exercise: {
          title: "Exercise: Get Type",
          prompt: "What is the correct syntax to output the type of a variable named x?",
          codeTemplate: `print(___(x))`,
          blankAnswer: "type",
          acceptableAnswers: ["type"],
          hint: "Use the built-in type() function.",
          explanation: "type(x) returns the data type class of the object x.",
          xp: 25,
        },
      },
      {
        id: "python-numbers",
        title: "Python Numbers",
        categoryGroup: "Python Tutorial",
        description: "There are three numeric types in Python: int, float, and complex. Variables of numeric types are created when you assign a value to them.",
        sections: [
          {
            title: "Numeric Types",
            content: "Int is a whole number, positive or negative, without decimals, of unlimited length. Float is a number, positive or negative, containing one or more decimals. Complex numbers are written with a 'j' as the imaginary part.",
          },
        ],
        tryItYourself: {
          title: "Example: Working with Numbers",
          language: "python",
          starterCode: `x = 1       # int\ny = 2.8     # float\nz = 1j      # complex\nprint(type(x).__name__, type(y).__name__, type(z).__name__)\n\n# Scientific floats with 'e'\na = 35e3\nprint("Scientific notation 35e3:", a)`,
          expectedOutput: "int float complex\nScientific notation 35e3: 35000.0",
          explanation: "Float can also be scientific numbers with an 'e' to indicate the power of 10.",
        },
        exercise: {
          title: "Exercise: Convert to Float",
          prompt: "Insert the correct function to convert x into a floating point number.",
          codeTemplate: `x = 5\nx = ___(x)`,
          blankAnswer: "float",
          acceptableAnswers: ["float"],
          hint: "Use the float() constructor.",
          explanation: "float(5) converts integer 5 to decimal 5.0.",
          xp: 25,
        },
      },
      {
        id: "python-casting",
        title: "Python Casting",
        categoryGroup: "Python Tutorial",
        description: "Specify a Variable Type: There may be times when you want to specify a type on to a variable. This can be done with casting.",
        sections: [
          {
            title: "Casting Functions",
            content: "int() constructs an integer number from an integer literal, a float literal, or a string literal. float() constructs a float number. str() constructs a string from a wide variety of data types.",
          },
        ],
        tryItYourself: {
          title: "Example: Type Casting",
          language: "python",
          starterCode: `x = int(2.8)     # x will be 2\ny = str(3.0)     # y will be '3.0'\nz = float("4.2") # z will be 4.2\nprint("x:", x, "y:", y, "z:", z)`,
          expectedOutput: "x: 2 y: 3.0 z: 4.2",
          explanation: "Casting truncates floats to integers and converts numeric strings to numeric values.",
        },
        exercise: {
          title: "Exercise: String to Integer",
          prompt: "Convert the string '100' to an integer:",
          codeTemplate: `num_str = "100"\nnum_int = ___(num_str)`,
          blankAnswer: "int",
          acceptableAnswers: ["int"],
          hint: "Use the int() function.",
          explanation: "int('100') returns the numerical integer 100.",
          xp: 25,
        },
      },
      {
        id: "python-strings",
        title: "Python Strings",
        categoryGroup: "Python Tutorial",
        description: "Strings in python are surrounded by either single quotation marks, or double quotation marks. 'hello' is the same as \"hello\".",
        sections: [
          {
            title: "Strings are Arrays",
            content: "Like many other popular programming languages, strings in Python are arrays of bytes representing unicode characters. Python does not have a character data type, a single character is simply a string with a length of 1.",
            codeSnippet: {
              language: "python",
              code: "a = 'Hello, World!'\nprint(a[1]) # prints 'e'\nprint(len(a)) # prints 13",
            },
          },
          {
            title: "Slicing Strings",
            content: "You can return a range of characters by using the slice syntax. Specify the start index and the end index, separated by a colon, to return a part of the string.",
          },
        ],
        tryItYourself: {
          title: "Example: String Slicing and Methods",
          language: "python",
          starterCode: `s = "  CampusOS Learning Platform  "\nprint("Strip whitespace:", s.strip())\nprint("Uppercase:", s.strip().upper())\nprint("Slice [0:8]:", s.strip()[:8])\nprint("Replace:", s.strip().replace("CampusOS", "NextGen"))`,
          expectedOutput: "Strip whitespace: CampusOS Learning Platform\nUppercase: CAMPUSOS LEARNING PLATFORM\nSlice [0:8]: CampusOS\nReplace: NextGen Learning Platform",
          explanation: "String methods return new strings without modifying the immutable original string.",
        },
        exercise: {
          title: "Exercise: String Length",
          prompt: "Use the correct Python method to get the length of the string 'Hello World'.",
          codeTemplate: `x = "Hello World"\nprint(___(x))`,
          blankAnswer: "len",
          acceptableAnswers: ["len"],
          hint: "Use the built-in len() function.",
          explanation: "len() returns the number of characters in a string or items in a collection.",
          xp: 25,
        },
      },
      {
        id: "python-booleans",
        title: "Python Booleans",
        categoryGroup: "Python Tutorial",
        description: "Booleans represent one of two values: True or False. In programming you often need to know if an expression is True or False.",
        sections: [
          {
            title: "Boolean Values",
            content: "When you compare two values, the expression is evaluated and Python returns the Boolean answer. Most values in Python are evaluated to True if it has some sort of content.",
          },
          {
            title: "Falsy Values",
            content: "Values that evaluate to False include: False, None, 0, \"\" (empty string), () (empty tuple), [] (empty list), {} (empty dictionary).",
          },
        ],
        tryItYourself: {
          title: "Example: Evaluating Truthiness",
          language: "python",
          starterCode: `print("10 > 9:", 10 > 9)\nprint("bool('Hello'):", bool("Hello"))\nprint("bool(0):", bool(0))\nprint("bool([]):", bool([]))\nprint("bool([1, 2]):", bool([1, 2]))`,
          expectedOutput: "10 > 9: True\nbool('Hello'): True\nbool(0): False\nbool([]): False\nbool([1, 2]): True",
          explanation: "The bool() function allows you to evaluate any value, and give you True or False in return.",
        },
        exercise: {
          title: "Exercise: Boolean Comparison",
          prompt: "The statement below would evaluate to what Boolean value: 10 == 9",
          codeTemplate: `print(10 == 9) # Returns: ___`,
          blankAnswer: "False",
          acceptableAnswers: ["False", "false"],
          hint: "Is 10 equal to 9?",
          explanation: "10 does not equal 9, so the equality check returns False.",
          xp: 25,
        },
      },
      {
        id: "python-operators",
        title: "Python Operators",
        categoryGroup: "Python Tutorial",
        description: "Operators are used to perform operations on variables and values.",
        sections: [
          {
            title: "Operator Groups",
            content: "Python divides the operators in the following groups: Arithmetic operators (+, -, *, /, %, **, //), Assignment operators (=, +=, -=), Comparison operators (==, !=, >, <), Logical operators (and, or, not), Identity operators (is, is not), Membership operators (in, not in).",
          },
        ],
        tryItYourself: {
          title: "Example: Operators in Action",
          language: "python",
          starterCode: `x = 17\ny = 5\nprint("Floor Division (//):", x // y)\nprint("Modulus (%):", x % y)\nprint("Exponentiation (**):", 2 ** 8)\n\nfruits = ["apple", "banana"]\nprint("'banana' in fruits:", "banana" in fruits)`,
          expectedOutput: "Floor Division (//): 3\nModulus (%): 2\nExponentiation (**): 256\n'banana' in fruits: True",
          explanation: "Python operators provide concise semantics for arithmetic and collection membership.",
        },
        exercise: {
          title: "Exercise: Multiply",
          prompt: "Multiply 10 with 5, and print the result.",
          codeTemplate: `print(10 ___ 5)`,
          blankAnswer: "*",
          acceptableAnswers: ["*"],
          hint: "The asterisk * is used for multiplication.",
          explanation: "10 * 5 outputs 50 in Python.",
          xp: 25,
        },
      },
      {
        id: "python-lists",
        title: "Python Lists",
        categoryGroup: "Python Tutorial",
        description: "Lists are used to store multiple items in a single variable. Lists are one of 4 built-in data types in Python used to store collections of data.",
        sections: [
          {
            title: "List Items",
            content: "List items are ordered, changeable, and allow duplicate values. List items are indexed, the first item has index [0], the second item has index [1] etc.",
          },
          {
            title: "List Comprehension",
            content: "List comprehension offers a shorter syntax when you want to create a new list based on the values of an existing list: [expression for item in iterable if condition == True]",
          },
        ],
        tryItYourself: {
          title: "Example: Lists and List Comprehensions",
          language: "python",
          starterCode: `fruits = ["apple", "banana", "cherry", "kiwi", "mango"]\nfruits.append("orange")\nprint("Appended List:", fruits)\n\n# Filter fruits with letter 'a'\nwith_a = [f.upper() for f in fruits if "a" in f]\nprint("Filtered & Uppercased:", with_a)`,
          expectedOutput: "Appended List: ['apple', 'banana', 'cherry', 'kiwi', 'mango', 'orange']\nFiltered & Uppercased: ['APPLE', 'BANANA', 'MANGO', 'ORANGE']",
          explanation: "List comprehensions provide an idiomatic, high-performance way to filter and transform sequences.",
        },
        exercise: {
          title: "Exercise: Append to List",
          prompt: "Use the correct method to add 'orange' to the fruits list.",
          codeTemplate: `fruits = ["apple", "banana"]\nfruits.___("orange")`,
          blankAnswer: "append",
          acceptableAnswers: ["append"],
          hint: "Use the append() method to add an item to the end of a list.",
          explanation: "The list.append() method inserts a single element at the end of the list in O(1) amortized time.",
          xp: 30,
        },
      },
      {
        id: "python-tuples",
        title: "Python Tuples",
        categoryGroup: "Python Tutorial",
        description: "Tuples are used to store multiple items in a single variable. A tuple is a collection which is ordered and unchangeable (immutable).",
        sections: [
          {
            title: "Tuple Immutability",
            content: "Tuples are written with round brackets. Tuple items are ordered, unchangeable, and allow duplicate values. Once a tuple is created, you cannot change, add, or remove its items.",
          },
        ],
        tryItYourself: {
          title: "Example: Tuples and Unpacking",
          language: "python",
          starterCode: `point = (10, 20, 30)\nprint("Tuple:", point)\n\n# Unpacking\nx, y, z = point\nprint(f"Unpacked Coordinates -> X: {x}, Y: {y}, Z: {z}")`,
          expectedOutput: "Tuple: (10, 20, 30)\nUnpacked Coordinates -> X: 10, Y: 20, Z: 30",
          explanation: "Tuples ensure data integrity by preventing accidental modifications.",
        },
        exercise: {
          title: "Exercise: Access Tuple Item",
          prompt: "Use the correct syntax to print the first item in the fruits tuple.",
          codeTemplate: `fruits = ("apple", "banana", "cherry")\nprint(fruits[___])`,
          blankAnswer: "0",
          acceptableAnswers: ["0"],
          hint: "Python sequences are zero-indexed.",
          explanation: "fruits[0] accesses the first element 'apple'.",
          xp: 25,
        },
      },
      {
        id: "python-sets",
        title: "Python Sets",
        categoryGroup: "Python Tutorial",
        description: "Sets are used to store multiple items in a single variable. A set is a collection which is unordered, unchangeable*, and unindexed with no duplicate members.",
        sections: [
          {
            title: "Set Operations",
            content: "Sets are written with curly brackets. Sets provide O(1) membership testing and set-theoretic mathematical operations: union (|), intersection (&), and difference (-).",
          },
        ],
        tryItYourself: {
          title: "Example: Set Mathematical Operations",
          language: "python",
          starterCode: `backend_skills = {"Python", "SQL", "Docker", "Git"}\nfrontend_skills = {"JavaScript", "React", "CSS", "Git"}\n\nprint("Union (All Skills):", backend_skills | frontend_skills)\nprint("Intersection (Shared):", backend_skills & frontend_skills)\nprint("Backend Only:", backend_skills - frontend_skills)`,
          expectedOutput: "Union (All Skills): {'CSS', 'Docker', 'Git', 'JavaScript', 'Python', 'React', 'SQL'}\nIntersection (Shared): {'Git'}\nBackend Only: {'Docker', 'Python', 'SQL'}",
          explanation: "Sets utilize hash tables under the hood for instant lookups.",
        },
        exercise: {
          title: "Exercise: Add to Set",
          prompt: "Use the correct method to add an item to a set.",
          codeTemplate: `fruits = {"apple", "banana", "cherry"}\nfruits.___("orange")`,
          blankAnswer: "add",
          acceptableAnswers: ["add"],
          hint: "Sets use add() instead of append().",
          explanation: "The set.add() method inserts an element if it is not already present.",
          xp: 25,
        },
      },
      {
        id: "python-dictionaries",
        title: "Python Dictionaries",
        categoryGroup: "Python Tutorial",
        description: "Dictionaries are used to store data values in key:value pairs. A dictionary is a collection which is ordered (as of Python 3.7), changeable and does not allow duplicate keys.",
        sections: [
          {
            title: "Accessing and Modifying Items",
            content: "You can access the items of a dictionary by referring to its key name, inside square brackets or using the .get() method. The keys(), values(), and items() methods return view objects.",
          },
        ],
        tryItYourself: {
          title: "Example: Dictionary Manipulation",
          language: "python",
          starterCode: `student = {\n    "name": "DemoA",\n    "major": "Computer Science",\n    "gpa": 3.85,\n    "skills": ["Python", "FastAPI", "PostgreSQL"]\n}\n\nstudent["graduation_year"] = 2026\nfor k, v in student.items():\n    print(f"{k:16}: {v}")`,
          expectedOutput: "name            : DemoA\nmajor           : Computer Science\ngpa             : 3.85\nskills          : ['Python', 'FastAPI', 'PostgreSQL']\ngraduation_year : 2026",
          explanation: "Dictionaries are fundamental for representing structured JSON objects in Python.",
        },
        exercise: {
          title: "Exercise: Access Dict Key",
          prompt: "Use the get method to print the value of the 'model' key of the car dictionary.",
          codeTemplate: `car = {"brand": "Ford", "model": "Mustang", "year": 1964}\nprint(car.___("model"))`,
          blankAnswer: "get",
          acceptableAnswers: ["get"],
          hint: "Use the .get() method.",
          explanation: "car.get('model') safely retrieves the value without throwing a KeyError.",
          xp: 25,
        },
      },
      {
        id: "python-ifelse",
        title: "Python If...Else",
        categoryGroup: "Python Tutorial",
        description: "Python conditions and If statements: Python supports the usual logical conditions from mathematics.",
        sections: [
          {
            title: "Elif and Else",
            content: "The elif keyword is Python's way of saying 'if the previous conditions were not true, then try this condition'. The else keyword catches anything which isn't caught by the preceding conditions.",
          },
        ],
        tryItYourself: {
          title: "Example: Decision Logic",
          language: "python",
          starterCode: `score = 88\nif score >= 90:\n    grade = "A+"\nelif score >= 80:\n    grade = "A"\nelif score >= 70:\n    grade = "B"\nelse:\n    grade = "C"\n\nprint(f"Score: {score} -> Grade: {grade}")`,
          expectedOutput: "Score: 88 -> Grade: A",
          explanation: "Conditional branching controls the execution flow based on boolean expressions.",
        },
        exercise: {
          title: "Exercise: Else If Condition",
          prompt: "Fill in the keyword that means 'else if' in Python:",
          codeTemplate: `a = 50\nb = 10\nif a == b:\n    print("1")\n___ a > b:\n    print("2")\nelse:\n    print("3")`,
          blankAnswer: "elif",
          acceptableAnswers: ["elif"],
          hint: "Python uses elif, not else if or elseif.",
          explanation: "The elif keyword allows chaining multiple mutually-exclusive conditions.",
          xp: 25,
        },
      },
      {
        id: "python-whileloops",
        title: "Python While Loops",
        categoryGroup: "Python Tutorial",
        description: "With the while loop we can execute a set of statements as long as a condition is true.",
        sections: [
          {
            title: "Break and Continue",
            content: "With the break statement we can stop the loop even if the while condition is true. With the continue statement we can stop the current iteration, and continue with the next.",
          },
        ],
        tryItYourself: {
          title: "Example: While Loop with Break",
          language: "python",
          starterCode: `i = 1\nwhile i < 10:\n    print(f"Iteration #{i}")\n    if i == 4:\n        print("Breaking loop at i = 4")\n        break\n    i += 1`,
          expectedOutput: "Iteration #1\nIteration #2\nIteration #3\nIteration #4\nBreaking loop at i = 4",
          explanation: "Always remember to increment i, or else the loop will continue forever.",
        },
        exercise: {
          title: "Exercise: Stop Loop",
          prompt: "Stop the loop if i is 3.",
          codeTemplate: `i = 1\nwhile i < 6:\n    if i == 3:\n        ___\n    i += 1`,
          blankAnswer: "break",
          acceptableAnswers: ["break"],
          hint: "Use the break keyword to exit the loop.",
          explanation: "The break keyword immediately terminates the innermost loop.",
          xp: 25,
        },
      },
      {
        id: "python-forloops",
        title: "Python For Loops",
        categoryGroup: "Python Tutorial",
        description: "A for loop is used for iterating over a sequence (that is either a list, a tuple, a dictionary, a set, or a string).",
        sections: [
          {
            title: "The range() Function",
            content: "To loop through a set of code a specified number of times, we can use the range() function. The range() function returns a sequence of numbers, starting from 0 by default, and increments by 1 (by default), and stops before a specified number.",
          },
        ],
        tryItYourself: {
          title: "Example: For Loop and Enumerate",
          language: "python",
          starterCode: `languages = ["Python", "JavaScript", "SQL", "Rust"]\nfor idx, lang in enumerate(languages, start=1):\n    print(f"Track {idx}: {lang}")`,
          expectedOutput: "Track 1: Python\nTrack 2: JavaScript\nTrack 3: SQL\nTrack 4: Rust",
          explanation: "enumerate() provides both the running index and the value during iteration.",
        },
        exercise: {
          title: "Exercise: Loop Range",
          prompt: "Fill in the function to loop through code 6 times (from 0 to 5):",
          codeTemplate: `for x in ___(6):\n    print(x)`,
          blankAnswer: "range",
          acceptableAnswers: ["range"],
          hint: "Use the range() function.",
          explanation: "range(6) produces integers from 0 up to, but not including, 6.",
          xp: 25,
        },
      },
      {
        id: "python-functions",
        title: "Python Functions",
        categoryGroup: "Python Tutorial",
        description: "A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result.",
        sections: [
          {
            title: "Creating and Calling a Function",
            content: "In Python a function is defined using the def keyword. To call a function, use the function name followed by parenthesis.",
            codeSnippet: {
              language: "python",
              code: "def my_function():\n    print('Hello from a function')\n\nmy_function()",
            },
          },
          {
            title: "Arguments and Arbitrary Args (*args, **kwargs)",
            content: "Information can be passed into functions as arguments. If you do not know how many arguments that will be passed into your function, add a * before the parameter name in the function definition.",
          },
        ],
        tryItYourself: {
          title: "Example: Functions with Return Values and *args",
          language: "python",
          starterCode: `def calculate_ats_score(*skills, base_gpa=3.5):\n    score = int(base_gpa * 20) + len(skills) * 5\n    return min(score, 98)\n\nprint("Score for DemoA:", calculate_ats_score("Python", "RAG", "SQL", "Next.js"))`,
          expectedOutput: "Score for DemoA: 90",
          explanation: "Functions encapsulate business logic and enable clean code reuse.",
        },
        exercise: {
          title: "Exercise: Define Function",
          prompt: "Fill in the keyword used to declare a function in Python:",
          codeTemplate: `___ my_function():\n    print("Hello World")`,
          blankAnswer: "def",
          acceptableAnswers: ["def"],
          hint: "The keyword is short for 'define'.",
          explanation: "In Python, 'def' is the reserved keyword used to define functions.",
          xp: 25,
        },
      },
      {
        id: "python-lambda",
        title: "Python Lambda",
        categoryGroup: "Python Tutorial",
        description: "A lambda function is a small anonymous function. A lambda function can take any number of arguments, but can only have one expression.",
        sections: [
          {
            title: "Syntax",
            content: "lambda arguments : expression. The expression is executed and the result is returned.",
            codeSnippet: {
              language: "python",
              code: "x = lambda a, b : a * b\nprint(x(5, 6)) # prints 30",
            },
          },
        ],
        tryItYourself: {
          title: "Example: Lambda with Sorting",
          language: "python",
          starterCode: `candidates = [\n    {"name": "DemoA", "score": 92},\n    {"name": "Demo_B", "score": 96},\n    {"name": "Demo", "score": 88}\n]\n\nsorted_candidates = sorted(candidates, key=lambda c: c["score"], reverse=True)\nfor c in sorted_candidates:\n    print(f"{c['name']:10}: {c['score']}%")`,
          expectedOutput: "Demo_B    : 96%\nDemoA     : 92%\nDemo      : 88%",
          explanation: "Lambdas are frequently passed as sorting key functions or mapping functions.",
        },
        exercise: {
          title: "Exercise: Lambda Expression",
          prompt: "Fill in the keyword to create an anonymous function that adds 10 to a:",
          codeTemplate: `add_ten = ___ a : a + 10\nprint(add_ten(5))`,
          blankAnswer: "lambda",
          acceptableAnswers: ["lambda"],
          hint: "The keyword is lambda.",
          explanation: "lambda allows inline creation of anonymous single-expression functions.",
          xp: 25,
        },
      },
      {
        id: "python-classes",
        title: "Python Classes/Objects",
        categoryGroup: "Python Tutorial",
        description: "Python is an object oriented programming language. Almost everything in Python is an object, with its properties and methods. A Class is like an object constructor, or a 'blueprint' for creating objects.",
        sections: [
          {
            title: "The __init__() Function",
            content: "All classes have a function called __init__(), which is always executed when the class is being initiated. Use the __init__() function to assign values to object properties, or other operations that are necessary to do when the object is being created.",
          },
          {
            title: "The self Parameter",
            content: "The self parameter is a reference to the current instance of the class, and is used to access variables that belong to the class.",
          },
        ],
        tryItYourself: {
          title: "Example: OOP Class & Methods",
          language: "python",
          starterCode: `class Student:\n    def __init__(self, name, department, cgpa):\n        self.name = name\n        self.department = department\n        self.cgpa = cgpa\n\n    def get_honors(self):\n        return "Dean's List" if self.cgpa >= 3.8 else "Standard Honors"\n\ns = Student("DemoA User", "Computer Science", 3.85)\nprint(f"Student: {s.name} ({s.department}) - {s.get_honors()}")`,
          expectedOutput: "Student: DemoA User (Computer Science) - Dean's List",
          explanation: "Classes encapsulate state and behavior into cohesive objects.",
        },
        exercise: {
          title: "Exercise: Class Constructor",
          prompt: "What is the name of the special method called automatically when creating an object?",
          codeTemplate: `class Person:\n    def ___(self, name):\n        self.name = name`,
          blankAnswer: "__init__",
          acceptableAnswers: ["__init__", "__init__(self)"],
          hint: "Surrounded by double underscores before and after 'init'.",
          explanation: "The __init__ method is Python's instance initializer constructor.",
          xp: 30,
        },
      },
      {
        id: "python-inheritance",
        title: "Python Inheritance",
        categoryGroup: "Python Tutorial",
        description: "Inheritance allows us to define a class that inherits all the methods and properties from another class. Parent class is the class being inherited from. Child class is the class that inherits from another class.",
        sections: [
          {
            title: "The super() Function",
            content: "Python also has a super() function that will make the child class inherit all the methods and properties from its parent, without explicitly naming the parent class.",
          },
        ],
        tryItYourself: {
          title: "Example: Inheritance with super()",
          language: "python",
          starterCode: `class User:\n    def __init__(self, username, email):\n        self.username = username\n        self.email = email\n\nclass Instructor(User):\n    def __init__(self, username, email, courses):\n        super().__init__(username, email)\n        self.courses = courses\n\nprof = Instructor("example_teacher", "teacher@example.invalid", ["CS101", "AI405"])\nprint(f"Professor {prof.username} teaches: {', '.join(prof.courses)}")`,
          expectedOutput: "Professor example_teacher teaches: CS101, AI405",
          explanation: "super() delegates constructor calls up the Method Resolution Order (MRO).",
        },
        exercise: {
          title: "Exercise: Inherit Class",
          prompt: "Fill in the syntax so Student inherits from Person:",
          codeTemplate: `class Student(___):\n    pass`,
          blankAnswer: "Person",
          acceptableAnswers: ["Person"],
          hint: "Put the parent class name inside parentheses.",
          explanation: "Inheritance syntax passes the base class name inside the parenthesis.",
          xp: 25,
        },
      },
      {
        id: "python-modules",
        title: "Python Modules",
        categoryGroup: "Python Tutorial",
        description: "Consider a module to be the same as a code library. A file containing a set of functions you want to include in your application.",
        sections: [
          {
            title: "Using a Module",
            content: "Now we can use the module we just created, by using the import statement. You can create an alias when you import a module, by using the as keyword.",
          },
        ],
        tryItYourself: {
          title: "Example: Math and Random Modules",
          language: "python",
          starterCode: `import math\n\nradius = 5\narea = math.pi * math.pow(radius, 2)\nprint(f"Circle Area with r={radius}: {area:.2f}")\nprint("Ceil of 4.2:", math.ceil(4.2))\nprint("Sqrt of 64:", math.sqrt(64))`,
          expectedOutput: "Circle Area with r=5: 78.54\nCeil of 4.2: 5\nSqrt of 64: 8.0",
          explanation: "Modules organize standard library functions and 3rd party packages.",
        },
        exercise: {
          title: "Exercise: Import Module",
          prompt: "Import the built-in json module:",
          codeTemplate: `___ json`,
          blankAnswer: "import",
          acceptableAnswers: ["import"],
          hint: "Use the import keyword.",
          explanation: "The 'import' keyword brings modules into the current namespace.",
          xp: 25,
        },
      },
      {
        id: "python-tryexcept",
        title: "Python Try...Except",
        categoryGroup: "Python Tutorial",
        description: "The try block lets you test a block of code for errors. The except block lets you handle the error. The else block lets you execute code when there is no error. The finally block lets you execute code, regardless of the result of the try- and except blocks.",
        sections: [
          {
            title: "Exception Handling",
            content: "When an error occurs, or exception as we call it, Python will normally stop and generate an error message. These exceptions can be handled using the try statement.",
          },
        ],
        tryItYourself: {
          title: "Example: Robust Error Handling",
          language: "python",
          starterCode: `def safe_divide(a, b):\n    try:\n        result = a / b\n    except ZeroDivisionError:\n        return "Error: Cannot divide by zero!"\n    except TypeError as e:\n        return f"Error: Invalid type ({e})"\n    else:\n        return f"Success: {result}"\n    finally:\n        # Runs always\n        pass\n\nprint(safe_divide(10, 2))\nprint(safe_divide(10, 0))`,
          expectedOutput: "Success: 5.0\nError: Cannot divide by zero!",
          explanation: "try-except guards your program from unexpected crashes.",
        },
        exercise: {
          title: "Exercise: Handle Exception",
          prompt: "Fill in the keyword that catches errors in a try block:",
          codeTemplate: `try:\n    print(x)\n___:\n    print("An exception occurred")`,
          blankAnswer: "except",
          acceptableAnswers: ["except"],
          hint: "Use except to catch exceptions.",
          explanation: "The except block catches and processes exceptions raised in the try block.",
          xp: 25,
        },
      },
      {
        id: "python-arrays",
        title: "Python Arrays",
        categoryGroup: "Python Tutorial",
        description: "Python does not have built-in support for Arrays, but Python Lists can be used instead. For scientific computing, the NumPy library is widely used.",
        sections: [
          {
            title: "Arrays vs Lists",
            content: "Arrays are used to store multiple values in one single variable. To work with arrays in Python you can import a library, like the NumPy library, or use Python's built-in list type.",
          },
        ],
        tryItYourself: {
          title: "Example: Working with Arrays/Lists",
          language: "python",
          starterCode: `cars = ["Ford", "Volvo", "BMW"]\ncars.append("Honda")\nprint("Cars count:", len(cars))\nfor c in cars:\n    print("-", c)`,
          expectedOutput: "Cars count: 4\n- Ford\n- Volvo\n- BMW\n- Honda",
          explanation: "Lists are dynamic arrays in Python with O(1) amortized append.",
        },
        exercise: {
          title: "Exercise: Remove Array Item",
          prompt: "Delete the second item in the cars list using pop():",
          codeTemplate: `cars = ["Ford", "Volvo", "BMW"]\ncars.___(1)`,
          blankAnswer: "pop",
          acceptableAnswers: ["pop"],
          hint: "Use the pop() method with index 1.",
          explanation: "list.pop(index) removes and returns the element at the specified index.",
          xp: 25,
        },
      },
      {
        id: "python-iterators",
        title: "Python Iterators",
        categoryGroup: "Python Tutorial",
        description: "An iterator is an object that contains a countable number of values. An iterator is an object that can be iterated upon, meaning that you can traverse through all the values.",
        sections: [
          {
            title: "Iterator vs Iterable",
            content: "Technically, in Python, an iterator is an object which implements the iterator protocol, which consist of the methods __iter__() and __next__().",
          },
        ],
        tryItYourself: {
          title: "Example: Using iter() and next()",
          language: "python",
          starterCode: `mytuple = ("apple", "banana", "cherry")\nmyit = iter(mytuple)\nprint(next(myit))\nprint(next(myit))\nprint(next(myit))`,
          expectedOutput: "apple\nbanana\ncherry",
          explanation: "The next() function retrieves the next sequential item from an iterator.",
        },
        exercise: {
          title: "Exercise: Next Item",
          prompt: "Fill in the built-in function to advance an iterator:",
          codeTemplate: `print(___(myit))`,
          blankAnswer: "next",
          acceptableAnswers: ["next"],
          hint: "The function is next().",
          explanation: "next() calls the __next__() method on the iterator.",
          xp: 25,
        },
      },
      {
        id: "python-polymorphism",
        title: "Python Polymorphism",
        categoryGroup: "Python Tutorial",
        description: "The word 'polymorphism' means 'many forms', and in programming it refers to methods/functions/operators with the same name that can be executed on many objects or classes.",
        sections: [
          {
            title: "Class Polymorphism",
            content: "Polymorphism is often used in Class methods, where we can have multiple classes with the same method name.",
          },
        ],
        tryItYourself: {
          title: "Example: Polymorphic Method Call",
          language: "python",
          starterCode: `class Car:\n    def move(self):\n        return "Drive!"\nclass Boat:\n    def move(self):\n        return "Sail!"\nclass Plane:\n    def move(self):\n        return "Fly!"\n\nfor vehicle in (Car(), Boat(), Plane()):\n    print(vehicle.move())`,
          expectedOutput: "Drive!\nSail!\nFly!",
          explanation: "Duck typing in Python allows invoking the same method on diverse classes.",
        },
        exercise: {
          title: "Exercise: Len Polymorphism",
          prompt: "Which built-in function demonstrates polymorphism by returning length for strings, lists, and dicts?",
          codeTemplate: `size = ___(collection)`,
          blankAnswer: "len",
          acceptableAnswers: ["len"],
          hint: "len() works on many data structures.",
          explanation: "len() delegates to an object's __len__() method polymorphically.",
          xp: 25,
        },
      },
      {
        id: "python-scope",
        title: "Python Scope",
        categoryGroup: "Python Tutorial",
        description: "A variable is only available from inside the region it is created. This is called scope.",
        sections: [
          {
            title: "Local vs Global Scope",
            content: "A variable created inside a function belongs to the local scope of that function, and can only be used inside that function. A variable created in the main body of the Python code is a global variable. If you need to create a global variable, but are stuck in the local scope, you can use the global keyword.",
          },
        ],
        tryItYourself: {
          title: "Example: Global Keyword",
          language: "python",
          starterCode: `x = 300\ndef myfunc():\n    global x\n    x = 200\n\nmyfunc()\nprint("Global x modified inside function:", x)`,
          expectedOutput: "Global x modified inside function: 200",
          explanation: "The global keyword binds the local variable reference to the module-level global namespace.",
        },
        exercise: {
          title: "Exercise: Declare Global",
          prompt: "Fill in the keyword to make a variable inside a function belong to the global scope:",
          codeTemplate: `def myfunc():\n    ___ x\n    x = "fantastic"`,
          blankAnswer: "global",
          acceptableAnswers: ["global"],
          hint: "The keyword is global.",
          explanation: "The global statement declares that listing identifiers refer to global variables.",
          xp: 25,
        },
      },
      {
        id: "python-dates",
        title: "Python Dates",
        categoryGroup: "Python Tutorial",
        description: "A date in Python is not a data type of its own, but we can import a module named datetime to work with dates as date objects.",
        sections: [
          {
            title: "The datetime Module",
            content: "Import the datetime module and display the current date and time using datetime.datetime.now(). You can format dates using strftime().",
          },
        ],
        tryItYourself: {
          title: "Example: Formatting Dates",
          language: "python",
          starterCode: `import datetime\n\n# Simulated fixed date for consistent output\nx = datetime.datetime(2026, 10, 22, 12, 0, 0)\nprint("Year:", x.year)\nprint("Formatted (strftime):", x.strftime("%B %d, %Y"))\nprint("Day of week:", x.strftime("%A"))`,
          expectedOutput: "Year: 2026\nFormatted (strftime): October 22, 2026\nDay of week: Thursday",
          explanation: "strftime directives like %B and %Y format datetime objects into custom strings.",
        },
        exercise: {
          title: "Exercise: Current Date",
          prompt: "Fill in the module and method to get the current datetime:",
          codeTemplate: `import datetime\nnow = datetime.datetime.___()`,
          blankAnswer: "now",
          acceptableAnswers: ["now", "now()"],
          hint: "The method is now().",
          explanation: "datetime.datetime.now() returns the current local date and time.",
          xp: 25,
        },
      },
      {
        id: "python-math",
        title: "Python Math",
        categoryGroup: "Python Tutorial",
        description: "Python has a set of built-in math functions, including an extensive math module, that allows you to perform mathematical tasks on numbers.",
        sections: [
          {
            title: "Built-in Math Functions vs math Module",
            content: "The min() and max() functions can be used to find the lowest or highest value. The abs() function returns the absolute (positive) value. The pow(x, y) function returns the value of x to the power of y.",
          },
        ],
        tryItYourself: {
          title: "Example: Mathematical Calculations",
          language: "python",
          starterCode: `import math\n\nprint("Square root of 81:", math.sqrt(81))\nprint("Round upwards (ceil 1.4):", math.ceil(1.4))\nprint("Round downwards (floor 1.4):", math.floor(1.4))\nprint("PI constant:", round(math.pi, 4))`,
          expectedOutput: "Square root of 81: 9.0\nRound upwards (ceil 1.4): 2\nRound downwards (floor 1.4): 1\nPI constant: 3.1416",
          explanation: "math.ceil() rounds up and math.floor() rounds down to the nearest integer.",
        },
        exercise: {
          title: "Exercise: Square Root",
          prompt: "Fill in the math module method to calculate the square root of 64:",
          codeTemplate: `import math\nx = math.___(64)`,
          blankAnswer: "sqrt",
          acceptableAnswers: ["sqrt"],
          hint: "Short for square root.",
          explanation: "math.sqrt(x) computes the square root of non-negative number x.",
          xp: 25,
        },
      },
      {
        id: "python-json",
        title: "Python JSON",
        categoryGroup: "Python Tutorial",
        description: "JSON is a syntax for storing and exchanging data. JSON is text, written with JavaScript object notation. Python has a built-in package called json, which can be used to work with JSON data.",
        sections: [
          {
            title: "Parse JSON - Convert from JSON to Python (loads)",
            content: "If you have a JSON string, you can parse it by using the json.loads() method. The result will be a Python dictionary.",
          },
          {
            title: "Convert from Python to JSON (dumps)",
            content: "If you have a Python object, you can convert it into a JSON string by using the json.dumps() method.",
          },
        ],
        tryItYourself: {
          title: "Example: JSON Serialization and Deserialization",
          language: "python",
          starterCode: `import json\n\n# Python dict to JSON\nuser_data = {"name": "DemoA", "cgpa": 3.85, "active": True}\njson_str = json.dumps(user_data, indent=2)\nprint("Serialized JSON:\\n" + json_str)\n\n# JSON to Python dict\nparsed = json.loads(json_str)\nprint("Parsed GPA:", parsed["cgpa"])`,
          expectedOutput: "Serialized JSON:\n{\n  \"name\": \"DemoA\",\n  \"cgpa\": 3.85,\n  \"active\": true\n}\nParsed GPA: 3.85",
          explanation: "json.loads parses string to dict; json.dumps serializes dict to JSON string.",
        },
        exercise: {
          title: "Exercise: JSON to Python",
          prompt: "Use the json method to convert a JSON string into a Python dictionary:",
          codeTemplate: `import json\nperson = json.___('{"name": "Example Person", "age": 30}')`,
          blankAnswer: "loads",
          acceptableAnswers: ["loads"],
          hint: "loads stands for load string.",
          explanation: "json.loads() parses valid JSON string input into Python objects.",
          xp: 25,
        },
      },
      {
        id: "python-regex",
        title: "Python RegEx",
        categoryGroup: "Python Tutorial",
        description: "A RegEx, or Regular Expression, is a sequence of characters that forms a search pattern. RegEx can be used to check if a string contains the specified search pattern.",
        sections: [
          {
            title: "The re Module",
            content: "Python has a built-in package called re, which can be used to work with Regular Expressions: findall, search, split, sub.",
          },
        ],
        tryItYourself: {
          title: "Example: Pattern Matching with re",
          language: "python",
          starterCode: `import re\n\ntext = "Contact us at support@example.invalid or admissions@example.invalid"\nemails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', text)\nprint("Found Email Addresses:", emails)`,
          expectedOutput: "Found Email Addresses: ['support@example.invalid', 'admissions@example.invalid']",
          explanation: "re.findall() returns a list containing all matches of the pattern.",
        },
        exercise: {
          title: "Exercise: Find All Matches",
          prompt: "Fill in the re function that returns a list of all matches in a string:",
          codeTemplate: `import re\nx = re.___("ai", "The rain in Spain")`,
          blankAnswer: "findall",
          acceptableAnswers: ["findall"],
          hint: "The function name is findall.",
          explanation: "re.findall() returns all non-overlapping matches of pattern in string.",
          xp: 25,
        },
      },
      {
        id: "python-pip",
        title: "Python PIP",
        categoryGroup: "Python Tutorial",
        description: "PIP is a package manager for Python packages, or modules if you like. A package contains all the files you need for a module.",
        sections: [
          {
            title: "Download a Package",
            content: "Downloading a package is very easy. Open the command line interface and tell PIP to download the package you want: pip install camelcase.",
            terminalCommand: "C:\\Users\\Your Name>pip install camelcase",
            terminalOutput: "Successfully installed camelcase-0.2",
          },
        ],
        tryItYourself: {
          title: "Example: Package Installation Simulation",
          language: "python",
          starterCode: `# Simulation of pip installed packages\ninstalled_packages = ["numpy", "pandas", "fastapi", "pytest"]\nprint("Installed PIP Packages:")\nfor p in installed_packages:\n    print(f" - {p}")`,
          expectedOutput: "Installed PIP Packages:\n - numpy\n - pandas\n - fastapi\n - pytest",
          explanation: "PIP connects to the Python Package Index (PyPI) to install community libraries.",
        },
        exercise: {
          title: "Exercise: PIP Command",
          prompt: "Fill in the PIP sub-command to install a package named requests:",
          codeTemplate: `pip ___ requests`,
          blankAnswer: "install",
          acceptableAnswers: ["install"],
          hint: "The keyword is install.",
          explanation: "pip install <package_name> downloads and installs a library from PyPI.",
          xp: 25,
        },
      },
      {
        id: "python-userinput",
        title: "Python User Input",
        categoryGroup: "Python Tutorial",
        description: "Python allows for user input. That means we are able to ask the user for input. The method is a bit different in Python 3.6 than Python 2.7. Python 3.6 uses the input() method.",
        sections: [
          {
            title: "The input() Function",
            content: "Use the input() function to prompt the user for input. Notice that input() always returns a string; cast with int() or float() if numerical input is needed.",
          },
        ],
        tryItYourself: {
          title: "Example: User Input Simulation",
          language: "python",
          starterCode: `# Simulating user input in browser environment\nsimulated_input = "DemoA User"\nprint(f"Enter username: {simulated_input}")\nprint(f"Hello, {simulated_input}! Welcome to CampusOS.")`,
          expectedOutput: "Enter username: DemoA User\nHello, DemoA User! Welcome to CampusOS.",
          explanation: "input(prompt) pauses execution and reads a line from input.",
        },
        exercise: {
          title: "Exercise: Read Input",
          prompt: "Fill in the function to ask the user for their name:",
          codeTemplate: `username = ___("Enter your username: ")`,
          blankAnswer: "input",
          acceptableAnswers: ["input"],
          hint: "The function is input().",
          explanation: "input() displays the prompt and returns the user's keystrokes as a string.",
          xp: 25,
        },
      },
      {
        id: "python-stringformatting",
        title: "Python String Formatting",
        categoryGroup: "Python Tutorial",
        description: "To make sure a string will display as expected, we can format the result with the format() method or modern f-strings.",
        sections: [
          {
            title: "F-Strings (Python 3.6+)",
            content: "F-string allows you to format selected parts of a string. To specify a string as an f-string, simply put an f in front of the string literal, and add curly brackets {} as placeholders for variables.",
          },
        ],
        tryItYourself: {
          title: "Example: Formatted Currency and Percentages",
          language: "python",
          starterCode: `price = 49.95\nquantity = 3\ntax_rate = 0.08\ntotal = price * quantity * (1 + tax_rate)\nprint(f"Total Invoice: \${total:.2f}")`,
          expectedOutput: "Total Invoice: $161.84",
          explanation: ":.2f inside an f-string rounds the float to 2 decimal places.",
        },
        exercise: {
          title: "Exercise: Format with F-string",
          prompt: "Insert the correct prefix character to make this string an f-string:",
          codeTemplate: `age = 22\ntxt = ___"My name is John, and I am {age}"`,
          blankAnswer: "f",
          acceptableAnswers: ["f", "F"],
          hint: "The single character f.",
          explanation: "f prefix denotes a formatted string literal in Python 3.6+.",
          xp: 25,
        },
      },
      {
        id: "python-filehandling",
        title: "Python File Handling",
        categoryGroup: "Python Tutorial",
        description: "File handling is an important part of any web application. Python has several functions for creating, reading, updating, and deleting files.",
        sections: [
          {
            title: "The open() Function",
            content: "The key function for working with files in Python is the open() function. The open() function takes two parameters: filename, and mode: 'r' (Read), 'a' (Append), 'w' (Write), 'x' (Create).",
          },
          {
            title: "Context Manager (with open)",
            content: "The best practice in modern Python is using a with statement context manager, which guarantees the file descriptor will be closed even if exceptions occur.",
          },
        ],
        tryItYourself: {
          title: "Example: Simulating File Operations",
          language: "python",
          starterCode: `# Context manager simulation\ndata = ["Line 1: CampusOS Architecture\\n", "Line 2: RAG Vector Pipeline\\n"]\ncontent = "".join(data)\n\nprint("File Content Read:")\nprint(content.strip())\nprint(f"Total Bytes: {len(content)}")`,
          expectedOutput: "File Content Read:\nLine 1: CampusOS Architecture\nLine 2: RAG Vector Pipeline\nTotal Bytes: 53",
          explanation: "'with open()' automatically cleans up system resources.",
        },
        exercise: {
          title: "Exercise: Open File for Reading",
          prompt: "Fill in the open mode character to open a file for reading:",
          codeTemplate: `f = open("demofile.txt", "___")`,
          blankAnswer: "r",
          acceptableAnswers: ["r"],
          hint: "'r' stands for read.",
          explanation: "'r' opens a file for reading and throws an error if the file does not exist.",
          xp: 25,
        },
      },
    ],
  },

  // =========================================================================
  // 2. JAVASCRIPT COURSE (Exact W3Schools Curriculum)
  // =========================================================================
  {
    id: "javascript",
    name: "JavaScript",
    tabLabel: "JAVASCRIPT",
    tagline: "The world's most popular client-side and full-stack web programming language.",
    sidebarTitle: "JAVASCRIPT TUTORIAL",
    categoryBadge: "Frontend & Full-Stack",
    accentColor: "#F7DF1E",
    chapters: [
      {
        id: "js-home",
        title: "JS HOME",
        categoryGroup: "JS Tutorial",
        description: "JavaScript is the world's most popular programming language. JavaScript is the programming language of the Web. JavaScript is easy to learn.",
        sections: [
          {
            title: "Why Study JavaScript?",
            content: "JavaScript is one of the 3 languages all web developers must learn: 1. HTML to define the content of web pages. 2. CSS to specify the layout of web pages. 3. JavaScript to program the behavior of web pages.",
          },
        ],
        tryItYourself: {
          title: "Example: First JavaScript Program",
          language: "javascript",
          starterCode: `console.log("Hello, World!");\nconst message = "Welcome to CampusOS W3 Interactive JavaScript Track!";\nconsole.log(message);`,
          expectedOutput: "Hello, World!\nWelcome to CampusOS W3 Interactive JavaScript Track!",
          explanation: "console.log() writes output directly to the browser console or terminal.",
        },
        exercise: {
          title: "Exercise: Console Log",
          prompt: "Use console.log to print 'Hello World' in JavaScript:",
          codeTemplate: `console.___("Hello World");`,
          blankAnswer: "log",
          acceptableAnswers: ["log"],
          hint: "Use the log method on console.",
          explanation: "console.log() is the standard method to output messages to the console.",
          xp: 25,
        },
      },
      {
        id: "js-intro",
        title: "JS Introduction",
        categoryGroup: "JS Tutorial",
        description: "JavaScript Can Change HTML Content. One of many JavaScript HTML methods is getElementById().",
        sections: [
          {
            title: "JavaScript Can Change HTML Styles (CSS)",
            content: "Changing the style of an HTML element is an extension of changing an HTML attribute. JavaScript can change styles, hide elements, and show hidden elements.",
            codeSnippet: {
              language: "javascript",
              code: "document.getElementById('demo').style.fontSize = '35px';",
            },
          },
        ],
        tryItYourself: {
          title: "Example: DOM Manipulation",
          language: "javascript",
          starterCode: `const mockElement = { innerHTML: "Original Text", style: {} };\nmockElement.innerHTML = "Hello JavaScript!";\nmockElement.style.color = "#6653E6";\nconsole.log("Updated Element Content:", mockElement.innerHTML);\nconsole.log("Updated Style Color:", mockElement.style.color);`,
          expectedOutput: "Updated Element Content: Hello JavaScript!\nUpdated Style Color: #6653E6",
          explanation: "JavaScript dynamically updates the Document Object Model (DOM) in real-time.",
        },
        exercise: {
          title: "Exercise: Select Element by ID",
          prompt: "Fill in the DOM method to select an element with id='demo':",
          codeTemplate: `document.getElementById("___")`,
          blankAnswer: "demo",
          acceptableAnswers: ["demo"],
          hint: "The id specified in the prompt is demo.",
          explanation: "document.getElementById searches the document for an element matching the given id.",
          xp: 25,
        },
      },
      {
        id: "js-variables",
        title: "JS Variables (let & const)",
        categoryGroup: "JS Tutorial",
        description: "Variables are containers for storing data. JavaScript variables can be declared in 4 ways: automatically, using var, using let, or using const.",
        sections: [
          {
            title: "When to use let vs const",
            content: "Always declare variables with const unless you know that the value will change. Use let when you cannot use const (e.g. if the value will change, like a loop counter). Always prefer const and let over legacy var.",
          },
        ],
        tryItYourself: {
          title: "Example: const and let",
          language: "javascript",
          starterCode: `const PI = 3.14159;\nlet radius = 10;\nlet area = PI * radius * radius;\nconsole.log("Radius:", radius, "-> Circle Area:", area);\n\nradius = 20; // Reassigning let is allowed\narea = PI * radius * radius;\nconsole.log("New Radius:", radius, "-> New Area:", area);`,
          expectedOutput: "Radius: 10 -> Circle Area: 314.159\nNew Radius: 20 -> New Area: 1256.636",
          explanation: "const variables cannot be reassigned, while let variables can.",
        },
        exercise: {
          title: "Exercise: Constant Variable",
          prompt: "Create a variable called price that cannot be reassigned with value 50:",
          codeTemplate: `___ price = 50;`,
          blankAnswer: "const",
          acceptableAnswers: ["const"],
          hint: "Use the const keyword.",
          explanation: "The const keyword defines a block-scoped, immutable variable binding.",
          xp: 25,
        },
      },
      {
        id: "js-operators",
        title: "JS Operators",
        categoryGroup: "JS Tutorial",
        description: "JavaScript operators are used to assign values, compare values, perform arithmetic operations, and more.",
        sections: [
          {
            title: "Strict Equality (===) vs Loose Equality (==)",
            content: "Always use strict equality (===) which checks both value and type without coercion, avoiding bugs caused by type coercion with ==.",
          },
        ],
        tryItYourself: {
          title: "Example: Strict vs Loose Equality",
          language: "javascript",
          starterCode: `console.log("5 == '5':", 5 == '5');   // true (type coercion)\nconsole.log("5 === '5':", 5 === '5'); // false (different types)\nconsole.log("null === undefined:", null === undefined);`,
          expectedOutput: "5 == '5': true\n5 === '5': false\nnull === undefined: false",
          explanation: "Strict equality (===) ensures robust, bug-free type-safe comparisons.",
        },
        exercise: {
          title: "Exercise: Strict Equality",
          prompt: "Fill in the operator that tests for equal value AND equal type:",
          codeTemplate: `let isEqual = (x ___ y);`,
          blankAnswer: "===",
          acceptableAnswers: ["==="],
          hint: "Three equals signs.",
          explanation: "=== is the strict equality comparison operator in JavaScript.",
          xp: 25,
        },
      },
      {
        id: "js-functions",
        title: "JS Functions",
        categoryGroup: "JS Tutorial",
        description: "A JavaScript function is a block of code designed to perform a particular task. A JavaScript function is executed when 'something' invokes it (calls it).",
        sections: [
          {
            title: "Function Syntax",
            content: "A JavaScript function is defined with the function keyword, followed by a name, followed by parentheses (). Function parameters are listed inside the parentheses in the function definition.",
          },
        ],
        tryItYourself: {
          title: "Example: Standard and Arrow Functions",
          language: "javascript",
          starterCode: `// Standard function\nfunction add(a, b) {\n  return a + b;\n}\n\n// ES6 Arrow function\nconst multiply = (a, b) => a * b;\n\nconsole.log("Add 15 + 25:", add(15, 25));\nconsole.log("Multiply 6 * 7:", multiply(6, 7));`,
          expectedOutput: "Add 15 + 25: 40\nMultiply 6 * 7: 42",
          explanation: "Arrow functions provide a concise syntax and lexical 'this' binding.",
        },
        exercise: {
          title: "Exercise: Arrow Function",
          prompt: "Complete the arrow function syntax:",
          codeTemplate: `const greet = (name) ___ \`Hello \${name}\`;`,
          blankAnswer: "=>",
          acceptableAnswers: ["=>"],
          hint: "The fat arrow operator.",
          explanation: "The fat arrow => defines an arrow function expression.",
          xp: 25,
        },
      },
      {
        id: "js-objects",
        title: "JS Objects",
        categoryGroup: "JS Tutorial",
        description: "In JavaScript, objects are king. If You Understand Objects, you Understand JavaScript.",
        sections: [
          {
            title: "Object Properties and Methods",
            content: "Objects are variables too. But objects can contain many values. The values are written as name:value pairs. A method is a function stored as a property.",
          },
        ],
        tryItYourself: {
          title: "Example: Object with Methods",
          language: "javascript",
          starterCode: `const student = {\n  firstName: "DemoA",\n  lastName: "User",\n  gpa: 3.85,\n  fullName() {\n    return this.firstName + " " + this.lastName;\n  }\n};\n\nconsole.log("Full Name:", student.fullName());\nconsole.log("GPA:", student.gpa);`,
          expectedOutput: "Full Name: DemoA User\nGPA: 3.85",
          explanation: "In a function definition, 'this' refers to the 'owner' of the function.",
        },
        exercise: {
          title: "Exercise: Access Object Property",
          prompt: "Access the age property of the person object:",
          codeTemplate: `const person = { name: "Example Person", age: 50 };\nconsole.log(person.___);`,
          blankAnswer: "age",
          acceptableAnswers: ["age"],
          hint: "Use dot notation.",
          explanation: "person.age accesses the value 50 stored under the 'age' key.",
          xp: 25,
        },
      },
      {
        id: "js-arrays",
        title: "JS Arrays & Methods",
        categoryGroup: "JS Tutorial",
        description: "An array is a special variable, which can hold more than one value. Array methods like map, filter, and reduce are the backbone of modern JavaScript and React.",
        sections: [
          {
            title: "Modern Array Methods",
            content: "map() creates a new array by performing a function on each element. filter() creates a new array with array elements that pass a test. reduce() runs a function on each array element to produce a single value.",
          },
        ],
        tryItYourself: {
          title: "Example: Map, Filter, and Reduce",
          language: "javascript",
          starterCode: `const scores = [65, 82, 94, 76, 89, 95];\n\nconst highScores = scores.filter(s => s >= 85);\nconsole.log("High Scores (>= 85):", highScores);\n\nconst total = scores.reduce((sum, s) => sum + s, 0);\nconst avg = (total / scores.length).toFixed(1);\nconsole.log("Average Score:", avg);`,
          expectedOutput: "High Scores (>= 85): [ 94, 89, 95 ]\nAverage Score: 83.5",
          explanation: "Functional array methods avoid mutative side effects.",
        },
        exercise: {
          title: "Exercise: Array Filter",
          prompt: "Fill in the array method used to keep only elements meeting a condition:",
          codeTemplate: `const evens = numbers.___(n => n % 2 === 0);`,
          blankAnswer: "filter",
          acceptableAnswers: ["filter"],
          hint: "Use the filter method.",
          explanation: "Array.prototype.filter creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test.",
          xp: 25,
        },
      },
    ],
  },

  // =========================================================================
  // 3. HTML / HTML5 COURSE (Exact W3Schools Curriculum)
  // =========================================================================
  {
    id: "html",
    name: "HTML5",
    tabLabel: "HTML",
    tagline: "The foundational markup language for structuring every website on the Internet.",
    sidebarTitle: "HTML TUTORIAL",
    categoryBadge: "Web Foundations",
    accentColor: "#E34F26",
    chapters: [
      {
        id: "html-home",
        title: "HTML HOME",
        categoryGroup: "HTML Tutorial",
        description: "HTML is the standard markup language for Web pages. With HTML you can create your own Website. HTML is easy to learn - You will enjoy it!",
        sections: [
          {
            title: "Easy Learning with HTML 'Try it Yourself'",
            content: "With our online HTML editor, you can edit the HTML, and click on a button to view the result immediately in real time.",
          },
        ],
        tryItYourself: {
          title: "Example: Basic HTML Document",
          language: "html",
          starterCode: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n  <p>My first paragraph.</p>\n</body>\n</html>`,
          expectedOutput: "My First Heading\nMy first paragraph.",
          explanation: "The <!DOCTYPE html> declaration defines that this document is an HTML5 document.",
        },
        exercise: {
          title: "Exercise: Main Heading Tag",
          prompt: "Insert the correct tag for the most important heading on a page:",
          codeTemplate: `<___>Welcome to CampusOS</___>`,
          blankAnswer: "h1",
          acceptableAnswers: ["h1"],
          hint: "h1 is the highest level heading.",
          explanation: "<h1> defines the most important heading. <h6> defines the least important heading.",
          xp: 25,
        },
      },
      {
        id: "html-intro",
        title: "HTML Introduction",
        categoryGroup: "HTML Tutorial",
        description: "HTML stands for Hyper Text Markup Language. HTML is the standard markup language for creating Web pages. HTML describes the structure of a Web page.",
        sections: [
          {
            title: "HTML Elements",
            content: "An HTML element is defined by a start tag, some content, and an end tag: <tagname>Content goes here...</tagname>. HTML elements can be nested (elements can contain elements).",
          },
        ],
        tryItYourself: {
          title: "Example: Nested Elements",
          language: "html",
          starterCode: `<div class="card">\n  <h2>CampusOS Platform</h2>\n  <p>Building <strong>accessible</strong> and <em>interactive</em> education tools.</p>\n</div>`,
          expectedOutput: "CampusOS Platform\nBuilding accessible and interactive education tools.",
          explanation: "<strong> makes text bold semantically, while <em> adds emphasis in italics.",
        },
        exercise: {
          title: "Exercise: Paragraph Tag",
          prompt: "Fill in the paragraph tag:",
          codeTemplate: `<___>This is a paragraph.</___>`,
          blankAnswer: "p",
          acceptableAnswers: ["p"],
          hint: "The letter p.",
          explanation: "The <p> element defines a paragraph.",
          xp: 25,
        },
      },
      {
        id: "html-attributes",
        title: "HTML Attributes",
        categoryGroup: "HTML Tutorial",
        description: "All HTML elements can have attributes. Attributes provide additional information about elements. Attributes are always specified in the start tag, usually in name/value pairs like: name=\"value\".",
        sections: [
          {
            title: "The href and src Attributes",
            content: "The <a> tag defines a hyperlink. The href attribute specifies the URL of the page the link goes to. The <img> tag is used to embed an image in an HTML page. The src attribute specifies the path to the image to be displayed.",
          },
        ],
        tryItYourself: {
          title: "Example: Links and Images",
          language: "html",
          starterCode: `<a href="https://campusos.edu" target="_blank">Visit CampusOS</a>\n<img src="/logo.png" alt="CampusOS Logo" width="120" height="40" />`,
          expectedOutput: "Visit CampusOS [Link]\n[Image: CampusOS Logo]",
          explanation: "Always include the alt attribute for accessibility and screen reader support.",
        },
        exercise: {
          title: "Exercise: Link Destination",
          prompt: "Fill in the attribute that specifies the URL destination of a link:",
          codeTemplate: `<a ___="https://www.w3schools.com">Visit W3Schools</a>`,
          blankAnswer: "href",
          acceptableAnswers: ["href"],
          hint: "Hypertext Reference.",
          explanation: "href specifies the link's destination URL.",
          xp: 25,
        },
      },
      {
        id: "html-semantics",
        title: "HTML Semantics",
        categoryGroup: "HTML Tutorial",
        description: "Semantic elements = elements with a meaning. A semantic element clearly describes its meaning to both the browser and the developer.",
        sections: [
          {
            title: "Core Semantic Elements",
            content: "Examples of non-semantic elements: <div> and <span> - Tells nothing about its content. Examples of semantic elements: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer> - Clearly defines its content.",
          },
        ],
        tryItYourself: {
          title: "Example: Semantic Page Layout",
          language: "html",
          starterCode: `<header>\n  <h1>University Portal</h1>\n</header>\n<nav>\n  <a href="/courses">Courses</a> | <a href="/cv">CV Studio</a>\n</nav>\n<main>\n  <article>\n    <h2>Lecture 1: Modern Web Standards</h2>\n    <p>Semantic HTML improves accessibility and SEO.</p>\n  </article>\n</main>\n<footer>&copy; 2026 CampusOS</footer>`,
          expectedOutput: "University Portal\nCourses | CV Studio\nLecture 1: Modern Web Standards\nSemantic HTML improves accessibility and SEO.\n© 2026 CampusOS",
          explanation: "Semantic layout enables screen readers to navigate content landmarks.",
        },
        exercise: {
          title: "Exercise: Navigation Element",
          prompt: "Fill in the semantic tag used to define a set of navigation links:",
          codeTemplate: `<___>\n  <a href="/">Home</a>\n</___>`,
          blankAnswer: "nav",
          acceptableAnswers: ["nav"],
          hint: "Short for navigation.",
          explanation: "The <nav> tag defines a set of navigation links.",
          xp: 25,
        },
      },
      {
        id: "html-forms",
        title: "HTML Forms & Inputs",
        categoryGroup: "HTML Tutorial",
        description: "An HTML form is used to collect user input. The user input is most often sent to a server for processing.",
        sections: [
          {
            title: "Input Types",
            content: "The <input> element can be displayed in several ways, depending on the type attribute: text, password, submit, reset, radio, checkbox, button, email, number, date.",
          },
        ],
        tryItYourself: {
          title: "Example: User Registration Form",
          language: "html",
          starterCode: `<form action="/api/signup" method="POST">\n  <label for="fname">First Name:</label><br>\n  <input type="text" id="fname" name="fname" value="DemoA"><br>\n  <label for="email">Email:</label><br>\n  <input type="email" id="email" name="email" value="learner@example.invalid"><br><br>\n  <input type="submit" value="Register">\n</form>`,
          expectedOutput: "First Name: [DemoA]\nEmail: [learner@example.invalid]\n[Register Button]",
          explanation: "HTML forms provide built-in client-side type validation for emails and required fields.",
        },
        exercise: {
          title: "Exercise: Password Input",
          prompt: "Fill in the input type for masking sensitive user passwords:",
          codeTemplate: `<input type="___" name="user_password">`,
          blankAnswer: "password",
          acceptableAnswers: ["password"],
          hint: "The type is password.",
          explanation: "type='password' masks characters with dots or asterisks.",
          xp: 25,
        },
      },
    ],
  },

  // =========================================================================
  // 4. CSS / CSS3 COURSE (Exact W3Schools Curriculum)
  // =========================================================================
  {
    id: "css",
    name: "CSS3",
    tabLabel: "CSS",
    tagline: "The style sheet language used for describing the presentation of a document written in HTML.",
    sidebarTitle: "CSS TUTORIAL",
    categoryBadge: "Styling & Layout",
    accentColor: "#264DE4",
    chapters: [
      {
        id: "css-home",
        title: "CSS HOME",
        categoryGroup: "CSS Tutorial",
        description: "CSS is the language we use to style an HTML document. CSS describes how HTML elements should be displayed. This tutorial will teach you CSS from basic to advanced.",
        sections: [
          {
            title: "Why Use CSS?",
            content: "CSS is used to define styles for your web pages, including the design, layout and variations in display for different devices and screen sizes.",
          },
        ],
        tryItYourself: {
          title: "Example: Styling a Heading and Paragraph",
          language: "css",
          starterCode: `body {\n  background-color: #f8fafc;\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  color: #6653E6;\n  text-align: center;\n}\n\np {\n  font-size: 16px;\n  line-height: 1.5;\n  color: #334155;\n}`,
          expectedOutput: "[Rendered Heading in Royal Purple, Centered, Slate 700 Paragraph Text on Light Slate Background]",
          explanation: "CSS selectors pinpoint elements and apply declarative property-value rules.",
        },
        exercise: {
          title: "Exercise: Text Color",
          prompt: "Set the text color for all <h1> elements to purple:",
          codeTemplate: `h1 {\n  ___: purple;\n}`,
          blankAnswer: "color",
          acceptableAnswers: ["color"],
          hint: "The property is color.",
          explanation: "The 'color' property specifies the foreground color of text.",
          xp: 25,
        },
      },
      {
        id: "css-boxmodel",
        title: "CSS Box Model",
        categoryGroup: "CSS Tutorial",
        description: "All HTML elements can be considered as boxes. In CSS, the term 'box model' is used when talking about design and layout.",
        sections: [
          {
            title: "Parts of the Box Model",
            content: "The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.",
          },
        ],
        tryItYourself: {
          title: "Example: Box Model Card",
          language: "css",
          starterCode: `.card {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #6653E6;\n  margin: 15px auto;\n  border-radius: 16px;\n  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n}`,
          expectedOutput: "300px wide card with 20px internal padding, 2px purple border, 15px margin, rounded corners, and shadow.",
          explanation: "Padding adds space inside the border; margin adds space outside the border.",
        },
        exercise: {
          title: "Exercise: Inner Spacing",
          prompt: "Fill in the CSS property used to create space inside an element's border:",
          codeTemplate: `.box {\n  ___: 20px;\n}`,
          blankAnswer: "padding",
          acceptableAnswers: ["padding"],
          hint: "The property is padding.",
          explanation: "Padding generates space around an element's content, inside of any defined borders.",
          xp: 25,
        },
      },
      {
        id: "css-flexbox",
        title: "CSS Flexbox",
        categoryGroup: "CSS Tutorial",
        description: "Before the Flexbox Layout module, there were four layout modes: Block, Inline, Table, Positioned. The Flexible Box Layout Module makes it easier to design flexible responsive layout structure without using float or positioning.",
        sections: [
          {
            title: "Flexbox Direction and Alignment",
            content: "display: flex transforms a container into a flex container. justify-content controls main-axis alignment (center, space-between, flex-start). align-items controls cross-axis alignment.",
          },
        ],
        tryItYourself: {
          title: "Example: Responsive Navbar with Flexbox",
          language: "css",
          starterCode: `.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 24px;\n  background: #ffffff;\n  border-bottom: 1px solid #e2e8f0;\n}`,
          expectedOutput: "Flex container with brand logo on the far left and menu items on the far right, vertically centered.",
          explanation: "justify-content: space-between pushes child items to opposite edges automatically.",
        },
        exercise: {
          title: "Exercise: Turn on Flexbox",
          prompt: "Set the display property to activate Flexbox layout on a container:",
          codeTemplate: `.container {\n  display: ___;\n}`,
          blankAnswer: "flex",
          acceptableAnswers: ["flex"],
          hint: "The value is flex.",
          explanation: "display: flex initiates the flex formatting context.",
          xp: 25,
        },
      },
      {
        id: "css-grid",
        title: "CSS Grid",
        categoryGroup: "CSS Tutorial",
        description: "The CSS Grid Layout Module offers a grid-based layout system, with rows and columns, making it easier to design web pages without having to use floats and positioning.",
        sections: [
          {
            title: "Grid Template Columns",
            content: "The grid-template-columns property defines the number of columns in your grid layout, and it can define the width of each column (e.g. repeat(3, 1fr)).",
          },
        ],
        tryItYourself: {
          title: "Example: 3-Column Responsive Grid",
          language: "css",
          starterCode: `.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n\n@media (max-width: 768px) {\n  .dashboard-grid {\n    grid-template-columns: 1fr;\n  }\n}`,
          expectedOutput: "3 equal-width columns with 20px gap on desktops, collapsing to 1 column on mobile devices.",
          explanation: "CSS Grid is a 2-dimensional system, handling both rows and columns simultaneously.",
        },
        exercise: {
          title: "Exercise: Grid Spacing",
          prompt: "Fill in the property used to set the spacing between rows and columns in CSS Grid:",
          codeTemplate: `.grid-container {\n  display: grid;\n  ___: 16px;\n}`,
          blankAnswer: "gap",
          acceptableAnswers: ["gap"],
          hint: "The property is gap.",
          explanation: "The 'gap' property defines the gutters between grid rows and columns.",
          xp: 25,
        },
      },
    ],
  },

  // =========================================================================
  // 5. SQL COURSE (Exact W3Schools Curriculum)
  // =========================================================================
  {
    id: "sql",
    name: "SQL",
    tabLabel: "SQL",
    tagline: "The standard declarative language for storing, querying, and manipulating relational databases.",
    sidebarTitle: "SQL TUTORIAL",
    categoryBadge: "Database & Data",
    accentColor: "#00758F",
    chapters: [
      {
        id: "sql-home",
        title: "SQL HOME",
        categoryGroup: "SQL Tutorial",
        description: "SQL is a standard language for storing, manipulating and retrieving data in databases. Our SQL tutorial will teach you how to use SQL in: MySQL, SQL Server, MS Access, Oracle, Sybase, Informix, Postgres, and other database systems.",
        sections: [
          {
            title: "What is SQL?",
            content: "SQL stands for Structured Query Language. SQL lets you access and manipulate databases. SQL became a standard of the American National Standards Institute (ANSI) in 1986, and of the International Organization for Standardization (ISO) in 1987.",
          },
        ],
        tryItYourself: {
          title: "Example: SELECT All Students",
          language: "sql",
          starterCode: `SELECT student_id, name, department, cgpa\nFROM Students\nWHERE cgpa >= 3.5\nORDER BY cgpa DESC;`,
          expectedOutput: `student_id | name        | department       | cgpa\n-----------+-------------+------------------+-----\n102        | DemoB User  | Artificial Intel | 3.92\n101        | DemoA User  | Computer Science | 3.85\n103        | DemoC User  | Software Eng     | 3.68\n(3 rows returned in 1.2ms)`,
          explanation: "SELECT queries extract data from database tables without modifying records.",
        },
        exercise: {
          title: "Exercise: Select All",
          prompt: "Insert the missing statement to select all columns from the Customers table:",
          codeTemplate: `SELECT ___ FROM Customers;`,
          blankAnswer: "*",
          acceptableAnswers: ["*"],
          hint: "The asterisk wildcard represents all columns.",
          explanation: "The * wildcard symbol instructs SQL to return every column defined on the table.",
          xp: 25,
        },
      },
      {
        id: "sql-select",
        title: "SQL SELECT",
        categoryGroup: "SQL Tutorial",
        description: "The SELECT statement is used to select data from a database. The data returned is stored in a result table, called the result-set.",
        sections: [
          {
            title: "SELECT Syntax",
            content: "SELECT column1, column2, ... FROM table_name; Here, column1, column2, ... are the field names of the table you want to select data from.",
          },
        ],
        tryItYourself: {
          title: "Example: Specific Column Selection",
          language: "sql",
          starterCode: `SELECT name, email, department\nFROM Users\nWHERE role = 'teacher';`,
          expectedOutput: `name             | email               | department\n-----------------+---------------------+-----------------\nExample Faculty| teacher@example.invalid| Computer Science\nExample Faculty 2| teacher2@example.invalid| Data Science`,
          explanation: "Selecting only required columns optimizes query performance and decreases memory transfer.",
        },
        exercise: {
          title: "Exercise: Select Columns",
          prompt: "Write a statement that will select the City column from the Customers table:",
          codeTemplate: `___ City FROM Customers;`,
          blankAnswer: "SELECT",
          acceptableAnswers: ["SELECT", "select"],
          hint: "The keyword is SELECT.",
          explanation: "SELECT specifies which columns should be retrieved.",
          xp: 25,
        },
      },
      {
        id: "sql-where",
        title: "SQL WHERE",
        categoryGroup: "SQL Tutorial",
        description: "The WHERE clause is used to filter records. It is used to extract only those records that fulfill a specified condition.",
        sections: [
          {
            title: "WHERE Syntax",
            content: "SELECT column1, column2, ... FROM table_name WHERE condition; Note: The WHERE clause is not only used in SELECT statements, it is also used in UPDATE, DELETE, etc.!",
          },
        ],
        tryItYourself: {
          title: "Example: Filtering with WHERE",
          language: "sql",
          starterCode: `SELECT course_id, title, credits, department\nFROM Courses\nWHERE credits >= 3 AND department = 'CS';`,
          expectedOutput: `course_id | title                         | credits | department\n----------+-------------------------------+---------+-----------\nCS101     | Intro to Computer Science     | 4       | CS\nCS305     | Algorithms & Data Structures  | 3       | CS\nCS420     | Distributed Systems           | 4       | CS`,
          explanation: "Logical operators AND, OR, NOT allow combining multiple filtering predicates.",
        },
        exercise: {
          title: "Exercise: Filter by Country",
          prompt: "Select all records where the City column has the value 'Berlin':",
          codeTemplate: `SELECT * FROM Customers ___ City = 'Berlin';`,
          blankAnswer: "WHERE",
          acceptableAnswers: ["WHERE", "where"],
          hint: "Use the WHERE clause.",
          explanation: "The WHERE clause filters records matching the predicate.",
          xp: 25,
        },
      },
      {
        id: "sql-joins",
        title: "SQL Joins (INNER & LEFT)",
        categoryGroup: "SQL Tutorial",
        description: "A JOIN clause is used to combine rows from two or more tables, based on a related column between them.",
        sections: [
          {
            title: "Types of Joins",
            content: "(INNER) JOIN: Returns records that have matching values in both tables. LEFT (OUTER) JOIN: Returns all records from the left table, and the matched records from the right table. RIGHT (OUTER) JOIN: Returns all records from the right table, and the matched records from the left table. FULL (OUTER) JOIN: Returns all records when there is a match in either left or right table.",
          },
        ],
        tryItYourself: {
          title: "Example: INNER JOIN Query",
          language: "sql",
          starterCode: `SELECT s.name, e.course_code, e.grade\nFROM Students s\nINNER JOIN Enrollments e ON s.student_id = e.student_id\nWHERE e.grade = 'A'\nORDER BY s.name ASC;`,
          expectedOutput: `name        | course_code | grade\n------------+-------------+------\nDemoA User  | CS101       | A\nDemoA User  | AI405       | A\nDemoB User  | CS305       | A`,
          explanation: "INNER JOIN matches foreign key e.student_id to primary key s.student_id.",
        },
        exercise: {
          title: "Exercise: Join Tables",
          prompt: "Fill in the keyword to perform an inner join between Orders and Customers:",
          codeTemplate: `SELECT * FROM Orders ___ JOIN Customers ON Orders.CustomerID = Customers.CustomerID;`,
          blankAnswer: "INNER",
          acceptableAnswers: ["INNER", "inner"],
          hint: "The keyword is INNER.",
          explanation: "INNER JOIN retrieves only rows where the ON condition is satisfied in both tables.",
          xp: 30,
        },
      },
      {
        id: "sql-groupby",
        title: "SQL GROUP BY & Aggregate Functions",
        categoryGroup: "SQL Tutorial",
        description: "The GROUP BY statement groups rows that have the same values into summary rows, like 'find the number of customers in each country'.",
        sections: [
          {
            title: "Aggregate Functions with GROUP BY",
            content: "The GROUP BY statement is often used with aggregate functions (COUNT(), MAX(), MIN(), SUM(), AVG()) to group the result-set by one or more columns.",
          },
        ],
        tryItYourself: {
          title: "Example: Department Aggregations",
          language: "sql",
          starterCode: `SELECT department, COUNT(*) AS student_count, ROUND(AVG(cgpa), 2) AS avg_cgpa\nFROM Students\nGROUP BY department\nHAVING COUNT(*) >= 1\nORDER BY avg_cgpa DESC;`,
          expectedOutput: `department       | student_count | avg_cgpa\n-----------------+---------------+---------\nArtificial Intel | 1             | 3.92\nComputer Science | 1             | 3.85\nSoftware Eng     | 1             | 3.68`,
          explanation: "HAVING filters grouped aggregates, whereas WHERE filters individual rows before grouping.",
        },
        exercise: {
          title: "Exercise: Group Records",
          prompt: "Fill in the keywords used to group records by Country:",
          codeTemplate: `SELECT COUNT(CustomerID), Country FROM Customers ___ ___ Country;`,
          blankAnswer: "GROUP BY",
          acceptableAnswers: ["GROUP BY", "group by"],
          hint: "Two words: GROUP BY.",
          explanation: "The GROUP BY clause collapses rows with identical values in specified columns.",
          xp: 30,
        },
      },
    ],
  },
];

for (const course of W3_COURSES) course.chapters.push(...advancedChapters(course.id));

export function getW3CourseById(id: string): W3Course | undefined {
  return W3_COURSES.find((c) => c.id === id);
}

export function getAllW3Courses(): W3Course[] {
  return W3_COURSES;
}
