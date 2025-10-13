// ======================= ADVANCED ANALYTICS ENGINE ========================

/**
 * محرك التحليل المتقدم للسيناريوهات
 */
class ScreenplayAnalytics {
    constructor() {
        this.analysisCache = new Map();
        this.cacheExpiry = 30000; // 30 ثانية
        this.standardPageLength = 250; // كلمة في الصفحة
        this.averageReadingTime = 1; // دقيقة لكل صفحة
        this.standardSceneLength = 120; // ثانية لكل مشهد
    }

    /**
     * تحليل شامل للسيناريو
     * @param {HTMLElement} editor - عنصر المحرر
     * @returns {Promise<object>} تقرير التحليل الشامل
     */
    async analyzeScript(editor) {
        try {
            const cacheKey = this.generateCacheKey(editor.innerHTML);
            const cached = this.getCachedAnalysis(cacheKey);
            if (cached) return cached;

            const analysis = {
                basic: this.getBasicStats(editor),
                structure: await this.analyzeStructure(editor),
                characters: await this.analyzeCharacters(editor),
                dialogue: await this.analyzeDialogue(editor),
                pacing: await this.analyzePacing(editor),
                formatting: await this.analyzeFormatting(editor),
                readability: await this.analyzeReadability(editor),
                professional: await this.getProfessionalMetrics(editor),
                recommendations: []
            };

            // إضافة التوصيات
            analysis.recommendations = this.generateRecommendations(analysis);

            // حفظ في الذاكرة المؤقتة
            this.setCachedAnalysis(cacheKey, analysis);

            return analysis;

        } catch (error) {
            console.error('خطأ في التحليل:', error);
            throw new Error(`فشل في تحليل السيناريو: ${error.message}`);
        }
    }

    /**
     * الحصول على الإحصائيات الأساسية
     * @param {HTMLElement} editor - المحرر
     * @returns {object} الإحصائيات الأساسية
     */
    getBasicStats(editor) {
        const content = editor.textContent || '';
        const words = content.trim().split(/\s+/).filter(Boolean);
        const characters = content.length;
        const charactersNoSpaces = content.replace(/\s/g, '').length;
        const paragraphs = editor.children.length;
        
        const estimatedPages = Math.ceil(words.length / this.standardPageLength);
        const estimatedReadingTime = estimatedPages * this.averageReadingTime;

        return {
            totalWords: words.length,
            totalCharacters: characters,
            charactersNoSpaces: charactersNoSpaces,
            totalParagraphs: paragraphs,
            estimatedPages: estimatedPages,
            estimatedReadingTime: estimatedReadingTime,
            averageWordsPerParagraph: paragraphs > 0 ? Math.round(words.length / paragraphs) : 0,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * تحليل بنية السيناريو
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل البنية
     */
    async analyzeStructure(editor) {
        const elements = Array.from(editor.children);
        const structure = {
            scenes: 0,
            acts: 0,
            transitions: 0,
            sceneHeaders: { primary: 0, secondary: 0, tertiary: 0 },
            sceneBreakdown: [],
            averageSceneLength: 0,
            longestScene: { index: -1, wordCount: 0, timeEstimate: 0 },
            shortestScene: { index: -1, wordCount: Infinity, timeEstimate: 0 }
        };

        let currentScene = null;
        let sceneIndex = 0;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const className = element.className;
            const text = element.textContent.trim();
            const wordCount = text.split(/\s+/).filter(Boolean).length;

            // عد العناصر
            switch (className) {
                case 'scene-header-1':
                    // إنهاء المشهد السابق
                    if (currentScene) {
                        this.finalizeScene(currentScene, structure);
                    }
                    
                    // بدء مشهد جديد
                    currentScene = {
                        index: sceneIndex++,
                        title: text,
                        startIndex: i,
                        wordCount: 0,
                        dialogueLines: 0,
                        actionLines: 0,
                        characters: new Set(),
                        timeOfDay: this.extractTimeOfDay(text),
                        location: this.extractLocation(text),
                        sceneType: this.classifySceneType(text)
                    };
                    structure.scenes++;
                    structure.sceneHeaders.primary++;
                    break;

                case 'scene-header-2':
                    structure.sceneHeaders.secondary++;
                    if (currentScene) {
                        currentScene.timeOfDay = currentScene.timeOfDay || this.extractTimeOfDay(text);
                    }
                    break;

                case 'scene-header-3':
                    structure.sceneHeaders.tertiary++;
                    if (currentScene) {
                        currentScene.location = currentScene.location || this.extractLocation(text);
                    }
                    break;

                case 'character':
                    if (currentScene) {
                        const characterName = this.cleanCharacterName(text);
                        currentScene.characters.add(characterName);
                    }
                    break;

                case 'dialogue':
                    if (currentScene) {
                        currentScene.dialogueLines++;
                        currentScene.wordCount += wordCount;
                    }
                    break;

                case 'action':
                    if (currentScene) {
                        currentScene.actionLines++;
                        currentScene.wordCount += wordCount;
                    }
                    break;

                case 'transition':
                    structure.transitions++;
                    if (currentScene) {
                        // إنهاء المشهد عند الانتقال
                        this.finalizeScene(currentScene, structure);
                        currentScene = null;
                    }
                    break;
            }
        }

        // إنهاء المشهد الأخير
        if (currentScene) {
            this.finalizeScene(currentScene, structure);
        }

        // حساب المتوسطات
        if (structure.sceneBreakdown.length > 0) {
            const totalWords = structure.sceneBreakdown.reduce((sum, scene) => sum + scene.wordCount, 0);
            structure.averageSceneLength = Math.round(totalWords / structure.sceneBreakdown.length);
        }

        // تقدير عدد الفصول (كل 25-30 صفحة فصل)
        structure.acts = Math.max(1, Math.ceil(structure.scenes / 10));

        return structure;
    }

    /**
     * تحليل الشخصيات
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل الشخصيات
     */
    async analyzeCharacters(editor) {
        const elements = Array.from(editor.children);
        const characters = new Map();
        let currentCharacter = null;

        for (const element of elements) {
            const className = element.className;
            const text = element.textContent.trim();

            if (className === 'character') {
                currentCharacter = this.cleanCharacterName(text);
                
                if (!characters.has(currentCharacter)) {
                    characters.set(currentCharacter, {
                        name: currentCharacter,
                        appearances: 0,
                        dialogueLines: 0,
                        totalWords: 0,
                        averageWordsPerLine: 0,
                        firstAppearance: null,
                        lastAppearance: null,
                        scenes: new Set(),
                        emotionalTone: 'محايد',
                        dialogueStyle: 'طبيعي'
                    });
                }

                const character = characters.get(currentCharacter);
                character.appearances++;
                
                if (!character.firstAppearance) {
                    character.firstAppearance = elements.indexOf(element);
                }
                character.lastAppearance = elements.indexOf(element);

            } else if (className === 'dialogue' && currentCharacter) {
                const character = characters.get(currentCharacter);
                const wordCount = text.split(/\s+/).filter(Boolean).length;
                
                character.dialogueLines++;
                character.totalWords += wordCount;
                character.averageWordsPerLine = Math.round(character.totalWords / character.dialogueLines);

                // تحليل النبرة العاطفية
                character.emotionalTone = this.analyzeEmotionalTone(text);
                character.dialogueStyle = this.analyzeDialogueStyle(text);
            }
        }

        // تحويل النتائج إلى مصفوفة مرتبة
        const characterArray = Array.from(characters.values())
            .sort((a, b) => b.totalWords - a.totalWords);

        // تصنيف الشخصيات
        const characterClassification = {
            main: characterArray.slice(0, 3),
            supporting: characterArray.slice(3, 8),
            minor: characterArray.slice(8)
        };

        return {
            totalCharacters: characterArray.length,
            characters: characterArray,
            classification: characterClassification,
            mostActiveCharacter: characterArray[0] || null,
            dialogueDistribution: this.calculateDialogueDistribution(characterArray),
            characterDevelopment: this.analyzeCharacterDevelopment(characterArray)
        };
    }

    /**
     * تحليل الحوار
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل الحوار
     */
    async analyzeDialogue(editor) {
        const dialogueElements = editor.querySelectorAll('.dialogue');
        const parentheticalElements = editor.querySelectorAll('.parenthetical');
        
        let totalWords = 0;
        let totalLines = dialogueElements.length;
        let longestLine = { text: '', wordCount: 0 };
        let shortestLine = { text: '', wordCount: Infinity };
        
        const wordFrequency = new Map();
        const sentenceLengths = [];

        for (const element of dialogueElements) {
            const text = element.textContent.trim();
            const words = text.split(/\s+/).filter(Boolean);
            const wordCount = words.length;

            totalWords += wordCount;
            sentenceLengths.push(wordCount);

            // أطول وأقصر جملة
            if (wordCount > longestLine.wordCount) {
                longestLine = { text, wordCount };
            }
            if (wordCount < shortestLine.wordCount && wordCount > 0) {
                shortestLine = { text, wordCount };
            }

            // تكرار الكلمات
            words.forEach(word => {
                const cleanWord = word.toLowerCase().replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
                if (cleanWord.length > 2) {
                    wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
                }
            });
        }

        // الكلمات الأكثر استخداماً
        const mostUsedWords = Array.from(wordFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        // تحليل التعقيد
        const averageWordsPerLine = totalWords / totalLines || 0;
        const complexityScore = this.calculateDialogueComplexity(sentenceLengths);

        return {
            totalLines: totalLines,
            totalWords: totalWords,
            averageWordsPerLine: Math.round(averageWordsPerLine),
            longestLine: longestLine,
            shortestLine: shortestLine.wordCount === Infinity ? null : shortestLine,
            parentheticalCount: parentheticalElements.length,
            parentheticalRatio: (parentheticalElements.length / totalLines) * 100,
            mostUsedWords: mostUsedWords,
            complexityScore: complexityScore,
            readabilityLevel: this.getReadabilityLevel(complexityScore),
            dialogueToActionRatio: this.calculateDialogueToActionRatio(editor)
        };
    }

    /**
     * تحليل الإيقاع
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل الإيقاع
     */
    async analyzePacing(editor) {
        const elements = Array.from(editor.children);
        const scenes = [];
        let currentScene = { elements: [], wordCount: 0, dialogueCount: 0, actionCount: 0 };

        for (const element of elements) {
            const className = element.className;
            const wordCount = element.textContent.trim().split(/\s+/).filter(Boolean).length;

            if (className === 'scene-header-1') {
                if (currentScene.elements.length > 0) {
                    scenes.push({ ...currentScene });
                }
                currentScene = { elements: [element], wordCount: 0, dialogueCount: 0, actionCount: 0 };
            } else {
                currentScene.elements.push(element);
                currentScene.wordCount += wordCount;

                if (className === 'dialogue') {
                    currentScene.dialogueCount++;
                } else if (className === 'action') {
                    currentScene.actionCount++;
                }
            }
        }

        if (currentScene.elements.length > 0) {
            scenes.push(currentScene);
        }

        // تحليل الإيقاع
        const sceneLengths = scenes.map(scene => scene.wordCount);
        const dialogueRatios = scenes.map(scene => 
            scene.wordCount > 0 ? (scene.dialogueCount / scene.wordCount) * 100 : 0
        );

        const pacingAnalysis = {
            totalScenes: scenes.length,
            averageSceneLength: sceneLengths.reduce((a, b) => a + b, 0) / sceneLengths.length || 0,
            sceneLengthVariation: this.calculateVariation(sceneLengths),
            dialogueActionBalance: this.calculateDialogueActionBalance(scenes),
            pacingRhythm: this.analyzePacingRhythm(sceneLengths),
            tensionCurve: this.analyzeTensionCurve(scenes),
            recommendedBreaks: this.suggestSceneBreaks(scenes)
        };

        return pacingAnalysis;
    }

    /**
     * تحليل التنسيق
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل التنسيق
     */
    async analyzeFormatting(editor) {
        const elements = Array.from(editor.children);
        const formatCounts = {};
        const formatErrors = [];
        const suggestions = [];

        // عد عناصر التنسيق
        for (const element of elements) {
            const className = element.className;
            formatCounts[className] = (formatCounts[className] || 0) + 1;

            // فحص أخطاء التنسيق
            const errors = this.checkFormattingErrors(element, className);
            formatErrors.push(...errors);
        }

        // فحص التسلسل المنطقي
        const sequenceErrors = this.checkSequenceLogic(elements);
        formatErrors.push(...sequenceErrors);

        // اقتراحات التحسين
        suggestions.push(...this.generateFormattingSuggestions(formatCounts, formatErrors));

        const professionalScore = this.calculateProfessionalScore(formatCounts, formatErrors);

        return {
            formatCounts: formatCounts,
            formatErrors: formatErrors,
            suggestions: suggestions,
            professionalScore: professionalScore,
            complianceLevel: this.getComplianceLevel(professionalScore),
            industryStandards: this.compareToIndustryStandards(formatCounts)
        };
    }

    /**
     * تحليل سهولة القراءة
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل سهولة القراءة
     */
    async analyzeReadability(editor) {
        const content = editor.textContent || '';
        const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const words = content.trim().split(/\s+/).filter(Boolean);
        const syllables = this.countSyllables(content);

        // حساب مؤشرات سهولة القراءة
        const avgWordsPerSentence = words.length / sentences.length || 0;
        const avgSyllablesPerWord = syllables / words.length || 0;

        // مؤشر فليش للقراءة (مُكيف للعربية)
        const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        const readabilityLevel = this.getReadabilityLevel(fleschScore);
        const targetAudience = this.determineTargetAudience(fleschScore);

        return {
            fleschScore: Math.round(fleschScore),
            readabilityLevel: readabilityLevel,
            targetAudience: targetAudience,
            avgWordsPerSentence: Math.round(avgWordsPerSentence),
            avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
            totalSentences: sentences.length,
            readingTime: this.estimateReadingTime(words.length),
            complexityFactors: this.identifyComplexityFactors(content)
        };
    }

    /**
     * المقاييس المهنية
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} المقاييس المهنية
     */
    async getProfessionalMetrics(editor) {
        const basicStats = this.getBasicStats(editor);
        const structure = await this.analyzeStructure(editor);
        const formatting = await this.analyzeFormatting(editor);

        // معايير الصناعة
        const industryStandards = {
            idealPageCount: { min: 90, max: 120 },
            idealSceneCount: { min: 40, max: 60 },
            idealDialogueRatio: { min: 40, max: 70 }, // نسبة الحوار إلى النص الكامل
            maxSceneLength: 3, // صفحات
            idealActBreakdown: [25, 50, 25] // النسب المئوية للفصول الثلاثة
        };

        // حساب النقاط المهنية
        const professionalScore = this.calculateOverallProfessionalScore(
            basicStats, structure, formatting, industryStandards
        );

        return {
            industryStandards: industryStandards,
            professionalScore: professionalScore,
            marketReadiness: this.assessMarketReadiness(professionalScore),
            competitiveAnalysis: this.performCompetitiveAnalysis(basicStats, structure),
            submissionReadiness: this.assessSubmissionReadiness(formatting, structure)
        };
    }

    // =================== Helper Methods ===================

    generateCacheKey(content) {
        return btoa(content).slice(0, 32) + '_' + Date.now();
    }

    getCachedAnalysis(key) {
        const cached = this.analysisCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCachedAnalysis(key, data) {
        this.analysisCache.set(key, {
            data: data,
            timestamp: Date.now()
        });

        // تنظيف الذاكرة المؤقتة
        if (this.analysisCache.size > 10) {
            const oldestKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(oldestKey);
        }
    }

    finalizeScene(scene, structure) {
        scene.timeEstimate = Math.ceil(scene.wordCount / 100); // ثانية
        scene.charactersArray = Array.from(scene.characters);
        
        structure.sceneBreakdown.push(scene);

        // تحديث أطول وأقصر مشهد
        if (scene.wordCount > structure.longestScene.wordCount) {
            structure.longestScene = {
                index: scene.index,
                wordCount: scene.wordCount,
                timeEstimate: scene.timeEstimate
            };
        }

        if (scene.wordCount < structure.shortestScene.wordCount) {
            structure.shortestScene = {
                index: scene.index,
                wordCount: scene.wordCount,
                timeEstimate: scene.timeEstimate
            };
        }
    }

    extractTimeOfDay(text) {
        const timeKeywords = {
            'ليل': 'ليل',
            'نهار': 'نهار', 
            'صباح': 'صباح',
            'مساء': 'مساء',
            'فجر': 'فجر',
            'ظهر': 'ظهر',
            'عصر': 'عصر',
            'مغرب': 'مغرب',
            'عشاء': 'عشاء',
            'day': 'نهار',
            'night': 'ليل',
            'morning': 'صباح',
            'evening': 'مساء'
        };

        for (const [keyword, value] of Object.entries(timeKeywords)) {
            if (text.toLowerCase().includes(keyword)) {
                return value;
            }
        }
        return null;
    }

    extractLocation(text) {
        const locationKeywords = ['داخلي', 'خارجي', 'int.', 'ext.', 'منزل', 'مكتب', 'شارع', 'حديقة'];
        
        for (const keyword of locationKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return keyword;
            }
        }
        return null;
    }

    classifySceneType(text) {
        if (text.toLowerCase().includes('داخلي') || text.toLowerCase().includes('int.')) {
            return 'داخلي';
        } else if (text.toLowerCase().includes('خارجي') || text.toLowerCase().includes('ext.')) {
            return 'خارجي';
        }
        return 'غير محدد';
    }

    cleanCharacterName(name) {
        return name
            .replace(/[:.]/g, '')
            .trim()
            .toUpperCase();
    }

    analyzeEmotionalTone(text) {
        const emotionalWords = {
            إيجابي: ['سعيد', 'مبتسم', 'فرح', 'محب', 'متحمس', 'راض'],
            سلبي: ['غاضب', 'حزين', 'قلق', 'خائف', 'محبط', 'يائس'],
            محايد: ['يقول', 'يجيب', 'يسأل', 'يذكر', 'يوضح']
        };

        const lowerText = text.toLowerCase();
        
        for (const [tone, words] of Object.entries(emotionalWords)) {
            if (words.some(word => lowerText.includes(word))) {
                return tone;
            }
        }
        
        return 'محايد';
    }

    analyzeDialogueStyle(text) {
        const styleIndicators = {
            رسمي: ['سيدي', 'حضرتك', 'تفضلوا', 'بكل احترام'],
            عامي: ['يلا', 'خلاص', 'أيوة', 'أهو'],
            عاطفي: ['!', 'أحبك', 'أكرهك', 'للأسف'],
            تقني: ['النظام', 'البرنامج', 'التقنية', 'الجهاز']
        };

        const lowerText = text.toLowerCase();
        
        for (const [style, indicators] of Object.entries(styleIndicators)) {
            if (indicators.some(indicator => lowerText.includes(indicator))) {
                return style;
            }
        }
        
        return 'طبيعي';
    }

    calculateDialogueDistribution(characters) {
        const totalWords = characters.reduce((sum, char) => sum + char.totalWords, 0);
        
        return characters.map(character => ({
            name: character.name,
            percentage: totalWords > 0 ? Math.round((character.totalWords / totalWords) * 100) : 0
        }));
    }

    analyzeCharacterDevelopment(characters) {
        return characters.map(character => ({
            name: character.name,
            developmentScore: this.calculateDevelopmentScore(character),
            consistency: this.calculateConsistency(character),
            screenTime: this.calculateScreenTime(character)
        }));
    }

    calculateDevelopmentScore(character) {
        // نقاط التطوير: تنوع الحوار + طول الظهور + عدد المشاهد
        let score = 0;
        
        if (character.totalWords > 100) score += 25;
        if (character.appearances > 3) score += 25;
        if (character.averageWordsPerLine > 10) score += 25;
        if (character.dialogueLines > 10) score += 25;
        
        return Math.min(100, score);
    }

    calculateConsistency(character) {
        // حساب الثبات في النبرة وأسلوب الحوار
        return Math.random() * 30 + 70; // محاكاة - في التطبيق الحقيقي يحتاج تحليل أعمق
    }

    calculateScreenTime(character) {
        // تقدير وقت الظهور بالدقائق
        return Math.ceil(character.totalWords / 150); // تقدير: 150 كلمة = دقيقة واحدة
    }

    calculateDialogueComplexity(sentenceLengths) {
        const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
        const variation = this.calculateVariation(sentenceLengths);
        
        // نقاط التعقيد: متوسط الطول + التنوع
        return Math.min(100, (avgLength * 2) + (variation / 2));
    }

    calculateVariation(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        
        return Math.sqrt(variance);
    }

    calculateDialogueToActionRatio(editor) {
        const dialogueElements = editor.querySelectorAll('.dialogue');
        const actionElements = editor.querySelectorAll('.action');
        
        const dialogueWords = Array.from(dialogueElements)
            .reduce((sum, el) => sum + el.textContent.trim().split(/\s+/).filter(Boolean).length, 0);
        
        const actionWords = Array.from(actionElements)
            .reduce((sum, el) => sum + el.textContent.trim().split(/\s+/).filter(Boolean).length, 0);
        
        const total = dialogueWords + actionWords;
        
        return {
            dialogue: total > 0 ? Math.round((dialogueWords / total) * 100) : 0,
            action: total > 0 ? Math.round((actionWords / total) * 100) : 0,
            ratio: actionWords > 0 ? Math.round(dialogueWords / actionWords * 100) / 100 : 0
        };
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        // توصيات البنية
        if (analysis.structure.scenes < 40) {
            recommendations.push({
                type: 'structure',
                priority: 'متوسط',
                title: 'عدد المشاهد قليل',
                description: 'يُنصح بإضافة المزيد من المشاهد لإثراء القصة',
                suggestion: `العدد الحالي: ${analysis.structure.scenes}، المُوصى به: 40-60 مشهد`
            });
        }

        // توصيات الشخصيات
        if (analysis.characters.totalCharacters < 3) {
            recommendations.push({
                type: 'characters',
                priority: 'عالي',
                title: 'عدد الشخصيات قليل',
                description: 'يحتاج السيناريو إلى المزيد من الشخصيات لإثراء الحوار',
                suggestion: 'أضف شخصيات داعمة لتطوير الصراع والحبكة'
            });
        }

        // توصيات الحوار
        const dialogueRatio = analysis.dialogue.dialogueToActionRatio.dialogue;
        if (dialogueRatio > 80) {
            recommendations.push({
                type: 'dialogue',
                priority: 'متوسط',
                title: 'الحوار مُفرط',
                description: 'نسبة الحوار عالية جداً مقارنة بالأحداث',
                suggestion: 'أضف المزيد من أوصاف الأحداث والحركة'
            });
        } else if (dialogueRatio < 30) {
            recommendations.push({
                type: 'dialogue', 
                priority: 'متوسط',
                title: 'الحوار قليل',
                description: 'يحتاج السيناريو إلى المزيد من الحوار',
                suggestion: 'طور الحوارات بين الشخصيات لإظهار العلاقات'
            });
        }

        // توصيات التنسيق
        if (analysis.formatting.professionalScore < 80) {
            recommendations.push({
                type: 'formatting',
                priority: 'عالي',
                title: 'تحسين التنسيق مطلوب',
                description: 'التنسيق لا يلبي المعايير المهنية بالكامل',
                suggestion: 'راجع أخطاء التنسيق واتبع المعايير الصناعية'
            });
        }

        return recommendations;
    }

    countSyllables(text) {
        // حساب تقريبي للمقاطع في النص العربي
        const arabicText = text.replace(/[^\u0600-\u06FF]/g, '');
        const vowelPattern = /[اأإآؤئيةوىَُِ]/g;
        const matches = arabicText.match(vowelPattern) || [];
        return Math.max(1, matches.length);
    }

    getReadabilityLevel(score) {
        if (score >= 80) return 'سهل جداً';
        if (score >= 70) return 'سهل';
        if (score >= 60) return 'متوسط';
        if (score >= 50) return 'صعب نوعاً ما';
        return 'صعب';
    }

    determineTargetAudience(score) {
        if (score >= 80) return 'جمهور عام';
        if (score >= 70) return 'طلاب الثانوية';
        if (score >= 60) return 'طلاب الجامعة';
        return 'متخصصون';
    }

    estimateReadingTime(wordCount) {
        const wordsPerMinute = 200; // متوسط القراءة باللغة العربية
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        
        if (minutes < 60) {
            return `${minutes} دقيقة`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours} ساعة و ${remainingMinutes} دقيقة`;
        }
    }

    identifyComplexityFactors(content) {
        const factors = [];
        
        // جمل طويلة
        const longSentences = content.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length > 20);
        if (longSentences.length > 0) {
            factors.push(`${longSentences.length} جملة طويلة`);
        }

        // كلمات معقدة
        const complexWords = content.split(/\s+/).filter(word => word.length > 10);
        if (complexWords.length > content.split(/\s+/).length * 0.1) {
            factors.push('استخدام كثيف للكلمات الطويلة');
        }

        return factors;
    }

    checkFormattingErrors(element, className) {
        const errors = [];
        const text = element.textContent.trim();

        // فحص أخطاء تنسيق الشخصيات
        if (className === 'character') {
            if (!text.endsWith(':') && !text.endsWith('：')) {
                errors.push({
                    type: 'character_formatting',
                    message: 'اسم الشخصية يجب أن ينتهي بنقطتين',
                    element: element,
                    severity: 'متوسط'
                });
            }
            
            if (text !== text.toUpperCase()) {
                errors.push({
                    type: 'character_case',
                    message: 'اسم الشخصية يجب أن يكون بأحرف كبيرة',
                    element: element,
                    severity: 'منخفض'
                });
            }
        }

        // فحص أخطاء الحوار الفارغ
        if (className === 'dialogue' && !text) {
            errors.push({
                type: 'empty_dialogue',
                message: 'حوار فارغ',
                element: element,
                severity: 'عالي'
            });
        }

        return errors;
    }

    checkSequenceLogic(elements) {
        const errors = [];
        
        for (let i = 0; i < elements.length - 1; i++) {
            const current = elements[i].className;
            const next = elements[i + 1].className;

            // فحص التسلسل المنطقي
            if (current === 'character' && next === 'character') {
                errors.push({
                    type: 'sequence_error',
                    message: 'شخصيتان متتاليتان بدون حوار',
                    element: elements[i + 1],
                    severity: 'متوسط'
                });
            }

            if (current === 'dialogue' && next === 'parenthetical') {
                errors.push({
                    type: 'sequence_error',
                    message: 'التوجيه بين الأقواس يجب أن يأتي قبل الحوار',
                    element: elements[i + 1],
                    severity: 'منخفض'
                });
            }
        }

        return errors;
    }

    calculateProfessionalScore(formatCounts, formatErrors) {
        let score = 100;

        // خصم نقاط للأخطاء
        formatErrors.forEach(error => {
            switch (error.severity) {
                case 'عالي': score -= 10; break;
                case 'متوسط': score -= 5; break;
                case 'منخفض': score -= 2; break;
            }
        });

        // تقييم التوزيع
        const totalElements = Object.values(formatCounts).reduce((a, b) => a + b, 0);
        const dialogueRatio = (formatCounts.dialogue || 0) / totalElements * 100;
        
        if (dialogueRatio < 30 || dialogueRatio > 80) {
            score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    getComplianceLevel(score) {
        if (score >= 90) return 'ممتاز';
        if (score >= 80) return 'جيد';
        if (score >= 70) return 'مقبول';
        if (score >= 60) return 'يحتاج تحسين';
        return 'غير مقبول';
    }

    compareToIndustryStandards(formatCounts) {
        const standards = {
            'scene-header-1': { ideal: { min: 40, max: 60 }, weight: 0.3 },
            'character': { ideal: { min: 50, max: 200 }, weight: 0.2 },
            'dialogue': { ideal: { min: 100, max: 400 }, weight: 0.3 },
            'action': { ideal: { min: 80, max: 300 }, weight: 0.2 }
        };

        const comparison = {};
        
        for (const [format, standard] of Object.entries(standards)) {
            const count = formatCounts[format] || 0;
            const { min, max } = standard.ideal;
            
            let status = 'مناسب';
            if (count < min) status = 'قليل';
            else if (count > max) status = 'كثير';
            
            comparison[format] = {
                current: count,
                ideal: standard.ideal,
                status: status,
                weight: standard.weight
            };
        }

        return comparison;
    }

    calculateOverallProfessionalScore(basicStats, structure, formatting, standards) {
        let score = 0;
        let totalWeight = 0;

        // نقاط الطول
        const pageScore = this.scoreAgainstRange(
            basicStats.estimatedPages, 
            standards.idealPageCount.min, 
            standards.idealPageCount.max
        );
        score += pageScore * 0.25;
        totalWeight += 0.25;

        // نقاط المشاهد
        const sceneScore = this.scoreAgainstRange(
            structure.scenes,
            standards.idealSceneCount.min,
            standards.idealSceneCount.max
        );
        score += sceneScore * 0.25;
        totalWeight += 0.25;

        // نقاط التنسيق
        score += formatting.professionalScore * 0.3;
        totalWeight += 0.3;

        // نقاط البنية
        const structureScore = structure.scenes > 0 ? 100 : 0;
        score += structureScore * 0.2;
        totalWeight += 0.2;

        return Math.round(score / totalWeight);
    }

    scoreAgainstRange(value, min, max) {
        if (value >= min && value <= max) return 100;
        if (value < min) return Math.max(0, (value / min) * 100);
        return Math.max(0, 100 - ((value - max) / max) * 50);
    }

    assessMarketReadiness(professionalScore) {
        if (professionalScore >= 85) {
            return {
                level: 'جاهز للسوق',
                description: 'السيناريو يلبي المعايير المهنية ويمكن تقديمه للمنتجين',
                nextSteps: ['مراجعة نهائية', 'تحضير ملخص', 'البحث عن وكيل أو منتج']
            };
        } else if (professionalScore >= 70) {
            return {
                level: 'يحتاج مراجعة',
                description: 'السيناريو جيد لكن يحتاج تحسينات قبل التقديم',
                nextSteps: ['معالجة نقاط الضعف', 'مراجعة مع خبير', 'تحسين التنسيق']
            };
        } else {
            return {
                level: 'يحتاج عمل إضافي',
                description: 'السيناريو يحتاج إلى تطوير كبير قبل أن يصبح جاهزاً',
                nextSteps: ['إعادة كتابة أجزاء', 'تطوير الشخصيات', 'تحسين الحبكة']
            };
        }
    }

    performCompetitiveAnalysis(basicStats, structure) {
        // محاكاة تحليل تنافسي بناءً على معايير صناعية
        return {
            genre: 'دراما', // يمكن تطويره لاكتشاف النوع تلقائياً
            marketPosition: 'متوسط',
            competitiveStrength: {
                length: this.scoreAgainstRange(basicStats.estimatedPages, 90, 120),
                structure: structure.scenes >= 40 ? 85 : 60,
                pacing: 75 // محاكاة
            },
            recommendations: [
                'تطوير الشخصيات الداعمة',
                'تحسين نقاط التحول في الحبكة',
                'إضافة عناصر تشويق'
            ]
        };
    }

    assessSubmissionReadiness(formatting, structure) {
        const readinessChecklist = [
            { item: 'تنسيق مهني', status: formatting.professionalScore >= 80 },
            { item: 'بنية مكتملة', status: structure.scenes >= 30 },
            { item: 'طول مناسب', status: structure.scenes >= 40 && structure.scenes <= 70 },
            { item: 'خالي من الأخطاء', status: formatting.formatErrors.length < 5 }
        ];

        const passedItems = readinessChecklist.filter(item => item.status).length;
        const readinessPercentage = (passedItems / readinessChecklist.length) * 100;

        return {
            checklist: readinessChecklist,
            readinessPercentage: readinessPercentage,
            recommendation: readinessPercentage >= 80 ? 'جاهز للتقديم' : 'يحتاج تحسينات',
            missingRequirements: readinessChecklist
                .filter(item => !item.status)
                .map(item => item.item)
        };
    }
}

// تصدير المحرك
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScreenplayAnalytics };
} else if (typeof window !== 'undefined') {
    window.ScreenplayAnalytics = ScreenplayAnalytics;
}