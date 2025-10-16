// Test script to verify our classifier improvements
// Test script to verify our classifier improvements

/**
 * @class ScreenplayClassifier
 * @description A mock of the ScreenplayClassifier class with improved logic for testing.
 */
class ScreenplayClassifier {
  // Constants
  static readonly AR_AB_LETTER = '\u0600-\u06FF';
  static readonly EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  static readonly WESTERN_DIGITS = '0123456789';
  
  // Enhanced ACTION_VERB_LIST with more verbs
  static readonly ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|تصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينتصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن|يوجه|تتوجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقن|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصيب|يتعافى|تعافي|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تخبوء|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|ي admire|تعجب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب';
  
  // Regex patterns
  static readonly ACTION_VERBS = new RegExp('^(?:' + ScreenplayClassifier.ACTION_VERB_LIST + ')(?:\\s|$)');
  static readonly BASMALA_RE = /^\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*$/i;
  static readonly SCENE_PREFIX_RE = /^\s*(?:مشهد|م\.)\s*([0-9]+)\s*(?:[-–—:،]\s*)?(.*)$/i;
  static readonly INOUT_PART = '(?:داخلي|خارجي|د\\.|خ\\.)';
  static readonly TIME_PART = '(?:ليل|نهار|ل\\.|ن\\.|صباح|مساء|فجر|ظهر|عصر|مغرب|الغروب|الفجر)';
  static readonly TL_REGEX = new RegExp('(?:' + ScreenplayClassifier.INOUT_PART + '\\s*-?\\s*' + ScreenplayClassifier.TIME_PART + '\\s*|' + ScreenplayClassifier.TIME_PART + '\\s*-?\\s*' + ScreenplayClassifier.INOUT_PART + ')', 'i');
  static readonly CHARACTER_RE = new RegExp('^\\s*(?:صوت\\s+)?[' + ScreenplayClassifier.AR_AB_LETTER + '][' + ScreenplayClassifier.AR_AB_LETTER + '\\s]{0,30}:?\\s*$');
  static readonly TRANSITION_RE = /^\s*(?:قطع|قطع\s+إلى|إلى|مزج|ذوبان|خارج\s+المشهد|CUT TO:|FADE IN:|FADE OUT:)\s*$/i;
  static readonly PARENTHETICAL_SHAPE_RE = /^\s*\(.*?\)\s*$/;

  // Helper functions
  /**
   * Converts Eastern Arabic digits to their Western Arabic equivalents.
   *
   * @param {string} s - The source string that may contain Eastern Arabic numerals.
   * @returns {string} The normalized string containing only Western digits.
   */
  static easternToWesternDigits(s: string) {
    const map: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (char: string) => map[char]);
  }

  /**
   * Removes Arabic diacritic marks (tashkeel) from a string.
   *
   * @param {string} s - The input string to normalize.
   * @returns {string} The string without diacritic characters.
   */
  static stripTashkeel(s: string) {
    return s.replace(/[\u064B-\u065F\u0670]/g, '');
  }

  /**
   * Standardizes punctuation and spacing separators used in screenplay text.
   *
   * @param {string} s - The raw line of dialogue or action text.
   * @returns {string} The string with consistent separators and whitespace.
   */
  static normalizeSeparators(s: string) {
    return s.replace(/[-–—]/g, '-').replace(/[،,]/g, ',').replace(/\s+/g, ' ');
  }

  /**
   * Produces a whitespace-trimmed and punctuation-normalized version of a screenplay line.
   *
   * @param {string} input - The line to normalize.
   * @returns {string} The normalized line ready for classification heuristics.
   */
  static normalizeLine(input: string) {
    return ScreenplayClassifier.stripTashkeel(
      ScreenplayClassifier.normalizeSeparators(input)
    ).replace(/[\u200f\u200e\ufeff\t]+/g, '').trim();
  }

  /**
   * Extracts the text contained within parentheses, if present.
   *
   * @param {string} s - The string that may include parentheses.
   * @returns {string} The text found inside the parentheses or an empty string if none exist.
   */
  static textInsideParens(s: string) {
    const match = s.match(/^\s*\((.*?)\)\s*$/);
    return match ? match[1] : '';
  }

  /**
   * Checks whether a string includes sentence-ending punctuation marks.
   *
   * @param {string} s - The text to inspect.
   * @returns {boolean} True when punctuation is detected; otherwise false.
   */
  static hasSentencePunctuation(s: string) {
    return /[\.!\؟\?]/.test(s);
  }

  /**
   * Counts the number of whitespace-delimited tokens in a string.
   *
   * @param {string} s - The text to evaluate.
   * @returns {number} The total number of detected words.
   */
  static wordCount(s: string) {
    return s.trim() ? s.trim().split(/\s+/).length : 0;
  }

  /**
   * Determines if a line is empty or contains only whitespace characters.
   *
   * @param {string} line - The line to inspect.
   * @returns {boolean} True when the line has no substantive characters; otherwise false.
   */
  static isBlank(line: string) {
    return !line || line.trim() === '';
  }

  // Type checkers
  /**
   * Detects whether a line corresponds to the Islamic basmala invocation.
   *
   * @param {string} line - The screenplay line to evaluate.
   * @returns {boolean} True when the line is a basmala phrase.
   */
  static isBasmala(line: string) {
    return ScreenplayClassifier.BASMALA_RE.test(line);
  }

  /**
   * Determines if a line marks the beginning of a scene header.
   *
   * @param {string} line - The candidate scene header line.
   * @returns {boolean} True when the line matches Arabic scene header conventions.
   */
  static isSceneHeaderStart(line: string) {
    return ScreenplayClassifier.SCENE_PREFIX_RE.test(line);
  }

  /**
   * Checks whether a line represents a screenplay transition cue.
   *
   * @param {string} line - The line to inspect for transition keywords.
   * @returns {boolean} True if the line matches known transition phrases.
   */
  static isTransition(line: string) {
    return ScreenplayClassifier.TRANSITION_RE.test(line);
  }

  /**
   * Evaluates if a line is formatted as a parenthetical aside.
   *
   * @param {string} line - The text that may contain parentheses.
   * @returns {boolean} True when the line is enclosed in parentheses.
   */
  static isParenShaped(line: string) {
    return ScreenplayClassifier.PARENTHETICAL_SHAPE_RE.test(line);
  }

  /**
   * Determines if a line should be classified as a character name heading.
   *
   * @param {string} line - The screenplay line under inspection.
   * @param {any} context - State information about preceding lines in the block.
   * @returns {boolean} True when heuristics identify the line as a character cue.
   */
  static isCharacterLine(line: string, context: any) {
    if (ScreenplayClassifier.isSceneHeaderStart(line) || 
        ScreenplayClassifier.isTransition(line) || 
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }
    
    const wordCount = ScreenplayClassifier.wordCount(line);
    // Allow slightly longer character lines for Arabic names
    if (wordCount > 7) return false;
    
    const normalized = ScreenplayClassifier.normalizeLine(line);
    // If it starts with an action verb, it's not a character line
    if (ScreenplayClassifier.ACTION_VERBS.test(normalized)) return false;
    
    // Enhanced character line detection for Arabic
    // Check if line ends with a colon (common in Arabic screenplays)
    const hasColon = line.includes(':');
    
    // Special handling for Arabic character names that might not follow Western patterns
    const arabicCharacterPattern = /^[\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+[:\s]*$/;
    
    // If it ends with a colon, it's very likely a character line
    if (hasColon && line.trim().endsWith(':')) {
      return true;
    }
    
    // If it matches Arabic character pattern, it's likely a character line
    if (arabicCharacterPattern.test(line)) {
      return true;
    }
    
    // If it doesn't have a colon and doesn't match character patterns, it's likely action
    if (!hasColon) return false;
    
    // Context-aware checks
    if (context) {
      // If we're already in a dialogue block, this might be a new character
      if (context.isInDialogueBlock) {
        // If the last line was also a character, this is likely a new character
        if (context.lastFormat === 'character') {
          return ScreenplayClassifier.CHARACTER_RE.test(line) || arabicCharacterPattern.test(line);
        }
        // If the last line was dialogue, this is probably not a character
        if (context.lastFormat === 'dialogue') {
          return false;
        }
      }
      
      // If the last format was action, and this line has a colon, it's likely a character
      if (context.lastFormat === 'action' && hasColon) {
        return ScreenplayClassifier.CHARACTER_RE.test(line) || arabicCharacterPattern.test(line);
      }
    }
    
    return ScreenplayClassifier.CHARACTER_RE.test(line) || arabicCharacterPattern.test(line);
  }

  /**
   * Predicts whether a line should be treated as an action description instead of dialogue.
   *
   * @param {string} line - The screenplay line being classified.
   * @returns {boolean} True if the heuristics favor action classification.
   */
  static isLikelyAction(line: string) {
    if (ScreenplayClassifier.isBlank(line) ||
        ScreenplayClassifier.isBasmala(line) ||
        ScreenplayClassifier.isSceneHeaderStart(line) ||
        ScreenplayClassifier.isTransition(line) ||
        ScreenplayClassifier.isCharacterLine(line, undefined) ||
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }
    
    // Additional checks for action lines
    const normalized = ScreenplayClassifier.normalizeLine(line);
    
    // If it has sentence punctuation and no colon, it's likely action
    if (ScreenplayClassifier.hasSentencePunctuation(line) && !line.includes(':')) {
      return true;
    }
    
    // Enhanced action detection for Arabic
    // Check if line starts with an action verb
    if (ScreenplayClassifier.ACTION_VERBS.test(normalized)) {
      return true;
    }
    
    // Check for action description patterns
    // Lines that start with descriptive verbs or phrases are likely action
    const actionDescriptionPatterns = [
      /^\s*[-–—]?\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
      /^\s*[-–—]?\s*[ي|ت][\u0600-\u06FF]+/  // Verbs starting with ي or ت
    ];
    
    for (const pattern of actionDescriptionPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }
    
    // If it's a descriptive sentence without character indicators, it's likely action
    const actionIndicators = [
      'يقول', 'تقول', 'قال', 'قالت', 'يقوم', 'تقوم', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب',
      'يكتب', 'تكتب', 'ينظر', 'تنظر', 'يبتسم', 'تبتسم', 'يقف', 'تقف', 'يجلس', 'تجلس', 'يدخل', 'تدخل',
      'يخرج', 'تخرج', 'يركض', ' تركض', 'يمشي', 'تمشي', 'يجري', 'تجرى', 'يصرخ', 'تصرخ', 'يبكي', 'تبكي',
      'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام',
      'يستيقظ', 'تستيقظ', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ',
      'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت',
      'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينتصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط',
      'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد',
      'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب',
      'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن',
      'نرى', 'ننظر', 'نسمع', 'نلاحظ', 'نتحرك', 'نحدث', 'نكون', 'نوجد', 'نتواجد', 'نشهد', 'نشاهد', 'نلمس', 'نأخذ',
      'نعطي', 'نفتح', 'نغلق', 'نعود', 'نأتي', 'نموت', 'نحيا', 'نقت', 'ننتصر', 'نخسر', 'نرسم', 'نصمم', 'نخطط',
      'نقضي', 'نقض', 'نقرر', 'نفكر', 'نتذكر', 'نحاول', 'نستطيع', 'نريد', 'نحتاج', 'نبحث', 'نجد', 'نفقد', 'نحمي',
      'نراقب', 'نخفي', 'نكشف', 'نكتشف', 'نعرف', 'نتعلم', 'نعلم', 'نقول', 'نكتب', 'نقرأ', 'نشعر', 'نعتقد', 'نفهم',
      'نصدق', 'نشك', 'نتمنى', 'نأمل', 'نخشى', 'نخاف', 'نحب', 'نكره', 'نحسد', 'نغبط', 'ن admire', 'نحترم', 'نتعامل',
      'نتواصل', 'نتقابل', 'نلتقي', 'ن分手', 'نتزوج', 'نطلق', 'نولد', 'نكبر', 'نشيخ', 'نمرض', 'نشفي', 'نصيب', 'نتعاون',
      'نتعاون', 'نتضامن', 'نتكاتف', 'نتشارك', 'نشارك', 'ننقسم', 'نتقسم', 'نتوزع', 'نتوزع', 'ننظم', 'ننظم', 'نخطط', 'نخطط'
    ];
    
    for (const indicator of actionIndicators) {
      if (normalized.includes(indicator)) {
        return true;
      }
    }
    
    // If it's a longer sentence (more than 3 words) without character formatting, it's likely action
    if (ScreenplayClassifier.wordCount(line) > 3 && !line.includes(':')) {
      return true;
    }
    
    // Special case: if it doesn't have sentence punctuation but is a complete sentence structure
    // and doesn't look like a character line, treat as action
    if (!line.includes(':') && ScreenplayClassifier.wordCount(line) > 2) {
      return true;
    }
    
    return false;
  }
}

// Test cases
const testCases: { line: string; expected: string; description: string }[] = [
  // This should be classified as action, not dialogue
  {
    line: "نرى فراغ  مضيء كألف شمس ساطعة بينما ترقد على الأرض فيه واضية وقد اخذت تفتح عينيها فيبدو ان النور يغشيها للتقدم منها امرأة تشببها كصورة طبق الأصل و  ولكن تطابق الجدة و الحفيد",
    expected: "action",
    description: "Action description starting with 'نرى' (We see)"
  },
  // This should be classified as dialogue
  {
    line: "أنا فخورة بك يا ابنتي و سعيدة لانك اصبحت ا finally عاقلة و قد تجاوزت مرحلة الغباء التي كنت فيها و قد تعلمت من اخطائي",
    expected: "dialogue",
    description: "Character dialogue"
  },
  // This should be classified as action
  {
    line: "تبتسم هند رغم الامها و تنظر الى والدتها بعينين ملؤهما الامل و الحب و تقول بكل هدوء و امان",
    expected: "action",
    description: "Action description with verbs"
  }
];

console.log("Testing ScreenplayClassifier improvements...\n");

let passed = 0;
let total = testCases.length;

for (const testCase of testCases) {
  const result = ScreenplayClassifier.isLikelyAction(testCase.line) ? "action" : "dialogue";
  const isPass = result === testCase.expected;
  
  console.log(`Test: ${testCase.description}`);
  console.log(`Line: ${testCase.line}`);
  console.log(`Expected: ${testCase.expected}, Got: ${result}`);
  console.log(`Result: ${isPass ? "PASS" : "FAIL"}\n`);
  
  if (isPass) passed++;
}

console.log(`\nTest Results: ${passed}/${total} passed`);

if (passed === total) {
  console.log("All tests passed! The classifier improvements are working correctly.");
} else {
  console.log("Some tests failed. Please review the classifier logic.");
}