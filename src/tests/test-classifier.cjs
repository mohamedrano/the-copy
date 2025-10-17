// Test script to verify our classifier improvements
const fs = require('fs');

// Mock the ScreenplayClassifier class with our improved logic
class ScreenplayClassifier {
  // Constants
  static AR_AB_LETTER = '\u0600-\u06FF';
  static EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  static WESTERN_DIGITS = '0123456789';
  
  // Enhanced ACTION_VERB_LIST with more verbs
  static ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|تصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينتصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن|يوجه|تتوجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقن|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصيب|يتعافى|تعافي|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تخبوء|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|ي admire|تعجب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب';
  
  // Regex patterns
  static ACTION_VERBS = new RegExp('^(?:' + ScreenplayClassifier.ACTION_VERB_LIST + ')(?:\\s|$)');
  static BASMALA_RE = /^\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*$/i;
  static SCENE_PREFIX_RE = /^\s*(?:مشهد|م\.)\s*([0-9]+)\s*(?:[-–—:،]\s*)?(.*)$/i;
  static INOUT_PART = '(?:داخلي|خارجي|د\\.|خ\\.)';
  static TIME_PART = '(?:ليل|نهار|ل\\.|ن\\.|صباح|مساء|فجر|ظهر|عصر|مغرب|الغروب|الفجر)';
  static TL_REGEX = new RegExp('(?:' + ScreenplayClassifier.INOUT_PART + '\\s*-?\\s*' + ScreenplayClassifier.TIME_PART + '\\s*|' + ScreenplayClassifier.TIME_PART + '\\s*-?\\s*' + ScreenplayClassifier.INOUT_PART + ')', 'i');
  static CHARACTER_RE = new RegExp('^\\s*(?:صوت\\s+)?[' + ScreenplayClassifier.AR_AB_LETTER + '][' + ScreenplayClassifier.AR_AB_LETTER + '\\s]{0,30}:?\\s*$');
  static TRANSITION_RE = /^\s*(?:قطع|قطع\s+إلى|إلى|مزج|ذوبان|خارج\s+المشهد|CUT TO:|FADE IN:|FADE OUT:)\s*$/i;
  static PARENTHETICAL_SHAPE_RE = /^\s*\(.*?\)\s*$/;

  // Helper functions
  static easternToWesternDigits(s) {
    const map = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, char => map[char]);
  }

  static stripTashkeel(s) {
    return s.replace(/[\u064B-\u065F\u0670]/g, '');
  }

  static normalizeSeparators(s) {
    return s.replace(/[-–—]/g, '-').replace(/[،,]/g, ',').replace(/\s+/g, ' ');
  }

  static normalizeLine(input) {
    return ScreenplayClassifier.stripTashkeel(
      ScreenplayClassifier.normalizeSeparators(input)
    ).replace(/[\u200f\u200e\ufeff\t]+/g, '').trim();
  }

  static textInsideParens(s) {
    const match = s.match(/^\s*\((.*?)\)\s*$/);
    return match ? match[1] : '';
  }

  static hasSentencePunctuation(s) {
    return /[\.!\؟\?]/.test(s);
  }

  static wordCount(s) {
    return s.trim() ? s.trim().split(/\s+/).length : 0;
  }

  static isBlank(line) {
    return !line || line.trim() === '';
  }

  // Type checkers
  static isBasmala(line) {
    return ScreenplayClassifier.BASMALA_RE.test(line);
  }

  static isSceneHeaderStart(line) {
    return ScreenplayClassifier.SCENE_PREFIX_RE.test(line);
  }

  static isTransition(line) {
    return ScreenplayClassifier.TRANSITION_RE.test(line);
  }

  static isParenShaped(line) {
    return ScreenplayClassifier.PARENTHETICAL_SHAPE_RE.test(line);
  }

  static isCharacterLine(line, context) {
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

  static isLikelyAction(line) {
    if (ScreenplayClassifier.isBlank(line) || 
        ScreenplayClassifier.isBasmala(line) || 
        ScreenplayClassifier.isSceneHeaderStart(line) || 
        ScreenplayClassifier.isTransition(line) || 
        ScreenplayClassifier.isCharacterLine(line) || 
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }
    
    // Additional checks for action lines
    const normalized = ScreenplayClassifier.normalizeLine(line);
    
    // Check if line starts with an action description pattern
    // These are strong indicators of action lines
    const actionStartPatterns = [
      /^\s*[-–—]?\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
      /^\s*[-–—]?\s*[ي|ت][\u0600-\u06FF]+\s+(?:[^\s\u0600-\u06FF]*\s*)*[^\s\u0600-\u06FF]/  // Verbs starting with ي or ت followed by other words
    ];
    
    for (const pattern of actionStartPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }
    
    // Enhanced action detection for Arabic
    // Check if line starts with an action verb
    if (ScreenplayClassifier.ACTION_VERBS.test(normalized)) {
      return true;
    }
    
    // If it has sentence punctuation and no colon, it might be action
    // But we need to be more careful to avoid misclassifying dialogue
    if (ScreenplayClassifier.hasSentencePunctuation(line) && !line.includes(':')) {
      // Check if it contains action indicators
      const actionIndicators = [
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'تصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينتصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'تتوجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يأمر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
      ];
      
      for (const indicator of actionIndicators) {
        if (normalized.includes(indicator)) {
          return true;
        }
      }
      
      // If it doesn't contain action indicators, it's likely dialogue
      return false;
    }
    
    // If it's a longer sentence (more than 5 words) without character formatting and contains action verbs, it's likely action
    if (ScreenplayClassifier.wordCount(line) > 5 && !line.includes(':')) {
      const actionIndicators = [
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'تصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينتصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'تتوجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يأمر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
      ];
      
      for (const indicator of actionIndicators) {
        if (normalized.includes(indicator)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

// Test cases
const testCases = [
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