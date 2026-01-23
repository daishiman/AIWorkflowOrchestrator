# データフロー要件定義書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 1                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. 現状のデータフロー

### 1.1 Desktop アプリ（現在）

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Renderer Process                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SystemPromptTemplateSlice (Zustand)             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  templates  │  │  isLoading  │  │  error              │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              window.electronAPI.store                        │   │
│  │                    (IPC Channel)                             │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Main Process                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     electron-store                           │   │
│  │              ~/.config/AIWorkflowOrchestrator/               │   │
│  │                      config.json                             │   │
│  │           (key: "systemPromptTemplates")                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 問題点

| 問題               | 説明                                       |
| ------------------ | ------------------------------------------ |
| デバイス間共有不可 | ローカルファイルのため他デバイスで使用不可 |
| Webアプリ非対応    | electron-storeはElectron専用               |
| バックアップ困難   | 手動でファイルをコピーする必要がある       |
| ユーザー分離なし   | 認証と連動していない                       |

---

## 2. 新しいデータフロー

### 2.1 Desktop アプリ（新設計）

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Renderer Process                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SystemPromptTemplateSlice (Zustand)             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  templates  │  │  isLoading  │  │  error              │  │   │
│  │  │  isMigrated │  │             │  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           window.electronAPI.systemPrompt                    │   │
│  │                    (IPC Channels)                            │   │
│  │   system-prompt:list | system-prompt:create | ...            │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Main Process                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 systemPromptHandlers.ts                      │   │
│  │                    (IPC Handlers)                            │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SystemPromptRepository                          │   │
│  │                 (packages/shared)                            │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Turso (Embedded Replicas)                       │   │
│  │  ┌─────────────────┐        ┌────────────────────────────┐  │   │
│  │  │  Local SQLite   │◄──────►│  Turso Cloud (Remote)      │  │   │
│  │  │  (オフライン用) │  sync  │  (永続化・共有)            │  │   │
│  │  └─────────────────┘        └────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Web アプリ（新設計）

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (React)                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SystemPromptTemplateState (Zustand/Context)     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  templates  │  │  isLoading  │  │  error              │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   API Client                                 │   │
│  │              /api/system-prompt/*                            │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              /api/system-prompt/route.ts                     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SystemPromptRepository                          │   │
│  │                 (packages/shared)                            │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Turso Cloud                               │   │
│  │              (直接接続、オフライン非対応)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 統合ポイント

### 3.1 IPC通信チャネル定義

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // システムプロンプト関連
  SYSTEM_PROMPT_LIST: "system-prompt:list",
  SYSTEM_PROMPT_GET: "system-prompt:get",
  SYSTEM_PROMPT_CREATE: "system-prompt:create",
  SYSTEM_PROMPT_UPDATE: "system-prompt:update",
  SYSTEM_PROMPT_DELETE: "system-prompt:delete",
  SYSTEM_PROMPT_MIGRATE: "system-prompt:migrate",
} as const;

// ホワイトリストに追加
export const ALLOWED_INVOKE_CHANNELS = [
  IPC_CHANNELS.SYSTEM_PROMPT_LIST,
  IPC_CHANNELS.SYSTEM_PROMPT_GET,
  IPC_CHANNELS.SYSTEM_PROMPT_CREATE,
  IPC_CHANNELS.SYSTEM_PROMPT_UPDATE,
  IPC_CHANNELS.SYSTEM_PROMPT_DELETE,
  IPC_CHANNELS.SYSTEM_PROMPT_MIGRATE,
  // ... 他のチャンネル
];
```

### 3.2 Preload API定義

```typescript
// apps/desktop/src/preload/index.ts
interface SystemPromptAPI {
  list: (userId: string) => Promise<ApiResult<PromptTemplate[]>>;
  get: (id: string) => Promise<ApiResult<PromptTemplate | null>>;
  create: (
    userId: string,
    data: CreatePromptTemplateInput,
  ) => Promise<ApiResult<PromptTemplate>>;
  update: (
    id: string,
    data: UpdatePromptTemplateInput,
  ) => Promise<ApiResult<PromptTemplate>>;
  delete: (id: string) => Promise<ApiResult<void>>;
  migrate: (userId: string) => Promise<ApiResult<MigrationResult>>;
}

const systemPromptAPI: SystemPromptAPI = {
  list: (userId) => safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_LIST, { userId }),
  get: (id) => safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_GET, { id }),
  create: (userId, data) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_CREATE, { userId, ...data }),
  update: (id, data) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_UPDATE, { id, ...data }),
  delete: (id) => safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_DELETE, { id }),
  migrate: (userId) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_MIGRATE, { userId }),
};

contextBridge.exposeInMainWorld("systemPromptAPI", systemPromptAPI);
```

### 3.3 IPC Handlers定義

```typescript
// apps/desktop/src/main/ipc/systemPromptHandlers.ts
export function registerSystemPromptHandlers(
  mainWindow: BrowserWindow,
  repository: ISystemPromptRepository,
): void {
  // 一覧取得
  ipcMain.handle(
    IPC_CHANNELS.SYSTEM_PROMPT_LIST,
    async (event, { userId }: { userId: string }) => {
      validateIpcSender(event, mainWindow);
      return repository.findAllByUserId(userId);
    },
  );

  // 作成
  ipcMain.handle(
    IPC_CHANNELS.SYSTEM_PROMPT_CREATE,
    async (event, { userId, name, content }) => {
      validateIpcSender(event, mainWindow);
      return repository.create(userId, { name, content });
    },
  );

  // ... 他のハンドラー
}
```

### 3.4 Repository層API定義

```typescript
// packages/shared/src/repositories/types/system-prompt.ts
export interface ISystemPromptRepository {
  findAllByUserId(userId: string): Promise<PromptTemplate[]>;
  findById(id: string): Promise<PromptTemplate | null>;
  create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate>;
  update(id: string, data: UpdatePromptTemplateInput): Promise<PromptTemplate>;
  delete(id: string): Promise<void>;
  isPreset(id: string): Promise<boolean>;
  findAllPresets(): Promise<PromptTemplate[]>;
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>;
}
```

### 3.5 Zustand Slice更新パターン

```typescript
// apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts
export interface SystemPromptTemplateSlice {
  // State
  templates: PromptTemplate[];
  isLoading: boolean;
  error: string | null;
  isMigrated: boolean;

  // Actions
  fetchTemplates: (userId: string) => Promise<void>;
  createTemplate: (
    userId: string,
    name: string,
    content: string,
  ) => Promise<void>;
  updateTemplate: (id: string, name: string, content: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  migrateFromElectronStore: (userId: string) => Promise<void>;
  getTemplateById: (id: string) => PromptTemplate | undefined;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const createSystemPromptTemplateSlice: StateCreator<
  SystemPromptTemplateSlice,
  [],
  [],
  SystemPromptTemplateSlice
> = (set, get) => ({
  templates: [],
  isLoading: false,
  error: null,
  isMigrated: false,

  fetchTemplates: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.systemPromptAPI.list(userId);
      if (result.success) {
        set({ templates: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // ... 他のアクション
});
```

---

## 4. マイグレーションフロー

### 4.1 マイグレーション処理フロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                    アプリ起動時のマイグレーション                    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ マイグレーション完了   │
                    │ フラグを確認          │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │  完了済み     │       │  未完了       │
            │  → 通常起動   │       │  → 移行開始   │
            └───────────────┘       └───────┬───────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ electron-storeから    │
                                │ テンプレート読み込み  │
                                └───────────┬───────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ バックアップファイル  │
                                │ 作成 (.bak)           │
                                └───────────┬───────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ 現在のユーザーID取得  │
                                └───────────┬───────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ Tursoにテンプレート   │
                                │ 挿入（重複チェック）  │
                                └───────────┬───────────┘
                                            │
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                    ┌───────────────┐               ┌───────────────┐
                    │  成功         │               │  失敗         │
                    └───────┬───────┘               └───────┬───────┘
                            │                               │
                            ▼                               ▼
                    ┌───────────────┐               ┌───────────────┐
                    │ 完了フラグ設定 │               │ バックアップ  │
                    │ electron-store │               │ から復元      │
                    │ データ削除    │               │ エラーログ    │
                    └───────┬───────┘               └───────┬───────┘
                            │                               │
                            ▼                               ▼
                    ┌───────────────┐               ┌───────────────┐
                    │  通常起動     │               │  通常起動     │
                    │  (DB使用)     │               │  (フォールバック) │
                    └───────────────┘               └───────────────┘
```

### 4.2 マイグレーション関数定義

```typescript
// apps/desktop/src/main/migration/electronStoreMigration.ts
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface IElectronStoreMigration {
  needsMigration(): Promise<boolean>;
  migrate(userId: string): Promise<MigrationResult>;
  createBackup(): Promise<string>;
  restoreFromBackup(backupPath: string): Promise<void>;
  markMigrationComplete(): Promise<void>;
}
```

---

## 5. オフライン動作フロー

### 5.1 Embedded Replicas同期フロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                        オンライン状態                               │
└─────────────────────────────────────────────────────────────────────┘
    ┌─────────────────┐                    ┌─────────────────┐
    │  Local SQLite   │◄──────sync────────►│  Turso Cloud    │
    │  (Replica)      │                    │  (Primary)      │
    └─────────────────┘                    └─────────────────┘
           │                                       │
           │  READ: Local優先                       │
           │  WRITE: Remote → Local同期             │
           │                                       │
           ▼                                       ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                        オフライン状態                           │
    └─────────────────────────────────────────────────────────────────┘
    ┌─────────────────┐                    ┌─────────────────┐
    │  Local SQLite   │         X          │  Turso Cloud    │
    │  (Replica)      │                    │  (unreachable)  │
    └─────────────────┘                    └─────────────────┘
           │
           │  READ: Localから取得
           │  WRITE: Localに書き込み
           │          → 同期キューに追加
           │
           ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                        オンライン復帰                           │
    └─────────────────────────────────────────────────────────────────┘
    ┌─────────────────┐                    ┌─────────────────┐
    │  Local SQLite   │──────sync─────────►│  Turso Cloud    │
    │  (キュー消化)   │                    │  (Primary)      │
    └─────────────────┘                    └─────────────────┘
```

---

## 6. CRUD操作のシーケンス図

### 6.1 テンプレート作成

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   UI     │     │  Slice   │     │  IPC     │     │ Handler  │     │Repository│
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ createTemplate │                │                │                │
     │───────────────>│                │                │                │
     │                │                │                │                │
     │                │ set(isLoading) │                │                │
     │                │────────────────│                │                │
     │                │                │                │                │
     │                │ invoke(create) │                │                │
     │                │───────────────>│                │                │
     │                │                │                │                │
     │                │                │ validateSender │                │
     │                │                │───────────────>│                │
     │                │                │                │                │
     │                │                │                │ create()       │
     │                │                │                │───────────────>│
     │                │                │                │                │
     │                │                │                │   template     │
     │                │                │                │<───────────────│
     │                │                │                │                │
     │                │                │   result       │                │
     │                │                │<───────────────│                │
     │                │                │                │                │
     │                │   result       │                │                │
     │                │<───────────────│                │                │
     │                │                │                │                │
     │                │ set(templates) │                │                │
     │                │────────────────│                │                │
     │                │                │                │                │
     │   完了        │                │                │                │
     │<───────────────│                │                │                │
     │                │                │                │                │
```

---

## 7. 統合テスト観点

### 7.1 IPC通信テスト

| テスト項目         | 検証内容                           |
| ------------------ | ---------------------------------- |
| チャンネル登録     | 全チャンネルがホワイトリストに登録 |
| Sender検証         | 不正なSenderからのリクエストを拒否 |
| 正常系             | 各チャンネルで正常にデータが送受信 |
| エラーハンドリング | エラー時に適切なエラーレスポンス   |

### 7.2 Repository統合テスト

| テスト項目     | 検証内容                         |
| -------------- | -------------------------------- |
| CRUD操作       | 作成→取得→更新→削除の一連の流れ  |
| ユーザー分離   | 他ユーザーのデータにアクセス不可 |
| 重複チェック   | 同一名での作成がエラー           |
| プリセット保護 | プリセットの編集・削除がエラー   |

### 7.3 マイグレーション統合テスト

| テスト項目       | 検証内容                            |
| ---------------- | ----------------------------------- |
| 正常移行         | electron-storeからTursoへの移行成功 |
| バックアップ作成 | .bakファイルが作成される            |
| 重複スキップ     | 既存データがスキップされる          |
| フォールバック   | 失敗時にバックアップから復元        |

### 7.4 オフライン統合テスト

| テスト項目     | 検証内容                      |
| -------------- | ----------------------------- |
| オフラインCRUD | ネットワーク切断時もCRUD可能  |
| 同期復帰       | オンライン復帰時にデータ同期  |
| 競合解決       | 競合時にLast Write Winsで解決 |

---

## 8. 完了条件

- [ ] 新しいデータフローが設計されている
- [ ] IPC通信チャネルが定義されている
- [ ] Preload APIが定義されている
- [ ] Repository層APIが定義されている
- [ ] Zustand Slice更新パターンが定義されている
- [ ] マイグレーションフローが定義されている
- [ ] オフライン動作フローが定義されている
- [ ] 統合テスト観点が定義されている

---

## 9. 関連ドキュメント

| ドキュメント           | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| 機能要件定義書         | `outputs/phase-1/requirements-functional.md`                                 |
| 非機能要件定義書       | `outputs/phase-1/requirements-non-functional.md`                             |
| 受け入れ基準定義書     | `outputs/phase-1/acceptance-criteria.md`                                     |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
