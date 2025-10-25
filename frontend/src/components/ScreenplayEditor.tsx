import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import FileUpload from './file-upload';
import { 
  Sparkles, X, Loader2, Sun, Moon, FileText, Bold, Italic, Underline, 
  MoveVertical, Type, Search, Replace, Save, FolderOpen, 
  Printer, Settings, Download, FilePlus, 
  Undo, Redo, Scissors, Film, Camera, Feather, UserSquare, Parentheses, MessageCircle, 
  FastForward, ChevronDown, BookHeart
} from 'lucide-react';

// ScreenplayClassifier class
class ScreenplayClassifier {
  // Constants
  static readonly AR_AB_LETTER = '\u0600-\u06FF';
  static readonly EASTERN_DIGITS = '٠٢٣٤٥٦٧٨٩';
  static readonly WESTERN_DIGITS = '0123456789';
  static readonly ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن|يوجه|وجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقن|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصيب|يتعافى|تعافي|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تخبوء|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|ي admire|تعجب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب';
  
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

  // Patterns object for scene header formatting
  Patterns: {
    sceneHeader1: RegExp;
    sceneHeader2: {
      time: RegExp;
      inOut: RegExp;
    };
    sceneHeader3: RegExp;
  };

  constructor() {
    // Add the Patterns definition
    const c = (regex: RegExp) => regex; // Helper function
    this.Patterns = {
      sceneHeader1: c(/^\s*مشهد\s*\d+\s*$/i),
      sceneHeader2: {
        time: /(ليل|نهار|صباح|مساء|فجر|ظهر|عصر| المغرب|الغروب|الفجر)/i,
        inOut: /(داخلي|خارجي|د\.|خ\.)/i,
      },
      sceneHeader3: c(/^(مسجد|بيت|منزل|شارع|حديقة|مدرسة|جامعة|مكتب|محل|مستشفى|مطعم|فندق|سيارة|غرفة|قاعة|ممر|سطح|ساحة|مقبرة|مخبز|مكتبة|نهر|بحر|جبل|غابة|سوق|مصنع|بنك|محكمة|سجن|موقف|محطة|مطار|ميناء|كوبرى|نفق|مبنى|قصر|قصر عدلي|فندق|نادي|ملعب|ملهى|بار|كازينو|متحف|مسرح|سينما|معرض|مزرعة|مصنع|مختبر|مستودع|محل|مطعم|مقهى|موقف|مكتب|شركة|كهف|الكهف|غرفة الكهف|كهف المرايا)/i),
    };
  }

  // Helper functions
  static easternToWesternDigits(s: string): string {
    const map: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return s.replace(/[٠٢٣٤٥٦٧٨٩]/g, char => map[char] || char);
  }

  static stripTashkeel(s: string): string {
    return s.replace(/[\u064B-\u065F\u0670]/g, '');
  }

  static normalizeSeparators(s: string): string {
    return s.replace(/[-–—]/g, '-').replace(/[،,]/g, ',').replace(/\s+/g, ' ');
  }

  static normalizeLine(input: string): string {
    return ScreenplayClassifier.stripTashkeel(
      ScreenplayClassifier.normalizeSeparators(input)
    ).replace(/[\u200f\u200e\ufeff\t]+/g, '').trim();
  }

  static textInsideParens(s: string): string {
    const match = s.match(/^\s*\((.*?)\)\s*$/);
    return match ? (match[1] || '') : '';
  }

  static hasSentencePunctuation(s: string): boolean {
    return /[\.!\؟\?]/.test(s);
  }

  static wordCount(s: string): number {
    return s.trim() ? s.trim().split(/\s+/).length : 0;
  }

  static isBlank(line: string): boolean {
    return !line || line.trim() === '';
  }

  // Type checkers
  static isBasmala(line: string): boolean {
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

  static isSceneHeaderStart(line: string): boolean {
    return ScreenplayClassifier.SCENE_PREFIX_RE.test(line);
  }

  static isTransition(line: string): boolean {
    return ScreenplayClassifier.TRANSITION_RE.test(line);
  }

  static isParenShaped(line: string): boolean {
    return ScreenplayClassifier.PARENTHETICAL_SHAPE_RE.test(line);
  }

  static isCharacterLine(line: string, context?: { lastFormat: string; isInDialogueBlock: boolean }): boolean {
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

  static isLikelyAction(line: string): boolean {
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
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'توجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يامر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
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
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'توجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يامر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
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

interface ScreenplayEditorProps {
  onBack?: () => void;
}

// Main component
/**
 * Provides the main screenplay editing workspace used throughout the demo.
 *
 * @param onBack - Callback executed when the user exits the editor.
 * @returns JSX representing the core screenplay editor surface.
 */
export default function ScreenplayEditor({ onBack }: ScreenplayEditorProps) {
  // State variables
  const [htmlContent, setHtmlContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('action');
  const [selectedFont, setSelectedFont] = useState('Amiri');
  const [selectedSize, setSelectedSize] = useState('14pt');
  const [documentStats, setDocumentStats] = useState({
    characters: 0,
    words: 0,
    pages: 1,
    scenes: 0
  });

  // Menu states
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  // Dialog states
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showCharacterRename, setShowCharacterRename] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [oldCharacterName, setOldCharacterName] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');

  // Gemini review states
  const [showReviewerDialog, setShowReviewerDialog] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState('');

  // View states
  const [showRulers, setShowRulers] = useState(true);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  // Get format styles
  const getFormatStyles = (formatType: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
      fontSize: selectedSize,
      direction: 'rtl',
      lineHeight: '1.8',
      minHeight: '1.2em'
    };

    const formatStyles: { [key: string]: React.CSSProperties } = {
      'basmala': { textAlign: 'left', margin: '0' },
      'scene-header-top-line': { display: 'flex', justifyContent: 'space-between', width: '100%', margin: '1rem 0 0 0' },
      'scene-header-3': { textAlign: 'center', fontWeight: 'bold', margin: '0 0 1rem 0' },
      'action': { textAlign: 'right', margin: '12px 0' },
      'character': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', width: '2.5in', margin: '12px auto 0 auto' },
      'parenthetical': { textAlign: 'center', fontStyle: 'italic', width: '2.0in', margin: '6px auto' },
      'dialogue': { textAlign: 'center', width: '2.5in', lineHeight: '1.2', margin: '0 auto 12px auto' },
      'transition': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', margin: '1rem 0' },
    };

    const finalStyles = { ...baseStyles, ...formatStyles[formatType] };
  
    if (formatType === 'scene-header-1') return { ...baseStyles, fontWeight: 'bold', textTransform: 'uppercase', margin: '0' };
    if (formatType === 'scene-header-2') return { ...baseStyles, fontStyle: 'italic', margin: '0' };
  
    return finalStyles;
  };

  // Update cursor position
  const updateCursorPosition = () => {
    // Function implementation removed as variables are unused
  };

  // Check if current element is empty
  const isCurrentElementEmpty = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      return element && element.textContent === '';
    }
    return false;
  };

  // Calculate document stats
  const calculateStats = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || '';
      const characters = textContent.length;
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      const scenes = (textContent.match(/مشهد\s*\d+/gi) || []).length;
      
      // Calculate pages based on A4 height
      const scrollHeight = editorRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(scrollHeight / (29.7 * 37.8)));
      
      setDocumentStats({ characters, words, pages, scenes });
    }
  };

  // Get next format on Tab
  const getNextFormatOnTab = (currentFormat: string, shiftKey: boolean) => {
    const mainSequence = ['scene-header-top-line', 'action', 'character', 'transition'];
    
    switch (currentFormat) {
      case 'character':
        if (shiftKey) {
          return isCurrentElementEmpty() ? 'action' : 'transition';
        } else {
          return 'dialogue';
        }
      case 'dialogue':
        if (shiftKey) {
          return 'character';
        } else {
          return 'parenthetical';
        }
      case 'parenthetical':
        return 'dialogue';
      default:
        const currentIndex = mainSequence.indexOf(currentFormat);
        if (currentIndex !== -1) {
          if (shiftKey) {
            return mainSequence[Math.max(0, currentIndex - 1)];
          } else {
            return mainSequence[Math.min(mainSequence.length - 1, currentIndex + 1)];
          }
        }
        return 'action';
    }
  };

  // Get next format on Enter
  const getNextFormatOnEnter = (currentFormat: string) => {
    const transitions: { [key: string]: string } = {
      'scene-header-top-line': 'scene-header-3', 
      'scene-header-3': 'action',
      'scene-header-1': 'scene-header-3',
      'scene-header-2': 'scene-header-3'
    };
  
    return transitions[currentFormat] || 'action';
  };

  // Apply format to current line
  const applyFormatToCurrentLine = (formatType: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      
      if (element) {
        element.className = formatType;
        Object.assign(element.style, getFormatStyles(formatType));
        setCurrentFormat(formatType);
      }
    }
  };

  // Format text
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  // Update content
  const updateContent = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const element = range.startContainer.parentElement;
        if (element) {
          setCurrentFormat(element.className || 'action');
        }
      }
      
      calculateStats();
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextFormat = getNextFormatOnTab(currentFormat, e.shiftKey) || 'action';
      applyFormatToCurrentLine(nextFormat);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const nextFormat = getNextFormatOnEnter(currentFormat) || 'action';
      applyFormatToCurrentLine(nextFormat);
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
        case 'B':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          formatText('underline');
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          formatText('undo');
          break;
        case 'y':
        case 'Y':
          e.preventDefault();
          formatText('redo');
          break;
        case 's':
        case 'S':
          e.preventDefault();
          console.log('Save functionality would go here');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setShowSearchDialog(true);
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          setShowReplaceDialog(true);
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          formatText('selectAll');
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          formatText('print');
          break;
        case '1':
          e.preventDefault();
          applyFormatToCurrentLine('scene-header-top-line');
          break;
        case '2':
          e.preventDefault();
          applyFormatToCurrentLine('character');
          break;
        case '3':
          e.preventDefault();
          applyFormatToCurrentLine('dialogue');
          break;
        case '4':
          e.preventDefault();
          applyFormatToCurrentLine('action');
          break;
        case '6':
          e.preventDefault();
          applyFormatToCurrentLine('transition');
          break;
      }
    }
  };

  // Post-process formatting to correct misclassifications
  const postProcessFormatting = (htmlResult: string): string => {
    // Parse the HTML result into DOM elements for easier manipulation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlResult;
    
    // Get all child elements
    const elements = Array.from(tempDiv.children);
    
    // Look for patterns that indicate misclassification
    for (let i = 0; i < elements.length - 1; i++) {
      const currentElement = elements[i] as HTMLElement;
      const nextElement = elements[i + 1] as HTMLElement;
      
      // Check if current element is an action line that starts with a bullet point and contains a colon
      if (currentElement.className === 'action') {
        const textContent = currentElement.textContent || '';
        // Check for bullet point followed by character name pattern
        const bulletCharacterPattern = /^\s*[•·●○■▪▫–—‣⁃]([^:]+):(.*)/;
        const match = textContent.match(bulletCharacterPattern);
        
        if (match && match[1] && match[2]) {
          const characterName = match[1].trim();
          const dialogueText = match[2].trim();
          
          // Convert this action line to character + dialogue
          currentElement.className = 'character';
          currentElement.textContent = characterName + ':';
          Object.assign(currentElement.style, getFormatStyles('character'));
          
          // Create a new dialogue element after this one
          const dialogueElement = document.createElement('div');
          dialogueElement.className = 'dialogue';
          dialogueElement.textContent = dialogueText;
          Object.assign(dialogueElement.style, getFormatStyles('dialogue'));
          
          // Insert the dialogue element after the character element
          if (nextElement) {
            tempDiv.insertBefore(dialogueElement, nextElement);
          } else {
            tempDiv.appendChild(dialogueElement);
          }
        }
      }
      
      // Check if current element is a dialogue line that should be an action line
      if (currentElement.className === 'dialogue') {
        const textContent = currentElement.textContent || '';
        // Check if this looks more like an action description than dialogue
        // Action descriptions often start with verbs or descriptive phrases
        const actionPatterns = [
          /^\s*[-–—]?\s*(?:[ي|ت][\u0600-\u06FF]+|نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|يظهر|تظهر)/,
          /^\s*[-–—]\s*.+/,  // Lines starting with dashes
          /^\s*(?:نرى|ننظر|نسمع|نلاحظ|نشهد|نشاهد|نلمس|نشعر|نصدق|نفهم|نصدق|نشك|نتمنى|نأمل|نخشى|نخاف|نحب|نكره|نحسد|نغبط|ن admire|نحترم)/,
          /\s+(?:يقول|تقول|قال|قالت|يقوم|تقوم|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يكتب|تكتب|ينظر|تنظر|يبتسم|تبتسم|يقف|تقف|يجلس|تجلس|يدخل|تدخل|يخرج|تخرج|يركض|تركض|يمشي|تمشي|يجري|تجرى|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يرسم|ترسم|يصمم|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن)\s+/
        ];
        
        let isActionDescription = false;
        for (const pattern of actionPatterns) {
          if (pattern.test(textContent)) {
            isActionDescription = true;
            break;
          }
        }
        
        // Additional check for longer sentences that are likely action descriptions
        if (!isActionDescription && textContent.length > 20 && ScreenplayClassifier.wordCount(textContent) > 5) {
          isActionDescription = true;
        }
        
        if (isActionDescription) {
          // Convert this dialogue line to action
          currentElement.className = 'action';
          // Remove leading dashes if present
          const cleanedText = textContent.replace(/^\s*[-–—]\s*/, '');
          currentElement.textContent = cleanedText;
          Object.assign(currentElement.style, getFormatStyles('action'));
        }
      }
    }
    
    return tempDiv.innerHTML;
  };


  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    
    if (editorRef.current) {
      const lines = pastedText.split('\n');
      let currentCharacter = '';
      let htmlResult = '';
      
      // Context object for the SceneHeaderAgent
      const ctx = { inDialogue: false };
      
      // Context tracking for better classification
      const context = {
        lastFormat: 'action',
        isInDialogueBlock: false,
        pendingCharacterLine: false
      };
      
      for (const line of lines) {
        if (ScreenplayClassifier.isBlank(line)) {
          currentCharacter = '';
          context.isInDialogueBlock = false;
          context.lastFormat = 'action';
          htmlResult += '<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;"></div>';
          continue;
        }
        
        if (ScreenplayClassifier.isBasmala(line)) {
          context.lastFormat = 'basmala';
          context.isInDialogueBlock = false;
          htmlResult += `<div class="basmala" style="direction: rtl; text-align: left; margin: 0;">${line}</div>`;
          continue;
        }
        
        // Enhanced scene header processing
        // Check for complex scene headers first
        const sceneHeaderMatch = line.trim().match(/^(مشهد\s*\d+)\s*[-–—:،]?\s*(.*)$/i);
        if (sceneHeaderMatch) {
          const sceneHeaderResult = SceneHeaderAgent(line, ctx, getFormatStyles);
          if (sceneHeaderResult && sceneHeaderResult.processed) {
            context.lastFormat = 'scene-header';
            context.isInDialogueBlock = false;
            context.pendingCharacterLine = false;
            htmlResult += sceneHeaderResult.html;
            
            // Add scene header 3 if needed (location)
            // Check if there's a separate line that might be scene header 3
            continue;
          }
        }
        
        // Use SceneHeaderAgent for proper scene header formatting
        const sceneHeaderResult = SceneHeaderAgent(line, ctx, getFormatStyles);
        if (sceneHeaderResult && sceneHeaderResult.processed) {
          context.lastFormat = 'scene-header';
          context.isInDialogueBlock = false;
          context.pendingCharacterLine = false;
          htmlResult += sceneHeaderResult.html;
          continue;
        }
        
        if (ScreenplayClassifier.isTransition(line)) {
          context.lastFormat = 'transition';
          context.isInDialogueBlock = false;
          context.pendingCharacterLine = false;
          htmlResult += `<div class="transition" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; margin: 1rem 0;">${line}</div>`;
          continue;
        }
        
        if (ScreenplayClassifier.isCharacterLine(line, context)) {
          currentCharacter = line.trim().replace(':', ''); // Remove colon for cleaner display
          context.lastFormat = 'character';
          context.isInDialogueBlock = true;
          context.pendingCharacterLine = false;
          htmlResult += `<div class="character" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; width: 2.5in; margin: 12px auto 0 auto;">${line}</div>`;
          continue;
        }
        
        if (ScreenplayClassifier.isParenShaped(line)) {
          context.lastFormat = 'parenthetical';
          context.pendingCharacterLine = false;
          htmlResult += `<div class="parenthetical" style="direction: rtl; text-align: center; font-style: italic; width: 2.0in; margin: 6px auto;">${line}</div>`;
          continue;
        }
        
        if (currentCharacter && !line.includes(':')) {
          // If we have a current character and this line doesn't look like a new character,
          // check if it's actually dialogue or just an action description
          if (ScreenplayClassifier.isLikelyAction(line)) {
            // Treat as action line
            context.lastFormat = 'action';
            context.isInDialogueBlock = false;
            context.pendingCharacterLine = false;
            // Remove leading dashes from action lines
            const cleanedLine = line.replace(/^\s*[-–—]\s*/, '');
            htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`;
            continue;
          } else {
            // Additional check for action descriptions that might be misclassified as dialogue
            // Check if this is an action description starting with a dash or descriptive verb
            const actionDescriptionPatterns = [
              /^\s*[-–—]\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
              /^\s*[-–—]\s*[ي|ت][\u0600-\u06FF]+/,  // Verbs starting with ي or ت
              /^\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/
            ];
            
            let isActionDescription = false;
            for (const pattern of actionDescriptionPatterns) {
              if (pattern.test(line)) {
                isActionDescription = true;
                break;
              }
            }
            
            if (isActionDescription) {
              // Treat as action line
              context.lastFormat = 'action';
              context.isInDialogueBlock = false;
              context.pendingCharacterLine = false;
              // Remove leading dashes from action lines
              const cleanedLine = line.replace(/^\s*[-–—]\s*/, '');
              htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`;
              continue;
            } else {
              // Treat as dialogue
              context.lastFormat = 'dialogue';
              context.pendingCharacterLine = false;
              htmlResult += `<div class="dialogue" style="direction: rtl; text-align: center; width: 2.5in; line-height: 1.2; margin: 0 auto 12px auto;">${line}</div>`;
              continue;
            }
          }
        }
        
        if (ScreenplayClassifier.isLikelyAction(line)) {
          context.lastFormat = 'action';
          context.isInDialogueBlock = false;
          context.pendingCharacterLine = false;
          // Remove leading dashes from action lines
          const cleanedLine = line.replace(/^\s*[-–—]\s*/, '');
          htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`;
          continue;
        }
        
        // Fallback - treat as action
        context.lastFormat = 'action';
        context.isInDialogueBlock = false;
        context.pendingCharacterLine = false;
        // Remove leading dashes from action lines
        const cleanedLine = line.replace(/^\s*[-–—]\s*/, '');
        htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`;
      }
      
      // Post-process to correct misclassifications
      const correctedHtmlResult = postProcessFormatting(htmlResult);
      
      // Insert the HTML at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = correctedHtmlResult;
        
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        updateContent();
      }
    }
  };

  // Fetch with retry
  const fetchWithRetry = async (
    url: string, 
    options: RequestInit, 
    retries: number = 3, 
    delay: number = 1000
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
  };

  // Handle review context
  const handleReviewContext = async () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || '';
      
      if (textContent.length < 50) {
        setReviewResult('النص قصير جداً للمراجعة. يرجى إضافة المزيد من المحتوى.');
        setIsReviewing(false);
        return;
      }
      
      setIsReviewing(true);
      
      try {
        const response = await fetch('/api/review-screenplay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textContent })
        });
        
        if (!response.ok) throw new Error('فشل في المراجعة');
        
        const data = await response.json();
        setReviewResult(data.review || 'تمت المراجعة بنجاح');
        setIsReviewing(false);
      } catch (error) {
        setReviewResult('حدث خطأ أثناء مراجعة النص. يرجى المحاولة مرة أخرى.');
        setIsReviewing(false);
      }
    }
  };

  // Effect to apply styles and update stats
  useEffect(() => {
    if (editorRef.current) {
      const divs = editorRef.current.querySelectorAll('div');
      divs.forEach((div: HTMLDivElement) => {
        const className = div.className;
        Object.assign(div.style, getFormatStyles(className));
      });
      calculateStats();
    }
  }, [selectedFont, selectedSize, htmlContent]);

  // Effect to update stats when content changes
  useEffect(() => {
    calculateStats();
  }, [htmlContent]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header 
        ref={stickyHeaderRef}
        className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-2 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-500" />
          <h1 className="text-xl font-bold">النسخة - the copy</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              العودة للرئيسية
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* File Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FileText size={16} />
              <span>ملف</span>
              <ChevronDown size={14} />
            </button>
            {showFileMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
                <button 
                  onClick={() => {
                    if (confirm('هل تريد إنشاء مستند جديد؟ سيتم فقدان التغييرات غير المحفوظة.')) {
                      setHtmlContent('');
                      setShowFileMenu(false);
                    }
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FilePlus size={16} />
                  <span>جديد</span>
                </button>
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.txt,.html';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setHtmlContent(event.target?.result as string || '');
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                    setShowFileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FolderOpen size={16} />
                  <span>فتح</span>
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `screenplay-${Date.now()}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowFileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Save size={16} />
                  <span>حفظ</span>
                </button>
                <button 
                  onClick={() => {
                    const text = editorRef.current?.innerText || '';
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `screenplay-${Date.now()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowFileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Download size={16} />
                  <span>تصدير</span>
                </button>
                <button 
                  onClick={() => {
                    window.print();
                    setShowFileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Printer size={16} />
                  <span>طباعة</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Edit Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowEditMenu(!showEditMenu)}
              className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FileText size={16} />
              <span>تحرير</span>
              <ChevronDown size={14} />
            </button>
            {showEditMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
                <button 
                  onClick={() => {
                    document.execCommand('undo');
                    setShowEditMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Undo size={16} />
                  <span>تراجع</span>
                </button>
                <button 
                  onClick={() => {
                    document.execCommand('redo');
                    setShowEditMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Redo size={16} />
                  <span>إعادة</span>
                </button>
                <button 
                  onClick={() => {
                    document.execCommand('cut');
                    setShowEditMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Scissors size={16} />
                  <span>قص</span>
                </button>
                <button 
                  onClick={() => {
                    document.execCommand('copy');
                    setShowEditMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FileText size={16} />
                  <span>نسخ</span>
                </button>
                <button 
                  onClick={() => setShowSearchDialog(true)}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Search size={16} />
                  <span>بحث</span>
                </button>
                <button 
                  onClick={() => setShowReplaceDialog(true)}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Replace size={16} />
                  <span>استبدال</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Format Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowFormatMenu(!showFormatMenu)}
              className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Type size={16} />
              <span>تنسيق</span>
              <ChevronDown size={14} />
            </button>
            {showFormatMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
                <button 
                  onClick={() => applyFormatToCurrentLine('scene-header-top-line')}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Film size={16} />
                  <span>ترويسة مشهد (سطر علوي)</span>
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('character')}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <UserSquare size={16} />
                  <span>شخصية</span>
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('dialogue')}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <MessageCircle size={16} />
                  <span>حوار</span>
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('action')}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Feather size={16} />
                  <span>فعل</span>
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('transition')}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FastForward size={16} />
                  <span>انتقال</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Tools Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Settings size={16} />
              <span>أدوات</span>
              <ChevronDown size={14} />
            </button>
            {showToolsMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
                <button 
                  onClick={() => setShowCharacterRename(true)}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <UserSquare size={16} />
                  <span>إعادة تسمية شخصية</span>
                </button>
                <button 
                  onClick={() => setShowReviewerDialog(true)}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Sparkles size={16} />
                  <span>مراجعة سياقية</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Top Toolbar - All buttons arranged horizontally */}
        <div className="h-12 bg-gray-100 dark:bg-gray-800 flex items-center py-2 px-2 space-x-2">
          {/* Formatting Buttons */}
          <div className="flex space-x-1">
            <button 
              onClick={() => applyFormatToCurrentLine('scene-header-top-line')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="ترويسة مشهد"
            >
              <Film size={18} />
            </button>
            <button 
              onClick={() => applyFormatToCurrentLine('character')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="شخصية"
            >
              <UserSquare size={18} />
            </button>
            <button 
              onClick={() => applyFormatToCurrentLine('dialogue')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="حوار"
            >
              <MessageCircle size={18} />
            </button>
            <button 
              onClick={() => applyFormatToCurrentLine('action')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="فعل"
            >
              <Feather size={18} />
            </button>
            <button 
              onClick={() => applyFormatToCurrentLine('transition')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="انتقال"
            >
              <FastForward size={18} />
            </button>
          </div>
          
          {/* Divider */}
          <div className="border-r border-gray-300 dark:border-gray-600 h-8 mx-1"></div>
          
          {/* Text Formatting Buttons */}
          <div className="flex space-x-1">
            <button 
              onClick={() => formatText('bold')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="عريض"
            >
              <Bold size={18} />
            </button>
            <button 
              onClick={() => formatText('italic')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="مائل"
            >
              <Italic size={18} />
            </button>
            <button 
              onClick={() => formatText('underline')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="مسطر"
            >
              <Underline size={18} />
            </button>
          </div>
          
          {/* Divider */}
          <div className="border-r border-gray-300 dark:border-gray-600 h-8 mx-1"></div>
          
          {/* View Controls */}
          <div className="flex space-x-1">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setShowRulers(!showRulers)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title="المساطر"
            >
              <MoveVertical size={18} />
            </button>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 flex mt-2">
          {/* Rulers */}
          {showRulers && (
            <div className="w-8 relative border-l border-gray-300 dark:border-gray-600">
              <div className="absolute inset-0 flex flex-col items-center justify-start pt-4">
                {Array.from({ length: 50 }, (_, i) => (
                  <div key={i} className="relative w-full flex justify-center">
                    <div 
                      className={`w-4 border-t ${i % 5 === 0 ? 'border-gray-500' : 'border-gray-300 dark:border-gray-600'}`}
                    ></div>
                    {i % 5 === 0 && (
                      <span 
                        className="absolute -left-4 top-0 text-xs text-gray-500"
                        style={{ top: '-6px' }}
                      >
                        {i}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* File Upload and Editor Container */}
          <div className="flex-1">
            {/* File Upload Section */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
              <FileUpload
                onFileContent={(content, filename) => {
                  setHtmlContent('');
                  const lines = content.split('\n');
                  let htmlResult = '';
                  
                  for (const line of lines) {
                    if (!line.trim()) {
                      htmlResult += '<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;"></div>';
                      continue;
                    }
                    htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${line}</div>`;
                  }
                  
                  setHtmlContent(htmlResult);
                }}
              />
            </div>
            
            {/* Editor */}
            <div 
              ref={editorRef}
              contentEditable
              className="min-h-screen p-8 outline-none"
              style={{ 
                direction: 'rtl',
                fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
                fontSize: selectedSize,
                backgroundColor: 'white',
                color: 'black',
                width: '21cm',
                minHeight: '29.7cm',
                margin: '0 auto',
                padding: '2cm',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
              onInput={updateContent}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              dangerouslySetInnerHTML={{
                __html: htmlContent || '<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">اضغط هنا لبدء كتابة السيناريو...</div>'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 p-2 flex justify-between text-sm">
        <div className="flex space-x-4">
          <span>التنسيق: {currentFormat}</span>
          <span>الصفحة: {documentStats.pages}</span>
          <span>المشاهد: {documentStats.scenes}</span>
        </div>
        <div className="flex space-x-4">
          <span>الكلمات: {documentStats.words}</span>
          <span>الأحرف: {documentStats.characters}</span>
        </div>
      </div>
      
      {/* Search Dialog */}
      {showSearchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">بحث</h3>
              <button onClick={() => setShowSearchDialog(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800"
              placeholder="أدخل نص البحث..."
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowSearchDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  if (searchTerm && editorRef.current) {
                    (window as any).find?.(searchTerm);
                  }
                  setShowSearchDialog(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                بحث
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Replace Dialog */}
      {showReplaceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">بحث واستبدال</h3>
              <button onClick={() => setShowReplaceDialog(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-800"
              placeholder="أدخل نص البحث..."
            />
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800"
              placeholder="أدخل نص الاستبدال..."
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowReplaceDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  if (searchTerm && editorRef.current) {
                    const content = editorRef.current.innerHTML;
                    const newContent = content.replaceAll(searchTerm, replaceTerm);
                    setHtmlContent(newContent);
                  }
                  setShowReplaceDialog(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                استبدال الكل
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Character Rename Dialog */}
      {showCharacterRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إعادة تسمية شخصية</h3>
              <button onClick={() => setShowCharacterRename(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800"
              placeholder="أدخل اسم الشخصية الجديد..."
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowCharacterRename(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  // Rename functionality would go here
                  setShowCharacterRename(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reviewer Dialog */}
      {showReviewerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">مراجعة سياقية</h3>
              <button onClick={() => setShowReviewerDialog(false)}>
                <X size={20} />
              </button>
            </div>
            <button
              onClick={() => handleReviewContext()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              ابدأ بالمراجعة
            </button>
            {isReviewing && <span className="mt-2 block">جارٍ بالمراجعة...</span>}
            <div className="mt-4">
              <pre>{reviewResult}</pre>
            </div>
          </div>
        </div>
      )}
      {showCharacterRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إعادة تسمية شخصية</h3>
              <button onClick={() => setShowCharacterRename(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={oldCharacterName}
              onChange={(e) => setOldCharacterName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-800"
              placeholder="اسم الشخصية الحالية..."
            />
            <input
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800"
              placeholder="الاسم الجديد..."
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowCharacterRename(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  if (oldCharacterName && newCharacterName && editorRef.current) {
                    const characterDivs = editorRef.current.querySelectorAll('.character');
                    characterDivs.forEach((div: Element) => {
                      if (div.textContent?.includes(oldCharacterName)) {
                        div.textContent = div.textContent.replace(oldCharacterName, newCharacterName);
                      }
                    });
                    updateContent();
                  }
                  setShowCharacterRename(false);
                  setOldCharacterName('');
                  setNewCharacterName('');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                إعادة تسمية
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reviewer Dialog */}
      {showReviewerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-2/3 max-h-2/3 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">مراجعة سياقية</h3>
              <button onClick={() => setShowReviewerDialog(false)}>
                <X size={20} />
              </button>
            </div>
            
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin" size={32} />
                <p className="mt-4">جاري مراجعة النص...</p>
              </div>
            ) : reviewResult ? (
              <div className="mb-4">
                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  {reviewResult}
                </pre>
              </div>
            ) : (
              <div className="mb-4">
                <p>هل تريد مراجعة السياق لهذا السيناريو؟</p>
                <p className="text-sm text-gray-500 mt-2">
                  سيتم إرسال النص إلى خدمة Gemini للحصول على ملاحظات على استمرارية الحبكة، تطور الشخصيات، قوة الحوار، والتناقضات.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowReviewerDialog(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
              >
                إغلاق
              </button>
              {!isReviewing && !reviewResult && (
                <button 
                  onClick={handleReviewContext}
                  className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                >
                  <Sparkles size={16} className="ml-2" />
                  مراجعة
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add the SceneHeaderAgent function
const SceneHeaderAgent = (line: string, ctx: any, getFormatStylesFn: (formatType: string) => React.CSSProperties) => {
  const classifier = new ScreenplayClassifier();
  const Patterns = classifier.Patterns;
  const trimmedLine = line.trim();
  
  // Check for scene header with number and optional time/location info
  const m2 = trimmedLine.match(/^(مشهد\s*\d+)\s*[-–—:،]?\s*(.*)$/i);
  
  if (m2 && m2[1] && m2[2]) {
    const head = m2[1].trim(); // "مشهد 1"
    const rest = m2[2].trim(); // "ليل-داخلي" or similar
    
    // Enhanced pattern matching for complex scene headers
    // Handle cases like "ليل-داخلي" or "ليل - داخلي"
    if (rest && (Patterns.sceneHeader2.time.test(rest) || Patterns.sceneHeader2.inOut.test(rest))) {
      // Create container for the top line
      const container = document.createElement('div');
      container.className = 'scene-header-top-line';
      Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));
      
      // Create first part (scene number)
      const part1 = document.createElement('span');
      part1.className = 'scene-header-1';
      part1.textContent = head;
      Object.assign(part1.style, getFormatStylesFn('scene-header-1'));
      
      // Create second part (time and location)
      const part2 = document.createElement('span');
      part2.className = 'scene-header-2';
      part2.textContent = rest;
      Object.assign(part2.style, getFormatStylesFn('scene-header-2'));

      container.appendChild(part1);
      container.appendChild(part2);
      ctx.inDialogue = false;
      return { html: container.outerHTML, processed: true };
    } else if (rest) {
      // If there's location information or complex scene header
      // Check if it's a complex location like "قصر المُشتكي –   غرفة الكهف"
      if (rest.includes('–') || rest.includes('-')) {
        // Create container for the top line
        const container = document.createElement('div');
        container.className = 'scene-header-top-line';
        Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));
        
        // Create first part (scene number)
        const part1 = document.createElement('span');
        part1.className = 'scene-header-1';
        part1.textContent = head;
        Object.assign(part1.style, getFormatStylesFn('scene-header-1'));
        
        // Create second part (complex location)
        const part2 = document.createElement('span');
        part2.className = 'scene-header-2';
        part2.textContent = rest;
        Object.assign(part2.style, getFormatStylesFn('scene-header-2'));

        container.appendChild(part1);
        container.appendChild(part2);
        ctx.inDialogue = false;
        return { html: container.outerHTML, processed: true };
      } else {
        // Just scene number with simple text
        const container = document.createElement('div');
        container.className = 'scene-header-top-line';
        Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));
        
        const part1 = document.createElement('span');
        part1.className = 'scene-header-1';
        part1.textContent = head;
        Object.assign(part1.style, getFormatStylesFn('scene-header-1'));
        
        // Add the rest as scene header 2
        const part2 = document.createElement('span');
        part2.className = 'scene-header-2';
        part2.textContent = rest;
        Object.assign(part2.style, getFormatStylesFn('scene-header-2'));
        
        container.appendChild(part1);
        container.appendChild(part2);
        ctx.inDialogue = false;
        return { html: container.outerHTML, processed: true };
      }
    } else {
      // Just scene number
      const container = document.createElement('div');
      container.className = 'scene-header-top-line';
      Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));
      
      const part1 = document.createElement('span');
      part1.className = 'scene-header-1';
      part1.textContent = head;
      Object.assign(part1.style, getFormatStylesFn('scene-header-1'));
      
      container.appendChild(part1);
      ctx.inDialogue = false;
      return { html: container.outerHTML, processed: true };
    }
  }
  
  // Check for standalone location names (scene header 3)
  if (Patterns.sceneHeader3.test(trimmedLine)) {
    const element = document.createElement('div');
    element.className = 'scene-header-3';
    element.textContent = trimmedLine;
    Object.assign(element.style, getFormatStylesFn('scene-header-3'));
    ctx.inDialogue = false;
    return { html: element.outerHTML, processed: true };
  }
  
  return null;
};
