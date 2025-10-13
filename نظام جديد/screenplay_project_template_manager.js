// ======================= PROJECT & TEMPLATE MANAGEMENT SYSTEM ========================

/**
 * نظام إدارة المشاريع والقوالب المتقدم
 */
class ProjectManager {
    constructor() {
        this.projects = new Map();
        this.templates = new Map();
        this.activeProject = null;
        this.projectHistory = [];
        this.backupSettings = {
            autoBackupEnabled: true,
            backupInterval: 300000, // 5 دقائق
            maxBackups: 10,
            cloudBackupEnabled: false
        };
        
        // إعدادات المشاريع
        this.projectSettings = {
            defaultGenre: 'دراما',
            defaultLanguage: 'ar',
            autoSave: true,
            versionControl: true,
            trackChanges: true,
            collaborationEnabled: false
        };
        
        // أنواع المشاريع
        this.projectTypes = {
            FEATURE_FILM: { name: 'فيلم سينمائي', pages: [90, 120], scenes: [40, 60] },
            SHORT_FILM: { name: 'فيلم قصير', pages: [5, 30], scenes: [5, 20] },
            TV_EPISODE: { name: 'حلقة تلفزيونية', pages: [22, 44], scenes: [15, 30] },
            TV_PILOT: { name: 'حلقة تجريبية', pages: [22, 60], scenes: [20, 40] },
            STAGE_PLAY: { name: 'مسرحية', pages: [60, 120], scenes: [5, 15] },
            RADIO_DRAMA: { name: 'دراما إذاعية', pages: [15, 45], scenes: [10, 25] },
            WEB_SERIES: { name: 'مسلسل ويب', pages: [5, 15], scenes: [3, 10] }
        };

        this.initializeDefaultTemplates();
        this.startAutoBackup();
    }

    /**
     * إنشاء مشروع جديد
     * @param {string} name - اسم المشروع
     * @param {string} type - نوع المشروع
     * @param {object} metadata - البيانات الوصفية
     * @returns {Promise<object>} المشروع الجديد
     */
    async createProject(name, type, metadata = {}) {
        try {
            const projectId = this.generateProjectId();
            const projectType = this.projectTypes[type] || this.projectTypes.FEATURE_FILM;
            
            const project = {
                id: projectId,
                name: name,
                type: type,
                typeInfo: projectType,
                
                metadata: {
                    title: metadata.title || name,
                    author: metadata.author || 'مؤلف غير محدد',
                    genre: metadata.genre || this.projectSettings.defaultGenre,
                    language: metadata.language || this.projectSettings.defaultLanguage,
                    logline: metadata.logline || '',
                    synopsis: metadata.synopsis || '',
                    theme: metadata.theme || '',
                    targetAudience: metadata.targetAudience || 'عام',
                    budget: metadata.budget || '',
                    notes: metadata.notes || '',
                    tags: metadata.tags || []
                },
                
                structure: {
                    acts: this.getDefaultActStructure(type),
                    scenes: [],
                    characters: [],
                    locations: [],
                    treatments: []
                },
                
                content: {
                    currentDraft: 1,
                    drafts: [],
                    scenes: new Map(),
                    notes: new Map(),
                    research: new Map()
                },
                
                timeline: {
                    created: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    lastOpened: new Date().toISOString(),
                    deadlines: [],
                    milestones: []
                },
                
                collaboration: {
                    owner: 'current_user',
                    collaborators: [],
                    permissions: new Map(),
                    comments: new Map(),
                    suggestions: []
                },
                
                progress: {
                    completion: 0,
                    wordCount: 0,
                    pageCount: 0,
                    sceneCount: 0,
                    lastUpdated: new Date().toISOString()
                },
                
                settings: {
                    ...this.projectSettings,
                    customSettings: metadata.customSettings || {}
                },
                
                status: 'draft', // draft, review, final, archived
                version: '1.0.0'
            };

            // حفظ المشروع
            this.projects.set(projectId, project);
            await this.saveProjectToDisk(project);
            
            // تسجيل في التاريخ
            this.addToHistory('create', project);
            
            return {
                success: true,
                projectId: projectId,
                project: project
            };

        } catch (error) {
            console.error('خطأ في إنشاء المشروع:', error);
            throw new Error(`فشل إنشاء المشروع: ${error.message}`);
        }
    }

    /**
     * فتح مشروع موجود
     * @param {string} projectId - معرف المشروع
     * @returns {Promise<object>} المشروع المفتوح
     */
    async openProject(projectId) {
        try {
            let project = this.projects.get(projectId);
            
            if (!project) {
                // محاولة تحميل من القرص
                project = await this.loadProjectFromDisk(projectId);
                if (!project) {
                    throw new Error('المشروع غير موجود');
                }
                this.projects.set(projectId, project);
            }

            // تحديث آخر فتح
            project.timeline.lastOpened = new Date().toISOString();
            this.activeProject = project;
            
            // تسجيل في التاريخ
            this.addToHistory('open', project);
            
            return {
                success: true,
                project: project
            };

        } catch (error) {
            console.error('خطأ في فتح المشروع:', error);
            throw new Error(`فشل فتح المشروع: ${error.message}`);
        }
    }

    /**
     * حفظ المشروع الحالي
     * @param {object} updates - التحديثات (اختيارية)
     * @returns {Promise<boolean>} نجحت العملية أم لا
     */
    async saveActiveProject(updates = {}) {
        try {
            if (!this.activeProject) {
                throw new Error('لا يوجد مشروع نشط للحفظ');
            }

            // تطبيق التحديثات
            if (Object.keys(updates).length > 0) {
                this.activeProject = { ...this.activeProject, ...updates };
                this.activeProject.timeline.lastModified = new Date().toISOString();
            }

            // حفظ إلى القرص
            await this.saveProjectToDisk(this.activeProject);
            
            // إنشاء نسخة احتياطية
            if (this.backupSettings.autoBackupEnabled) {
                await this.createBackup(this.activeProject.id);
            }

            return true;

        } catch (error) {
            console.error('خطأ في حفظ المشروع:', error);
            return false;
        }
    }

    /**
     * إنشاء قالب من مشروع موجود
     * @param {string} projectId - معرف المشروع
     * @param {object} templateInfo - معلومات القالب
     * @returns {Promise<object>} القالب الجديد
     */
    async createTemplateFromProject(projectId, templateInfo) {
        try {
            const project = this.projects.get(projectId);
            if (!project) {
                throw new Error('المشروع غير موجود');
            }

            const templateId = this.generateTemplateId();
            const template = {
                id: templateId,
                name: templateInfo.name,
                description: templateInfo.description || '',
                category: templateInfo.category || 'مخصص',
                
                structure: {
                    type: project.type,
                    acts: project.structure.acts,
                    sceneTemplates: this.extractSceneTemplates(project),
                    characterTemplates: this.extractCharacterTemplates(project)
                },
                
                content: {
                    sampleScenes: templateInfo.includeSampleScenes ? 
                        this.extractSampleScenes(project) : [],
                    guidelines: templateInfo.guidelines || [],
                    tips: templateInfo.tips || []
                },
                
                metadata: {
                    createdBy: 'current_user',
                    createdFrom: projectId,
                    createdAt: new Date().toISOString(),
                    genre: project.metadata.genre,
                    language: project.metadata.language,
                    tags: templateInfo.tags || [],
                    isPublic: templateInfo.isPublic || false
                },
                
                settings: {
                    ...project.settings,
                    customizableFields: templateInfo.customizableFields || []
                },
                
                statistics: {
                    usageCount: 0,
                    rating: 0,
                    reviews: []
                }
            };

            this.templates.set(templateId, template);
            await this.saveTemplateToDisk(template);

            return {
                success: true,
                templateId: templateId,
                template: template
            };

        } catch (error) {
            console.error('خطأ في إنشاء القالب:', error);
            throw new Error(`فشل إنشاء القالب: ${error.message}`);
        }
    }

    /**
     * إنشاء مشروع من قالب
     * @param {string} templateId - معرف القالب
     * @param {string} projectName - اسم المشروع الجديد
     * @param {object} customizations - التخصيصات
     * @returns {Promise<object>} المشروع الجديد
     */
    async createProjectFromTemplate(templateId, projectName, customizations = {}) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error('القالب غير موجود');
            }

            // إنشاء مشروع أساسي
            const projectData = {
                ...template.metadata,
                ...customizations,
                title: projectName
            };

            const newProject = await this.createProject(projectName, template.structure.type, projectData);
            
            // تطبيق بنية القالب
            await this.applyTemplateStructure(newProject.projectId, template);
            
            // تحديث إحصائيات القالب
            template.statistics.usageCount++;
            await this.saveTemplateToDisk(template);

            return newProject;

        } catch (error) {
            console.error('خطأ في إنشاء مشروع من القالب:', error);
            throw new Error(`فشل إنشاء مشروع من القالب: ${error.message}`);
        }
    }

    /**
     * تحليل تقدم المشروع
     * @param {string} projectId - معرف المشروع
     * @returns {Promise<object>} تحليل التقدم
     */
    async analyzeProjectProgress(projectId) {
        try {
            const project = this.projects.get(projectId);
            if (!project) {
                throw new Error('المشروع غير موجود');
            }

            const analysis = {
                overview: {
                    projectName: project.name,
                    type: project.type,
                    status: project.status,
                    currentDraft: project.content.currentDraft,
                    createdAt: project.timeline.created,
                    lastModified: project.timeline.lastModified
                },
                
                progress: {
                    completion: this.calculateCompletionPercentage(project),
                    wordCount: project.progress.wordCount,
                    pageCount: project.progress.pageCount,
                    sceneCount: project.progress.sceneCount,
                    expectedLength: project.typeInfo.pages,
                    paceAnalysis: this.analyzePace(project)
                },
                
                structure: {
                    actsCompleted: this.countCompletedActs(project),
                    totalActs: project.structure.acts.length,
                    sceneDistribution: this.analyzeSceneDistribution(project),
                    structuralBalance: this.analyzeStructuralBalance(project)
                },
                
                content: {
                    characterDevelopment: this.analyzeCharacterDevelopment(project),
                    plotProgression: this.analyzePlotProgression(project),
                    thematicConsistency: this.analyzeThematicConsistency(project)
                },
                
                timeline: {
                    deadlines: this.getUpcomingDeadlines(project),
                    milestones: this.getMilestoneProgress(project),
                    timeSpent: this.calculateTimeSpent(project),
                    estimatedCompletion: this.estimateCompletionTime(project)
                },
                
                insights: this.generateProgressInsights(project),
                recommendations: this.generateProgressRecommendations(project)
            };

            return {
                success: true,
                analysis: analysis
            };

        } catch (error) {
            console.error('خطأ في تحليل التقدم:', error);
            throw new Error(`فشل تحليل التقدم: ${error.message}`);
        }
    }

    // =================== Template Management Methods ===================

    initializeDefaultTemplates() {
        // قالب الفيلم السينمائي الكلاسيكي
        this.templates.set('classic_feature', {
            id: 'classic_feature',
            name: 'فيلم سينمائي كلاسيكي',
            description: 'بنية ثلاثية الفصول تقليدية للأفلام السينمائية',
            category: 'سينما',
            
            structure: {
                type: 'FEATURE_FILM',
                acts: [
                    { name: 'الفصل الأول', pages: [1, 25], scenes: [8, 12], purpose: 'تقديم الشخصيات والصراع' },
                    { name: 'الفصل الثاني', pages: [26, 90], scenes: [20, 35], purpose: 'تطوير الصراع والتعقيدات' },
                    { name: 'الفصل الثالث', pages: [91, 120], scenes: [8, 15], purpose: 'الذروة والحل' }
                ],
                keyBeats: [
                    { name: 'الحادثة المحركة', page: [10, 15] },
                    { name: 'نقطة التحول الأولى', page: [20, 25] },
                    { name: 'نقطة المنتصف', page: [50, 60] },
                    { name: 'نقطة التحول الثانية', page: [75, 85] },
                    { name: 'الذروة', page: [85, 95] }
                ]
            },
            
            guidelines: [
                'ابدأ بمشهد جذاب يقدم عالم القصة',
                'قدم البطل وحلمه أو هدفه مبكراً',
                'أدخل الصراع الرئيسي قبل الصفحة 15',
                'اجعل كل مشهد يطور الحبكة أو الشخصية',
                'أنه القصة بحل واضح للصراع الرئيسي'
            ]
        });

        // قالب الفيلم القصير
        this.templates.set('short_film', {
            id: 'short_film',
            name: 'فيلم قصير',
            description: 'بنية مركزة للأفلام القصيرة',
            category: 'سينما',
            
            structure: {
                type: 'SHORT_FILM',
                acts: [
                    { name: 'التقديم', pages: [1, 5], scenes: [1, 3], purpose: 'تقديم سريع للشخصية والموقف' },
                    { name: 'التطوير', pages: [6, 15], scenes: [3, 8], purpose: 'تطوير الصراع' },
                    { name: 'الحل', pages: [16, 20], scenes: [2, 4], purpose: 'الذروة والنتيجة' }
                ]
            },
            
            guidelines: [
                'ادخل في الحدث مباشرة',
                'ركز على فكرة واحدة قوية',
                'تجنب القصص الفرعية المعقدة',
                'اجعل كل كلمة تحتسب',
                'أنه بنتيجة مؤثرة'
            ]
        });

        // قالب الحلقة التلفزيونية
        this.templates.set('tv_episode', {
            id: 'tv_episode',
            name: 'حلقة تلفزيونية',
            description: 'بنية الحلقة التلفزيونية مع استراحات إعلانية',
            category: 'تلفزيون',
            
            structure: {
                type: 'TV_EPISODE',
                acts: [
                    { name: 'الفصل الأول', pages: [1, 8], scenes: [2, 4], purpose: 'الخطاف والتقديم' },
                    { name: 'الفصل الثاني', pages: [9, 16], scenes: [3, 6], purpose: 'تطوير الصراع' },
                    { name: 'الفصل الثالث', pages: [17, 24], scenes: [3, 6], purpose: 'التعقيد' },
                    { name: 'الفصل الرابع', pages: [25, 32], scenes: [2, 5], purpose: 'الذروة والحل' }
                ],
                commercialBreaks: [8, 16, 24]
            },
            
            guidelines: [
                'ابدأ بخطاف قوي قبل الاستراحة الأولى',
                'أنه كل فصل بنقطة تشويق',
                'حافظ على التوتر عبر الحلقة',
                'اربط بالحلقات السابقة واللاحقة',
                'اترك خيوط مفتوحة للحلقات القادمة'
            ]
        });
    }

    // =================== Helper Methods ===================

    generateProjectId() {
        return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateTemplateId() {
        return 'tmpl_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getDefaultActStructure(projectType) {
        const type = this.projectTypes[projectType];
        if (!type) return [];

        // بنية افتراضية حسب نوع المشروع
        switch (projectType) {
            case 'FEATURE_FILM':
                return [
                    { name: 'الفصل الأول', targetPages: Math.floor(type.pages[1] * 0.25) },
                    { name: 'الفصل الثاني', targetPages: Math.floor(type.pages[1] * 0.50) },
                    { name: 'الفصل الثالث', targetPages: Math.floor(type.pages[1] * 0.25) }
                ];
            case 'SHORT_FILM':
                return [
                    { name: 'البداية', targetPages: Math.floor(type.pages[1] * 0.3) },
                    { name: 'الوسط', targetPages: Math.floor(type.pages[1] * 0.5) },
                    { name: 'النهاية', targetPages: Math.floor(type.pages[1] * 0.2) }
                ];
            case 'TV_EPISODE':
                return [
                    { name: 'الفصل الأول', targetPages: Math.floor(type.pages[1] * 0.25) },
                    { name: 'الفصل الثاني', targetPages: Math.floor(type.pages[1] * 0.25) },
                    { name: 'الفصل الثالث', targetPages: Math.floor(type.pages[1] * 0.25) },
                    { name: 'الفصل الرابع', targetPages: Math.floor(type.pages[1] * 0.25) }
                ];
            default:
                return [{ name: 'الفصل الوحيد', targetPages: type.pages[1] }];
        }
    }

    calculateCompletionPercentage(project) {
        const targetLength = project.typeInfo.pages[1];
        const currentLength = project.progress.pageCount;
        
        return Math.min(100, Math.round((currentLength / targetLength) * 100));
    }

    analyzePace(project) {
        // تحليل مبسط لإيقاع القصة
        const totalScenes = project.progress.sceneCount;
        const totalPages = project.progress.pageCount;
        
        if (totalScenes === 0) return { rating: 'غير محدد', details: [] };
        
        const averageSceneLength = totalPages / totalScenes;
        
        let rating = 'متوسط';
        let details = [];
        
        if (averageSceneLength < 1.5) {
            rating = 'سريع';
            details.push('المشاهد قصيرة، إيقاع سريع');
        } else if (averageSceneLength > 3) {
            rating = 'بطيء';
            details.push('المشاهد طويلة، قد تحتاج تقليم');
        }
        
        return { rating, averageSceneLength, details };
    }

    countCompletedActs(project) {
        return project.structure.acts.filter(act => act.completed || false).length;
    }

    analyzeSceneDistribution(project) {
        const distribution = {};
        project.structure.acts.forEach(act => {
            distribution[act.name] = act.sceneCount || 0;
        });
        return distribution;
    }

    analyzeStructuralBalance(project) {
        const acts = project.structure.acts;
        const totalPages = project.progress.pageCount;
        
        if (totalPages === 0) return { balanced: true, issues: [] };
        
        const issues = [];
        let balanced = true;
        
        acts.forEach((act, index) => {
            const expectedRatio = act.targetPages / project.typeInfo.pages[1];
            const actualRatio = (act.pageCount || 0) / totalPages;
            const difference = Math.abs(expectedRatio - actualRatio);
            
            if (difference > 0.1) { // أكثر من 10% اختلاف
                balanced = false;
                issues.push(`${act.name}: ${Math.round(difference * 100)}% انحراف عن الهدف`);
            }
        });
        
        return { balanced, issues };
    }

    getUpcomingDeadlines(project) {
        const now = new Date();
        return project.timeline.deadlines
            .filter(deadline => new Date(deadline.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3); // أقرب 3 مواعيد نهائية
    }

    getMilestoneProgress(project) {
        const completed = project.timeline.milestones.filter(m => m.completed).length;
        const total = project.timeline.milestones.length;
        
        return {
            completed: completed,
            total: total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    calculateTimeSpent(project) {
        // حساب تقريبي للوقت المقضي
        const created = new Date(project.timeline.created);
        const lastModified = new Date(project.timeline.lastModified);
        const daysDiff = Math.floor((lastModified - created) / (1000 * 60 * 60 * 24));
        
        return {
            days: daysDiff,
            sessions: Math.floor(daysDiff / 2), // تقدير
            averageSessionLength: '2 ساعة' // تقدير
        };
    }

    estimateCompletionTime(project) {
        const completion = this.calculateCompletionPercentage(project);
        if (completion >= 100) return { status: 'مكتمل' };
        
        const remaining = 100 - completion;
        const timeSpent = this.calculateTimeSpent(project);
        const estimatedDays = Math.round((remaining / completion) * timeSpent.days);
        
        return {
            estimatedDays: estimatedDays,
            estimatedDate: new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
    }

    generateProgressInsights(project) {
        const insights = [];
        const completion = this.calculateCompletionPercentage(project);
        
        if (completion < 25) {
            insights.push({
                type: 'early_stage',
                message: 'المشروع في مرحلة مبكرة، ركز على تطوير الفكرة الأساسية',
                priority: 'معلومات'
            });
        } else if (completion < 50) {
            insights.push({
                type: 'middle_stage',
                message: 'أنت في منتصف الطريق، حافظ على الزخم',
                priority: 'تشجيع'
            });
        } else if (completion < 80) {
            insights.push({
                type: 'late_stage',
                message: 'تقترب من النهاية، ابدأ التفكير في المراجعة',
                priority: 'تخطيط'
            });
        } else {
            insights.push({
                type: 'near_completion',
                message: 'المشروع شبه مكتمل، حان وقت المراجعة النهائية',
                priority: 'عالي'
            });
        }
        
        return insights;
    }

    generateProgressRecommendations(project) {
        const recommendations = [];
        const completion = this.calculateCompletionPercentage(project);
        const pace = this.analyzePace(project);
        
        if (pace.rating === 'بطيء') {
            recommendations.push({
                type: 'pacing',
                title: 'تحسين الإيقاع',
                description: 'فكر في تقصير بعض المشاهد أو دمجها',
                priority: 'متوسط'
            });
        }
        
        if (completion > 50 && project.structure.characters.length < 3) {
            recommendations.push({
                type: 'character_development',
                title: 'تطوير الشخصيات',
                description: 'أضف المزيد من العمق للشخصيات الداعمة',
                priority: 'متوسط'
            });
        }
        
        return recommendations;
    }

    // =================== Backup Methods ===================

    async createBackup(projectId) {
        try {
            const project = this.projects.get(projectId);
            if (!project) return false;

            const backupId = `backup_${projectId}_${Date.now()}`;
            const backupData = {
                id: backupId,
                projectId: projectId,
                project: JSON.parse(JSON.stringify(project)), // deep copy
                createdAt: new Date().toISOString(),
                version: project.version,
                size: JSON.stringify(project).length
            };

            // حفظ النسخة الاحتياطية
            await this.saveBackupToDisk(backupData);
            
            // تنظيف النسخ القديمة
            await this.cleanupOldBackups(projectId);

            return true;

        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            return false;
        }
    }

    async restoreFromBackup(backupId) {
        try {
            const backupData = await this.loadBackupFromDisk(backupId);
            if (!backupData) {
                throw new Error('النسخة الاحتياطية غير موجودة');
            }

            const restoredProject = backupData.project;
            restoredProject.timeline.lastModified = new Date().toISOString();
            restoredProject.version = this.incrementVersion(restoredProject.version);

            this.projects.set(restoredProject.id, restoredProject);
            await this.saveProjectToDisk(restoredProject);

            return {
                success: true,
                project: restoredProject
            };

        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            throw new Error(`فشل الاستعادة: ${error.message}`);
        }
    }

    startAutoBackup() {
        if (!this.backupSettings.autoBackupEnabled) return;

        setInterval(async () => {
            if (this.activeProject) {
                await this.createBackup(this.activeProject.id);
            }
        }, this.backupSettings.backupInterval);
    }

    // =================== Storage Methods (محاكاة) ===================

    async saveProjectToDisk(project) {
        // في التطبيق الحقيقي، سيتم حفظ المشروع في قاعدة البيانات أو الملفات
        localStorage.setItem(`project_${project.id}`, JSON.stringify(project));
        return true;
    }

    async loadProjectFromDisk(projectId) {
        const saved = localStorage.getItem(`project_${projectId}`);
        return saved ? JSON.parse(saved) : null;
    }

    async saveTemplateToDisk(template) {
        localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
        return true;
    }

    async saveBackupToDisk(backupData) {
        localStorage.setItem(`backup_${backupData.id}`, JSON.stringify(backupData));
        return true;
    }

    async loadBackupFromDisk(backupId) {
        const saved = localStorage.getItem(`backup_${backupId}`);
        return saved ? JSON.parse(saved) : null;
    }

    async cleanupOldBackups(projectId) {
        const allBackups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`backup_${projectId}_`)) {
                const backupData = JSON.parse(localStorage.getItem(key));
                allBackups.push({ key, data: backupData });
            }
        }

        // ترتيب حسب التاريخ وحفظ أحدث X نسخ
        allBackups.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));
        
        for (let i = this.backupSettings.maxBackups; i < allBackups.length; i++) {
            localStorage.removeItem(allBackups[i].key);
        }
    }

    addToHistory(action, project) {
        this.projectHistory.unshift({
            action: action,
            projectId: project.id,
            projectName: project.name,
            timestamp: new Date().toISOString()
        });

        // الاحتفاظ بآخر 50 إجراء
        if (this.projectHistory.length > 50) {
            this.projectHistory = this.projectHistory.slice(0, 50);
        }
    }

    incrementVersion(version) {
        const parts = version.split('.').map(Number);
        parts[2]++; // increment patch
        return parts.join('.');
    }

    // =================== Public API Methods ===================

    /**
     * الحصول على قائمة جميع المشاريع
     */
    getAllProjects() {
        return Array.from(this.projects.values());
    }

    /**
     * الحصول على قائمة القوالب
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * الحصول على المشروع النشط
     */
    getActiveProject() {
        return this.activeProject;
    }

    /**
     * الحصول على تاريخ المشاريع
     */
    getProjectHistory() {
        return [...this.projectHistory];
    }

    /**
     * البحث في المشاريع
     */
    searchProjects(query) {
        const results = [];
        this.projects.forEach(project => {
            if (project.name.toLowerCase().includes(query.toLowerCase()) ||
                project.metadata.title.toLowerCase().includes(query.toLowerCase()) ||
                project.metadata.genre.toLowerCase().includes(query.toLowerCase())) {
                results.push(project);
            }
        });
        return results;
    }

    /**
     * تحديث إعدادات المشروع
     */
    updateProjectSettings(projectId, settings) {
        const project = this.projects.get(projectId);
        if (!project) return false;

        project.settings = { ...project.settings, ...settings };
        project.timeline.lastModified = new Date().toISOString();
        
        this.saveProjectToDisk(project);
        return true;
    }

    /**
     * حذف مشروع
     */
    async deleteProject(projectId) {
        const project = this.projects.get(projectId);
        if (!project) return false;

        // حذف من الذاكرة
        this.projects.delete(projectId);
        
        // حذف من القرص
        localStorage.removeItem(`project_${projectId}`);
        
        // حذف النسخ الاحتياطية
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`backup_${projectId}_`)) {
                localStorage.removeItem(key);
            }
        }

        // إزالة من التاريخ
        this.projectHistory = this.projectHistory.filter(h => h.projectId !== projectId);

        return true;
    }

    /**
     * إعدادات النسخ الاحتياطي
     */
    updateBackupSettings(settings) {
        this.backupSettings = { ...this.backupSettings, ...settings };
        
        if (settings.autoBackupEnabled !== undefined) {
            if (settings.autoBackupEnabled) {
                this.startAutoBackup();
            }
        }
    }

    getBackupSettings() {
        return { ...this.backupSettings };
    }
}

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProjectManager };
} else if (typeof window !== 'undefined') {
    window.ProjectManager = ProjectManager;
}