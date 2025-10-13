// ======================= COLLABORATION & WORKFLOW SYSTEM ========================

/**
 * نظام إدارة التعاون والمراجعات للسيناريوهات
 */
class CollaborationManager {
    constructor() {
        this.currentProject = null;
        this.collaborators = new Map();
        this.comments = new Map();
        this.revisions = [];
        this.permissions = new Map();
        this.activeSession = null;
        this.syncEnabled = false;
        
        // أنواع الأذونات
        this.permissionLevels = {
            OWNER: { read: true, write: true, admin: true, comment: true },
            EDITOR: { read: true, write: true, admin: false, comment: true },
            REVIEWER: { read: true, write: false, admin: false, comment: true },
            VIEWER: { read: true, write: false, admin: false, comment: false }
        };
    }

    /**
     * إنشاء مشروع تعاوني جديد
     * @param {string} projectName - اسم المشروع
     * @param {string} description - وصف المشروع
     * @param {object} settings - إعدادات المشروع
     * @returns {Promise<object>} معرف المشروع وبياناته
     */
    async createProject(projectName, description = '', settings = {}) {
        try {
            const projectId = this.generateProjectId();
            const currentUser = await this.getCurrentUser();
            
            const project = {
                id: projectId,
                name: projectName,
                description: description,
                owner: currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: {
                    allowComments: true,
                    allowSuggestions: true,
                    requireApproval: false,
                    lockOnEdit: false,
                    autoSave: true,
                    versionControl: true,
                    ...settings
                },
                status: 'active',
                metadata: {
                    totalScenes: 0,
                    totalCharacters: 0,
                    lastActivity: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            // تعيين المالك
            this.setPermission(projectId, currentUser.id, 'OWNER');
            
            // حفظ المشروع
            await this.saveProject(project);
            this.currentProject = project;

            return {
                success: true,
                projectId: projectId,
                project: project
            };

        } catch (error) {
            console.error('فشل إنشاء المشروع:', error);
            throw new Error(`فشل إنشاء المشروع: ${error.message}`);
        }
    }

    /**
     * دعوة متعاونين للمشروع
     * @param {string} projectId - معرف المشروع
     * @param {Array} invitations - قائمة الدعوات
     * @returns {Promise<object>} نتائج الدعوات
     */
    async inviteCollaborators(projectId, invitations) {
        try {
            const currentUser = await this.getCurrentUser();
            const hasPermission = await this.checkPermission(projectId, currentUser.id, 'admin');
            
            if (!hasPermission) {
                throw new Error('ليس لديك صلاحية لدعوة متعاونين');
            }

            const results = [];

            for (const invitation of invitations) {
                try {
                    const inviteResult = await this.sendInvitation({
                        projectId: projectId,
                        email: invitation.email,
                        name: invitation.name,
                        role: invitation.role || 'REVIEWER',
                        message: invitation.message || '',
                        invitedBy: currentUser.id,
                        invitedAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // أسبوع
                    });

                    results.push({
                        email: invitation.email,
                        status: 'sent',
                        inviteId: inviteResult.inviteId
                    });

                } catch (inviteError) {
                    results.push({
                        email: invitation.email,
                        status: 'failed',
                        error: inviteError.message
                    });
                }
            }

            // تسجيل النشاط
            await this.logActivity(projectId, currentUser.id, 'collaborators_invited', {
                count: invitations.length,
                successful: results.filter(r => r.status === 'sent').length
            });

            return {
                success: true,
                results: results,
                totalInvited: invitations.length,
                successful: results.filter(r => r.status === 'sent').length
            };

        } catch (error) {
            console.error('فشل دعوة المتعاونين:', error);
            throw new Error(`فشل دعوة المتعاونين: ${error.message}`);
        }
    }

    /**
     * إضافة تعليق على جزء من النص
     * @param {string} projectId - معرف المشروع
     * @param {string} elementId - معرف العنصر
     * @param {string} commentText - نص التعليق
     * @param {object} options - خيارات إضافية
     * @returns {Promise<object>} بيانات التعليق
     */
    async addComment(projectId, elementId, commentText, options = {}) {
        try {
            const currentUser = await this.getCurrentUser();
            const hasPermission = await this.checkPermission(projectId, currentUser.id, 'comment');
            
            if (!hasPermission) {
                throw new Error('ليس لديك صلاحية للتعليق');
            }

            const commentId = this.generateCommentId();
            const comment = {
                id: commentId,
                projectId: projectId,
                elementId: elementId,
                authorId: currentUser.id,
                authorName: currentUser.name,
                text: commentText,
                type: options.type || 'general', // general, suggestion, issue, praise
                priority: options.priority || 'normal', // low, normal, high, urgent
                status: 'open', // open, resolved, dismissed
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                replies: [],
                reactions: new Map(),
                mentions: this.extractMentions(commentText),
                attachments: options.attachments || []
            };

            // حفظ التعليق
            if (!this.comments.has(projectId)) {
                this.comments.set(projectId, new Map());
            }
            this.comments.get(projectId).set(commentId, comment);

            // إشعار المذكورين
            await this.notifyMentionedUsers(comment.mentions, comment);

            // تسجيل النشاط
            await this.logActivity(projectId, currentUser.id, 'comment_added', {
                elementId: elementId,
                commentId: commentId,
                type: comment.type
            });

            // مزامنة مع المتعاونين
            if (this.syncEnabled) {
                await this.broadcastUpdate(projectId, 'comment_added', comment);
            }

            return {
                success: true,
                comment: comment
            };

        } catch (error) {
            console.error('فشل إضافة التعليق:', error);
            throw new Error(`فشل إضافة التعليق: ${error.message}`);
        }
    }

    /**
     * إقتراح تعديل على النص
     * @param {string} projectId - معرف المشروع  
     * @param {string} elementId - معرف العنصر
     * @param {string} originalText - النص الأصلي
     * @param {string} suggestedText - النص المقترح
     * @param {string} reason - سبب التعديل
     * @returns {Promise<object>} بيانات الاقتراح
     */
    async suggestEdit(projectId, elementId, originalText, suggestedText, reason = '') {
        try {
            const currentUser = await this.getCurrentUser();
            const hasPermission = await this.checkPermission(projectId, currentUser.id, 'comment');
            
            if (!hasPermission) {
                throw new Error('ليس لديك صلاحية لاقتراح تعديلات');
            }

            const suggestionId = this.generateSuggestionId();
            const suggestion = {
                id: suggestionId,
                projectId: projectId,
                elementId: elementId,
                authorId: currentUser.id,
                authorName: currentUser.name,
                originalText: originalText,
                suggestedText: suggestedText,
                reason: reason,
                status: 'pending', // pending, accepted, rejected, modified
                createdAt: new Date().toISOString(),
                reviewedAt: null,
                reviewedBy: null,
                reviewerName: null,
                changeType: this.classifySuggestionType(originalText, suggestedText),
                impact: this.assessSuggestionImpact(originalText, suggestedText)
            };

            // حفظ الاقتراح
            await this.saveSuggestion(suggestion);

            // إشعار صاحب المشروع
            await this.notifyProjectOwner(projectId, suggestion);

            // تسجيل النشاط
            await this.logActivity(projectId, currentUser.id, 'suggestion_made', {
                elementId: elementId,
                suggestionId: suggestionId,
                changeType: suggestion.changeType
            });

            return {
                success: true,
                suggestion: suggestion
            };

        } catch (error) {
            console.error('فشل اقتراح التعديل:', error);
            throw new Error(`فشل اقتراح التعديل: ${error.message}`);
        }
    }

    /**
     * إدارة النسخ والمراجعات
     * @param {string} projectId - معرف المشروع
     * @param {string} content - محتوى النسخة
     * @param {string} message - رسالة المراجعة
     * @param {boolean} isAutoSave - هل هو حفظ تلقائي
     * @returns {Promise<object>} بيانات النسخة الجديدة
     */
    async createRevision(projectId, content, message = '', isAutoSave = false) {
        try {
            const currentUser = await this.getCurrentUser();
            const hasPermission = await this.checkPermission(projectId, currentUser.id, 'write');
            
            if (!hasPermission) {
                throw new Error('ليس لديك صلاحية للتعديل');
            }

            const revisionId = this.generateRevisionId();
            const previousRevision = await this.getLatestRevision(projectId);
            
            const revision = {
                id: revisionId,
                projectId: projectId,
                authorId: currentUser.id,
                authorName: currentUser.name,
                content: content,
                message: message || (isAutoSave ? 'حفظ تلقائي' : 'تحديث'),
                version: this.calculateNextVersion(previousRevision?.version),
                createdAt: new Date().toISOString(),
                size: content.length,
                wordCount: this.countWords(content),
                sceneCount: this.countScenes(content),
                changes: previousRevision ? await this.calculateChanges(previousRevision.content, content) : null,
                tags: [],
                isAutoSave: isAutoSave,
                parentRevisionId: previousRevision?.id || null
            };

            // حفظ المراجعة
            this.revisions.push(revision);
            await this.saveRevision(revision);

            // تحديث بيانات المشروع
            await this.updateProjectMetadata(projectId, {
                lastActivity: revision.createdAt,
                version: revision.version,
                totalScenes: revision.sceneCount,
                wordCount: revision.wordCount
            });

            // تسجيل النشاط
            if (!isAutoSave) {
                await this.logActivity(projectId, currentUser.id, 'revision_created', {
                    revisionId: revisionId,
                    version: revision.version,
                    message: message
                });
            }

            // مزامنة مع المتعاونين
            if (this.syncEnabled && !isAutoSave) {
                await this.broadcastUpdate(projectId, 'revision_created', revision);
            }

            return {
                success: true,
                revision: revision
            };

        } catch (error) {
            console.error('فشل إنشاء المراجعة:', error);
            throw new Error(`فشل إنشاء المراجعة: ${error.message}`);
        }
    }

    /**
     * مقارنة بين نسختين
     * @param {string} projectId - معرف المشروع
     * @param {string} revision1Id - معرف النسخة الأولى
     * @param {string} revision2Id - معرف النسخة الثانية
     * @returns {Promise<object>} نتائج المقارنة
     */
    async compareRevisions(projectId, revision1Id, revision2Id) {
        try {
            const revision1 = await this.getRevision(projectId, revision1Id);
            const revision2 = await this.getRevision(projectId, revision2Id);
            
            if (!revision1 || !revision2) {
                throw new Error('لم يتم العثور على النسخة المطلوبة');
            }

            const comparison = await this.calculateDetailedChanges(revision1.content, revision2.content);
            
            const summary = {
                olderRevision: revision1,
                newerRevision: revision2,
                statistics: {
                    totalChanges: comparison.changes.length,
                    additions: comparison.changes.filter(c => c.type === 'added').length,
                    deletions: comparison.changes.filter(c => c.type === 'deleted').length,
                    modifications: comparison.changes.filter(c => c.type === 'modified').length,
                    wordCountDiff: revision2.wordCount - revision1.wordCount,
                    sceneCountDiff: revision2.sceneCount - revision1.sceneCount
                },
                changes: comparison.changes,
                timeSpan: this.calculateTimeSpan(revision1.createdAt, revision2.createdAt)
            };

            return {
                success: true,
                comparison: summary
            };

        } catch (error) {
            console.error('فشل مقارنة النسخ:', error);
            throw new Error(`فشل مقارنة النسخ: ${error.message}`);
        }
    }

    /**
     * إنشاء تقرير تعاوني شامل
     * @param {string} projectId - معرف المشروع
     * @param {object} options - خيارات التقرير
     * @returns {Promise<object>} التقرير التعاوني
     */
    async generateCollaborationReport(projectId, options = {}) {
        try {
            const project = await this.getProject(projectId);
            const collaboratorsList = await this.getProjectCollaborators(projectId);
            const activityLog = await this.getActivityLog(projectId, options.timeRange);
            const commentsData = await this.getProjectComments(projectId);
            const suggestionsData = await this.getProjectSuggestions(projectId);
            const revisionsData = await this.getProjectRevisions(projectId);

            const report = {
                project: {
                    name: project.name,
                    id: project.id,
                    owner: project.owner,
                    createdAt: project.createdAt,
                    status: project.status
                },
                
                collaboration: {
                    totalCollaborators: collaboratorsList.length,
                    activeCollaborators: collaboratorsList.filter(c => c.lastActive && this.isRecentlyActive(c.lastActive)).length,
                    collaboratorBreakdown: this.analyzeCollaboratorRoles(collaboratorsList),
                    participationScore: this.calculateParticipationScore(activityLog)
                },

                activity: {
                    totalActions: activityLog.length,
                    actionsThisWeek: activityLog.filter(a => this.isWithinLastWeek(a.timestamp)).length,
                    mostActiveUser: this.findMostActiveUser(activityLog),
                    activityTimeline: this.generateActivityTimeline(activityLog),
                    peakActivityHours: this.analyzePeakActivity(activityLog)
                },

                feedback: {
                    totalComments: commentsData.length,
                    openComments: commentsData.filter(c => c.status === 'open').length,
                    resolvedComments: commentsData.filter(c => c.status === 'resolved').length,
                    commentsByType: this.groupCommentsByType(commentsData),
                    averageResponseTime: this.calculateAverageResponseTime(commentsData)
                },

                suggestions: {
                    totalSuggestions: suggestionsData.length,
                    acceptedSuggestions: suggestionsData.filter(s => s.status === 'accepted').length,
                    pendingSuggestions: suggestionsData.filter(s => s.status === 'pending').length,
                    rejectedSuggestions: suggestionsData.filter(s => s.status === 'rejected').length,
                    suggestionsByImpact: this.groupSuggestionsByImpact(suggestionsData)
                },

                revisions: {
                    totalRevisions: revisionsData.length,
                    revisionsThisWeek: revisionsData.filter(r => this.isWithinLastWeek(r.createdAt)).length,
                    averageRevisionSize: revisionsData.length > 0 ? 
                        revisionsData.reduce((sum, r) => sum + r.wordCount, 0) / revisionsData.length : 0,
                    revisionFrequency: this.calculateRevisionFrequency(revisionsData)
                },

                insights: {
                    collaborationHealth: this.assessCollaborationHealth(collaboratorsList, activityLog, commentsData),
                    productivityTrends: this.analyzeProductivityTrends(revisionsData, activityLog),
                    qualityMetrics: this.calculateQualityMetrics(commentsData, suggestionsData),
                    recommendations: this.generateCollaborationRecommendations({
                        collaborators: collaboratorsList,
                        activity: activityLog,
                        comments: commentsData,
                        suggestions: suggestionsData
                    })
                },

                generatedAt: new Date().toISOString(),
                reportPeriod: options.timeRange || 'all_time'
            };

            return {
                success: true,
                report: report
            };

        } catch (error) {
            console.error('فشل إنشاء التقرير التعاوني:', error);
            throw new Error(`فشل إنشاء التقرير التعاوني: ${error.message}`);
        }
    }

    // =================== Helper Methods ===================

    generateProjectId() {
        return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateCommentId() {
        return 'comm_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateSuggestionId() {
        return 'sugg_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateRevisionId() {
        return 'rev_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async getCurrentUser() {
        // محاكاة الحصول على المستخدم الحالي
        // في التطبيق الحقيقي، سيتم الحصول على هذه البيانات من نظام المصادقة
        return {
            id: 'user_' + Math.random().toString(36).substr(2),
            name: 'المستخدم الحالي',
            email: 'user@example.com',
            role: 'writer',
            avatar: null
        };
    }

    async checkPermission(projectId, userId, permission) {
        const userPermissions = this.permissions.get(`${projectId}_${userId}`);
        if (!userPermissions) return false;
        
        const permissionLevel = this.permissionLevels[userPermissions];
        return permissionLevel && permissionLevel[permission] === true;
    }

    setPermission(projectId, userId, level) {
        this.permissions.set(`${projectId}_${userId}`, level);
    }

    extractMentions(text) {
        const mentionPattern = /@([a-zA-Z0-9._-]+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionPattern.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        
        return mentions;
    }

    classifySuggestionType(originalText, suggestedText) {
        if (originalText.length === 0) return 'addition';
        if (suggestedText.length === 0) return 'deletion';
        if (originalText !== suggestedText) return 'modification';
        return 'no_change';
    }

    assessSuggestionImpact(originalText, suggestedText) {
        const lengthDiff = Math.abs(suggestedText.length - originalText.length);
        const wordDiff = Math.abs(
            suggestedText.split(/\s+/).length - originalText.split(/\s+/).length
        );

        if (wordDiff > 10 || lengthDiff > 100) return 'major';
        if (wordDiff > 3 || lengthDiff > 30) return 'moderate';
        return 'minor';
    }

    calculateNextVersion(currentVersion) {
        if (!currentVersion) return '1.0.0';
        
        const parts = currentVersion.split('.').map(Number);
        parts[2]++; // increment patch version
        
        return parts.join('.');
    }

    countWords(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const text = tempDiv.textContent || '';
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    countScenes(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        return tempDiv.querySelectorAll('.scene-header-1').length;
    }

    async calculateChanges(oldContent, newContent) {
        // خوارزمية بسيطة لحساب التغييرات
        const oldWords = this.extractWords(oldContent);
        const newWords = this.extractWords(newContent);
        
        return {
            added: newWords.length - oldWords.length,
            modified: Math.abs(newWords.length - oldWords.length),
            percentage: oldWords.length > 0 ? 
                Math.round(Math.abs(newWords.length - oldWords.length) / oldWords.length * 100) : 100
        };
    }

    extractWords(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const text = tempDiv.textContent || '';
        return text.trim().split(/\s+/).filter(Boolean);
    }

    async calculateDetailedChanges(content1, content2) {
        // تنفيذ مبسط لحساب الفروقات
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
        const changes = [];

        const maxLength = Math.max(lines1.length, lines2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';
            
            if (line1 !== line2) {
                if (!line1) {
                    changes.push({ type: 'added', lineNumber: i + 1, content: line2 });
                } else if (!line2) {
                    changes.push({ type: 'deleted', lineNumber: i + 1, content: line1 });
                } else {
                    changes.push({ type: 'modified', lineNumber: i + 1, oldContent: line1, newContent: line2 });
                }
            }
        }

        return { changes };
    }

    calculateTimeSpan(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end - start;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} يوم${diffDays > 1 ? '' : ''} و ${diffHours} ساعة${diffHours > 1 ? '' : ''}`;
        } else {
            return `${diffHours} ساعة${diffHours > 1 ? '' : ''}`;
        }
    }

    analyzeCollaboratorRoles(collaborators) {
        const roleCount = {};
        collaborators.forEach(collab => {
            roleCount[collab.role] = (roleCount[collab.role] || 0) + 1;
        });
        return roleCount;
    }

    calculateParticipationScore(activityLog) {
        if (activityLog.length === 0) return 0;
        
        const recentActivity = activityLog.filter(a => this.isWithinLastWeek(a.timestamp));
        const participationRate = recentActivity.length / activityLog.length;
        
        return Math.round(participationRate * 100);
    }

    findMostActiveUser(activityLog) {
        const userActivity = {};
        activityLog.forEach(activity => {
            userActivity[activity.userId] = (userActivity[activity.userId] || 0) + 1;
        });

        let mostActive = null;
        let maxActivity = 0;
        
        for (const [userId, count] of Object.entries(userActivity)) {
            if (count > maxActivity) {
                maxActivity = count;
                mostActive = userId;
            }
        }

        return { userId: mostActive, activityCount: maxActivity };
    }

    generateActivityTimeline(activityLog) {
        const timeline = {};
        activityLog.forEach(activity => {
            const date = activity.timestamp.split('T')[0];
            timeline[date] = (timeline[date] || 0) + 1;
        });
        return timeline;
    }

    analyzePeakActivity(activityLog) {
        const hourlyActivity = {};
        activityLog.forEach(activity => {
            const hour = new Date(activity.timestamp).getHours();
            hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
        });

        const sortedHours = Object.entries(hourlyActivity)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        return sortedHours.map(([hour, count]) => ({ hour: parseInt(hour), count }));
    }

    groupCommentsByType(comments) {
        const typeCount = {};
        comments.forEach(comment => {
            typeCount[comment.type] = (typeCount[comment.type] || 0) + 1;
        });
        return typeCount;
    }

    calculateAverageResponseTime(comments) {
        const repliedComments = comments.filter(c => c.replies && c.replies.length > 0);
        if (repliedComments.length === 0) return null;

        let totalResponseTime = 0;
        repliedComments.forEach(comment => {
            const commentTime = new Date(comment.createdAt);
            const firstReplyTime = new Date(comment.replies[0].createdAt);
            totalResponseTime += firstReplyTime - commentTime;
        });

        const avgMs = totalResponseTime / repliedComments.length;
        const avgHours = Math.round(avgMs / (1000 * 60 * 60));
        
        return `${avgHours} ساعة`;
    }

    groupSuggestionsByImpact(suggestions) {
        const impactCount = {};
        suggestions.forEach(suggestion => {
            impactCount[suggestion.impact] = (impactCount[suggestion.impact] || 0) + 1;
        });
        return impactCount;
    }

    calculateRevisionFrequency(revisions) {
        if (revisions.length < 2) return 'غير محدد';

        const timeDiffs = [];
        for (let i = 1; i < revisions.length; i++) {
            const prev = new Date(revisions[i - 1].createdAt);
            const curr = new Date(revisions[i].createdAt);
            timeDiffs.push(curr - prev);
        }

        const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        const avgDays = Math.round(avgDiff / (1000 * 60 * 60 * 24));

        if (avgDays < 1) return 'يومياً';
        if (avgDays < 7) return 'أسبوعياً';
        if (avgDays < 30) return 'شهرياً';
        return 'نادراً';
    }

    assessCollaborationHealth(collaborators, activity, comments) {
        let score = 50; // نقطة البداية

        // نشاط المتعاونين
        const activeCollaborators = collaborators.filter(c => 
            c.lastActive && this.isRecentlyActive(c.lastActive)
        ).length;
        score += (activeCollaborators / collaborators.length) * 25;

        // تفاعل التعليقات
        const openComments = comments.filter(c => c.status === 'open').length;
        const totalComments = comments.length;
        if (totalComments > 0) {
            const resolutionRate = (totalComments - openComments) / totalComments;
            score += resolutionRate * 25;
        }

        return Math.min(100, Math.round(score));
    }

    analyzeProductivityTrends(revisions, activity) {
        const last30Days = revisions.filter(r => 
            this.isWithinLastDays(r.createdAt, 30)
        ).length;
        
        const previous30Days = revisions.filter(r => 
            this.isWithinDateRange(r.createdAt, 60, 30)
        ).length;

        const trend = previous30Days > 0 ? 
            ((last30Days - previous30Days) / previous30Days) * 100 : 0;

        return {
            current: last30Days,
            previous: previous30Days,
            trend: Math.round(trend),
            direction: trend > 0 ? 'تصاعدي' : trend < 0 ? 'تنازلي' : 'ثابت'
        };
    }

    calculateQualityMetrics(comments, suggestions) {
        const qualityIndicators = {
            feedbackEngagement: comments.length > 0 ? 
                (comments.filter(c => c.replies.length > 0).length / comments.length) * 100 : 0,
            suggestionAcceptanceRate: suggestions.length > 0 ? 
                (suggestions.filter(s => s.status === 'accepted').length / suggestions.length) * 100 : 0,
            averageFeedbackDepth: comments.length > 0 ?
                comments.reduce((sum, c) => sum + c.text.split(' ').length, 0) / comments.length : 0
        };

        return qualityIndicators;
    }

    generateCollaborationRecommendations(data) {
        const recommendations = [];

        // توصيات بناء على النشاط
        if (data.activity.length < 10) {
            recommendations.push({
                type: 'activity',
                priority: 'متوسط',
                title: 'زيادة النشاط التعاوني',
                description: 'المشروع يحتاج إلى المزيد من النشاط والتفاعل',
                action: 'شجع المتعاونين على المشاركة أكثر'
            });
        }

        // توصيات بناء على التعليقات
        const openComments = data.comments.filter(c => c.status === 'open').length;
        if (openComments > 5) {
            recommendations.push({
                type: 'feedback',
                priority: 'عالي',
                title: 'حل التعليقات المعلقة',
                description: `يوجد ${openComments} تعليق لم يتم حله بعد`,
                action: 'راجع وحل التعليقات المفتوحة'
            });
        }

        // توصيات بناء على المتعاونين
        const inactiveCollaborators = data.collaborators.filter(c => 
            !c.lastActive || !this.isRecentlyActive(c.lastActive)
        ).length;
        
        if (inactiveCollaborators > 0) {
            recommendations.push({
                type: 'engagement',
                priority: 'منخفض',
                title: 'تفعيل المتعاونين غير النشطين',
                description: `${inactiveCollaborators} متعاون غير نشط`,
                action: 'تواصل مع المتعاونين غير النشطين'
            });
        }

        return recommendations;
    }

    // دوال مساعدة للتواريخ
    isRecentlyActive(timestamp) {
        const lastActivity = new Date(timestamp);
        const now = new Date();
        const daysSince = (now - lastActivity) / (1000 * 60 * 60 * 24);
        return daysSince <= 7; // نشط خلال الأسبوع الماضي
    }

    isWithinLastWeek(timestamp) {
        return this.isWithinLastDays(timestamp, 7);
    }

    isWithinLastDays(timestamp, days) {
        const date = new Date(timestamp);
        const now = new Date();
        const daysSince = (now - date) / (1000 * 60 * 60 * 24);
        return daysSince <= days;
    }

    isWithinDateRange(timestamp, startDays, endDays) {
        const date = new Date(timestamp);
        const now = new Date();
        const daysSince = (now - date) / (1000 * 60 * 60 * 24);
        return daysSince >= endDays && daysSince <= startDays;
    }

    // دوال محاكاة لحفظ البيانات - في التطبيق الحقيقي ستكون API calls
    async saveProject(project) {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }

    async saveSuggestion(suggestion) {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }

    async saveRevision(revision) {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }

    async sendInvitation(invitation) {
        return new Promise(resolve => setTimeout(() => resolve({ 
            success: true, 
            inviteId: 'invite_' + Math.random().toString(36).substr(2)
        }), 200));
    }

    async notifyMentionedUsers(mentions, comment) {
        // محاكاة إرسال الإشعارات
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }

    async notifyProjectOwner(projectId, suggestion) {
        // محاكاة إشعار المالك
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }

    async logActivity(projectId, userId, action, details) {
        const activity = {
            id: 'activity_' + Date.now(),
            projectId: projectId,
            userId: userId,
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        // في التطبيق الحقيقي، سيتم حفظ هذا في قاعدة البيانات
        console.log('Activity logged:', activity);
        return activity;
    }

    async broadcastUpdate(projectId, updateType, data) {
        // محاكاة البث المباشر للتحديثات
        console.log(`Broadcasting ${updateType} to project ${projectId}:`, data);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 50));
    }

    // دوال جلب البيانات - محاكاة
    async getProject(projectId) {
        return this.currentProject || { id: projectId, name: 'مشروع تجريبي' };
    }

    async getProjectCollaborators(projectId) {
        return []; // قائمة فارغة للمحاكاة
    }

    async getActivityLog(projectId, timeRange) {
        return []; // قائمة فارغة للمحاكاة
    }

    async getProjectComments(projectId) {
        return Array.from(this.comments.get(projectId)?.values() || []);
    }

    async getProjectSuggestions(projectId) {
        return []; // قائمة فارغة للمحاكاة
    }

    async getProjectRevisions(projectId) {
        return this.revisions.filter(r => r.projectId === projectId);
    }

    async getLatestRevision(projectId) {
        const revisions = await this.getProjectRevisions(projectId);
        return revisions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
    }

    async getRevision(projectId, revisionId) {
        const revisions = await this.getProjectRevisions(projectId);
        return revisions.find(r => r.id === revisionId) || null;
    }

    async updateProjectMetadata(projectId, metadata) {
        if (this.currentProject && this.currentProject.id === projectId) {
            this.currentProject.metadata = { ...this.currentProject.metadata, ...metadata };
        }
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }
}

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CollaborationManager };
} else if (typeof window !== 'undefined') {
    window.CollaborationManager = CollaborationManager;
}