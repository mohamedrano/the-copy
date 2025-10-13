// ======================= ENHANCED MAIN APPLICATION ============================

document.addEventListener('DOMContentLoaded', async () => {
    // -------------------- تهيئة المتغيرات العامة --------------------
    
    const editor = document.getElementById('editor');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const docStatsEl = document.getElementById('doc-stats');
    const currentFormatLabel = document.getElementById('current-format-label');
    const pageBackgroundsContainer = document.getElementById('page-backgrounds');
    const scrollContainer = document.getElementById('scroll-container');
    const stickyHeader = document.getElementById('sticky-header');
    const stickyRulerWrapper = document.getElementById('sticky-ruler-wrapper');
    const rulerHContainer = document.getElementById('ruler-horizontal-container');
    const rulerVContainer = document.getElementById('ruler-vertical-container');
    const formatsToolbar = document.getElementById('formats-toolbar');
    const leftSidebarButtons = document.getElementById('left-sidebar-buttons');

    // -------------------- تهيئة المدراء والخدمات --------------------
    
    const storageManager = new StorageManager();
    const keyboardManager = new KeyboardManager();
    const exportManager = new ExportManager();
    const notificationManager = new NotificationManager();
    const geminiCoordinator = new GeminiCoordinator();
    const textProcessor = new TextProcessor();
    const classifier = new ScreenplayClassifier();

    // -------------------- متغيرات الحالة --------------------
    
    let settings = storageManager.loadSettings();
    let isDarkMode = settings.theme === 'dark';
    let currentFormat = 'action';
    let selectedFont = settings.font;
    let selectedSize = settings.fontSize;
    let pageCount = 1;
    let showRulers = settings.showRulers;
    let undoStack = [];
    let redoStack = [];
    let globalLineCounter = 0;
    let isAuditing = false;
    let isImporting = false;
    let autoSaveTimer = null;
    let documentModified = false;

    // -------------------- ثوابت التطبيق --------------------
    
    const PIXELS_PER_CM = 37.79;
    const A4_PAGE_HEIGHT_PX = 1123;
    const CHARACTER_MARGIN = '260px';
    const PARENTHETICAL_MARGIN = '280px';
    const DIALOGUE_MARGIN = '240px';
    const BASMALA_FONT_SIZE = '16pt';
    const AUTO_SAVE_INTERVAL = 30000; // 30 ثانية
    const MAX_UNDO_STACK = 50;

    // -------------------- تكوين تنسيقات السيناريو --------------------
    
    const screenplayFormats = [
        { id: 'basmala', label: 'بسملة', shortcut: '', color: 'bg-purple-100', icon: ICONS.BookHeart },
        { id: 'scene-header-1', label: 'عنوان المشهد (1)', shortcut: 'Ctrl+1', color: 'bg-blue-100', icon: ICONS.Film },
        { id: 'scene-header-2', label: 'عنوان المشهد (2)', shortcut: 'Tab', color: 'bg-blue-50', icon: ICONS.MapPin },
        { id: 'scene-header-3', label: 'عنوان المشهد (3)', shortcut: 'Tab', color: 'bg-blue-25', icon: ICONS.Camera },
        { id: 'action', label: 'الفعل/الحدث', shortcut: 'Ctrl+4', color: 'bg-gray-100', icon: ICONS.Feather },
        { id: 'character', label: 'شخصية', shortcut: 'Ctrl+2', color: 'bg-green-100', icon: ICONS.UserSquare },
        { id: 'parenthetical', label: 'بين قوسين', shortcut: 'Tab', color: 'bg-yellow-100', icon: ICONS.Parentheses },
        { id: 'dialogue', label: 'حوار', shortcut: 'Ctrl+3', color: 'bg-orange-100', icon: ICONS.MessageCircle },
        { id: 'transition', label: 'انتقال', shortcut: 'Ctrl+6', color: 'bg-red-100', icon: ICONS.FastForward }
    ];

    const dramaAnalyzerTools = [
        { id: 'day-night', label: 'وضع الرؤية', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2m-8-10h2m16 0h2m-2.93-7.07l1.41 1.41M6.34 17.66l1.41 1.41M2 12h2M20 12h2m-2.93 7.07l1.41-1.41M6.34 6.34l1.41-1.41"></path></svg>`, action: toggleDarkMode },
        { id: 'scene-header-1', label: 'رأس المشهد', icon: ICONS.Film, action: () => applyFormatToCurrentLine('scene-header-1') },
        { id: 'action', label: 'الحركة/الوصف', icon: ICONS.Feather, action: () => applyFormatToCurrentLine('action') },
        { id: 'character', label: 'الشخصية', icon: ICONS.UserSquare, action: () => applyFormatToCurrentLine('character') },
        { id: 'dialogue', label: 'الحوار', icon: ICONS.MessageCircle, action: () => applyFormatToCurrentLine('dialogue') },
        { id: 'transition', label: 'الانتقال', icon: ICONS.FastForward, action: () => applyFormatToCurrentLine('transition') }
    ];

    // -------------------- دوال التنسيق المحسنة --------------------
    
    function getFormatStyles(formatType) {
        const base = {
            fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
            fontSize: selectedSize,
            direction: 'rtl',
            margin: '0',
            lineHeight: '1.6',
            minHeight: '1.6em'
        };

        const formatMap = {
            'basmala': { textAlign: 'center', fontWeight: 'bold', fontSize: BASMALA_FONT_SIZE },
            'scene-header-1': { textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', padding: '0 4px' },
            'scene-header-2': { textAlign: 'right', fontStyle: 'italic' },
            'scene-header-3': { textAlign: 'center', fontWeight: 'bold' },
            'action': { textAlign: 'right' },
            'character': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', margin: `0 ${CHARACTER_MARGIN}` },
            'parenthetical': { textAlign: 'center', fontStyle: 'italic', margin: `0 ${PARENTHETICAL_MARGIN}` },
            'dialogue': { textAlign: 'center', margin: `0 ${DIALOGUE_MARGIN}` },
            'transition': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }
        };

        return { ...base, ...(formatMap[formatType] || {}) };
    }

    function calculateStats() {
        try {
            const content = editor.textContent || '';
            const characters = content.length;
            const words = content.trim().split(/\s+/).filter(Boolean).length;
            const scenes = editor.querySelectorAll('.scene-header-1').length;
            const newPageCount = Math.max(1, Math.ceil(editor.scrollHeight / (A4_PAGE_HEIGHT_PX + 20)));

            docStatsEl.innerHTML = `
                <span>${newPageCount} صفحة</span>
                <span>${words} كلمة</span>
                <span>${characters} حرف</span>
                <span>${scenes} مشهد</span>
            `;

            if (newPageCount !== pageCount) {
                pageCount = newPageCount;
                renderPageBackgrounds();
            }

            // حفظ تلقائي إذا كان مفعلاً
            if (settings.autoSave && documentModified) {
                scheduleAutoSave();
            }

        } catch (error) {
            console.error('خطأ في حساب الإحصائيات:', error);
            notificationManager.error('خطأ في حساب إحصائيات الوثيقة');
        }
    }

    function reapplyAllStyles() {
        if (!editor) return;
        
        try {
            editor.querySelectorAll('div[class]').forEach(div => {
                const styles = getFormatStyles(div.className);
                Object.assign(div.style, styles);
            });
            calculateStats();
        } catch (error) {
            console.error('خطأ في إعادة تطبيق الأنماط:', error);
        }
    }

    // -------------------- إدارة المحتوى المحسنة --------------------
    
    function updateContent(shouldSaveToUndo = true) {
        if (!editor) return;
        
        try {
            const html = editor.innerHTML;
            documentModified = true;

            if (shouldSaveToUndo && undoStack[undoStack.length - 1] !== html) {
                undoStack.push(html);
                if (undoStack.length > MAX_UNDO_STACK) undoStack.shift();
                redoStack = [];
            }

            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                let el = sel.getRangeAt(0).commonAncestorContainer;
                while (el && el.nodeName !== 'DIV') el = el.parentNode;

                if (el && el.className) {
                    const fmt = screenplayFormats.find(f => f.id === el.className)?.id;
                    setCurrentFormat(fmt || 'action');
                } else {
                    setCurrentFormat('action');
                }
            }

            calculateStats();
            
        } catch (error) {
            console.error('خطأ في تحديث المحتوى:', error);
            notificationManager.error('خطأ في تحديث المحتوى');
        }
    }

    function applyFormatToCurrentLine(formatType, styleOverride = {}) {
        try {
            document.execCommand('formatBlock', false, 'div');
            const sel = window.getSelection();

            if (!sel.rangeCount) return;

            let el = sel.getRangeAt(0).commonAncestorContainer;
            while (el && el.nodeName !== 'DIV') el = el.parentNode;

            if (!el || el.nodeName !== 'DIV') {
                const range = sel.getRangeAt(0);
                const div = document.createElement('div');

                try {
                    range.surroundContents(div);
                    el = div;
                } catch {
                    const txt = range.toString();
                    range.deleteContents();
                    div.textContent = txt || '\u00A0';
                    range.insertNode(div);
                    el = div;
                }
            }

            if (el) {
                el.className = formatType;
                Object.assign(el.style, getFormatStyles(formatType), styleOverride);
                setCurrentFormat(formatType);
                updateContent();
            }

        } catch (error) {
            console.error('خطأ في تطبيق التنسيق:', error);
            notificationManager.error('خطأ في تطبيق التنسيق');
        }
    }

    // -------------------- معالجة الملصقات المحسنة --------------------
    
    async function handlePaste(e) {
        e.preventDefault();
        
        try {
            setImportingStatus(true);
            
            const textData = e.clipboardData.getData('text/plain');
            if (!textData) {
                notificationManager.warning('لا توجد بيانات نصية للصق');
                return;
            }

            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const lines = textData.split('\n');
            const contentLines = [];
            let previousFormatClass = currentFormat;

            // معالجة ذكية لكل سطر
            for (const line of lines) {
                const cleanedLine = textProcessor.cleanFormat(line);
                
                if (!cleanedLine.trim()) {
                    continue;
                }

                // استخدام التصنيف الذكي إذا كان متاحاً
                let formatClass = 'action';
                try {
                    const classificationResult = await geminiCoordinator.classifyWithAgents(
                        cleanedLine, 
                        { previousFormat: previousFormatClass }
                    );
                    formatClass = classificationResult.classification;
                } catch (error) {
                    // استخدام التصنيف المحلي كبديل
                    formatClass = classifier.classifyLine(cleanedLine, previousFormatClass);
                }

                let finalText = cleanedLine;
                let isHtml = false;

                // معالجة خاصة لرؤوس المشاهد المنقسمة
                if (formatClass === 'scene-header-1-split') {
                    const splitResult = classifier.splitSceneHeader(cleanedLine);
                    if (splitResult) {
                        formatClass = 'scene-header-1';
                        finalText = `<span>${splitResult.sceneNumber}</span><span>${splitResult.sceneInfo}</span>`;
                        isHtml = true;
                    }
                }

                // معالجة الحوار المضمن
                else if (formatClass === 'character-inline') {
                    const parts = cleanedLine.split(/:/);
                    const namePart = parts.shift().trim();
                    const dialoguePart = parts.join(':').trim();

                    contentLines.push({ content: namePart + ':', format: 'character', isHtml: false });
                    if (dialoguePart) {
                        contentLines.push({ content: dialoguePart, format: 'dialogue', isHtml: false });
                    }
                    previousFormatClass = 'dialogue';
                    continue;
                }

                // تنسيق أسماء الشخصيات
                if (formatClass === 'character') {
                    finalText = textProcessor.formatCharacterName(finalText);
                }

                contentLines.push({ content: finalText, format: formatClass, isHtml: isHtml });
                if (finalText.trim()) {
                    previousFormatClass = formatClass;
                }
            }

            // تطبيع المسافات
            const normalizedLines = normalizeSpacing(contentLines);
            await insertFormattedContent(normalizedLines, selection);

            notificationManager.success('تم لصق النص وتنسيقه بنجاح');

        } catch (error) {
            console.error('خطأ في اللصق:', error);
            notificationManager.error(`فشل في لصق النص: ${error.message}`);
        } finally {
            setImportingStatus(false);
        }
    }

    async function insertFormattedContent(contentLines, selection) {
        try {
            let formattedHTML = '';

            for (const line of contentLines) {
                const lineIndex = globalLineCounter++;
                const div = document.createElement('div');

                div.setAttribute('data-line-index', String(lineIndex));
                
                if (line.isEmpty) {
                    div.className = 'action';
                    div.innerHTML = '<br>';
                } else {
                    div.className = line.format;
                    if (line.isHtml) {
                        div.innerHTML = line.content;
                    } else {
                        div.textContent = line.content || ' ';
                    }
                }

                Object.assign(div.style, getFormatStyles(div.className));
                formattedHTML += div.outerHTML;
            }

            const range = selection.getRangeAt(0);
            range.deleteContents();

            const fragment = range.createContextualFragment(formattedHTML);
            const lastNode = fragment.lastChild;

            range.insertNode(fragment);
            
            if (lastNode) {
                const newRange = document.createRange();
                newRange.setStartAfter(lastNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }

            updateContent();

        } catch (error) {
            console.error('خطأ في إدراج المحتوى:', error);
            throw new Error('فشل في إدراج المحتوى المنسق');
        }
    }

    // -------------------- إدارة الملفات المحسنة --------------------
    
    async function handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setImportingStatus(true);
            notificationManager.info('جاري استيراد الملف...');

            // التحقق من نوع الملف
            const allowedTypes = ['.txt', '.rtf', '.doc', '.docx'];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            
            if (!allowedTypes.includes(fileExtension)) {
                throw new Error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`);
            }

            createNewDocument();
            const text = await fileReaderService.extractTextFromFile(file);
            
            // محاكاة حدث اللصق
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', text);
            await handlePaste({ 
                preventDefault: () => {}, 
                clipboardData: dataTransfer 
            });

            notificationManager.success(`تم استيراد الملف "${file.name}" بنجاح`);

        } catch (error) {
            console.error('خطأ في استيراد الملف:', error);
            notificationManager.error(`فشل استيراد الملف: ${error.message}`);
        } finally {
            setImportingStatus(false);
            e.target.value = '';
        }
    }

    // -------------------- الحفظ والتحميل التلقائي --------------------
    
    function scheduleAutoSave() {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        autoSaveTimer = setTimeout(() => {
            saveDocumentToStorage(false);
            documentModified = false;
        }, AUTO_SAVE_INTERVAL);
    }

    function saveDocumentToStorage(showNotification = true) {
        try {
            const content = editor.innerHTML;
            const metadata = {
                title: 'سيناريو غير محفوظ',
                author: settings.defaultAuthor || '',
                createdAt: new Date().toISOString(),
                formatCounts: getFormatCounts()
            };

            const success = storageManager.saveDocument(content, metadata);
            
            if (success && showNotification) {
                notificationManager.success('تم حفظ الوثيقة محلياً');
            }

            return success;
        } catch (error) {
            console.error('خطأ في الحفظ:', error);
            notificationManager.error('فشل في حفظ الوثيقة');
            return false;
        }
    }

    function loadDocumentFromStorage() {
        try {
            const data = storageManager.loadDocument();
            if (!data) return false;

            editor.innerHTML = data.content;
            reapplyAllStyles();
            updateContent(false);

            undoStack = [];
            redoStack = [];
            documentModified = false;

            notificationManager.success('تم تحميل الوثيقة المحفوظة');
            return true;

        } catch (error) {
            console.error('خطأ في التحميل:', error);
            notificationManager.error('فشل في تحميل الوثيقة');
            return false;
        }
    }

    function getFormatCounts() {
        const counts = {};
        screenplayFormats.forEach(format => {
            counts[format.id] = editor.querySelectorAll(`.${format.id}`).length;
        });
        return counts;
    }

    // -------------------- إدارة الإعدادات --------------------
    
    function saveSettings() {
        const currentSettings = {
            theme: isDarkMode ? 'dark' : 'light',
            font: selectedFont,
            fontSize: selectedSize,
            showRulers: showRulers,
            autoSave: settings.autoSave,
            language: settings.language,
            spellCheck: settings.spellCheck,
            geminiApiKey: settings.geminiApiKey
        };

        if (storageManager.saveSettings(currentSettings)) {
            settings = currentSettings;
            notificationManager.success('تم حفظ الإعدادات');
        } else {
            notificationManager.error('فشل في حفظ الإعدادات');
        }
    }

    // -------------------- إدارة الاختصارات --------------------
    
    function setupKeyboardShortcuts() {
        // اختصارات التنسيق
        keyboardManager.registerShortcut('Ctrl+1', () => applyFormatToCurrentLine('scene-header-1'), {
            description: 'رأس المشهد الرئيسي'
        });
        
        keyboardManager.registerShortcut('Ctrl+2', () => applyFormatToCurrentLine('character'), {
            description: 'اسم الشخصية'
        });
        
        keyboardManager.registerShortcut('Ctrl+3', () => applyFormatToCurrentLine('dialogue'), {
            description: 'حوار'
        });
        
        keyboardManager.registerShortcut('Ctrl+4', () => applyFormatToCurrentLine('action'), {
            description: 'وصف الحدث'
        });
        
        keyboardManager.registerShortcut('Ctrl+6', () => applyFormatToCurrentLine('transition'), {
            description: 'انتقال'
        });

        // اختصارات الملفات
        keyboardManager.registerShortcut('Ctrl+N', createNewDocument, {
            description: 'وثيقة جديدة'
        });
        
        keyboardManager.registerShortcut('Ctrl+S', () => saveDocumentToStorage(true), {
            description: 'حفظ الوثيقة'
        });
        
        keyboardManager.registerShortcut('Ctrl+O', () => document.getElementById('file-import-input').click(), {
            description: 'فتح ملف'
        });

        // اختصارات التحرير
        keyboardManager.registerShortcut('Ctrl+Z', undoAction, {
            description: 'تراجع'
        });
        
        keyboardManager.registerShortcut('Ctrl+Y', redoAction, {
            description: 'إعادة'
        });

        // اختصارات التنسيق النصي
        keyboardManager.registerShortcut('Ctrl+B', () => formatText('bold'), {
            description: 'نص عريض'
        });
        
        keyboardManager.registerShortcut('Ctrl+I', () => formatText('italic'), {
            description: 'نص مائل'
        });
        
        keyboardManager.registerShortcut('Ctrl+U', () => formatText('underline'), {
            description: 'نص مسطر'
        });

        // إعداد مستمع أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            keyboardManager.handleKeyEvent(e, 'editor');
        });
    }

    // -------------------- دوال الواجهة --------------------
    
    function setCurrentFormat(fmt) {
        if (currentFormat !== fmt) {
            currentFormat = fmt;
            const formatInfo = screenplayFormats.find(f => f.id === fmt);
            currentFormatLabel.textContent = formatInfo ? formatInfo.label : 'غير معروف';

            // تحديث أنماط الأزرار النشطة
            document.querySelectorAll('.format-button, .sidebar-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.format === fmt);
            });
        }
    }

    function setAuditingStatus(auditing) {
        isAuditing = auditing;
        document.getElementById('status-auditing').classList.toggle('hidden', !auditing);
    }

    function setImportingStatus(importing) {
        isImporting = importing;
        document.getElementById('status-importing').classList.toggle('hidden', !importing);
    }

    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark', isDarkMode);
        sunIcon.classList.toggle('hidden', isDarkMode);
        moonIcon.classList.toggle('hidden', !isDarkMode);
        
        saveSettings();
    }

    // -------------------- دوال إضافية محسنة --------------------
    
    function createNewDocument(saveToUndo = true) {
        try {
            if (saveToUndo && editor.innerHTML.trim()) {
                undoStack.push(editor.innerHTML);
            }

            editor.innerHTML = '';
            const defaultDiv = document.createElement('div');
            defaultDiv.innerHTML = '<br>';
            defaultDiv.className = 'action';
            defaultDiv.setAttribute('data-line-index', '0');
            Object.assign(defaultDiv.style, getFormatStyles('action'));
            editor.appendChild(defaultDiv);

            globalLineCounter = 1;
            updateContent(false);
            undoStack = [];
            redoStack = [];
            documentModified = false;

            if (saveToUndo) {
                notificationManager.info('تم إنشاء وثيقة جديدة');
            }

        } catch (error) {
            console.error('خطأ في إنشاء وثيقة جديدة:', error);
            notificationManager.error('فشل في إنشاء وثيقة جديدة');
        }
    }

    async function saveDocument() {
        try {
            const content = editor.innerHTML;
            const metadata = {
                title: 'سيناريو',
                author: settings.defaultAuthor || '',
                exportDate: new Date().toISOString()
            };

            await exportManager.exportDocument(content, 'html', {
                fileName: `screenplay_${Date.now()}`,
                ...metadata
            });

            notificationManager.success('تم تصدير الوثيقة بنجاح');

        } catch (error) {
            console.error('خطأ في الحفظ:', error);
            notificationManager.error('فشل في حفظ الوثيقة');
        }
    }

    function undoAction() {
        if (undoStack.length > 1) {
            const currentState = undoStack.pop();
            redoStack.push(currentState);
            editor.innerHTML = undoStack[undoStack.length - 1];
            updateContent(false);
            notificationManager.info('تم التراجع');
        } else {
            notificationManager.warning('لا توجد عمليات للتراجع عنها');
        }
    }

    function redoAction() {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            undoStack.push(nextState);
            editor.innerHTML = nextState;
            updateContent(false);
            notificationManager.info('تم الإعادة');
        } else {
            notificationManager.warning('لا توجد عمليات للإعادة');
        }
    }

    // -------------------- تهيئة التطبيق --------------------
    
    async function initializeApplication() {
        try {
            // تحميل الوثيقة المحفوظة إن وجدت
            if (!loadDocumentFromStorage()) {
                createNewDocument(false);
            }

            // إنشاء أشرطة الأدوات
            renderToolbars();

            // إعداد مستمعي الأحداث
            setupEventListeners();

            // إعداد الاختصارات
            setupKeyboardShortcuts();

            // إعداد مفتاح Gemini API إن وجد
            if (settings.geminiApiKey) {
                geminiCoordinator.setApiKey(settings.geminiApiKey);
                const connected = await geminiCoordinator.testConnection();
                if (connected) {
                    notificationManager.success('تم الاتصال بـ Gemini AI بنجاح');
                } else {
                    notificationManager.warning('تعذر الاتصال بـ Gemini AI');
                }
            }

            // تطبيق الإعدادات
            applyInitialSettings();

            // رسم العناصر الأولية
            renderPageBackgrounds();
            renderRulers();
            reapplyAllStyles();

            notificationManager.success('تم تحميل كاتب السيناريو بنجاح');

        } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            notificationManager.error('فشل في تهيئة التطبيق');
        }
    }

    function renderToolbars() {
        formatsToolbar.innerHTML = screenplayFormats.map(format => `
            <div class="tooltip-container">
                <button data-format="${format.id}" class="format-button ${format.color}">
                    ${format.icon}
                </button>
                <span class="tooltip-text">${format.label} (${format.shortcut || 'Tab/Enter'})</span>
            </div>
        `).join('');

        leftSidebarButtons.innerHTML = dramaAnalyzerTools.map(tool => `
            <div class="tooltip-container">
                <button data-format="${tool.id}" class="sidebar-button" id="sidebar-btn-${tool.id}">
                    ${tool.icon}
                </button>
                <span class="tooltip-text">${tool.label}</span>
            </div>
        `).join('');
    }

    function setupEventListeners() {
        // أحداث المحرر
        editor.addEventListener('input', () => updateContent(true));
        editor.addEventListener('paste', handlePaste);
        editor.addEventListener('keydown', handleKeyDown);
        ['click', 'keyup'].forEach(evt => 
            editor.addEventListener(evt, () => updateContent(false))
        );

        // أحداث الواجهة
        themeToggleBtn.addEventListener('click', toggleDarkMode);

        // أحداث القوائم
        setupDropdownMenus();

        // أحداث أزرار القائمة
        document.getElementById('new-doc-btn').addEventListener('click', createNewDocument);
        document.getElementById('open-file-btn').addEventListener('click', () => 
            document.getElementById('file-import-input').click()
        );
        document.getElementById('save-doc-btn').addEventListener('click', saveDocument);
        document.getElementById('undo-btn').addEventListener('click', undoAction);
        document.getElementById('redo-btn').addEventListener('click', redoAction);
        document.getElementById('normalize-btn').addEventListener('click', smartNormalizeDocument);
        document.getElementById('file-import-input').addEventListener('change', handleFileImport);

        // أحداث أشرطة الأدوات
        formatsToolbar.addEventListener('click', e => {
            const button = e.target.closest('button[data-format]');
            if (button) {
                applyFormatToCurrentLine(button.dataset.format);
            }
        });

        leftSidebarButtons.addEventListener('click', e => {
            const button = e.target.closest('button[data-format]');
            if (button) {
                const tool = dramaAnalyzerTools.find(t => t.id === button.dataset.format);
                if (tool && tool.action) {
                    tool.action();
                }
            }
        });
    }

    function applyInitialSettings() {
        selectedFont = settings.font;
        selectedSize = settings.fontSize;
        showRulers = settings.showRulers;
        isDarkMode = settings.theme === 'dark';

        // تطبيق الوضع المظلم
        document.body.classList.toggle('dark', isDarkMode);
        sunIcon.classList.toggle('hidden', isDarkMode);
        moonIcon.classList.toggle('hidden', !isDarkMode);

        // تحديث عناصر الواجهة
        setCurrentFormat('action');
    }

    // بدء التطبيق
    await initializeApplication();

    // ================== دوال مساعدة إضافية ==================

    function formatText(command, value = null) {
        if (!editor) return;
        editor.focus();
        document.execCommand(command, false, value);
        updateContent();
    }

    function getNextFormatOnEnter(fmt) {
        return {
            'scene-header-1': 'scene-header-3',
            'scene-header-3': 'action',
            'action': 'action',
            'character': 'dialogue',
            'parenthetical': 'dialogue',
            'dialogue': 'action',
            'transition': 'scene-header-1',
            'basmala': 'scene-header-1'
        }[fmt] || 'action';
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const nextFormat = getNextFormatOnEnter(currentFormat);
            document.execCommand('insertParagraph');
            setTimeout(() => applyFormatToCurrentLine(nextFormat), 0);
        }
    }

    function needsEmptyLine(prev, cur) {
        const rules = {
            'scene-header-3': ['action'],
            'action': ['character', 'transition'],
            'dialogue': ['character', 'action', 'transition'],
            'transition': ['scene-header-1']
        };
        return rules[prev]?.includes(cur) || false;
    }

    function normalizeSpacing(contentLines) {
        const normalizedLines = [];
        let previousFormat = null;

        for (const currentLine of contentLines) {
            if (!currentLine.content.trim()) continue;

            if (previousFormat && needsEmptyLine(previousFormat, currentLine.format)) {
                normalizedLines.push({ content: '', format: 'action', isEmpty: true });
            }

            normalizedLines.push(currentLine);
            previousFormat = currentLine.format;
        }

        return normalizedLines;
    }

    function renderPageBackgrounds() {
        pageBackgroundsContainer.innerHTML = Array.from({ length: pageCount }, (_, i) =>
            `<div class="page-background"><span class="page-number">${i + 1}</span></div>`
        ).join('');
    }

    function renderRulers() {
        if (!showRulers) {
            rulerHContainer.innerHTML = '';
            rulerVContainer.innerHTML = '';
            document.getElementById('ruler-horizontal-container').style.display = 'none';
            document.getElementById('ruler-vertical-container').style.display = 'none';
            return;
        }

        document.getElementById('ruler-horizontal-container').style.display = 'block';
        document.getElementById('ruler-vertical-container').style.display = 'block';

        // المسطرة الأفقية
        const hLengthInCm = Math.floor(1000 / PIXELS_PER_CM);
        let hNumbers = '';
        for (let i = 1; i <= hLengthInCm; i++) {
            hNumbers += `<span class="ruler-number" style="right: ${i * PIXELS_PER_CM}px;">${i}</span>`;
        }
        rulerHContainer.innerHTML = `<div class="ruler-container horizontal">${hNumbers}</div>`;

        // المسطرة العمودية
        const vLengthInCm = Math.floor(A4_PAGE_HEIGHT_PX / PIXELS_PER_CM);
        let vNumbers = '';
        for (let i = 1; i <= vLengthInCm; i++) {
            vNumbers += `<span class="ruler-number" style="top: ${i * PIXELS_PER_CM}px;">${i}</span>`;
        }
        rulerVContainer.innerHTML = `<div class="ruler-container vertical">${vNumbers}</div>`;

        setTimeout(() => {
            stickyRulerWrapper.style.top = `${stickyHeader.offsetHeight}px`;
        }, 0);
    }

    function setupDropdownMenus() {
        document.querySelectorAll('[data-dropdown-toggle]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const menuId = button.getAttribute('data-dropdown-toggle');
                const menu = document.getElementById(menuId);
                const parent = menu.closest('.dropdown');
                const isAlreadyActive = parent.classList.contains('active');

                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
                if (!isAlreadyActive) {
                    parent.classList.add('active');
                }
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
        });
    }

    async function smartNormalizeDocument() {
        if (!editor) return;
        
        try {
            setAuditingStatus(true);
            notificationManager.info('جاري تطبيع الوثيقة...');

            const allDivs = Array.from(editor.children);
            const textContent = allDivs.map(div => div.textContent).join('\n');

            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', textContent);
            createNewDocument(false);
            await handlePaste({ 
                preventDefault: () => {}, 
                clipboardData: dataTransfer 
            });

            notificationManager.success('تم تطبيع الوثيقة بنجاح');

        } catch (error) {
            console.error('خطأ في تطبيع الوثيقة:', error);
            notificationManager.error('فشل في تطبيع الوثيقة');
        } finally {
            setAuditingStatus(false);
        }
    }

    // تصدير الدوال للاستخدام العام
    window.ScreenplayEditor = {
        applyFormatToCurrentLine,
        saveDocument,
        createNewDocument,
        toggleDarkMode,
        formatText,
        updateContent,
        settings,
        storageManager,
        exportManager,
        geminiCoordinator
    };

});