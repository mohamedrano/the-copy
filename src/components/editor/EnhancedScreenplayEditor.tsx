import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Loader2, Sun, Moon, FileText, Bold, Italic, Underline, 
  MoveVertical, Type, Search, Replace, Save, FolderOpen, 
  Printer, Settings, Download, FilePlus, 
  Undo, Redo, Scissors, Film, Camera, Feather, UserSquare, Parentheses, MessageCircle, 
  FastForward, ChevronDown, BookHeart, Brain, Zap, BarChart3, Users, PenTool,
  Activity, Globe, Database, Share2, Check, Edit3, Trash2, Copy, ExternalLink
} from 'lucide-react';

// Enhanced system classes from النظام الجديد
class StorageManager {
  saveSettings(settings: any) {
    localStorage.setItem('screenplay-settings', JSON.stringify(settings));
    return true;
  }

  loadSettings() {
    const saved = localStorage.getItem('screenplay-settings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      font: 'Amiri',
      fontSize: '14pt',
      showRulers: true,
      autoSave: true,
      language: 'ar',
      spellCheck: true,
      geminiApiKey: ''
    };
  }

  saveDocument(content: string, metadata: any) {
    localStorage.setItem('screenplay-document', JSON.stringify({ content, metadata, timestamp: Date.now() }));
    return true;
  }

  loadDocument() {
    const saved = localStorage.getItem('screenplay-document');
    return saved ? JSON.parse(saved) : null;
  }
}

class NotificationManager {
  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  private show(message: string, type: string) {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

class AIWritingAssistant {
  async generateText(prompt: string, context: string) {
    // Simulate AI response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `نص مُولد بواسطة الذكاء الاصطناعي استنادًا إلى: "${prompt}"\n\nهذا نص تجريبي يُظهر كيف يمكن للمساعد إنشاء محتوى مفيد للمؤلف.`
        });
      }, 1500);
    });
  }

  async analyzeScript(content: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          characterCount: content.length,
          wordCount: content.split(/\s+/).length,
          sceneCount: (content.match(/مشهد\s*\d+/gi) || []).length,
          suggestions: [
            'تحسين تطوير الشخصيات',
            'إضافة المزيد من التفاصيل الوصفية',
            'تقوية الحوار'
          ]
        });
      }, 2000);
    });
  }
}

class CollaborationSystem {
  private collaborators: any[] = [];
  private comments: any[] = [];

  addCollaborator(collaborator: any) {
    this.collaborators.push(collaborator);
  }

  getCollaborators() {
    return [...this.collaborators];
  }

  addComment(comment: any) {
    this.comments.push(comment);
  }

  getComments() {
    return [...this.comments];
  }
}

class ExportManager {
  async exportDocument(content: string, format: string, options: any) {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.fileName || 'screenplay'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Enhanced Screenplay Editor Component
export default function EnhancedScreenplayEditor() {
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

  // Enhanced features states
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Menu states
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  // Dialog states
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);

  // Enhanced system instances
  const storageManager = useRef(new StorageManager());
  const notificationManager = useRef(new NotificationManager());
  const aiAssistant = useRef(new AIWritingAssistant());
  const collaborationSystem = useRef(new CollaborationSystem());
  const exportManager = useRef(new ExportManager());

  // Format styles
  const getFormatStyles = (formatType: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
      fontSize: selectedSize,
      direction: 'rtl',
      lineHeight: '1.8',
      minHeight: '1.2em'
    };

    const formatStyles: { [key: string]: React.CSSProperties } = {
      'basmala': { textAlign: 'center', fontWeight: 'bold', margin: '0' },
      'scene-header-top-line': { display: 'flex', justifyContent: 'space-between', width: '100%', margin: '1rem 0 0 0' },
      'scene-header-3': { textAlign: 'center', fontWeight: 'bold', margin: '0 0 1rem 0' },
      'action': { textAlign: 'right', margin: '12px 0' },
      'character': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', width: '2.5in', margin: '12px auto 0 auto' },
      'parenthetical': { textAlign: 'center', fontStyle: 'italic', width: '2.0in', margin: '6px auto' },
      'dialogue': { textAlign: 'center', width: '2.5in', lineHeight: '1.2', margin: '0 auto 12px auto' },
      'transition': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', margin: '1rem 0' },
    };

    return { ...baseStyles, ...formatStyles[formatType] };
  };

  // Calculate document stats
  const calculateStats = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || '';
      const characters = textContent.length;
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      const scenes = (textContent.match(/مشهد\s*\d+/gi) || []).length;
      const scrollHeight = editorRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(scrollHeight / (29.7 * 37.8)));
      
      setDocumentStats({ characters, words, pages, scenes });
    }
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

  // Handle AI text generation
  const handleAIGeneration = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await aiAssistant.current.generateText(aiPrompt, editorRef.current?.innerText || '');
      
      // Insert generated text
      if (editorRef.current && result.text) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const textNode = document.createTextNode(result.text);
          range.insertNode(textNode);
          updateContent();
        }
      }
      
      notificationManager.current.success('تم توليد النص بنجاح');
      setAiPrompt('');
    } catch (error) {
      notificationManager.current.error('فشل في توليد النص');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle script analysis
  const handleScriptAnalysis = async () => {
    if (!editorRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const content = editorRef.current.innerText;
      const result = await aiAssistant.current.analyzeScript(content);
      setAnalysisResult(result);
      notificationManager.current.success('تم تحليل السيناريو بنجاح');
    } catch (error) {
      notificationManager.current.error('فشل في تحليل السيناريو');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update content
  const updateContent = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
      calculateStats();
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Tab navigation logic here
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter navigation logic here
    }
    
    setTimeout(updateContent, 10);
  };

  // Save document
  const saveDocument = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const metadata = {
        title: 'سيناريو',
        author: 'المؤلف',
        createdAt: new Date().toISOString()
      };
      
      storageManager.current.saveDocument(content, metadata);
      notificationManager.current.success('تم حفظ الوثيقة');
    }
  };

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = `
        <div class="basmala" style="${Object.entries(getFormatStyles('basmala')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          بسم الله الرحمن الرحيم
        </div>
        <div class="scene-header-3" style="${Object.entries(getFormatStyles('scene-header-3')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          مشهد 1
        </div>
        <div class="action" style="${Object.entries(getFormatStyles('action')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          [وصف المشهد والأفعال هنا]
        </div>
      `;
      updateContent();
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Enhanced Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <Brain className="text-purple-500" />
            <h1 className="text-xl font-bold">محرر السيناريو المتقدم</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-500"
              title="مساعد الذكاء الاصطناعي"
            >
              <Sparkles size={20} />
            </button>
            
            <button 
              onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
              title="تحليلات السيناريو"
            >
              <BarChart3 size={20} />
            </button>
            
            <button 
              onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500"
              title="التعاون"
            >
              <Users size={20} />
            </button>
            
            <button 
              onClick={saveDocument}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="حفظ"
            >
              <Save size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1 p-4">
          <div 
            ref={editorRef}
            contentEditable
            className="min-h-[70vh] p-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ 
              fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
              fontSize: selectedSize,
              direction: 'rtl',
              lineHeight: '1.8'
            }}
            onKeyDown={handleKeyDown}
            onInput={updateContent}
          />
        </div>
        
        {/* Enhanced Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Stats Panel */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-2">الإحصائيات</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
                <div className="text-blue-600 dark:text-blue-300">الصفحات</div>
                <div className="font-bold">{documentStats.pages}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
                <div className="text-green-600 dark:text-green-300">الكلمات</div>
                <div className="font-bold">{documentStats.words}</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900 p-2 rounded">
                <div className="text-yellow-600 dark:text-yellow-300">الأحرف</div>
                <div className="font-bold">{documentStats.characters}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded">
                <div className="text-purple-600 dark:text-purple-300">المشاهد</div>
                <div className="font-bold">{documentStats.scenes}</div>
              </div>
            </div>
          </div>

          {/* AI Panel */}
          {showAIPanel && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold mb-2 flex items-center">
                <Sparkles className="ml-2" size={16} />
                مساعد الذكاء الاصطناعي
              </h3>
              <div className="space-y-3">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="اكتب طلبك للذكاء الاصطناعي..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                  rows={3}
                />
                <button
                  onClick={handleAIGeneration}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center"
                >
                  {isGenerating ? <Loader2 className="animate-spin ml-2" size={16} /> : <PenTool className="ml-2" size={16} />}
                  {isGenerating ? 'جاري التوليد...' : 'توليد النص'}
                </button>
              </div>
            </div>
          )}

          {/* Analytics Panel */}
          {showAnalyticsPanel && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold mb-2 flex items-center">
                <BarChart3 className="ml-2" size={16} />
                تحليلات السيناريو
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleScriptAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin ml-2" size={16} /> : <Activity className="ml-2" size={16} />}
                  {isAnalyzing ? 'جاري التحليل...' : 'تحليل السيناريو'}
                </button>
                
                {analysisResult && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                    <h4 className="font-bold mb-2">نتائج التحليل:</h4>
                    <div className="space-y-1">
                      <div>الأحرف: {analysisResult.characterCount}</div>
                      <div>الكلمات: {analysisResult.wordCount}</div>
                      <div>المشاهد: {analysisResult.sceneCount}</div>
                    </div>
                    <div className="mt-2">
                      <h5 className="font-bold">اقتراحات:</h5>
                      <ul className="list-disc list-inside text-xs">
                        {analysisResult.suggestions?.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collaboration Panel */}
          {showCollaborationPanel && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold mb-2 flex items-center">
                <Users className="ml-2" size={16} />
                التعاون
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  لا يوجد متعاونون حالياً
                </div>
                <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center justify-center">
                  <Share2 className="ml-2" size={16} />
                  دعوة متعاونين
                </button>
              </div>
            </div>
          )}

          {/* Quick Format Tools */}
          <div className="p-4">
            <h3 className="font-bold mb-2">أدوات التنسيق السريع</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => applyFormatToCurrentLine('scene-header-3')}
                className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-sm flex items-center"
              >
                <Film size={14} className="ml-1" />
                مشهد
              </button>
              <button 
                onClick={() => applyFormatToCurrentLine('character')}
                className="p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded text-sm flex items-center"
              >
                <UserSquare size={14} className="ml-1" />
                شخصية
              </button>
              <button 
                onClick={() => applyFormatToCurrentLine('dialogue')}
                className="p-2 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded text-sm flex items-center"
              >
                <MessageCircle size={14} className="ml-1" />
                حوار
              </button>
              <button 
                onClick={() => applyFormatToCurrentLine('action')}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm flex items-center"
              >
                <Feather size={14} className="ml-1" />
                حدث
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}