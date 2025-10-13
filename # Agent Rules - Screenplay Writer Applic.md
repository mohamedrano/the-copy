# Agent Rules - Screenplay Writer Application

## Project Context
Professional Arabic screenplay writing application with AI assistance, built with Vite, ES6 modules, and event-driven architecture.

## Core Principles

### 1. Architecture Adherence
- **ES6 Modules Only**: Use `import`/`export` syntax exclusively
- **Event-Driven**: All module communication via EventBus
- **Class-Based**: Components as ES6 classes with constructor pattern
- **Initialization Guard**: Use `isInitialized` flag to prevent double initialization

### 2. Code Quality Standards
- **JSDoc Required**: Comprehensive documentation for all classes and methods
- **Arabic Comments**: Use Arabic for inline comments and descriptions
- **Type Safety**: Define `@typedef` for complex configuration objects
- **Error Handling**: Wrap event listeners in try-catch blocks

### 3. File Organization
```
src/
├── core/           # Essential application logic
├── features/       # Independent feature modules
├── libraries/      # Reusable utility classes
├── ui/components/  # UI components
└── styles/         # CSS modules
```

## Development Guidelines

### Module Structure Pattern
```javascript
export default class ModuleName {
    constructor(eventBus, config) {
        this.eventBus = eventBus;
        this.config = config;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        // Setup logic here
        this.isInitialized = true;
        console.log("ModuleName initialized.");
    }
}
```

### Event System Usage
- **Subscribe**: `this.eventBus.on('event:name', handler)`
- **Emit**: `this.eventBus.emit('event:name', data)`
- **One-time**: `this.eventBus.once('app:ready', handler)`
- **Naming**: Use kebab-case with namespace (e.g., `editor:contentChanged`)

### Import/Export Patterns
- **Default Export**: Main classes
- **Named Exports**: Utilities and constants
- **Path Aliases**: Use `@/` for src imports, `@css/` for styles

### Performance Optimization
- **Debouncing**: Use `Utilities.debounce()` for expensive operations (2s for AI, 500ms for UI)
- **Memory Management**: Implement cleanup methods and stack limits (50 for undo/redo)
- **DOM Caching**: Cache elements in constructor/init

## Feature Development Rules

### AI Integration
- **API Keys**: Use `import.meta.env.VITE_GEMINI_API_KEY`
- **Debounced Requests**: 1.5s default for AI calls
- **Error Boundaries**: Proper error handling for API failures
- **Configuration**: Centralized in `config.js`

### Analytics & Statistics
- **Real-time Updates**: Word count, character count, page estimates
- **Debounced Updates**: 500ms for status bar
- **Chart.js Integration**: For visual analytics

### Export System
- **Multiple Formats**: PDF, DOCX, HTML support
- **Professional Templates**: Custom PDF layouts
- **Batch Operations**: Multiple file exports

### Character Management
- **Tracking**: Character appearances and dialogue
- **Analysis**: Character development metrics
- **Visualization**: Character relationship charts

## Code Standards

### Naming Conventions
- **Classes**: PascalCase (`AnalyticsEngine`, `MainApplication`)
- **Methods**: camelCase (`calculateWordCount`, `analyzeSceneHeading`)
- **Constants**: UPPER_SNAKE_CASE (`APP_CONFIG`, `FORMATTING_KEYS`)
- **Files**: kebab-case (`character-manager.js`, `ai-assistant.js`)

### Error Handling
- **Graceful Degradation**: Check element existence before manipulation
- **Console Logging**: Descriptive messages for initialization and errors
- **User Feedback**: Use NotificationManager for user-facing errors

### Theme & UI
- **RTL Support**: Ensure Arabic text handling
- **Theme Toggle**: Dark/light mode support
- **Keyboard Shortcuts**: Ctrl+0-8 for formatting
- **Accessibility**: Keyboard navigation throughout

## Build & Deployment

### Environment Configuration
```javascript
// Required environment variables
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_MODEL=gemini-2.5-pro
VITE_APP_NAME=Screenplay Writer
VITE_APP_VERSION=1.0.0
```

### Build Optimization
- **Code Splitting**: vendor, core, features chunks
- **Minification**: Terser for production
- **Sourcemaps**: Enabled for debugging
- **Asset Optimization**: Images and fonts compressed

### Development Workflow
- **Hot Reload**: Vite HMR for instant updates
- **Linting**: ESLint 8.56.0 for code quality
- **Formatting**: Prettier 3.1.1 for consistency
- **Testing**: Manual testing with comprehensive scenarios

## Security & Privacy

### Data Protection
- **Local Storage**: Client-side data persistence only
- **API Security**: Environment variables for sensitive data
- **Input Sanitization**: Validate all user content
- **No Credentials**: Never hardcode API keys or tokens

### Content Security
- **XSS Protection**: Sanitize HTML content
- **HTTPS Required**: For production deployment
- **Privacy**: No user data collection or tracking

## Maintenance Rules

### Code Review Checklist
- [ ] ES6 modules with proper imports/exports
- [ ] JSDoc documentation complete
- [ ] Error handling implemented
- [ ] EventBus pattern followed
- [ ] Performance optimizations applied
- [ ] Arabic RTL support maintained
- [ ] Keyboard shortcuts functional
- [ ] Build process successful

### Refactoring Guidelines
- **Incremental Changes**: Small, testable modifications
- **Backward Compatibility**: Don't break existing functionality
- **Documentation Updates**: Keep docs in sync with code
- **Performance Monitoring**: Track memory usage and load times

## Testing Strategy

### Manual Testing Requirements
- **Core Features**: Editor, formatting, save/load
- **AI Integration**: Content generation and analysis
- **Export Functions**: PDF, DOCX, HTML outputs
- **Analytics**: Statistics and visualizations
- **Cross-browser**: Chrome, Firefox, Safari support

### Performance Benchmarks
- **Load Time**: < 3 seconds initial load
- **Memory Usage**: < 100MB for typical screenplay
- **Response Time**: < 500ms for UI interactions
- **Build Time**: < 30 seconds for production build

## Troubleshooting Guide

### Common Issues
- **Build Failures**: Check dependencies and environment variables
- **HMR Not Working**: Restart dev server, check console errors
- **AI Not Responding**: Verify API key and internet connection
- **Export Errors**: Check file permissions and disk space

### Debug Tools
- **Console Logging**: Use descriptive messages with module names
- **Network Tab**: Monitor API requests and responses
- **Performance Tab**: Profile memory usage and load times
- **Vite Inspector**: Use built-in development tools

---

*Follow these rules to maintain code quality, performance, and user experience in the Screenplay Writer application.*