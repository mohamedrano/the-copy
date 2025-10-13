// ======================= AI WRITING ASSISTANT SYSTEM ========================

/**
 * مساعد الكتابة بالذكاء الاصطناعي
 */
class AIWritingAssistant {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-sonnet-20240229';
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 1000;
        this.maxRetries = 3;
        
        // مولدات المحتوى
        this.contentGenerators = {
            dialogue: new DialogueGenerator(this),
            scene: new SceneGenerator(this),
            character: new CharacterGenerator(this),
            plot: new PlotGenerator(this),
            conflict: new ConflictGenerator(this)
        };
        
        // مكتبة القوالب
        this.templates = new TemplateLibrary();
        
        // إعدادات المساعد
        this.settings = {
            creativityLevel: 0.7, // 0-1
            focusGenre: 'دراما',
            culturalContext: 'عربي',
            writingStyle: 'طبيعي',
            audienceAge: 'عام',
            enableAutoSuggestions: true,
            contextWindow: 5, // عدد الأسطر للسياق
            suggestionDelay: 2000 // تأخير الاقتراحات بالميللي ثانية
        };
    }

    /**
     * تهيئة المساعد بمفتاح API
     * @param {string} apiKey - مفتاح API
     * @returns {Promise<boolean>} نجحت التهيئة أم لا
     */
    async initialize(apiKey) {
        try {
            this.apiKey = apiKey;
            
            // اختبار الاتصال
            const testResult = await this.testConnection();
            if (!testResult.success) {
                throw new Error(testResult.error);
            }
            
            // تحميل القوالب
            await this.templates.loadTemplates();
            
            return {
                success: true,
                message: 'تم تهيئة مساعد الكتابة بنجاح',
                capabilities: this.getCapabilities()
            };

        } catch (error) {
            console.error('خطأ في تهيئة المساعد:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * الحصول على اقتراحات للكتابة
     * @param {object} context - سياق الكتابة
     * @param {string} requestType - نوع الطلب
     * @param {object} options - خيارات إضافية
     * @returns {Promise<object>} الاقتراحات
     */
    async getSuggestions(context, requestType = 'general', options = {}) {
        try {
            if (!this.apiKey) {
                throw new Error('لم يتم تعيين مفتاح API');
            }

            const requestData = {
                context: context,
                requestType: requestType,
                options: { ...this.settings, ...options },
                timestamp: Date.now()
            };

            // إضافة إلى قائمة الانتظار
            return await this.queueRequest(requestData);

        } catch (error) {
            console.error('خطأ في الحصول على الاقتراحات:', error);
            throw new Error(`فشل الحصول على الاقتراحات: ${error.message}`);
        }
    }

    /**
     * تحسين النص الموجود
     * @param {string} text - النص المراد تحسينه
     * @param {string} improvementType - نوع التحسين
     * @param {object} options - خيارات التحسين
     * @returns {Promise<object>} النص المحسن
     */
    async improveText(text, improvementType = 'general', options = {}) {
        try {
            const prompt = this.buildImprovementPrompt(text, improvementType, options);
            const response = await this.callAI(prompt, {
                maxTokens: 1500,
                temperature: 0.7
            });

            const improvements = this.parseImprovementResponse(response);
            
            return {
                success: true,
                originalText: text,
                improvements: improvements,
                bestSuggestion: improvements[0] || null,
                improvementType: improvementType
            };

        } catch (error) {
            console.error('خطأ في تحسين النص:', error);
            throw new Error(`فشل تحسين النص: ${error.message}`);
        }
    }

    /**
     * توليد محتوى إبداعي جديد
     * @param {string} contentType - نوع المحتوى
     * @param {object} parameters - معاملات التوليد
     * @returns {Promise<object>} المحتوى المولد
     */
    async generateContent(contentType, parameters = {}) {
        try {
            const generator = this.contentGenerators[contentType];
            if (!generator) {
                throw new Error(`نوع المحتوى غير مدعوم: ${contentType}`);
            }

            const generatedContent = await generator.generate(parameters);
            
            return {
                success: true,
                contentType: contentType,
                content: generatedContent,
                parameters: parameters,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    model: this.model,
                    creativityLevel: this.settings.creativityLevel
                }
            };

        } catch (error) {
            console.error('خطأ في توليد المحتوى:', error);
            throw new Error(`فشل توليد المحتوى: ${error.message}`);
        }
    }

    /**
     * تحليل النص وتقديم ملاحظات
     * @param {string} text - النص المراد تحليله
     * @param {Array} analysisTypes - أنواع التحليل المطلوبة
     * @returns {Promise<object>} تحليل النص
     */
    async analyzeText(text, analysisTypes = ['style', 'pacing', 'character', 'dialogue']) {
        try {
            const analysisResults = {};

            for (const analysisType of analysisTypes) {
                const prompt = this.buildAnalysisPrompt(text, analysisType);
                const response = await this.callAI(prompt, {
                    maxTokens: 800,
                    temperature: 0.3
                });

                analysisResults[analysisType] = this.parseAnalysisResponse(response, analysisType);
            }

            return {
                success: true,
                text: text,
                analysis: analysisResults,
                overallScore: this.calculateOverallScore(analysisResults),
                recommendations: this.generateAnalysisRecommendations(analysisResults)
            };

        } catch (error) {
            console.error('خطأ في تحليل النص:', error);
            throw new Error(`فشل تحليل النص: ${error.message}`);
        }
    }

    // =================== Core AI Methods ===================

    async callAI(prompt, options = {}) {
        const requestBody = {
            model: this.model,
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || this.settings.creativityLevel,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        };

        let lastError = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                await this.enforceRateLimit();
                
                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                
                if (!data.content || data.content.length === 0) {
                    throw new Error('استجابة فارغة من المساعد الذكي');
                }

                return data.content[0].text;

            } catch (error) {
                lastError = error;
                console.warn(`محاولة ${attempt} فشلت:`, error.message);
                
                if (attempt < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                }
            }
        }

        throw lastError;
    }

    async queueRequest(requestData) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                data: requestData,
                resolve: resolve,
                reject: reject,
                timestamp: Date.now()
            });

            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            while (this.requestQueue.length > 0) {
                const request = this.requestQueue.shift();
                
                try {
                    const result = await this.handleRequest(request.data);
                    request.resolve(result);
                } catch (error) {
                    request.reject(error);
                }

                // تأخير بين الطلبات
                if (this.requestQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    async handleRequest(requestData) {
        const { context, requestType, options } = requestData;
        
        switch (requestType) {
            case 'dialogue':
                return await this.suggestDialogue(context, options);
            case 'scene':
                return await this.suggestScene(context, options);
            case 'character':
                return await this.suggestCharacter(context, options);
            case 'plot':
                return await this.suggestPlot(context, options);
            case 'continuation':
                return await this.suggestContinuation(context, options);
            default:
                return await this.suggestGeneral(context, options);
        }
    }

    // =================== Suggestion Methods ===================

    async suggestDialogue(context, options) {
        const prompt = `
أنت كاتب سيناريو محترف متخصص في الكتابة باللغة العربية.

السياق الحالي:
المشهد: ${context.currentScene || 'غير محدد'}
الشخصية الحالية: ${context.currentCharacter || 'غير محدد'}
النص السابق: "${context.previousText || ''}"
نوع المشهد: ${context.sceneType || 'عام'}

المطلوب: اقترح 3 بدائل مختلفة لحوار هذه الشخصية يناسب السياق ويطور الحبكة.

متطلبات:
- الحوار يجب أن يكون طبيعياً ومناسباً للشخصية
- يجب أن يخدم الحبكة ويطور الصراع
- تنويع في الطول والأسلوب
- استخدام لغة عربية فصحى مبسطة

أجب بتنسيق JSON:
{
  "suggestions": [
    {"dialogue": "النص المقترح", "reasoning": "سبب الاقتراح"},
    {"dialogue": "النص المقترح", "reasoning": "سبب الاقتراح"},
    {"dialogue": "النص المقترح", "reasoning": "سبب الاقتراح"}
  ]
}
        `;

        const response = await this.callAI(prompt);
        return this.parseJSONResponse(response);
    }

    async suggestScene(context, options) {
        const prompt = `
أنت مساعد كتابة سيناريو متخصص في تطوير المشاهد.

السياق:
المشهد السابق: ${context.previousScene || 'غير محدد'}
الشخصيات الموجودة: ${context.characters?.join(', ') || 'غير محدد'}
الهدف من المشهد: ${context.sceneGoal || 'تطوير الحبكة'}
النبرة المطلوبة: ${context.tone || 'متوازنة'}

اقترح 3 أفكار مختلفة للمشهد التالي:

أجب بتنسيق JSON:
{
  "suggestions": [
    {
      "sceneHeader": "رأس المشهد",
      "description": "وصف المشهد",
      "keyEvents": ["حدث 1", "حدث 2"],
      "characters": ["شخصية 1", "شخصية 2"],
      "purpose": "هدف المشهد"
    }
  ]
}
        `;

        const response = await this.callAI(prompt);
        return this.parseJSONResponse(response);
    }

    async suggestContinuation(context, options) {
        const prompt = `
أنت كاتب سيناريو خبير. تابع النص التالي بطريقة طبيعية ومنطقية:

النص الحالي:
"${context.currentText}"

السياق:
- النوع: ${context.genre || this.settings.focusGenre}
- الشخصية الحالية: ${context.currentCharacter || 'غير محدد'}
- المرحلة في القصة: ${context.storyStage || 'متوسط'}

أكمل النص بـ 2-3 جمل تطور الحبكة بشكل طبيعي.

أجب بتنسيق JSON:
{
  "continuations": [
    {"text": "النص المكمل", "reasoning": "المنطق وراء الإكمال"},
    {"text": "النص المكمل", "reasoning": "المنطق وراء الإكمال"}
  ]
}
        `;

        const response = await this.callAI(prompt);
        return this.parseJSONResponse(response);
    }

    // =================== Prompt Builders ===================

    buildImprovementPrompt(text, improvementType, options) {
        const improvementInstructions = {
            dialogue: 'حسن الحوار ليكون أكثر طبيعية وتأثيراً',
            pacing: 'حسن إيقاع النص والانتقالات',
            clarity: 'اجعل النص أكثر وضوحاً ومباشرة',
            emotion: 'أضف عمق عاطفي أكثر',
            style: 'حسن الأسلوب الأدبي والتعبيري',
            general: 'حسن النص عموماً'
        };

        return `
أنت محرر سيناريو محترف. حسن النص التالي:

"${text}"

نوع التحسين المطلوب: ${improvementInstructions[improvementType]}

قدم 3 نسخ محسنة مختلفة مع شرح التحسينات المطبقة.

أجب بتنسيق JSON:
{
  "improvements": [
    {
      "text": "النص المحسن",
      "changes": ["التغيير 1", "التغيير 2"],
      "reasoning": "سبب التحسين"
    }
  ]
}
        `;
    }

    buildAnalysisPrompt(text, analysisType) {
        const analysisInstructions = {
            style: 'حلل الأسلوب الأدبي وطريقة الكتابة',
            pacing: 'حلل إيقاع النص وسرعة الأحداث',
            character: 'حلل تطور الشخصيات وعمقها',
            dialogue: 'حلل جودة وطبيعية الحوارات',
            structure: 'حلل البنية الدرامية والتسلسل'
        };

        return `
حلل النص التالي من ناحية ${analysisInstructions[analysisType]}:

"${text}"

قدم تحليلاً مفصلاً مع نقاط القوة والضعف والاقتراحات.

أجب بتنسيق JSON:
{
  "analysis": {
    "score": نقاط_من_100,
    "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
    "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
    "suggestions": ["اقتراح 1", "اقتراح 2"],
    "summary": "ملخص التحليل"
  }
}
        `;
    }

    // =================== Response Parsers ===================

    parseJSONResponse(response) {
        try {
            // تنظيف الاستجابة من أي محتوى إضافي
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('لم يتم العثور على JSON صحيح في الاستجابة');
        } catch (error) {
            console.warn('فشل تحليل JSON:', error);
            return {
                success: false,
                error: 'فشل في تحليل استجابة المساعد الذكي',
                rawResponse: response
            };
        }
    }

    parseImprovementResponse(response) {
        const parsed = this.parseJSONResponse(response);
        return parsed.improvements || [];
    }

    parseAnalysisResponse(response, analysisType) {
        const parsed = this.parseJSONResponse(response);
        return parsed.analysis || {
            score: 50,
            strengths: [],
            weaknesses: [],
            suggestions: [],
            summary: 'لم يتم التحليل بنجاح'
        };
    }

    // =================== Helper Methods ===================

    async enforceRateLimit() {
        const now = Date.now();
        if (this.lastRequestTime) {
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.rateLimitDelay) {
                const waitTime = this.rateLimitDelay - timeSinceLastRequest;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        this.lastRequestTime = Date.now();
    }

    async testConnection() {
        try {
            const testPrompt = "مرحبا، هذا اختبار اتصال.";
            const response = await this.callAI(testPrompt, { maxTokens: 50 });
            
            return {
                success: true,
                response: response
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    getCapabilities() {
        return {
            contentGeneration: Object.keys(this.contentGenerators),
            improvementTypes: ['dialogue', 'pacing', 'clarity', 'emotion', 'style', 'general'],
            analysisTypes: ['style', 'pacing', 'character', 'dialogue', 'structure'],
            supportedLanguages: ['العربية'],
            maxContextLength: 4000,
            rateLimited: true
        };
    }

    calculateOverallScore(analysisResults) {
        const scores = Object.values(analysisResults).map(analysis => analysis.score || 50);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    generateAnalysisRecommendations(analysisResults) {
        const recommendations = [];
        
        for (const [type, analysis] of Object.entries(analysisResults)) {
            if (analysis.score < 70) {
                recommendations.push({
                    type: type,
                    priority: analysis.score < 50 ? 'عالي' : 'متوسط',
                    title: `تحسين ${type}`,
                    suggestions: analysis.suggestions || []
                });
            }
        }
        
        return recommendations;
    }

    // =================== Settings Management ===================

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // تحديث إعدادات المولدات
        Object.values(this.contentGenerators).forEach(generator => {
            if (generator.updateSettings) {
                generator.updateSettings(this.settings);
            }
        });
    }

    getSettings() {
        return { ...this.settings };
    }
}

// ======================= CONTENT GENERATORS ========================

/**
 * مولد الحوارات
 */
class DialogueGenerator {
    constructor(aiAssistant) {
        this.ai = aiAssistant;
        this.dialoguePatterns = new DialoguePatterns();
    }

    async generate(parameters) {
        const {
            character = 'شخصية',
            emotion = 'محايد',
            context = '',
            length = 'متوسط',
            style = 'طبيعي'
        } = parameters;

        const prompt = this.buildDialoguePrompt(character, emotion, context, length, style);
        const response = await this.ai.callAI(prompt);
        
        return this.parseDialogueResponse(response);
    }

    buildDialoguePrompt(character, emotion, context, length, style) {
        return `
أنت كاتب حوارات محترف. اكتب حواراً للشخصية التالية:

الشخصية: ${character}
المشاعر: ${emotion}
السياق: ${context}
الطول المطلوب: ${length}
الأسلوب: ${style}

اكتب 3 بدائل مختلفة للحوار.

أجب بتنسيق JSON:
{
  "dialogues": [
    {"text": "الحوار", "tone": "النبرة", "subtext": "المعنى الضمني"}
  ]
}
        `;
    }

    parseDialogueResponse(response) {
        const parsed = this.ai.parseJSONResponse(response);
        return parsed.dialogues || [];
    }
}

/**
 * مولد المشاهد
 */
class SceneGenerator {
    constructor(aiAssistant) {
        this.ai = aiAssistant;
    }

    async generate(parameters) {
        const {
            location = 'مكان عام',
            timeOfDay = 'نهار',
            characters = [],
            purpose = 'تطوير القصة',
            mood = 'طبيعي'
        } = parameters;

        const prompt = `
اقترح مشهداً جديداً:

المكان: ${location}
الوقت: ${timeOfDay}
الشخصيات: ${characters.join(', ')}
الهدف: ${purpose}
المزاج: ${mood}

أجب بتنسيق JSON مع تفاصيل المشهد والأحداث.
        `;

        const response = await this.ai.callAI(prompt);
        return this.ai.parseJSONResponse(response);
    }
}

/**
 * مولد الشخصيات
 */
class CharacterGenerator {
    constructor(aiAssistant) {
        this.ai = aiAssistant;
    }

    async generate(parameters) {
        const {
            role = 'شخصية داعمة',
            age = 'متوسط العمر',
            background = 'عادي',
            personality = 'متوازن'
        } = parameters;

        const prompt = `
أنشئ شخصية جديدة:

الدور: ${role}
العمر: ${age}
الخلفية: ${background}
الشخصية: ${personality}

قدم وصفاً شاملاً للشخصية مع اسم مقترح.
        `;

        const response = await this.ai.callAI(prompt);
        return this.ai.parseJSONResponse(response);
    }
}

/**
 * مولد الحبكة
 */
class PlotGenerator {
    constructor(aiAssistant) {
        this.ai = aiAssistant;
    }

    async generate(parameters) {
        const {
            genre = 'دراما',
            theme = 'إنساني',
            conflict = 'داخلي',
            resolution = 'مفتوح'
        } = parameters;

        const prompt = `
اقترح فكرة حبكة:

النوع: ${genre}
الموضوع: ${theme}
نوع الصراع: ${conflict}
نوع النهاية: ${resolution}

قدم ملخص الحبكة مع نقاط التحول الرئيسية.
        `;

        const response = await this.ai.callAI(prompt);
        return this.ai.parseJSONResponse(response);
    }
}

/**
 * مولد الصراعات
 */
class ConflictGenerator {
    constructor(aiAssistant) {
        this.ai = aiAssistant;
    }

    async generate(parameters) {
        const {
            conflictType = 'شخصي',
            intensity = 'متوسط',
            characters = [],
            context = ''
        } = parameters;

        const prompt = `
أنشئ صراعاً درامياً:

نوع الصراع: ${conflictType}
الكثافة: ${intensity}
الشخصيات المتورطة: ${characters.join(', ')}
السياق: ${context}

اقترح تطوير الصراع وطرق حله.
        `;

        const response = await this.ai.callAI(prompt);
        return this.ai.parseJSONResponse(response);
    }
}

/**
 * مكتبة القوالب
 */
class TemplateLibrary {
    constructor() {
        this.templates = new Map();
    }

    async loadTemplates() {
        // تحميل قوالب محددة مسبقاً
        this.templates.set('romantic_scene', {
            name: 'مشهد رومانسي',
            structure: ['لقاء', 'حوار', 'توتر', 'انفراج'],
            elements: ['شخصيتان', 'مكان رومانسي', 'حوار عاطفي']
        });

        this.templates.set('action_sequence', {
            name: 'مشهد أكشن',
            structure: ['تمهيد', 'تصاعد', 'ذروة', 'نتيجة'],
            elements: ['حركة سريعة', 'توتر', 'حوار قصير']
        });

        // المزيد من القوالب...
    }

    getTemplate(templateId) {
        return this.templates.get(templateId);
    }

    getAllTemplates() {
        return Array.from(this.templates.values());
    }
}

/**
 * أنماط الحوار
 */
class DialoguePatterns {
    constructor() {
        this.patterns = {
            formal: ['حضرتك', 'سيادتك', 'تفضلوا'],
            informal: ['إيه', 'ازيك', 'يلا'],
            emotional: ['للأسف', 'أحبك', 'أكرهك'],
            questions: ['هل', 'ماذا', 'لماذا', 'كيف']
        };
    }

    getPattern(patternType) {
        return this.patterns[patternType] || [];
    }

    analyzeDialogue(text) {
        const analysis = {
            formality: this.calculateFormality(text),
            emotion: this.calculateEmotion(text),
            questionCount: (text.match(/\?/g) || []).length
        };

        return analysis;
    }

    calculateFormality(text) {
        const formalWords = this.patterns.formal.filter(word => 
            text.toLowerCase().includes(word)
        ).length;
        
        return formalWords > 0 ? 'رسمي' : 'غير رسمي';
    }

    calculateEmotion(text) {
        const emotionalWords = this.patterns.emotional.filter(word =>
            text.toLowerCase().includes(word)
        ).length;

        return emotionalWords > 0 ? 'عاطفي' : 'محايد';
    }
}

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        AIWritingAssistant,
        DialogueGenerator,
        SceneGenerator,
        CharacterGenerator,
        PlotGenerator,
        ConflictGenerator,
        TemplateLibrary,
        DialoguePatterns
    };
} else if (typeof window !== 'undefined') {
    window.AIWritingAssistant = AIWritingAssistant;
    window.DialogueGenerator = DialogueGenerator;
    window.SceneGenerator = SceneGenerator;
    window.CharacterGenerator = CharacterGenerator;
    window.PlotGenerator = PlotGenerator;
    window.ConflictGenerator = ConflictGenerator;
}