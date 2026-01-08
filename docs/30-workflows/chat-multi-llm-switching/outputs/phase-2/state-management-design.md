# 状態管理設計 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| 機能名 | chat-multi-llm-switching |
| Phase  | 2                        |
| 作成日 | 2026-01-07               |
| スキル | state-lifting            |

---

## 1. 状態管理概要

### 1.1 状態管理ライブラリ

- **Zustand**: 既存のチャット状態管理を拡張
- **永続化**: zustand/middleware の persist を使用

### 1.2 ストア構成

```
apps/desktop/src/renderer/store/
├── index.ts              # ストアエクスポート
├── slices/
│   ├── chatSlice.ts      # チャット状態（既存、拡張）
│   ├── llmSlice.ts       # LLM選択状態（新規）
│   └── settingsSlice.ts  # 設定状態（既存）
└── types.ts              # 共通型定義
```

---

## 2. LLM Slice 設計

### 2.1 State 定義

```typescript
// apps/desktop/src/renderer/store/slices/llmSlice.ts

export interface LLMState {
  /** 利用可能なプロバイダー一覧 */
  providers: LLMProvider[];

  /** 選択中のプロバイダーID */
  selectedProviderId: LLMProviderId;

  /** 選択中のモデルID */
  selectedModelId: string;

  /** プロバイダー読み込み状態 */
  isLoadingProviders: boolean;

  /** ヘルスチェック結果 */
  healthStatus: Record<LLMProviderId, HealthCheckResult | null>;

  /** エラー状態 */
  error: LLMError | null;
}

export interface LLMActions {
  /** プロバイダー一覧を取得 */
  fetchProviders: () => Promise<void>;

  /** プロバイダーを選択 */
  selectProvider: (providerId: LLMProviderId) => void;

  /** モデルを選択 */
  selectModel: (modelId: string) => void;

  /** ヘルスチェック実行 */
  checkHealth: (providerId: LLMProviderId) => Promise<void>;

  /** 選択状態をリセット */
  resetSelection: () => void;

  /** エラーをクリア */
  clearError: () => void;
}

export type LLMSlice = LLMState & LLMActions;
```

### 2.2 初期状態

```typescript
const initialLLMState: LLMState = {
  providers: [],
  selectedProviderId: "openai", // デフォルト: OpenAI
  selectedModelId: "gpt-4o", // デフォルト: GPT-4o
  isLoadingProviders: false,
  healthStatus: {
    openai: null,
    anthropic: null,
    google: null,
    xai: null,
  },
  error: null,
};
```

### 2.3 アクション実装

```typescript
export const createLLMSlice: StateCreator<LLMSlice> = (set, get) => ({
  ...initialLLMState,

  fetchProviders: async () => {
    set({ isLoadingProviders: true, error: null });
    try {
      const providers = await window.llmApi.getProviders();
      set({ providers, isLoadingProviders: false });
    } catch (error) {
      set({
        error: {
          code: "NETWORK_ERROR",
          message: "プロバイダー取得に失敗",
          retryable: true,
        },
        isLoadingProviders: false,
      });
    }
  },

  selectProvider: (providerId) => {
    const { providers } = get();
    const provider = providers.find((p) => p.id === providerId);
    if (provider) {
      const defaultModel =
        provider.models.find((m) => m.isDefault) || provider.models[0];
      set({
        selectedProviderId: providerId,
        selectedModelId: defaultModel?.id || "",
        error: null,
      });
    }
  },

  selectModel: (modelId) => {
    set({ selectedModelId: modelId, error: null });
  },

  checkHealth: async (providerId) => {
    try {
      const result = await window.llmApi.checkHealth(providerId);
      set((state) => ({
        healthStatus: { ...state.healthStatus, [providerId]: result },
      }));
    } catch (error) {
      set((state) => ({
        healthStatus: {
          ...state.healthStatus,
          [providerId]: { status: "error", providerId, checkedAt: new Date() },
        },
      }));
    }
  },

  resetSelection: () => {
    set({
      selectedProviderId: "openai",
      selectedModelId: "gpt-4o",
      error: null,
    });
  },

  clearError: () => set({ error: null }),
});
```

---

## 3. Chat Slice 拡張

### 3.1 拡張する State

```typescript
// apps/desktop/src/renderer/store/slices/chatSlice.ts

// 既存のChatMessage型を拡張
export interface ChatMessageWithLLM {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;

  // 新規: LLM情報（assistant メッセージのみ）
  llmProviderId?: LLMProviderId;
  llmModelId?: string;
}

// ChatState の一部を変更
export interface ChatState {
  messages: ChatMessageWithLLM[]; // 型を拡張
  // ... 既存のフィールド
}
```

### 3.2 拡張するアクション

```typescript
export interface ChatActions {
  // 既存アクション
  sendMessage: (content: string) => Promise<void>;

  // 新規: LLM情報付きでメッセージ追加
  addAssistantMessage: (
    content: string,
    llmProviderId: LLMProviderId,
    llmModelId: string,
  ) => void;

  // 新規: ストリーミング更新
  updateStreamingMessage: (content: string) => void;

  // 新規: ストリーミング完了
  finalizeStreamingMessage: (
    llmProviderId: LLMProviderId,
    llmModelId: string,
  ) => void;
}
```

### 3.3 sendMessage の変更

```typescript
sendMessage: async (content: string) => {
  const { messages, systemPrompt, conversationId } = get();
  const { selectedProviderId, selectedModelId } = useLLMStore.getState();

  // ユーザーメッセージを追加
  const userMessage: ChatMessageWithLLM = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
  set(state => ({ messages: [...state.messages, userMessage] }));

  // ストリーミング用プレースホルダーを追加
  const assistantMessage: ChatMessageWithLLM = {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    isStreaming: true,
    llmProviderId: selectedProviderId,
    llmModelId: selectedModelId,
  };
  set(state => ({ messages: [...state.messages, assistantMessage] }));

  // IPC経由で送信
  await window.llmApi.sendChat({
    conversationId,
    message: content,
    history: messages.map(m => ({ role: m.role, content: m.content })),
    providerId: selectedProviderId,
    modelId: selectedModelId,
    systemPrompt,
  });
},
```

---

## 4. 永続化設計

### 4.1 永続化対象

| データ             | 永続化 | ストレージ   | 理由                |
| ------------------ | ------ | ------------ | ------------------- |
| selectedProviderId | ✅     | localStorage | ユーザー設定を保持  |
| selectedModelId    | ✅     | localStorage | ユーザー設定を保持  |
| providers          | ❌     | -            | 起動時に再取得      |
| healthStatus       | ❌     | -            | 起動時に再チェック  |
| messages           | ✅     | SQLite       | 履歴永続化          |
| messages.llm\*     | ✅     | SQLite       | LLM情報も含めて保存 |

### 4.2 Zustand Persist 設定

```typescript
// apps/desktop/src/renderer/store/slices/llmSlice.ts

import { persist } from "zustand/middleware";

export const useLLMStore = create<LLMSlice>()(
  persist(
    (set, get) => ({
      ...createLLMSlice(set, get),
    }),
    {
      name: "llm-storage",
      partialize: (state) => ({
        selectedProviderId: state.selectedProviderId,
        selectedModelId: state.selectedModelId,
      }),
    },
  ),
);
```

---

## 5. 状態フロー図

### 5.1 LLM切り替えフロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Action                                   │
│                   (Provider/Model変更)                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      llmSlice.selectProvider()                       │
│                      llmSlice.selectModel()                          │
│  1. 選択状態を更新                                                   │
│  2. デフォルトモデルを自動選択（Provider変更時）                     │
│  3. localStorageに永続化                                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        UI Components                                 │
│  LLMSelector: 新しい選択状態を表示                                   │
│  ChatInput: 次回送信時に新LLMを使用                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 メッセージ送信フロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                      chatSlice.sendMessage()                         │
│  1. userMessageを追加                                                │
│  2. assistantMessageプレースホルダー追加（isStreaming=true）         │
│  3. IPC送信（selectedProviderId, selectedModelId含む）               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      IPC Stream Chunks                               │
│  chatSlice.updateStreamingMessage()                                  │
│  - content を追記                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      IPC Complete                                    │
│  chatSlice.finalizeStreamingMessage()                                │
│  - isStreaming = false                                               │
│  - llmProviderId, llmModelId を確定                                  │
│  - SQLiteに永続化                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. セレクター設計

### 6.1 LLM Selectors

```typescript
// apps/desktop/src/renderer/store/selectors/llmSelectors.ts

/** 選択中のプロバイダー情報を取得 */
export const selectCurrentProvider = (
  state: LLMState,
): LLMProvider | undefined => {
  return state.providers.find((p) => p.id === state.selectedProviderId);
};

/** 選択中のモデル情報を取得 */
export const selectCurrentModel = (state: LLMState): LLMModel | undefined => {
  const provider = selectCurrentProvider(state);
  return provider?.models.find((m) => m.id === state.selectedModelId);
};

/** 選択中のプロバイダーが利用可能か */
export const selectIsProviderAvailable = (state: LLMState): boolean => {
  const provider = selectCurrentProvider(state);
  return provider?.isAvailable ?? false;
};

/** 全プロバイダーのヘルス状態サマリー */
export const selectHealthSummary = (state: LLMState) => {
  return Object.entries(state.healthStatus).map(([id, result]) => ({
    providerId: id as LLMProviderId,
    status: result?.status ?? "unknown",
  }));
};
```

### 6.2 Chat Selectors

```typescript
// apps/desktop/src/renderer/store/selectors/chatSelectors.ts

/** LLM別のメッセージをグループ化 */
export const selectMessagesByLLM = (state: ChatState) => {
  const groups: Record<string, ChatMessageWithLLM[]> = {};
  for (const msg of state.messages) {
    if (msg.role === "assistant" && msg.llmProviderId) {
      const key = `${msg.llmProviderId}:${msg.llmModelId}`;
      groups[key] = groups[key] || [];
      groups[key].push(msg);
    }
  }
  return groups;
};

/** 使用されたLLM一覧を取得 */
export const selectUsedLLMs = (state: ChatState): string[] => {
  const llms = new Set<string>();
  for (const msg of state.messages) {
    if (msg.role === "assistant" && msg.llmProviderId) {
      llms.add(`${msg.llmProviderId}:${msg.llmModelId}`);
    }
  }
  return Array.from(llms);
};
```

---

## 7. 初期化フロー

### 7.1 アプリ起動時

```typescript
// apps/desktop/src/renderer/App.tsx

useEffect(() => {
  const initialize = async () => {
    // 1. プロバイダー一覧を取得
    await useLLMStore.getState().fetchProviders();

    // 2. 永続化された選択状態を復元（zustand persistが自動実行）

    // 3. 選択中プロバイダーのヘルスチェック
    const { selectedProviderId, checkHealth } = useLLMStore.getState();
    await checkHealth(selectedProviderId);

    // 4. 会話履歴を読み込み
    await useChatStore.getState().loadConversation(conversationId);
  };

  initialize();
}, []);
```

---

## 8. エラーハンドリング

### 8.1 エラー状態管理

```typescript
// llmSlice内

handleError: (error: LLMError) => {
  set({ error });

  // 特定エラーの場合は自動リカバリー
  if (error.code === 'API_KEY_MISSING') {
    // 設定画面への誘導はUIコンポーネントで処理
  } else if (error.code === 'RATE_LIMIT' && error.retryAfter) {
    // リトライ待機時間を表示
  }
},

// ストリーミングエラー時
handleStreamError: (error: LLMError) => {
  set(state => {
    // ストリーミング中のメッセージをエラー状態に
    const messages = state.messages.map(m =>
      m.isStreaming ? { ...m, isStreaming: false, error } : m
    );
    return { messages, error };
  });
},
```

---

## 9. 関連ドキュメント

| ドキュメント         | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                                       |
| API仕様              | `outputs/phase-2/api-specification.md`                                         |
| UI設計               | `outputs/phase-2/ui-design.md`                                                 |
| スキーマ設計         | `outputs/phase-2/schema-design.md`                                             |
| 既存チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` |
