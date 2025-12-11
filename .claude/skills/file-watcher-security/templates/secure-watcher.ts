/**
 * セキュアファイル監視システム
 *
 * パストラバーサル防止、シンボリックリンク検証、レート制限を
 * 統合したセキュアなファイル監視の実装例
 */

import * as path from "path";
import * as fs from "fs/promises";
import { Stats } from "fs";
import { EventEmitter } from "events";

// ============================================================
// 型定義
// ============================================================

export interface SecurityConfig {
  /** 許可されたベースディレクトリ */
  allowedDirs: string[];
  /** 拒否するファイルパターン */
  deniedPatterns: RegExp[];
  /** シンボリックリンクポリシー */
  symlinkPolicy: "allow" | "verify" | "deny";
  /** シンボリックリンク許可ターゲット（verify時） */
  symlinkAllowedTargets?: string[];
  /** レート制限設定 */
  rateLimit: {
    maxEvents: number;
    windowMs: number;
  };
  /** ディレクトリ別クォータ */
  quotas?: Record<string, number>;
  /** 監査ログ有効化 */
  auditLog: boolean;
}

export interface SecurityEvent {
  type: "blocked" | "warning" | "allowed";
  reason: string;
  path: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  normalizedPath?: string;
  error?: string;
  securityEvent?: SecurityEvent;
}

// ============================================================
// デフォルト設定
// ============================================================

const DEFAULT_DENIED_PATTERNS: RegExp[] = [
  /\.env$/,
  /\.env\.\w+$/,
  /\.git\//,
  /\.ssh\//,
  /node_modules\//,
  /\.pem$/,
  /id_rsa/,
  /credentials\.(json|yaml|yml)$/,
];

const DEFAULT_CONFIG: SecurityConfig = {
  allowedDirs: [],
  deniedPatterns: DEFAULT_DENIED_PATTERNS,
  symlinkPolicy: "verify",
  rateLimit: {
    maxEvents: 1000,
    windowMs: 1000,
  },
  auditLog: true,
};

// ============================================================
// セキュリティエラー
// ============================================================

export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

// ============================================================
// パス検証クラス
// ============================================================

export class PathValidator {
  private normalizedAllowedDirs: string[];

  constructor(private config: SecurityConfig) {
    this.normalizedAllowedDirs = config.allowedDirs.map((dir) =>
      path.resolve(path.normalize(dir)),
    );
  }

  /**
   * パスを検証し、正規化されたパスを返す
   */
  async validate(inputPath: string): Promise<ValidationResult> {
    try {
      // Step 1: 疑わしいパターンをチェック
      const suspiciousCheck = this.checkSuspiciousPatterns(inputPath);
      if (!suspiciousCheck.valid) {
        return suspiciousCheck;
      }

      // Step 2: パスを正規化
      const resolved = path.resolve(inputPath);
      const normalized = path.normalize(resolved);

      // Step 3: 正規化後のパターンも再チェック
      const postNormalizeCheck = this.checkSuspiciousPatterns(normalized);
      if (!postNormalizeCheck.valid) {
        return postNormalizeCheck;
      }

      // Step 4: 許可ディレクトリ内かチェック
      if (!this.isWithinAllowedDirs(normalized)) {
        return {
          valid: false,
          error: "Path outside allowed directories",
          securityEvent: {
            type: "blocked",
            reason: "PATH_OUTSIDE_ALLOWED",
            path: inputPath,
            timestamp: new Date(),
            details: { normalized, allowedDirs: this.normalizedAllowedDirs },
          },
        };
      }

      // Step 5: 拒否パターンをチェック
      const deniedCheck = this.checkDeniedPatterns(normalized);
      if (!deniedCheck.valid) {
        return deniedCheck;
      }

      // Step 6: シンボリックリンクをチェック
      const symlinkCheck = await this.checkSymlink(normalized);
      if (!symlinkCheck.valid) {
        return symlinkCheck;
      }

      return {
        valid: true,
        normalizedPath: symlinkCheck.normalizedPath || normalized,
      };
    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${(error as Error).message}`,
      };
    }
  }

  private checkSuspiciousPatterns(inputPath: string): ValidationResult {
    const suspiciousPatterns = [
      { pattern: /\.\.\//, name: "Parent directory traversal (../)" },
      { pattern: /\.\.\\/, name: "Parent directory traversal (..\)" },
      { pattern: /%2e%2e/i, name: "URL encoded traversal" },
      { pattern: /%252e%252e/i, name: "Double URL encoded traversal" },
      { pattern: /\0/, name: "Null byte injection" },
    ];

    for (const { pattern, name } of suspiciousPatterns) {
      if (pattern.test(inputPath)) {
        return {
          valid: false,
          error: `Suspicious pattern detected: ${name}`,
          securityEvent: {
            type: "blocked",
            reason: "SUSPICIOUS_PATTERN",
            path: inputPath,
            timestamp: new Date(),
            details: { patternName: name },
          },
        };
      }
    }

    return { valid: true };
  }

  private isWithinAllowedDirs(normalizedPath: string): boolean {
    return this.normalizedAllowedDirs.some(
      (allowedDir) =>
        normalizedPath.startsWith(allowedDir + path.sep) ||
        normalizedPath === allowedDir,
    );
  }

  private checkDeniedPatterns(normalizedPath: string): ValidationResult {
    for (const pattern of this.config.deniedPatterns) {
      if (pattern.test(normalizedPath)) {
        return {
          valid: false,
          error: `Path matches denied pattern: ${pattern.source}`,
          securityEvent: {
            type: "blocked",
            reason: "DENIED_PATTERN",
            path: normalizedPath,
            timestamp: new Date(),
            details: { pattern: pattern.source },
          },
        };
      }
    }

    return { valid: true };
  }

  private async checkSymlink(filePath: string): Promise<ValidationResult> {
    try {
      const stats = await fs.lstat(filePath);

      if (!stats.isSymbolicLink()) {
        return { valid: true };
      }

      // シンボリックリンク完全禁止
      if (this.config.symlinkPolicy === "deny") {
        return {
          valid: false,
          error: "Symbolic links are not allowed",
          securityEvent: {
            type: "blocked",
            reason: "SYMLINK_DENIED",
            path: filePath,
            timestamp: new Date(),
          },
        };
      }

      // シンボリックリンク許可
      if (this.config.symlinkPolicy === "allow") {
        return { valid: true };
      }

      // シンボリックリンク検証モード
      const realPath = await fs.realpath(filePath);
      const allowedTargets = this.config.symlinkAllowedTargets || [];

      // ターゲットが許可リスト内かチェック
      if (allowedTargets.length > 0) {
        const isAllowed = allowedTargets.some(
          (target) =>
            realPath.startsWith(path.resolve(target) + path.sep) ||
            realPath === path.resolve(target),
        );

        if (!isAllowed) {
          return {
            valid: false,
            error: "Symlink target outside allowed directories",
            securityEvent: {
              type: "blocked",
              reason: "SYMLINK_TARGET_OUTSIDE",
              path: filePath,
              timestamp: new Date(),
              details: { realPath, allowedTargets },
            },
          };
        }
      }

      // ターゲットが許可ベースディレクトリ内かチェック
      if (!this.isWithinAllowedDirs(realPath)) {
        return {
          valid: false,
          error: "Symlink target outside base directories",
          securityEvent: {
            type: "blocked",
            reason: "SYMLINK_ESCAPE",
            path: filePath,
            timestamp: new Date(),
            details: { realPath },
          },
        };
      }

      return { valid: true, normalizedPath: realPath };
    } catch (error) {
      // ファイルが存在しない場合は有効とみなす（作成イベントの可能性）
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { valid: true };
      }
      throw error;
    }
  }
}

// ============================================================
// レート制限クラス
// ============================================================

export class RateLimiter {
  private events: number[] = [];
  private isLimited = false;

  constructor(
    private maxEvents: number,
    private windowMs: number,
    private onLimitExceeded?: (stats: { current: number; max: number }) => void,
  ) {}

  check(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 古いイベントを削除
    this.events = this.events.filter((timestamp) => timestamp > windowStart);

    if (this.events.length >= this.maxEvents) {
      if (!this.isLimited) {
        this.isLimited = true;
        this.onLimitExceeded?.({
          current: this.events.length,
          max: this.maxEvents,
        });
      }
      return false;
    }

    this.events.push(now);
    this.isLimited = false;
    return true;
  }

  getStats(): { current: number; max: number; utilization: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.events = this.events.filter((timestamp) => timestamp > windowStart);

    return {
      current: this.events.length,
      max: this.maxEvents,
      utilization: this.events.length / this.maxEvents,
    };
  }
}

// ============================================================
// 監査ログクラス
// ============================================================

export class AuditLogger {
  constructor(private enabled: boolean) {}

  log(event: SecurityEvent): void {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: event.timestamp.toISOString(),
      level: event.type === "blocked" ? "SECURITY" : "INFO",
      event: event.reason,
      path: event.path,
      details: event.details,
    };

    if (event.type === "blocked") {
      console.error("[SECURITY]", JSON.stringify(logEntry));
    } else if (event.type === "warning") {
      console.warn("[SECURITY]", JSON.stringify(logEntry));
    } else {
      console.log("[AUDIT]", JSON.stringify(logEntry));
    }
  }
}

// ============================================================
// セキュアファイル監視クラス
// ============================================================

export class SecureFileWatcher extends EventEmitter {
  private pathValidator: PathValidator;
  private rateLimiter: RateLimiter;
  private auditLogger: AuditLogger;
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.pathValidator = new PathValidator(this.config);
    this.rateLimiter = new RateLimiter(
      this.config.rateLimit.maxEvents,
      this.config.rateLimit.windowMs,
      (stats) => {
        this.emit("rateLimitExceeded", stats);
        this.auditLogger.log({
          type: "warning",
          reason: "RATE_LIMIT_EXCEEDED",
          path: "",
          timestamp: new Date(),
          details: stats,
        });
      },
    );
    this.auditLogger = new AuditLogger(this.config.auditLog);
  }

  /**
   * ファイルイベントを処理
   */
  async processEvent(
    eventType: "add" | "change" | "unlink",
    filePath: string,
  ): Promise<boolean> {
    // レート制限チェック
    if (!this.rateLimiter.check()) {
      this.emit("eventDropped", { eventType, filePath, reason: "rate_limit" });
      return false;
    }

    // パス検証
    const result = await this.pathValidator.validate(filePath);

    if (!result.valid) {
      if (result.securityEvent) {
        this.auditLogger.log(result.securityEvent);
        this.emit("securityEvent", result.securityEvent);
      }
      return false;
    }

    // 正常なイベントを発火
    this.emit("file", {
      type: eventType,
      path: result.normalizedPath || filePath,
      originalPath: filePath,
    });

    // 監査ログ（許可されたアクセス）
    this.auditLogger.log({
      type: "allowed",
      reason: "FILE_ACCESS_ALLOWED",
      path: filePath,
      timestamp: new Date(),
      details: { eventType },
    });

    return true;
  }

  /**
   * セキュリティ統計を取得
   */
  getSecurityStats(): {
    rateLimit: { current: number; max: number; utilization: number };
  } {
    return {
      rateLimit: this.rateLimiter.getStats(),
    };
  }
}

// ============================================================
// Chokidar統合ラッパー
// ============================================================

import type { FSWatcher, WatchOptions } from "chokidar";

export interface SecureWatcherOptions extends WatchOptions {
  security: Partial<SecurityConfig>;
}

/**
 * Chokidarをセキュリティレイヤーでラップ
 */
export function createSecureWatcher(
  paths: string | string[],
  options: SecureWatcherOptions,
): { watcher: FSWatcher; security: SecureFileWatcher } {
  // 動的インポート（chokidarがインストールされている前提）
  const chokidar = require("chokidar");

  const securityConfig: Partial<SecurityConfig> = {
    ...options.security,
    allowedDirs: Array.isArray(paths) ? paths : [paths],
  };

  const secureWatcher = new SecureFileWatcher(securityConfig);

  const watcher = chokidar.watch(paths, {
    ...options,
    // シンボリックリンクのフォローはセキュリティレイヤーで制御
    followSymlinks: false,
  });

  // イベントをセキュリティレイヤー経由で処理
  const secureHandler = (eventType: "add" | "change" | "unlink") => {
    return async (filePath: string) => {
      const allowed = await secureWatcher.processEvent(eventType, filePath);
      if (!allowed) {
        // ブロックされたイベントはログ済み
      }
    };
  };

  watcher.on("add", secureHandler("add"));
  watcher.on("change", secureHandler("change"));
  watcher.on("unlink", secureHandler("unlink"));

  return { watcher, security: secureWatcher };
}

// ============================================================
// 使用例
// ============================================================

/*
import { createSecureWatcher } from './secure-watcher';

// セキュアなファイル監視を作成
const { watcher, security } = createSecureWatcher('/app/uploads', {
  security: {
    symlinkPolicy: 'deny',
    deniedPatterns: [
      /\.env$/,
      /\.git\//,
      /password/i,
    ],
    rateLimit: {
      maxEvents: 500,
      windowMs: 1000,
    },
    auditLog: true,
  },
  persistent: true,
  ignoreInitial: true,
});

// セキュリティイベントをリッスン
security.on('file', ({ type, path }) => {
  console.log(`Safe file event: ${type} - ${path}`);
  // 通常のファイル処理
});

security.on('securityEvent', (event) => {
  console.error(`Security blocked: ${event.reason} - ${event.path}`);
  // アラートシステムに通知
});

security.on('rateLimitExceeded', (stats) => {
  console.warn(`Rate limit exceeded: ${stats.current}/${stats.max}`);
  // 一時的なスロットリングを実施
});

// 統計確認
setInterval(() => {
  const stats = security.getSecurityStats();
  console.log(`Rate limit utilization: ${(stats.rateLimit.utilization * 100).toFixed(1)}%`);
}, 10000);

// クリーンアップ
process.on('SIGTERM', async () => {
  await watcher.close();
  console.log('Secure watcher closed');
});
*/
