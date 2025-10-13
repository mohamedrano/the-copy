// ======================= INTEGRATED SCREENPLAY SYSTEM ========================

/**
 * النظام المتكامل النهائي لكاتب السيناريو
 * يجمع جميع المكونات والأنظمة في واجهة موحدة
 */
class IntegratedScreenplaySystem {
    constructor() {
        // إدارة الحالة العامة
        this.state = {
            initialized: false,
            currentUser: null,
            activeProject: null,
            unsavedChanges: false,
            lastActivity: Date.now()
        };

        // تهيئة الأنظمة الفرعية
        this.systems = {
            analytics: new ScreenplayAnalytics(),
            collaboration: new CollaborationManager(),
            search: new AdvancedSearchEngine(),
            validation: new ScriptValidator(),
            characters: new CharacterManager(),
            ai: new AIWritingAssistant(),
            export: new ProfessionalExportManager(),
            projects: new ProjectManager(),
            planning: new VisualPlanningSystem()
        };

        // إدارة الأحداث
        this.eventBus = new EventBus();
        this.setupEventHandlers();

        // أنظمة إضافية
        this.notifications = new NotificationManager();
        this.reminders = new ReminderSystem();
        this.backup = new AdvancedBackupSystem();
        this.settings = new SettingsManager();
        this.shortcuts = new KeyboardManager();
        this.performance = new PerformanceMonitor();

        // حالة الواجهة
        this.ui = {
            activePanel: 'editor',
            sidebarCollapsed: false,
            theme: 'light',
            layout: 'standard'
        };

        // مخزن البيانات المؤقتة
        this.cache = new Map();
        this.sessionData = new Map();
    }

    /**
     * تهيئة النظام المتكامل
     * @param {object} config - إعدادات التهيئة
     * @returns {Promise<boolean>} نجحت التهيئة أم لا
     */
    async initialize(config = {}) {
        try {
            console.log('🚀 بدء تهيئة نظام كاتب السيناريو المتكامل...');

            // تحميل الإعدادات
            await this.settings.loadSettings();
            const settings = this.settings.getAllSettings();

            // تهيئة الأنظمة الفرعية
            await this.initializeSubsystems(settings, config);

            // تهيئة واجهة المستخدم
            await this.initializeUI();

            // بدء الخدمات الخلفية
            this.startBackgroundServices();

            // تسجيل معالجات الأحداث
            this.registerEventHandlers();

            // التحقق من الحالة الأولية
            await this.checkInitialState();

            this.state.initialized = true;
            console.log('✅ تم تهيئة النظام بنجاح!');

            // إشعار بالنجاح
            this.notifications.success('تم تحميل كاتب السيناريو بنجاح!');

            return true;

        } catch (error) {
            console.error('❌ فشل في تهيئة النظام:', error);
            this.notifications.error(`فشل في تهيئة النظام: ${error.message}`);
            return false;
        }
    }

    /**
     * إنشاء مشروع جديد مع التكامل الكامل
     * @param {object} projectData - بيانات المشروع
     * @returns {Promise<object>} المشروع الجديد مع الأدوات المرتبطة
     */
    async createIntegratedProject(projectData) {
        try {
            // إنشاء المشروع الأساسي
            const project = await this.systems.projects.createProject(
                projectData.name, 
                projectData.type, 
                projectData
            );

            if (!project.success) {
                throw new Error('فشل في إنشاء المشروع');
            }

            const projectId = project.projectId;

            // إنشاء الأدوات المرتبطة
            const integratedTools = await this.createProjectTools(projectId, projectData);

            // إعداد التعاون إذا كان مطلوباً
            if (projectData.collaboration) {
                await this.setupCollaboration(projectId, projectData.collaboration);
            }

            // إعداد الذكاء الاصطناعي
            if (projectData.aiAssistance && this.settings.get('geminiApiKey')) {
                await this.systems.ai.initialize(this.settings.get('geminiApiKey'));
            }

            // إنشاء نسخة احتياطية أولية
            await this.backup.createProjectBackup(projectId);

            // تحديث الحالة
            this.state.activeProject = project.project;
            this.state.unsavedChanges = false;

            // إشعار النجاح
            this.notifications.success(`تم إنشاء المشروع "${projectData.name}" بنجاح`);

            // إرسال حدث
            this.eventBus.emit('project:created', {
                project: project.project,
                tools: integratedTools
            });

            return {
                success: true,
                project: project.project,
                tools: integratedTools
            };

        } catch (error) {
            console.error('خطأ في إنشاء المشروع المتكامل:', error);
            this.notifications.error(`فشل في إنشاء المشروع: ${error.message}`);
            throw error;
        }
    }

    /**
     * تحليل شامل للمشروع الحالي
     * @returns {Promise<object>} التحليل الشامل
     */
    async performComprehensiveAnalysis() {
        try {
            if (!this.state.activeProject) {
                throw new Error('لا يوجد مشروع نشط للتحليل');
            }

            const editor = document.getElementById('editor');
            if (!editor) {
                throw new Error('محرر النصوص غير متوفر');
            }

            this.notifications.info('جاري إجراء التحليل الشامل...');

            // التحليل الأساسي
            const basicAnalysis = await this.systems.analytics.analyzeScript(editor);

            // تحليل الشخصيات
            const characterAnalysis = await this.systems.characters.analyzeCharacters(editor);

            // التحقق من الأخطاء
            const validation = await this.systems.validation.validateScript(editor);

            // البحث عن المشاكل الشائعة
            const issues = await this.systems.search.findCommonIssues(editor);

            // التحليل البصري
            const visualAnalysis = await this.systems.planning.generateVisualAnalysis(
                this.state.activeProject.id, 
                editor
            );

            // دمج النتائج
            const comprehensiveAnalysis = {
                overview: {
                    projectName: this.state.activeProject.name,
                    analysisDate: new Date().toISOString(),
                    overallScore: this.calculateOverallScore({
                        basic: basicAnalysis,
                        characters: characterAnalysis,
                        validation: validation,
                        issues: issues
                    })
                },
                
                detailed: {
                    structure: basicAnalysis.structure,
                    characters: characterAnalysis.characters,
                    dialogue: basicAnalysis.dialogue,
                    pacing: basicAnalysis.pacing,
                    validation: validation.validation,
                    visual: visualAnalysis.analysis
                },
                
                issues: {
                    critical: issues.issues.critical || [],
                    high: issues.issues.high || [],
                    medium: issues.issues.medium || [],
                    low: issues.issues.low || []
                },
                
                insights: this.generateComprehensiveInsights({
                    basic: basicAnalysis,
                    characters: characterAnalysis,
                    validation: validation,
                    visual: visualAnalysis
                }),
                
                recommendations: this.generateComprehensiveRecommendations({
                    basic: basicAnalysis,
                    characters: characterAnalysis,
                    validation: validation,
                    issues: issues
                })
            };

            // حفظ التحليل
            await this.saveAnalysisResults(comprehensiveAnalysis);

            this.notifications.success('تم إنجاز التحليل الشامل بنجاح');

            return {
                success: true,
                analysis: comprehensiveAnalysis
            };

        } catch (error) {
            console.error('خطأ في التحليل الشامل:', error);
            this.notifications.error(`فشل التحليل الشامل: ${error.message}`);
            throw error;
        }
    }

    /**
     * نظام الذكاء الاصطناعي المدمج
     * @param {string} requestType - نوع الطلب
     * @param {object} context - السياق
     * @param {object} options - الخيارات
     * @returns {Promise<object>} استجابة الذكاء الاصطناعي
     */
    async getAIAssistance(requestType, context = {}, options = {}) {
        try {
            if (!this.systems.ai.apiKey) {
                throw new Error('لم يتم تكوين الذكاء الاصطناعي. يرجى إضافة مفتاح API في الإعدادات');
            }

            // إعداد السياق الموسع
            const enhancedContext = {
                ...context,
                project: this.state.activeProject,
                currentScene: this.getCurrentScene(),
                characterList: await this.getProjectCharacters(),
                recentChanges: this.getRecentChanges()
            };

            // الحصول على اقتراحات الذكاء الاصطناعي
            const aiResponse = await this.systems.ai.getSuggestions(
                enhancedContext,
                requestType,
                options
            );

            // تسجيل الاستخدام
            this.logAIUsage(requestType, aiResponse);

            // تحديث الإحصائيات
            this.updateAIStats(requestType);

            return aiResponse;

        } catch (error) {
            console.error('خطأ في مساعد الذكاء الاصطناعي:', error);
            this.notifications.error(`فشل في الحصول على المساعدة: ${error.message}`);
            throw error;
        }
    }

    /**
     * نظام النسخ الاحتياطي التلقائي المتقدم
     */
    async enableAdvancedBackup() {
        try {
            // إعداد النسخ الاحتياطي التلقائي
            this.backup.configure({
                autoBackup: true,
                interval: this.settings.get('backupInterval', 300000), // 5 دقائق
                maxBackups: this.settings.get('maxBackups', 20),
                cloudBackup: this.settings.get('cloudBackupEnabled', false),
                compression: true,
                encryption: this.settings.get('encryptBackups', false)
            });

            // بدء النسخ الاحتياطي التلقائي
            await this.backup.startAutoBackup();

            // إعداد النسخ الاحتياطي السحابي إذا كان مفعلاً
            if (this.settings.get('cloudBackupEnabled')) {
                await this.setupCloudBackup();
            }

            this.notifications.success('تم تفعيل النسخ الاحتياطي المتقدم');

        } catch (error) {
            console.error('خطأ في تفعيل النسخ الاحتياطي:', error);
            this.notifications.error('فشل في تفعيل النسخ الاحتياطي');
        }
    }

    // =================== System Integration Methods ===================

    async initializeSubsystems(settings, config) {
        const initPromises = [];

        // تهيئة نظام إدارة المشاريع
        initPromises.push(
            this.systems.projects.updateBackupSettings(settings.backup || {})
        );

        // تهيئة الذكاء الاصطناعي إذا كان متوفراً
        if (settings.geminiApiKey) {
            initPromises.push(
                this.systems.ai.initialize(settings.geminiApiKey)
            );
        }

        // تهيئة نظام التعاون
        if (settings.collaborationEnabled) {
            initPromises.push(
                this.systems.collaboration.initialize?.()
            );
        }

        await Promise.all(initPromises);
    }

    async createProjectTools(projectId, projectData) {
        const tools = {};

        try {
            // إنشاء لوحة القصة
            if (projectData.includeStoryboard !== false) {
                const storyboard = await this.systems.planning.createStoryboard(projectId, {
                    name: `لوحة قصة - ${projectData.name}`,
                    layoutType: 'timeline'
                });
                tools.storyboard = storyboard;
            }

            // إنشاء ورقة النبضات
            if (projectData.includeBeatSheet !== false) {
                const beatSheet = await this.systems.planning.createBeatSheet(
                    projectId,
                    projectData.beatSheetTemplate || 'three_act'
                );
                tools.beatSheet = beatSheet;
            }

            // إنشاء الجدول الزمني
            if (projectData.includeTimeline !== false) {
                const timeline = await this.systems.planning.createTimeline(projectId, {
                    name: `جدول زمني - ${projectData.name}`,
                    startDate: new Date().toISOString(),
                    endDate: projectData.targetDate || null
                });
                tools.timeline = timeline;
            }

            return tools;

        } catch (error) {
            console.warn('تحذير: فشل في إنشاء بعض أدوات المشروع:', error);
            return tools;
        }
    }

    async setupCollaboration(projectId, collaborationConfig) {
        try {
            // إنشاء مشروع تعاوني
            const collabProject = await this.systems.collaboration.createProject(
                `مشروع تعاوني - ${projectId}`,
                'مشروع سيناريو تعاوني',
                collaborationConfig
            );

            // دعوة المتعاونين
            if (collaborationConfig.collaborators) {
                await this.systems.collaboration.inviteCollaborators(
                    collabProject.projectId,
                    collaborationConfig.collaborators
                );
            }

        } catch (error) {
            console.warn('تحذير: فشل في إعداد التعاون:', error);
        }
    }

    // =================== Event Handling ===================

    setupEventHandlers() {
        // أحداث المحرر
        this.eventBus.on('editor:changed', this.handleEditorChange.bind(this));
        this.eventBus.on('editor:saved', this.handleEditorSave.bind(this));

        // أحداث المشروع
        this.eventBus.on('project:created', this.handleProjectCreated.bind(this));
        this.eventBus.on('project:opened', this.handleProjectOpened.bind(this));
        this.eventBus.on('project:closed', this.handleProjectClosed.bind(this));

        // أحداث النظام
        this.eventBus.on('system:error', this.handleSystemError.bind(this));
        this.eventBus.on('system:warning', this.handleSystemWarning.bind(this));

        // أحداث الذكاء الاصطناعي
        this.eventBus.on('ai:suggestion', this.handleAISuggestion.bind(this));
        this.eventBus.on('ai:error', this.handleAIError.bind(this));
    }

    registerEventHandlers() {
        // أحداث المتصفح
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));

        // أحداث الأخطاء
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

        // أحداث النشاط
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    handleEditorChange(data) {
        this.state.unsavedChanges = true;
        this.state.lastActivity = Date.now();
        
        // تحديث إحصائيات الوقت الفعلي
        this.updateLiveStats(data.content);
        
        // تشغيل الاقتراحات التلقائية إذا كانت مفعلة
        if (this.settings.get('enableAutoSuggestions')) {
            this.debounce(this.triggerAutoSuggestions.bind(this), 2000)();
        }
    }

    handleEditorSave(data) {
        this.state.unsavedChanges = false;
        this.backup.createSnapshot(this.state.activeProject.id, data.content);
    }

    handleProjectCreated(data) {
        this.reminders.setupProjectReminders(data.project);
    }

    handleSystemError(error) {
        this.notifications.error(`خطأ في النظام: ${error.message}`);
        this.performance.logError(error);
    }

    handleBeforeUnload(event) {
        if (this.state.unsavedChanges) {
            event.preventDefault();
            event.returnValue = 'لديك تغييرات غير محفوظة. هل أنت متأكد من الخروج؟';
            return event.returnValue;
        }
    }

    // =================== Background Services ===================

    startBackgroundServices() {
        // خدمة مراقبة الأداء
        this.performance.startMonitoring();

        // خدمة النسخ الاحتياطي التلقائي
        this.enableAdvancedBackup();

        // خدمة التذكيرات
        this.reminders.startReminderService();

        // خدمة مراقبة النشاط
        this.startActivityMonitoring();

        // خدمة التنظيف التلقائي
        this.startCleanupService();
    }

    startActivityMonitoring() {
        setInterval(() => {
            const inactiveTime = Date.now() - this.state.lastActivity;
            
            // إذا لم يكن هناك نشاط لأكثر من 30 دقيقة
            if (inactiveTime > 1800000) { // 30 دقيقة
                this.handleInactivity();
            }
        }, 60000); // فحص كل دقيقة
    }

    startCleanupService() {
        setInterval(() => {
            this.performCleanup();
        }, 3600000); // كل ساعة
    }

    performCleanup() {
        // تنظيف الذاكرة المؤقتة
        this.cleanCache();
        
        // تنظيف بيانات الجلسة القديمة
        this.cleanSessionData();
        
        // تنظيف السجلات القديمة
        this.cleanOldLogs();
    }

    // =================== Helper Methods ===================

    calculateOverallScore(analyses) {
        let totalScore = 0;
        let count = 0;

        if (analyses.validation?.validation?.score) {
            totalScore += analyses.validation.validation.score;
            count++;
        }

        if (analyses.characters?.insights) {
            totalScore += 75; // نقاط افتراضية للشخصيات
            count++;
        }

        return count > 0 ? Math.round(totalScore / count) : 50;
    }

    generateComprehensiveInsights(analyses) {
        const insights = [];

        // دمج البصائر من جميع التحليلات
        if (analyses.basic?.insights) {
            insights.push(...analyses.basic.insights);
        }

        if (analyses.characters?.insights) {
            insights.push(...analyses.characters.insights);
        }

        if (analyses.visual?.insights) {
            insights.push(...analyses.visual.insights);
        }

        return insights;
    }

    generateComprehensiveRecommendations(analyses) {
        const recommendations = [];

        // دمج التوصيات من جميع التحليلات
        if (analyses.basic?.recommendations) {
            recommendations.push(...analyses.basic.recommendations);
        }

        if (analyses.characters?.recommendations) {
            recommendations.push(...analyses.characters.recommendations);
        }

        if (analyses.validation?.validation?.recommendations) {
            recommendations.push(...analyses.validation.validation.recommendations);
        }

        // ترتيب حسب الأولوية
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'عالي': 3, 'متوسط': 2, 'منخفض': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateLiveStats(content) {
        // حساب إحصائيات سريعة
        const words = content.split(/\s+/).filter(Boolean).length;
        const characters = content.length;
        
        // تحديث واجهة المستخدم
        this.eventBus.emit('stats:updated', { words, characters });
    }

    getCurrentScene() {
        const editor = document.getElementById('editor');
        if (!editor) return null;

        // العثور على المشهد الحالي بناءً على موضع المؤشر
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        let currentElement = selection.getRangeAt(0).commonAncestorContainer;
        while (currentElement && currentElement !== editor) {
            if (currentElement.className === 'scene-header-1') {
                return currentElement.textContent.trim();
            }
            currentElement = currentElement.previousElementSibling || currentElement.parentNode;
        }

        return null;
    }

    async getProjectCharacters() {
        if (!this.state.activeProject) return [];

        try {
            const analysis = await this.systems.characters.analyzeCharacters(
                document.getElementById('editor')
            );
            return analysis.characters.map(char => char.name);
        } catch (error) {
            console.warn('فشل في الحصول على قائمة الشخصيات:', error);
            return [];
        }
    }

    getRecentChanges() {
        // الحصول على آخر التغييرات من تاريخ التعديل
        return this.sessionData.get('recentChanges') || [];
    }

    logAIUsage(requestType, response) {
        const usage = this.sessionData.get('aiUsage') || [];
        usage.push({
            type: requestType,
            timestamp: new Date().toISOString(),
            success: response.success || false,
            tokensUsed: response.tokensUsed || 0
        });
        this.sessionData.set('aiUsage', usage);
    }

    updateAIStats(requestType) {
        const stats = this.sessionData.get('aiStats') || {};
        stats[requestType] = (stats[requestType] || 0) + 1;
        this.sessionData.set('aiStats', stats);
    }

    cleanCache() {
        const maxCacheSize = 100;
        if (this.cache.size > maxCacheSize) {
            const entriesToDelete = this.cache.size - maxCacheSize;
            const iterator = this.cache.keys();
            
            for (let i = 0; i < entriesToDelete; i++) {
                this.cache.delete(iterator.next().value);
            }
        }
    }

    cleanSessionData() {
        const maxSessionSize = 50;
        if (this.sessionData.size > maxSessionSize) {
            const entriesToDelete = this.sessionData.size - maxSessionSize;
            const iterator = this.sessionData.keys();
            
            for (let i = 0; i < entriesToDelete; i++) {
                this.sessionData.delete(iterator.next().value);
            }
        }
    }

    // =================== Public API ===================

    /**
     * واجهة برمجة التطبيقات العامة
     */
    getAPI() {
        return {
            // إدارة المشاريع
            projects: {
                create: this.createIntegratedProject.bind(this),
                open: (id) => this.systems.projects.openProject(id),
                save: () => this.systems.projects.saveActiveProject(),
                delete: (id) => this.systems.projects.deleteProject(id),
                list: () => this.systems.projects.getAllProjects()
            },

            // التحليل
            analysis: {
                comprehensive: this.performComprehensiveAnalysis.bind(this),
                structure: () => this.systems.analytics.analyzeScript(document.getElementById('editor')),
                characters: () => this.systems.characters.analyzeCharacters(document.getElementById('editor')),
                validate: () => this.systems.validation.validateScript(document.getElementById('editor'))
            },

            // الذكاء الاصطناعي
            ai: {
                suggest: this.getAIAssistance.bind(this),
                improve: (text, type) => this.systems.ai.improveText(text, type),
                generate: (type, params) => this.systems.ai.generateContent(type, params)
            },

            // البحث والاستبدال
            search: {
                find: (query, options) => this.systems.search.advancedSearch(document.getElementById('editor'), query, options),
                replace: (query, replacement, options) => this.systems.search.findAndReplace(document.getElementById('editor'), query, replacement, options),
                issues: () => this.systems.search.findCommonIssues(document.getElementById('editor'))
            },

            // التصدير
            export: {
                single: (format, options) => this.systems.export.exportScript(document.getElementById('editor'), format, options),
                multiple: (formats, options) => this.systems.export.exportMultipleFormats?.call(this.systems.export, document.getElementById('editor'), formats, options),
                print: (options) => this.systems.export.printScript(document.getElementById('editor'), options)
            },

            // التخطيط البصري
            planning: {
                storyboard: (projectId, data) => this.systems.planning.createStoryboard(projectId, data),
                beatSheet: (projectId, template) => this.systems.planning.createBeatSheet(projectId, template),
                timeline: (projectId, data) => this.systems.planning.createTimeline(projectId, data)
            },

            // إدارة النظام
            system: {
                getState: () => ({ ...this.state }),
                getSettings: () => this.settings.getAllSettings(),
                updateSettings: (settings) => this.settings.updateSettings(settings),
                backup: () => this.backup.createManualBackup(),
                restore: (backupId) => this.backup.restoreFromBackup(backupId)
            }
        };
    }
}

// ======================= ADDITIONAL SYSTEMS ========================

/**
 * نظام التذكيرات المتقدم
 */
class ReminderSystem {
    constructor() {
        this.reminders = new Map();
        this.activeTimers = new Map();
        this.isRunning = false;
    }

    startReminderService() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.checkReminders();
        
        // فحص كل دقيقة
        setInterval(() => {
            this.checkReminders();
        }, 60000);
    }

    setupProjectReminders(project) {
        // تذكيرات المشروع التلقائية
        const projectReminders = [
            {
                type: 'progress_check',
                title: 'فحص تقدم المشروع',
                interval: 7 * 24 * 60 * 60 * 1000, // أسبوعياً
                message: 'حان وقت مراجعة تقدم مشروعك'
            },
            {
                type: 'backup_reminder',
                title: 'تذكير النسخ الاحتياطي',
                interval: 24 * 60 * 60 * 1000, // يومياً
                message: 'لا تنس إنشاء نسخة احتياطية من عملك'
            }
        ];

        projectReminders.forEach(reminder => {
            this.addReminder(project.id, reminder);
        });
    }

    addReminder(projectId, reminderData) {
        const reminderId = `${projectId}_${Date.now()}`;
        const reminder = {
            id: reminderId,
            projectId: projectId,
            ...reminderData,
            nextTrigger: Date.now() + reminderData.interval,
            active: true
        };

        this.reminders.set(reminderId, reminder);
    }

    checkReminders() {
        const now = Date.now();
        
        for (const [id, reminder] of this.reminders.entries()) {
            if (reminder.active && now >= reminder.nextTrigger) {
                this.triggerReminder(reminder);
                
                // تحديد موعد التذكير التالي
                reminder.nextTrigger = now + reminder.interval;
            }
        }
    }

    triggerReminder(reminder) {
        // إرسال إشعار
        if (window.Notification && Notification.permission === 'granted') {
            new Notification(reminder.title, {
                body: reminder.message,
                icon: '/icon.png'
            });
        }

        // إشعار داخلي
        if (window.notificationManager) {
            window.notificationManager.info(reminder.message);
        }
    }
}

/**
 * نظام النسخ الاحتياطي المتقدم
 */
class AdvancedBackupSystem {
    constructor() {
        this.backups = new Map();
        this.config = {
            autoBackup: false,
            interval: 300000, // 5 دقائق
            maxBackups: 10,
            compression: false,
            encryption: false
        };
        this.isRunning = false;
    }

    configure(config) {
        this.config = { ...this.config, ...config };
    }

    async startAutoBackup() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        setInterval(async () => {
            if (this.config.autoBackup) {
                await this.performAutoBackup();
            }
        }, this.config.interval);
    }

    async performAutoBackup() {
        try {
            const editor = document.getElementById('editor');
            if (!editor) return;

            const content = editor.innerHTML;
            const backupId = `auto_${Date.now()}`;
            
            await this.createBackup(backupId, content, {
                type: 'automatic',
                compression: this.config.compression,
                encryption: this.config.encryption
            });

            // تنظيف النسخ القديمة
            await this.cleanupOldBackups();

        } catch (error) {
            console.error('خطأ في النسخ الاحتياطي التلقائي:', error);
        }
    }

    async createBackup(id, content, options = {}) {
        const backup = {
            id: id,
            content: options.compression ? await this.compress(content) : content,
            timestamp: new Date().toISOString(),
            size: content.length,
            type: options.type || 'manual',
            compressed: options.compression || false,
            encrypted: options.encryption || false
        };

        this.backups.set(id, backup);
        
        // حفظ في التخزين المحلي
        localStorage.setItem(`backup_${id}`, JSON.stringify(backup));
        
        return backup;
    }

    async compress(data) {
        // ضغط بسيط - في التطبيق الحقيقي يمكن استخدام مكتبة ضغط
        return btoa(data);
    }

    async cleanupOldBackups() {
        const allBackups = Array.from(this.backups.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (allBackups.length > this.config.maxBackups) {
            const toDelete = allBackups.slice(this.config.maxBackups);
            
            toDelete.forEach(backup => {
                this.backups.delete(backup.id);
                localStorage.removeItem(`backup_${backup.id}`);
            });
        }
    }
}

/**
 * مدير الإعدادات المتقدم
 */
class SettingsManager {
    constructor() {
        this.settings = new Map();
        this.defaultSettings = {
            theme: 'light',
            language: 'ar',
            autoSave: true,
            backupInterval: 300000,
            maxBackups: 10,
            enableAutoSuggestions: true,
            geminiApiKey: null,
            collaborationEnabled: false,
            cloudBackupEnabled: false,
            encryptBackups: false
        };
    }

    async loadSettings() {
        try {
            const saved = localStorage.getItem('app_settings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                Object.entries(parsedSettings).forEach(([key, value]) => {
                    this.settings.set(key, value);
                });
            }

            // تطبيق الإعدادات الافتراضية للمفاتيح غير الموجودة
            Object.entries(this.defaultSettings).forEach(([key, value]) => {
                if (!this.settings.has(key)) {
                    this.settings.set(key, value);
                }
            });

        } catch (error) {
            console.error('خطأ في تحميل الإعدادات:', error);
            this.resetToDefaults();
        }
    }

    get(key, defaultValue = null) {
        return this.settings.get(key) ?? defaultValue;
    }

    set(key, value) {
        this.settings.set(key, value);
        this.saveSettings();
    }

    getAllSettings() {
        return Object.fromEntries(this.settings);
    }

    updateSettings(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.settings.set(key, value);
        });
        this.saveSettings();
    }

    saveSettings() {
        try {
            const settingsObject = Object.fromEntries(this.settings);
            localStorage.setItem('app_settings', JSON.stringify(settingsObject));
        } catch (error) {
            console.error('خطأ في حفظ الإعدادات:', error);
        }
    }

    resetToDefaults() {
        this.settings.clear();
        Object.entries(this.defaultSettings).forEach(([key, value]) => {
            this.settings.set(key, value);
        });
        this.saveSettings();
    }
}

/**
 * مراقب الأداء
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            memory: [],
            timing: {},
            errors: [],
            userActions: []
        };
        this.isMonitoring = false;
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // مراقبة الذاكرة كل 30 ثانية
        setInterval(() => {
            this.collectMemoryMetrics();
        }, 30000);

        // مراقبة أداء الشبكة
        this.monitorNetworkPerformance();
    }

    collectMemoryMetrics() {
        if (performance.memory) {
            this.metrics.memory.push({
                timestamp: Date.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            });

            // الاحتفاظ بآخر 100 قياس فقط
            if (this.metrics.memory.length > 100) {
                this.metrics.memory.shift();
            }
        }
    }

    logError(error) {
        this.metrics.errors.push({
            timestamp: Date.now(),
            message: error.message,
            stack: error.stack,
            type: error.name
        });

        // الاحتفاظ بآخر 50 خطأ
        if (this.metrics.errors.length > 50) {
            this.metrics.errors.shift();
        }
    }

    logUserAction(action) {
        this.metrics.userActions.push({
            timestamp: Date.now(),
            action: action,
            path: window.location.pathname
        });

        // الاحتفاظ بآخر 100 إجراء
        if (this.metrics.userActions.length > 100) {
            this.metrics.userActions.shift();
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }
}

/**
 * ناقل الأحداث
 */
class EventBus {
    constructor() {
        this.events = new Map();
    }

    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }

    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`خطأ في معالج الحدث ${eventName}:`, error);
            }
        });
    }
}

// تصدير النظام المتكامل
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        IntegratedScreenplaySystem,
        ReminderSystem,
        AdvancedBackupSystem,
        SettingsManager,
        PerformanceMonitor,
        EventBus
    };
} else if (typeof window !== 'undefined') {
    // إتاحة النظام عالمياً
    window.IntegratedScreenplaySystem = IntegratedScreenplaySystem;
    window.ScreenplayAPI = null; // سيتم تعيينها عند التهيئة

    // تهيئة تلقائية عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const system = new IntegratedScreenplaySystem();
            const initialized = await system.initialize();
            
            if (initialized) {
                window.ScreenplayAPI = system.getAPI();
                console.log('🎬 نظام كاتب السيناريو المتكامل جاهز للاستخدام!');
            }
        } catch (error) {
            console.error('❌ فشل تهيئة النظام:', error);
        }
    });
}