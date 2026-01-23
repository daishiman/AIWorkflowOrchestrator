# IPC Handler設計書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 2                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. IPCチャネル定義

### 1.1 新規チャネル一覧

| チャネル名                  | 方向            | 用途                     |
| --------------------------- | --------------- | ------------------------ |
| `system-prompt:list`        | Renderer → Main | テンプレート一覧取得     |
| `system-prompt:get`         | Renderer → Main | 単一テンプレート取得     |
| `system-prompt:create`      | Renderer → Main | テンプレート作成         |
| `system-prompt:update`      | Renderer → Main | テンプレート更新         |
| `system-prompt:delete`      | Renderer → Main | テンプレート削除         |
| `system-prompt:migrate`     | Renderer → Main | electron-storeからの移行 |
| `system-prompt:get-presets` | Renderer → Main | プリセット一覧取得       |

### 1.2 channels.ts への追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // System Prompt Template operations
  SYSTEM_PROMPT_LIST: "system-prompt:list",
  SYSTEM_PROMPT_GET: "system-prompt:get",
  SYSTEM_PROMPT_CREATE: "system-prompt:create",
  SYSTEM_PROMPT_UPDATE: "system-prompt:update",
  SYSTEM_PROMPT_DELETE: "system-prompt:delete",
  SYSTEM_PROMPT_MIGRATE: "system-prompt:migrate",
  SYSTEM_PROMPT_GET_PRESETS: "system-prompt:get-presets",
} as const;

// ALLOWED_INVOKE_CHANNELS への追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャネル ...

  // System Prompt channels
  IPC_CHANNELS.SYSTEM_PROMPT_LIST,
  IPC_CHANNELS.SYSTEM_PROMPT_GET,
  IPC_CHANNELS.SYSTEM_PROMPT_CREATE,
  IPC_CHANNELS.SYSTEM_PROMPT_UPDATE,
  IPC_CHANNELS.SYSTEM_PROMPT_DELETE,
  IPC_CHANNELS.SYSTEM_PROMPT_MIGRATE,
  IPC_CHANNELS.SYSTEM_PROMPT_GET_PRESETS,
];
```

---

## 2. リクエスト/レスポンス型定義

### 2.1 共通型

```typescript
// packages/shared/src/types/system-prompt/ipc.ts

import type { SystemPromptTemplate } from "./template";

/**
 * IPC共通レスポンス型
 */
export interface IPCResponse<T> {
  success: true;
  data: T;
}

export interface IPCErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type IPCResult<T> = IPCResponse<T> | IPCErrorResponse;
```

### 2.2 個別リクエスト/レスポンス型

```typescript
// packages/shared/src/types/system-prompt/ipc.ts

/**
 * テンプレート一覧取得リクエスト
 */
export interface ListTemplatesRequest {
  /** ユーザーID（認証から取得） */
  userId: string;
  /** プリセットを含めるか（デフォルト: true） */
  includePresets?: boolean;
}

/**
 * テンプレート一覧取得レスポンス
 */
export type ListTemplatesResponse = IPCResult<SystemPromptTemplate[]>;

/**
 * 単一テンプレート取得リクエスト
 */
export interface GetTemplateRequest {
  /** テンプレートID */
  id: string;
  /** ユーザーID（認証から取得） */
  userId: string;
}

/**
 * 単一テンプレート取得レスポンス
 */
export type GetTemplateResponse = IPCResult<SystemPromptTemplate>;

/**
 * テンプレート作成リクエスト
 */
export interface CreateTemplateRequest {
  /** ユーザーID（認証から取得） */
  userId: string;
  /** テンプレート名（1-50文字） */
  name: string;
  /** テンプレート内容（1-4000文字） */
  content: string;
}

/**
 * テンプレート作成レスポンス
 */
export type CreateTemplateResponse = IPCResult<SystemPromptTemplate>;

/**
 * テンプレート更新リクエスト
 */
export interface UpdateTemplateRequest {
  /** テンプレートID */
  id: string;
  /** ユーザーID（認証から取得） */
  userId: string;
  /** 更新フィールド */
  updates: {
    name?: string;
    content?: string;
  };
}

/**
 * テンプレート更新レスポンス
 */
export type UpdateTemplateResponse = IPCResult<SystemPromptTemplate>;

/**
 * テンプレート削除リクエスト
 */
export interface DeleteTemplateRequest {
  /** テンプレートID */
  id: string;
  /** ユーザーID（認証から取得） */
  userId: string;
}

/**
 * テンプレート削除レスポンス
 */
export type DeleteTemplateResponse = IPCResult<void>;

/**
 * マイグレーションリクエスト
 */
export interface MigrateTemplatesRequest {
  /** ユーザーID（認証から取得） */
  userId: string;
}

/**
 * マイグレーションレスポンス
 */
export interface MigrateTemplatesResult {
  /** 移行成功件数 */
  migratedCount: number;
  /** スキップ件数（重複等） */
  skippedCount: number;
  /** 失敗件数 */
  failedCount: number;
  /** エラー詳細 */
  errors: Array<{ name: string; reason: string }>;
}

export type MigrateTemplatesResponse = IPCResult<MigrateTemplatesResult>;

/**
 * プリセット一覧取得レスポンス
 */
export type GetPresetsResponse = IPCResult<SystemPromptTemplate[]>;
```

---

## 3. Zodバリデーションスキーマ

### 3.1 スキーマ定義

```typescript
// packages/shared/src/schemas/system-prompt.ts

import { z } from "zod";

/**
 * テンプレート名バリデーション
 */
export const templateNameSchema = z
  .string()
  .min(1, "テンプレート名は必須です")
  .max(50, "テンプレート名は50文字以内です")
  .trim();

/**
 * テンプレート内容バリデーション
 */
export const templateContentSchema = z
  .string()
  .min(1, "テンプレート内容は必須です")
  .max(4000, "テンプレート内容は4000文字以内です");

/**
 * テンプレートIDバリデーション（UUID v4形式）
 */
export const templateIdSchema = z.string().uuid("無効なテンプレートIDです");

/**
 * ユーザーIDバリデーション
 */
export const userIdSchema = z.string().min(1, "ユーザーIDは必須です");

/**
 * テンプレート一覧取得リクエストスキーマ
 */
export const listTemplatesRequestSchema = z.object({
  userId: userIdSchema,
  includePresets: z.boolean().optional().default(true),
});

/**
 * 単一テンプレート取得リクエストスキーマ
 */
export const getTemplateRequestSchema = z.object({
  id: templateIdSchema,
  userId: userIdSchema,
});

/**
 * テンプレート作成リクエストスキーマ
 */
export const createTemplateRequestSchema = z.object({
  userId: userIdSchema,
  name: templateNameSchema,
  content: templateContentSchema,
});

/**
 * テンプレート更新リクエストスキーマ
 */
export const updateTemplateRequestSchema = z.object({
  id: templateIdSchema,
  userId: userIdSchema,
  updates: z
    .object({
      name: templateNameSchema.optional(),
      content: templateContentSchema.optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.content !== undefined,
      "更新するフィールドを指定してください",
    ),
});

/**
 * テンプレート削除リクエストスキーマ
 */
export const deleteTemplateRequestSchema = z.object({
  id: templateIdSchema,
  userId: userIdSchema,
});

/**
 * マイグレーションリクエストスキーマ
 */
export const migrateTemplatesRequestSchema = z.object({
  userId: userIdSchema,
});
```

---

## 4. IPC Handler実装

### 4.1 ハンドラー登録

```typescript
// apps/desktop/src/main/ipc/system-prompt-handler.ts

import { ipcMain } from "electron";
import { z } from "zod";
import type {
  ListTemplatesRequest,
  GetTemplateRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  DeleteTemplateRequest,
  MigrateTemplatesRequest,
  IPCErrorResponse,
} from "@repo/shared/types/system-prompt";
import {
  listTemplatesRequestSchema,
  getTemplateRequestSchema,
  createTemplateRequestSchema,
  updateTemplateRequestSchema,
  deleteTemplateRequestSchema,
  migrateTemplatesRequestSchema,
} from "@repo/shared/schemas/system-prompt";
import type { ISystemPromptRepository } from "@repo/shared/repositories";
import {
  TemplateNotFoundError,
  DuplicateTemplateNameError,
  PresetNotEditableError,
  UnauthorizedAccessError,
} from "@repo/shared/types/system-prompt";

/**
 * エラーコード定義
 */
export const SYSTEM_PROMPT_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "TEMPLATE_NOT_FOUND",
  DUPLICATE_NAME: "DUPLICATE_TEMPLATE_NAME",
  PRESET_NOT_EDITABLE: "PRESET_NOT_EDITABLE",
  UNAUTHORIZED: "UNAUTHORIZED_ACCESS",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * エラーハンドリングヘルパー
 */
function handleError(error: unknown): IPCErrorResponse {
  // Zodバリデーションエラー
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: {
        code: SYSTEM_PROMPT_ERROR_CODES.VALIDATION_ERROR,
        message: "入力値が不正です",
        details: error.flatten(),
      },
    };
  }

  // ドメインエラー
  if (error instanceof TemplateNotFoundError) {
    return {
      success: false,
      error: {
        code: SYSTEM_PROMPT_ERROR_CODES.NOT_FOUND,
        message: error.message,
      },
    };
  }

  if (error instanceof DuplicateTemplateNameError) {
    return {
      success: false,
      error: {
        code: SYSTEM_PROMPT_ERROR_CODES.DUPLICATE_NAME,
        message: error.message,
      },
    };
  }

  if (error instanceof PresetNotEditableError) {
    return {
      success: false,
      error: {
        code: SYSTEM_PROMPT_ERROR_CODES.PRESET_NOT_EDITABLE,
        message: error.message,
      },
    };
  }

  if (error instanceof UnauthorizedAccessError) {
    return {
      success: false,
      error: {
        code: SYSTEM_PROMPT_ERROR_CODES.UNAUTHORIZED,
        message: "アクセス権限がありません",
      },
    };
  }

  // 予期しないエラー
  console.error("Unexpected error in system prompt handler:", error);
  return {
    success: false,
    error: {
      code: SYSTEM_PROMPT_ERROR_CODES.INTERNAL_ERROR,
      message:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    },
  };
}

/**
 * システムプロンプトIPCハンドラーを登録
 */
export function registerSystemPromptHandlers(
  repository: ISystemPromptRepository,
): void {
  // テンプレート一覧取得
  ipcMain.handle(
    "system-prompt:list",
    async (_, request: ListTemplatesRequest) => {
      try {
        const validated = listTemplatesRequestSchema.parse(request);
        const templates = await repository.findByUserId(validated.userId, {
          includePresets: validated.includePresets,
        });
        return { success: true, data: templates };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // 単一テンプレート取得
  ipcMain.handle(
    "system-prompt:get",
    async (_, request: GetTemplateRequest) => {
      try {
        const validated = getTemplateRequestSchema.parse(request);
        const template = await repository.findById(
          validated.id,
          validated.userId,
        );
        return { success: true, data: template };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // テンプレート作成
  ipcMain.handle(
    "system-prompt:create",
    async (_, request: CreateTemplateRequest) => {
      try {
        const validated = createTemplateRequestSchema.parse(request);
        const template = await repository.create({
          userId: validated.userId,
          name: validated.name,
          content: validated.content,
          isPreset: false,
        });
        return { success: true, data: template };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // テンプレート更新
  ipcMain.handle(
    "system-prompt:update",
    async (_, request: UpdateTemplateRequest) => {
      try {
        const validated = updateTemplateRequestSchema.parse(request);
        const template = await repository.update(
          validated.id,
          validated.userId,
          validated.updates,
        );
        return { success: true, data: template };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // テンプレート削除
  ipcMain.handle(
    "system-prompt:delete",
    async (_, request: DeleteTemplateRequest) => {
      try {
        const validated = deleteTemplateRequestSchema.parse(request);
        await repository.delete(validated.id, validated.userId);
        return { success: true, data: undefined };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // マイグレーション
  ipcMain.handle(
    "system-prompt:migrate",
    async (_, request: MigrateTemplatesRequest) => {
      try {
        const validated = migrateTemplatesRequestSchema.parse(request);
        const result = await repository.migrateFromElectronStore(
          validated.userId,
        );
        return { success: true, data: result };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // プリセット一覧取得
  ipcMain.handle("system-prompt:get-presets", async () => {
    try {
      const presets = await repository.findPresets();
      return { success: true, data: presets };
    } catch (error) {
      return handleError(error);
    }
  });
}

/**
 * システムプロンプトIPCハンドラーを解除
 */
export function unregisterSystemPromptHandlers(): void {
  const channels = [
    "system-prompt:list",
    "system-prompt:get",
    "system-prompt:create",
    "system-prompt:update",
    "system-prompt:delete",
    "system-prompt:migrate",
    "system-prompt:get-presets",
  ];

  for (const channel of channels) {
    ipcMain.removeHandler(channel);
  }
}
```

---

## 5. セキュリティ設計

### 5.1 IPC検証の適用

```typescript
// apps/desktop/src/main/ipc/system-prompt-handler.ts (セキュリティ強化版)

import { ipcMain, type IpcMainInvokeEvent } from "electron";
import {
  validateIpcSender,
  toIPCValidationError,
  type IPCValidationOptions,
} from "../infrastructure/security/ipc-validator";

/**
 * システムプロンプトIPCハンドラーを登録（セキュリティ検証付き）
 */
export function registerSystemPromptHandlers(
  repository: ISystemPromptRepository,
  validationOptions: IPCValidationOptions,
): void {
  // テンプレート一覧取得
  ipcMain.handle(
    "system-prompt:list",
    async (event: IpcMainInvokeEvent, request: ListTemplatesRequest) => {
      // IPC sender検証
      const validation = validateIpcSender(
        event,
        "system-prompt:list",
        validationOptions,
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      try {
        const validated = listTemplatesRequestSchema.parse(request);
        const templates = await repository.findByUserId(validated.userId, {
          includePresets: validated.includePresets,
        });
        return { success: true, data: templates };
      } catch (error) {
        return handleError(error);
      }
    },
  );

  // 他のハンドラーも同様にvalidateIpcSenderを適用
  // ...
}
```

### 5.2 セキュリティチェック項目

| チェック項目           | 実装場所                | 説明                        |
| ---------------------- | ----------------------- | --------------------------- |
| IPC Sender検証         | validateIpcSender       | BrowserWindow・DevTools検証 |
| チャネルホワイトリスト | ALLOWED_INVOKE_CHANNELS | 許可チャネルのみ受付        |
| 入力バリデーション     | Zodスキーマ             | 全リクエストパラメータ検証  |
| 所有者検証             | Repository層            | userId照合による認可        |
| プリセット保護         | Repository層            | isPreset=true時の変更拒否   |

### 5.3 エラーメッセージのセキュリティ

```typescript
// セキュリティ上の理由でエラーメッセージを曖昧にする場合
if (error instanceof UnauthorizedAccessError) {
  return {
    success: false,
    error: {
      code: SYSTEM_PROMPT_ERROR_CODES.NOT_FOUND,
      // 「アクセス権限がありません」ではなく「見つかりません」と返す
      // → 存在確認攻撃を防止
      message: "テンプレートが見つかりません",
    },
  };
}
```

---

## 6. Preload API設計

### 6.1 型定義

```typescript
// apps/desktop/src/preload/types.ts

import type {
  SystemPromptTemplate,
  MigrateTemplatesResult,
} from "@repo/shared/types/system-prompt";

/**
 * システムプロンプトAPI型定義
 */
export interface SystemPromptAPI {
  /** テンプレート一覧取得 */
  list: (options?: {
    includePresets?: boolean;
  }) => Promise<SystemPromptTemplate[]>;

  /** 単一テンプレート取得 */
  get: (id: string) => Promise<SystemPromptTemplate>;

  /** テンプレート作成 */
  create: (params: {
    name: string;
    content: string;
  }) => Promise<SystemPromptTemplate>;

  /** テンプレート更新 */
  update: (
    id: string,
    updates: { name?: string; content?: string },
  ) => Promise<SystemPromptTemplate>;

  /** テンプレート削除 */
  delete: (id: string) => Promise<void>;

  /** electron-storeから移行 */
  migrate: () => Promise<MigrateTemplatesResult>;

  /** プリセット一覧取得 */
  getPresets: () => Promise<SystemPromptTemplate[]>;
}
```

### 6.2 Preload実装

```typescript
// apps/desktop/src/preload/index.ts

import { IPC_CHANNELS } from "./channels";
import type { SystemPromptAPI } from "./types";

/**
 * ユーザーIDを取得するヘルパー
 * 認証状態から現在のユーザーIDを取得
 */
async function getCurrentUserId(): Promise<string> {
  const session = await safeInvoke<{ userId: string } | null>(
    IPC_CHANNELS.AUTH_GET_SESSION,
  );
  if (!session?.userId) {
    throw new Error("ログインが必要です");
  }
  return session.userId;
}

/**
 * IPC結果をアンラップするヘルパー
 */
function unwrapResult<T>(
  result:
    | { success: true; data: T }
    | { success: false; error: { message: string } },
): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * システムプロンプトAPI
 */
const systemPromptAPI: SystemPromptAPI = {
  list: async (options) => {
    const userId = await getCurrentUserId();
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_LIST, {
      userId,
      includePresets: options?.includePresets ?? true,
    });
    return unwrapResult(result);
  },

  get: async (id) => {
    const userId = await getCurrentUserId();
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_GET, {
      id,
      userId,
    });
    return unwrapResult(result);
  },

  create: async (params) => {
    const userId = await getCurrentUserId();
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_CREATE, {
      userId,
      name: params.name,
      content: params.content,
    });
    return unwrapResult(result);
  },

  update: async (id, updates) => {
    const userId = await getCurrentUserId();
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_UPDATE, {
      id,
      userId,
      updates,
    });
    return unwrapResult(result);
  },

  delete: async (id) => {
    const userId = await getCurrentUserId();
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_DELETE, {
      id,
      userId,
    });
    return unwrapResult(result);
  },

  migrate: async () => {
    const userId = await getCurrentUserId();
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_MIGRATE, {
      userId,
    });
    return unwrapResult(result);
  },

  getPresets: async () => {
    const result = await safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_GET_PRESETS);
    return unwrapResult(result);
  },
};

// contextBridgeで公開
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("systemPromptAPI", systemPromptAPI);
  } catch (error) {
    console.error("Failed to expose systemPromptAPI:", error);
  }
}
```

### 6.3 Window型定義

```typescript
// apps/desktop/src/preload/types.d.ts

import type { SystemPromptAPI } from "./types";

declare global {
  interface Window {
    systemPromptAPI: SystemPromptAPI;
  }
}
```

---

## 7. Main Process登録

### 7.1 ハンドラー登録タイミング

```typescript
// apps/desktop/src/main/index.ts

import { app, BrowserWindow } from "electron";
import { registerSystemPromptHandlers } from "./ipc/system-prompt-handler";
import { SystemPromptRepository } from "@repo/shared/repositories";
import { getDatabase } from "./infrastructure/database";

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(async () => {
  // データベース初期化
  const db = await getDatabase();

  // Repositoryインスタンス作成
  const systemPromptRepository = new SystemPromptRepository(db);

  // IPCハンドラー登録
  registerSystemPromptHandlers(systemPromptRepository, {
    getAllowedWindows: () => (mainWindow ? [mainWindow] : []),
    logger: console,
  });

  // メインウィンドウ作成
  mainWindow = createMainWindow();
});

app.on("will-quit", () => {
  // ハンドラー解除
  unregisterSystemPromptHandlers();
});
```

---

## 8. 完了条件

- [x] IPCチャネルが定義されている
- [x] リクエスト/レスポンス型が定義されている
- [x] Zodバリデーションスキーマが定義されている
- [x] ハンドラー実装が設計されている
- [x] セキュリティ検証が設計されている
- [x] Preload APIが設計されている
- [x] Main Process登録が設計されている

---

## 9. 関連ドキュメント

| ドキュメント      | パス                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Repository設計    | `outputs/phase-2/repository-interface-design.md`                 |
| 既存IPCハンドラー | `apps/desktop/src/main/ipc/session-persistence-handler.ts`       |
| IPC検証モジュール | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` |
| チャネル定義      | `apps/desktop/src/preload/channels.ts`                           |
| データフロー要件  | `outputs/phase-1/requirements-dataflow.md`                       |
