# LLM UI/IPC/Adapter アーキテクチャ設計

## 文書情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | TASK-LLM-UI-IPC-ADAPTER-001   |
| Phase      | 2                             |
| 作成日     | 2026-01-09                    |
| 使用スキル | clean-architecture-principles |

---

## 1. アーキテクチャ概要

### 1.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Presentation Layer                                              │ │
│  │  - ProviderSelector                                             │ │
│  │  - ModelSelector                                                │ │
│  │  - HealthIndicator                                              │ │
│  │  - LLMSelectorPanel                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓↑                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ State Management Layer                                          │ │
│  │  - llmSlice (Zustand)                                           │ │
│  │  - Actions: fetchProviders, selectProvider, selectModel, etc.   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓↑                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Preload API Layer                                               │ │
│  │  - window.electronAPI.llm.getProviders()                        │ │
│  │  - window.electronAPI.llm.checkHealth()                         │ │
│  │  - window.electronAPI.llm.sendChat()                            │ │
│  │  - window.electronAPI.llm.streamChat()                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ IPC (contextBridge)
┌──────────────────────────────────┴──────────────────────────────────┐
│                          Main Process                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ IPC Handler Layer                                               │ │
│  │  - handleGetProviders()                                         │ │
│  │  - handleCheckHealth()                                          │ │
│  │  - handleSendChat()                                             │ │
│  │  - handleStreamChat()                                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓↑                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Service Layer                                                   │ │
│  │  - LLMService                                                   │ │
│  │  - LLMAdapterFactory                                            │ │
│  │  - ProviderConfigService                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓↑                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Adapter Layer (Anti-Corruption Layer)                           │ │
│  │  - ILLMAdapter (Interface)                                      │ │
│  │  - OpenAIAdapter                                                │ │
│  │  - AnthropicAdapter                                             │ │
│  │  - GoogleAdapter                                                │ │
│  │  - xAIAdapter                                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓↑                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Infrastructure Layer                                            │ │
│  │  - SecureStorage (APIキー管理)                                   │ │
│  │  - HTTP Client (fetch/axios)                                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │ HTTPS
                                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        External Services                             │
│  - OpenAI API                                                        │
│  - Anthropic API                                                     │
│  - Google AI API                                                     │
│  - xAI API                                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 依存関係の方向

```
Presentation → State Management → Preload API
                                       ↓
                            IPC Handler → Service → Adapter → External
```

- 上位レイヤーは下位レイヤーに依存
- 下位レイヤーは上位レイヤーを知らない
- Adapter層は外部APIの変更を吸収

---

## 2. クリーンアーキテクチャ原則の適用

### 2.1 依存性逆転の原則 (DIP)

```typescript
// ❌ 悪い例: 具象クラスへの直接依存
class LLMService {
  private adapter = new OpenAIAdapter(); // 具象に依存
}

// ✓ 良い例: インターフェースへの依存
interface ILLMAdapter {
  sendChat(request: LLMChatRequest): Promise<LLMChatResponse>;
}

class LLMService {
  constructor(private adapter: ILLMAdapter) {} // 抽象に依存
}
```

### 2.2 単一責任の原則 (SRP)

| コンポーネント    | 責任                          |
| ----------------- | ----------------------------- |
| ProviderSelector  | プロバイダー選択UIのみ        |
| ModelSelector     | モデル選択UIのみ              |
| HealthIndicator   | 接続状態表示のみ              |
| LLMService        | LLM操作のオーケストレーション |
| LLMAdapterFactory | アダプターのインスタンス生成  |
| OpenAIAdapter     | OpenAI API通信のみ            |

### 2.3 開放閉鎖の原則 (OCP)

新しいプロバイダー追加時の変更範囲:

```
1. 新しいAdapter実装クラスを追加
2. LLMAdapterFactoryに登録
3. LLMProviderIdSchemaに追加（既存スキーマへの影響あり）
```

既存コードの変更は最小限に抑える設計。

---

## 3. データフロー

### 3.1 プロバイダー取得フロー

```
1. [UI] LLMSelectorPanel マウント
       ↓
2. [State] llmSlice.fetchProviders() 呼び出し
       ↓
3. [Preload] window.electronAPI.llm.getProviders()
       ↓ (IPC invoke)
4. [Handler] handleGetProviders()
       ↓
5. [Service] ProviderConfigService.getProviders()
       ↓
6. [Storage] SecureStorage.getApiKey(providerId) で可用性チェック
       ↓
7. [Handler] LLMProvider[] を返却
       ↓ (IPC result)
8. [State] providers, selectedProviderId, selectedModelId 更新
       ↓
9. [UI] ProviderSelector, ModelSelector 再レンダリング
```

### 3.2 チャット送信フロー

```
1. [UI] ユーザーがメッセージ送信
       ↓
2. [State] sendChat action (未実装、将来追加)
       ↓
3. [Preload] window.electronAPI.llm.sendChat(request)
       ↓ (IPC invoke)
4. [Handler] handleSendChat(event, request)
       ↓
5. [Service] LLMService.sendChat(request)
       ↓
6. [Factory] LLMAdapterFactory.getAdapter(providerId)
       ↓
7. [Adapter] OpenAIAdapter.sendChat(request)
       ↓ (HTTPS)
8. [External] OpenAI API
       ↓
9. [Adapter] LLMChatResponse に変換
       ↓
10. [Handler] → [Preload] → [State] → [UI]
```

### 3.3 ストリーミングフロー

```
1. [UI] ストリーミング有効でメッセージ送信
       ↓
2. [Preload] window.electronAPI.llm.streamChat(request)
       ↓ (IPC invoke + event subscription)
3. [Handler] handleStreamChat(event, request)
       ↓
4. [Adapter] AsyncGenerator<StreamChunk> を返却
       ↓
5. [Handler] chunk 毎に IPC event を送信
       ↓ (IPC event: llm:stream-chunk)
6. [Preload] onStreamChunk コールバック呼び出し
       ↓
7. [State] メッセージを部分更新
       ↓
8. [UI] リアルタイム表示
```

---

## 4. エラーハンドリング戦略

### 4.1 エラー伝播

```
[External API]
    ↓ (APIエラー)
[Adapter] → LLMError に変換（エラーマッピング）
    ↓
[Service] → 必要ならリトライ
    ↓
[Handler] → IPC経由で返却
    ↓
[State] → error ステート更新
    ↓
[UI] → エラー表示
```

### 4.2 エラーマッピング

| 外部エラー            | LLMErrorCode            |
| --------------------- | ----------------------- |
| 401 Unauthorized      | API_KEY_INVALID         |
| 403 Forbidden         | API_KEY_INVALID         |
| 404 Not Found         | MODEL_NOT_FOUND         |
| 429 Too Many Requests | RATE_LIMIT              |
| 500 Server Error      | SERVICE_UNAVAILABLE     |
| Network Error         | NETWORK_ERROR           |
| Timeout               | TIMEOUT                 |
| Context Too Long      | CONTEXT_LENGTH_EXCEEDED |

### 4.3 リトライ戦略

```typescript
interface RetryConfig {
  maxRetries: number; // デフォルト: 3
  initialDelay: number; // デフォルト: 1000ms
  backoffMultiplier: number; // デフォルト: 2
  maxDelay: number; // デフォルト: 30000ms
}
```

リトライ対象: `NETWORK_ERROR`, `TIMEOUT`, `RATE_LIMIT`, `SERVICE_UNAVAILABLE`

---

## 5. セキュリティ設計

### 5.1 APIキー保護

```
[Renderer Process]
    │
    │ ※ APIキーは絶対に露出しない
    │
[Preload] ← contextBridge で制限されたAPIのみ公開
    │
[Main Process]
    │
[SecureStorage] ← OS標準のキーチェーン/資格情報マネージャー使用
```

### 5.2 IPC セキュリティ

| 対策                     | 実装                           |
| ------------------------ | ------------------------------ |
| チャンネルホワイトリスト | ALLOWED_INVOKE_CHANNELS で制限 |
| 入力バリデーション       | Zodスキーマでリクエスト検証    |
| コンテキスト分離         | contextIsolation: true         |
| Node.js無効化            | nodeIntegration: false         |

---

## 6. テスト戦略

### 6.1 レイヤー別テスト

| レイヤー     | テスト種別 | テスト対象                   |
| ------------ | ---------- | ---------------------------- |
| Presentation | ユニット   | コンポーネントのレンダリング |
| State        | ユニット   | llmSlice actions/selectors   |
| Handler      | 統合       | IPC通信のモック              |
| Service      | ユニット   | ビジネスロジック             |
| Adapter      | ユニット   | APIモック                    |
| E2E          | E2E        | 全体フロー                   |

### 6.2 モック戦略

```typescript
// Adapter層のモック
const mockAdapter: ILLMAdapter = {
  sendChat: vi.fn().mockResolvedValue({ success: true, data: {...} }),
  streamChat: vi.fn(),
  checkHealth: vi.fn().mockResolvedValue({ status: 'connected' }),
};

// Factory経由で注入
LLMAdapterFactory.register('openai', () => mockAdapter);
```

---

## 7. ディレクトリ構成

```
apps/desktop/src/
├── main/
│   ├── handlers/
│   │   └── llm.ts              # IPCハンドラー
│   ├── services/
│   │   ├── llm-service.ts      # LLMサービス
│   │   └── provider-config.ts  # プロバイダー設定
│   └── adapters/
│       └── llm/
│           ├── types.ts        # ILLMAdapter インターフェース
│           ├── factory.ts      # LLMAdapterFactory
│           ├── openai.ts       # OpenAIAdapter
│           ├── anthropic.ts    # AnthropicAdapter
│           ├── google.ts       # GoogleAdapter
│           ├── xai.ts          # xAIAdapter
│           └── __tests__/      # アダプターテスト
├── preload/
│   ├── channels.ts             # IPCチャンネル定義（既存）
│   ├── index.ts                # Preload API（既存）
│   └── types.ts                # Preload型定義（既存）
└── renderer/
    ├── components/
    │   └── llm/
    │       ├── ProviderSelector.tsx
    │       ├── ModelSelector.tsx
    │       ├── HealthIndicator.tsx
    │       ├── LLMSelectorPanel.tsx
    │       ├── index.ts
    │       └── __tests__/      # UIテスト
    └── store/
        └── slices/
            └── llmSlice.ts     # 状態管理（既存）
```

---

## 8. 統合ポイントと契約

### 8.1 UI → llmSlice

```typescript
// 契約: llmSlice が公開するインターフェース
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
}
```

### 8.2 llmSlice → Preload API

```typescript
// 契約: window.electronAPI.llm が公開するインターフェース
interface LLMPreloadAPI {
  getProviders: () => Promise<LLMProvider[]>;
  checkHealth: (providerId: LLMProviderId) => Promise<HealthCheckResult>;
  sendChat: (request: LLMChatRequest) => Promise<LLMChatResponse>;
  streamChat: (
    request: LLMChatRequest,
    onChunk: (chunk: StreamChunk) => void,
  ) => Promise<void>;
}
```

### 8.3 Handler → Adapter

```typescript
// 契約: ILLMAdapter インターフェース
interface ILLMAdapter {
  readonly providerId: LLMProviderId;

  sendChat(request: LLMChatRequest): Promise<LLMChatResponse>;

  streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk>;

  checkHealth(): Promise<HealthCheckResult>;
}
```

---

## 9. 設計判断と根拠

| 判断                            | 根拠                               |
| ------------------------------- | ---------------------------------- |
| Adapter パターン採用            | プロバイダーAPI変更の影響を局所化  |
| Factory パターン採用            | アダプター生成ロジックの一元化     |
| 既存スキーマ活用                | 390件のテスト資産を保護            |
| Main Process でAPI呼び出し      | APIキー保護、セキュリティ要件      |
| AsyncGenerator でストリーミング | メモリ効率、バックプレッシャー対応 |
