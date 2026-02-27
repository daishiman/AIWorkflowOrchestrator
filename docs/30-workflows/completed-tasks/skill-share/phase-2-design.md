# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase 番号 | 2                                                               |
| Phase 名   | 設計                                                            |
| 目的       | スキル共有機能のアーキテクチャ・IPC通信・型定義・認証設計を行う |
| 前提Phase  | Phase 1: 要件定義                                               |
| 後続Phase  | Phase 3: 設計レビュー                                           |
| ステータス | 未実施                                                          |
| 作成日     | 2026-02-27                                                      |
| 機能名     | skill-share                                                     |

## 目的

Phase 1で定義したFR-1〜FR-8、NFR-1〜NFR-4を実現するためのアーキテクチャ設計を行う。SkillShareManagerのクラス設計（Strategyパターン）、IPC通信設計（3チャネル）、型定義設計（ShareTarget discriminated union）、GitHub認証設計（PAT＋Octokit）、シーケンス図を作成する。

## 実行タスク

- **Task 1: アーキテクチャ設計** — SkillShareManagerのクラス設計、Strategyパターンによるインポート/エクスポート戦略分離、DI設計を行う
- **Task 2: IPC通信設計** — 3チャネル（skill:importFromSource, skill:export, skill:validateSource）のハンドラ設計、バリデーション設計を行う
- **Task 3: 型定義設計** — ShareTarget discriminated union、ImportResult/ExportResult、IPC境界のDate型処理を設計する
- **Task 4: GitHub認証設計** — Octokit初期化、PAT保存・取得、rate limit対策を設計する
- **Task 5: シーケンス図** — インポートフロー・エクスポートフローのシーケンス図を作成する

## 参照資料

| 参照資料               | パス                                                         | 内容                         |
| ---------------------- | ------------------------------------------------------------ | ---------------------------- |
| Phase 1 要件定義       | `docs/30-workflows/skill-share/phase-1-requirements.md`      | FR/NFR/受入基準              |
| 既存SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`       | DI/Setter Injectionの実装例  |
| 既存SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | インポート設定永続化パターン |
| 既存skillHandlers      | `apps/desktop/src/main/ipc/skillHandlers.share.ts`           | ハンドラ登録パターン         |
| 既存channels           | `apps/desktop/src/preload/channels.ts`                       | IPC_CHANNELSホワイトリスト   |
| 既存skill-api          | `apps/desktop/src/preload/skill-api.ts`                      | safeInvoke/safeOnパターン    |
| 既存Preload型定義      | `apps/desktop/src/preload/types.ts`                          | ElectronAPI型定義            |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                        | 内容                                 |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| アーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Pattern3 IPC登録パターン             |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI/Setter Injection/Strategyパターン |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | ハンドラ登録・バリデーション標準     |
| 型定義（Skill共有） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ShareTarget/ImportResult契約の整合   |
| セキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | contextBridge/validateIpcSender設計  |
| Electron IPC        | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキルIPC固有のセキュリティ設計      |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Preload API公開境界の防御要件        |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result\<T,E\>パターン・エラーコード  |

## 実行手順

### Step 1: アーキテクチャ設計

#### 1.1 SkillShareManager クラス設計

**配置**: `apps/desktop/src/main/services/skill/SkillShareManager.ts`

**責務**: 外部ソースからのスキルインポート、スキルのエクスポート、インポート前検証を統括する。Strategyパターンで各ソースタイプの処理を分離する。

```
SkillShareManager
├── importFromSource(source: ShareTarget): Promise<Result<ImportResult, SkillShareError>>
├── exportSkill(skillName: string, destination: ShareTarget): Promise<Result<ExportResult, SkillShareError>>
├── validateSource(source: ShareTarget): Promise<Result<SourceValidation, SkillShareError>>
├── validateImport(skillPath: string): Promise<Result<ImportValidation, SkillShareError>>
│
├── [private] strategies: Map<ShareTarget["type"], ImportStrategy>
├── [private] exportStrategies: Map<ShareTarget["type"], ExportStrategy>
├── [private] gitHubClient: GitHubClient
├── [private] fileSystem: FileSystemAdapter
└── [private] skillValidator: SkillValidator
```

#### 1.2 Strategy パターン設計

**インポートストラテジーインターフェース**:

```typescript
interface ImportStrategy {
  import(source: ShareTarget): Promise<Result<ImportResult, SkillShareError>>;
  validate(
    source: ShareTarget,
  ): Promise<Result<SourceValidation, SkillShareError>>;
}
```

**具象ストラテジー**:

| ストラテジー           | 対応ソース | 外部依存              |
| ---------------------- | ---------- | --------------------- |
| `GitHubImportStrategy` | `github`   | Octokit（GitHub API） |
| `GistImportStrategy`   | `gist`     | Octokit（Gist API）   |
| `UrlImportStrategy`    | `url`      | Node.js https module  |
| `LocalImportStrategy`  | `local`    | Node.js fs module     |

**エクスポートストラテジーインターフェース**:

```typescript
interface ExportStrategy {
  export(
    skillName: string,
    skillFiles: SkillFileSet,
    destination: ShareTarget,
  ): Promise<Result<ExportResult, SkillShareError>>;
}
```

**具象エクスポートストラテジー**:

| ストラテジー          | 対応先  | 外部依存            |
| --------------------- | ------- | ------------------- |
| `GistExportStrategy`  | `gist`  | Octokit（Gist API） |
| `LocalExportStrategy` | `local` | Node.js fs module   |

#### 1.3 DI 設計

**Constructor Injection（起動時に利用可能な依存）**:

```typescript
constructor(
  private readonly gitHubClient: GitHubClient,
  private readonly fileSystem: FileSystemAdapter,
  private readonly skillValidator: SkillValidator,
  private readonly skillService: SkillService,
)
```

**Setter Injection（遅延初期化が必要な依存 — P34対策）**:

```typescript
setMainWindow(mainWindow: BrowserWindow): void
```

BrowserWindowは起動後に生成されるため、Constructor Injectionでは対応できない。プログレスイベント送信時にmainWindowが必要なため、Setter Injectionで注入する。

#### 1.4 サービス層配置

```
apps/desktop/src/main/services/skill/
├── SkillService.ts              (既存: 総合管理)
├── SkillShareManager.ts         (新規: 共有機能統括)
├── strategies/                  (新規: Strategyディレクトリ)
│   ├── ImportStrategy.ts        (新規: インターフェース定義)
│   ├── ExportStrategy.ts        (新規: インターフェース定義)
│   ├── GitHubImportStrategy.ts  (新規)
│   ├── GistImportStrategy.ts    (新規)
│   ├── UrlImportStrategy.ts     (新規)
│   ├── LocalImportStrategy.ts   (新規)
│   ├── GistExportStrategy.ts    (新規)
│   └── LocalExportStrategy.ts   (新規)
├── adapters/                    (新規: 外部サービスアダプタ)
│   ├── GitHubClient.ts          (新規: Octokitラッパー)
│   └── FileSystemAdapter.ts     (新規: fs操作抽象化)
├── validators/                  (新規: 検証ロジック)
│   └── SkillValidator.ts        (新規: SKILL.md構造検証)
├── SkillScanner.ts              (既存)
├── SkillImportManager.ts        (既存)
├── SkillExecutor.ts             (既存)
└── ...
```

### Step 2: IPC通信設計

#### 2.1 チャネル定義追加

`apps/desktop/src/preload/channels.ts` に以下を追加:

```typescript
// Skill Share チャネル
SKILL_IMPORT_FROM_SOURCE: "skill:importFromSource",
SKILL_EXPORT: "skill:export",
SKILL_VALIDATE_SOURCE: "skill:validateSource",
// プログレスイベント
SKILL_IMPORT_PROGRESS: "skill:importFromSource:progress",
SKILL_EXPORT_PROGRESS: "skill:export:progress",
```

#### 2.2 ハンドラ設計

**skill:importFromSource ハンドラ**:

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

**skill:export ハンドラ**:

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

**skill:validateSource ハンドラ**:

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

#### 2.3 ShareTarget バリデーション関数設計

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

#### 2.4 Preload API追加

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

#### 2.5 Preload 型定義追加

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

### Step 3: 型定義設計

#### 3.1 共有型定義ファイル

**配置**: `packages/shared/src/types/skill-share.ts`

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

#### 3.2 packages/shared/src/types/index.ts への追加

```typescript
export * from "./share";
```

### Step 4: GitHub認証設計

#### 4.1 Octokit初期化パターン

```typescript
// GitHubClient クラス（apps/desktop/src/main/services/skill/adapters/GitHubClient.ts）

class GitHubClient {
  private octokit: Octokit | null = null;

  constructor(private readonly tokenProvider: () => Promise<string | null>) {}

  private async getOctokit(): Promise<Octokit> {
    const token = await this.tokenProvider();
    // トークンなし = パブリックリポジトリアクセスのみ（rate limit低い）
    this.octokit = new Octokit(token ? { auth: token } : {});
    return this.octokit;
  }

  async getRepoContents(repo: string, path: string, branch: string): Promise<Result<FileContent[], SkillShareError>> { ... }
  async getGist(gistId: string): Promise<Result<GistContent, SkillShareError>> { ... }
  async createGist(files: Record<string, { content: string }>, description: string, isPublic: boolean): Promise<Result<{ url: string }, SkillShareError>> { ... }
}
```

#### 4.2 PAT保存・取得設計

- **保存先**: Main Processの暗号化ストレージ（electron-store + safeStorageを使用）
- **キー**: `github.personalAccessToken`
- **取得フロー**: `SkillShareManager` → `GitHubClient` → `tokenProvider()` → 暗号化ストレージ
- **設定UI**: 設定画面の「GitHub連携」セクションからPATを入力・保存（Renderer → IPC → Main → 暗号化保存）
- **Rendererへの非送信**: PATはMain Processに留め、Rendererにはトークンの「設定済み/未設定」ステータスのみ返却する

#### 4.3 Rate limit 対策

- GitHub API rate limit: 認証なし60回/時、認証あり5000回/時
- レスポンスヘッダー `X-RateLimit-Remaining` を確認し、残り0の場合は `X-RateLimit-Reset` のタイムスタンプまで待機する
- 429レスポンス時は `Retry-After` ヘッダーの秒数だけ待機して自動リトライ（最大3回）
- rate limit情報はSkillShareErrorの `details` フィールドに含めてRendererに通知する

### Step 5: シーケンス図

#### 5.1 インポートフロー（GitHubリポジトリ）

```
Renderer          Preload              Main (Handler)        SkillShareManager     GitHubImportStrategy   GitHubClient       FileSystem
   │                 │                      │                      │                      │                    │                 │
   │ importFromSource│                      │                      │                      │                    │                 │
   │ (ShareTarget)   │                      │                      │                      │                    │                 │
   │────────────────>│                      │                      │                      │                    │                 │
   │                 │ safeInvoke(          │                      │                      │                    │                 │
   │                 │  SKILL_IMPORT_FROM_  │                      │                      │                    │                 │
   │                 │  SOURCE, source)     │                      │                      │                    │                 │
   │                 │─────────────────────>│                      │                      │                    │                 │
   │                 │                      │ validateIpcSender()  │                      │                    │                 │
   │                 │                      │ validateShareTarget()│                      │                    │                 │
   │                 │                      │                      │                      │                    │                 │
   │                 │                      │ importFromSource()   │                      │                    │                 │
   │                 │                      │─────────────────────>│                      │                    │                 │
   │                 │                      │                      │ strategies.get()     │                    │                 │
   │                 │                      │                      │ ──> GitHubImport     │                    │                 │
   │                 │                      │                      │                      │                    │                 │
   │                 │                      │                      │ import(source)       │                    │                 │
   │                 │                      │                      │─────────────────────>│                    │                 │
   │                 │                      │                      │                      │ getRepoContents() │                 │
   │                 │                      │                      │                      │───────────────────>│                 │
   │                 │                      │                      │                      │                    │ GET /repos/     │
   │                 │                      │                      │                      │                    │ owner/repo/     │
   │                 │                      │                      │                      │                    │ contents/path   │
   │                 │                      │                      │                      │<───────────────────│                 │
   │                 │                      │                      │                      │                    │                 │
   │<─ ─ ─ ─ ─ ─ ─ ─│ progress event       │                      │                      │                    │                 │
   │  (downloading)  │                      │                      │                      │                    │                 │
   │                 │                      │                      │                      │ writeFiles()      │                 │
   │                 │                      │                      │                      │──────────────────────────────────────>│
   │                 │                      │                      │                      │                    │                 │
   │<─ ─ ─ ─ ─ ─ ─ ─│ progress event       │                      │                      │                    │                 │
   │  (copying)      │                      │                      │                      │                    │                 │
   │                 │                      │                      │                      │                    │                 │
   │                 │                      │                      │ validateImport()     │                    │                 │
   │                 │                      │                      │─────────────────────>│                    │                 │
   │                 │                      │                      │<─────────────────────│                    │                 │
   │                 │                      │                      │                      │                    │                 │
   │                 │                      │<─────────────────────│                      │                    │                 │
   │                 │                      │  Result<ImportResult>│                      │                    │                 │
   │                 │                      │                      │                      │                    │                 │
   │                 │<─────────────────────│                      │                      │                    │                 │
   │                 │  IpcResult           │                      │                      │                    │                 │
   │<────────────────│                      │                      │                      │                    │                 │
   │  ImportResult   │                      │                      │                      │                    │                 │
```

#### 5.2 エクスポートフロー（Gist）

```
Renderer          Preload              Main (Handler)        SkillShareManager     GistExportStrategy     GitHubClient
   │                 │                      │                      │                      │                    │
   │ exportSkill     │                      │                      │                      │                    │
   │ (name, dest)    │                      │                      │                      │                    │
   │────────────────>│                      │                      │                      │                    │
   │                 │ safeInvoke(          │                      │                      │                    │
   │                 │  SKILL_EXPORT,       │                      │                      │                    │
   │                 │  {skillName, dest})  │                      │                      │                    │
   │                 │─────────────────────>│                      │                      │                    │
   │                 │                      │ validateIpcSender()  │                      │                    │
   │                 │                      │ validate skillName   │                      │                    │
   │                 │                      │ (P42 3段バリデーション) │                   │                    │
   │                 │                      │ validateShareTarget()│                      │                    │
   │                 │                      │                      │                      │                    │
   │                 │                      │ exportSkill()        │                      │                    │
   │                 │                      │─────────────────────>│                      │                    │
   │                 │                      │                      │ readSkillFiles()     │                    │
   │                 │                      │                      │ (SKILL.md + 関連)    │                    │
   │                 │                      │                      │                      │                    │
   │<─ ─ ─ ─ ─ ─ ─ ─│ progress event       │                      │                      │                    │
   │  (preparing)    │                      │                      │                      │                    │
   │                 │                      │                      │                      │                    │
   │                 │                      │                      │ export(name, files,  │                    │
   │                 │                      │                      │        destination)  │                    │
   │                 │                      │                      │─────────────────────>│                    │
   │                 │                      │                      │                      │ createGist()      │
   │                 │                      │                      │                      │───────────────────>│
   │                 │                      │                      │                      │                    │ POST /gists
   │                 │                      │                      │                      │<───────────────────│
   │                 │                      │                      │                      │  { url: gistUrl }  │
   │                 │                      │                      │<─────────────────────│                    │
   │                 │                      │                      │                      │                    │
   │<─ ─ ─ ─ ─ ─ ─ ─│ progress event       │                      │                      │                    │
   │  (finalizing)   │                      │                      │                      │                    │
   │                 │                      │                      │                      │                    │
   │                 │                      │<─────────────────────│                      │                    │
   │                 │                      │ Result<ExportResult> │                      │                    │
   │                 │<─────────────────────│                      │                      │                    │
   │<────────────────│                      │                      │                      │                    │
   │  ExportResult   │                      │                      │                      │                    │
   │  (shareUrl付き) │                      │                      │                      │                    │
```

## 成果物

| 成果物               | 説明                                | 配置先                                   |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| コンポーネント設計書 | クラス図・DI設計・ファイル配置      | `outputs/phase-2/architecture-design.md` |
| IPC API設計書        | 3チャネルのハンドラ・バリデーション | `outputs/phase-2/api-specification.md`   |
| シーケンス図         | インポート/エクスポートフロー       | `outputs/phase-2/sequence-diagrams.md`   |

## 統合テスト連携

- **IPC通信テスト**: 3チャネルの正常系・異常系（バリデーションエラー、認証エラー）をMain Processレベルで検証する
- **Strategyパターンテスト**: 各ストラテジーの個別テスト（モック外部サービス）と、SkillShareManagerを介した統合テストを実施する
- **セキュリティテスト**: validateIpcSenderの呼び出し確認、パストラバーサル防止、HTTPS強制をテストする
- **プログレスイベントテスト**: インポート/エクスポート中のプログレスイベント送信をRendererモックで受信確認する
- **既存機能リグレッション**: 新チャネル追加後も既存の `skill:import`/`skill:remove` が正常動作することを検証する
- **GitHub API モック**: Octokitをモック化し、rate limit/404/認証エラーの応答をシミュレートする

## 完了条件

- [ ] SkillShareManagerのクラス設計（公開メソッド・私有フィールド・DI構成）が完成している
- [ ] Strategyパターンの設計（ImportStrategy/ExportStrategy インターフェース、6つの具象ストラテジー）が完成している
- [ ] DI設計（Constructor Injection 4依存 + Setter Injection 1依存）が完成している
- [ ] サービス層のファイル配置（strategies/, adapters/, validators/ ディレクトリ構成）が確定している
- [ ] 3チャネル（skill:importFromSource, skill:export, skill:validateSource）のハンドラ設計が完成している
- [ ] ShareTarget バリデーション関数の設計（type別P42準拠3段バリデーション）が完成している
- [ ] Preload API（5メソッド追加）の設計が完成している
- [ ] 型定義ファイル（packages/shared/src/types/skill-share.ts）の設計が完成している
- [ ] GitHub認証設計（Octokit初期化・PAT保存・rate limit対策）が完成している
- [ ] シーケンス図（インポートフロー・エクスポートフロー）が作成されている
- [ ] 本Phase内の全タスクを100%実行完了
- [ ] artifacts.jsonが更新されている

## スキル100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー

## 備考

- Strategyパターンを採用する理由: 4種のインポートソースと2種のエクスポート先はそれぞれ外部依存と処理フローが異なる。新しいソース追加時に既存コードを変更せず、新ストラテジークラスを追加するだけで対応できる（Open/Closed Principle）
- `SkillFileSet` の `additionalFiles` は `Map<string, string>` を使用し、ファイル名の重複を防止する。IPC境界を超える場合は `Object.fromEntries()` で `Record<string, string>` に変換して送信する
- GitHubClient はOctokitの薄いラッパーとして実装し、Result\<T, E\>パターンでエラーを返却する。Octokit固有の例外をキャッチしてSkillShareErrorに変換する
- FileSystemAdapter は Node.js の `fs/promises` をラップし、パストラバーサル検出・権限チェック・ディスク容量チェックを内包する。テスト時はモックに差し替え可能
