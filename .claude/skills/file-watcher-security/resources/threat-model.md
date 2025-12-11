# ファイル監視システム 脅威モデル

## 概要

このドキュメントでは、ファイル監視システムに対する潜在的な脅威と対策を体系的に分析する。

---

## 脅威カテゴリ

### 1. パストラバーサル攻撃

#### 脅威の説明

攻撃者が `../` などの相対パス表記を使用して、監視対象外のディレクトリにアクセスする。

#### 攻撃ベクター

```
入力: /app/data/../../../etc/passwd
期待動作: 監視対象内のファイルのみ処理
攻撃結果: システムファイルへのアクセス
```

#### エンコーディングバリエーション

| パターン  | エンコーディング | 例                |
| --------- | ---------------- | ----------------- |
| 標準      | なし             | `../etc/passwd`   |
| URL       | %xx              | `%2e%2e%2f`       |
| ダブルURL | %25xx            | `%252e%252e%252f` |
| Unicode   | \uxxxx           | `\u002e\u002e/`   |
| Null Byte | \0               | `file.txt\0.jpg`  |

#### 対策

```typescript
// 多層防御アプローチ
function validatePath(input: string): string {
  // Layer 1: 疑わしいパターンの検出
  if (containsSuspiciousPattern(input)) {
    throw new SecurityError("Suspicious pattern detected");
  }

  // Layer 2: 正規化
  const normalized = path.normalize(path.resolve(input));

  // Layer 3: ホワイトリスト検証
  if (!isWithinAllowedDirs(normalized)) {
    throw new SecurityError("Path outside allowed directories");
  }

  // Layer 4: 二重チェック（正規化後のパターン）
  if (containsSuspiciousPattern(normalized)) {
    throw new SecurityError("Suspicious pattern after normalization");
  }

  return normalized;
}
```

---

### 2. シンボリックリンク攻撃

#### 脅威の説明

攻撃者がシンボリックリンクを作成し、監視対象外のファイルを参照させる。

#### 攻撃シナリオ

```bash
# 攻撃者が監視ディレクトリ内にsymlinkを作成
ln -s /etc/passwd /app/uploads/innocent.txt

# ファイル監視がsymlinkをフォローして機密情報を処理
```

#### TOCTOU (Time-of-Check to Time-of-Use) 攻撃

```
時刻T1: 検証 - /app/data/file.txt は正当なファイル
時刻T2: 攻撃者がfile.txtをsymlinkに置換
時刻T3: 処理 - /etc/passwdを読み取り（攻撃成功）
```

#### 対策

```typescript
// O_NOFOLLOW フラグを使用した安全なファイルオープン
import { open } from "fs/promises";

async function safeRead(filePath: string): Promise<Buffer> {
  // lstat で先にチェック（symlinkかどうか）
  const stats = await fs.lstat(filePath);
  if (stats.isSymbolicLink()) {
    throw new SecurityError("Symbolic links not allowed");
  }

  // TOCTOU対策: O_NOFOLLOWフラグ
  const fd = await open(filePath, "r");
  try {
    // fd経由でfstatして再確認
    const fdStats = await fd.stat();
    if (fdStats.ino !== stats.ino) {
      throw new SecurityError("File changed during access (race condition)");
    }
    return await fd.readFile();
  } finally {
    await fd.close();
  }
}
```

---

### 3. リソース枯渇攻撃 (DoS)

#### 脅威の説明

攻撃者が大量のファイル操作を発生させ、監視システムをオーバーロードさせる。

#### 攻撃パターン

| パターン       | 説明                       | 影響                   |
| -------------- | -------------------------- | ---------------------- |
| ファイル爆弾   | 短時間に数千ファイル作成   | CPU/メモリ枯渇         |
| 深いネスト     | 非常に深いディレクトリ構造 | スタックオーバーフロー |
| 長いファイル名 | 極端に長いパス名           | バッファオーバーフロー |
| 高速変更       | 同一ファイルの高速更新     | イベントキュー溢れ     |

#### 対策

```typescript
const resourceLimits = {
  // イベントレート制限
  rateLimiter: new RateLimiter({
    maxEvents: 1000,
    windowMs: 1000,
  }),

  // ディレクトリ深度制限
  maxDirectoryDepth: 20,

  // パス長制限
  maxPathLength: 4096,

  // 同時処理数制限
  maxConcurrentOperations: 100,

  // メモリ使用量監視
  memoryThreshold: 0.8, // 80%
};

// 深度チェック
function checkDepth(filePath: string): void {
  const depth = filePath.split(path.sep).length;
  if (depth > resourceLimits.maxDirectoryDepth) {
    throw new ResourceError(`Directory too deep: ${depth} levels`);
  }
}
```

---

### 4. 権限昇格

#### 脅威の説明

監視プロセスの実行権限を利用して、より高い権限でコードを実行する。

#### 攻撃ベクター

```bash
# setuid/setgidファイルの悪用
chmod u+s /app/uploads/malicious

# 監視プロセスがrootで実行される場合
# アップロードされた実行ファイルがroot権限で実行される可能性
```

#### 対策

```typescript
// 1. 最小権限で実行
if (process.getuid && process.getuid() === 0) {
  console.error("WARNING: Running as root is not recommended");
  // 権限降格
  process.setgid(1000);
  process.setuid(1000);
}

// 2. setuid/setgidファイルの検出
async function checkSpecialPermissions(filePath: string): Promise<void> {
  const stats = await fs.stat(filePath);
  const mode = stats.mode;

  // setuid (4000) または setgid (2000) をチェック
  if (mode & 0o4000 || mode & 0o2000) {
    throw new SecurityError("setuid/setgid files not allowed");
  }

  // world-writable (0002) をチェック
  if (mode & 0o0002) {
    console.warn(`World-writable file detected: ${filePath}`);
  }
}
```

---

### 5. 情報漏洩

#### 脅威の説明

機密情報を含むファイルが意図せず監視・処理される。

#### 機密ファイルパターン

```typescript
const sensitivePatterns = [
  // 環境設定
  /\.env$/,
  /\.env\.\w+$/,
  /credentials\.(json|yaml|yml)$/,

  // 認証情報
  /\.ssh\//,
  /\.gnupg\//,
  /id_rsa$/,
  /\.pem$/,

  // データベース
  /\.sqlite3?$/,
  /\.db$/,

  // ログ（機密情報を含む可能性）
  /access\.log$/,
  /auth\.log$/,

  // バックアップ
  /\.bak$/,
  /\.backup$/,
  /~$/,

  // バージョン管理
  /\.git\//,
  /\.svn\//,
];
```

#### 対策

```typescript
class SensitiveFileFilter {
  private patterns: RegExp[];

  constructor(additionalPatterns: RegExp[] = []) {
    this.patterns = [...sensitivePatterns, ...additionalPatterns];
  }

  isSensitive(filePath: string): boolean {
    return this.patterns.some((pattern) => pattern.test(filePath));
  }

  filter(files: string[]): { safe: string[]; sensitive: string[] } {
    const safe: string[] = [];
    const sensitive: string[] = [];

    for (const file of files) {
      if (this.isSensitive(file)) {
        sensitive.push(file);
      } else {
        safe.push(file);
      }
    }

    return { safe, sensitive };
  }
}
```

---

## リスク評価マトリックス

| 脅威               | 発生確率 | 影響度 | リスクレベル | 優先対策           |
| ------------------ | -------- | ------ | ------------ | ------------------ |
| パストラバーサル   | 高       | 重大   | 🔴 Critical  | 入力検証必須       |
| シンボリックリンク | 中       | 重大   | 🔴 Critical  | lstat/realpath検証 |
| DoS                | 高       | 高     | 🟠 High      | レート制限         |
| 権限昇格           | 低       | 重大   | 🟡 Medium    | 最小権限実行       |
| 情報漏洩           | 中       | 高     | 🟠 High      | 除外パターン       |

---

## 環境別脅威プロファイル

### 開発環境

```typescript
const devSecurityProfile = {
  // 緩いセキュリティ設定
  pathValidation: true,
  symlinkPolicy: "allow",
  rateLimit: false,
  auditLog: false,
};
```

### ステージング環境

```typescript
const stagingSecurityProfile = {
  pathValidation: true,
  symlinkPolicy: "verify",
  rateLimit: true,
  auditLog: true,
};
```

### 本番環境

```typescript
const productionSecurityProfile = {
  pathValidation: true,
  symlinkPolicy: "deny", // マルチテナントでは必須
  rateLimit: true,
  auditLog: true,
  sandbox: true,
};
```

---

## インシデント対応

### 検出時の対応フロー

```
1. 検出
   ↓
2. イベントログ記録（タイムスタンプ、詳細、影響範囲）
   ↓
3. 即時対応（該当ファイル/ディレクトリの隔離）
   ↓
4. アラート発火（Slack/PagerDuty/Email）
   ↓
5. 調査（根本原因分析）
   ↓
6. 是正措置（設定変更、パッチ適用）
   ↓
7. 事後分析（再発防止策）
```

### ログフォーマット

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "SECURITY",
  "event": "PATH_TRAVERSAL_ATTEMPT",
  "details": {
    "inputPath": "/app/data/../../../etc/passwd",
    "normalizedPath": "/etc/passwd",
    "clientIp": "192.168.1.100",
    "userId": "user123"
  },
  "action": "BLOCKED",
  "severity": "HIGH"
}
```
