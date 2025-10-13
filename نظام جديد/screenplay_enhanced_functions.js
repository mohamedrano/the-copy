// ======================= FILE READER SERVICE =============================

const fileReaderService = {
    /**
     * استخراج النص من ملفات مختلفة مع معالجة شاملة للأخطاء
     * @param {File} file - الملف المراد قراءته
     * @returns {Promise<string>} النص المستخرج
     */
    async extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            // التحقق من صحة الملف
            if (!file) {
                reject(new Error('لم يتم تحديد ملف صحيح'));
                return;
            }

            // التحقق من حجم الملف (أقصى 50MB)
            const MAX_FILE_SIZE = 50 * 1024 * 1024;
            if (file.size > MAX_FILE_SIZE) {
                reject(new Error('حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت'));
                return;
            }

            const reader = new FileReader();
            const fileName = file.name.toLowerCase();
            const fileType = file.type.toLowerCase();

            // مهلة زمنية لتجنب التعليق
            const timeout = setTimeout(() => {
                reader.abort();
                reject(new Error('انتهت مهلة قراءة الملف'));
            }, 30000); // 30 ثانية

            reader.onload = (event) => {
                clearTimeout(timeout);
                try {
                    const result = event.target.result;
                    
                    // معالجة أنواع الملفات المختلفة
                    if (fileName.endsWith('.txt') || fileType.includes('text/plain')) {
                        // ملفات نصية عادية
                        resolve(this.cleanTextContent(result));
                    } else if (fileName.endsWith('.rtf') || fileType.includes('rtf')) {
                        // ملفات RTF
                        resolve(this.extractFromRTF(result));
                    } else if (fileName.endsWith('.docx')) {
                        // ملفات Word (تتطلب مكتبة إضافية)
                        resolve(this.extractFromDocx(result));
                    } else {
                        // محاولة قراءة كنص عادي
                        resolve(this.cleanTextContent(result));
                    }
                } catch (error) {
                    reject(new Error(`خطأ في معالجة محتوى الملف: ${error.message}`));
                }
            };

            reader.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('فشل في قراءة الملف. تأكد من أن الملف غير تالف.'));
            };

            reader.onabort = () => {
                clearTimeout(timeout);
                reject(new Error('تم إلغاء عملية قراءة الملف'));
            };

            // بدء القراءة
            if (fileName.endsWith('.docx')) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file, 'UTF-8');
            }
        });
    },

    /**
     * تنظيف النص من الأحرف غير المرغوب فيها
     * @param {string} text - النص المراد تنظيفه
     * @returns {string} النص المنظف
     */
    cleanTextContent(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            // إزالة الأحرف الخاصة غير المرغوب فيها
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
            // تطبيع أشكال الأحرف العربية
            .replace(/[ﺀﺁﺁﺄﺃﺄﺀ]/g, 'أ')
            .replace(/[ﺓﻩﻬﺔﻫﻬﻪﻬﻪ]/g, 'ه')
            .replace(/[يىﻯﻯﻱﻲﻳﻴﻳﻴ]/g, 'ي')
            // إزالة المسافات الزائدة
            .replace(/[ \t]+/g, ' ')
            // تطبيع أشكال الأسطر الجديدة
            .replace(/\r\n|\r/g, '\n')
            // إزالة المسافات في بداية ونهاية الأسطر
            .split('\n').map(line => line.trim()).join('\n')
            .trim();
    },

    /**
     * استخراج النص من ملفات RTF
     * @param {string} rtfContent - محتوى RTF
     * @returns {string} النص المستخرج
     */
    extractFromRTF(rtfContent) {
        try {
            // إزالة رموز RTF الأساسية
            let text = rtfContent
                .replace(/\\[a-z]+\d*\s?/g, ' ') // إزالة الأوامر
                .replace(/[{}]/g, '') // إزالة الأقواس
                .replace(/\\\\/g, '\\') // إصلاح الشرطات المائلة
                .replace(/\\'/g, "'") // إصلاح علامات الاقتباس
                .replace(/\s+/g, ' ') // تطبيع المسافات
                .trim();

            return this.cleanTextContent(text);
        } catch (error) {
            throw new Error(`خطأ في معالجة ملف RTF: ${error.message}`);
        }
    },

    /**
     * استخراج النص من ملفات DOCX (يتطلب مكتبة mammoth.js)
     * @param {ArrayBuffer} arrayBuffer - محتوى الملف
     * @returns {string} النص المستخرج
     */
    async extractFromDocx(arrayBuffer) {
        try {
            // في البيئة الحقيقية، يمكن استخدام مكتبة mammoth.js
            // const mammoth = await import('mammoth');
            // const result = await mammoth.extractRawText({arrayBuffer});
            // return this.cleanTextContent(result.value);
            
            throw new Error('معالجة ملفات DOCX غير مدعومة حالياً. يرجى حفظ الملف كـ TXT أولاً.');
        } catch (error) {
            throw new Error(`خطأ في معالجة ملف DOCX: ${error.message}`);
        }
    }
};

// ======================= GEMINI COORDINATOR ===============================

/**
 * منسق Gemini للتصنيف الذكي للنصوص باستخدام الوكلاء المتعددين
 */
class GeminiCoordinator {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.rateLimitDelay = 1000; // تأخير للحد من الطلبات
        this.lastRequestTime = 0;
        this.maxRetries = 3;
        
        // وكلاء التصنيف المختلفين
        this.agents = {
            structure: {
                name: 'محلل البنية',
                confidence: 0.8,
                specialty: 'تحليل بنية السيناريو والعناصر الأساسية'
            },
            dialogue: {
                name: 'محلل الحوار',
                confidence: 0.85,
                specialty: 'تمييز الحوارات والشخصيات'
            },
            action: {
                name: 'محلل الأحداث',
                confidence: 0.75,
                specialty: 'تحليل أوصاف الأحداث والحركة'
            },
            scene: {
                name: 'محلل المشاهد',
                confidence: 0.9,
                specialty: 'تحديد رؤوس المشاهد والانتقالات'
            }
        };
    }

    /**
     * تعيين مفتاح API لـ Gemini
     * @param {string} key - مفتاح API
     * @returns {boolean} نجحت العملية أم لا
     */
    setApiKey(key) {
        if (!key || typeof key !== 'string' || key.trim().length === 0) {
            console.error('مفتاح API غير صحيح');
            return false;
        }
        
        this.apiKey = key.trim();
        return true;
    }

    /**
     * تصنيف النص باستخدام وكلاء متعددين
     * @param {string} text - النص المراد تصنيفه
     * @param {object} context - السياق المحيط
     * @returns {Promise<object>} نتيجة التصنيف
     */
    async classifyWithAgents(text, context = {}) {
        try {
            // التحقق من وجود مفتاح API
            if (!this.apiKey) {
                throw new Error('لم يتم تعيين مفتاح API. يرجى استدعاء setApiKey() أولاً');
            }

            // التحقق من صحة النص
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return {
                    classification: 'action',
                    confidence: 0.1,
                    agent: 'default',
                    reason: 'نص فارغ أو غير صحيح'
                };
            }

            // تطبيق الحد من الطلبات
            await this.enforceRateLimit();

            // إعداد التصنيف المحلي كاحتياط
            const localResult = this.localClassification(text, context);

            // محاولة الحصول على تصنيف من Gemini
            try {
                const geminiResult = await this.callGeminiAPI(text, context);
                
                // دمج النتائج
                return this.combineResults(localResult, geminiResult);
            } catch (apiError) {
                console.warn('فشل في الاتصال بـ Gemini API، استخدام التصنيف المحلي:', apiError.message);
                return localResult;
            }

        } catch (error) {
            console.error('خطأ في تصنيف النص:', error);
            
            // إرجاع تصنيف افتراضي آمن
            return {
                classification: 'action',
                confidence: 0.1,
                agent: 'error-fallback',
                reason: `خطأ في التصنيف: ${error.message}`,
                error: true
            };
        }
    }

    /**
     * تطبيق الحد من الطلبات لتجنب تجاوز حدود API
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * استدعاء Gemini API للتصنيف
     * @param {string} text - النص المراد تصنيفه
     * @param {object} context - السياق
     * @returns {Promise<object>} نتيجة API
     */
    async callGeminiAPI(text, context) {
        const prompt = this.buildPrompt(text, context);
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.1, // دقة عالية
                topK: 1,
                topP: 0.8,
                maxOutputTokens: 256,
                stopSequences: []
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'ScreenplayEditor/1.0'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                
                if (!data.candidates || data.candidates.length === 0) {
                    throw new Error('لم يتم الحصول على إجابة من Gemini');
                }

                const content = data.candidates[0].content?.parts?.[0]?.text;
                if (!content) {
                    throw new Error('محتوى الإجابة فارغ');
                }

                return this.parseGeminiResponse(content);

            } catch (error) {
                lastError = error;
                console.warn(`محاولة ${attempt} فشلت:`, error.message);
                
                if (attempt < this.maxRetries) {
                    // انتظار متزايد بين المحاولات
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                }
            }
        }

        throw lastError;
    }

    /**
     * بناء نص التوجيه لـ Gemini
     * @param {string} text - النص المراد تصنيفه
     * @param {object} context - السياق
     * @returns {string} نص التوجيه
     */
    buildPrompt(text, context) {
        const previousLine = context.previousFormat || 'غير محدد';
        const nextLine = context.nextFormat || 'غير محدد';
        
        return `
أنت خبير في تحليل السيناريوهات العربية. صنف هذا السطر إلى إحدى الفئات التالية:

الفئات المتاحة:
- scene-header-1: رأس المشهد الرئيسي (مثل: مشهد 1, SCENE 1)
- scene-header-2: معلومات المشهد الثانوية (مثل: ليل, نهار)  
- scene-header-3: مكان المشهد (مثل: داخلي - منزل, خارجي - شارع)
- character: اسم الشخصية المتحدثة
- dialogue: كلام الشخصية
- parenthetical: توجيهات الأداء بين قوسين
- action: وصف الأحداث والحركة
- transition: انتقالات المشهد (مثل: قطع إلى, انتقال)
- basmala: البسملة

السياق:
- السطر السابق: ${previousLine}
- النص للتصنيف: "${text}"
- السطر التالي: ${nextLine}

أجب بتنسيق JSON فقط:
{
  "classification": "الفئة_هنا",
  "confidence": رقم_من_0_إلى_1,
  "agent": "gemini",
  "reason": "سبب_التصنيف"
}
`.trim();
    }

    /**
     * تحليل استجابة Gemini
     * @param {string} response - استجابة Gemini
     * @returns {object} نتيجة مُحللة
     */
    parseGeminiResponse(response) {
        try {
            // تنظيف الاستجابة من أي نص إضافي
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('لم يتم العثور على JSON صحيح في الاستجابة');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            // التحقق من صحة البيانات
            const validClassifications = [
                'scene-header-1', 'scene-header-2', 'scene-header-3',
                'character', 'dialogue', 'parenthetical', 'action',
                'transition', 'basmala'
            ];

            if (!validClassifications.includes(parsed.classification)) {
                throw new Error(`تصنيف غير صحيح: ${parsed.classification}`);
            }

            return {
                classification: parsed.classification,
                confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
                agent: 'gemini',
                reason: parsed.reason || 'تصنيف من Gemini AI'
            };

        } catch (error) {
            throw new Error(`خطأ في تحليل استجابة Gemini: ${error.message}`);
        }
    }

    /**
     * تصنيف محلي كاحتياط
     * @param {string} text - النص المراد تصنيفه
     * @param {object} context - السياق
     * @returns {object} نتيجة التصنيف المحلي
     */
    localClassification(text, context) {
        const trimmedText = text.trim();
        
        // قواعد التصنيف المحلي
        if (/^بسم الله الرحمن الرحيم/i.test(trimmedText)) {
            return { classification: 'basmala', confidence: 0.95, agent: 'local', reason: 'يبدأ بالبسملة' };
        }
        
        if (/^(مشهد\s*\d+|scene\s*\d+)/i.test(trimmedText)) {
            return { classification: 'scene-header-1', confidence: 0.9, agent: 'local', reason: 'يحتوي على رقم مشهد' };
        }
        
        if (/(ليل|نهار|صباح|مساء|day|night|morning|evening)/i.test(trimmedText)) {
            return { classification: 'scene-header-2', confidence: 0.8, agent: 'local', reason: 'يحتوي على وقت' };
        }
        
        if (/(داخلي|خارجي|int\.|ext\.)/i.test(trimmedText)) {
            return { classification: 'scene-header-3', confidence: 0.8, agent: 'local', reason: 'يحتوي على مكان' };
        }
        
        if (trimmedText.startsWith('(') && trimmedText.endsWith(')')) {
            return { classification: 'parenthetical', confidence: 0.9, agent: 'local', reason: 'محاط بأقواس' };
        }
        
        if (trimmedText.endsWith(':') || trimmedText.endsWith('：')) {
            return { classification: 'character', confidence: 0.85, agent: 'local', reason: 'ينتهي بنقطتين' };
        }
        
        if (/(قطع|اختفاء|تحول|cut to|fade)/i.test(trimmedText)) {
            return { classification: 'transition', confidence: 0.8, agent: 'local', reason: 'يحتوي على كلمات انتقال' };
        }
        
        // إذا كان السطر السابق شخصية، فهذا حوار
        if (context.previousFormat === 'character') {
            return { classification: 'dialogue', confidence: 0.7, agent: 'local', reason: 'يتبع اسم شخصية' };
        }
        
        // افتراضياً: حدث
        return { classification: 'action', confidence: 0.6, agent: 'local', reason: 'تصنيف افتراضي' };
    }

    /**
     * دمج نتائج التصنيف المحلي والذكي
     * @param {object} localResult - النتيجة المحلية
     * @param {object} geminiResult - نتيجة Gemini
     * @returns {object} النتيجة المدموجة
     */
    combineResults(localResult, geminiResult) {
        // إذا كانت النتائج متطابقة، ارفع الثقة
        if (localResult.classification === geminiResult.classification) {
            return {
                ...geminiResult,
                confidence: Math.min(0.98, geminiResult.confidence + 0.1),
                agent: 'combined',
                reason: `متفق عليه محلياً وعبر Gemini: ${geminiResult.reason}`
            };
        }
        
        // إذا كانت ثقة Gemini أعلى بكثير، استخدمها
        if (geminiResult.confidence > localResult.confidence + 0.2) {
            return {
                ...geminiResult,
                agent: 'gemini-preferred',
                reason: `Gemini أكثر ثقة: ${geminiResult.reason}`
            };
        }
        
        // إذا كانت ثقة المحلي أعلى، استخدمه
        if (localResult.confidence > geminiResult.confidence + 0.1) {
            return {
                ...localResult,
                agent: 'local-preferred',
                reason: `التصنيف المحلي أكثر ثقة: ${localResult.reason}`
            };
        }
        
        // في الحالات المتساوية، فضل Gemini
        return {
            ...geminiResult,
            agent: 'gemini-default',
            reason: `استخدام Gemini عند التساوي: ${geminiResult.reason}`
        };
    }

    /**
     * الحصول على إحصائيات الوكلاء
     * @returns {object} إحصائيات الوكلاء
     */
    getAgentStats() {
        return {
            totalAgents: Object.keys(this.agents).length,
            agents: this.agents,
            apiConnected: !!this.apiKey,
            lastRequestTime: this.lastRequestTime
        };
    }

    /**
     * اختبار الاتصال بـ Gemini API
     * @returns {Promise<boolean>} نجح الاختبار أم لا
     */
    async testConnection() {
        if (!this.apiKey) {
            return false;
        }

        try {
            const result = await this.classifyWithAgents('اختبار', {});
            return !result.error;
        } catch (error) {
            console.error('فشل اختبار الاتصال:', error);
            return false;
        }
    }
}

// ======================= ENHANCED TEXT PROCESSOR ========================

/**
 * معالج نصوص متقدم للسيناريوهات
 */
class TextProcessor {
    constructor() {
        this.arabicNumbers = {
            '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
            '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
        };
        
        this.englishNumbers = {
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };
    }

    /**
     * تطبيع النص العربي
     * @param {string} text - النص المراد تطبيعه
     * @returns {string} النص المطبع
     */
    normalizeArabicText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            // تطبيع الهمزات
            .replace(/[أإآا]/g, 'ا')
            .replace(/[ؤ]/g, 'و')
            .replace(/[ئ]/g, 'ي')
            .replace(/[ة]/g, 'ه')
            // تطبيع الياءات
            .replace(/[ى]/g, 'ي')
            // إزالة التشكيل
            .replace(/[ًٌٍَُِّْ]/g, '')
            // تطبيع المسافات
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * تحويل الأرقام الإنجليزية إلى عربية
     * @param {string} text - النص المحتوي على الأرقام
     * @returns {string} النص مع الأرقام العربية
     */
    convertToArabicNumbers(text) {
        return text.replace(/[0-9]/g, digit => this.arabicNumbers[digit] || digit);
    }

    /**
     * تحويل الأرقام العربية إلى إنجليزية  
     * @param {string} text - النص المحتوي على الأرقام
     * @returns {string} النص مع الأرقام الإنجليزية
     */
    convertToEnglishNumbers(text) {
        return text.replace(/[٠-٩]/g, digit => this.englishNumbers[digit] || digit);
    }

    /**
     * تنسيق أسماء الشخصيات
     * @param {string} characterName - اسم الشخصية
     * @returns {string} الاسم منسق
     */
    formatCharacterName(characterName) {
        if (!characterName) return '';
        
        return characterName
            .trim()
            .toUpperCase()
            .replace(/[:.]/g, '')
            .replace(/\s+/g, ' ');
    }

    /**
     * تنظيف النص من التنسيق الزائد
     * @param {string} text - النص المراد تنظيفه
     * @returns {string} النص منظف
     */
    cleanFormat(text) {
        return text
            .replace(/^\s*[-•▪►▸□■●◇◆]\s*/, '') // إزالة نقاط التعداد
            .replace(/^\s*\d+[\.\)]\s*/, '') // إزالة الترقيم
            .replace(/\s{2,}/g, ' ') // تقليل المسافات المتعددة
            .trim();
    }
}

// ======================= EXPORT FOR USE ==============================

// إنشاء instances جاهزة للاستخدام
const enhancedFileReader = fileReaderService;
const geminiCoordinator = new GeminiCoordinator();
const textProcessor = new TextProcessor();

// تصدير للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fileReaderService: enhancedFileReader,
        GeminiCoordinator,
        TextProcessor,
        geminiCoordinator,
        textProcessor
    };
}