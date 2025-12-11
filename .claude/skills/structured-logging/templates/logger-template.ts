/**
 * 構造化ロギング実装テンプレート
 *
 * このテンプレートは、JSON形式の構造化ログを実装するための
 * 基本的なロガークラスとユーティリティ関数を提供します。
 */

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// ============================================================
// Type Definitions
// ============================================================

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

interface BaseLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
}

interface TraceableLogEntry extends BaseLogEntry {
  request_id: string;
  trace_id?: string;
  span_id?: string;
  user_id?: string;
  session_id?: string;
}

interface ErrorLogEntry extends TraceableLogEntry {
  error: {
    type: string;
    message: string;
    code?: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
}

// ============================================================
// PII Masking Utilities
// ============================================================

/**
 * メールアドレスをマスキング
 * 例: john.doe@example.com → j***e@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * 電話番号をマスキング
 * 例: +1-555-123-4567 → ***-***-***-4567
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const lastFour = digits.slice(-4);
  return `***-***-***-${lastFour}`;
}

/**
 * IPアドレスをマスキング
 * 例: 192.168.1.100 → 192.168.1.***
 */
export function maskIP(ip: string): string {
  if (ip.includes(".")) {
    // IPv4
    const parts = ip.split(".");
    return `${parts.slice(0, 3).join(".")}.***`;
  } else {
    // IPv6
    const parts = ip.split(":");
    return `${parts.slice(0, 3).join(":")}:****:****:****:****:****`;
  }
}

/**
 * ユーザーIDをハッシュ化
 */
export function hashUserId(userId: string): string {
  return crypto.createHash("sha256").update(userId).digest("hex");
}

/**
 * PIIフィールドを自動マスキング
 */
export function autoMaskPII(data: Record<string, any>): Record<string, any> {
  const masked = { ...data };
  const PII_FIELDS = ["email", "phone", "ssn", "credit_card", "password"];

  for (const field of PII_FIELDS) {
    if (masked[field]) {
      if (field === "email") {
        masked[field] = maskEmail(masked[field]);
      } else if (field === "phone") {
        masked[field] = maskPhone(masked[field]);
      } else {
        masked[field] = "***";
      }
    }
  }

  return masked;
}

// ============================================================
// Logger Class
// ============================================================

export class StructuredLogger {
  private service: string;
  private environment: string;
  private minLevel: LogLevel;
  private levelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4,
  };

  constructor(config: {
    service: string;
    environment?: string;
    minLevel?: LogLevel;
  }) {
    this.service = config.service;
    this.environment =
      config.environment || process.env.NODE_ENV || "development";
    this.minLevel = config.minLevel || this.getDefaultLevel();
  }

  private getDefaultLevel(): LogLevel {
    switch (this.environment) {
      case "development":
        return "DEBUG";
      case "staging":
        return "INFO";
      case "production":
        return "INFO";
      default:
        return "INFO";
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): TraceableLogEntry | ErrorLogEntry {
    const baseLog: TraceableLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.environment,
      request_id: this.getRequestId(),
      trace_id: this.getTraceId(),
      user_id: this.getUserId(),
      session_id: this.getSessionId(),
    };

    if (error) {
      return {
        ...baseLog,
        error: {
          type: error.constructor.name,
          message: error.message,
          code: (error as any).code,
          stack: error.stack,
        },
        context: context ? autoMaskPII(context) : undefined,
      } as ErrorLogEntry;
    }

    if (context) {
      return {
        ...baseLog,
        ...autoMaskPII(context),
      };
    }

    return baseLog;
  }

  private output(logEntry: TraceableLogEntry | ErrorLogEntry): void {
    // JSON形式で1行出力
    console.log(JSON.stringify(logEntry));
  }

  // AsyncLocalStorageやコンテキスト管理システムから取得
  private getRequestId(): string {
    // 実装例: AsyncLocalStorageから取得
    return uuidv4();
  }

  private getTraceId(): string | undefined {
    // 実装例: OpenTelemetryから取得
    return undefined;
  }

  private getUserId(): string | undefined {
    // 実装例: 認証コンテキストから取得
    return undefined;
  }

  private getSessionId(): string | undefined {
    // 実装例: セッション管理から取得
    return undefined;
  }

  // ============================================================
  // Public API
  // ============================================================

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("DEBUG")) return;
    this.output(this.formatLog("DEBUG", message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("INFO")) return;
    this.output(this.formatLog("INFO", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("WARN")) return;
    this.output(this.formatLog("WARN", message, context));
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog("ERROR")) return;
    this.output(this.formatLog("ERROR", message, context, error));
  }

  fatal(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog("FATAL")) return;
    this.output(this.formatLog("FATAL", message, context, error));

    // FATALレベルはシステム停止を伴う可能性
    // 必要に応じて process.exit(1) 等を呼び出す
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// ============================================================
// Usage Examples
// ============================================================

// ロガーインスタンス作成
const logger = new StructuredLogger({
  service: "api-server",
  environment: "production",
  minLevel: "INFO",
});

// 基本的なログ出力
logger.info("Application started", { port: 3000, version: "1.0.0" });

// エラーログ出力
try {
  await database.query("SELECT * FROM users");
} catch (error) {
  logger.error("Database query failed", error as Error, {
    query: "SELECT * FROM users",
    table: "users",
  });
}

// ビジネスイベントログ
logger.info("Order completed", {
  order_id: "ord_123",
  user_id: "user_456",
  total_amount: 1234.56,
  currency: "USD",
});

// 警告ログ
logger.warn("Rate limit approaching", {
  user_id: "user_789",
  current_requests: 95,
  limit: 100,
  window_seconds: 60,
});
