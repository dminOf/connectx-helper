import { existsSync, mkdirSync, writeFileSync, appendFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { LoggerConfig } from './config-loader';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger class for managing application logs
 */
class Logger {
  private config: LoggerConfig | null = null;
  private currentLogFile: string | null = null;
  private currentLogSize: number = 0;
  private maskingPatterns: RegExp[] = [];
  private isInitialized: boolean = false;

  /**
   * Initialize the logger with configuration
   */
  init(config: LoggerConfig): void {
    this.config = config;
    this.isInitialized = true;

    // Ensure log directory exists
    const logDir = resolve(config.LogDir);
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    // Compile masking regex patterns
    this.maskingPatterns = config.MaskingRegexPatterns.map((pattern) => new RegExp(pattern, 'g'));

    // Create initial log file
    this.rotateLogFile();

    // Clean up old log files
    this.cleanupOldLogs();

    this.info('Logger initialized', {
      logDir: config.LogDir,
      logFile: config.LogFileName,
      maxSizeMB: config.MaxSizeMB,
      maxBackups: config.MaxBackups,
      maxAgeDays: config.MaxAgeDays,
    });
  }

  /**
   * Apply masking to sensitive data in log messages
   */
  private maskSensitiveData(message: string): string {
    let masked = message;
    for (const pattern of this.maskingPatterns) {
      masked = masked.replace(pattern, (match) => '*'.repeat(match.length));
    }
    return masked;
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: string, message: string, metadata?: any): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (metadata) {
      const metadataStr = typeof metadata === 'object' ? JSON.stringify(metadata, null, 2) : String(metadata);
      logMessage += `\n  Metadata: ${metadataStr}`;
    }

    return this.maskSensitiveData(logMessage);
  }

  /**
   * Write log message to file and optionally console
   */
  private writeLog(level: string, message: string, metadata?: any): void {
    if (!this.isInitialized || !this.config) {
      console.warn('Logger not initialized. Call init() first.');
      return;
    }

    const formattedMessage = this.formatMessage(level, message, metadata);

    // Write to console if enabled
    if (this.config.ToConsole) {
      const consoleMethod = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
      consoleMethod(formattedMessage);
    }

    // Write to file
    if (this.currentLogFile) {
      const messageWithNewline = formattedMessage + '\n';
      appendFileSync(this.currentLogFile, messageWithNewline, 'utf-8');
      this.currentLogSize += Buffer.byteLength(messageWithNewline, 'utf-8');

      // Check if rotation is needed
      const maxSizeBytes = this.config.MaxSizeMB * 1024 * 1024;
      if (this.currentLogSize >= maxSizeBytes) {
        this.rotateLogFile();
      }
    }
  }

  /**
   * Rotate log file when size limit is reached
   */
  private rotateLogFile(): void {
    if (!this.config) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `${this.config.LogFileName}${timestamp}.log`;
    const logDir = resolve(this.config.LogDir);
    this.currentLogFile = join(logDir, logFileName);
    this.currentLogSize = 0;

    // Create the new log file
    writeFileSync(this.currentLogFile, '', 'utf-8');

    // Compress old log file if enabled
    // Note: For simplicity, we're not implementing actual compression here
    // In production, you might want to use a library like zlib or pako

    this.cleanupOldLogs();
  }

  /**
   * Clean up old log files based on MaxBackups and MaxAgeDays
   */
  private cleanupOldLogs(): void {
    if (!this.config) return;

    const logDir = resolve(this.config.LogDir);
    if (!existsSync(logDir)) return;

    const files = readdirSync(logDir)
      .filter((file) => file.startsWith(this.config!.LogFileName) && file.endsWith('.log'))
      .map((file) => ({
        name: file,
        path: join(logDir, file),
        stat: statSync(join(logDir, file)),
      }))
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs); // Sort by modified time, newest first

    const now = Date.now();
    const maxAgeMs = this.config.MaxAgeDays * 24 * 60 * 60 * 1000;

    // Remove files older than MaxAgeDays
    for (const file of files) {
      const age = now - file.stat.mtimeMs;
      if (age > maxAgeMs) {
        try {
          unlinkSync(file.path);
          console.log(`Removed old log file: ${file.name}`);
        } catch (error) {
          console.error(`Failed to remove old log file ${file.name}:`, error);
        }
      }
    }

    // Keep only MaxBackups files
    if (files.length > this.config.MaxBackups) {
      const filesToRemove = files.slice(this.config.MaxBackups);
      for (const file of filesToRemove) {
        try {
          unlinkSync(file.path);
          console.log(`Removed excess log file: ${file.name}`);
        } catch (error) {
          console.error(`Failed to remove excess log file ${file.name}:`, error);
        }
      }
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: any): void {
    this.writeLog('DEBUG', message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: any): void {
    this.writeLog('INFO', message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: any): void {
    this.writeLog('WARN', message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, metadata?: any): void {
    this.writeLog('ERROR', message, metadata);
  }

  /**
   * Check if logger is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * Global logger instance
 */
const logger = new Logger();

/**
 * Initialize the global logger
 */
export function initLogger(config: LoggerConfig): void {
  logger.init(config);
}

/**
 * Export the logger instance
 */
export { logger };
