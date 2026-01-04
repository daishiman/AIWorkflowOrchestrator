# セキュリティ実装パターン

## パス検証

### 基本的なパス正規化

```typescript
import * as path from "path";

function normalizePath(inputPath: string): string {
  // 絶対パスに変換
  return path.resolve(inputPath);
}

function validatePath(inputPath: string, allowedBase: string): boolean {
  const normalizedPath = normalizePath(inputPath);
  const normalizedBase = normalizePath(allowedBase);

  // 許可されたベースディレクトリ内かチェック
  return normalizedPath.startsWith(normalizedBase + path.sep);
}
```

### 危険なパターンの検出

```typescript
const DANGEROUS_PATTERNS = [
  /\.\./, // 親ディレクトリ参照
  /%2e%2e/i, // URLエンコード
  /%252e%252e/i, // 二重エンコード
  /\0/, // Nullバイト
];

function containsDangerousPattern(inputPath: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(inputPath));
}
```

## シンボリックリンク検出

### lstat による検出

```typescript
import * as fs from "fs/promises";

async function isSymbolicLink(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.lstat(filePath);
    return stats.isSymbolicLink();
  } catch {
    return false; // エラー時は安全側に倒す
  }
}

async function resolveAndValidate(
  filePath: string,
  allowedBase: string,
): Promise<string | null> {
  // シンボリックリンクをチェック
  if (await isSymbolicLink(filePath)) {
    console.warn(`Symbolic link detected: ${filePath}`);
    return null; // リンクは拒否
  }

  // パスを検証
  if (!validatePath(filePath, allowedBase)) {
    console.warn(`Path outside allowed base: ${filePath}`);
    return null;
  }

  return filePath;
}
```

## 権限管理

### プロセス権限の制限

```bash
#!/bin/bash
# 監視プロセスを非特権ユーザーで実行

# 専用ユーザーの作成
useradd --system --no-create-home --shell /bin/false filewatcher

# 監視対象ディレクトリの権限設定
chown -R filewatcher:filewatcher /watched
chmod -R 0550 /watched

# プロセスの実行
su -s /bin/bash -c "node /app/watcher.js" filewatcher
```

### Node.js での権限ドロップ

```typescript
function dropPrivileges(uid: number, gid: number): void {
  if (process.getuid && process.getuid() === 0) {
    process.setgid(gid);
    process.setuid(uid);
    console.log(`Dropped privileges to uid=${uid}, gid=${gid}`);
  }
}

// アプリケーション起動時に権限をドロップ
dropPrivileges(65534, 65534); // nobody:nogroup
```

## セキュアウォッチャーの統合パターン

```typescript
import * as chokidar from "chokidar";

interface SecureWatcherOptions {
  allowedBase: string;
  rejectSymlinks: boolean;
  auditLog: (event: string, path: string) => void;
}

function createSecureWatcher(options: SecureWatcherOptions) {
  const watcher = chokidar.watch(options.allowedBase, {
    followSymlinks: false, // シンボリックリンクをフォローしない
    ignorePermissionErrors: true,
  });

  watcher.on("all", async (event, filePath) => {
    // パス検証
    if (!validatePath(filePath, options.allowedBase)) {
      options.auditLog("REJECTED_PATH", filePath);
      return;
    }

    // シンボリックリンク検証
    if (options.rejectSymlinks && (await isSymbolicLink(filePath))) {
      options.auditLog("REJECTED_SYMLINK", filePath);
      return;
    }

    // 正常なイベント処理
    options.auditLog(event, filePath);
    // イベントハンドリング...
  });

  return watcher;
}
```

## 監査ログ

```typescript
interface AuditLogEntry {
  timestamp: string;
  event: string;
  path: string;
  result: "allowed" | "rejected";
  reason?: string;
}

function logAuditEvent(entry: AuditLogEntry): void {
  console.log(
    JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    }),
  );
}
```
