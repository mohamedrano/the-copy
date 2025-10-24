/**
 * Production-Safe Logging Service
 * Replaces console statements with proper logging levels
 */

// =====================================================
// Logging Levels
// =====================================================

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// =====================================================
// Logger Interface
// =====================================================

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  source?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  enableAnalytics: boolean;
}

// =====================================================
// Logger Service
// =====================================================

class LoggerService {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    this.config = {
      level: this.getLogLevelFromEnv(),
      enableConsole: process.env.NODE_ENV !== "production",
      enableSentry: process.env.NODE_ENV === "production",
      enableAnalytics: process.env.NODE_ENV === "production",
    };
  }

  private getLogLevelFromEnv(): LogLevel {
    try {
      const level = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase();
      switch (level) {
        case "error":
          return LogLevel.ERROR;
        case "warn":
          return LogLevel.WARN;
        case "info":
          return LogLevel.INFO;
        case "debug":
          return LogLevel.DEBUG;
        default:
          return process.env.NODE_ENV === "production"
            ? LogLevel.WARN
            : LogLevel.INFO;
      }
    } catch {
      return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: any
  ): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${levelName}: ${message}${contextStr}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private sendToSentry(entry: LogEntry): void {
    if (!this.config.enableSentry) return;

    try {
      // Import Sentry dynamically to avoid issues if not available
      import("@sentry/react")
        .then(({ captureMessage, captureException }) => {
          if (entry.level === LogLevel.ERROR) {
            if (entry.context instanceof Error) {
              captureException(entry.context);
            } else {
              captureMessage(entry.message, "error");
            }
          }
        })
        .catch(() => {
          // Sentry not available, ignore
        });
    } catch {
      // Ignore errors in logging
    }
  }

  private sendToAnalytics(entry: LogEntry): void {
    if (!this.config.enableAnalytics) return;

    try {
      // Send to analytics service
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "log", {
          event_category: "system",
          event_label: LogLevel[entry.level],
          value: 1,
          custom_map: {
            message: entry.message,
            source: entry.source,
          },
        });
      }
    } catch {
      // Ignore analytics errors
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: any,
    source?: string
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      source: source ?? "",
    };

    // Add to buffer
    this.addToBuffer(entry);

    // Console output (development only)
    if (this.config.enableConsole) {
      const formatted = this.formatMessage(level, message, context);

      switch (level) {
        case LogLevel.ERROR:
          console.error(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
      }
    }

    // Send to external services
    this.sendToSentry(entry);
    this.sendToAnalytics(entry);
  }

  // =====================================================
  // Public API
  // =====================================================

  error(message: string, context?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, context, source);
  }

  warn(message: string, context?: any, source?: string): void {
    this.log(LogLevel.WARN, message, context, source);
  }

  info(message: string, context?: any, source?: string): void {
    this.log(LogLevel.INFO, message, context, source);
  }

  debug(message: string, context?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, context, source);
  }

  // =====================================================
  // Utility Methods
  // =====================================================

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// =====================================================
// Singleton Instance
// =====================================================

const logger = new LoggerService();

// =====================================================
// Public API
// =====================================================

export const log = {
  error: (message: string, context?: any, source?: string) =>
    logger.error(message, context, source),
  warn: (message: string, context?: any, source?: string) =>
    logger.warn(message, context, source),
  info: (message: string, context?: any, source?: string) =>
    logger.info(message, context, source),
  debug: (message: string, context?: any, source?: string) =>
    logger.debug(message, context, source),
  getLogs: (level?: LogLevel) => logger.getLogs(level),
  clearLogs: () => logger.clearLogs(),
  setLevel: (level: LogLevel) => logger.setLevel(level),
  getConfig: () => logger.getConfig(),
};

export { LoggerService };
export default log;
