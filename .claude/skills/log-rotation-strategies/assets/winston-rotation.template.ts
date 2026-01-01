/**
 * Winston Log Rotation Template
 *
 * Winstonを使用したログローテーション設定テンプレート。
 * 構造化ログ、複数トランスポート、環境別設定をサポート。
 *
 * 使用方法:
 *   1. 依存関係をインストール: pnpm install winston winston-daily-rotate-file
 *   2. このファイルをプロジェクトにコピー
 *   3. 設定をカスタマイズ
 *
 * @example
 * import { createLogger } from './winston-rotation';
 * const logger = createLogger({ service: 'my-app' });
 * logger.info('Application started', { port: 3000 });
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// ============================================================
// 型定義
// ============================================================

type LogLevel = "error" | "warn" | "info" | "http" | "debug";

interface LoggerConfig {
  /** サービス名 */
  service: string;
  /** 環境（development, staging, production） */
  environment?: string;
  /** ログディレクトリ */
  logDir?: string;
  /** ログレベル */
  level?: LogLevel;
  /** JSON形式を使用 */
  json?: boolean;
  /** コンソール出力を有効化 */
  console?: boolean;
  /** ファイル出力を有効化 */
  file?: boolean;
  /** ローテーション設定 */
  rotation?: RotationConfig;
}

interface RotationConfig {
  /** 最大ファイルサイズ（例: '20m', '100k'） */
  maxSize?: string;
  /** 最大保持期間（例: '14d', '30d'） */
  maxFiles?: string;
  /** 圧縮を有効化 */
  compress?: boolean;
  /** 日付パターン */
  datePattern?: string;
}

interface LogMeta {
  [key: string]: unknown;
}

// ============================================================
// デフォルト設定
// ============================================================

const defaults: Required<LoggerConfig> = {
  service: "app",
  environment: process.env.NODE_ENV || "development",
  logDir: "./logs",
  level: "info",
  json: true,
  console: true,
  file: true,
  rotation: {
    maxSize: "20m",
    maxFiles: "14d",
    compress: true,
    datePattern: "YYYY-MM-DD",
  },
};

// ============================================================
// フォーマッター
// ============================================================

/**
 * タイムスタンプフォーマット
 */
const timestampFormat = winston.format.timestamp({
  format: "YYYY-MM-DDTHH:mm:ss.SSSZ",
});

/**
 * エラースタックトレースフォーマット
 */
const errorFormat = winston.format((info) => {
  if (info.error instanceof Error) {
    return {
      ...info,
      error: {
        name: info.error.name,
        message: info.error.message,
        stack: info.error.stack,
      },
    };
  }
  return info;
});

/**
 * JSONフォーマット
 */
const jsonFormat = winston.format.combine(
  timestampFormat,
  errorFormat(),
  winston.format.json(),
);

/**
 * コンソール用カラーフォーマット
 */
const consoleFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
  }),
);

// ============================================================
// トランスポート作成
// ============================================================

/**
 * コンソールトランスポートを作成
 */
function createConsoleTransport(level: LogLevel): winston.transport {
  return new winston.transports.Console({
    level,
    format: consoleFormat,
  });
}

/**
 * ファイルトランスポートを作成（ローテーション付き）
 */
function createFileTransport(
  config: Required<LoggerConfig>,
  logType: "combined" | "error",
): DailyRotateFile {
  const filename =
    logType === "error"
      ? path.join(config.logDir, "error-%DATE%.log")
      : path.join(config.logDir, "app-%DATE%.log");

  return new DailyRotateFile({
    filename,
    datePattern: config.rotation.datePattern,
    maxSize: config.rotation.maxSize,
    maxFiles: config.rotation.maxFiles,
    zippedArchive: config.rotation.compress,
    level: logType === "error" ? "error" : config.level,
    format: jsonFormat,
    // 監査ファイル
    auditFile: path.join(config.logDir, `audit-${logType}.json`),
  });
}

// ============================================================
// ロガー作成
// ============================================================

/**
 * Winstonロガーを作成
 *
 * @example
 * const logger = createLogger({
 *   service: 'api-server',
 *   level: 'debug',
 *   rotation: { maxFiles: '30d' }
 * });
 */
export function createLogger(options: LoggerConfig): winston.Logger {
  const config: Required<LoggerConfig> = {
    ...defaults,
    ...options,
    rotation: {
      ...defaults.rotation,
      ...options.rotation,
    },
  };

  const transports: winston.transport[] = [];

  // コンソールトランスポート
  if (config.console) {
    transports.push(createConsoleTransport(config.level));
  }

  // ファイルトランスポート
  if (config.file) {
    // 全ログ
    transports.push(createFileTransport(config, "combined"));
    // エラーログ（別ファイル）
    transports.push(createFileTransport(config, "error"));
  }

  const logger = winston.createLogger({
    level: config.level,
    defaultMeta: {
      service: config.service,
      environment: config.environment,
      pid: process.pid,
    },
    transports,
    // 例外とリジェクションをキャッチ
    exceptionHandlers: config.file
      ? [
          new DailyRotateFile({
            filename: path.join(config.logDir, "exceptions-%DATE%.log"),
            datePattern: config.rotation.datePattern,
            maxFiles: config.rotation.maxFiles,
            zippedArchive: config.rotation.compress,
          }),
        ]
      : undefined,
    rejectionHandlers: config.file
      ? [
          new DailyRotateFile({
            filename: path.join(config.logDir, "rejections-%DATE%.log"),
            datePattern: config.rotation.datePattern,
            maxFiles: config.rotation.maxFiles,
            zippedArchive: config.rotation.compress,
          }),
        ]
      : undefined,
  });

  return logger;
}

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * リクエストコンテキスト付きロガーを作成
 */
export function createRequestLogger(
  logger: winston.Logger,
  requestId: string,
  userId?: string,
): winston.Logger {
  return logger.child({
    requestId,
    userId,
  });
}

/**
 * ログレベルを動的に変更
 */
export function setLogLevel(logger: winston.Logger, level: LogLevel): void {
  logger.level = level;
  logger.transports.forEach((transport) => {
    if (transport.level !== "error") {
      transport.level = level;
    }
  });
  logger.info(`Log level changed to: ${level}`);
}

/**
 * シグナルでログレベルを切り替え
 */
export function enableDynamicLogLevel(logger: winston.Logger): void {
  process.on("SIGUSR2", () => {
    const newLevel = logger.level === "info" ? "debug" : "info";
    setLogLevel(logger, newLevel as LogLevel);
  });

  logger.info("Dynamic log level enabled (send SIGUSR2 to toggle)");
}

// ============================================================
// Expressミドルウェア
// ============================================================

/**
 * Expressリクエストロギングミドルウェア
 *
 * @example
 * app.use(createHttpLogger(logger));
 */
export function createHttpLogger(logger: winston.Logger) {
  return (
    req: { method: string; url: string; headers: Record<string, string> },
    res: {
      statusCode: number;
      on: (event: string, handler: () => void) => void;
    },
    next: () => void,
  ) => {
    const start = Date.now();
    const requestId = req.headers["x-request-id"] || generateRequestId();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const level =
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "http";

      logger.log(level, "HTTP Request", {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
    });

    next();
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// 使用例
// ============================================================

/*
import { createLogger, createHttpLogger, enableDynamicLogLevel } from './winston-rotation';

// ロガー作成
const logger = createLogger({
  service: 'my-api',
  level: process.env.LOG_LEVEL as LogLevel || 'info',
  rotation: {
    maxSize: '50m',
    maxFiles: '30d',
    compress: true,
  },
});

// 動的ログレベル有効化
enableDynamicLogLevel(logger);

// Expressミドルウェア
app.use(createHttpLogger(logger));

// 基本的なログ出力
logger.info('Application started', { port: 3000 });
logger.error('Database connection failed', {
  error: new Error('Connection timeout'),
  host: 'localhost',
});

// リクエストコンテキスト付きログ
app.get('/api/users', (req, res) => {
  const reqLogger = createRequestLogger(logger, req.id, req.user?.id);
  reqLogger.info('Fetching users');
  // ...
});
*/

export default createLogger;
