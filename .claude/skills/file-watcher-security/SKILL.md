---
name: file-watcher-security
description: |
    ファイル監視システムのセキュリティ対策とプロダクション環境での安全な運用パターン。
    最小権限の原則、Defense in Depth、Fail-Safe Defaultsに基づく多層防御設計を提供。
    専門分野:
    - パストラバーサル防止: パス正規化、ホワイトリスト検証
    - シンボリックリンク攻撃対策: realpath検証、TOCTOU防止
    - リソース枯渇攻撃（DoS）防止: レート制限、クォータ管理
    - サンドボックス化: プロセス分離、権限降格
    使用タイミング:
    - マルチテナント環境でファイル監視を実装する時
    - 本番環境でのセキュリティ要件を満たす時
    - パストラバーサルやsymlink攻撃を防ぐ時
    - セキュリティ監査を実施する時
    Use when implementing secure file watchers in multi-tenant environments,
    production systems with high security requirements, or preventing
    path traversal and symlink attacks.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/file-watcher-security/resources/threat-model.md`: 脅威モデリングと攻撃ベクター分析
  - `.claude/skills/file-watcher-security/templates/secure-watcher.ts`: セキュアなファイル監視の完全実装例
  - `.claude/skills/file-watcher-security/scripts/security-audit.sh`: セキュリティ監査と検証スクリプト

  Use proactively when implementing file-watcher-security patterns or solving related problems.
version: 1.0.0
---


# file-watcher-security

> ファイル監視システムのセキュリティ対策とプロダクション環境での安全な運用パターン

## 概要

### このスキルが解決する問題

ファイル監視システムは、適切なセキュリティ対策なしに運用すると、以下のリスクに晒される：

1. **パストラバーサル攻撃**: `../` を使用した監視範囲外へのアクセス
2. **シンボリックリンク攻撃**: symlink を利用した権限昇格
3. **リソース枯渇攻撃**: 大量ファイル生成によるDoS
4. **情報漏洩**: 機密ファイルの意図しない監視・処理
5. **権限昇格**: 監視プロセスの権限を利用した攻撃

### 設計原則

```
最小権限の原則 + Defense in Depth + Fail-Safe Defaults
```

- **最小権限**: 必要最小限のファイルシステムアクセス権限のみ付与
- **多層防御**: 単一の防御に依存せず、複数のセキュリティレイヤーを実装
- **安全側への失敗**: 不明な状況では処理を拒否する

---

## クイックリファレンス

### セキュリティチェックリスト

```typescript
// ✅ 安全な実装パターン
const secureWatcher = {
  // 1. パス正規化と検証
  validatePath: (inputPath: string) => {
    const resolved = path.resolve(inputPath);
    const normalized = path.normalize(resolved);

    // ベースディレクトリ内かチェック
    if (!normalized.startsWith(ALLOWED_BASE_DIR)) {
      throw new SecurityError('Path traversal detected');
    }
    return normalized;
  },

  // 2. シンボリックリンク検証
  checkSymlink: async (filePath: string) => {
    const stats = await fs.lstat(filePath);
    if (stats.isSymbolicLink()) {
      const realPath = await fs.realpath(filePath);
      if (!realPath.startsWith(ALLOWED_BASE_DIR)) {
        throw new SecurityError('Symlink escape detected');
      }
    }
  },

  // 3. レート制限
  rateLimit: new RateLimiter({
    maxEvents: 1000,
    windowMs: 1000,
    onExceeded: () => { /* アラート発火 */ }
  })
};
```

### 脅威モデル概要

| 脅威カテゴリ | 攻撃ベクター | 対策 | 優先度 |
|------------|------------|------|-------|
| パストラバーサル | `../` 含むパス | パス正規化・検証 | 🔴 高 |
| シンボリックリンク | 外部を指すsymlink | realpath検証 | 🔴 高 |
| DoS | 大量ファイル生成 | レート制限・クォータ | 🟡 中 |
| 情報漏洩 | 機密ファイル監視 | 除外パターン強制 | 🟡 中 |
| 権限昇格 | setuid/setgid | 権限チェック | 🔴 高 |

---

## コアパターン

### パターン1: パストラバーサル防止

```typescript
import * as path from 'path';
import * as fs from 'fs/promises';

class PathValidator {
  constructor(private readonly allowedDirs: string[]) {
    // 許可ディレクトリを正規化して保持
    this.allowedDirs = allowedDirs.map(dir =>
      path.resolve(path.normalize(dir))
    );
  }

  /**
   * パスを検証し、正規化されたパスを返す
   * @throws SecurityError パストラバーサルが検出された場合
   */
  validate(inputPath: string): string {
    // Step 1: 基本的なパストラバーサルパターンをチェック
    const suspiciousPatterns = [
      /\.\.\//,           // ../
      /\.\.\\/,           // ..\
      /%2e%2e/i,          // URL encoded ..
      /%252e%252e/i,      // Double URL encoded
      /\.\.%2f/i,         // Mixed encoding
      /\0/,               // Null byte
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(inputPath)) {
        throw new SecurityError(
          `Suspicious path pattern detected: ${inputPath}`
        );
      }
    }

    // Step 2: パスを正規化
    const resolved = path.resolve(inputPath);
    const normalized = path.normalize(resolved);

    // Step 3: 許可されたディレクトリ内かチェック
    const isAllowed = this.allowedDirs.some(allowedDir =>
      normalized.startsWith(allowedDir + path.sep) ||
      normalized === allowedDir
    );

    if (!isAllowed) {
      throw new SecurityError(
        `Path outside allowed directories: ${normalized}`
      );
    }

    return normalized;
  }

  /**
   * 複数パスを一括検証
   */
  validateAll(paths: string[]): string[] {
    return paths.map(p => this.validate(p));
  }
}

// 使用例
const validator = new PathValidator(['/app/data', '/app/uploads']);

// ✅ 安全なパス
validator.validate('/app/data/user/file.txt');

// ❌ 拒否されるパス
validator.validate('/app/data/../etc/passwd');  // SecurityError
validator.validate('/etc/passwd');              // SecurityError
```

### パターン2: シンボリックリンク安全性

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

interface SymlinkPolicy {
  /** シンボリックリンクを完全に禁止 */
  deny: boolean;
  /** 許可されたターゲットディレクトリ */
  allowedTargets?: string[];
  /** 最大シンボリックリンク解決深度 */
  maxDepth?: number;
}

class SymlinkValidator {
  private readonly policy: Required<SymlinkPolicy>;

  constructor(policy: SymlinkPolicy) {
    this.policy = {
      deny: policy.deny,
      allowedTargets: policy.allowedTargets ?? [],
      maxDepth: policy.maxDepth ?? 10,
    };
  }

  /**
   * ファイルパスのシンボリックリンク安全性を検証
   */
  async validate(filePath: string): Promise<ValidationResult> {
    const stats = await fs.lstat(filePath);

    if (!stats.isSymbolicLink()) {
      return { safe: true, type: 'regular' };
    }

    // シンボリックリンク完全禁止モード
    if (this.policy.deny) {
      return {
        safe: false,
        type: 'symlink',
        reason: 'Symbolic links are not allowed',
      };
    }

    // シンボリックリンクを解決（循環参照対策付き）
    const visited = new Set<string>();
    let currentPath = filePath;
    let depth = 0;

    while (depth < this.policy.maxDepth) {
      const currentStats = await fs.lstat(currentPath);

      if (!currentStats.isSymbolicLink()) {
        break;
      }

      // 循環参照検出
      if (visited.has(currentPath)) {
        return {
          safe: false,
          type: 'symlink',
          reason: 'Circular symlink detected',
        };
      }
      visited.add(currentPath);

      // リンクターゲットを取得
      const linkTarget = await fs.readlink(currentPath);
      currentPath = path.resolve(path.dirname(currentPath), linkTarget);
      depth++;
    }

    // 最大深度超過チェック
    if (depth >= this.policy.maxDepth) {
      return {
        safe: false,
        type: 'symlink',
        reason: `Symlink depth exceeded (max: ${this.policy.maxDepth})`,
      };
    }

    // 実際のパスを取得
    const realPath = await fs.realpath(filePath);

    // 許可されたターゲット内かチェック
    if (this.policy.allowedTargets.length > 0) {
      const isAllowed = this.policy.allowedTargets.some(target =>
        realPath.startsWith(target + path.sep) || realPath === target
      );

      if (!isAllowed) {
        return {
          safe: false,
          type: 'symlink',
          reason: `Symlink target outside allowed directories: ${realPath}`,
        };
      }
    }

    return {
      safe: true,
      type: 'symlink',
      resolvedPath: realPath,
    };
  }
}

interface ValidationResult {
  safe: boolean;
  type: 'regular' | 'symlink';
  reason?: string;
  resolvedPath?: string;
}
```

### パターン3: レート制限とクォータ

```typescript
interface RateLimitConfig {
  /** 時間窓内の最大イベント数 */
  maxEvents: number;
  /** 時間窓（ミリ秒） */
  windowMs: number;
  /** 制限超過時のコールバック */
  onExceeded?: (stats: RateLimitStats) => void;
  /** バーストを許可するか */
  allowBurst?: boolean;
  /** バースト時の追加許容量 */
  burstAllowance?: number;
}

interface RateLimitStats {
  eventsInWindow: number;
  windowStart: number;
  exceededAt: number;
  exceededBy: number;
}

class EventRateLimiter {
  private events: number[] = [];
  private isLimited = false;

  constructor(private config: Required<RateLimitConfig>) {
    this.config = {
      maxEvents: config.maxEvents,
      windowMs: config.windowMs,
      onExceeded: config.onExceeded ?? (() => {}),
      allowBurst: config.allowBurst ?? true,
      burstAllowance: config.burstAllowance ?? Math.floor(config.maxEvents * 0.2),
    };
  }

  /**
   * イベントを記録し、制限内かチェック
   * @returns true: 処理可能, false: レート制限中
   */
  check(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // 古いイベントを削除
    this.events = this.events.filter(timestamp => timestamp > windowStart);

    // 制限チェック
    const effectiveLimit = this.config.allowBurst
      ? this.config.maxEvents + this.config.burstAllowance
      : this.config.maxEvents;

    if (this.events.length >= effectiveLimit) {
      if (!this.isLimited) {
        this.isLimited = true;
        this.config.onExceeded({
          eventsInWindow: this.events.length,
          windowStart,
          exceededAt: now,
          exceededBy: this.events.length - this.config.maxEvents,
        });
      }
      return false;
    }

    // イベントを記録
    this.events.push(now);
    this.isLimited = false;
    return true;
  }

  /**
   * 現在の統計情報を取得
   */
  getStats(): { current: number; limit: number; utilization: number } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    this.events = this.events.filter(timestamp => timestamp > windowStart);

    return {
      current: this.events.length,
      limit: this.config.maxEvents,
      utilization: this.events.length / this.config.maxEvents,
    };
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    this.events = [];
    this.isLimited = false;
  }
}

// ディレクトリ別クォータ管理
class DirectoryQuotaManager {
  private quotas = new Map<string, { current: number; max: number }>();

  constructor(private defaultQuota: number = 10000) {}

  /**
   * ディレクトリのクォータを設定
   */
  setQuota(dir: string, maxFiles: number): void {
    this.quotas.set(path.resolve(dir), { current: 0, max: maxFiles });
  }

  /**
   * ファイル追加時のクォータチェック
   */
  checkAndIncrement(filePath: string): boolean {
    const dir = this.findQuotaDir(filePath);
    if (!dir) return true; // クォータ未設定は許可

    const quota = this.quotas.get(dir)!;
    if (quota.current >= quota.max) {
      return false;
    }

    quota.current++;
    return true;
  }

  /**
   * ファイル削除時のデクリメント
   */
  decrement(filePath: string): void {
    const dir = this.findQuotaDir(filePath);
    if (!dir) return;

    const quota = this.quotas.get(dir)!;
    quota.current = Math.max(0, quota.current - 1);
  }

  private findQuotaDir(filePath: string): string | undefined {
    const resolved = path.resolve(filePath);
    for (const [dir] of this.quotas) {
      if (resolved.startsWith(dir + path.sep)) {
        return dir;
      }
    }
    return undefined;
  }
}
```

### パターン4: サンドボックス化

```typescript
import { spawn, ChildProcess } from 'child_process';

interface SandboxConfig {
  /** 読み取り専用ディレクトリ */
  readOnlyDirs: string[];
  /** 読み書き可能ディレクトリ */
  readWriteDirs: string[];
  /** 許可するシステムコール */
  allowedSyscalls?: string[];
  /** メモリ制限（MB） */
  memoryLimitMB?: number;
  /** CPU制限（%） */
  cpuLimitPercent?: number;
  /** ネットワークアクセス許可 */
  allowNetwork?: boolean;
}

/**
 * ファイル処理を分離されたプロセスで実行
 */
class ProcessSandbox {
  constructor(private config: SandboxConfig) {}

  /**
   * サンドボックス化されたプロセスでスクリプトを実行
   */
  async execute(script: string, args: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      // Linuxの場合: firejailやbubbleboxを使用
      // macOSの場合: sandbox-execを使用
      // コンテナ環境の場合: 既にサンドボックス化されている前提

      const sandboxArgs = this.buildSandboxArgs();
      const child = spawn(sandboxArgs.command, [
        ...sandboxArgs.args,
        'node',
        script,
        ...args,
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: this.buildRestrictedEnv(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Sandbox process failed: ${stderr}`));
        }
      });

      child.on('error', reject);
    });
  }

  private buildSandboxArgs(): { command: string; args: string[] } {
    const platform = process.platform;

    if (platform === 'linux') {
      // firejailを使用（インストールが必要）
      return {
        command: 'firejail',
        args: [
          '--quiet',
          '--private-dev',
          '--private-tmp',
          ...this.config.readOnlyDirs.map(d => `--read-only=${d}`),
          ...this.config.readWriteDirs.map(d => `--whitelist=${d}`),
          ...(this.config.allowNetwork ? [] : ['--net=none']),
        ],
      };
    }

    if (platform === 'darwin') {
      // macOSのsandbox-exec（非推奨だが利用可能）
      return {
        command: 'sandbox-exec',
        args: ['-p', this.buildDarwinProfile()],
      };
    }

    // Windows/その他: サンドボックスなしで実行（警告ログ）
    console.warn('Sandbox not available on this platform');
    return { command: 'node', args: [] };
  }

  private buildDarwinProfile(): string {
    return `
      (version 1)
      (deny default)
      (allow file-read* (subpath "/usr"))
      (allow file-read* (subpath "/System"))
      ${this.config.readOnlyDirs.map(d => `(allow file-read* (subpath "${d}"))`).join('\n')}
      ${this.config.readWriteDirs.map(d => `(allow file-write* (subpath "${d}"))`).join('\n')}
      (allow process-exec)
    `;
  }

  private buildRestrictedEnv(): NodeJS.ProcessEnv {
    return {
      PATH: '/usr/bin:/bin',
      NODE_ENV: 'production',
      // 機密環境変数を除外
      HOME: undefined,
      USER: undefined,
      SHELL: undefined,
    };
  }
}
```

---

## 実装ガイドライン

### セキュリティレイヤー構成

```
Layer 1: 入力検証（パス正規化、パターンチェック）
    ↓
Layer 2: アクセス制御（権限チェック、クォータ）
    ↓
Layer 3: シンボリックリンク検証
    ↓
Layer 4: レート制限
    ↓
Layer 5: サンドボックス実行（オプション）
    ↓
Layer 6: 監査ログ
```

### プロダクション設定例

```typescript
const productionSecurityConfig = {
  // パス検証
  pathValidation: {
    allowedDirs: ['/app/data', '/app/uploads'],
    deniedPatterns: [
      /\.env$/,
      /\.git\//,
      /node_modules\//,
      /\.ssh\//,
    ],
  },

  // シンボリックリンクポリシー
  symlink: {
    deny: false, // マルチテナント環境ではtrueを推奨
    allowedTargets: ['/app/shared'],
    maxDepth: 5,
  },

  // レート制限
  rateLimit: {
    maxEvents: 1000,
    windowMs: 1000,
    onExceeded: (stats) => {
      alerting.send('file-watcher-rate-limit', stats);
    },
  },

  // クォータ
  quotas: {
    '/app/uploads': 100000,
    '/app/data': 500000,
  },

  // 監査
  audit: {
    logAllAccess: true,
    logSecurityEvents: true,
    retentionDays: 90,
  },
};
```

---

## トラブルシューティング

### よくあるセキュリティ問題

| 問題 | 症状 | 解決策 |
|------|------|-------|
| パストラバーサル検出 | `SecurityError: Path outside allowed` | 入力パスの正規化を確認 |
| シンボリックリンク拒否 | `Symlink target outside allowed` | allowedTargets設定を確認 |
| レート制限発動 | 大量のイベントがドロップ | maxEventsを調整またはバッチ処理を検討 |
| クォータ超過 | 新規ファイルが処理されない | クォータ上限を確認、不要ファイルを削除 |

### セキュリティ監査チェックリスト

```bash
# 1. 監視ディレクトリの権限確認
ls -la /app/data

# 2. シンボリックリンクの確認
find /app/data -type l -ls

# 3. setuid/setgidファイルの確認
find /app/data -perm /6000 -ls

# 4. 書き込み可能ファイルの確認
find /app/data -perm -o+w -ls
```

---

## 関連リソース

- `resources/threat-model.md` - 詳細な脅威モデリングドキュメント
- `resources/security-checklist.md` - プロダクション向けセキュリティチェックリスト
- `templates/secure-watcher.ts` - セキュアなファイル監視の完全実装例
- `scripts/security-audit.sh` - セキュリティ監査スクリプト

---

## 参考文献

- OWASP Path Traversal: https://owasp.org/www-community/attacks/Path_Traversal
- CWE-22: Improper Limitation of a Pathname: https://cwe.mitre.org/data/definitions/22.html
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security
