/**
 * Structured Logger Template
 *
 * A production-ready structured logging implementation
 * for Next.js and Node.js applications.
 */

// ============================================
// Types
// ============================================

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  service?: string;
  environment?: string;
  [key: string]: unknown;
}

interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: ErrorInfo;
  duration?: number;
  [key: string]: unknown;
}

// ============================================
// Configuration
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const DEFAULT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const SERVICE_NAME = process.env.SERVICE_NAME || 'app';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// ============================================
// Sensitive Data Handling
// ============================================

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'creditcard',
  'credit_card',
  'ssn',
];

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitize(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ============================================
// Logger Implementation
// ============================================

class Logger {
  private baseContext: LogContext;
  private minLevel: number;

  constructor(context: LogContext = {}) {
    this.baseContext = {
      service: SERVICE_NAME,
      environment: ENVIRONMENT,
      ...context,
    };
    this.minLevel = LOG_LEVELS[DEFAULT_LOG_LEVEL];
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= this.minLevel;
  }

  private formatEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.baseContext,
    };

    if (data) {
      const { error, ...rest } = data;

      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }

      Object.assign(entry, sanitize(rest));
    }

    return entry;
  }

  private write(entry: LogEntry): void {
    // In production, output single-line JSON for log aggregation
    if (ENVIRONMENT === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      // In development, pretty print for readability
      const { timestamp, level, message, ...rest } = entry;
      const prefix = `[${timestamp}] ${level.toUpperCase().padEnd(5)}`;
      console.log(`${prefix} ${message}`);
      if (Object.keys(rest).length > 0) {
        console.log(JSON.stringify(rest, null, 2));
      }
    }
  }

  error(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      this.write(this.formatEntry('error', message, data));
    }
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      this.write(this.formatEntry('warn', message, data));
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.write(this.formatEntry('info', message, data));
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.write(this.formatEntry('debug', message, data));
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({
      ...this.baseContext,
      ...context,
    });
  }

  /**
   * Time a function and log its duration
   */
  async time<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.info(`${name} completed`, { duration: Date.now() - start });
      return result;
    } catch (error) {
      this.error(`${name} failed`, { error, duration: Date.now() - start });
      throw error;
    }
  }
}

// ============================================
// Default Export
// ============================================

export const logger = new Logger();

// ============================================
// Request Logger Factory
// ============================================

export function createRequestLogger(req: {
  correlationId?: string;
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  url?: string;
}): Logger {
  const correlationId =
    req.correlationId ||
    (req.headers?.['x-correlation-id'] as string) ||
    crypto.randomUUID();

  return logger.child({
    correlationId,
    method: req.method,
    path: req.url,
  });
}

// ============================================
// Express/Connect Middleware
// ============================================

export function loggingMiddleware(
  req: { method: string; url: string; headers: Record<string, string | string[] | undefined> },
  res: { on: (event: string, cb: () => void) => void; statusCode: number },
  next: () => void
): void {
  const start = Date.now();
  const requestLogger = createRequestLogger(req);

  requestLogger.info('Request started', {
    userAgent: req.headers['user-agent'],
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    requestLogger[level]('Request completed', {
      status: res.statusCode,
      duration,
    });
  });

  next();
}

// ============================================
// Usage Examples
// ============================================

/*
// Basic usage
import { logger } from './logger';

logger.info('Application started');
logger.error('Database connection failed', { error: new Error('Connection refused') });

// With context
const userLogger = logger.child({ userId: '123' });
userLogger.info('User logged in');

// Request logging
import { createRequestLogger } from './logger';

export async function GET(request: Request) {
  const log = createRequestLogger(request);

  log.info('Processing request');

  try {
    const result = await someOperation();
    log.info('Request successful', { result });
    return Response.json(result);
  } catch (error) {
    log.error('Request failed', { error });
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Timing operations
await logger.time('Database query', async () => {
  return await db.query('SELECT * FROM users');
});
*/
