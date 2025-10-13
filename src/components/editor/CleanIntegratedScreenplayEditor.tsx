import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Loader2, Sun, Moon, FileText, Bold, Italic, Underline, 
  MoveVertical, Type, Search, Replace, Save, FolderOpen, 
  Printer, Settings, Download, FilePlus, 
  Undo, Redo, Scissors, Film, Camera, Feather, UserSquare, Parentheses, MessageCircle, 
  FastForward, ChevronDown, BookHeart, Hash, Play,
  Pause, RotateCcw, Upload, Activity, Globe,
  Database, Zap, Share2, Check, Edit3, Trash2, Copy, ExternalLink, GitBranch, Clock,
  Bookmark, Tag, MapPin, AlertTriangle, CheckCircle, XCircle, Plus,
  Minus, MoreVertical, Filter, SortAsc, SortDesc, Calendar, User,
  Mail, Phone, Link, Star, Heart, ThumbsUp, MessageSquare, Send,
  Maximize2, Minimize2, RefreshCw, HelpCircle, BarChart3, Users, PenTool,
  Brain
} from 'lucide-react';
import AdvancedAgentsPopup from './AdvancedAgentsPopup';
import { applyRegexReplacementToTextNodes } from '../../modules/text/domTextReplacement';
import type {
  Script,
  Scene,
  Character,
  DialogueLine,
  SceneActionLine
} from '../../types/types';

// ==================== PRODUCTION-READY SYSTEM CLASSES ====================

/**
 * @class StateManager
 * @description Manages the state of the application.
 * @property {Map<string, any>} state - The state of the application.
 * @property {Map<string, Array<(value: any) => void>>} subscribers - The subscribers to the state changes.
 */
class StateManager {
  private state = new Map();
  private subscribers = new Map();

  /**
   * @method subscribe
   * @description Subscribes to a state change.
   * @param {string} key - The key to subscribe to.
   * @param {(value: any) => void} callback - The callback to execute when the state changes.
   * @returns {() => void} - A function to unsubscribe.
   */
  subscribe(key: string, callback: (value: any) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);

    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * @method setState
   * @description Sets the state for a given key.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   * @returns {void} Executes all subscriber callbacks with the updated value.
   */
  setState(key: string, value: any) {
    this.state.set(key, value);
    const callbacks = this.subscribers.get(key) || [];
    callbacks.forEach((callback: any) => callback(value));
  }

  /**
   * @method getState
   * @description Gets the state for a given key.
   * @param {string} key - The key to get.
   * @returns {any} - The value of the state.
   */
  getState(key: string) {
    return this.state.get(key);
  }
}

/**
 * @class AutoSaveManager
 * @description Manages auto-saving and backups.
 * @property {number | null} autoSaveInterval - The interval for auto-saving.
 * @property {string} currentContent - The current content of the editor.
 * @property {string} lastSaved - The last saved content.
 * @property {((content: string) => Promise<void>) | null} saveCallback - The callback to execute when saving.
 * @property {number} intervalMs - The interval in milliseconds for auto-saving.
 */
class AutoSaveManager {
  private autoSaveInterval: number | null = null;
  private currentContent = '';
  private lastSaved = '';
  private saveCallback: ((content: string) => Promise<void>) | null = null;

  private intervalMs: number;

  /**
   * @constructor
   * @param {number} intervalMs - The interval in milliseconds for auto-saving.
   */
  constructor(intervalMs: number = 30000) {
    this.intervalMs = intervalMs;
  }

  /**
   * @method setSaveCallback
   * @description Sets the save callback.
   * @param {(content: string) => Promise<void>} callback - The callback to execute when saving.
   * @returns {void} Stores the provided callback for subsequent save operations.
   */
  setSaveCallback(callback: (content: string) => Promise<void>) {
    this.saveCallback = callback;
  }

  /**
   * @method updateContent
   * @description Updates the current content.
   * @param {string} content - The new content.
   * @returns {void} Caches the latest editor snapshot for future saves.
   */
  updateContent(content: string) {
    this.currentContent = content;
  }

  /**
   * @method startAutoSave
   * @description Starts the auto-save interval.
   * @returns {void} Begins polling for changes at the configured interval.
   */
  startAutoSave() {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = window.setInterval(async () => {
      if (this.currentContent !== this.lastSaved && this.saveCallback) {
        try {
          await this.saveCallback(this.currentContent);
          this.lastSaved = this.currentContent;
          console.log('Auto-saved at:', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, this.intervalMs);
  }

  /**
   * @method stopAutoSave
   * @description Stops the auto-save interval.
   * @returns {void} Clears any scheduled auto-save timers.
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * @method forceSave
   * @description Forces a save.
   * @returns {Promise<void>} Resolves once the latest content snapshot is persisted.
   */
  async forceSave() {
    if (this.saveCallback) {
      await this.saveCallback(this.currentContent);
      this.lastSaved = this.currentContent;
    }
  }
}

/**
 * @class AdvancedSearchEngine
 * @description Provides advanced search and replace functionality.
 */
class AdvancedSearchEngine {
  /**
   * @method searchInContent
   * @description Searches for a query in the content.
   * @param {string} content - The content to search in.
   * @param {string} query - The query to search for.
   * @param {any} options - The search options.
   * @returns {Promise<any>} - The search results.
   */
  async searchInContent(content: string, query: string, options: any = {}) {
    const results: Array<{ lineNumber: number; content: string; matches: Array<{ text: string; index: number; length: number }> }> = [];
    const lines = content.split('\n');
    const caseSensitive = options.caseSensitive || false;
    const wholeWords = options.wholeWords || false;
    const useRegex = options.useRegex || false;

    let searchPattern: RegExp;

    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(query, flags);
      } else if (wholeWords) {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      } else {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(escapedQuery, flags);
      }

      lines.forEach((line, lineNumber) => {
        const matches = Array.from(line.matchAll(searchPattern));
        if (matches.length > 0) {
          results.push({
            lineNumber: lineNumber + 1,
            content: line,
            matches: matches.map(match => ({
              text: match[0],
              index: match.index || 0,
              length: match[0].length
            }))
          });
        }
      });

      return {
        success: true,
        query: query,
        totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
        results: results,
        searchTime: Date.now()
      };

    } catch (error) {
      return {
        success: false,
        error: `خطأ في البحث: ${error}`,
        results: []
      };
    }
  }

  /**
   * @method replaceInContent
   * @description Replaces a search query with a new text in the content.
   * @param {string} content - The content to search in.
   * @param {string} searchQuery - The query to search for.
   * @param {string} replaceText - The text to replace with.
   * @param {any} options - The replace options.
   * @returns {Promise<any>} - The replace results.
   */
  async replaceInContent(content: string, searchQuery: string, replaceText: string, options: any = {}) {
    const caseSensitive = options.caseSensitive || false;
    const wholeWords = options.wholeWords || false;
    const useRegex = options.useRegex || false;
    const replaceAll = options.replaceAll !== false;

    let searchPattern: RegExp;

    try {
      if (useRegex) {
        const flags = replaceAll ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? '' : 'i');
        searchPattern = new RegExp(searchQuery, flags);
      } else if (wholeWords) {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = replaceAll ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? '' : 'i');
        searchPattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = replaceAll ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? '' : 'i');
        searchPattern = new RegExp(escapedQuery, flags);
      }

      const originalMatches = content.match(new RegExp(searchPattern.source, 'g')) || [];
      const newContent = content.replace(searchPattern, replaceText);

      return {
        success: true,
        originalContent: content,
        newContent: newContent,
        replacements: originalMatches.length,
        searchQuery: searchQuery,
        replaceText: replaceText,
        patternSource: searchPattern.source,
        patternFlags: searchPattern.flags,
        replaceAll: replaceAll
      };

    } catch (error) {
      return {
        success: false,
        error: `خطأ في الاستبدال: ${error}`,
        originalContent: content,
        newContent: content,
        replacements: 0,
        searchQuery: searchQuery,
        replaceText: replaceText
      };
    }
  }
}

/**
 * @class CollaborationSystem
 * @description Manages collaboration and comments.
 * @property {Array<{ id: string; name: string; color: string }>} collaborators - The list of collaborators.
 * @property {Array<{ id: string; content: string; author: string; timestamp: Date; position: any }>} comments - The list of comments.
 * @property {Array<(data: any) => void>} changeCallbacks - The list of callbacks to execute on change.
 */
class CollaborationSystem {
  private collaborators: Array<{ id: string; name: string; color: string }> = [];
  private comments: Array<{ id: string; content: string; author: string; timestamp: Date; position: any }> = [];
  private changeCallbacks: Array<(data: any) => void> = [];

  /**
   * @method addCollaborator
   * @description Adds a collaborator.
   * @param {{ id: string; name: string; color: string }} collaborator - The collaborator to add.
   * @returns {void} Registers the collaborator and notifies subscribers of the change.
   */
  addCollaborator(collaborator: { id: string; name: string; color: string }) {
    this.collaborators.push(collaborator);
    this.notifyChanges({ type: 'collaborator_added', collaborator });
  }

  /**
   * @method removeCollaborator
   * @description Removes a collaborator.
   * @param {string} id - The ID of the collaborator to remove.
   * @returns {void} Removes the collaborator and broadcasts the update.
   */
  removeCollaborator(id: string) {
    this.collaborators = this.collaborators.filter(c => c.id !== id);
    this.notifyChanges({ type: 'collaborator_removed', id });
  }

  /**
   * @method addComment
   * @description Adds a comment.
   * @param {{ id: string; content: string; author: string; timestamp: Date; position: any }} comment - The comment to add.
   * @returns {void} Stores the comment and dispatches a change event.
   */
  addComment(comment: { id: string; content: string; author: string; timestamp: Date; position: any }) {
    this.comments.push(comment);
    this.notifyChanges({ type: 'comment_added', comment });
  }

  /**
   * @method removeComment
   * @description Removes a comment.
   * @param {string} id - The ID of the comment to remove.
   * @returns {void} Deletes the comment and alerts all subscribers.
   */
  removeComment(id: string) {
    this.comments = this.comments.filter(c => c.id !== id);
    this.notifyChanges({ type: 'comment_removed', id });
  }

  /**
   * @method subscribeToChanges
   * @description Subscribes to changes.
   * @param {(data: any) => void} callback - The callback to execute on change.
   * @returns {void} Registers the callback for subsequent change notifications.
   */
  subscribeToChanges(callback: (data: any) => void) {
    this.changeCallbacks.push(callback);
  }

  /**
   * @method notifyChanges
   * @description Notifies subscribers of changes.
   * @param {any} data - The data to send to subscribers.
   */
  private notifyChanges(data: any) {
    this.changeCallbacks.forEach(callback => callback(data));
  }

  /**
   * @method getCollaborators
   * @description Gets the list of collaborators.
   * @returns {Array<{ id: string; name: string; color: string }>} - The list of collaborators.
   */
  getCollaborators() {
    return [...this.collaborators];
  }

  /**
   * @method getComments
   * @description Gets the list of comments.
   * @returns {Array<{ id: string; content: string; author: string; timestamp: Date; position: any }>} - The list of comments.
   */
  getComments() {
    return [...this.comments];
  }
}

/**
 * @class AIWritingAssistant
 * @description Provides AI-powered writing assistance.
 */
export class AIWritingAssistant {
  /**
   * @method generateText
   * @description Generates text based on a prompt and context.
   * @param {string} prompt - The prompt to generate text from.
   * @param {string} context - The context for the generation.
   * @param {any} options - The generation options.
   * @returns {Promise<any>} - The generated text and suggestions.
   */
  async generateText(prompt: string, context: string, options: any = {}): Promise<{ text?: string }> {
    // In a real implementation, this would call an AI service
    // For now, we'll simulate the response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `نص مُولد بواسطة الذكاء الاصطناعي استنادًا إلى: "${prompt}"\n\nهذا نص تجريبي يُظهر كيف يمكن للمساعد إنشاء محتوى مفيد للمؤلف.`
        });
      }, 1500);
    });
  }

  /**
   * @method rewriteText
   * @description Rewrites text in a specific style.
   * @param {string} text - The text to rewrite.
   * @param {string} style - The style to apply.
   * @param {any} options - The rewrite options.
   * @returns {Promise<any>} - The rewritten text and changes.
   */
  async rewriteText(text: string, style: string, options: any = {}) {
    // In a real implementation, this would call an AI service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          originalText: text,
          rewrittenText: `النص المعاد كتابته بأسلوب ${style}:\n\n${text}`,
          changes: [
            { type: "style", description: `تم تطبيق أسلوب ${style}` },
            { type: "improvement", description: "تحسين التدفق العام" }
          ]
        });
      }, 1500);
    });
  }
}

/**
 * @class ProjectManager
 * @description Manages projects and templates.
 * @property {Array<{ id: string; name: string; createdAt: Date; lastModified: Date }>} projects - The list of projects.
 * @property {Array<{ id: string; name: string; content: string }>} templates - The list of templates.
 */
class ProjectManager {
  private projects: Array<{ id: string; name: string; createdAt: Date; lastModified: Date }> = [];
  private templates: Array<{ id: string; name: string; content: string }> = [];

  /**
   * @method createProject
   * @description Creates a new project.
   * @param {string} name - The name of the project.
   * @returns {{ id: string; name: string; createdAt: Date; lastModified: Date }} - The new project.
   */
  createProject(name: string) {
    const project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: new Date(),
      lastModified: new Date()
    };
    this.projects.push(project);
    return project;
  }

  /**
   * @method getProjects
   * @description Gets the list of projects.
   * @returns {Array<{ id: string; name: string; createdAt: Date; lastModified: Date }>} - The list of projects.
   */
  getProjects() {
    return [...this.projects];
  }

  /**
   * @method getProject
   * @description Gets a project by its ID.
   * @param {string} id - The ID of the project.
   * @returns {{ id: string; name: string; createdAt: Date; lastModified: Date } | undefined} - The project.
   */
  getProject(id: string) {
    return this.projects.find(p => p.id === id);
  }

  /**
   * @method updateProject
   * @description Updates a project.
   * @param {string} id - The ID of the project to update.
   * @param {any} updates - The updates to apply.
   * @returns {{ id: string; name: string; createdAt: Date; lastModified: Date } | null} - The updated project.
   */
  updateProject(id: string, updates: any) {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      Object.assign(project, updates, { lastModified: new Date() });
      return project;
    }
    return null;
  }

  /**
   * @method deleteProject
   * @description Deletes a project.
   * @param {string} id - The ID of the project to delete.
   * @returns {void} Removes the project from the internal collection.
   */
  deleteProject(id: string) {
    this.projects = this.projects.filter(p => p.id !== id);
  }

  /**
   * @method addTemplate
   * @description Adds a new template.
   * @param {string} name - The name of the template.
   * @param {string} content - The content of the template.
   * @returns {{ id: string; name: string; content: string }} - The new template.
   */
  addTemplate(name: string, content: string) {
    const template = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content
    };
    this.templates.push(template);
    return template;
  }

  /**
   * @method getTemplates
   * @description Gets the list of templates.
   * @returns {Array<{ id: string; name: string; content: string }>} - The list of templates.
   */
  getTemplates() {
    return [...this.templates];
  }

  /**
   * @method applyTemplate
   * @description Applies a template.
   * @param {string} templateId - The ID of the template to apply.
   * @returns {string | null} - The content of the template.
   */
  applyTemplate(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    return template ? template.content : null;
  }
}

/**
 * @class VisualPlanningSystem
 * @description Manages visual planning tools like storyboards and beat sheets.
 * @property {Array<{ id: string; sceneId: string; description: string; imageUrl?: string }>} storyboards - The list of storyboards.
 * @property {Array<{ id: string; act: number; beat: string; description: string }>} beatSheets - The list of beat sheets.
 */
class VisualPlanningSystem {
  private storyboards: Array<{ id: string; sceneId: string; description: string; imageUrl?: string }> = [];
  private beatSheets: Array<{ id: string; act: number; beat: string; description: string }> = [];

  /**
   * @method addStoryboard
   * @description Adds a new storyboard.
   * @param {string} sceneId - The ID of the scene.
   * @param {string} description - The description of the storyboard.
   * @param {string} [imageUrl] - The URL of the image for the storyboard.
   * @returns {{ id: string; sceneId: string; description: string; imageUrl?: string }} - The new storyboard.
   */
  addStoryboard(sceneId: string, description: string, imageUrl?: string) {
    const storyboard = {
      id: Math.random().toString(36).substr(2, 9),
      sceneId,
      description,
      imageUrl
    };
    this.storyboards.push(storyboard);
    return storyboard;
  }

  /**
   * @method getStoryboards
   * @description Gets the list of storyboards.
   * @returns {Array<{ id: string; sceneId: string; description: string; imageUrl?: string }>} - The list of storyboards.
   */
  getStoryboards() {
    return [...this.storyboards];
  }

  /**
   * @method addBeatSheet
   * @description Adds a new beat sheet.
   * @param {number} act - The act number.
   * @param {string} beat - The beat.
   * @param {string} description - The description of the beat sheet.
   * @returns {{ id: string; act: number; beat: string; description: string }} - The new beat sheet.
   */
  addBeatSheet(act: number, beat: string, description: string) {
    const beatSheet = {
      id: Math.random().toString(36).substr(2, 9),
      act,
      beat,
      description
    };
    this.beatSheets.push(beatSheet);
    return beatSheet;
  }

  /**
   * @method getBeatSheets
   * @description Gets the list of beat sheets.
   * @returns {Array<{ id: string; act: number; beat: string; description: string }>} - The list of beat sheets.
   */
  getBeatSheets() {
    return [...this.beatSheets];
  }
}

// ==================== ARABIC SCREENPLAY CLASSIFIER ====================

/**
 * @class ScreenplayClassifier
 * @description A classifier for Arabic screenplays.
 */
export class ScreenplayClassifier {
  /**
   * @method stripTashkeel
   * @description Strips Tashkeel from Arabic text.
   * @param {string} text - The text to strip.
   * @returns {string} - The stripped text.
   */
  static stripTashkeel(text: string): string {
    return text.replace(/[\u064B-\u065F\u0670]/g, '');
  }

  /**
   * @method normalizeSeparators
   * @description Normalizes separators in a text.
   * @param {string} text - The text to normalize.
   * @returns {string} - The normalized text.
   */
  static normalizeSeparators(text: string): string {
    return text.replace(/\u2013|\u2014|\u2015/g, '-').replace(/\u060C/g, ',').replace(/\s+/g, ' ');
  }

  /**
   * @method normalizeLine
   * @description Normalizes a line of text.
   * @param {string} input - The line to normalize.
   * @returns {string} - The normalized line.
   */
  static normalizeLine(input: string): string {
    return ScreenplayClassifier.stripTashkeel(
      ScreenplayClassifier.normalizeSeparators(input)
    ).replace(/[\u200f\u200e\ufeff\t]+/g, '').trim();
  }

  /**
   * @method textInsideParens
   * @description Extracts text inside parentheses.
   * @param {string} s - The string to extract from.
   * @returns {string} - The text inside the parentheses.
   */
  static textInsideParens(s: string): string {
    const match = s.match(/^\s*\((.*?)\)\s*$/);
    return match ? match[1] : '';
  }

  /**
   * @method hasSentencePunctuation
   * @description Checks if a string has sentence punctuation.
   * @param {string} s - The string to check.
   * @returns {boolean} - True if the string has sentence punctuation, false otherwise.
   */
  static hasSentencePunctuation(s: string): boolean {
    return /[\.!\؟\?]/.test(s);
  }

  /**
   * @method wordCount
   * @description Counts the words in a string.
   * @param {string} s - The string to count words in.
   * @returns {number} - The number of words.
   */
  static wordCount(s: string): number {
    return s.trim() ? s.trim().split(/\s+/).length : 0;
  }

  /**
   * @method isBlank
   * @description Checks if a line is blank.
   * @param {string} line - The line to check.
   * @returns {boolean} - True if the line is blank, false otherwise.
   */
  static isBlank(line: string): boolean {
    return !line || line.trim() === '';
  }

  // Arabic-specific patterns
  static ARABIC_PATTERNS = {
    CHARACTER: [
      /^[\u0600-\u06FF\s]+:$/,  // Arabic characters followed by colon
      /^[A-Z\u0600-\u06FF\s]+$/  // All caps or Arabic characters (without colon)
    ],
    DIALOGUE: [
      /^[\u0600-\u06FF\s\.,!?؛؟\-"]+$/,  // Arabic text with punctuation
    ],
    ACTION: [
      /^[\u0600-\u06FF\s\.,!?؛؟\-"]+$/,  // Arabic text with punctuation
    ],
    TRANSITION: [
      /^(CUT TO:|FADE (IN|OUT)\.|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:|JUMP CUT TO:)/i,
      /^(تحول إلى|تلاشي (داخل|خارج)\.|تتلاشى إلى|قطع إلى|اقتطاع إلى|ذوبان إلى)/
    ],
    SCENE_HEADER: [
      /^\s*(?:مشهد|م\.)\s*\d+/i,  // Arabic scene headers like "مشهد 1" or "م. 1"
    ]
  };

  // Action verbs list for Arabic
  static ACTION_VERB_LIST = [
    'يتحرك', 'يقول', 'يفعل', 'ينظر', 'يسمع', 'يشعر', 'يفكر', 'يتذكر', 'يقرر', 'يبدأ', 'ينتهي',
    'يدخل', 'يخرج', 'يقف', 'يجلس', 'ينام', 'يستيقظ', 'يأكل', 'يشرب', 'يكتب', 'يقرأ', 'يتحدث',
    'يصرخ', 'يبكي', 'يضحك', 'يبتسم', 'ينهي', 'يوقف', 'يستمر', 'يتغير', 'يظهر', 'يختفي',
    'يأخذ', 'يعطي', 'يضع', 'يرفع', 'يخفض', 'يفتح', 'يغلق', 'يبدأ', 'ينتهي', 'يستمر', 'يتوقف'
  ].join('|');

  /**
   * @method isBasmala
   * @description Checks if a line is a Basmala.
   * @param {string} line - The line to check.
   * @returns {boolean} - True if the line is a Basmala, false otherwise.
   */
  static isBasmala(line: string): boolean {
    // Handle both formats:
    // 1. بسم الله الرحمن الرحيم
    // 2. }بسم الله الرحمن الرحيم{
    const normalizedLine = line.trim();
    const basmalaPatterns = [
      /^بسم\s+الله\s+الرحمن\s+الرحيم$/i,  // Standard format
      /^[{}]*\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*[{}]*$/i  // With braces
    ];
    
    return basmalaPatterns.some(pattern => pattern.test(normalizedLine));
  }

  /**
   * @method isSceneHeaderStart
   * @description Checks if a line is the start of a scene header.
   * @param {string} line - The line to check.
   * @returns {boolean} - True if the line is the start of a scene header, false otherwise.
   */
  static isSceneHeaderStart(line: string): boolean {
    // Match Arabic scene headers like "مشهد 1" or "م. 1"
    return /^\s*(?:مشهد|م\.)\s*\d+/i.test(line);
  }

  /**
   * @method isTransition
   * @description Checks if a line is a transition.
   * @param {string} line - The line to check.
   * @returns {boolean} - True if the line is a transition, false otherwise.
   */
  static isTransition(line: string): boolean {
    const transitionPatterns = [
      /^\s*(CUT TO:|FADE (IN|OUT)\.|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:|JUMP CUT TO:)/i,
      /^\s*(تحول إلى|تلاشي (داخل|خارج)\.|تتلاشى إلى|قطع إلى|اقتطاع إلى|ذوبان إلى)/
    ];
    
    return transitionPatterns.some(pattern => pattern.test(line));
  }

  /**
   * @method isParenShaped
   * @description Checks if a line is parenthetical.
   * @param {string} line - The line to check.
   * @returns {boolean} - True if the line is parenthetical, false otherwise.
   */
  static isParenShaped(line: string): boolean {
    return /^\s*\(.*?\)\s*$/.test(line);
  }

  /**
   * @method isCharacterLine
   * @description Checks if a line is a character line.
   * @param {string} line - The line to check.
   * @param {{ lastFormat: string; isInDialogueBlock: boolean }} [context] - The context of the line.
   * @returns {boolean} - True if the line is a character line, false otherwise.
   */
  static isCharacterLine(line: string, context?: { lastFormat: string; isInDialogueBlock: boolean }): boolean {
    if (ScreenplayClassifier.isBlank(line) || 
        ScreenplayClassifier.isBasmala(line) || 
        ScreenplayClassifier.isSceneHeaderStart(line) || 
        ScreenplayClassifier.isTransition(line) || 
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }
    
    const wordCount = ScreenplayClassifier.wordCount(line);
    // Allow slightly longer character lines for Arabic names
    if (wordCount > 7) return false;
    
    // Check if line ends with a colon (common in Arabic screenplays)
    const hasColon = line.includes(':');
    
    // Special handling for Arabic character names that might not follow Western patterns
    const arabicCharacterPattern = /^[\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+[:\s]*$/;
    
    // If it ends with a colon, it's very likely a character line
    if (hasColon && line.trim().endsWith(':')) {
      return true;
    }
    
    // If it matches Arabic character pattern, it's likely a character line
    if (arabicCharacterPattern.test(line)) {
      return true;
    }
    
    // If it doesn't have a colon and doesn't match character patterns, it's likely action
    if (!hasColon) return false;
    
    // Context-aware checks
    if (context) {
      // If we're already in a dialogue block, this might be a new character
      if (context.isInDialogueBlock) {
        // If the last line was also a character, this is likely a new character
        if (context.lastFormat === 'character') {
          return ScreenplayClassifier.ARABIC_PATTERNS.CHARACTER.some(pattern => pattern.test(line)) || arabicCharacterPattern.test(line);
        }
        // If the last line was dialogue, this is probably not a character
        if (context.lastFormat === 'dialogue') {
          return false;
        }
      }
      
      // If the last format was action, and this line has a colon, it's likely a character
      if (context.lastFormat === 'action' && hasColon) {
        return ScreenplayClassifier.ARABIC_PATTERNS.CHARACTER.some(pattern => pattern.test(line)) || arabicCharacterPattern.test(line);
      }
    }
    
    return ScreenplayClassifier.ARABIC_PATTERNS.CHARACTER.some(pattern => pattern.test(line)) || arabicCharacterPattern.test(line);
  }

  /**
   * @method isLikelyAction
   * @description Checks if a line is likely an action line.
   * @param {string} line - The line to check.
   * @returns {boolean} - True if the line is likely an action line, false otherwise.
   */
  static isLikelyAction(line: string): boolean {
    if (ScreenplayClassifier.isBlank(line) ||
        ScreenplayClassifier.isBasmala(line) ||
        ScreenplayClassifier.isSceneHeaderStart(line) ||
        ScreenplayClassifier.isTransition(line) ||
        ScreenplayClassifier.isCharacterLine(line) ||
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }

    // Additional checks for action lines
    const normalized = ScreenplayClassifier.normalizeLine(line);
    
    // Check if line starts with an action description pattern
    // These are strong indicators of action lines
    const actionStartPatterns = [
      /^\s*[-–—]?\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
      /^\s*[-–—]?\s*[ي|ت][\u0600-\u06FF]+\s+(?:[^\s\u0600-\u06FF]*\s*)*[^\\s\u0600-\u06FF]/  // Verbs starting with ي or ت followed by other words
    ];
    
    for (const pattern of actionStartPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }
    
    // Enhanced action detection for Arabic
    // Check if line starts with an action verb
    const actionVerbPattern = new RegExp('^(?:' + ScreenplayClassifier.ACTION_VERB_LIST + ')(?:\\s|$)');
    if (actionVerbPattern.test(normalized)) {
      return true;
    }
    
    // If it has sentence punctuation and no colon, it might be action
    // But we need to be more careful to avoid misclassifying dialogue
    if (ScreenplayClassifier.hasSentencePunctuation(line) && !line.includes(':')) {
      // Check if it contains action indicators
      const actionIndicators = [
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق'
      ];
      
      for (const indicator of actionIndicators) {
        if (normalized.includes(indicator)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Converts a raw screenplay text into a structured representation consisting of scenes, characters, and dialogue lines.
   *
   * @param {string} screenplayText - The raw screenplay content.
   * @returns {Script} Structured screenplay data leveraging strongly typed models.
   */
  structureScript(screenplayText: string): Script {
    const normalizedScript = screenplayText.replace(/\r\n/g, '\n');
    const rawLines = normalizedScript.split('\n');

    const scenes: Scene[] = [];
    const characters: Record<string, Character> = {};
    const dialogueLines: DialogueLine[] = [];

    let currentScene: Scene | null = null;
    let currentCharacterName: string | null = null;
    let isInDialogueBlock = false;
    let lastFormat: 'action' | 'dialogue' | 'character' | 'scene-header' | 'parenthetical' | 'transition' | 'blank' = 'action';
    let sceneCounter = 0;

    const createScene = (heading: string, lineNumber: number): Scene => {
      sceneCounter += 1;
      return {
        id: `scene-${sceneCounter}`,
        heading,
        index: sceneCounter - 1,
        startLineNumber: lineNumber,
        lines: [],
        dialogues: [],
        actionLines: []
      };
    };

    const resolveScene = (lineNumber: number): Scene => {
      if (!currentScene) {
        currentScene = createScene('مقدمة', lineNumber);
        scenes.push(currentScene);
      }
      return currentScene;
    };

    const addActionLine = (scene: Scene, text: string, lineNumber: number) => {
      const normalized = ScreenplayClassifier.normalizeLine(text) || text.trim();
      if (!normalized) {
        return;
      }
      const actionLine: SceneActionLine = { text: normalized, lineNumber };
      scene.actionLines.push(actionLine);
    };

    const ensureCharacter = (name: string, sceneId: string): Character => {
      if (!characters[name]) {
        characters[name] = {
          name,
          dialogueCount: 0,
          dialogueLines: [],
          firstSceneId: sceneId
        };
      }

      if (!characters[name].firstSceneId) {
        characters[name].firstSceneId = sceneId;
      }

      return characters[name];
    };

    rawLines.forEach((rawLine, index) => {
      const lineNumber = index + 1;

      if (ScreenplayClassifier.isSceneHeaderStart(rawLine)) {
        if (currentScene) {
          currentScene.endLineNumber = lineNumber - 1;
        }

        const heading = ScreenplayClassifier.normalizeLine(rawLine) || rawLine.trim() || `مشهد ${sceneCounter + 1}`;
        currentScene = createScene(heading, lineNumber);
        currentScene.lines.push(rawLine);
        scenes.push(currentScene);

        currentCharacterName = null;
        isInDialogueBlock = false;
        lastFormat = 'scene-header';
        return;
      }

      const activeScene = resolveScene(lineNumber);
      activeScene.lines.push(rawLine);

      if (ScreenplayClassifier.isBlank(rawLine)) {
        currentCharacterName = null;
        isInDialogueBlock = false;
        lastFormat = 'blank';
        return;
      }

      if (ScreenplayClassifier.isTransition(rawLine)) {
        addActionLine(activeScene, rawLine, lineNumber);
        currentCharacterName = null;
        isInDialogueBlock = false;
        lastFormat = 'transition';
        return;
      }

      const context = { lastFormat, isInDialogueBlock };
      if (ScreenplayClassifier.isCharacterLine(rawLine, context)) {
        const normalizedCharacter = ScreenplayClassifier.normalizeLine(rawLine).replace(/:$/, '').trim();
        currentCharacterName = normalizedCharacter || rawLine.trim();
        ensureCharacter(currentCharacterName, activeScene.id);
        isInDialogueBlock = true;
        lastFormat = 'character';
        return;
      }

      if (ScreenplayClassifier.isParenShaped(rawLine) && currentCharacterName) {
        const parentheticalText = ScreenplayClassifier.textInsideParens(rawLine).trim() || ScreenplayClassifier.normalizeLine(rawLine);
        if (parentheticalText) {
          const dialogueEntry: DialogueLine = {
            id: `dialogue-${dialogueLines.length + 1}`,
            character: currentCharacterName,
            text: parentheticalText,
            lineNumber,
            sceneId: activeScene.id,
            type: 'parenthetical'
          };
          dialogueLines.push(dialogueEntry);
          activeScene.dialogues.push(dialogueEntry);
          const character = ensureCharacter(currentCharacterName, activeScene.id);
          character.dialogueLines.push(dialogueEntry);
          character.dialogueCount = character.dialogueLines.length;
        }
        isInDialogueBlock = true;
        lastFormat = 'parenthetical';
        return;
      }

      if (isInDialogueBlock && currentCharacterName) {
        const dialogueText = ScreenplayClassifier.normalizeLine(rawLine) || rawLine.trim();
        if (dialogueText) {
          const dialogueEntry: DialogueLine = {
            id: `dialogue-${dialogueLines.length + 1}`,
            character: currentCharacterName,
            text: dialogueText,
            lineNumber,
            sceneId: activeScene.id,
            type: 'dialogue'
          };
          dialogueLines.push(dialogueEntry);
          activeScene.dialogues.push(dialogueEntry);
          const character = ensureCharacter(currentCharacterName, activeScene.id);
          character.dialogueLines.push(dialogueEntry);
          character.dialogueCount = character.dialogueLines.length;
        }
        lastFormat = 'dialogue';
        return;
      }

      if (ScreenplayClassifier.isBasmala(rawLine) || ScreenplayClassifier.isLikelyAction(rawLine)) {
        addActionLine(activeScene, rawLine, lineNumber);
        currentCharacterName = null;
        isInDialogueBlock = false;
        lastFormat = 'action';
        return;
      }

      // Fallback: treat uncategorised content as descriptive action to maintain continuity.
      addActionLine(activeScene, rawLine, lineNumber);
      currentCharacterName = null;
      isInDialogueBlock = false;
      lastFormat = 'action';
    });

    if (currentScene) {
      (currentScene as Scene).endLineNumber = rawLines.length;
    }

    if (scenes.length === 0) {
      scenes.push({
        id: 'scene-1',
        heading: 'مقدمة',
        index: 0,
        startLineNumber: 1,
        endLineNumber: rawLines.length,
        lines: rawLines,
        dialogues: [],
        actionLines: []
      });
    }

    const script: Script = {
      rawText: screenplayText,
      totalLines: rawLines.length,
      scenes,
      characters,
      dialogueLines
    };

    return script;
  }
}

// ==================== MAIN SCREENPLAY EDITOR COMPONENT ====================

/**
 * Provides the main integrated screenplay editing experience with formatting, tooling, and AI helpers.
 *
 * @returns {JSX.Element} The fully interactive screenplay editor layout.
 */
const CleanIntegratedScreenplayEditor: React.FC = () => {
  // State variables
  const [htmlContent, setHtmlContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('action');
  const [selectedFont, setSelectedFont] = useState('Amiri');
  const [selectedSize, setSelectedSize] = useState('14pt');
  const [documentStats, setDocumentStats] = useState({
    characters: 0,
    words: 0,
    pages: 1,
    scenes: 0
  });

  // Menu states
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showAgentsPopup, setShowAgentsPopup] = useState(false);

  // Dialog states
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showCharacterRename, setShowCharacterRename] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [oldCharacterName, setOldCharacterName] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');

  // AI review states
  const [showReviewerDialog, setShowReviewerDialog] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState('');

  // View states
  const [showRulers, setShowRulers] = useState(true);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  // Production-ready system instances
  const stateManager = useRef(new StateManager());
  const autoSaveManager = useRef(new AutoSaveManager());
  const searchEngine = useRef(new AdvancedSearchEngine());
  const collaborationSystem = useRef(new CollaborationSystem());
  const aiAssistant = useRef(new AIWritingAssistant());
  const projectManager = useRef(new ProjectManager());
  const visualPlanning = useRef(new VisualPlanningSystem());
  const screenplayClassifier = useRef(new ScreenplayClassifier());

  /**
   * Computes inline styles for a screenplay block based on the semantic format type.
   *
   * @param {string} formatType - The semantic style key (e.g., action, dialogue, transition).
   * @returns {React.CSSProperties} A merged style object ready for inline application.
   */
  const getFormatStyles = (formatType: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
      fontSize: selectedSize,
      direction: 'rtl',
      lineHeight: '1.8',
      minHeight: '1.2em'
    };

    const formatStyles: { [key: string]: React.CSSProperties } = {
      'basmala': { textAlign: 'left', margin: '0' },
      'scene-header-top-line': { display: 'flex', justifyContent: 'space-between', width: '100%', margin: '1rem 0 0 0' },
      'scene-header-3': { textAlign: 'center', fontWeight: 'bold', margin: '0 0 1rem 0' },
      'action': { textAlign: 'right', margin: '12px 0' },
      'character': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', width: '2.5in', margin: '12px auto 0 auto' },
      'parenthetical': { textAlign: 'center', fontStyle: 'italic', width: '2.0in', margin: '6px auto' },
      'dialogue': { textAlign: 'center', width: '2.5in', lineHeight: '1.2', margin: '0 auto 12px auto' },
      'transition': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', margin: '1rem 0' },
    };

    const finalStyles = { ...baseStyles, ...formatStyles[formatType] };
  
    if (formatType === 'scene-header-1') return { ...baseStyles, fontWeight: 'bold', textTransform: 'uppercase', margin: '0' };
    if (formatType === 'scene-header-2') return { ...baseStyles, fontStyle: 'italic', margin: '0' };
  
    return finalStyles;
  };

  /**
   * Placeholder for future cursor tracking logic that keeps tool state in sync with caret position.
   *
   * @returns {void} Currently performs no action but preserves extensibility hooks.
   */
  const updateCursorPosition = () => {
    // Function implementation removed as variables are unused
  };

  /**
   * Determines whether the node containing the current caret position has any textual content.
   *
   * @returns {boolean} True when the focused element is empty; otherwise false.
   */
  const isCurrentElementEmpty = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      return element && element.textContent === '';
    }
    return false;
  };

  /**
   * Calculates aggregate document statistics and updates the sidebar dashboard.
   *
   * @returns {void} Synchronizes character, word, page, and scene counts with UI state.
   */
  const calculateStats = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || '';
      const characters = textContent.length;
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      const scenes = (textContent.match(/مشهد\s*\d+/gi) || []).length;
      
      // Calculate pages based on A4 height
      const scrollHeight = editorRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(scrollHeight / (29.7 * 37.8)));
      
      setDocumentStats({ characters, words, pages, scenes });
    }
  };

  /**
   * Determines the next screenplay block format when the Tab key navigation is used.
   *
   * @param {string} currentFormat - The format applied to the current line.
   * @param {boolean} shiftKey - Indicates whether the Shift key is held to reverse navigation.
   * @returns {string} The next format identifier to apply.
   */
  const getNextFormatOnTab = (currentFormat: string, shiftKey: boolean) => {
    const mainSequence = ['scene-header-top-line', 'action', 'character', 'transition'];
    
    switch (currentFormat) {
      case 'character':
        if (shiftKey) {
          return isCurrentElementEmpty() ? 'action' : 'transition';
        } else {
          return 'dialogue';
        }
      case 'dialogue':
        if (shiftKey) {
          return 'character';
        } else {
          return 'parenthetical';
        }
      case 'parenthetical':
        return 'dialogue';
      default:
        const currentIndex = mainSequence.indexOf(currentFormat);
        if (currentIndex !== -1) {
          if (shiftKey) {
            return mainSequence[Math.max(0, currentIndex - 1)];
          } else {
            return mainSequence[Math.min(mainSequence.length - 1, currentIndex + 1)];
          }
        }
        return 'action';
    }
  };

  /**
   * Resolves the subsequent format that should be applied after pressing Enter.
   *
   * @param {string} currentFormat - The format assigned to the current line.
   * @returns {string} The format key for the newly inserted line.
   */
  const getNextFormatOnEnter = (currentFormat: string) => {
    const transitions: { [key: string]: string } = {
      'scene-header-top-line': 'scene-header-3', 
      'scene-header-3': 'action',
      'scene-header-1': 'scene-header-3',
      'scene-header-2': 'scene-header-3'
    };
  
    return transitions[currentFormat] || 'action';
  };

  /**
   * Applies a semantic screenplay class to the block that currently contains the caret.
   *
   * @param {string} formatType - The screenplay format class to assign.
   * @returns {void} Updates the DOM element class and synchronizes internal state.
   */
  const applyFormatToCurrentLine = (formatType: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      
      if (element) {
        element.className = formatType;
        Object.assign(element.style, getFormatStyles(formatType));
        setCurrentFormat(formatType);
      }
    }
  };

  /**
   * Executes document editing commands such as bold or italic on the current selection.
   *
   * @param {string} command - The document.execCommand instruction to run.
   * @param {string} [value=''] - Optional value payload for the command.
   * @returns {void} Mutates the DOM selection with the requested formatting.
   */
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  /**
   * Synchronizes the editor HTML with component state and triggers dependent calculations.
   *
   * @returns {void} Persists the latest HTML snapshot and recalculates document metrics.
   */
  const updateContent = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const element = range.startContainer.parentElement;
        if (element) {
          setCurrentFormat(element.className || 'action');
        }
      }
      
      calculateStats();
    }
  };

  /**
   * Intercepts keyboard shortcuts to provide screenplay-aware formatting behavior.
   *
   * @param {React.KeyboardEvent} e - The keyboard event triggered by the user.
   * @returns {void} Prevents default behaviors and applies screenplay-aware formatting transitions.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextFormat = getNextFormatOnTab(currentFormat, e.shiftKey);
      applyFormatToCurrentLine(nextFormat);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const nextFormat = getNextFormatOnEnter(currentFormat);
      applyFormatToCurrentLine(nextFormat);
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
        case 'B':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          formatText('underline');
          break;
      }
    }
    
    // Small delay to ensure DOM updates before calculating stats
    setTimeout(updateContent, 10);
  };

  /**
   * Normalizes pasted content to plain text to preserve screenplay formatting integrity.
   *
   * @param {React.ClipboardEvent} e - The clipboard event fired when content is pasted.
   * @returns {void} Inserts sanitized text into the editor surface.
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  /**
   * Responds to editor mutations triggered by input events.
   *
   * @returns {void} Synchronizes component state with the latest editor markup.
   */
  const handleContentChange = () => {
    updateContent();
  };

  /**
   * Executes a search across the editor content using the advanced search engine helper.
   *
   * @returns {Promise<void>} Resolves after presenting the search results to the user.
   */
  const handleSearch = async () => {
    if (!searchTerm.trim() || !editorRef.current) return;
    
    const content = editorRef.current.innerText;
    const result = await searchEngine.current.searchInContent(content, searchTerm);
    
    if (result.success) {
      alert(`Found ${result.totalMatches} matches for "${searchTerm}"`);
    } else {
      alert(`Search failed: ${result.error}`);
    }
  };

  /**
   * Performs find-and-replace operations across the screenplay content.
   *
   * @returns {Promise<void>} Resolves after replacing matching instances and updating the editor.
   */
  const handleReplace = async () => {
    if (!searchTerm.trim() || !editorRef.current) return;

    const content = editorRef.current.innerText;
    const result = await searchEngine.current.replaceInContent(content, searchTerm, replaceTerm);

    if (result.success && editorRef.current) {
      const replacementsApplied = applyRegexReplacementToTextNodes(
        editorRef.current,
        result.patternSource as string,
        result.patternFlags as string,
        result.replaceText as string,
        result.replaceAll !== false
      );

      if (replacementsApplied > 0) {
        updateContent();
      }

      alert(`Replaced ${replacementsApplied} occurrences of "${searchTerm}" with "${replaceTerm}"`);
    } else {
      alert(`Replace failed: ${result.error}`);
    }
  };

  /**
   * Renames a character by replacing matching uppercase headings throughout the document.
   *
   * @returns {void} Applies the rename and closes the rename dialog when complete.
   */
  const handleCharacterRename = () => {
    if (!oldCharacterName.trim() || !newCharacterName.trim() || !editorRef.current) return;
    
    const regex = new RegExp(`^\\s*${oldCharacterName}\\s*$`, 'gmi');

    if (editorRef.current) {
      const replacementsApplied = applyRegexReplacementToTextNodes(
        editorRef.current,
        regex.source,
        regex.flags,
        newCharacterName.toUpperCase(),
        true
      );

      if (replacementsApplied > 0) {
        updateContent();
        alert(`Renamed character "${oldCharacterName}" to "${newCharacterName}" (${replacementsApplied})`);
        setShowCharacterRename(false);
        setOldCharacterName('');
        setNewCharacterName('');
      } else {
        alert(`لم يتم العثور على الشخصية "${oldCharacterName}" لإعادة تسميتها.`);
      }
    }
  };

  /**
   * Simulates an AI-powered review of the screenplay content and surfaces the findings.
   *
   * @returns {Promise<void>} Resolves after generating and displaying the mock review output.
   */
  const handleAIReview = async () => {
    if (!editorRef.current) return;
    
    setIsReviewing(true);
    const content = editorRef.current.innerText;
    
    try {
      // In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReview = `AI Review Results:
      
Strengths:
- Good character development
- Strong dialogue
- Clear scene structure

Areas for improvement:
- Consider adding more action descriptions
- Some dialogue could be more natural
- Scene transitions could be smoother

Suggestions:
- Add more sensory details to action lines
- Vary sentence structure in dialogue
- Ensure each scene has a clear purpose`;
      
      setReviewResult(mockReview);
    } catch (error) {
      setReviewResult(`AI review failed: ${error}`);
    } finally {
      setIsReviewing(false);
    }
  };

  /**
   * Switches between light and dark themes for the editor workspace.
   *
   * @returns {void} Flips the dark-mode state flag.
   */
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      // Set initial content
      editorRef.current.innerHTML = `
        <div class="basmala" style="${Object.entries(getFormatStyles('basmala')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          بسم الله الرحمن الرحيم
        </div>
        <div class="scene-header-top-line" style="${Object.entries(getFormatStyles('scene-header-top-line')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          <div>المؤلف: اسم المؤلف</div>
          <div>التاريخ: ${new Date().toLocaleDateString('ar')}</div>
        </div>
        <div class="scene-header-3" style="${Object.entries(getFormatStyles('scene-header-3')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          مشهد 1
        </div>
        <div class="action" style="${Object.entries(getFormatStyles('action')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          [وصف المشهد والأفعال هنا]
        </div>
        <div class="character" style="${Object.entries(getFormatStyles('character')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          الاسم
        </div>
        <div class="dialogue" style="${Object.entries(getFormatStyles('dialogue')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          [الحوار هنا]
        </div>
      `;
      
      updateContent();
    }
    
    // Set up auto-save
    autoSaveManager.current.setSaveCallback(async (content) => {
      // In a real implementation, this would save to a database or file
      console.log('Auto-saved content:', content);
    });
    autoSaveManager.current.startAutoSave();
    
    // Clean up
    return () => {
      autoSaveManager.current.stopAutoSave();
    };
  }, []);

  // Update stats when content changes
  useEffect(() => {
    calculateStats();
  }, [htmlContent]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <Film className="text-blue-500" />
            <h1 className="text-xl font-bold">محرر السيناريو العربي</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowFileMenu(!showFileMenu)}
                className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                ملف <ChevronDown size={16} className="mr-1" />
              </button>
              
              {showFileMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <FilePlus size={16} className="ml-2" /> جديد
                  </button>
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <FolderOpen size={16} className="ml-2" /> فتح
                  </button>
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Save size={16} className="ml-2" /> حفظ
                  </button>
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Download size={16} className="ml-2" /> تصدير
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowEditMenu(!showEditMenu)}
                className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                تحرير <ChevronDown size={16} className="mr-1" />
              </button>
              
              {showEditMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Undo size={16} className="ml-2" /> تراجع
                  </button>
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Redo size={16} className="ml-2" /> إعادة
                  </button>
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Scissors size={16} className="ml-2" /> قص
                  </button>
                  <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Copy size={16} className="ml-2" /> نسخ
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowFormatMenu(!showFormatMenu)}
                className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                تنسيق <ChevronDown size={16} className="mr-1" />
              </button>
              
              {showFormatMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                  <button 
                    onClick={() => applyFormatToCurrentLine('scene-header-top-line')}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    عنوان المشهد العلوي
                  </button>
                  <button 
                    onClick={() => applyFormatToCurrentLine('scene-header-3')}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    عنوان المشهد
                  </button>
                  <button 
                    onClick={() => applyFormatToCurrentLine('action')}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    وصف الأفعال
                  </button>
                  <button 
                    onClick={() => applyFormatToCurrentLine('character')}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    الشخصية
                  </button>
                  <button 
                    onClick={() => applyFormatToCurrentLine('dialogue')}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    الحوار
                  </button>
                  <button 
                    onClick={() => applyFormatToCurrentLine('transition')}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    الانتقال
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                أدوات <ChevronDown size={16} className="mr-1" />
              </button>
              
              {showToolsMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                  <button 
                    onClick={() => setShowSearchDialog(true)}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Search size={16} className="ml-2" /> بحث
                  </button>
                  <button 
                    onClick={() => setShowReplaceDialog(true)}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Replace size={16} className="ml-2" /> استبدال
                  </button>
                  <button 
                    onClick={() => setShowCharacterRename(true)}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <UserSquare size={16} className="ml-2" /> إعادة تسمية الشخصية
                  </button>
                  <button 
                    onClick={() => setShowReviewerDialog(true)}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Sparkles size={16} className="ml-2" /> مراجعة الذكاء الاصطناعي
                  </button>
                  <button 
                    onClick={() => setShowAgentsPopup(true)}
                    className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Brain size={16} className="ml-2" /> الوكلاء المتقدمة
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => window.print()}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="طباعة"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex">
        {/* Editor */}
        <div className="flex-1 p-4">
          <div 
            ref={editorRef}
            contentEditable
            className="min-h-[70vh] p-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
              fontSize: selectedSize,
              direction: 'rtl',
              lineHeight: '1.8'
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onInput={handleContentChange}
          />
        </div>
        
        {/* Sidebar */}
        <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">الإحصائيات</h3>
              <div className="space-y-1 text-sm">
                <div>الشخصيات: {documentStats.characters}</div>
                <div>الكلمات: {documentStats.words}</div>
                <div>الصفحات: {documentStats.pages}</div>
                <div>المشاهد: {documentStats.scenes}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">التنسيق</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">الخط</label>
                  <select 
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="Amiri">Amiri</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Tajawal">Tajawal</option>
                    <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">الحجم</label>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="12pt">صغير (12pt)</option>
                    <option value="14pt">متوسط (14pt)</option>
                    <option value="16pt">كبير (16pt)</option>
                    <option value="18pt">كبير جداً (18pt)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">العناصر السريعة</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => applyFormatToCurrentLine('scene-header-3')}
                  className="w-full text-right p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded flex items-center"
                >
                  <Hash size={16} className="ml-2" /> إضافة مشهد
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('character')}
                  className="w-full text-right p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded flex items-center"
                >
                  <UserSquare size={16} className="ml-2" /> إضافة شخصية
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('dialogue')}
                  className="w-full text-right p-2 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded flex items-center"
                >
                  <MessageCircle size={16} className="ml-2" /> إضافة حوار
                </button>
                <button 
                  onClick={() => applyFormatToCurrentLine('transition')}
                  className="w-full text-right p-2 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded flex items-center"
                >
                  <FastForward size={16} className="ml-2" /> إضافة انتقال
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      {showSearchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center">
                <Search className="ml-2" /> بحث
              </h3>
              <button onClick={() => setShowSearchDialog(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">كلمة البحث</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="أدخل النص للبحث عنه"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowSearchDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  بحث
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace Dialog */}
      {showReplaceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center">
                <Replace className="ml-2" /> بحث واستبدال
              </h3>
              <button onClick={() => setShowReplaceDialog(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">البحث عن</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="أدخل النص للبحث عنه"
                />
              </div>
              
              <div>
                <label className="block mb-1">استبدال بـ</label>
                <input
                  type="text"
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="أدخل النص البديل"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowReplaceDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleReplace}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  استبدال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character Rename Dialog */}
      {showCharacterRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center">
                <UserSquare className="ml-2" /> إعادة تسمية الشخصية
              </h3>
              <button onClick={() => setShowCharacterRename(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">الاسم الحالي</label>
                <input
                  type="text"
                  value={oldCharacterName}
                  onChange={(e) => setOldCharacterName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="أدخل الاسم الحالي"
                />
              </div>
              
              <div>
                <label className="block mb-1">الاسم الجديد</label>
                <input
                  type="text"
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="أدخل الاسم الجديد"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowCharacterRename(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleCharacterRename}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  إعادة تسمية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Reviewer Dialog */}
      {showReviewerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-1/2 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center">
                <Sparkles className="ml-2" /> مراجعة الذكاء الاصطناعي
              </h3>
              <button onClick={() => setShowReviewerDialog(false)}>
                <X size={20} />
              </button>
            </div>
            
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>جاري تحليل النص باستخدام الذكاء الاصطناعي...</p>
              </div>
            ) : reviewResult ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded whitespace-pre-line">
                  {reviewResult}
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowReviewerDialog(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>هل تريد مراجعة النص باستخدام الذكاء الاصطناعي؟</p>
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setShowReviewerDialog(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleAIReview}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    مراجعة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Agents Popup */}
      <AdvancedAgentsPopup 
        isOpen={showAgentsPopup}
        onClose={() => setShowAgentsPopup(false)}
        content={editorRef.current?.innerText || ''}
      />
    </div>
  );
};

export default CleanIntegratedScreenplayEditor;
