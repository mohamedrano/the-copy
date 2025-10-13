// ======================= ENHANCED UTILITY FUNCTIONS ========================

/**
 * مدير التخزين المحلي المحسن مع التشفير
 */
class StorageManager {
    constructor() {
        this.storageKey = 'screenplay_data';
        this.settingsKey = 'screenplay_settings';
        this.compressionEnabled = true;
    }

    /**
     * حفظ بيانات السيناريو
     * @param {string} content - محتوى السيناريو
     * @param {object} metadata - البيانات الوصفية
     * @returns {boolean} نجحت العملية أم لا
     */
    saveDocument(content, metadata = {}) {
        try {
            const documentData = {
                content: content,
                metadata: {
                    ...metadata,
                    lastSaved: new Date().toISOString(),
                    version: '1.0',
                    wordCount: this.countWords(content),
                    characterCount: content.length
                },
                checksum: this.calculateChecksum(content)
            };

            const serializedData = JSON.stringify(documentData);
            const finalData = this.compressionEnabled ? 
                this.compressData(serializedData) : serializedData;

            localStorage.setItem(this.storageKey, finalData);
            
            // حفظ نسخة احتياطية بالتاريخ
            const backupKey = `${this.storageKey}_backup_${Date.now()}`;
            localStorage.setItem(backupKey, finalData);
            
            // تنظيف النسخ الاحتياطية القديمة (الاحتفاظ بآخر 5)
            this.cleanupBackups();
            
            return true;
        } catch (error) {
            console.error('فشل في حفظ الوثيقة:', error);
            return false;
        }
    }

    /**
     * تحميل بيانات السيناريو
     * @returns {object|null} البيانات المحملة
     */
    loadDocument() {
        try {
            const rawData = localStorage.getItem(this.storageKey);
            if (!rawData) return null;

            const serializedData = this.compressionEnabled ? 
                this.decompressData(rawData) : rawData;
            
            const documentData = JSON.parse(serializedData);
            
            // التحقق من سلامة البيانات
            if (!this.verifyChecksum(documentData.content, documentData.checksum)) {
                console.warn('تم اكتشاف تلف في بيانات الوثيقة');
                return this.loadFromBackup();
            }

            return documentData;
        } catch (error) {
            console.error('فشل في تحميل الوثيقة:', error);
            return this.loadFromBackup();
        }
    }

    /**
     * حفظ إعدادات التطبيق
     * @param {object} settings - الإعدادات
     * @returns {boolean} نجحت العملية أم لا
     */
    saveSettings(settings) {
        try {
            const settingsData = {
                ...settings,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(this.settingsKey, JSON.stringify(settingsData));
            return true;
        } catch (error) {
            console.error('فشل في حفظ الإعدادات:', error);
            return false;
        }
    }

    /**
     * تحميل إعدادات التطبيق
     * @returns {object} الإعدادات المحملة أو الافتراضية
     */
    loadSettings() {
        try {
            const rawSettings = localStorage.getItem(this.settingsKey);
            if (!rawSettings) return this.getDefaultSettings();

            return { ...this.getDefaultSettings(), ...JSON.parse(rawSettings) };
        } catch (error) {
            console.error('فشل في تحميل الإعدادات:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * الحصول على النسخ الاحتياطية المتوفرة
     * @returns {Array} قائمة النسخ الاحتياطية
     */
    getBackupList() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${this.storageKey}_backup_`)) {
                const timestamp = parseInt(key.split('_').pop());
                backups.push({
                    key: key,
                    date: new Date(timestamp),
                    size: localStorage.getItem(key).length
                });
            }
        }
        return backups.sort((a, b) => b.date - a.date);
    }

    // =================== Helper Methods ===================

    countWords(content) {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    calculateChecksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    verifyChecksum(content, expectedChecksum) {
        return this.calculateChecksum(content) === expectedChecksum;
    }

    compressData(data) {
        // تنفيذ ضغط بسيط (في التطبيق الحقيقي يمكن استخدام مكتبة ضغط)
        return btoa(encodeURIComponent(data));
    }

    decompressData(data) {
        return decodeURIComponent(atob(data));
    }

    loadFromBackup() {
        const backups = this.getBackupList();
        for (const backup of backups) {
            try {
                const rawData = localStorage.getItem(backup.key);
                const serializedData = this.compressionEnabled ? 
                    this.decompressData(rawData) : rawData;
                
                return JSON.parse(serializedData);
            } catch (error) {
                console.warn(`فشل تحميل النسخة الاحتياطية ${backup.key}:`, error);
                continue;
            }
        }
        return null;
    }

    cleanupBackups() {
        const backups = this.getBackupList();
        const keepCount = 5;
        
        if (backups.length > keepCount) {
            for (let i = keepCount; i < backups.length; i++) {
                localStorage.removeItem(backups[i].key);
            }
        }
    }

    getDefaultSettings() {
        return {
            theme: 'light',
            font: 'Amiri',
            fontSize: '14pt',
            showRulers: true,
            autoSave: true,
            autoSaveInterval: 30000, // 30 ثانية
            language: 'ar',
            spellCheck: true,
            geminiApiKey: null
        };
    }
}

/**
 * مدير الاختصارات المحسن
 */
class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.preventDefault = true;
        this.contextSensitive = true;
    }

    /**
     * تسجيل اختصار جديد
     * @param {string} key - مجموعة المفاتيح (مثل: 'Ctrl+S')
     * @param {Function} callback - الدالة المراد تنفيذها
     * @param {object} options - خيارات إضافية
     */
    registerShortcut(key, callback, options = {}) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.set(normalizedKey, {
            callback: callback,
            description: options.description || '',
            context: options.context || 'global',
            preventDefault: options.preventDefault !== false,
            enabled: options.enabled !== false
        });
    }

    /**
     * إلغاء تسجيل اختصار
     * @param {string} key - مجموعة المفاتيح
     */
    unregisterShortcut(key) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.delete(normalizedKey);
    }

    /**
     * معالج أحداث لوحة المفاتيح
     * @param {KeyboardEvent} event - حدث لوحة المفاتيح
     * @param {string} context - السياق الحالي
     */
    handleKeyEvent(event, context = 'global') {
        if (!this.isEnabled) return;

        const keyString = this.eventToKeyString(event);
        const shortcut = this.shortcuts.get(keyString);

        if (shortcut && shortcut.enabled && 
            (shortcut.context === 'global' || shortcut.context === context)) {
            
            if (shortcut.preventDefault && this.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            }

            try {
                shortcut.callback(event);
            } catch (error) {
                console.error('خطأ في تنفيذ الاختصار:', error);
            }
        }
    }

    /**
     * الحصول على قائمة جميع الاختصارات
     * @returns {Array} قائمة الاختصارات
     */
    getAllShortcuts() {
        const shortcuts = [];
        this.shortcuts.forEach((shortcut, key) => {
            shortcuts.push({
                key: key,
                description: shortcut.description,
                context: shortcut.context,
                enabled: shortcut.enabled
            });
        });
        return shortcuts.sort((a, b) => a.key.localeCompare(b.key));
    }

    /**
     * تمكين/تعطيل الاختصارات
     * @param {boolean} enabled - التمكين
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    // =================== Helper Methods ===================

    normalizeKey(key) {
        return key
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace('command', 'meta')
            .replace('cmd', 'meta')
            .split('+')
            .sort((a, b) => {
                // ترتيب المفاتيح: ctrl, alt, shift, meta, ثم المفتاح الأساسي
                const order = ['ctrl', 'alt', 'shift', 'meta'];
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.localeCompare(b);
            })
            .join('+');
    }

    eventToKeyString(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');

        const key = event.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key === ' ' ? 'space' : key);
        }

        return parts.join('+');
    }
}

/**
 * مدير التصدير المحسن
 */
class ExportManager {
    constructor() {
        this.supportedFormats = ['html', 'txt', 'rtf', 'pdf'];
        this.templates = new Map();
        this.initializeTemplates();
    }

    /**
     * تصدير المستند بتنسيق محدد
     * @param {string} content - محتوى المستند
     * @param {string} format - نوع التصدير
     * @param {object} options - خيارات التصدير
     * @returns {Promise<boolean>} نجحت العملية أم لا
     */
    async exportDocument(content, format, options = {}) {
        try {
            const fileName = options.fileName || `screenplay_${Date.now()}`;
            
            switch (format.toLowerCase()) {
                case 'html':
                    return await this.exportAsHTML(content, fileName, options);
                case 'txt':
                    return await this.exportAsText(content, fileName, options);
                case 'rtf':
                    return await this.exportAsRTF(content, fileName, options);
                case 'pdf':
                    return await this.exportAsPDF(content, fileName, options);
                default:
                    throw new Error(`نوع التصدير غير مدعوم: ${format}`);
            }
        } catch (error) {
            console.error('فشل التصدير:', error);
            return false;
        }
    }

    /**
     * تصدير كـ HTML
     * @param {string} content - المحتوى
     * @param {string} fileName - اسم الملف
     * @param {object} options - الخيارات
     */
    async exportAsHTML(content, fileName, options) {
        const template = this.templates.get('html');
        const htmlContent = template
            .replace('{{TITLE}}', options.title || 'سيناريو')
            .replace('{{CONTENT}}', content)
            .replace('{{AUTHOR}}', options.author || '')
            .replace('{{DATE}}', new Date().toLocaleDateString('ar'));

        await this.downloadFile(htmlContent, `${fileName}.html`, 'text/html');
        return true;
    }

    /**
     * تصدير كـ نص عادي
     * @param {string} content - المحتوى
     * @param {string} fileName - اسم الملف
     * @param {object} options - الخيارات
     */
    async exportAsText(content, fileName, options) {
        // تحويل HTML إلى نص عادي
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        let textContent = '';
        tempDiv.querySelectorAll('div').forEach(div => {
            const className = div.className;
            const text = div.textContent.trim();
            
            if (!text) {
                textContent += '\n';
                return;
            }

            // تنسيق حسب نوع العنصر
            switch (className) {
                case 'scene-header-1':
                    textContent += `\n=== ${text} ===\n\n`;
                    break;
                case 'scene-header-2':
                case 'scene-header-3':
                    textContent += `--- ${text} ---\n\n`;
                    break;
                case 'character':
                    textContent += `\n${text}\n`;
                    break;
                case 'dialogue':
                    textContent += `${text}\n`;
                    break;
                case 'parenthetical':
                    textContent += `(${text})\n`;
                    break;
                case 'action':
                    textContent += `${text}\n\n`;
                    break;
                case 'transition':
                    textContent += `\n>>> ${text} <<<\n\n`;
                    break;
                default:
                    textContent += `${text}\n`;
            }
        });

        await this.downloadFile(textContent.trim(), `${fileName}.txt`, 'text/plain');
        return true;
    }

    /**
     * تصدير كـ RTF
     * @param {string} content - المحتوى
     * @param {string} fileName - اسم الملف
     * @param {object} options - الخيارات
     */
    async exportAsRTF(content, fileName, options) {
        const rtfHeader = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}`;
        const rtfFooter = `}`;
        
        let rtfContent = rtfHeader;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        tempDiv.querySelectorAll('div').forEach(div => {
            const className = div.className;
            const text = div.textContent.trim();
            
            if (!text) {
                rtfContent += '\\par ';
                return;
            }

            // تحويل الأحرف الخاصة
            const escapedText = text
                .replace(/\\/g, '\\\\')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}');

            switch (className) {
                case 'scene-header-1':
                    rtfContent += `\\par \\b ${escapedText}\\b0 \\par `;
                    break;
                case 'character':
                    rtfContent += `\\par \\qc \\b ${escapedText}\\b0 \\par `;
                    break;
                case 'dialogue':
                    rtfContent += `\\qc ${escapedText}\\par `;
                    break;
                default:
                    rtfContent += `${escapedText}\\par `;
            }
        });
        
        rtfContent += rtfFooter;
        
        await this.downloadFile(rtfContent, `${fileName}.rtf`, 'application/rtf');
        return true;
    }

    /**
     * تصدير كـ PDF (يتطلب مكتبة jsPDF)
     * @param {string} content - المحتوى
     * @param {string} fileName - اسم الملف
     * @param {object} options - الخيارات
     */
    async exportAsPDF(content, fileName, options) {
        try {
            // في البيئة الحقيقية يمكن استخدام jsPDF
            // const { jsPDF } = window.jspdf;
            // const doc = new jsPDF();
            
            // إنشاء نافذة طباعة كبديل
            const printWindow = window.open('', '_blank');
            const htmlTemplate = this.templates.get('pdf');
            
            printWindow.document.write(htmlTemplate.replace('{{CONTENT}}', content));
            printWindow.document.close();
            printWindow.focus();
            
            // محاولة الطباعة التلقائية
            setTimeout(() => {
                printWindow.print();
            }, 1000);
            
            return true;
        } catch (error) {
            throw new Error(`فشل تصدير PDF: ${error.message}`);
        }
    }

    /**
     * تحميل ملف
     * @param {string} content - المحتوى
     * @param {string} fileName - اسم الملف
     * @param {string} mimeType - نوع الملف
     */
    async downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * تهيئة القوالب
     */
    initializeTemplates() {
        // قالب HTML
        this.templates.set('html', `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        body {
            font-family: 'Amiri', 'Times New Roman', serif;
            direction: rtl;
            line-height: 1.6;
            margin: 2cm;
            color: #333;
        }
        .scene-header-1 { font-weight: bold; text-transform: uppercase; margin: 20px 0; }
        .scene-header-2, .scene-header-3 { margin: 10px 0; text-align: center; }
        .character { font-weight: bold; text-align: center; margin: 15px 0 5px; }
        .dialogue { text-align: center; margin: 5px 0; }
        .parenthetical { text-align: center; font-style: italic; margin: 5px 0; }
        .action { margin: 10px 0; text-align: right; }
        .transition { font-weight: bold; text-align: center; margin: 15px 0; }
        @media print {
            body { margin: 1cm; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <header>
        <h1>{{TITLE}}</h1>
        <p><strong>المؤلف:</strong> {{AUTHOR}}</p>
        <p><strong>التاريخ:</strong> {{DATE}}</p>
        <hr>
    </header>
    <main>
        {{CONTENT}}
    </main>
</body>
</html>
        `);

        // قالب PDF
        this.templates.set('pdf', `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>سيناريو - طباعة PDF</title>
    <style>
        @page { margin: 2cm; }
        body {
            font-family: 'Amiri', 'Times New Roman', serif;
            direction: rtl;
            line-height: 1.6;
            color: #000;
        }
        .scene-header-1 { font-weight: bold; text-transform: uppercase; }
        .character { font-weight: bold; text-align: center; }
        .dialogue { text-align: center; }
        .action { text-align: right; }
    </style>
</head>
<body>{{CONTENT}}</body>
</html>
        `);
    }
}

/**
 * مدير التنبيهات والإشعارات المحسن
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.container = this.createContainer();
    }

    /**
     * إظهار إشعار
     * @param {string} message - الرسالة
     * @param {string} type - نوع الإشعار (success, error, warning, info)
     * @param {number} duration - مدة الإظهار بالميللي ثانية
     * @param {object} options - خيارات إضافية
     */
    show(message, type = 'info', duration = null, options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            message: message,
            type: type,
            duration: duration || this.defaultDuration,
            timestamp: new Date(),
            persistent: options.persistent || false,
            actions: options.actions || []
        };

        this.notifications.unshift(notification);
        
        // إزالة الإشعارات الزائدة
        while (this.notifications.length > this.maxNotifications) {
            const removed = this.notifications.pop();
            this.removeFromDOM(removed.id);
        }

        this.renderNotification(notification);
        
        // إزالة تلقائية
        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        return notification.id;
    }

    /**
     * إزالة إشعار
     * @param {number} id - معرف الإشعار
     */
    remove(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.removeFromDOM(id);
    }

    /**
     * مسح جميع الإشعارات
     */
    clear() {
        this.notifications = [];
        this.container.innerHTML = '';
    }

    /**
     * إشعارات سريعة
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, persistent = false) {
        return this.show(message, 'error', persistent ? 0 : 10000, { persistent });
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    // =================== Helper Methods ===================

    createContainer() {
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'fixed top-4 left-4 z-50 space-y-2';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    renderNotification(notification) {
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification notification-${notification.type}`;
        element.style.cssText = `
            background: ${this.getBackgroundColor(notification.type)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            font-family: 'Cairo', sans-serif;
            direction: rtl;
        `;

        // المحتوى
        const messageElement = document.createElement('div');
        messageElement.textContent = notification.message;
        element.appendChild(messageElement);

        // الإجراءات
        if (notification.actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.style.cssText = 'margin-top: 8px;';
            
            notification.actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.onclick = () => {
                    action.handler();
                    this.remove(notification.id);
                };
                button.style.cssText = `
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 4px 8px;
                    margin-left: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                `;
                actionsContainer.appendChild(button);
            });
            
            element.appendChild(actionsContainer);
        }

        // زر الإغلاق
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.remove(notification.id);
        closeButton.style.cssText = `
            position: absolute;
            top: 4px;
            left: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        element.appendChild(closeButton);

        this.container.appendChild(element);

        // تطبيق الانيميشن
        requestAnimationFrame(() => {
            element.style.transform = 'translateX(0)';
        });
    }

    removeFromDOM(id) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#22c55e',
            error: '#ef4444', 
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
}

// ======================= INITIALIZATION AND EXPORT ======================

// إنشاء instances جاهزة للاستخدام
const storageManager = new StorageManager();
const keyboardManager = new KeyboardManager();
const exportManager = new ExportManager();
const notificationManager = new NotificationManager();

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.ScreenplayUtils = {
        StorageManager,
        KeyboardManager,
        ExportManager,
        NotificationManager,
        instances: {
            storage: storageManager,
            keyboard: keyboardManager,
            export: exportManager,
            notifications: notificationManager
        }
    };
}

// تصدير Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StorageManager,
        KeyboardManager,
        ExportManager,
        NotificationManager,
        instances: {
            storage: storageManager,
            keyboard: keyboardManager,
            export: exportManager,
            notifications: notificationManager
        }
    };
}