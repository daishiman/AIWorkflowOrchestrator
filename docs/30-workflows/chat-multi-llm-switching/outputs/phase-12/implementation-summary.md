# 実装サマリー - チャット内LLMモデル切り替え機能

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| 機能名     | chat-multi-llm-switching |
| タスクID   | TASK-CHAT-LLM-SWITCH-001 |
| 実装日     | 2026-01-07 〜 2026-01-08 |
| ステータス | Phase 1-10 完了          |

---

## 1. 実装概要

### 1.1 実装範囲

本フェーズでは「データ層・状態管理層」を実装。

| レイヤー     | 実装内容            | 状態   |
| ------------ | ------------------- | ------ |
| Domain       | Zodスキーマ・型定義 | 完了   |
| Application  | IPCチャンネル定義   | 完了   |
| Presentation | llmSlice状態管理    | 完了   |
| UI           | コンポーネント      | 未着手 |
| IPC Handler  | mainプロセス実装    | 未着手 |

### 1.2 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                    Renderer Process                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LLM Selection UI [未実装]                                 │  │
│  │  └─► llmSlice (Zustand) [完了]                            │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Preload (IPC Bridge)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  window.electronAPI.llm [完了]                             │  │
│  │  ├─► getProviders()                                       │  │
│  │  └─► checkHealth(providerId)                              │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Main Process                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  IPC Handlers [未実装]                                     │  │
│  │  └─► LLM Adapter Factory [未実装]                         │  │
│  │      ├─► OpenAI Adapter                                   │  │
│  │      ├─► Anthropic Adapter                                │  │
│  │      ├─► Google Adapter                                   │  │
│  │      └─► xAI Adapter                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Package                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Zod Schemas [完了]                                        │  │
│  │  ├─► provider.ts (LLMProvider, LLMModel)                  │  │
│  │  ├─► message.ts (MessageRole, LLMMessage)                 │  │
│  │  ├─► request.ts (LLMChatRequest)                          │  │
│  │  ├─► response.ts (LLMChatResponse, LLMStreamChunk)        │  │
│  │  ├─► error.ts (LLMError, LLMErrorCode)                    │  │
│  │  ├─► health.ts (HealthCheckResult)                        │  │
│  │  ├─► ipc.ts (IPCChatRequest)                              │  │
│  │  └─► validators.ts (validate*, safeParse*)                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 実装ファイル一覧

### 2.1 packages/shared/src/types/llm/schemas/

| ファイル      | 説明                       | 行数 |
| ------------- | -------------------------- | ---- |
| provider.ts   | プロバイダー・モデル定義   | 87   |
| message.ts    | メッセージロール定義       | 28   |
| request.ts    | チャットリクエスト定義     | 42   |
| response.ts   | レスポンス・ストリーム定義 | 99   |
| error.ts      | エラーコード・エラー型定義 | 50   |
| health.ts     | ヘルスチェック型定義       | 40   |
| ipc.ts        | IPC通信用リクエスト型      | 40   |
| validators.ts | バリデーション関数         | 63   |
| index.ts      | 一括エクスポート           | 71   |

### 2.2 apps/desktop/

| ファイル                              | 説明              |
| ------------------------------------- | ----------------- |
| src/renderer/store/slices/llmSlice.ts | 状態管理スライス  |
| src/preload/channels.ts               | IPCチャンネル定義 |
| src/preload/types.ts                  | ElectronAPI型定義 |
| src/preload/index.ts                  | Preload API実装   |

---

## 3. 型定義

### 3.1 LLMプロバイダー

```typescript
type LLMProviderId = "openai" | "anthropic" | "google" | "xai";

interface LLMModel {
  id: string;
  name: string;
  description?: string;
  maxTokens: number;
  isDefault: boolean;
}

interface LLMProvider {
  id: LLMProviderId;
  name: string;
  description?: string;
  iconUrl?: string;
  models: LLMModel[];
  isAvailable: boolean;
  apiKeyConfigured: boolean;
}
```

### 3.2 チャットリクエスト/レスポンス

```typescript
interface LLMChatRequest {
  messages: LLMMessage[];
  modelId: string;
  systemPrompt?: string;
  temperature?: number; // 0-2, default: 1.0
  maxTokens?: number;
  stream?: boolean; // default: false
}

type LLMChatResponse =
  | { success: true; data: LLMResponseData }
  | { success: false; error: LLMError };
```

### 3.3 エラーコード

```typescript
type LLMErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "CONTEXT_LENGTH_EXCEEDED"
  | "CONTENT_FILTER"
  | "MODEL_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN";
```

---

## 4. 状態管理

### 4.1 llmSlice State

```typescript
interface LLMSlice {
  // State
  providers: LLMProvider[];
  selectedProviderId: LLMProviderId | null;
  selectedModelId: string | null;
  isLoading: boolean;
  error: LLMError | null;
  healthStatus: Record<LLMProviderId, HealthCheckResult | undefined>;

  // Actions
  fetchProviders: () => Promise<void>;
  selectProvider: (providerId: LLMProviderId) => void;
  selectModel: (modelId: string) => void;
  checkHealth: (providerId: LLMProviderId) => Promise<void>;
  resetSelection: () => void;
  clearError: () => void;

  // Selectors
  getSelectedProvider: () => LLMProvider | undefined;
  getSelectedModel: () => LLMModel | undefined;
  isProviderAvailable: (providerId: LLMProviderId) => boolean;
}
```

### 4.2 IPC API

```typescript
// Renderer → Main
window.electronAPI.llm.getProviders(): Promise<LLMProvider[]>
window.electronAPI.llm.checkHealth(providerId): Promise<HealthCheckResult>

// IPC Channels
"llm:get-providers"
"llm:check-health"
```

---

## 5. テスト結果

| カテゴリ       | ファイル数 | テスト数 | カバレッジ |
| -------------- | ---------- | -------- | ---------- |
| スキーマテスト | 9          | 305      | 100%       |
| llmSliceテスト | 2          | 55       | 99.25%     |
| **合計**       | **11**     | **360**  | **99%+**   |

---

## 6. 次フェーズでの実装事項

### 6.1 高優先度

| 項目             | 説明                      |
| ---------------- | ------------------------- |
| UIコンポーネント | プロバイダー/モデル選択UI |
| IPCハンドラー    | mainプロセスでのIPC処理   |
| LLMアダプター    | 各プロバイダーAPI実装     |

### 6.2 中優先度

| 項目               | 説明                       |
| ------------------ | -------------------------- |
| E2Eテスト          | Playwrightによる統合テスト |
| ストリーミング対応 | Server-Sent Events実装     |

### 6.3 低優先度

| 項目                 | 説明                 |
| -------------------- | -------------------- |
| パフォーマンス最適化 | レスポンスキャッシュ |
| 使用量トラッキング   | トークン使用量の記録 |

---

## 7. 使用方法

### 7.1 インポート

```typescript
// 型定義のインポート
import type {
  LLMProvider,
  LLMModel,
  LLMProviderId,
  LLMChatRequest,
  LLMChatResponse,
  LLMError,
} from "@repo/shared/types/llm/schemas";

// バリデーターのインポート
import {
  validateChatRequest,
  validateChatResponse,
  safeParseChatResponse,
} from "@repo/shared/types/llm/schemas";
```

### 7.2 Zustand Store使用

```typescript
import { useStore } from "@/renderer/store";

// コンポーネント内で使用
const {
  providers,
  selectedProviderId,
  selectedModelId,
  fetchProviders,
  selectProvider,
  selectModel,
} = useStore((state) => state);
```

---

## 変更履歴

| 日付       | バージョン | 変更内容                   |
| ---------- | ---------- | -------------------------- |
| 2026-01-08 | 1.0.0      | 初版作成（Phase 1-10完了） |
