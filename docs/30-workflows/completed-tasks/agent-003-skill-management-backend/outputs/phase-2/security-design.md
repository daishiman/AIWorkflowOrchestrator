# セキュリティ設計書

## メタ情報

| 項目   | 内容                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| Phase  | 2                                                                            |
| タスク | タスク4: セキュリティ設計                                                    |
| 作成日 | 2026-01-11                                                                   |
| 参照   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |

---

## 1. セキュリティ脅威と対策概要

### 1.1 脅威モデル

| 脅威                   | リスク | 対策                       |
| ---------------------- | ------ | -------------------------- |
| パストラバーサル攻撃   | 高     | パス正規化・ベースパス検証 |
| 不正IPC呼び出し        | 高     | IPC sender検証             |
| DevToolsからの攻撃     | 中     | DevTools呼び出し検出・拒否 |
| 入力値インジェクション | 中     | 入力バリデーション         |
| 機密情報漏洩           | 中     | エラーメッセージの制限     |

### 1.2 セキュリティ境界

```
┌──────────────────────────────────────────────────────────────────┐
│                        Main Process                               │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐  │
│  │  IPC Validator  │───>│         SkillService                │  │
│  │  (認証境界)     │    │  ┌───────────────────────────────┐  │  │
│  └─────────────────┘    │  │      SkillScanner             │  │  │
│          ▲              │  │  (パス検証境界)               │  │  │
│          │              │  └───────────────────────────────┘  │  │
│          │              └─────────────────────────────────────┘  │
│          │                                                        │
├──────────┼────────────────────────────────────────────────────────┤
│          │               Preload (contextBridge)                  │
├──────────┼────────────────────────────────────────────────────────┤
│          │                                                        │
│          │               Renderer Process                         │
│  ┌───────┴───────┐                                                │
│  │  electronAPI  │                                                │
│  │  (入力境界)   │                                                │
│  └───────────────┘                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. パストラバーサル防止

### 2.1 設計方針

- すべてのパスは`path.resolve()`で正規化
- 正規化後のパスがベースパス配下にあることを検証
- ディレクトリトラバーサル（`../`）を含むパスを拒否
- シンボリックリンクを追跡して実パスを検証

### 2.2 実装設計

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts

import * as path from "path";
import * as fs from "fs/promises";

export class SkillScanner {
  private basePath: string;

  constructor(basePath: string) {
    // ベースパスを絶対パスに正規化
    this.basePath = path.resolve(basePath);
  }

  /**
   * パスがベースパス配下にあることを検証
   * @param targetPath 検証対象のパス
   * @throws パストラバーサル攻撃を検知した場合
   */
  private validatePath(targetPath: string): void {
    // パスを正規化
    const resolved = path.resolve(targetPath);

    // ベースパス配下にあることを検証
    if (!resolved.startsWith(this.basePath + path.sep)) {
      // ベースパスそのものへのアクセスも禁止
      if (resolved !== this.basePath) {
        throw new Error(`Path traversal detected: ${targetPath}`);
      }
    }
  }

  /**
   * シンボリックリンクを解決して実パスを検証
   * @param targetPath 検証対象のパス
   */
  private async validateRealPath(targetPath: string): Promise<void> {
    try {
      const realPath = await fs.realpath(targetPath);
      this.validatePath(realPath);
    } catch (e) {
      // realpath失敗はファイル不存在など
      throw new Error(`Invalid path: ${targetPath}`);
    }
  }

  async scanDirectory(): Promise<string[]> {
    const skillPaths: string[] = [];

    // ベースパスの実パスを検証
    await this.validateRealPath(this.basePath);

    const entries = await fs.readdir(this.basePath, { withFileTypes: true });

    for (const entry of entries) {
      // ファイルはスキップ
      if (!entry.isDirectory()) continue;

      // 隠しディレクトリを除外
      if (entry.name.startsWith(".")) continue;

      // ディレクトリ名に危険な文字が含まれていないか検証
      if (!this.isValidDirectoryName(entry.name)) continue;

      const skillMdPath = path.join(this.basePath, entry.name, "SKILL.md");

      // パス検証
      this.validatePath(skillMdPath);

      try {
        await fs.access(skillMdPath);
        skillPaths.push(skillMdPath);
      } catch {
        // SKILL.mdが存在しない場合はスキップ
      }
    }

    return skillPaths;
  }

  /**
   * ディレクトリ名が安全かを検証
   * @param name ディレクトリ名
   */
  private isValidDirectoryName(name: string): boolean {
    // 空文字列を拒否
    if (!name || name.length === 0) return false;

    // パス区切り文字を含む場合は拒否
    if (name.includes(path.sep)) return false;
    if (name.includes("/")) return false;
    if (name.includes("\\")) return false;

    // ..を含む場合は拒否
    if (name === "..") return false;
    if (name.includes("..")) return false;

    // NUL文字を含む場合は拒否
    if (name.includes("\0")) return false;

    return true;
  }

  /**
   * ベースパスを変更する
   * @param newPath 新しいベースパス
   * @throws 無効なパスの場合
   */
  setBasePath(newPath: string): void {
    const resolved = path.resolve(newPath);

    // 新しいパスが有効か検証
    if (!path.isAbsolute(resolved)) {
      throw new Error("Base path must be absolute");
    }

    this.basePath = resolved;
  }

  /**
   * 現在のベースパスを取得する
   */
  getBasePath(): string {
    return this.basePath;
  }
}
```

### 2.3 パス検証のユニットテスト設計

```typescript
// テストケース
describe("SkillScanner path validation", () => {
  test("正常なパスを許可", () => {
    const scanner = new SkillScanner("/home/user/.claude/skills");
    // /home/user/.claude/skills/my-skill/SKILL.md は許可
  });

  test("../を含むパスを拒否", () => {
    const scanner = new SkillScanner("/home/user/.claude/skills");
    // /home/user/.claude/skills/../../../etc/passwd は拒否
  });

  test("ベースパス外へのアクセスを拒否", () => {
    const scanner = new SkillScanner("/home/user/.claude/skills");
    // /etc/passwd は拒否
  });

  test("シンボリックリンクを追跡して検証", () => {
    // シンボリックリンクの実パスがベースパス外の場合は拒否
  });

  test("隠しディレクトリを除外", () => {
    // .hidden-skill は除外
  });
});
```

---

## 3. IPC sender検証

### 3.1 設計方針

- すべてのIPCハンドラーでsender検証を実施
- DevToolsからの呼び出しを拒否
- 有効なBrowserWindowからの呼び出しのみ許可
- 将来的にウィンドウIDのホワイトリスト管理を可能に

### 3.2 実装設計

```typescript
// apps/desktop/src/main/infrastructure/security/ipc-validator.ts

import { WebContents, BrowserWindow } from "electron";

/**
 * IPC senderが許可されたBrowserWindowからの呼び出しかを検証
 * @param sender IPC呼び出し元のWebContents
 * @returns 許可された呼び出しの場合true
 */
export function validateIpcSender(sender: WebContents): boolean {
  // 1. DevToolsからの呼び出しを検出・拒否
  const url = sender.getURL();
  if (url.startsWith("devtools://")) {
    console.warn(
      "IPC call rejected: DevTools origin detected",
      url.substring(0, 50),
    );
    return false;
  }

  // 2. chrome-extension://やfile://など不正なプロトコルを拒否
  if (!isAllowedProtocol(url)) {
    console.warn("IPC call rejected: Invalid protocol", url.substring(0, 50));
    return false;
  }

  // 3. senderに対応するBrowserWindowを取得
  const window = BrowserWindow.fromWebContents(sender);
  if (!window) {
    console.warn("IPC call rejected: No associated BrowserWindow");
    return false;
  }

  // 4. ウィンドウが破棄されていないことを確認
  if (window.isDestroyed()) {
    console.warn("IPC call rejected: Window is destroyed");
    return false;
  }

  // 5. 将来的にはウィンドウIDのホワイトリスト検証を追加可能
  // if (!allowedWindowIds.has(window.id)) {
  //   console.warn('IPC call rejected: Window not in allowlist');
  //   return false;
  // }

  return true;
}

/**
 * 許可されたプロトコルかを検証
 * @param url 検証対象のURL
 */
function isAllowedProtocol(url: string): boolean {
  // 空のURLは拒否
  if (!url) return false;

  // 許可されたプロトコル
  const allowedProtocols = [
    "http://localhost",
    "https://localhost",
    "app://", // Electronカスタムプロトコル
  ];

  return allowedProtocols.some((protocol) => url.startsWith(protocol));
}

/**
 * IPC sender検証のラッパー（エラーメッセージ付き）
 * @param sender IPC呼び出し元のWebContents
 * @param channelName チャネル名（ログ用）
 * @throws 検証失敗時にIPCErrorをスロー
 */
export function validateIpcSenderOrThrow(
  sender: WebContents,
  channelName: string,
): void {
  if (!validateIpcSender(sender)) {
    console.error(`IPC validation failed for channel: ${channelName}`);
    throw {
      code: "AUTH_ERROR",
      message: "Unauthorized IPC call",
    };
  }
}
```

### 3.3 検証ポイントの詳細

| 検証項目               | 理由                                         |
| ---------------------- | -------------------------------------------- |
| DevTools URL検出       | DevToolsコンソールからの攻撃を防止           |
| プロトコル検証         | 不正なオリジンからの呼び出しを防止           |
| BrowserWindow存在確認  | 正規のウィンドウからの呼び出しか確認         |
| ウィンドウ破棄チェック | 破棄されたウィンドウからの遅延呼び出しを防止 |

### 3.4 IPC sender検証のユニットテスト設計

```typescript
// テストケース
describe("validateIpcSender", () => {
  test("正規のBrowserWindowからの呼び出しを許可", () => {
    // mock WebContents with valid URL and associated BrowserWindow
  });

  test("DevToolsからの呼び出しを拒否", () => {
    // mock WebContents with devtools:// URL
  });

  test("BrowserWindowが存在しない場合は拒否", () => {
    // mock WebContents without associated BrowserWindow
  });

  test("不正なプロトコルからの呼び出しを拒否", () => {
    // mock WebContents with chrome-extension:// URL
  });

  test("破棄されたウィンドウからの呼び出しを拒否", () => {
    // mock destroyed BrowserWindow
  });
});
```

---

## 4. 入力バリデーション

### 4.1 設計方針

- すべてのIPC引数をMain Processで検証
- Rendererからの入力を信頼しない
- 型チェックと値チェックの両方を実施
- バリデーションエラーは詳細情報を含めて返却

### 4.2 バリデーションルール

| フィールド | 型       | バリデーション                         |
| ---------- | -------- | -------------------------------------- |
| skillId    | string   | 非空、64文字以内、英数字・ハイフンのみ |
| skillIds   | string[] | 配列、各要素がskillIdルールに準拠      |
| basePath   | string   | 絶対パス、存在するディレクトリ         |

### 4.3 実装設計

```typescript
// apps/desktop/src/main/infrastructure/validation/skill-validators.ts

import * as path from "path";
import * as fs from "fs/promises";
import type { IPCError } from "@repo/shared/types/agent";

/**
 * skillIdのバリデーション
 * @param skillId 検証対象のスキルID
 * @throws バリデーションエラー時にIPCErrorをスロー
 */
export function validateSkillId(skillId: unknown): asserts skillId is string {
  if (typeof skillId !== "string") {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "skillId must be a string",
      details: { field: "skillId", received: typeof skillId },
    };
    throw error;
  }

  if (skillId.length === 0) {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "skillId must not be empty",
      details: { field: "skillId" },
    };
    throw error;
  }

  if (skillId.length > 64) {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "skillId must be 64 characters or less",
      details: { field: "skillId", length: skillId.length },
    };
    throw error;
  }

  // 英数字、ハイフン、アンダースコアのみ許可
  if (!/^[a-zA-Z0-9_-]+$/.test(skillId)) {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message:
        "skillId must contain only alphanumeric characters, hyphens, and underscores",
      details: { field: "skillId" },
    };
    throw error;
  }
}

/**
 * skillIdsのバリデーション
 * @param skillIds 検証対象のスキルID配列
 * @throws バリデーションエラー時にIPCErrorをスロー
 */
export function validateSkillIds(
  skillIds: unknown,
): asserts skillIds is string[] {
  if (!Array.isArray(skillIds)) {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "skillIds must be an array",
      details: { field: "skillIds", received: typeof skillIds },
    };
    throw error;
  }

  if (skillIds.length === 0) {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "skillIds must not be empty",
      details: { field: "skillIds" },
    };
    throw error;
  }

  // 各要素を検証
  for (let i = 0; i < skillIds.length; i++) {
    try {
      validateSkillId(skillIds[i]);
    } catch (e) {
      const error: IPCError = {
        code: "VALIDATION_ERROR",
        message: `Invalid skillId at index ${i}: ${(e as IPCError).message}`,
        details: { field: "skillIds", index: i },
      };
      throw error;
    }
  }
}

/**
 * basePathのバリデーション
 * @param basePath 検証対象のベースパス
 * @throws バリデーションエラー時にIPCErrorをスロー
 */
export async function validateBasePath(
  basePath: unknown,
): Promise<asserts basePath is string> {
  if (typeof basePath !== "string") {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "basePath must be a string",
      details: { field: "basePath", received: typeof basePath },
    };
    throw error;
  }

  // 絶対パスであることを確認
  if (!path.isAbsolute(basePath)) {
    const error: IPCError = {
      code: "VALIDATION_ERROR",
      message: "basePath must be an absolute path",
      details: { field: "basePath" },
    };
    throw error;
  }

  // ディレクトリが存在することを確認
  try {
    const stat = await fs.stat(basePath);
    if (!stat.isDirectory()) {
      const error: IPCError = {
        code: "VALIDATION_ERROR",
        message: "basePath must be a directory",
        details: { field: "basePath" },
      };
      throw error;
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      const error: IPCError = {
        code: "VALIDATION_ERROR",
        message: "basePath directory does not exist",
        details: { field: "basePath" },
      };
      throw error;
    }
    throw e;
  }
}
```

---

## 5. エラー情報の制限

### 5.1 設計方針

- セキュリティ関連エラーは詳細情報を返さない
- 内部エラーのスタックトレースは本番環境で非表示
- ログには詳細を記録、レスポンスには最小限の情報

### 5.2 エラーレスポンスの設計

```typescript
// apps/desktop/src/main/infrastructure/error/error-handler.ts

import type { IPCError } from "@repo/shared/types/agent";

/**
 * セキュリティエラーを安全な形式に変換
 * 詳細情報を削除してユーザーに返却
 */
export function sanitizeSecurityError(error: unknown): IPCError {
  // ログには詳細を記録
  console.error("Security error:", error);

  // ユーザーには最小限の情報のみ返却
  return {
    code: "AUTH_ERROR",
    message: "Unauthorized access",
    // detailsは意図的に省略
  };
}

/**
 * パストラバーサルエラーを安全な形式に変換
 */
export function sanitizePathTraversalError(error: unknown): IPCError {
  // ログには詳細を記録
  console.error("Path traversal detected:", error);

  // ユーザーには最小限の情報のみ返却
  return {
    code: "PATH_TRAVERSAL",
    message: "Invalid path",
    // 攻撃者に情報を与えないため、詳細は省略
  };
}

/**
 * 内部エラーを安全な形式に変換
 */
export function sanitizeInternalError(
  error: unknown,
  isDevelopment: boolean,
): IPCError {
  // ログには詳細を記録
  console.error("Internal error:", error);

  const baseError: IPCError = {
    code: "INTERNAL_ERROR",
    message: "An internal error occurred",
  };

  // 開発環境ではデバッグ情報を含める
  if (isDevelopment) {
    baseError.details = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  return baseError;
}
```

---

## 6. セキュリティチェックリスト

### 6.1 実装時チェックリスト

- [ ] すべてのIPCハンドラーでvalidateIpcSenderを呼び出し
- [ ] すべてのパス操作でvalidatePathを呼び出し
- [ ] すべての入力引数でバリデーションを実施
- [ ] エラーレスポンスで機密情報を漏洩しない
- [ ] DevToolsからの呼び出しを拒否

### 6.2 テスト時チェックリスト

- [ ] パストラバーサル攻撃のテスト
- [ ] DevToolsからの呼び出しテスト
- [ ] 不正なプロトコルからの呼び出しテスト
- [ ] 入力バリデーションエラーのテスト
- [ ] エラーレスポンスの情報漏洩テスト

### 6.3 コードレビューチェックリスト

- [ ] パス操作にpath.resolve()を使用している
- [ ] ユーザー入力を直接パスに使用していない
- [ ] すべてのIPCハンドラーでsender検証がある
- [ ] エラーメッセージに機密情報が含まれていない
