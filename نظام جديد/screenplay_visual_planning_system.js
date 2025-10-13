// ======================= VISUAL PLANNING & STORY MAPPING SYSTEM ========================

/**
 * نظام التخطيط المرئي وخريطة القصة
 */
class VisualPlanningSystem {
    constructor() {
        this.storyboards = new Map();
        this.beatSheets = new Map();
        this.characterArcs = new Map();
        this.plotLines = new Map();
        this.timelines = new Map();
        
        // أدوات التخطيط
        this.planningTools = {
            storyboard: new StoryboardManager(this),
            beatSheet: new BeatSheetManager(this),
            characterArc: new CharacterArcManager(this),
            timeline: new TimelineManager(this),
            mindMap: new MindMapManager(this)
        };
        
        // إعدادات التصور
        this.visualSettings = {
            theme: 'light',
            colorScheme: 'default',
            showGridLines: true,
            showConnections: true,
            autoLayout: true,
            animations: true
        };
        
        // قوالب التخطيط
        this.initializePlanningTemplates();
    }

    /**
     * إنشاء لوحة قصة مرئية
     * @param {string} projectId - معرف المشروع
     * @param {object} storyboardData - بيانات لوحة القصة
     * @returns {Promise<object>} لوحة القصة الجديدة
     */
    async createStoryboard(projectId, storyboardData = {}) {
        try {
            const storyboardId = this.generateId('storyboard');
            
            const storyboard = {
                id: storyboardId,
                projectId: projectId,
                name: storyboardData.name || 'لوحة قصة جديدة',
                description: storyboardData.description || '',
                
                structure: {
                    acts: [],
                    scenes: [],
                    beats: [],
                    sequences: []
                },
                
                visualElements: {
                    cards: new Map(),
                    connections: new Map(),
                    annotations: new Map(),
                    media: new Map()
                },
                
                layout: {
                    type: storyboardData.layoutType || 'timeline',
                    orientation: storyboardData.orientation || 'horizontal',
                    spacing: storyboardData.spacing || 'medium',
                    grouping: storyboardData.grouping || 'acts'
                },
                
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: '1.0.0',
                    author: 'current_user',
                    status: 'draft'
                },
                
                settings: {
                    ...this.visualSettings,
                    ...storyboardData.settings
                }
            };

            this.storyboards.set(storyboardId, storyboard);
            
            return {
                success: true,
                storyboardId: storyboardId,
                storyboard: storyboard
            };

        } catch (error) {
            console.error('خطأ في إنشاء لوحة القصة:', error);
            throw new Error(`فشل إنشاء لوحة القصة: ${error.message}`);
        }
    }

    /**
     * إنشاء ورقة النبضات (Beat Sheet)
     * @param {string} projectId - معرف المشروع
     * @param {string} template - قالب ورقة النبضات
     * @returns {Promise<object>} ورقة النبضات الجديدة
     */
    async createBeatSheet(projectId, template = 'three_act') {
        try {
            const beatSheetId = this.generateId('beatsheet');
            const templateData = this.getBeatSheetTemplate(template);
            
            const beatSheet = {
                id: beatSheetId,
                projectId: projectId,
                name: `ورقة النبضات - ${templateData.name}`,
                template: template,
                
                structure: {
                    acts: templateData.acts.map(act => ({
                        ...act,
                        id: this.generateId('act'),
                        beats: act.beats.map(beat => ({
                            ...beat,
                            id: this.generateId('beat'),
                            completed: false,
                            content: '',
                            notes: '',
                            estimatedPages: beat.estimatedPages || 1
                        }))
                    }))
                },
                
                progress: {
                    totalBeats: templateData.totalBeats,
                    completedBeats: 0,
                    completionPercentage: 0
                },
                
                visualData: {
                    layout: 'vertical',
                    colorCoding: templateData.colorCoding || {},
                    customStyling: {}
                },
                
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            this.beatSheets.set(beatSheetId, beatSheet);
            
            return {
                success: true,
                beatSheetId: beatSheetId,
                beatSheet: beatSheet
            };

        } catch (error) {
            console.error('خطأ في إنشاء ورقة النبضات:', error);
            throw new Error(`فشل إنشاء ورقة النبضات: ${error.message}`);
        }
    }

    /**
     * إنشاء خريطة شخصية
     * @param {string} projectId - معرف المشروع
     * @param {string} characterName - اسم الشخصية
     * @param {object} arcData - بيانات قوس الشخصية
     * @returns {Promise<object>} خريطة الشخصية
     */
    async createCharacterArc(projectId, characterName, arcData = {}) {
        try {
            const arcId = this.generateId('arc');
            
            const characterArc = {
                id: arcId,
                projectId: projectId,
                characterName: characterName,
                
                journey: {
                    startingPoint: {
                        description: arcData.startingPoint || '',
                        traits: arcData.startingTraits || [],
                        goals: arcData.startingGoals || [],
                        fears: arcData.startingFears || []
                    },
                    
                    milestones: arcData.milestones || [
                        { name: 'الحادثة المحركة', description: '', completed: false },
                        { name: 'أول تحد', description: '', completed: false },
                        { name: 'نقطة التحول', description: '', completed: false },
                        { name: 'أزمة الشخصية', description: '', completed: false },
                        { name: 'الذروة', description: '', completed: false },
                        { name: 'التحول', description: '', completed: false }
                    ],
                    
                    endingPoint: {
                        description: arcData.endingPoint || '',
                        newTraits: arcData.endingTraits || [],
                        achievedGoals: arcData.achievedGoals || [],
                        overcomeFears: arcData.overcomeFears || []
                    }
                },
                
                relationships: {
                    allies: arcData.allies || [],
                    enemies: arcData.enemies || [],
                    mentors: arcData.mentors || [],
                    love_interests: arcData.loveInterests || []
                },
                
                themes: arcData.themes || [],
                symbolism: arcData.symbolism || [],
                
                visualData: {
                    color: arcData.color || this.getRandomColor(),
                    icon: arcData.icon || '👤',
                    position: arcData.position || { x: 0, y: 0 }
                },
                
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            };

            this.characterArcs.set(arcId, characterArc);
            
            return {
                success: true,
                arcId: arcId,
                characterArc: characterArc
            };

        } catch (error) {
            console.error('خطأ في إنشاء خريطة الشخصية:', error);
            throw new Error(`فشل إنشاء خريطة الشخصية: ${error.message}`);
        }
    }

    /**
     * إنشاء جدول زمني للمشروع
     * @param {string} projectId - معرف المشروع
     * @param {object} timelineData - بيانات الجدول الزمني
     * @returns {Promise<object>} الجدول الزمني
     */
    async createTimeline(projectId, timelineData = {}) {
        try {
            const timelineId = this.generateId('timeline');
            
            const timeline = {
                id: timelineId,
                projectId: projectId,
                name: timelineData.name || 'الجدول الزمني للمشروع',
                
                events: [
                    {
                        id: this.generateId('event'),
                        name: 'بداية المشروع',
                        date: new Date().toISOString(),
                        type: 'milestone',
                        completed: true,
                        description: 'بداية العمل على المشروع'
                    }
                ],
                
                milestones: [
                    { name: 'المعالجة الأولى', targetDate: null, completed: false },
                    { name: 'المسودة الأولى', targetDate: null, completed: false },
                    { name: 'المراجعة الأولى', targetDate: null, completed: false },
                    { name: 'المسودة النهائية', targetDate: null, completed: false }
                ],
                
                deadlines: timelineData.deadlines || [],
                
                visualSettings: {
                    timeUnit: timelineData.timeUnit || 'days',
                    showWeekends: timelineData.showWeekends || false,
                    colorScheme: timelineData.colorScheme || 'default',
                    layout: timelineData.layout || 'horizontal'
                },
                
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    startDate: timelineData.startDate || new Date().toISOString(),
                    endDate: timelineData.endDate || null
                }
            };

            this.timelines.set(timelineId, timeline);
            
            return {
                success: true,
                timelineId: timelineId,
                timeline: timeline
            };

        } catch (error) {
            console.error('خطأ في إنشاء الجدول الزمني:', error);
            throw new Error(`فشل إنشاء الجدول الزمني: ${error.message}`);
        }
    }

    /**
     * تحليل بصري للمشروع
     * @param {string} projectId - معرف المشروع
     * @param {HTMLElement} editorContent - محتوى المحرر
     * @returns {Promise<object>} التحليل البصري
     */
    async generateVisualAnalysis(projectId, editorContent) {
        try {
            const elements = Array.from(editorContent.children);
            const analysis = {
                structure: this.analyzeStructureVisually(elements),
                pacing: this.analyzePacingVisually(elements),
                characters: this.analyzeCharactersVisually(elements),
                emotions: this.analyzeEmotionalFlow(elements),
                themes: this.analyzeThematicDistribution(elements)
            };

            // إنشاء تصورات بيانية
            const visualizations = {
                structureChart: this.generateStructureChart(analysis.structure),
                pacingGraph: this.generatePacingGraph(analysis.pacing),
                characterNetwork: this.generateCharacterNetwork(analysis.characters),
                emotionalCurve: this.generateEmotionalCurve(analysis.emotions),
                themeCloud: this.generateThemeCloud(analysis.themes)
            };

            return {
                success: true,
                analysis: analysis,
                visualizations: visualizations,
                insights: this.generateVisualInsights(analysis),
                recommendations: this.generateVisualRecommendations(analysis)
            };

        } catch (error) {
            console.error('خطأ في التحليل البصري:', error);
            throw new Error(`فشل التحليل البصري: ${error.message}`);
        }
    }

    // =================== Visual Analysis Methods ===================

    analyzeStructureVisually(elements) {
        const structure = {
            scenes: [],
            acts: [],
            transitions: []
        };

        let currentAct = 1;
        let sceneCount = 0;

        elements.forEach((element, index) => {
            const className = element.className;
            const text = element.textContent.trim();

            switch (className) {
                case 'scene-header-1':
                    sceneCount++;
                    structure.scenes.push({
                        number: sceneCount,
                        title: text,
                        position: index,
                        act: currentAct,
                        length: 0 // سيتم حسابه لاحقاً
                    });
                    break;
                    
                case 'transition':
                    structure.transitions.push({
                        text: text,
                        position: index,
                        fromScene: sceneCount,
                        toScene: sceneCount + 1
                    });
                    
                    // تحديد بداية فصل جديد بناءً على نوع الانتقال
                    if (text.toLowerCase().includes('فصل') || text.toLowerCase().includes('act')) {
                        currentAct++;
                    }
                    break;
            }
        });

        // تجميع المشاهد في فصول
        structure.acts = this.groupScenesIntoActs(structure.scenes);

        return structure;
    }

    analyzePacingVisually(elements) {
        const pacing = {
            sceneRhythm: [],
            dialogueRatio: [],
            actionRatio: [],
            pacingScore: 0
        };

        let currentSceneElements = 0;
        let dialogueCount = 0;
        let actionCount = 0;

        elements.forEach(element => {
            const className = element.className;

            if (className === 'scene-header-1' && currentSceneElements > 0) {
                // حفظ بيانات المشهد السابق
                pacing.sceneRhythm.push(currentSceneElements);
                pacing.dialogueRatio.push(dialogueCount / currentSceneElements);
                pacing.actionRatio.push(actionCount / currentSceneElements);

                // إعادة تعيين العدادات
                currentSceneElements = 0;
                dialogueCount = 0;
                actionCount = 0;
            }

            currentSceneElements++;

            if (className === 'dialogue') dialogueCount++;
            if (className === 'action') actionCount++;
        });

        // المشهد الأخير
        if (currentSceneElements > 0) {
            pacing.sceneRhythm.push(currentSceneElements);
            pacing.dialogueRatio.push(dialogueCount / currentSceneElements);
            pacing.actionRatio.push(actionCount / currentSceneElements);
        }

        // حساب نقاط الإيقاع
        pacing.pacingScore = this.calculatePacingScore(pacing);

        return pacing;
    }

    analyzeCharactersVisually(elements) {
        const characters = new Map();
        const interactions = new Map();
        let currentCharacter = null;

        elements.forEach(element => {
            const className = element.className;
            const text = element.textContent.trim();

            if (className === 'character') {
                const characterName = text.replace(/[:.]/g, '').trim();
                currentCharacter = characterName;

                if (!characters.has(characterName)) {
                    characters.set(characterName, {
                        name: characterName,
                        appearances: 0,
                        dialogueCount: 0,
                        emotionalStates: [],
                        relationships: new Set()
                    });
                }

                characters.get(characterName).appearances++;
            } else if (className === 'dialogue' && currentCharacter) {
                characters.get(currentCharacter).dialogueCount++;
                
                // تحليل المشاعر من الحوار
                const emotion = this.extractEmotionFromText(text);
                if (emotion) {
                    characters.get(currentCharacter).emotionalStates.push(emotion);
                }
            }
        });

        return {
            characters: Array.from(characters.values()),
            interactions: Array.from(interactions.values()),
            network: this.buildCharacterNetwork(characters)
        };
    }

    analyzeEmotionalFlow(elements) {
        const emotions = [];
        let sceneEmotions = [];
        let sceneNumber = 0;

        elements.forEach(element => {
            const className = element.className;
            const text = element.textContent.trim();

            if (className === 'scene-header-1') {
                if (sceneEmotions.length > 0) {
                    emotions.push({
                        scene: sceneNumber,
                        dominantEmotion: this.getDominantEmotion(sceneEmotions),
                        emotionalIntensity: this.calculateEmotionalIntensity(sceneEmotions),
                        emotions: [...sceneEmotions]
                    });
                }
                sceneNumber++;
                sceneEmotions = [];
            } else if (className === 'dialogue' || className === 'action') {
                const emotion = this.extractEmotionFromText(text);
                if (emotion) {
                    sceneEmotions.push(emotion);
                }
            }
        });

        // المشهد الأخير
        if (sceneEmotions.length > 0) {
            emotions.push({
                scene: sceneNumber,
                dominantEmotion: this.getDominantEmotion(sceneEmotions),
                emotionalIntensity: this.calculateEmotionalIntensity(sceneEmotions),
                emotions: [...sceneEmotions]
            });
        }

        return {
            sceneEmotions: emotions,
            overallFlow: this.analyzeEmotionalArc(emotions),
            emotionalPeaks: this.identifyEmotionalPeaks(emotions)
        };
    }

    analyzeThematicDistribution(elements) {
        const themes = new Map();
        const themeProgression = [];

        elements.forEach((element, index) => {
            const text = element.textContent.trim();
            const detectedThemes = this.extractThemesFromText(text);

            detectedThemes.forEach(theme => {
                if (!themes.has(theme)) {
                    themes.set(theme, {
                        name: theme,
                        occurrences: 0,
                        positions: [],
                        intensity: 0
                    });
                }

                const themeData = themes.get(theme);
                themeData.occurrences++;
                themeData.positions.push(index);
                themeData.intensity += this.calculateThemeIntensity(text, theme);
            });
        });

        return {
            themes: Array.from(themes.values()),
            distribution: this.calculateThemeDistribution(themes),
            progression: this.analyzeThemeProgression(themes, elements.length)
        };
    }

    // =================== Visualization Generation ===================

    generateStructureChart(structureData) {
        return {
            type: 'structure_chart',
            data: {
                acts: structureData.acts.map(act => ({
                    name: act.name,
                    scenes: act.scenes.length,
                    percentage: (act.scenes.length / structureData.scenes.length) * 100
                })),
                scenes: structureData.scenes.map(scene => ({
                    number: scene.number,
                    act: scene.act,
                    title: scene.title,
                    length: scene.length
                }))
            },
            options: {
                chart: 'bar',
                orientation: 'horizontal',
                colors: ['#3b82f6', '#10b981', '#f59e0b']
            }
        };
    }

    generatePacingGraph(pacingData) {
        return {
            type: 'pacing_graph',
            data: {
                sceneRhythm: pacingData.sceneRhythm,
                dialogueRatio: pacingData.dialogueRatio,
                actionRatio: pacingData.actionRatio,
                sceneNumbers: Array.from({ length: pacingData.sceneRhythm.length }, (_, i) => i + 1)
            },
            options: {
                chart: 'line',
                smooth: true,
                showPoints: true,
                colors: ['#8b5cf6', '#06b6d4', '#84cc16']
            }
        };
    }

    generateCharacterNetwork(charactersData) {
        return {
            type: 'character_network',
            data: {
                nodes: charactersData.characters.map(char => ({
                    id: char.name,
                    label: char.name,
                    size: Math.max(10, char.appearances * 2),
                    color: this.getCharacterColor(char.name)
                })),
                edges: this.buildCharacterConnections(charactersData.characters)
            },
            options: {
                layout: 'force',
                showLabels: true,
                interactive: true
            }
        };
    }

    generateEmotionalCurve(emotionsData) {
        return {
            type: 'emotional_curve',
            data: {
                points: emotionsData.sceneEmotions.map(scene => ({
                    x: scene.scene,
                    y: scene.emotionalIntensity,
                    emotion: scene.dominantEmotion,
                    color: this.getEmotionColor(scene.dominantEmotion)
                })),
                peaks: emotionsData.emotionalPeaks
            },
            options: {
                chart: 'area',
                smooth: true,
                fillOpacity: 0.3,
                showPeaks: true
            }
        };
    }

    generateThemeCloud(themesData) {
        return {
            type: 'theme_cloud',
            data: {
                words: themesData.themes.map(theme => ({
                    text: theme.name,
                    weight: theme.intensity,
                    color: this.getThemeColor(theme.name)
                }))
            },
            options: {
                maxWords: 50,
                spiral: 'archimedean',
                fontSizeRange: [12, 48]
            }
        };
    }

    // =================== Helper Methods ===================

    generateId(prefix) {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2)}`;
    }

    getBeatSheetTemplate(templateName) {
        const templates = {
            'three_act': {
                name: 'البنية الثلاثية التقليدية',
                totalBeats: 15,
                acts: [
                    {
                        name: 'الفصل الأول',
                        percentage: 25,
                        beats: [
                            { name: 'الافتتاحية', description: 'تقديم العالم والشخصية', estimatedPages: 1 },
                            { name: 'الحادثة المحركة', description: 'الحدث الذي يبدأ القصة', estimatedPages: 2 },
                            { name: 'نقطة التحول الأولى', description: 'البطل يدخل العالم الجديد', estimatedPages: 2 }
                        ]
                    },
                    {
                        name: 'الفصل الثاني',
                        percentage: 50,
                        beats: [
                            { name: 'اللعبة الممتعة', description: 'استكشاف الموقف الجديد', estimatedPages: 5 },
                            { name: 'نقطة المنتصف', description: 'انتصار زائف أو هزيمة', estimatedPages: 3 },
                            { name: 'الأعداء يقتربون', description: 'الأمور تسوء', estimatedPages: 5 },
                            { name: 'كل شيء ضائع', description: 'أحلك لحظة', estimatedPages: 2 },
                            { name: 'نقطة التحول الثانية', description: 'البطل يجد الحل', estimatedPages: 2 }
                        ]
                    },
                    {
                        name: 'الفصل الثالث',
                        percentage: 25,
                        beats: [
                            { name: 'الذروة', description: 'المواجهة النهائية', estimatedPages: 3 },
                            { name: 'النتيجة', description: 'حل الصراع', estimatedPages: 2 },
                            { name: 'العالم الجديد', description: 'كيف تغير البطل والعالم', estimatedPages: 1 }
                        ]
                    }
                ],
                colorCoding: {
                    'الفصل الأول': '#3b82f6',
                    'الفصل الثاني': '#10b981',
                    'الفصل الثالث': '#f59e0b'
                }
            },
            
            'hero_journey': {
                name: 'رحلة البطل',
                totalBeats: 17,
                acts: [
                    {
                        name: 'الانطلاق',
                        percentage: 25,
                        beats: [
                            { name: 'العالم العادي', description: 'حياة البطل قبل المغامرة' },
                            { name: 'نداء المغامرة', description: 'مواجهة مشكلة أو تحد' },
                            { name: 'رفض النداء', description: 'تردد أو خوف من التغيير' },
                            { name: 'لقاء المرشد', description: 'حكيم يقدم النصح والأدوات' },
                            { name: 'عبور العتبة', description: 'ترك العالم المألوف' }
                        ]
                    }
                    // المزيد من الفصول...
                ]
            }
        };

        return templates[templateName] || templates['three_act'];
    }

    initializePlanningTemplates() {
        // قوالب جاهزة لأنواع مختلفة من المشاريع
        this.planningTemplates = new Map();
        
        // قالب الفيلم الرومانسي
        this.planningTemplates.set('romantic_film', {
            name: 'فيلم رومانسي',
            beatSheet: 'three_act',
            characterArcs: ['البطل', 'البطلة', 'المنافس'],
            themes: ['الحب', 'التضحية', 'النمو الشخصي'],
            emotionalBeats: ['اللقاء', 'الجذب', 'الصراع', 'الانفصال', 'اللم الشمل']
        });
        
        // قالب فيلم الأكشن
        this.planningTemplates.set('action_film', {
            name: 'فيلم أكشن',
            beatSheet: 'three_act',
            characterArcs: ['البطل', 'الخصم', 'الحليف'],
            themes: ['العدالة', 'الانتقام', 'الفداء'],
            actionSequences: ['المطاردة الافتتاحية', 'مواجهة منتصف الفيلم', 'المعركة النهائية']
        });
    }

    groupScenesIntoActs(scenes) {
        // تجميع بسيط - يمكن تحسينه
        const totalScenes = scenes.length;
        const acts = [];

        if (totalScenes <= 10) {
            // فيلم قصير - فصلين
            acts.push({
                name: 'الفصل الأول',
                scenes: scenes.slice(0, Math.ceil(totalScenes / 2))
            });
            acts.push({
                name: 'الفصل الثاني',
                scenes: scenes.slice(Math.ceil(totalScenes / 2))
            });
        } else {
            // فيلم طويل - ثلاثة فصول
            const firstActEnd = Math.ceil(totalScenes * 0.25);
            const secondActEnd = Math.ceil(totalScenes * 0.75);

            acts.push({
                name: 'الفصل الأول',
                scenes: scenes.slice(0, firstActEnd)
            });
            acts.push({
                name: 'الفصل الثاني',
                scenes: scenes.slice(firstActEnd, secondActEnd)
            });
            acts.push({
                name: 'الفصل الثالث',
                scenes: scenes.slice(secondActEnd)
            });
        }

        return acts;
    }

    calculatePacingScore(pacingData) {
        // حساب بسيط لنقاط الإيقاع
        const avgSceneLength = pacingData.sceneRhythm.reduce((a, b) => a + b, 0) / pacingData.sceneRhythm.length;
        const variation = this.calculateVariation(pacingData.sceneRhythm);
        const dialogueBalance = pacingData.dialogueRatio.reduce((a, b) => a + b, 0) / pacingData.dialogueRatio.length;

        return Math.round((avgSceneLength * 0.3 + (1 - variation) * 0.4 + dialogueBalance * 0.3) * 100);
    }

    calculateVariation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance) / mean;
    }

    extractEmotionFromText(text) {
        const emotionKeywords = {
            'سعيد': ['سعيد', 'فرح', 'مبتسم', 'ضاحك'],
            'حزين': ['حزين', 'كئيب', 'باكي', 'متألم'],
            'غاضب': ['غاضب', 'منفعل', 'ثائر', 'صارخ'],
            'خائف': ['خائف', 'مرعوب', 'قلق', 'متوتر'],
            'محب': ['أحبك', 'حب', 'عشق', 'غرام']
        };

        const lowerText = text.toLowerCase();
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return emotion;
            }
        }
        
        return 'محايد';
    }

    extractThemesFromText(text) {
        const themeKeywords = {
            'الحب': ['حب', 'عشق', 'حبيب', 'قلب'],
            'العائلة': ['أب', 'أم', 'عائلة', 'أسرة'],
            'الصداقة': ['صديق', 'صداقة', 'رفيق'],
            'العدالة': ['عدل', 'حق', 'ظلم', 'انتصاف'],
            'الخيانة': ['خيانة', 'غدر', 'خذلان']
        };

        const themes = [];
        const lowerText = text.toLowerCase();
        
        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                themes.push(theme);
            }
        }
        
        return themes;
    }

    getDominantEmotion(emotions) {
        const emotionCount = {};
        emotions.forEach(emotion => {
            emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
        
        let dominant = 'محايد';
        let maxCount = 0;
        
        for (const [emotion, count] of Object.entries(emotionCount)) {
            if (count > maxCount) {
                maxCount = count;
                dominant = emotion;
            }
        }
        
        return dominant;
    }

    calculateEmotionalIntensity(emotions) {
        const intensityMap = {
            'محايد': 0,
            'سعيد': 0.7,
            'حزين': 0.8,
            'غاضب': 0.9,
            'خائف': 0.8,
            'محب': 0.6
        };
        
        const totalIntensity = emotions.reduce((sum, emotion) => 
            sum + (intensityMap[emotion] || 0), 0);
            
        return emotions.length > 0 ? totalIntensity / emotions.length : 0;
    }

    getRandomColor() {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getCharacterColor(characterName) {
        // إنشاء لون ثابت للشخصية بناء على الاسم
        let hash = 0;
        for (let i = 0; i < characterName.length; i++) {
            hash = characterName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 50%)`;
    }

    getEmotionColor(emotion) {
        const emotionColors = {
            'محايد': '#6b7280',
            'سعيد': '#fbbf24',
            'حزين': '#3b82f6',
            'غاضب': '#ef4444',
            'خائف': '#8b5cf6',
            'محب': '#f472b6'
        };
        
        return emotionColors[emotion] || '#6b7280';
    }

    getThemeColor(theme) {
        const themeColors = {
            'الحب': '#f472b6',
            'العائلة': '#10b981',
            'الصداقة': '#fbbf24',
            'العدالة': '#3b82f6',
            'الخيانة': '#ef4444'
        };
        
        return themeColors[theme] || '#6b7280';
    }

    generateVisualInsights(analysis) {
        const insights = [];
        
        // تحليل البنية
        if (analysis.structure.acts.length !== 3) {
            insights.push({
                type: 'structure',
                message: `السيناريو لديه ${analysis.structure.acts.length} فصول بدلاً من 3`,
                priority: 'متوسط'
            });
        }
        
        // تحليل الإيقاع
        if (analysis.pacing.pacingScore < 60) {
            insights.push({
                type: 'pacing',
                message: 'إيقاع السيناريو بطيء، قد تحتاج لتسريع بعض المشاهد',
                priority: 'عالي'
            });
        }
        
        return insights;
    }

    generateVisualRecommendations(analysis) {
        const recommendations = [];
        
        // توصيات الشخصيات
        if (analysis.characters.characters.length < 3) {
            recommendations.push({
                type: 'characters',
                title: 'إضافة المزيد من الشخصيات',
                description: 'السيناريو يحتاج إلى المزيد من الشخصيات المتطورة'
            });
        }
        
        // توصيات المشاعر
        const emotionalPeaks = analysis.emotions.emotionalPeaks;
        if (emotionalPeaks.length < 3) {
            recommendations.push({
                type: 'emotions',
                title: 'تعزيز النقاط العاطفية',
                description: 'أضف المزيد من اللحظات العاطفية القوية'
            });
        }
        
        return recommendations;
    }

    // =================== Public API Methods ===================

    /**
     * الحصول على جميع لوحات القصة
     */
    getAllStoryboards() {
        return Array.from(this.storyboards.values());
    }

    /**
     * الحصول على جميع أوراق النبضات
     */
    getAllBeatSheets() {
        return Array.from(this.beatSheets.values());
    }

    /**
     * الحصول على جميع خرائط الشخصيات
     */
    getAllCharacterArcs() {
        return Array.from(this.characterArcs.values());
    }

    /**
     * تحديث بيانات التخطيط
     */
    updatePlanningData(type, id, updates) {
        let collection;
        
        switch (type) {
            case 'storyboard':
                collection = this.storyboards;
                break;
            case 'beatsheet':
                collection = this.beatSheets;
                break;
            case 'characterarc':
                collection = this.characterArcs;
                break;
            case 'timeline':
                collection = this.timelines;
                break;
            default:
                return false;
        }
        
        const item = collection.get(id);
        if (!item) return false;
        
        Object.assign(item, updates);
        item.metadata.updatedAt = new Date().toISOString();
        
        return true;
    }

    /**
     * حذف عنصر تخطيط
     */
    deletePlanningItem(type, id) {
        switch (type) {
            case 'storyboard':
                return this.storyboards.delete(id);
            case 'beatsheet':
                return this.beatSheets.delete(id);
            case 'characterarc':
                return this.characterArcs.delete(id);
            case 'timeline':
                return this.timelines.delete(id);
            default:
                return false;
        }
    }
}

// =================== SPECIALIZED MANAGERS ===================

/**
 * مدير لوحات القصة
 */
class StoryboardManager {
    constructor(planningSystem) {
        this.planningSystem = planningSystem;
    }

    async addCard(storyboardId, cardData) {
        const storyboard = this.planningSystem.storyboards.get(storyboardId);
        if (!storyboard) return false;

        const cardId = this.planningSystem.generateId('card');
        const card = {
            id: cardId,
            title: cardData.title || 'بطاقة جديدة',
            content: cardData.content || '',
            type: cardData.type || 'scene',
            position: cardData.position || { x: 0, y: 0 },
            size: cardData.size || { width: 200, height: 150 },
            color: cardData.color || '#ffffff',
            metadata: {
                createdAt: new Date().toISOString()
            }
        };

        storyboard.visualElements.cards.set(cardId, card);
        return cardId;
    }

    async addConnection(storyboardId, fromCardId, toCardId, connectionData = {}) {
        const storyboard = this.planningSystem.storyboards.get(storyboardId);
        if (!storyboard) return false;

        const connectionId = this.planningSystem.generateId('connection');
        const connection = {
            id: connectionId,
            from: fromCardId,
            to: toCardId,
            type: connectionData.type || 'sequence',
            style: connectionData.style || 'arrow',
            color: connectionData.color || '#666666',
            label: connectionData.label || ''
        };

        storyboard.visualElements.connections.set(connectionId, connection);
        return connectionId;
    }
}

/**
 * مدير أوراق النبضات
 */
class BeatSheetManager {
    constructor(planningSystem) {
        this.planningSystem = planningSystem;
    }

    async updateBeat(beatSheetId, actIndex, beatIndex, updates) {
        const beatSheet = this.planningSystem.beatSheets.get(beatSheetId);
        if (!beatSheet || !beatSheet.structure.acts[actIndex]) return false;

        const beat = beatSheet.structure.acts[actIndex].beats[beatIndex];
        if (!beat) return false;

        Object.assign(beat, updates);
        
        // تحديث إحصائيات التقدم
        this.updateProgress(beatSheet);
        
        return true;
    }

    updateProgress(beatSheet) {
        const completedBeats = beatSheet.structure.acts
            .flatMap(act => act.beats)
            .filter(beat => beat.completed).length;
            
        beatSheet.progress.completedBeats = completedBeats;
        beatSheet.progress.completionPercentage = 
            Math.round((completedBeats / beatSheet.progress.totalBeats) * 100);
    }
}

/**
 * مدير خرائط الشخصيات
 */
class CharacterArcManager {
    constructor(planningSystem) {
        this.planningSystem = planningSystem;
    }

    async updateMilestone(arcId, milestoneIndex, updates) {
        const arc = this.planningSystem.characterArcs.get(arcId);
        if (!arc || !arc.journey.milestones[milestoneIndex]) return false;

        Object.assign(arc.journey.milestones[milestoneIndex], updates);
        arc.metadata.updatedAt = new Date().toISOString();
        
        return true;
    }

    async addRelationship(arcId, relationshipType, characterName, description = '') {
        const arc = this.planningSystem.characterArcs.get(arcId);
        if (!arc) return false;

        if (!arc.relationships[relationshipType]) {
            arc.relationships[relationshipType] = [];
        }

        arc.relationships[relationshipType].push({
            character: characterName,
            description: description,
            addedAt: new Date().toISOString()
        });

        return true;
    }
}

/**
 * مدير الجداول الزمنية
 */
class TimelineManager {
    constructor(planningSystem) {
        this.planningSystem = planningSystem;
    }

    async addEvent(timelineId, eventData) {
        const timeline = this.planningSystem.timelines.get(timelineId);
        if (!timeline) return false;

        const eventId = this.planningSystem.generateId('event');
        const event = {
            id: eventId,
            name: eventData.name,
            date: eventData.date,
            type: eventData.type || 'task',
            completed: eventData.completed || false,
            description: eventData.description || '',
            duration: eventData.duration || null
        };

        timeline.events.push(event);
        timeline.metadata.updatedAt = new Date().toISOString();
        
        return eventId;
    }

    async updateMilestone(timelineId, milestoneIndex, updates) {
        const timeline = this.planningSystem.timelines.get(timelineId);
        if (!timeline || !timeline.milestones[milestoneIndex]) return false;

        Object.assign(timeline.milestones[milestoneIndex], updates);
        return true;
    }
}

/**
 * مدير الخرائط الذهنية
 */
class MindMapManager {
    constructor(planningSystem) {
        this.planningSystem = planningSystem;
    }

    async createMindMap(projectId, topic) {
        const mindMapId = this.planningSystem.generateId('mindmap');
        
        const mindMap = {
            id: mindMapId,
            projectId: projectId,
            centralTopic: topic,
            nodes: new Map(),
            connections: new Map(),
            layout: 'radial',
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        // إضافة العقدة المركزية
        const centralNodeId = this.planningSystem.generateId('node');
        mindMap.nodes.set(centralNodeId, {
            id: centralNodeId,
            text: topic,
            type: 'central',
            position: { x: 0, y: 0 },
            color: '#3b82f6'
        });

        return mindMap;
    }
}

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        VisualPlanningSystem,
        StoryboardManager,
        BeatSheetManager,
        CharacterArcManager,
        TimelineManager,
        MindMapManager
    };
} else if (typeof window !== 'undefined') {
    window.VisualPlanningSystem = VisualPlanningSystem;
    window.StoryboardManager = StoryboardManager;
    window.BeatSheetManager = BeatSheetManager;
    window.CharacterArcManager = CharacterArcManager;
    window.TimelineManager = TimelineManager;
    window.MindMapManager = MindMapManager;
}