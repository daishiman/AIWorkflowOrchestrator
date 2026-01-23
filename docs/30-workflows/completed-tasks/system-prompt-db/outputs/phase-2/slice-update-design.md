# Zustand Slice更新設計書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 2                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. 現状のSlice実装

### 1.1 ファイル位置

```
apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts
```

### 1.2 現在の状態構造

```typescript
interface SystemPromptTemplateSlice {
  templates: PromptTemplate[];
  initializeTemplates: () => Promise<void>;
  saveTemplate: (name: string, content: string) => Promise<void>;
  updateTemplate: (id: string, name: string, content: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => PromptTemplate | undefined;
}
```

### 1.3 現在の永続化方法

- `window.electronAPI.store.get/set` を使用
- electron-storeに直接アクセス
- プリセットはコード内定数として定義

---

## 2. 新しいSlice設計

### 2.1 状態型定義

```typescript
// apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts

import type { PromptTemplate } from "@repo/shared";

/**
 * システムプロンプトテンプレートSliceの状態
 */
export interface SystemPromptTemplateState {
  /** テンプレート一覧（プリセット + カスタム） */
  templates: PromptTemplate[];

  /** 選択中のテンプレートID */
  selectedTemplateId: string | null;

  /** ローディング状態 */
  isLoading: boolean;

  /** エラーメッセージ */
  error: string | null;

  /** マイグレーション完了フラグ */
  isMigrated: boolean;

  /** 同期状態 */
  syncStatus: SyncStatus;
}

/**
 * 同期状態
 */
export type SyncStatus = "idle" | "syncing" | "synced" | "error";
```

### 2.2 アクション型定義

```typescript
/**
 * システムプロンプトテンプレートSliceのアクション
 */
export interface SystemPromptTemplateActions {
  // ============================================================
  // データ取得
  // ============================================================

  /**
   * テンプレート一覧を取得する
   *
   * @param userId ユーザーID
   */
  fetchTemplates: (userId: string) => Promise<void>;

  /**
   * テンプレートを再読み込みする
   *
   * @param userId ユーザーID
   */
  refreshTemplates: (userId: string) => Promise<void>;

  // ============================================================
  // CRUD操作
  // ============================================================

  /**
   * テンプレートを作成する
   *
   * @param userId ユーザーID
   * @param name テンプレート名
   * @param content 内容
   */
  createTemplate: (
    userId: string,
    name: string,
    content: string,
  ) => Promise<void>;

  /**
   * テンプレートを更新する
   *
   * @param id テンプレートID
   * @param name テンプレート名
   * @param content 内容
   */
  updateTemplate: (id: string, name: string, content: string) => Promise<void>;

  /**
   * テンプレートを削除する
   *
   * @param id テンプレートID
   */
  deleteTemplate: (id: string) => Promise<void>;

  // ============================================================
  // 選択
  // ============================================================

  /**
   * テンプレートを選択する
   *
   * @param templateId テンプレートID
   */
  selectTemplate: (templateId: string | null) => void;

  /**
   * IDでテンプレートを取得する
   *
   * @param id テンプレートID
   * @returns テンプレート（存在しない場合undefined）
   */
  getTemplateById: (id: string) => PromptTemplate | undefined;

  // ============================================================
  // マイグレーション
  // ============================================================

  /**
   * electron-storeからマイグレーションを実行する
   *
   * @param userId ユーザーID
   */
  migrateFromElectronStore: (userId: string) => Promise<void>;

  /**
   * マイグレーションステータスを確認する
   */
  checkMigrationStatus: () => Promise<boolean>;

  // ============================================================
  // エラー・状態管理
  // ============================================================

  /**
   * エラーを設定する
   *
   * @param error エラーメッセージ
   */
  setError: (error: string | null) => void;

  /**
   * エラーをクリアする
   */
  clearError: () => void;

  /**
   * 同期状態を設定する
   *
   * @param status 同期状態
   */
  setSyncStatus: (status: SyncStatus) => void;

  /**
   * 状態をリセットする
   */
  reset: () => void;
}

/**
 * SystemPromptTemplateSlice = State + Actions
 */
export type SystemPromptTemplateSlice = SystemPromptTemplateState &
  SystemPromptTemplateActions;
```

### 2.3 初期状態

```typescript
/**
 * 初期状態
 */
export const initialSystemPromptTemplateState: SystemPromptTemplateState = {
  templates: [],
  selectedTemplateId: null,
  isLoading: false,
  error: null,
  isMigrated: false,
  syncStatus: "idle",
};
```

---

## 3. Slice実装

### 3.1 createSlice関数

```typescript
// apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts

import { StateCreator } from "zustand";
import type { PromptTemplate } from "@repo/shared";

export const createSystemPromptTemplateSlice: StateCreator<
  SystemPromptTemplateSlice,
  [],
  [],
  SystemPromptTemplateSlice
> = (set, get) => ({
  // 初期状態
  ...initialSystemPromptTemplateState,

  // ============================================================
  // データ取得
  // ============================================================

  fetchTemplates: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await window.systemPromptAPI.list(userId);

      if (result.success) {
        set({
          templates: result.data,
          isLoading: false,
          syncStatus: "synced",
        });
      } else {
        set({
          error: result.error,
          isLoading: false,
          syncStatus: "error",
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "テンプレートの取得に失敗しました",
        isLoading: false,
        syncStatus: "error",
      });
    }
  },

  refreshTemplates: async (userId: string) => {
    set({ syncStatus: "syncing" });
    await get().fetchTemplates(userId);
  },

  // ============================================================
  // CRUD操作
  // ============================================================

  createTemplate: async (userId: string, name: string, content: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await window.systemPromptAPI.create(userId, {
        name,
        content,
      });

      if (result.success) {
        // 楽観的更新: 新しいテンプレートを追加
        set((state) => ({
          templates: [...state.templates, result.data],
          isLoading: false,
        }));
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        throw new Error(result.error);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "テンプレートの作成に失敗しました",
        isLoading: false,
      });
      throw error;
    }
  },

  updateTemplate: async (id: string, name: string, content: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await window.systemPromptAPI.update(id, {
        name,
        content,
      });

      if (result.success) {
        // 楽観的更新: テンプレートを更新
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? result.data : t,
          ),
          isLoading: false,
        }));
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        throw new Error(result.error);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "テンプレートの更新に失敗しました",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await window.systemPromptAPI.delete(id);

      if (result.success) {
        // 楽観的更新: テンプレートを削除
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplateId:
            state.selectedTemplateId === id ? null : state.selectedTemplateId,
          isLoading: false,
        }));
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        throw new Error(result.error);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "テンプレートの削除に失敗しました",
        isLoading: false,
      });
      throw error;
    }
  },

  // ============================================================
  // 選択
  // ============================================================

  selectTemplate: (templateId: string | null) => {
    set({ selectedTemplateId: templateId });
  },

  getTemplateById: (id: string) => {
    return get().templates.find((t) => t.id === id);
  },

  // ============================================================
  // マイグレーション
  // ============================================================

  migrateFromElectronStore: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await window.systemPromptAPI.migrate(userId);

      if (result.success) {
        set({ isMigrated: true, isLoading: false });
        // マイグレーション後にテンプレートを再読み込み
        await get().fetchTemplates(userId);
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "マイグレーションに失敗しました",
        isLoading: false,
      });
    }
  },

  checkMigrationStatus: async () => {
    try {
      const result = await window.systemPromptAPI.getMigrationStatus();
      if (result.success) {
        set({ isMigrated: result.data.completed });
        return result.data.completed;
      }
      return false;
    } catch {
      return false;
    }
  },

  // ============================================================
  // エラー・状態管理
  // ============================================================

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setSyncStatus: (status: SyncStatus) => {
    set({ syncStatus: status });
  },

  reset: () => {
    set(initialSystemPromptTemplateState);
  },
});
```

---

## 4. IPC通信設計

### 4.1 window.systemPromptAPI 型定義

```typescript
// apps/desktop/src/renderer/types/electron.d.ts

import type {
  PromptTemplate,
  CreatePromptTemplateInput,
  UpdatePromptTemplateInput,
} from "@repo/shared";

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface MigrationStatus {
  completed: boolean;
  lastMigratedAt: string | null;
}

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: Array<{
    templateId: string;
    message: string;
    code: string;
  }>;
}

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
  getMigrationStatus: () => Promise<ApiResult<MigrationStatus>>;
}

declare global {
  interface Window {
    systemPromptAPI: SystemPromptAPI;
  }
}
```

### 4.2 エラーハンドリング

```typescript
// エラーコードからユーザー向けメッセージへの変換
const ERROR_MESSAGES: Record<string, string> = {
  TEMPLATE_NOT_FOUND: "テンプレートが見つかりません",
  UNAUTHORIZED: "このテンプレートへのアクセス権限がありません",
  PRESET_NOT_EDITABLE: "プリセットテンプレートは編集できません",
  PRESET_NOT_DELETABLE: "プリセットテンプレートは削除できません",
  DUPLICATE_NAME: "テンプレート名が重複しています",
  VALIDATION_ERROR: "入力内容に問題があります",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  UNKNOWN: "予期しないエラーが発生しました",
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN;
}
```

---

## 5. 変更前後の比較

### 5.1 状態変更

| 項目               | 変更前           | 変更後                       |
| ------------------ | ---------------- | ---------------------------- |
| templates          | PromptTemplate[] | PromptTemplate[]（変更なし） |
| selectedTemplateId | なし             | string \| null               |
| isLoading          | なし             | boolean                      |
| error              | なし             | string \| null               |
| isMigrated         | なし             | boolean                      |
| syncStatus         | なし             | SyncStatus                   |

### 5.2 アクション変更

| アクション               | 変更前                       | 変更後                       |
| ------------------------ | ---------------------------- | ---------------------------- |
| initializeTemplates      | electron-store読み込み       | 削除（fetchTemplatesに統合） |
| saveTemplate             | electron-store書き込み       | IPC経由でDB保存              |
| updateTemplate           | electron-store書き込み       | IPC経由でDB更新              |
| deleteTemplate           | electron-store書き込み       | IPC経由でDB削除              |
| getTemplateById          | 同期的取得                   | 同期的取得（変更なし）       |
| fetchTemplates           | なし                         | 新規追加                     |
| refreshTemplates         | なし                         | 新規追加                     |
| createTemplate           | なし（saveTemplateから改名） | 新規追加                     |
| selectTemplate           | なし                         | 新規追加                     |
| migrateFromElectronStore | なし                         | 新規追加                     |
| setError                 | なし                         | 新規追加                     |
| clearError               | なし                         | 新規追加                     |
| reset                    | なし                         | 新規追加                     |

---

## 6. 使用例

### 6.1 コンポーネントでの使用

```typescript
// apps/desktop/src/renderer/views/ChatView/components/TemplateSelector.tsx

import { useStore } from "@/store";

function TemplateSelector() {
  const {
    templates,
    selectedTemplateId,
    isLoading,
    error,
    fetchTemplates,
    selectTemplate,
    createTemplate,
    deleteTemplate,
  } = useStore((state) => ({
    templates: state.templates,
    selectedTemplateId: state.selectedTemplateId,
    isLoading: state.isLoading,
    error: state.error,
    fetchTemplates: state.fetchTemplates,
    selectTemplate: state.selectTemplate,
    createTemplate: state.createTemplate,
    deleteTemplate: state.deleteTemplate,
  }));

  const { user } = useAuth();

  // 初回読み込み
  useEffect(() => {
    if (user?.id) {
      fetchTemplates(user.id);
    }
  }, [user?.id, fetchTemplates]);

  // テンプレート作成
  const handleCreate = async (name: string, content: string) => {
    if (!user?.id) return;
    await createTemplate(user.id, name, content);
  };

  // テンプレート削除
  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      {templates.map((template) => (
        <TemplateItem
          key={template.id}
          template={template}
          isSelected={template.id === selectedTemplateId}
          onSelect={() => selectTemplate(template.id)}
          onDelete={template.isPreset ? undefined : () => handleDelete(template.id)}
        />
      ))}
    </div>
  );
}
```

---

## 7. テスト設計

### 7.1 単体テストケース

| テストカテゴリ  | テストケース                  |
| --------------- | ----------------------------- |
| fetchTemplates  | 正常にテンプレートを取得する  |
| fetchTemplates  | エラー時にerror状態を設定する |
| createTemplate  | 正常にテンプレートを作成する  |
| createTemplate  | エラー時にerror状態を設定する |
| updateTemplate  | 正常にテンプレートを更新する  |
| deleteTemplate  | 正常にテンプレートを削除する  |
| selectTemplate  | テンプレートを選択できる      |
| getTemplateById | IDでテンプレートを取得できる  |
| setError        | エラーを設定できる            |
| clearError      | エラーをクリアできる          |
| reset           | 状態をリセットできる          |

### 7.2 モックの設計

```typescript
// テスト用モック
const mockSystemPromptAPI: SystemPromptAPI = {
  list: vi.fn().mockResolvedValue({
    success: true,
    data: [mockTemplate],
  }),
  get: vi.fn().mockResolvedValue({
    success: true,
    data: mockTemplate,
  }),
  create: vi.fn().mockResolvedValue({
    success: true,
    data: mockTemplate,
  }),
  update: vi.fn().mockResolvedValue({
    success: true,
    data: mockTemplate,
  }),
  delete: vi.fn().mockResolvedValue({
    success: true,
  }),
  migrate: vi.fn().mockResolvedValue({
    success: true,
    data: { migratedCount: 0, skippedCount: 0, errors: [] },
  }),
  getMigrationStatus: vi.fn().mockResolvedValue({
    success: true,
    data: { completed: false, lastMigratedAt: null },
  }),
};

// windowオブジェクトにモックを設定
Object.defineProperty(window, "systemPromptAPI", {
  value: mockSystemPromptAPI,
  writable: true,
});
```

---

## 8. 完了条件

- [x] 新しい状態型が定義されている
- [x] 新しいアクション型が定義されている
- [x] createSlice関数が設計されている
- [x] IPC通信型が定義されている
- [x] エラーハンドリングが設計されている
- [x] 変更前後の比較が明確になっている
- [x] 使用例が記載されている
- [x] テストケースが設計されている

---

## 9. 関連ドキュメント

| ドキュメント           | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| 現在のSlice実装        | `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`        |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| データフロー要件       | `outputs/phase-1/requirements-dataflow.md`                                   |
