# Phase 2: IPC API 設計書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | TASK-9F       |
| Phase      | 2             |
| 成果物     | IPC API設計書 |
| 作成日     | 2026-02-27    |
| 機能名     | skill-share   |
| ステータス | 完了          |

---

## 1. IPC チャネル設計（3チャネル）

### 1.1 チャネル定義追加

`apps/desktop/src/preload/channels.ts` に以下を追加する:

```typescript
// Skill Share チャネル
SKILL_IMPORT_FROM_SOURCE: "skill:importFromSource",
SKILL_EXPORT: "skill:export",
SKILL_VALIDATE_SOURCE: "skill:validateSource",
// プログレスイベント
SKILL_IMPORT_PROGRESS: "skill:importFromSource:progress",
SKILL_EXPORT_PROGRESS: "skill:export:progress",
```

ホワイトリストにも上記5チャネルを追加する。

### 1.2 skill:importFromSource ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE,
  async (event: IpcMainInvokeEvent, source: unknown) => {
    // 1. Sender検証
    validateIpcSender(event, { ... });

    // 2. 引数バリデーション（ShareTarget構造検証）
    const validatedSource = validateShareTarget(source);
    if (!validatedSource.success) {
      return { success: false, error: validatedSource.error };
    }

    // 3. SkillShareManager呼び出し
    const result = await skillShareManager.importFromSource(validatedSource.data);

    // 4. エラーサニタイズして返却
    if (!result.success) {
      return { success: false, error: sanitizeErrorMessage(result.error) };
    }
    return { success: true, data: result.data };
  }
);
```

| 項目           | 内容                                                |
| -------------- | --------------------------------------------------- |
| チャネル名     | `skill:importFromSource`                            |
| 方向           | Renderer → Main                                     |
| 引数型         | `ShareTarget`（unknown として受信しバリデーション） |
| 返却型         | `IpcResult<ImportResult>`                           |
| バリデーション | validateIpcSender + validateShareTarget             |

### 1.3 skill:export ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXPORT,
  async (event: IpcMainInvokeEvent, args: unknown) => {
    // 1. Sender検証
    validateIpcSender(event, { ... });

    // 2. 引数バリデーション
    //    args = { skillName: string, destination: ShareTarget }
    const validated = validateExportArgs(args);
    if (!validated.success) {
      return { success: false, error: validated.error };
    }

    // 3. skillName の P42準拠3段バリデーション
    const { skillName, destination } = validated.data;
    if (typeof skillName !== "string" || skillName.trim() === "") {
      return { success: false, error: "skillName must be a non-empty string" };
    }

    // 4. SkillShareManager呼び出し
    const result = await skillShareManager.exportSkill(skillName.trim(), destination);

    // 5. エラーサニタイズして返却
    if (!result.success) {
      return { success: false, error: sanitizeErrorMessage(result.error) };
    }
    return { success: true, data: result.data };
  }
);
```

| 項目           | 内容                                                           |
| -------------- | -------------------------------------------------------------- |
| チャネル名     | `skill:export`                                                 |
| 方向           | Renderer → Main                                                |
| 引数型         | `{ skillName: string, destination: ShareTarget }`              |
| 返却型         | `IpcResult<ExportResult>`                                      |
| バリデーション | validateIpcSender + validateExportArgs + P42 3段バリデーション |

### 1.4 skill:validateSource ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_VALIDATE_SOURCE,
  async (event: IpcMainInvokeEvent, source: unknown) => {
    // 1. Sender検証
    validateIpcSender(event, { ... });

    // 2. 引数バリデーション
    const validatedSource = validateShareTarget(source);
    if (!validatedSource.success) {
      return { success: false, error: validatedSource.error };
    }

    // 3. SkillShareManager呼び出し
    const result = await skillShareManager.validateSource(validatedSource.data);

    // 4. エラーサニタイズして返却
    if (!result.success) {
      return { success: false, error: sanitizeErrorMessage(result.error) };
    }
    return { success: true, data: result.data };
  }
);
```

| 項目           | 内容                                                |
| -------------- | --------------------------------------------------- |
| チャネル名     | `skill:validateSource`                              |
| 方向           | Renderer → Main                                     |
| 引数型         | `ShareTarget`（unknown として受信しバリデーション） |
| 返却型         | `IpcResult<SourceValidation>`                       |
| バリデーション | validateIpcSender + validateShareTarget             |

---

## 2. ShareTarget バリデーション関数設計

### validateShareTarget

```typescript
function validateShareTarget(source: unknown): Result<ShareTarget, string> {
  // Step 1: オブジェクト型チェック
  if (typeof source !== "object" || source === null) {
    return { success: false, error: "source must be a non-null object" };
  }

  const obj = source as Record<string, unknown>;

  // Step 2: type フィールド検証
  if (
    typeof obj.type !== "string" ||
    !["github", "gist", "url", "local"].includes(obj.type)
  ) {
    return {
      success: false,
      error: "source.type must be one of: github, gist, url, local",
    };
  }

  // Step 3: type別の必須フィールドバリデーション（P42準拠3段バリデーション）
  switch (obj.type) {
    case "github":
      if (typeof obj.repo !== "string" || obj.repo.trim() === "") {
        return {
          success: false,
          error: "source.repo must be a non-empty string for github type",
        };
      }
      // repo形式検証: "owner/repo"
      if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(obj.repo.trim())) {
        return {
          success: false,
          error: "source.repo must be in 'owner/repo' format",
        };
      }
      // branch, path はオプション（指定時のみ検証）
      break;

    case "gist":
      if (typeof obj.gistId !== "string" || obj.gistId.trim() === "") {
        return {
          success: false,
          error: "source.gistId must be a non-empty string for gist type",
        };
      }
      break;

    case "url":
      if (typeof obj.url !== "string" || obj.url.trim() === "") {
        return {
          success: false,
          error: "source.url must be a non-empty string for url type",
        };
      }
      // HTTPS強制
      if (!obj.url.trim().startsWith("https://")) {
        return { success: false, error: "source.url must use HTTPS protocol" };
      }
      break;

    case "local":
      if (typeof obj.localPath !== "string" || obj.localPath.trim() === "") {
        return {
          success: false,
          error: "source.localPath must be a non-empty string for local type",
        };
      }
      // パストラバーサル検出
      if (obj.localPath.includes("..")) {
        return {
          success: false,
          error: "source.localPath must not contain path traversal segments",
        };
      }
      break;
  }

  return { success: true, data: obj as ShareTarget };
}
```

### P42準拠3段バリデーション対応表

| フィールド                      | 型チェック            | 空文字列チェック | トリム空文字列チェック |
| ------------------------------- | --------------------- | ---------------- | ---------------------- |
| `ShareTarget.repo` (github)     | `typeof === "string"` | `=== ""`         | `.trim() === ""`       |
| `ShareTarget.gistId` (gist)     | `typeof === "string"` | `=== ""`         | `.trim() === ""`       |
| `ShareTarget.url` (url)         | `typeof === "string"` | `=== ""`         | `.trim() === ""`       |
| `ShareTarget.localPath` (local) | `typeof === "string"` | `=== ""`         | `.trim() === ""`       |
| `export args.skillName`         | `typeof === "string"` | `=== ""`         | `.trim() === ""`       |

### 追加バリデーション

| フィールド              | 追加検証                                    |
| ----------------------- | ------------------------------------------- |
| `ShareTarget.repo`      | `owner/repo` 形式の正規表現マッチ           |
| `ShareTarget.url`       | `https://` プレフィックスの確認             |
| `ShareTarget.localPath` | `..` セグメント検出（パストラバーサル防止） |

---

## 3. Preload API 追加設計

### 3.1 skill-api.ts 追加メソッド（5メソッド）

`apps/desktop/src/preload/skill-api.ts` に以下を追加:

```typescript
importFromSource: (source: ShareTarget): Promise<IpcResult<ImportResult>> =>
  safeInvoke<IpcResult<ImportResult>>(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source),

exportSkill: (skillName: string, destination: ShareTarget): Promise<IpcResult<ExportResult>> =>
  safeInvoke<IpcResult<ExportResult>>(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination }),

validateSource: (source: ShareTarget): Promise<IpcResult<SourceValidation>> =>
  safeInvoke<IpcResult<SourceValidation>>(IPC_CHANNELS.SKILL_VALIDATE_SOURCE, source),

onImportProgress: (callback: (progress: ImportProgress) => void) =>
  safeOn<ImportProgress>(IPC_CHANNELS.SKILL_IMPORT_PROGRESS, callback),

onExportProgress: (callback: (progress: ExportProgress) => void) =>
  safeOn<ExportProgress>(IPC_CHANNELS.SKILL_EXPORT_PROGRESS, callback),
```

### 3.2 Preload 型定義追加

`apps/desktop/src/preload/types.ts` の `SkillAPI` インターフェースに以下を追加:

```typescript
interface SkillAPI {
  // ... 既存メソッド ...

  // TASK-9F: スキル共有
  importFromSource: (source: ShareTarget) => Promise<IpcResult<ImportResult>>;
  exportSkill: (
    skillName: string,
    destination: ShareTarget,
  ) => Promise<IpcResult<ExportResult>>;
  validateSource: (source: ShareTarget) => Promise<IpcResult<SourceValidation>>;
  onImportProgress: (
    callback: (progress: ImportProgress) => void,
  ) => () => void;
  onExportProgress: (
    callback: (progress: ExportProgress) => void,
  ) => () => void;
}
```

---

## 4. 型定義設計

### 4.1 配置: `packages/shared/src/types/skill-share.ts`

```typescript
// --- ShareTarget discriminated union ---

export interface ShareTargetGitHub {
  type: "github";
  repo: string; // "owner/repo" 形式（必須）
  branch?: string; // デフォルト: "main"
  path?: string; // デフォルト: "/" (リポジトリルート)
}

export interface ShareTargetGist {
  type: "gist";
  gistId: string; // Gist ID（必須）
}

export interface ShareTargetURL {
  type: "url";
  url: string; // HTTPS URL（必須）
}

export interface ShareTargetLocal {
  type: "local";
  localPath: string; // 絶対パス（必須）
}

export type ShareTarget =
  | ShareTargetGitHub
  | ShareTargetGist
  | ShareTargetURL
  | ShareTargetLocal;

// --- Result types ---

export interface ImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  importedAt: string; // ISO 8601 文字列（IPC境界用）
}

export interface ExportResult {
  success: boolean;
  destination: ShareTarget;
  exportedFiles: string[];
  shareUrl?: string; // Gistエクスポート時のみ
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  skillMetadata?: {
    name: string;
    description: string;
    triggers: string[];
  };
}

export interface SourceValidation {
  isReachable: boolean;
  hasSkillMd: boolean;
  errors: string[];
}

// --- Progress types ---

export interface ImportProgress {
  phase: "validating" | "downloading" | "copying" | "verifying";
  percentage: number; // 0-100
  message: string;
}

export interface ExportProgress {
  phase: "preparing" | "uploading" | "finalizing";
  percentage: number; // 0-100
  message: string;
}

// --- Error types ---

export interface SkillShareError {
  code: number; // エラーコード（1000-5999）
  message: string;
  category:
    | "validation"
    | "business"
    | "external"
    | "infrastructure"
    | "internal";
  isRetryable: boolean;
  details?: string;
}

// --- Skill file set (エクスポート用) ---

export interface SkillFileSet {
  skillMd: string; // SKILL.md の内容
  additionalFiles: Map<string, string>; // ファイル名 → 内容
}
```

### 4.2 packages/shared/src/types/index.ts への追加

```typescript
export * from "./share";
```

### 4.3 IPC境界のDate型処理

- **Main Process内部**: `Date` オブジェクトを使用
- **IPC境界（ハンドラ戻り値）**: `.toISOString()` でISO 8601文字列に変換
- **Renderer側**: `string` として受け取り、表示時に `new Date(isoString)` で復元

### 4.4 SkillFileSet のIPC境界変換

`SkillFileSet` の `additionalFiles` は `Map<string, string>` を使用する。IPC境界を超える場合は `Object.fromEntries()` で `Record<string, string>` に変換して送信する。

---

## 5. GitHub認証設計

### 5.1 GitHubClient（Octokitラッパー）

```typescript
class GitHubClient {
  private octokit: Octokit | null = null;

  constructor(private readonly tokenProvider: () => Promise<string | null>) {}

  private async getOctokit(): Promise<Octokit> {
    const token = await this.tokenProvider();
    // トークンなし = パブリックリポジトリアクセスのみ（rate limit低い）
    this.octokit = new Octokit(token ? { auth: token } : {});
    return this.octokit;
  }

  async getRepoContents(
    repo: string,
    path: string,
    branch: string,
  ): Promise<Result<FileContent[], SkillShareError>> { ... }

  async getGist(
    gistId: string,
  ): Promise<Result<GistContent, SkillShareError>> { ... }

  async createGist(
    files: Record<string, { content: string }>,
    description: string,
    isPublic: boolean,
  ): Promise<Result<{ url: string }, SkillShareError>> { ... }
}
```

**tokenProvider パターン**: GitHubClientはトークンの保存場所を知らない。`tokenProvider` コールバックを通じてMain Processの暗号化ストレージからPATを取得する。これにより、ストレージ実装の変更がGitHubClientに影響しない。

### 5.2 PAT保存・取得設計

| 項目           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| 保存先         | Main Processの暗号化ストレージ（electron-store + safeStorageを使用）                        |
| キー           | `github.personalAccessToken`                                                                |
| 取得フロー     | SkillShareManager → GitHubClient → tokenProvider() → 暗号化ストレージ                       |
| 設定UI         | 設定画面の「GitHub連携」セクションからPATを入力・保存（Renderer → IPC → Main → 暗号化保存） |
| Renderer非送信 | PATはMain Processに留め、Rendererにはトークンの「設定済み/未設定」ステータスのみ返却する    |

### 5.3 Rate limit 対策

| 項目               | 内容                                                         |
| ------------------ | ------------------------------------------------------------ |
| 認証なしrate limit | 60回/時                                                      |
| 認証ありrate limit | 5000回/時                                                    |
| 残りリクエスト確認 | `X-RateLimit-Remaining` ヘッダーを確認                       |
| rate limit到達時   | `X-RateLimit-Reset` のタイムスタンプまで待機                 |
| 429レスポンス時    | `Retry-After` ヘッダーの秒数だけ待機して自動リトライ         |
| 最大リトライ回数   | 3回                                                          |
| リトライ情報通知   | SkillShareErrorの `details` フィールドに含めてRendererに通知 |
