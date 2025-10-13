// ======================= ADVANCED CHARACTER MANAGEMENT SYSTEM ========================

/**
 * نظام إدارة الشخصيات المتقدم
 */
class CharacterManager {
    constructor() {
        this.characters = new Map();
        this.relationships = new Map();
        this.characterArcs = new Map();
        this.dialogueStyles = new Map();
        this.characterNotes = new Map();
        this.castingIdeas = new Map();
        
        // إعدادات النظام
        this.settings = {
            autoDetectCharacters: true,
            trackCharacterConsistency: true,
            analyzeDialoguePatterns: true,
            suggestCharacterDevelopment: true,
            enableVoiceAnalysis: true
        };
        
        // أنواع العلاقات
        this.relationshipTypes = {
            FAMILY: 'عائلية',
            ROMANTIC: 'رومانسية', 
            FRIENDSHIP: 'صداقة',
            PROFESSIONAL: 'مهنية',
            ANTAGONISTIC: 'عدائية',
            MENTOR: 'إرشادية',
            NEUTRAL: 'محايدة'
        };
        
        // أنواع الشخصيات
        this.characterTypes = {
            PROTAGONIST: 'البطل',
            ANTAGONIST: 'الخصم',
            SUPPORTING: 'داعم',
            MINOR: 'ثانوي',
            BACKGROUND: 'خلفية'
        };
    }

    /**
     * تحليل الشخصيات في السيناريو
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تقرير تحليل الشخصيات
     */
    async analyzeCharacters(editor) {
        try {
            const elements = Array.from(editor.children);
            const detectedCharacters = await this.detectCharacters(elements);
            
            // تحليل كل شخصية
            for (const character of detectedCharacters) {
                await this.analyzeIndividualCharacter(character, elements);
                await this.analyzeCharacterDialogue(character, elements);
                await this.trackCharacterPresence(character, elements);
            }
            
            // تحليل العلاقات
            const relationships = await this.analyzeRelationships(detectedCharacters, elements);
            
            // تحليل قوس الشخصيات
            const characterArcs = await this.analyzeCharacterArcs(detectedCharacters, elements);
            
            return {
                success: true,
                totalCharacters: detectedCharacters.length,
                characters: detectedCharacters,
                relationships: relationships,
                characterArcs: characterArcs,
                insights: await this.generateCharacterInsights(detectedCharacters),
                recommendations: await this.generateCharacterRecommendations(detectedCharacters)
            };

        } catch (error) {
            console.error('خطأ في تحليل الشخصيات:', error);
            throw new Error(`فشل تحليل الشخصيات: ${error.message}`);
        }
    }

    /**
     * إنشاء ملف شخصية مفصل
     * @param {string} characterName - اسم الشخصية
     * @param {object} characterData - بيانات الشخصية
     * @returns {Promise<object>} ملف الشخصية
     */
    async createCharacterProfile(characterName, characterData = {}) {
        try {
            const characterId = this.generateCharacterId(characterName);
            
            const profile = {
                id: characterId,
                name: characterName,
                basicInfo: {
                    fullName: characterData.fullName || characterName,
                    age: characterData.age || null,
                    gender: characterData.gender || null,
                    occupation: characterData.occupation || null,
                    location: characterData.location || null,
                    nationality: characterData.nationality || null
                },
                
                appearance: {
                    height: characterData.height || null,
                    build: characterData.build || null,
                    hairColor: characterData.hairColor || null,
                    eyeColor: characterData.eyeColor || null,
                    distinguishingFeatures: characterData.distinguishingFeatures || [],
                    style: characterData.style || null
                },
                
                personality: {
                    traits: characterData.traits || [],
                    strengths: characterData.strengths || [],
                    weaknesses: characterData.weaknesses || [],
                    fears: characterData.fears || [],
                    desires: characterData.desires || [],
                    motivations: characterData.motivations || [],
                    flaws: characterData.flaws || []
                },
                
                background: {
                    backstory: characterData.backstory || '',
                    education: characterData.education || null,
                    family: characterData.family || {},
                    keyEvents: characterData.keyEvents || [],
                    secrets: characterData.secrets || []
                },
                
                role: {
                    importance: characterData.importance || this.characterTypes.MINOR,
                    function: characterData.function || null,
                    archetype: characterData.archetype || null,
                    characterArc: characterData.characterArc || null
                },
                
                dialogue: {
                    voiceDescription: characterData.voiceDescription || '',
                    speechPatterns: characterData.speechPatterns || [],
                    vocabulary: characterData.vocabulary || 'متوسط',
                    accent: characterData.accent || null,
                    catchphrases: characterData.catchphrases || []
                },
                
                relationships: new Map(),
                
                casting: {
                    ageRange: characterData.ageRange || null,
                    physicalRequirements: characterData.physicalRequirements || [],
                    actingRequirements: characterData.actingRequirements || [],
                    celebrityInspiration: characterData.celebrityInspiration || null
                },
                
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: '1.0.0',
                    notes: characterData.notes || '',
                    tags: characterData.tags || []
                }
            };

            this.characters.set(characterId, profile);
            
            return {
                success: true,
                characterId: characterId,
                profile: profile
            };

        } catch (error) {
            console.error('خطأ في إنشاء ملف الشخصية:', error);
            throw new Error(`فشل إنشاء ملف الشخصية: ${error.message}`);
        }
    }

    /**
     * تتبع تطور الشخصية عبر السيناريو
     * @param {string} characterId - معرف الشخصية
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تحليل تطور الشخصية
     */
    async trackCharacterDevelopment(characterId, editor) {
        try {
            const character = this.characters.get(characterId);
            if (!character) {
                throw new Error('الشخصية غير موجودة');
            }

            const elements = Array.from(editor.children);
            const characterAppearances = [];
            const developmentMilestones = [];
            
            let sceneNumber = 0;
            let currentCharacter = null;

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const className = element.className;
                const text = element.textContent.trim();

                // تتبع المشاهد
                if (className === 'scene-header-1') {
                    sceneNumber++;
                }

                // تتبع ظهور الشخصية
                if (className === 'character') {
                    const characterName = this.normalizeCharacterName(text);
                    if (characterName === character.name) {
                        currentCharacter = {
                            sceneNumber: sceneNumber,
                            elementIndex: i,
                            dialogues: []
                        };
                        characterAppearances.push(currentCharacter);
                    }
                }

                // تجميع الحوارات
                if (className === 'dialogue' && currentCharacter) {
                    currentCharacter.dialogues.push({
                        text: text,
                        elementIndex: i,
                        emotions: this.analyzeEmotionalTone(text),
                        themes: this.extractThemes(text)
                    });
                }
            }

            // تحليل التطوير
            const development = {
                totalAppearances: characterAppearances.length,
                firstAppearance: characterAppearances[0]?.sceneNumber || null,
                lastAppearance: characterAppearances[characterAppearances.length - 1]?.sceneNumber || null,
                presenceDistribution: this.calculatePresenceDistribution(characterAppearances, sceneNumber),
                
                characterGrowth: {
                    emotionalJourney: await this.analyzeEmotionalJourney(characterAppearances),
                    conflictResolution: await this.analyzeConflictResolution(characterAppearances),
                    relationshipChanges: await this.analyzeRelationshipChanges(characterId, characterAppearances),
                    goalProgression: await this.analyzeGoalProgression(characterAppearances)
                },
                
                dialogueEvolution: {
                    vocabularyChanges: this.analyzeVocabularyChanges(characterAppearances),
                    toneEvolution: this.analyzeToneEvolution(characterAppearances),
                    thematicDevelopment: this.analyzeThematicDevelopment(characterAppearances)
                },
                
                milestones: developmentMilestones
            };

            return {
                success: true,
                character: character,
                development: development,
                insights: this.generateDevelopmentInsights(development),
                suggestions: this.generateDevelopmentSuggestions(development)
            };

        } catch (error) {
            console.error('خطأ في تتبع تطور الشخصية:', error);
            throw new Error(`فشل تتبع تطور الشخصية: ${error.message}`);
        }
    }

    /**
     * تحليل صوت الشخصية وأسلوب حوارها
     * @param {string} characterId - معرف الشخصية
     * @param {Array} dialogues - حوارات الشخصية
     * @returns {Promise<object>} تحليل الصوت
     */
    async analyzeCharacterVoice(characterId, dialogues) {
        try {
            const voiceProfile = {
                vocabulary: {
                    averageWordsPerSentence: 0,
                    vocabularyLevel: 'متوسط',
                    technicalTerms: [],
                    emotionalWords: [],
                    uniqueExpressions: []
                },
                
                syntax: {
                    sentenceStructure: 'بسيط',
                    preferredTenses: [],
                    questionFrequency: 0,
                    exclamationFrequency: 0
                },
                
                personality: {
                    dominantEmotions: [],
                    communicationStyle: 'مباشر',
                    formalityLevel: 'متوسط',
                    humorUsage: 'قليل'
                },
                
                patterns: {
                    commonPhrases: [],
                    speechHabits: [],
                    responsePatterns: []
                }
            };

            let totalWords = 0;
            let totalSentences = 0;
            const wordFrequency = new Map();
            const emotionalWords = [];

            for (const dialogue of dialogues) {
                const text = dialogue.text || dialogue;
                const words = text.split(/\s+/).filter(Boolean);
                const sentences = text.split(/[.!?]+/).filter(Boolean);
                
                totalWords += words.length;
                totalSentences += sentences.length;

                // تحليل المفردات
                words.forEach(word => {
                    const cleanWord = word.toLowerCase().replace(/[^\u0600-\u06FF\w]/g, '');
                    wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
                });

                // تحليل المشاعر
                const emotions = this.analyzeEmotionalTone(text);
                emotionalWords.push(...emotions);

                // تحليل الأسئلة والتعجب
                voiceProfile.syntax.questionFrequency += (text.match(/\?/g) || []).length;
                voiceProfile.syntax.exclamationFrequency += (text.match(/!/g) || []).length;
            }

            // حساب المتوسطات
            voiceProfile.vocabulary.averageWordsPerSentence = totalWords / totalSentences || 0;

            // تحديد مستوى المفردات
            const complexWords = Array.from(wordFrequency.keys()).filter(word => word.length > 6).length;
            const vocabularyComplexity = complexWords / wordFrequency.size;
            
            if (vocabularyComplexity > 0.3) {
                voiceProfile.vocabulary.vocabularyLevel = 'متقدم';
            } else if (vocabularyComplexity > 0.15) {
                voiceProfile.vocabulary.vocabularyLevel = 'متوسط';
            } else {
                voiceProfile.vocabulary.vocabularyLevel = 'بسيط';
            }

            // الكلمات الأكثر استخداماً
            const mostUsedWords = Array.from(wordFrequency.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            voiceProfile.patterns.commonPhrases = mostUsedWords.map(([word, count]) => ({
                phrase: word,
                frequency: count,
                percentage: Math.round((count / totalWords) * 100)
            }));

            // تحليل المشاعر السائدة
            const emotionCounts = {};
            emotionalWords.forEach(emotion => {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });

            voiceProfile.personality.dominantEmotions = Object.entries(emotionCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([emotion]) => emotion);

            return {
                success: true,
                characterId: characterId,
                voiceProfile: voiceProfile,
                statistics: {
                    totalDialogues: dialogues.length,
                    totalWords: totalWords,
                    averageDialogueLength: totalWords / dialogues.length || 0,
                    vocabularyDiversity: wordFrequency.size
                }
            };

        } catch (error) {
            console.error('خطأ في تحليل صوت الشخصية:', error);
            throw new Error(`فشل تحليل صوت الشخصية: ${error.message}`);
        }
    }

    /**
     * اقتراح تطوير الشخصيات
     * @param {Array} characters - قائمة الشخصيات
     * @returns {Promise<object>} اقتراحات التطوير
     */
    async suggestCharacterDevelopment(characters) {
        try {
            const suggestions = [];

            for (const character of characters) {
                const characterSuggestions = [];

                // تحليل عمق الشخصية
                if (character.totalDialogue < 100) {
                    characterSuggestions.push({
                        type: 'dialogue_expansion',
                        priority: 'متوسط',
                        title: 'توسيع الحوار',
                        description: `الشخصية "${character.name}" لديها حوار محدود (${character.totalDialogue} كلمة)`,
                        suggestion: 'أضف المزيد من الحوارات لتطوير الشخصية وإظهار جوانبها المختلفة'
                    });
                }

                // تحليل التنوع العاطفي
                if (character.emotionalRange && character.emotionalRange.length < 3) {
                    characterSuggestions.push({
                        type: 'emotional_depth',
                        priority: 'عالي',
                        title: 'تنويع المشاعر',
                        description: `الشخصية تظهر نطاق عاطفي محدود`,
                        suggestion: 'أضف مواقف تُظهر جوانب عاطفية مختلفة من الشخصية'
                    });
                }

                // تحليل التفاعل مع الشخصيات الأخرى
                if (character.relationships && character.relationships.size < 2) {
                    characterSuggestions.push({
                        type: 'relationship_building',
                        priority: 'متوسط',
                        title: 'بناء العلاقات',
                        description: 'الشخصية لديها علاقات محدودة مع الشخصيات الأخرى',
                        suggestion: 'طور علاقات الشخصية مع شخصيات أخرى لإثراء الحبكة'
                    });
                }

                // تحليل قوس الشخصية
                if (!character.characterArc || character.characterArc.growth < 0.3) {
                    characterSuggestions.push({
                        type: 'character_arc',
                        priority: 'عالي',
                        title: 'تطوير قوس الشخصية',
                        description: 'الشخصية تفتقر إلى تطور واضح عبر السيناريو',
                        suggestion: 'أنشئ رحلة نمو واضحة للشخصية مع تحديات وتغييرات'
                    });
                }

                // تحليل التفرد
                if (character.voiceProfile && character.voiceProfile.uniqueness < 0.5) {
                    characterSuggestions.push({
                        type: 'voice_uniqueness',
                        priority: 'متوسط',
                        title: 'تميز الصوت',
                        description: 'صوت الشخصية غير مميز بما فيه الكفاية',
                        suggestion: 'أضف عبارات أو طريقة حديث مميزة للشخصية'
                    });
                }

                if (characterSuggestions.length > 0) {
                    suggestions.push({
                        character: character,
                        suggestions: characterSuggestions,
                        overallPriority: this.calculateOverallPriority(characterSuggestions)
                    });
                }
            }

            return {
                success: true,
                totalSuggestions: suggestions.reduce((sum, s) => sum + s.suggestions.length, 0),
                characterSuggestions: suggestions,
                summary: this.generateDevelopmentSummary(suggestions)
            };

        } catch (error) {
            console.error('خطأ في اقتراح التطوير:', error);
            throw new Error(`فشل اقتراح تطوير الشخصيات: ${error.message}`);
        }
    }

    // =================== Helper Methods ===================

    async detectCharacters(elements) {
        const characters = new Map();
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            if (element.className === 'character') {
                const rawName = element.textContent.trim();
                const characterName = this.normalizeCharacterName(rawName);
                
                if (!characters.has(characterName)) {
                    characters.set(characterName, {
                        name: characterName,
                        originalNames: new Set([rawName]),
                        appearances: 0,
                        firstAppearance: i,
                        lastAppearance: i,
                        totalDialogue: 0,
                        dialogueLines: 0,
                        scenes: new Set(),
                        emotionalRange: new Set(),
                        relationships: new Map(),
                        voiceProfile: null,
                        characterArc: null
                    });
                }
                
                const character = characters.get(characterName);
                character.originalNames.add(rawName);
                character.appearances++;
                character.lastAppearance = i;
            }
        }
        
        return Array.from(characters.values());
    }

    async analyzeIndividualCharacter(character, elements) {
        let currentScene = 1;
        let isCurrentCharacter = false;
        
        for (let i = character.firstAppearance; i <= character.lastAppearance; i++) {
            const element = elements[i];
            const className = element.className;
            const text = element.textContent.trim();
            
            // تتبع المشاهد
            if (className === 'scene-header-1') {
                currentScene++;
            }
            
            // تتبع الشخصية الحالية
            if (className === 'character') {
                const elementCharacterName = this.normalizeCharacterName(text);
                isCurrentCharacter = elementCharacterName === character.name;
            }
            
            // تحليل الحوار
            if (className === 'dialogue' && isCurrentCharacter) {
                character.dialogueLines++;
                character.totalDialogue += text.split(/\s+/).length;
                character.scenes.add(currentScene);
                
                // تحليل المشاعر
                const emotions = this.analyzeEmotionalTone(text);
                emotions.forEach(emotion => character.emotionalRange.add(emotion));
            }
        }
        
        // تحويل Set إلى Array
        character.emotionalRange = Array.from(character.emotionalRange);
        character.scenes = Array.from(character.scenes);
        
        return character;
    }

    async analyzeCharacterDialogue(character, elements) {
        const dialogues = [];
        let isCurrentCharacter = false;
        
        for (const element of elements) {
            const className = element.className;
            const text = element.textContent.trim();
            
            if (className === 'character') {
                const characterName = this.normalizeCharacterName(text);
                isCurrentCharacter = characterName === character.name;
            } else if (className === 'dialogue' && isCurrentCharacter) {
                dialogues.push(text);
            }
        }
        
        // تحليل صوت الشخصية
        if (dialogues.length > 0) {
            const voiceAnalysis = await this.analyzeCharacterVoice(character.name, dialogues);
            character.voiceProfile = voiceAnalysis.voiceProfile;
        }
        
        return character;
    }

    async trackCharacterPresence(character, elements) {
        const presenceMap = [];
        let sceneNumber = 0;
        let characterPresent = false;
        let sceneDialogueCount = 0;
        
        for (const element of elements) {
            const className = element.className;
            const text = element.textContent.trim();
            
            if (className === 'scene-header-1') {
                // حفظ المشهد السابق
                if (sceneNumber > 0) {
                    presenceMap.push({
                        scene: sceneNumber,
                        present: characterPresent,
                        dialogueCount: sceneDialogueCount
                    });
                }
                
                // بدء مشهد جديد
                sceneNumber++;
                characterPresent = false;
                sceneDialogueCount = 0;
            } else if (className === 'character') {
                const characterName = this.normalizeCharacterName(text);
                if (characterName === character.name) {
                    characterPresent = true;
                }
            } else if (className === 'dialogue' && characterPresent) {
                sceneDialogueCount++;
            }
        }
        
        // حفظ المشهد الأخير
        if (sceneNumber > 0) {
            presenceMap.push({
                scene: sceneNumber,
                present: characterPresent,
                dialogueCount: sceneDialogueCount
            });
        }
        
        character.presenceMap = presenceMap;
        return character;
    }

    async analyzeRelationships(characters, elements) {
        const relationships = [];
        const sceneCharacters = new Map(); // مشهد -> قائمة الشخصيات
        
        let currentScene = 1;
        let sceneCharacterList = new Set();
        
        // جمع الشخصيات في كل مشهد
        for (const element of elements) {
            const className = element.className;
            const text = element.textContent.trim();
            
            if (className === 'scene-header-1') {
                if (sceneCharacterList.size > 0) {
                    sceneCharacters.set(currentScene, Array.from(sceneCharacterList));
                }
                currentScene++;
                sceneCharacterList.clear();
            } else if (className === 'character') {
                const characterName = this.normalizeCharacterName(text);
                sceneCharacterList.add(characterName);
            }
        }
        
        // حفظ المشهد الأخير
        if (sceneCharacterList.size > 0) {
            sceneCharacters.set(currentScene, Array.from(sceneCharacterList));
        }
        
        // تحليل العلاقات بناء على التفاعل
        const interactionCount = new Map();
        
        for (const [scene, charactersInScene] of sceneCharacters.entries()) {
            // إنشاء أزواج للشخصيات في نفس المشهد
            for (let i = 0; i < charactersInScene.length; i++) {
                for (let j = i + 1; j < charactersInScene.length; j++) {
                    const char1 = charactersInScene[i];
                    const char2 = charactersInScene[j];
                    const relationshipKey = [char1, char2].sort().join('::');
                    
                    if (!interactionCount.has(relationshipKey)) {
                        interactionCount.set(relationshipKey, {
                            characters: [char1, char2],
                            scenes: [],
                            interactions: 0
                        });
                    }
                    
                    const interaction = interactionCount.get(relationshipKey);
                    interaction.scenes.push(scene);
                    interaction.interactions++;
                }
            }
        }
        
        // تصنيف العلاقات
        for (const [key, interaction] of interactionCount.entries()) {
            let relationshipType = this.relationshipTypes.NEUTRAL;
            let strength = 'ضعيف';
            
            if (interaction.interactions >= 5) {
                strength = 'قوي';
            } else if (interaction.interactions >= 3) {
                strength = 'متوسط';
            }
            
            // تحليل بسيط لنوع العلاقة بناء على السياق
            relationshipType = await this.determineRelationshipType(interaction.characters, elements);
            
            relationships.push({
                characters: interaction.characters,
                type: relationshipType,
                strength: strength,
                interactions: interaction.interactions,
                scenes: interaction.scenes,
                significance: this.calculateRelationshipSignificance(interaction)
            });
        }
        
        return relationships.sort((a, b) => b.significance - a.significance);
    }

    async analyzeCharacterArcs(characters, elements) {
        const characterArcs = [];
        
        for (const character of characters) {
            if (character.presenceMap && character.presenceMap.length > 0) {
                const arc = {
                    character: character.name,
                    beginning: this.analyzeCharacterAtStage(character, 'beginning', elements),
                    middle: this.analyzeCharacterAtStage(character, 'middle', elements),
                    end: this.analyzeCharacterAtStage(character, 'end', elements),
                    growth: 0,
                    transformation: 'قليل',
                    keyMoments: []
                };
                
                // حساب النمو
                arc.growth = this.calculateCharacterGrowth(arc);
                
                if (arc.growth > 0.7) {
                    arc.transformation = 'كبير';
                } else if (arc.growth > 0.4) {
                    arc.transformation = 'متوسط';
                } else {
                    arc.transformation = 'قليل';
                }
                
                characterArcs.push(arc);
            }
        }
        
        return characterArcs;
    }

    // =================== Analysis Helper Methods ===================

    normalizeCharacterName(name) {
        return name.replace(/[:.]/g, '').trim().toUpperCase();
    }

    analyzeEmotionalTone(text) {
        const emotionalKeywords = {
            'سعيد': ['سعيد', 'فرح', 'مبتسم', 'ضاحك', 'مبتهج'],
            'حزين': ['حزين', 'كئيب', 'باكي', 'متألم', 'محزون'],
            'غاضب': ['غاضب', 'منفعل', 'ثائر', 'محتقن', 'صارخ'],
            'خائف': ['خائف', 'مرعوب', 'قلق', 'متوتر', 'مذعور'],
            'متفائل': ['متفائل', 'أمل', 'إيجابي', 'واثق', 'مطمئن'],
            'محايد': ['يقول', 'يجيب', 'يوضح', 'يذكر', 'يشرح']
        };
        
        const detectedEmotions = [];
        const lowerText = text.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                detectedEmotions.push(emotion);
            }
        }
        
        return detectedEmotions.length > 0 ? detectedEmotions : ['محايد'];
    }

    extractThemes(text) {
        const themes = [];
        const thematicKeywords = {
            'عائلة': ['أب', 'أم', 'عائلة', 'أسرة', 'أولاد'],
            'حب': ['حب', 'عشق', 'حبيب', 'قلب', 'عاطفة'],
            'عمل': ['وظيفة', 'عمل', 'شركة', 'مكتب', 'مهنة'],
            'صداقة': ['صديق', 'صداقة', 'رفيق', 'زميل'],
            'صراع': ['صراع', 'نزاع', 'خلاف', 'مشكلة', 'أزمة']
        };
        
        const lowerText = text.toLowerCase();
        
        for (const [theme, keywords] of Object.entries(thematicKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                themes.push(theme);
            }
        }
        
        return themes;
    }

    calculatePresenceDistribution(appearances, totalScenes) {
        const distribution = {
            early: 0,
            middle: 0,
            late: 0
        };
        
        const earlyThreshold = Math.ceil(totalScenes / 3);
        const lateThreshold = Math.ceil(totalScenes * 2 / 3);
        
        for (const appearance of appearances) {
            if (appearance.sceneNumber <= earlyThreshold) {
                distribution.early++;
            } else if (appearance.sceneNumber <= lateThreshold) {
                distribution.middle++;
            } else {
                distribution.late++;
            }
        }
        
        return distribution;
    }

    async determineRelationshipType(characters, elements) {
        // تحليل بسيط لنوع العلاقة
        // في تطبيق أكثر تطوراً، يمكن تحليل السياق والحوار
        return this.relationshipTypes.NEUTRAL;
    }

    calculateRelationshipSignificance(interaction) {
        // حساب أهمية العلاقة بناء على عدد التفاعلات وتوزيعها
        let score = interaction.interactions * 10;
        
        // إضافة نقاط للتوزيع عبر المشاهد
        const sceneSpread = interaction.scenes.length;
        score += sceneSpread * 5;
        
        return score;
    }

    analyzeCharacterAtStage(character, stage, elements) {
        // تحليل الشخصية في مرحلة معينة من السيناريو
        const totalScenes = character.scenes.length;
        let targetScenes = [];
        
        switch (stage) {
            case 'beginning':
                targetScenes = character.scenes.slice(0, Math.max(1, Math.floor(totalScenes / 3)));
                break;
            case 'middle':
                const middleStart = Math.floor(totalScenes / 3);
                const middleEnd = Math.floor(totalScenes * 2 / 3);
                targetScenes = character.scenes.slice(middleStart, middleEnd);
                break;
            case 'end':
                targetScenes = character.scenes.slice(Math.floor(totalScenes * 2 / 3));
                break;
        }
        
        return {
            scenes: targetScenes,
            dominantEmotions: this.getStageEmotions(character, targetScenes),
            averageDialogueLength: this.getStageDialogueLength(character, targetScenes)
        };
    }

    calculateCharacterGrowth(arc) {
        // حساب النمو بناء على التغيير في المشاعر وطول الحوار
        const beginningEmotions = new Set(arc.beginning.dominantEmotions);
        const endEmotions = new Set(arc.end.dominantEmotions);
        
        // حساب التنوع العاطفي
        const emotionalGrowth = (endEmotions.size - beginningEmotions.size) / Math.max(beginningEmotions.size, 1);
        
        // حساب نمو الحوار
        const dialogueGrowth = arc.end.averageDialogueLength > arc.beginning.averageDialogueLength ? 0.3 : 0;
        
        return Math.max(0, Math.min(1, emotionalGrowth + dialogueGrowth));
    }

    getStageEmotions(character, scenes) {
        // في تطبيق حقيقي، سيتم تحليل المشاعر للمشاهد المحددة
        return character.emotionalRange.slice(0, 2); // محاكاة
    }

    getStageDialogueLength(character, scenes) {
        // في تطبيق حقيقي، سيتم حساب متوسط طول الحوار للمشاهد المحددة
        return character.totalDialogue / character.dialogueLines || 0; // محاكاة
    }

    generateCharacterInsights(characters) {
        const insights = {
            totalCharacters: characters.length,
            mainCharacters: characters.filter(c => c.appearances >= 5).length,
            supportingCharacters: characters.filter(c => c.appearances >= 2 && c.appearances < 5).length,
            minorCharacters: characters.filter(c => c.appearances < 2).length,
            
            dialogueDistribution: characters.map(c => ({
                name: c.name,
                percentage: Math.round((c.totalDialogue / characters.reduce((sum, char) => sum + char.totalDialogue, 0)) * 100)
            })).sort((a, b) => b.percentage - a.percentage),
            
            emotionalDiversity: {
                averageEmotionalRange: characters.reduce((sum, c) => sum + c.emotionalRange.length, 0) / characters.length,
                mostEmotionalCharacter: characters.reduce((max, c) => c.emotionalRange.length > (max?.emotionalRange?.length || 0) ? c : max, null)
            }
        };
        
        return insights;
    }

    generateCharacterRecommendations(characters) {
        const recommendations = [];
        
        // توصية عامة لعدد الشخصيات
        if (characters.length < 3) {
            recommendations.push({
                type: 'character_count',
                priority: 'عالي',
                title: 'إضافة المزيد من الشخصيات',
                description: 'السيناريو يحتاج إلى المزيد من الشخصيات لإثراء القصة'
            });
        } else if (characters.length > 15) {
            recommendations.push({
                type: 'character_count',
                priority: 'متوسط',
                title: 'تقليل عدد الشخصيات',
                description: 'عدد الشخصيات كبير قد يُربك الجمهور'
            });
        }
        
        // توصيات للتوازن
        const mainCharacters = characters.filter(c => c.appearances >= 5);
        if (mainCharacters.length < 2) {
            recommendations.push({
                type: 'character_balance',
                priority: 'عالي',
                title: 'تطوير الشخصيات الرئيسية',
                description: 'يحتاج السيناريو إلى المزيد من الشخصيات الرئيسية المتطورة'
            });
        }
        
        return recommendations;
    }

    generateDevelopmentInsights(development) {
        return {
            presenceConsistency: development.presenceDistribution,
            growthIndicators: development.characterGrowth,
            relationshipDynamics: development.characterGrowth.relationshipChanges
        };
    }

    generateDevelopmentSuggestions(development) {
        const suggestions = [];
        
        if (development.characterGrowth.emotionalJourney.variance < 0.3) {
            suggestions.push({
                type: 'emotional_development',
                priority: 'عالي',
                title: 'تنويع المشاعر',
                description: 'الشخصية تحتاج إلى رحلة عاطفية أكثر تنوعاً'
            });
        }
        
        return suggestions;
    }

    calculateOverallPriority(suggestions) {
        const priorityScores = { 'عالي': 3, 'متوسط': 2, 'منخفض': 1 };
        const totalScore = suggestions.reduce((sum, s) => sum + priorityScores[s.priority], 0);
        const avgScore = totalScore / suggestions.length;
        
        if (avgScore >= 2.5) return 'عالي';
        if (avgScore >= 1.5) return 'متوسط';
        return 'منخفض';
    }

    generateDevelopmentSummary(suggestions) {
        const totalSuggestions = suggestions.reduce((sum, s) => sum + s.suggestions.length, 0);
        const highPriority = suggestions.filter(s => s.overallPriority === 'عالي').length;
        
        return {
            totalCharactersNeedingWork: suggestions.length,
            totalSuggestions: totalSuggestions,
            highPriorityCases: highPriority,
            mostCommonIssue: this.findMostCommonIssue(suggestions)
        };
    }

    findMostCommonIssue(suggestions) {
        const issueCount = {};
        
        suggestions.forEach(s => {
            s.suggestions.forEach(suggestion => {
                issueCount[suggestion.type] = (issueCount[suggestion.type] || 0) + 1;
            });
        });
        
        let mostCommon = null;
        let maxCount = 0;
        
        for (const [issue, count] of Object.entries(issueCount)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = issue;
            }
        }
        
        return mostCommon;
    }

    generateCharacterId(name) {
        return 'char_' + name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString(36);
    }

    // =================== Public API Methods ===================

    /**
     * الحصول على قائمة جميع الشخصيات
     */
    getAllCharacters() {
        return Array.from(this.characters.values());
    }

    /**
     * الحصول على شخصية محددة
     */
    getCharacter(characterId) {
        return this.characters.get(characterId);
    }

    /**
     * تحديث ملف شخصية
     */
    updateCharacterProfile(characterId, updates) {
        const character = this.characters.get(characterId);
        if (!character) {
            throw new Error('الشخصية غير موجودة');
        }

        const updatedCharacter = { 
            ...character, 
            ...updates,
            metadata: {
                ...character.metadata,
                updatedAt: new Date().toISOString(),
                version: this.incrementVersion(character.metadata.version)
            }
        };

        this.characters.set(characterId, updatedCharacter);
        return updatedCharacter;
    }

    /**
     * حذف شخصية
     */
    deleteCharacter(characterId) {
        const deleted = this.characters.delete(characterId);
        if (deleted) {
            // حذف العلاقات المرتبطة
            this.relationships.delete(characterId);
            this.characterArcs.delete(characterId);
        }
        return deleted;
    }

    incrementVersion(currentVersion) {
        const parts = currentVersion.split('.').map(Number);
        parts[2]++; // increment patch version
        return parts.join('.');
    }
}

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharacterManager };
} else if (typeof window !== 'undefined') {
    window.CharacterManager = CharacterManager;
}