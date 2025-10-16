// Test Basmala detection
class ScreenplayClassifier {
  static isBasmala(line) {
    // Handle both formats:
    // 1. بسم الله الرحمن الرحيم
    // 2. }بسم الله الرحمن الرحيم{
    const normalizedLine = line.trim();
    const basmalaPatterns = [
      /^بسم\s+الله\s+الرحمن\s+الرحيم$/i,  // Standard format
      /^[{}]*\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*[{}]*$/i  // With braces
    ];
    
    return basmalaPatterns.some(pattern => pattern.test(normalizedLine));
  }
}

// Test cases
const testCases = [
  {
    line: "بسم الله الرحمن الرحيم",
    expected: true,
    description: "Standard Basmala"
  },
  {
    line: "}بسم الله الرحمن الرحيم{",
    expected: true,
    description: "Basmala with braces"
  },
  {
    line: "  بسم الله الرحمن الرحيم  ",
    expected: true,
    description: "Basmala with extra spaces"
  },
  {
    line: "  }بسم الله الرحمن الرحيم{  ",
    expected: true,
    description: "Basmala with braces and extra spaces"
  },
  {
    line: "بسم الله الرحمن الرحيم.",
    expected: false,
    description: "Basmala with extra punctuation"
  },
  {
    line: "أحمد",
    expected: false,
    description: "Regular text"
  }
];

console.log("Testing Basmala detection...\n");

let passed = 0;
let total = testCases.length;

for (const testCase of testCases) {
  const result = ScreenplayClassifier.isBasmala(testCase.line);
  const isPass = result === testCase.expected;
  
  console.log(`Test: ${testCase.description}`);
  console.log(`Line: "${testCase.line}"`);
  console.log(`Expected: ${testCase.expected}, Got: ${result}`);
  console.log(`Result: ${isPass ? "PASS" : "FAIL"}\n`);
  
  if (isPass) passed++;
}

console.log(`\nTest Results: ${passed}/${total} passed`);

if (passed === total) {
  console.log("All tests passed! Basmala detection is working correctly.");
} else {
  console.log("Some tests failed. Please review the Basmala detection logic.");
}