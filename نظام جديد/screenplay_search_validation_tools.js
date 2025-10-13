// ======================= ADVANCED SEARCH & VALIDATION TOOLS ========================

/**
 * محرك البحث والاستبدال المتقدم للسيناريوهات
 */
class AdvancedSearchEngine {
    constructor() {
        this.searchHistory = [];
        this.searchCache = new Map();
        this.indexedContent = null;
        this.lastSearchTime = null;
        
        // إعدادات البحث
        this.searchSettings = {
            caseSensitive: false,
            wholeWords: false,
            useRegex: false,
            searchInComments: true,
            includeFormatting: false,
            contextLines: 2
        };
        
        // أنواع البحث المتقدم
        this.searchTypes = {
            SIMPLE: 'simple',
            REGEX: 'regex',
            SMART: 'smart',
            STRUCTURAL: 'structural',
            SEMANTIC: 'semantic'
        };
    }

    /**
     * البحث المتقدم في النص
     * @param {HTMLElement} editor - المحرر
     * @param {string} query - نص البحث
     * @param {object} options - خيارات البحث
     * @returns {Promise<object>} نتائج البحث
     */
    async advancedSearch(editor, query, options = {}) {
        try {
            const searchOptions = { ...this.searchSettings, ...options };
            const searchType = this.determineSearchType(query, searchOptions);
            
            // تحديث تاريخ البحث
            this.addToSearchHistory(query, searchOptions);
            
            let results = [];
            
            switch (searchType) {
                case this.searchTypes.SIMPLE:
                    results = await this.simpleSearch(editor, query, searchOptions);
                    break;
                case this.searchTypes.REGEX:
                    results = await this.regexSearch(editor, query, searchOptions);
                    break;
                case this.searchTypes.SMART:
                    results = await this.smartSearch(editor, query, searchOptions);
                    break;
                case this.searchTypes.STRUCTURAL:
                    results = await this.structuralSearch(editor, query, searchOptions);
                    break;
                case this.searchTypes.SEMANTIC:
                    results = await this.semanticSearch(editor, query, searchOptions);
                    break;
            }

            // إضافة معلومات إضافية للنتائج
            const enhancedResults = await this.enhanceSearchResults(results, query, searchOptions);
            
            // حفظ في الذاكرة المؤقتة
            this.cacheResults(query, searchOptions, enhancedResults);
            
            return {
                success: true,
                query: query,
                searchType: searchType,
                results: enhancedResults,
                totalMatches: enhancedResults.length,
                searchTime: Date.now() - this.lastSearchTime,
                suggestions: await this.generateSearchSuggestions(query, enhancedResults)
            };

        } catch (error) {
            console.error('خطأ في البحث:', error);
            throw new Error(`فشل البحث: ${error.message}`);
        }
    }

    /**
     * البحث والاستبدال المتقدم
     * @param {HTMLElement} editor - المحرر
     * @param {string} searchQuery - نص البحث
     * @param {string} replaceText - النص البديل
     * @param {object} options - خيارات الاستبدال
     * @returns {Promise<object>} نتائج الاستبدال
     */
    async findAndReplace(editor, searchQuery, replaceText, options = {}) {
        try {
            const searchResults = await this.advancedSearch(editor, searchQuery, options);
            
            if (searchResults.results.length === 0) {
                return {
                    success: true,
                    message: 'لم يتم العثور على نتائج للاستبدال',
                    replacedCount: 0
                };
            }

            let replacedCount = 0;
            const replacementLog = [];
            
            // تطبيق الاستبدال على كل نتيجة
            for (const result of searchResults.results) {
                try {
                    const success = await this.replaceResult(result, replaceText, options);
                    if (success) {
                        replacedCount++;
                        replacementLog.push({
                            elementId: result.elementId,
                            originalText: result.matchText,
                            newText: replaceText,
                            position: result.position,
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (replaceError) {
                    console.warn('فشل استبدال النتيجة:', replaceError);
                }
            }

            // تحديث المحرر
            if (replacedCount > 0) {
                this.triggerEditorUpdate(editor);
            }

            return {
                success: true,
                message: `تم استبدال ${replacedCount} من أصل ${searchResults.results.length} نتيجة`,
                originalQuery: searchQuery,
                replacementText: replaceText,
                replacedCount: replacedCount,
                totalFound: searchResults.results.length,
                replacementLog: replacementLog
            };

        } catch (error) {
            console.error('خطأ في الاستبدال:', error);
            throw new Error(`فشل الاستبدال: ${error.message}`);
        }
    }

    /**
     * البحث عن الأخطاء والمشاكل الشائعة
     * @param {HTMLElement} editor - المحرر
     * @returns {Promise<object>} تقرير الأخطاء
     */
    async findCommonIssues(editor) {
        try {
            const issues = [];
            const elements = Array.from(editor.children);

            // البحث عن المشاكل المختلفة
            const checks = [
                this.checkFormattingIssues,
                this.checkSpellingIssues,
                this.checkConsistencyIssues,
                this.checkStructuralIssues,
                this.checkCharacterIssues,
                this.checkDialogueIssues,
                this.checkProfessionalStandards
            ];

            for (const checkFunction of checks) {
                const checkResults = await checkFunction.call(this, elements);
                issues.push(...checkResults);
            }

            // تصنيف المشاكل حسب الأولوية
            const categorizedIssues = this.categorizeIssues(issues);
            
            return {
                success: true,
                totalIssues: issues.length,
                issues: categorizedIssues,
                summary: this.generateIssueSummary(categorizedIssues),
                recommendations: this.generateFixRecommendations(categorizedIssues)
            };

        } catch (error) {
            console.error('خطأ في فحص المشاكل:', error);
            throw new Error(`فشل فحص المشاكل: ${error.message}`);
        }
    }

    // =================== Search Methods ===================

    async simpleSearch(editor, query, options) {
        const results = [];
        const elements = Array.from(editor.children);
        const searchTerm = options.caseSensitive ? query : query.toLowerCase();

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = options.caseSensitive ? element.textContent : element.textContent.toLowerCase();
            
            if (options.wholeWords) {
                const wordBoundary = new RegExp(`\\b${this.escapeRegExp(searchTerm)}\\b`, 'g');
                const matches = [...text.matchAll(wordBoundary)];
                
                for (const match of matches) {
                    results.push(this.createSearchResult(element, match, i, options));
                }
            } else {
                let index = text.indexOf(searchTerm);
                while (index !== -1) {
                    const match = { 0: searchTerm, index: index };
                    results.push(this.createSearchResult(element, match, i, options));
                    index = text.indexOf(searchTerm, index + 1);
                }
            }
        }

        return results;
    }

    async regexSearch(editor, query, options) {
        const results = [];
        const elements = Array.from(editor.children);
        
        try {
            const flags = options.caseSensitive ? 'g' : 'gi';
            const regex = new RegExp(query, flags);

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const text = element.textContent;
                const matches = [...text.matchAll(regex)];

                for (const match of matches) {
                    results.push(this.createSearchResult(element, match, i, options));
                }
            }
        } catch (regexError) {
            throw new Error(`خطأ في التعبير النمطي: ${regexError.message}`);
        }

        return results;
    }

    async smartSearch(editor, query, options) {
        // البحث الذكي يجمع بين عدة تقنيات
        let results = [];
        
        // البحث العادي أولاً
        const simpleResults = await this.simpleSearch(editor, query, options);
        results.push(...simpleResults);

        // البحث في المرادفات
        const synonyms = this.getSynonyms(query);
        for (const synonym of synonyms) {
            const synonymResults = await this.simpleSearch(editor, synonym, options);
            results.push(...synonymResults.map(r => ({ ...r, matchType: 'synonym', synonym: synonym })));
        }

        // البحث الضبابي للكلمات المشابهة
        const fuzzyResults = await this.fuzzySearch(editor, query, options);
        results.push(...fuzzyResults);

        // إزالة التكرارات
        results = this.removeDuplicateResults(results);

        return results;
    }

    async structuralSearch(editor, query, options) {
        const results = [];
        const elements = Array.from(editor.children);

        // البحث بناءً على البنية (نوع العنصر)
        const structuralQueries = {
            'المشاهد': ['scene-header-1', 'scene-header-2', 'scene-header-3'],
            'الحوار': ['dialogue'],
            'الشخصيات': ['character'],
            'الأحداث': ['action'],
            'الانتقالات': ['transition'],
            'التوجيهات': ['parenthetical']
        };

        const targetClasses = structuralQueries[query] || [query];

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (targetClasses.includes(element.className)) {
                const match = { 0: element.textContent.trim(), index: 0 };
                results.push({
                    ...this.createSearchResult(element, match, i, options),
                    searchType: 'structural',
                    structuralType: element.className
                });
            }
        }

        return results;
    }

    async semanticSearch(editor, query, options) {
        // البحث الدلالي - يحتاج تطوير أكثر تعقيداً
        const results = [];
        const elements = Array.from(editor.children);
        
        // موضوعات دلالية بسيطة
        const semanticTopics = this.getSemanticTopics(query);
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = element.textContent.toLowerCase();
            
            const relevanceScore = this.calculateSemanticRelevance(text, semanticTopics);
            
            if (relevanceScore > 0.3) {
                const match = { 0: element.textContent.trim(), index: 0 };
                results.push({
                    ...this.createSearchResult(element, match, i, options),
                    searchType: 'semantic',
                    relevanceScore: relevanceScore,
                    topics: semanticTopics
                });
            }
        }

        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // =================== Issue Detection Methods ===================

    async checkFormattingIssues(elements) {
        const issues = [];

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const className = element.className;
            const text = element.textContent.trim();

            // فحص تنسيق الشخصيات
            if (className === 'character') {
                if (!text.endsWith(':') && !text.endsWith('：')) {
                    issues.push({
                        type: 'formatting',
                        subtype: 'character_missing_colon',
                        severity: 'medium',
                        elementIndex: i,
                        element: element,
                        message: 'اسم الشخصية يجب أن ينتهي بنقطتين',
                        suggestion: text + ':'
                    });
                }

                if (text !== text.toUpperCase()) {
                    issues.push({
                        type: 'formatting',
                        subtype: 'character_case',
                        severity: 'low',
                        elementIndex: i,
                        element: element,
                        message: 'اسم الشخصية يجب أن يكون بأحرف كبيرة',
                        suggestion: text.toUpperCase()
                    });
                }
            }

            // فحص الحوار الفارغ
            if (className === 'dialogue' && !text) {
                issues.push({
                    type: 'formatting',
                    subtype: 'empty_dialogue',
                    severity: 'high',
                    elementIndex: i,
                    element: element,
                    message: 'حوار فارغ',
                    suggestion: 'احذف هذا السطر أو أضف نص الحوار'
                });
            }

            // فحص رؤوس المشاهد
            if (className === 'scene-header-1' && !text.match(/مشهد\s*\d+/i)) {
                issues.push({
                    type: 'formatting',
                    subtype: 'scene_header_format',
                    severity: 'medium',
                    elementIndex: i,
                    element: element,
                    message: 'رأس المشهد لا يتبع التنسيق الصحيح',
                    suggestion: 'استخدم تنسيق "مشهد 1" أو "SCENE 1"'
                });
            }
        }

        return issues;
    }

    async checkSpellingIssues(elements) {
        const issues = [];
        const commonMisspellings = this.getCommonMisspellings();

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = element.textContent.trim();
            const words = text.split(/\s+/);

            for (const word of words) {
                const cleanWord = word.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w]/g, '');
                
                if (commonMisspellings.has(cleanWord.toLowerCase())) {
                    const correction = commonMisspellings.get(cleanWord.toLowerCase());
                    issues.push({
                        type: 'spelling',
                        subtype: 'common_misspelling',
                        severity: 'low',
                        elementIndex: i,
                        element: element,
                        word: cleanWord,
                        position: text.indexOf(word),
                        message: `كلمة محتملة الخطأ: "${cleanWord}"`,
                        suggestion: correction
                    });
                }
            }
        }

        return issues;
    }

    async checkConsistencyIssues(elements) {
        const issues = [];
        const characterNames = new Map();
        const locationNames = new Map();

        // جمع أسماء الشخصيات والأماكن
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const className = element.className;
            const text = element.textContent.trim();

            if (className === 'character') {
                const cleanName = text.replace(/[:.]/g, '').trim().toUpperCase();
                if (!characterNames.has(cleanName)) {
                    characterNames.set(cleanName, []);
                }
                characterNames.get(cleanName).push({ index: i, originalText: text });
            }

            if (className.startsWith('scene-header')) {
                const locationMatch = text.match(/(داخلي|خارجي)\s*-\s*(.+)/i);
                if (locationMatch) {
                    const location = locationMatch[2].trim();
                    if (!locationNames.has(location)) {
                        locationNames.set(location, []);
                    }
                    locationNames.get(location).push({ index: i, originalText: text });
                }
            }
        }

        // فحص التناسق في أسماء الشخصيات
        for (const [name, occurrences] of characterNames.entries()) {
            const variations = new Set(occurrences.map(o => o.originalText));
            if (variations.size > 1) {
                issues.push({
                    type: 'consistency',
                    subtype: 'character_name_variation',
                    severity: 'medium',
                    characterName: name,
                    variations: Array.from(variations),
                    occurrences: occurrences,
                    message: `تنوع في كتابة اسم الشخصية "${name}"`,
                    suggestion: `وحد كتابة الاسم في جميع المواضع`
                });
            }
        }

        return issues;
    }

    async checkStructuralIssues(elements) {
        const issues = [];
        
        // فحص التسلسل المنطقي
        for (let i = 0; i < elements.length - 1; i++) {
            const current = elements[i];
            const next = elements[i + 1];
            const currentClass = current.className;
            const nextClass = next.className;

            // شخصيتان متتاليتان
            if (currentClass === 'character' && nextClass === 'character') {
                issues.push({
                    type: 'structure',
                    subtype: 'consecutive_characters',
                    severity: 'medium',
                    elementIndex: i + 1,
                    element: next,
                    message: 'شخصيتان متتاليتان بدون حوار',
                    suggestion: 'أضف حوار للشخصية الأولى أو احذف إحدى الشخصيتين'
                });
            }

            // حوار بدون شخصية
            if (nextClass === 'dialogue' && currentClass !== 'character' && currentClass !== 'parenthetical') {
                issues.push({
                    type: 'structure',
                    subtype: 'dialogue_without_character',
                    severity: 'high',
                    elementIndex: i + 1,
                    element: next,
                    message: 'حوار بدون تحديد الشخصية المتحدثة',
                    suggestion: 'أضف اسم الشخصية قبل الحوار'
                });
            }
        }

        return issues;
    }

    async checkCharacterIssues(elements) {
        const issues = [];
        const characterStats = new Map();

        // تحليل الشخصيات
        let currentCharacter = null;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const className = element.className;
            const text = element.textContent.trim();

            if (className === 'character') {
                currentCharacter = text.replace(/[:.]/g, '').trim().toUpperCase();
                if (!characterStats.has(currentCharacter)) {
                    characterStats.set(currentCharacter, {
                        appearances: 0,
                        totalDialogue: 0,
                        avgDialogueLength: 0,
                        firstAppearance: i
                    });
                }
                characterStats.get(currentCharacter).appearances++;
            } else if (className === 'dialogue' && currentCharacter) {
                const stats = characterStats.get(currentCharacter);
                stats.totalDialogue += text.split(/\s+/).length;
                stats.avgDialogueLength = stats.totalDialogue / stats.appearances;
            }
        }

        // البحث عن مشاكل الشخصيات
        for (const [name, stats] of characterStats.entries()) {
            // شخصية بظهور واحد فقط
            if (stats.appearances === 1) {
                issues.push({
                    type: 'character',
                    subtype: 'single_appearance',
                    severity: 'low',
                    characterName: name,
                    elementIndex: stats.firstAppearance,
                    message: `الشخصية "${name}" تظهر مرة واحدة فقط`,
                    suggestion: 'فكر في تطوير دور الشخصية أو حذفها'
                });
            }

            // حوار قصير جداً
            if (stats.avgDialogueLength < 3 && stats.appearances > 2) {
                issues.push({
                    type: 'character',
                    subtype: 'short_dialogue',
                    severity: 'low',
                    characterName: name,
                    avgLength: stats.avgDialogueLength,
                    message: `حوار الشخصية "${name}" قصير جداً`,
                    suggestion: 'طور حوارات الشخصية لتصبح أكثر عمقاً'
                });
            }
        }

        return issues;
    }

    async checkDialogueIssues(elements) {
        const issues = [];

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.className === 'dialogue') {
                const text = element.textContent.trim();
                
                // حوار طويل جداً
                if (text.split(/\s+/).length > 50) {
                    issues.push({
                        type: 'dialogue',
                        subtype: 'too_long',
                        severity: 'medium',
                        elementIndex: i,
                        element: element,
                        wordCount: text.split(/\s+/).length,
                        message: 'حوار طويل جداً (أكثر من 50 كلمة)',
                        suggestion: 'فكر في تقسيم الحوار إلى عدة أجزاء'
                    });
                }

                // حوار يبدأ بحرف صغير
                if (text.match(/^[a-zأ-ي]/)) {
                    issues.push({
                        type: 'dialogue',
                        subtype: 'lowercase_start',
                        severity: 'low',
                        elementIndex: i,
                        element: element,
                        message: 'الحوار يجب أن يبدأ بحرف كبير',
                        suggestion: text.charAt(0).toUpperCase() + text.slice(1)
                    });
                }
            }
        }

        return issues;
    }

    async checkProfessionalStandards(elements) {
        const issues = [];
        const sceneCount = elements.filter(e => e.className === 'scene-header-1').length;
        const totalElements = elements.length;
        
        // عدد المشاهد قليل
        if (sceneCount < 20) {
            issues.push({
                type: 'professional',
                subtype: 'insufficient_scenes',
                severity: 'medium',
                currentCount: sceneCount,
                message: `عدد المشاهد قليل (${sceneCount})، المطلوب 20+ مشهد`,
                suggestion: 'أضف المزيد من المشاهد لتطوير القصة'
            });
        }

        // عدد المشاهد كثير جداً
        if (sceneCount > 80) {
            issues.push({
                type: 'professional',
                subtype: 'excessive_scenes',
                severity: 'low',
                currentCount: sceneCount,
                message: `عدد المشاهد كثير جداً (${sceneCount})`,
                suggestion: 'فكر في دمج بعض المشاهد المتشابهة'
            });
        }

        return issues;
    }

    // =================== Helper Methods ===================

    determineSearchType(query, options) {
        if (options.useRegex) return this.searchTypes.REGEX;
        if (options.structural) return this.searchTypes.STRUCTURAL;
        if (options.semantic) return this.searchTypes.SEMANTIC;
        if (query.length > 20 || options.includeSubstrings) return this.searchTypes.SMART;
        return this.searchTypes.SIMPLE;
    }

    createSearchResult(element, match, elementIndex, options) {
        const beforeText = element.textContent.substring(Math.max(0, match.index - 20), match.index);
        const afterText = element.textContent.substring(match.index + match[0].length, match.index + match[0].length + 20);
        
        return {
            elementId: element.getAttribute('data-line-index') || elementIndex.toString(),
            elementIndex: elementIndex,
            element: element,
            elementType: element.className,
            matchText: match[0],
            matchIndex: match.index,
            position: {
                start: match.index,
                end: match.index + match[0].length
            },
            context: {
                before: beforeText,
                after: afterText,
                full: element.textContent
            },
            metadata: {
                elementClass: element.className,
                elementLength: element.textContent.length,
                matchLength: match[0].length
            }
        };
    }

    async enhanceSearchResults(results, query, options) {
        // إضافة تسليط الضوء وترقيم
        return results.map((result, index) => ({
            ...result,
            resultId: `search_result_${index}`,
            relevanceScore: this.calculateRelevanceScore(result, query),
            highlightedText: this.highlightMatch(result.context.full, result.matchText, result.matchIndex)
        }));
    }

    calculateRelevanceScore(result, query) {
        let score = 100;
        
        // نقاط للمطابقة التامة
        if (result.matchText.toLowerCase() === query.toLowerCase()) {
            score += 50;
        }
        
        // نقاط لموقع المطابقة
        if (result.matchIndex === 0) {
            score += 20; // بداية النص
        }
        
        // نقاط لنوع العنصر
        const typeScores = {
            'character': 30,
            'dialogue': 25,
            'scene-header-1': 35,
            'action': 15
        };
        score += typeScores[result.elementType] || 0;
        
        return score;
    }

    highlightMatch(text, matchText, startIndex) {
        const before = text.substring(0, startIndex);
        const match = text.substring(startIndex, startIndex + matchText.length);
        const after = text.substring(startIndex + matchText.length);
        
        return `${before}<mark class="search-highlight">${match}</mark>${after}`;
    }

    getSynonyms(word) {
        // قاموس مبسط للمرادفات
        const synonyms = {
            'سعيد': ['مبتهج', 'فرح', 'مسرور'],
            'حزين': ['كئيب', 'محزون', 'متألم'],
            'كبير': ['ضخم', 'عظيم', 'هائل'],
            'صغير': ['ضئيل', 'صغير', 'محدود'],
            'منزل': ['بيت', 'دار', 'مسكن'],
            'سيارة': ['عربة', 'مركبة', 'سيارة']
        };
        
        return synonyms[word.toLowerCase()] || [];
    }

    async fuzzySearch(editor, query, options, threshold = 0.8) {
        const results = [];
        const elements = Array.from(editor.children);
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const words = element.textContent.split(/\s+/);
            
            for (const word of words) {
                const similarity = this.calculateStringSimilarity(query.toLowerCase(), word.toLowerCase());
                if (similarity >= threshold) {
                    const matchIndex = element.textContent.indexOf(word);
                    const match = { 0: word, index: matchIndex };
                    results.push({
                        ...this.createSearchResult(element, match, i, options),
                        matchType: 'fuzzy',
                        similarity: similarity
                    });
                }
            }
        }
        
        return results;
    }

    calculateStringSimilarity(str1, str2) {
        // خوارزمية Levenshtein distance مبسطة
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[j][i] = matrix[j - 1][i - 1];
                } else {
                    matrix[j][i] = Math.min(
                        matrix[j - 1][i - 1] + 1, // substitution
                        matrix[j][i - 1] + 1,     // insertion
                        matrix[j - 1][i] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    getSemanticTopics(query) {
        // موضوعات دلالية أساسية
        const topics = {
            'عائلة': ['أب', 'أم', 'ابن', 'ابنة', 'أخ', 'أخت', 'جد', 'جدة'],
            'عمل': ['مكتب', 'شركة', 'موظف', 'مدير', 'اجتماع', 'مشروع'],
            'مدرسة': ['طالب', 'معلم', 'امتحان', 'درس', 'فصل', 'كتاب'],
            'صحة': ['طبيب', 'مستشفى', 'دواء', 'مرض', 'علاج', 'صحة']
        };
        
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
                return keywords;
            }
        }
        
        return [query];
    }

    calculateSemanticRelevance(text, topics) {
        let relevance = 0;
        const totalWords = text.split(/\s+/).length;
        
        for (const topic of topics) {
            const topicCount = (text.match(new RegExp(topic, 'gi')) || []).length;
            relevance += topicCount / totalWords;
        }
        
        return Math.min(1, relevance);
    }

    removeDuplicateResults(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = `${result.elementIndex}_${result.matchIndex}_${result.matchText}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    async replaceResult(result, replaceText, options) {
        try {
            const element = result.element;
            const originalText = element.textContent;
            const newText = originalText.substring(0, result.position.start) + 
                           replaceText + 
                           originalText.substring(result.position.end);
            
            element.textContent = newText;
            return true;
        } catch (error) {
            console.warn('فشل استبدال النتيجة:', error);
            return false;
        }
    }

    triggerEditorUpdate(editor) {
        // إطلاق حدث تحديث المحرر
        const event = new Event('content-updated', { bubbles: true });
        editor.dispatchEvent(event);
    }

    categorizeIssues(issues) {
        const categories = {
            critical: issues.filter(i => i.severity === 'critical'),
            high: issues.filter(i => i.severity === 'high'),
            medium: issues.filter(i => i.severity === 'medium'),
            low: issues.filter(i => i.severity === 'low')
        };
        
        return categories;
    }

    generateIssueSummary(categorizedIssues) {
        const total = Object.values(categorizedIssues).reduce((sum, issues) => sum + issues.length, 0);
        
        return {
            total: total,
            critical: categorizedIssues.critical.length,
            high: categorizedIssues.high.length,
            medium: categorizedIssues.medium.length,
            low: categorizedIssues.low.length,
            mostCommonType: this.findMostCommonIssueType(categorizedIssues)
        };
    }

    findMostCommonIssueType(categorizedIssues) {
        const typeCount = {};
        Object.values(categorizedIssues).flat().forEach(issue => {
            typeCount[issue.type] = (typeCount[issue.type] || 0) + 1;
        });
        
        let mostCommon = null;
        let maxCount = 0;
        
        for (const [type, count] of Object.entries(typeCount)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = type;
            }
        }
        
        return { type: mostCommon, count: maxCount };
    }

    generateFixRecommendations(categorizedIssues) {
        const recommendations = [];
        
        // توصيات للمشاكل الحرجة
        if (categorizedIssues.critical.length > 0) {
            recommendations.push({
                priority: 'urgent',
                title: 'إصلاح المشاكل الحرجة',
                description: `يوجد ${categorizedIssues.critical.length} مشكلة حرجة تحتاج إصلاح فوري`,
                action: 'ابدأ بحل المشاكل الحرجة أولاً'
            });
        }
        
        // توصيات للتنسيق
        const formattingIssues = Object.values(categorizedIssues).flat()
            .filter(i => i.type === 'formatting').length;
        
        if (formattingIssues > 5) {
            recommendations.push({
                priority: 'high',
                title: 'تحسين التنسيق',
                description: `يوجد ${formattingIssues} مشكلة في التنسيق`,
                action: 'راجع قواعد التنسيق وطبقها على النص'
            });
        }
        
        return recommendations;
    }

    getCommonMisspellings() {
        return new Map([
            ['انت', 'أنت'],
            ['اللة', 'الله'],
            ['هاذا', 'هذا'],
            ['هاذه', 'هذه'],
            ['اللذي', 'الذي'],
            ['اللتي', 'التي'],
            ['انشاء', 'إنشاء'],
            ['ايضا', 'أيضاً'],
            ['لاكن', 'لكن'],
            ['اكثر', 'أكثر']
        ]);
    }

    addToSearchHistory(query, options) {
        this.lastSearchTime = Date.now();
        this.searchHistory.unshift({
            query: query,
            options: options,
            timestamp: new Date().toISOString()
        });
        
        // الاحتفاظ بآخر 50 بحث
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
    }

    cacheResults(query, options, results) {
        const cacheKey = `${query}_${JSON.stringify(options)}`;
        this.searchCache.set(cacheKey, {
            results: results,
            timestamp: Date.now()
        });
        
        // تنظيف الذاكرة المؤقتة
        if (this.searchCache.size > 20) {
            const oldestKey = this.searchCache.keys().next().value;
            this.searchCache.delete(oldestKey);
        }
    }

    async generateSearchSuggestions(query, results) {
        const suggestions = [];
        
        // اقتراح بحث في أنواع عناصر محددة
        if (results.length > 0) {
            const elementTypes = [...new Set(results.map(r => r.elementType))];
            for (const type of elementTypes) {
                const typeCount = results.filter(r => r.elementType === type).length;
                suggestions.push({
                    type: 'filter',
                    text: `البحث في ${this.getElementTypeName(type)} فقط`,
                    query: query,
                    filter: { elementType: type },
                    resultCount: typeCount
                });
            }
        }
        
        // اقتراح المرادفات
        const synonyms = this.getSynonyms(query);
        for (const synonym of synonyms) {
            suggestions.push({
                type: 'synonym',
                text: `البحث عن "${synonym}" بدلاً من ذلك`,
                query: synonym
            });
        }
        
        return suggestions.slice(0, 5); // أفضل 5 اقتراحات
    }

    getElementTypeName(type) {
        const typeNames = {
            'character': 'الشخصيات',
            'dialogue': 'الحوار',
            'action': 'الأحداث',
            'scene-header-1': 'رؤوس المشاهد',
            'transition': 'الانتقالات',
            'parenthetical': 'التوجيهات'
        };
        
        return typeNames[type] || type;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // الحصول على تاريخ البحث
    getSearchHistory() {
        return this.searchHistory;
    }

    // مسح تاريخ البحث
    clearSearchHistory() {
        this.searchHistory = [];
    }

    // مسح الذاكرة المؤقتة
    clearCache() {
        this.searchCache.clear();
    }
}

// ======================= SCRIPT VALIDATION SYSTEM ========================

/**
 * نظام التحقق من صحة السيناريو
 */
class ScriptValidator {
    constructor() {
        this.validationRules = new Map();
        this.customRules = [];
        this.validationCache = new Map();
        
        this.initializeDefaultRules();
    }

    /**
     * التحقق الشامل من السيناريو
     * @param {HTMLElement} editor - المحرر
     * @param {object} options - خيارات التحقق
     * @returns {Promise<object>} تقرير التحقق
     */
    async validateScript(editor, options = {}) {
        try {
            const validationResults = {
                isValid: true,
                score: 100,
                issues: [],
                warnings: [],
                suggestions: [],
                statistics: {},
                professionalCompliance: {}
            };

            // تطبيق قواعد التحقق
            const ruleResults = await this.applyValidationRules(editor, options);
            
            // دمج النتائج
            validationResults.issues.push(...ruleResults.issues);
            validationResults.warnings.push(...ruleResults.warnings);
            validationResults.suggestions.push(...ruleResults.suggestions);
            
            // حساب النقاط
            validationResults.score = this.calculateValidationScore(validationResults);
            validationResults.isValid = validationResults.score >= 70;
            
            // إحصائيات
            validationResults.statistics = await this.generateValidationStatistics(editor);
            
            // التوافق المهني
            validationResults.professionalCompliance = await this.checkProfessionalCompliance(editor);
            
            return {
                success: true,
                validation: validationResults,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('خطأ في التحقق:', error);
            throw new Error(`فشل التحقق من السيناريو: ${error.message}`);
        }
    }

    initializeDefaultRules() {
        // قواعد التنسيق الأساسية
        this.addValidationRule('format_consistency', {
            name: 'ثبات التنسيق',
            category: 'formatting',
            severity: 'medium',
            check: this.checkFormatConsistency.bind(this),
            description: 'التأكد من ثبات تنسيق العناصر المختلفة'
        });

        // قواعد البنية
        this.addValidationRule('scene_structure', {
            name: 'بنية المشاهد',
            category: 'structure',
            severity: 'high',
            check: this.checkSceneStructure.bind(this),
            description: 'التأكد من وجود بنية صحيحة للمشاهد'
        });

        // قواعد الشخصيات
        this.addValidationRule('character_consistency', {
            name: 'ثبات الشخصيات',
            category: 'characters',
            severity: 'medium',
            check: this.checkCharacterConsistency.bind(this),
            description: 'التأكد من ثبات أسماء الشخصيات'
        });

        // قواعد الحوار
        this.addValidationRule('dialogue_format', {
            name: 'تنسيق الحوار',
            category: 'dialogue',
            severity: 'low',
            check: this.checkDialogueFormat.bind(this),
            description: 'التأكد من تنسيق الحوار بشكل صحيح'
        });

        // قواعد الطول المهني
        this.addValidationRule('professional_length', {
            name: 'الطول المهني',
            category: 'professional',
            severity: 'medium',
            check: this.checkProfessionalLength.bind(this),
            description: 'التأكد من أن طول السيناريو يتوافق مع المعايير المهنية'
        });
    }

    addValidationRule(id, rule) {
        this.validationRules.set(id, rule);
    }

    async applyValidationRules(editor, options) {
        const results = {
            issues: [],
            warnings: [],
            suggestions: []
        };

        for (const [ruleId, rule] of this.validationRules.entries()) {
            if (options.skipRules && options.skipRules.includes(ruleId)) {
                continue;
            }

            try {
                const ruleResult = await rule.check(editor, options);
                
                for (const finding of ruleResult) {
                    const item = {
                        ruleId: ruleId,
                        ruleName: rule.name,
                        category: rule.category,
                        severity: rule.severity,
                        ...finding
                    };

                    if (finding.type === 'error' || rule.severity === 'high') {
                        results.issues.push(item);
                    } else if (finding.type === 'warning' || rule.severity === 'medium') {
                        results.warnings.push(item);
                    } else {
                        results.suggestions.push(item);
                    }
                }
            } catch (ruleError) {
                console.warn(`فشل في تطبيق قاعدة ${ruleId}:`, ruleError);
            }
        }

        return results;
    }

    // =================== Validation Rule Methods ===================

    async checkFormatConsistency(editor, options) {
        const findings = [];
        const elements = Array.from(editor.children);
        const formatStats = {};

        // جمع إحصائيات التنسيق
        elements.forEach(element => {
            const className = element.className;
            if (!formatStats[className]) {
                formatStats[className] = {
                    count: 0,
                    styles: new Set(),
                    lengths: []
                };
            }
            
            formatStats[className].count++;
            formatStats[className].styles.add(element.getAttribute('style') || '');
            formatStats[className].lengths.push(element.textContent.length);
        });

        // فحص الثبات
        for (const [format, stats] of Object.entries(formatStats)) {
            if (stats.styles.size > 1 && stats.count > 3) {
                findings.push({
                    type: 'warning',
                    message: `تنوع في تنسيق عناصر ${format}`,
                    details: `وُجد ${stats.styles.size} أنماط مختلفة لنفس نوع العنصر`,
                    suggestion: 'وحد تنسيق جميع العناصر من نفس النوع'
                });
            }
        }

        return findings;
    }

    async checkSceneStructure(editor, options) {
        const findings = [];
        const elements = Array.from(editor.children);
        
        let sceneCount = 0;
        let hasValidSceneStart = false;
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const className = element.className;
            
            if (className === 'scene-header-1') {
                sceneCount++;
                hasValidSceneStart = true;
                
                // فحص تنسيق رأس المشهد
                const text = element.textContent.trim();
                if (!text.match(/مشهد\s*\d+|scene\s*\d+/i)) {
                    findings.push({
                        type: 'error',
                        elementIndex: i,
                        message: 'رأس مشهد بتنسيق غير صحيح',
                        details: `النص: "${text}"`,
                        suggestion: 'استخدم تنسيق "مشهد 1" أو "SCENE 1"'
                    });
                }
            }
        }

        // فحص وجود مشاهد
        if (sceneCount === 0) {
            findings.push({
                type: 'error',
                message: 'لا يوجد مشاهد في السيناريو',
                suggestion: 'أضف رؤوس مشاهد لتنظيم السيناريو'
            });
        } else if (sceneCount < 10) {
            findings.push({
                type: 'warning',
                message: `عدد المشاهد قليل (${sceneCount})`,
                suggestion: 'فكر في إضافة المزيد من المشاهد لتطوير القصة'
            });
        }

        return findings;
    }

    async checkCharacterConsistency(editor, options) {
        const findings = [];
        const elements = Array.from(editor.children);
        const characterVariations = new Map();

        // جمع أسماء الشخصيات
        elements.forEach((element, index) => {
            if (element.className === 'character') {
                const name = element.textContent.replace(/[:.]/g, '').trim();
                const normalizedName = name.toUpperCase();
                
                if (!characterVariations.has(normalizedName)) {
                    characterVariations.set(normalizedName, new Set());
                }
                characterVariations.get(normalizedName).add({
                    original: name,
                    index: index
                });
            }
        });

        // فحص التنوع في الأسماء
        for (const [normalizedName, variations] of characterVariations.entries()) {
            const uniqueVariations = new Set(Array.from(variations).map(v => v.original));
            
            if (uniqueVariations.size > 1) {
                findings.push({
                    type: 'warning',
                    message: `تنوع في كتابة اسم الشخصية "${normalizedName}"`,
                    details: `الاختلافات: ${Array.from(uniqueVariations).join(', ')}`,
                    suggestion: 'وحد كتابة اسم الشخصية في جميع المواضع',
                    affectedElements: Array.from(variations).map(v => v.index)
                });
            }
        }

        return findings;
    }

    async checkDialogueFormat(editor, options) {
        const findings = [];
        const elements = Array.from(editor.children);

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            if (element.className === 'dialogue') {
                const text = element.textContent.trim();
                
                // حوار فارغ
                if (!text) {
                    findings.push({
                        type: 'error',
                        elementIndex: i,
                        message: 'حوار فارغ',
                        suggestion: 'أضف نص الحوار أو احذف السطر'
                    });
                }
                
                // حوار طويل جداً
                else if (text.split(/\s+/).length > 50) {
                    findings.push({
                        type: 'warning',
                        elementIndex: i,
                        message: `حوار طويل جداً (${text.split(/\s+/).length} كلمة)`,
                        suggestion: 'فكر في تقسيم الحوار أو تقصيره'
                    });
                }
                
                // حوار لا يبدأ بحرف كبير
                else if (text.match(/^[a-zأ-ي]/)) {
                    findings.push({
                        type: 'suggestion',
                        elementIndex: i,
                        message: 'الحوار لا يبدأ بحرف كبير',
                        suggestion: `تغيير إلى: "${text.charAt(0).toUpperCase() + text.slice(1)}"`
                    });
                }
            }
        }

        return findings;
    }

    async checkProfessionalLength(editor, options) {
        const findings = [];
        const elements = Array.from(editor.children);
        
        // حساب التقديرات
        const wordCount = elements.reduce((count, el) => {
            return count + el.textContent.trim().split(/\s+/).filter(Boolean).length;
        }, 0);
        
        const estimatedPages = Math.ceil(wordCount / 250); // 250 كلمة = صفحة
        const sceneCount = elements.filter(el => el.className === 'scene-header-1').length;

        // فحص الطول
        if (estimatedPages < 80) {
            findings.push({
                type: 'warning',
                message: `السيناريو قصير (${estimatedPages} صفحة)`,
                details: 'السيناريوهات المهنية عادة 90-120 صفحة',
                suggestion: 'أضف المزيد من المشاهد والحوارات'
            });
        } else if (estimatedPages > 130) {
            findings.push({
                type: 'warning',
                message: `السيناريو طويل (${estimatedPages} صفحة)`,
                details: 'قد يكون صعب التسويق للمنتجين',
                suggestion: 'فكر في تقليم بعض المشاهد أو الحوارات'
            });
        }

        return findings;
    }

    calculateValidationScore(results) {
        let score = 100;
        
        // خصم للمشاكل
        results.issues.forEach(issue => {
            switch (issue.severity) {
                case 'high': score -= 15; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        });
        
        // خصم للتحذيرات
        results.warnings.forEach(() => score -= 3);
        
        return Math.max(0, Math.min(100, score));
    }

    async generateValidationStatistics(editor) {
        const elements = Array.from(editor.children);
        
        return {
            totalElements: elements.length,
            elementBreakdown: this.getElementBreakdown(elements),
            wordCount: this.getTotalWordCount(elements),
            estimatedPages: Math.ceil(this.getTotalWordCount(elements) / 250),
            sceneCount: elements.filter(el => el.className === 'scene-header-1').length,
            characterCount: new Set(
                elements
                    .filter(el => el.className === 'character')
                    .map(el => el.textContent.replace(/[:.]/g, '').trim().toUpperCase())
            ).size
        };
    }

    getElementBreakdown(elements) {
        const breakdown = {};
        elements.forEach(element => {
            const className = element.className;
            breakdown[className] = (breakdown[className] || 0) + 1;
        });
        return breakdown;
    }

    getTotalWordCount(elements) {
        return elements.reduce((count, element) => {
            return count + element.textContent.trim().split(/\s+/).filter(Boolean).length;
        }, 0);
    }

    async checkProfessionalCompliance(editor) {
        const elements = Array.from(editor.children);
        const compliance = {
            formatStandards: this.checkFormatStandards(elements),
            industryGuidelines: this.checkIndustryGuidelines(elements),
            marketRequirements: this.checkMarketRequirements(elements)
        };

        const overallScore = (
            compliance.formatStandards.score +
            compliance.industryGuidelines.score +
            compliance.marketRequirements.score
        ) / 3;

        return {
            overallScore: Math.round(overallScore),
            breakdown: compliance,
            recommendation: this.getProfessionalRecommendation(overallScore)
        };
    }

    checkFormatStandards(elements) {
        let score = 100;
        const issues = [];

        // فحص معايير التنسيق الأساسية
        const hasScenes = elements.some(el => el.className === 'scene-header-1');
        const hasCharacters = elements.some(el => el.className === 'character');
        const hasDialogue = elements.some(el => el.className === 'dialogue');

        if (!hasScenes) {
            score -= 30;
            issues.push('لا يوجد رؤوس مشاهد');
        }

        if (!hasCharacters) {
            score -= 25;
            issues.push('لا يوجد أسماء شخصيات');
        }

        if (!hasDialogue) {
            score -= 20;
            issues.push('لا يوجد حوارات');
        }

        return {
            score: Math.max(0, score),
            issues: issues,
            passed: score >= 80
        };
    }

    checkIndustryGuidelines(elements) {
        let score = 100;
        const issues = [];

        const sceneCount = elements.filter(el => el.className === 'scene-header-1').length;
        const wordCount = this.getTotalWordCount(elements);
        const estimatedPages = Math.ceil(wordCount / 250);

        // فحص عدد المشاهد
        if (sceneCount < 20) {
            score -= 15;
            issues.push(`عدد المشاهد قليل (${sceneCount})`);
        } else if (sceneCount > 80) {
            score -= 10;
            issues.push(`عدد المشاهد كثير (${sceneCount})`);
        }

        // فحص الطول
        if (estimatedPages < 80 || estimatedPages > 130) {
            score -= 20;
            issues.push(`طول غير مناسب (${estimatedPages} صفحة)`);
        }

        return {
            score: Math.max(0, score),
            issues: issues,
            passed: score >= 70
        };
    }

    checkMarketRequirements(elements) {
        let score = 100;
        const issues = [];

        const characterCount = new Set(
            elements
                .filter(el => el.className === 'character')
                .map(el => el.textContent.replace(/[:.]/g, '').trim().toUpperCase())
        ).size;

        // فحص عدد الشخصيات
        if (characterCount < 3) {
            score -= 20;
            issues.push(`عدد الشخصيات قليل (${characterCount})`);
        } else if (characterCount > 15) {
            score -= 10;
            issues.push(`عدد الشخصيات كثير (${characterCount})`);
        }

        return {
            score: Math.max(0, score),
            issues: issues,
            passed: score >= 75
        };
    }

    getProfessionalRecommendation(score) {
        if (score >= 85) {
            return {
                level: 'ممتاز',
                message: 'السيناريو يلتزم بالمعايير المهنية بشكل ممتاز',
                action: 'جاهز للمراجعة النهائية والتقديم'
            };
        } else if (score >= 70) {
            return {
                level: 'جيد',
                message: 'السيناريو جيد مع حاجة لتحسينات بسيطة',
                action: 'راجع النقاط المذكورة وحسنها'
            };
        } else if (score >= 50) {
            return {
                level: 'مقبول',
                message: 'السيناريو يحتاج تحسينات كبيرة',
                action: 'اعمل على معالجة المشاكل الأساسية'
            };
        } else {
            return {
                level: 'غير مقبول',
                message: 'السيناريو لا يلتزم بالمعايير المهنية',
                action: 'يحتاج إعادة كتابة شاملة'
            };
        }
    }
}

// تصدير الأدوات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        AdvancedSearchEngine, 
        ScriptValidator 
    };
} else if (typeof window !== 'undefined') {
    window.AdvancedSearchEngine = AdvancedSearchEngine;
    window.ScriptValidator = ScriptValidator;
}