# アーキテクチャ設計 - チャット内LLMモデル切り替え機能

## メタ情報

| 項目   | 内容                          |
| ------ | ----------------------------- |
| 機能名 | chat-multi-llm-switching      |
| Phase  | 2                             |
| 作成日 | 2026-01-07                    |
| スキル | clean-architecture-principles |

---

## 1. アーキテクチャ概要

### 1.1 設計原則

本機能は Clean Architecture の原則に従い、以下のレイヤー構成を採用する。

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                            │
│  (Desktop Renderer: React Components, Zustand Store)                │
├─────────────────────────────────────────────────────────────────────┤
│                        Application Layer                             │
│  (Desktop Main: IPC Handlers, Use Cases)                            │
├─────────────────────────────────────────────────────────────────────┤
│                        Domain Layer                                  │
│  (packages/shared: Interfaces, Types, Domain Logic)                 │
├─────────────────────────────────────────────────────────────────────┤
│                        Infrastructure Layer                          │
│  (LLM API Adapters, Storage Adapters)                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 依存関係ルール

| ルール   | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 内向依存 | 外側のレイヤーは内側のレイヤーにのみ依存可能               |
| 逆向禁止 | Domain Layer は Presentation/Infrastructure に依存しない   |
| 抽象依存 | Application Layer は Domain Layer のインターフェースに依存 |

---

## 2. レイヤー設計

### 2.1 Domain Layer（packages/shared）

**責務**: ビジネスルールとインターフェース定義

```
packages/shared/
├── src/
│   ├── types/
│   │   └── llm/
│   │       ├── index.ts              # エクスポート
│   │       ├── provider.ts           # LLMProvider, LLMModel 型
│   │       ├── message.ts            # ChatMessage 型（LLM識別付き）
│   │       ├── request.ts            # LLMChatRequest 型
│   │       └── response.ts           # LLMChatResponse 型
│   ├── interfaces/
│   │   └── llm/
│   │       ├── index.ts              # エクスポート
│   │       └── llm-adapter.ts        # ILLMAdapter インターフェース
│   └── services/
│       └── llm/
│           ├── index.ts              # エクスポート
│           ├── llm-adapter-factory.ts # アダプターファクトリ
│           └── provider-registry.ts   # プロバイダー登録
```

#### 主要インターフェース

```typescript
// ILLMAdapter - LLMプロバイダー共通インターフェース
interface ILLMAdapter {
  readonly providerId: LLMProviderId;
  readonly providerName: string;

  // チャット送信
  chat(request: LLMChatRequest): Promise<LLMChatResponse>;

  // ストリーミングチャット
  chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamChunk>;

  // ヘルスチェック
  healthCheck(): Promise<HealthCheckResult>;

  // 利用可能モデル取得
  getAvailableModels(): Promise<LLMModel[]>;
}
```

### 2.2 Infrastructure Layer（LLMアダプター実装）

**責務**: 各LLM APIへの具体的な通信実装

```
packages/shared/
└── src/
    └── infrastructure/
        └── llm-adapters/
            ├── index.ts              # エクスポート
            ├── openai-adapter.ts     # OpenAI実装
            ├── anthropic-adapter.ts  # Anthropic実装
            ├── google-adapter.ts     # Google AI実装
            └── xai-adapter.ts        # xAI実装
```

#### アダプターパターン

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ILLMAdapter                                   │
│  (Domain Layer - Interface)                                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ implements
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ OpenAI       │      │ Anthropic    │      │ Google AI    │
│ Adapter      │      │ Adapter      │      │ Adapter      │
└──────────────┘      └──────────────┘      └──────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ OpenAI API   │      │ Anthropic    │      │ Google AI    │
│              │      │ API          │      │ API          │
└──────────────┘      └──────────────┘      └──────────────┘
```

### 2.3 Application Layer（Desktop Main）

**責務**: IPC通信、ユースケース実行

```
apps/desktop/
└── src/
    └── main/
        ├── ipc/
        │   └── llm-handlers.ts       # LLM IPC ハンドラー
        └── services/
            └── llm-service.ts        # LLMサービス（アダプター管理）
```

#### IPCハンドラー設計

| Channel                  | Direction       | Payload           |
| ------------------------ | --------------- | ----------------- |
| `llm:chat`               | Renderer → Main | LLMChatRequest    |
| `llm:chat:response`      | Main → Renderer | LLMChatResponse   |
| `llm:chat:stream`        | Main → Renderer | LLMStreamChunk    |
| `llm:get-providers`      | Renderer → Main | void              |
| `llm:providers:response` | Main → Renderer | LLMProvider[]     |
| `llm:health-check`       | Renderer → Main | LLMProviderId     |
| `llm:health:response`    | Main → Renderer | HealthCheckResult |

### 2.4 Presentation Layer（Desktop Renderer）

**責務**: UI表示、ユーザー操作、状態管理

```
apps/desktop/
└── src/
    └── renderer/
        ├── components/
        │   └── Chat/
        │       ├── LLMSelector.tsx       # LLM選択コンポーネント
        │       ├── ProviderDropdown.tsx  # プロバイダー選択
        │       ├── ModelDropdown.tsx     # モデル選択
        │       └── MessageWithLLM.tsx    # LLMラベル付きメッセージ
        └── store/
            └── slices/
                ├── chatSlice.ts          # 既存チャット状態（拡張）
                └── llmSlice.ts           # LLM選択状態
```

---

## 3. データフロー設計

### 3.1 メッセージ送信フロー

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. User Input                                                        │
│    ユーザーがメッセージを入力し送信ボタンをクリック                   │
└──────────────────────────────┬───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 2. Renderer: chatSlice.sendMessage()                                 │
│    - 選択中のLLM情報を取得                                            │
│    - ユーザーメッセージをstoreに追加                                  │
│    - IPC経由でMainプロセスにリクエスト送信                            │
└──────────────────────────────┬───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 3. Main: llm-handlers.ts                                             │
│    - リクエストを受信                                                 │
│    - LLMServiceを通じて適切なアダプターを取得                         │
│    - アダプター経由でLLM APIを呼び出し                                │
└──────────────────────────────┬───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 4. Infrastructure: LLMAdapter                                        │
│    - 外部LLM APIにリクエスト送信                                      │
│    - レスポンスを共通形式に正規化                                     │
│    - ストリーミングの場合はチャンクを逐次返却                         │
└──────────────────────────────┬───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 5. Main → Renderer: IPC Response                                     │
│    - レスポンスをRendererに送信                                       │
│    - ストリーミングの場合は複数回のチャンク送信                       │
└──────────────────────────────┬───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 6. Renderer: chatSlice.receiveMessage()                              │
│    - アシスタントメッセージをstoreに追加（LLM情報付き）               │
│    - UIを更新してメッセージを表示                                     │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 LLM切り替えフロー

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. User Selection                                                    │
│    ユーザーがLLMセレクターでプロバイダー/モデルを変更                 │
└──────────────────────────────┬───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 2. Renderer: llmSlice.selectProvider() / selectModel()               │
│    - 選択状態を更新                                                   │
│    - 選択状態をローカルストレージに永続化                             │
│    - 確認ダイアログなし（即時反映）                                   │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │ 次回メッセージ送信時に新LLMが使用される   │
        │ 会話履歴は全て新LLMに渡される             │
        │ システムプロンプトは維持される            │
        └──────────────────────────────────────────┘
```

---

## 4. 境界インターフェース設計

### 4.1 Domain ⇔ Infrastructure 境界

```typescript
// packages/shared/src/interfaces/llm/llm-adapter.ts

export interface ILLMAdapter {
  readonly providerId: LLMProviderId;
  readonly providerName: string;

  chat(request: LLMChatRequest): Promise<LLMChatResponse>;
  chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamChunk>;
  healthCheck(): Promise<HealthCheckResult>;
  getAvailableModels(): Promise<LLMModel[]>;
}

export interface ILLMAdapterFactory {
  createAdapter(providerId: LLMProviderId, config: LLMConfig): ILLMAdapter;
  getSupportedProviders(): LLMProviderId[];
}
```

### 4.2 Application ⇔ Domain 境界

```typescript
// apps/desktop/src/main/services/llm-service.ts

export interface ILLMService {
  // プロバイダー管理
  getProviders(): LLMProvider[];
  getModels(providerId: LLMProviderId): LLMModel[];

  // チャット
  sendMessage(request: LLMChatRequest): Promise<LLMChatResponse>;
  sendMessageStream(request: LLMChatRequest): AsyncIterable<LLMStreamChunk>;

  // ヘルスチェック
  checkConnection(providerId: LLMProviderId): Promise<HealthCheckResult>;
}
```

### 4.3 Presentation ⇔ Application 境界（IPC）

```typescript
// apps/desktop/src/preload/types.ts

export interface LLMApi {
  // Provider/Model 取得
  getProviders(): Promise<LLMProvider[]>;

  // チャット送信
  sendMessage(request: LLMChatRequest): Promise<void>;

  // ストリーミング購読
  onStreamChunk(callback: (chunk: LLMStreamChunk) => void): () => void;
  onStreamEnd(callback: (response: LLMChatResponse) => void): () => void;

  // 接続確認
  checkConnection(providerId: LLMProviderId): Promise<HealthCheckResult>;
}
```

---

## 5. 依存関係図

```
┌────────────────────────────────────────────────────────────────────────┐
│                          apps/desktop/renderer                          │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │
│  │  LLMSelector    │   │  chatSlice      │   │  llmSlice       │       │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘       │
│           │                     │                     │                │
│           └──────────┬──────────┴──────────┬──────────┘                │
│                      │                     │                           │
│                      ▼                     ▼                           │
│           ┌─────────────────────────────────────────┐                  │
│           │           IPC (preload.ts)              │                  │
│           └─────────────────────┬───────────────────┘                  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │
                                  ▼ IPC
┌─────────────────────────────────┴──────────────────────────────────────┐
│                           apps/desktop/main                             │
│           ┌─────────────────────────────────────────┐                  │
│           │         llm-handlers.ts                 │                  │
│           └─────────────────────┬───────────────────┘                  │
│                                 │                                      │
│                                 ▼                                      │
│           ┌─────────────────────────────────────────┐                  │
│           │         LLMService                      │                  │
│           └─────────────────────┬───────────────────┘                  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │
                                  ▼ import
┌─────────────────────────────────┴──────────────────────────────────────┐
│                          packages/shared                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    src/interfaces/llm/                            │  │
│  │  ┌─────────────────┐                                             │  │
│  │  │  ILLMAdapter    │ ◄────────────────────────────────────┐      │  │
│  │  └─────────────────┘                                      │      │  │
│  └──────────────────────────────────────────────────────────┼──────┘  │
│                                                              │         │
│  ┌──────────────────────────────────────────────────────────┼──────┐  │
│  │                    src/infrastructure/llm-adapters/       │      │  │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │      │  │
│  │  │ OpenAIAdapter │ │AnthropicAdapter│ │ GoogleAdapter │───┘      │  │
│  │  └───────────────┘ └───────────────┘ └───────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 違反チェックポイント

| チェック項目                          | 許可 | 違反例                   |
| ------------------------------------- | ---- | ------------------------ |
| Renderer → packages/shared/types      | ✅   | -                        |
| Renderer → packages/shared/interfaces | ✅   | -                        |
| Main → packages/shared/infrastructure | ✅   | -                        |
| Main → Renderer components            | ❌   | main が React import     |
| Domain → Infrastructure 具象          | ❌   | types/ が adapter import |
| Infrastructure → External APIs        | ✅   | -                        |

---

## 7. テスタビリティ設計

### 7.1 モック戦略

| レイヤー       | モック対象  | モック方法                    |
| -------------- | ----------- | ----------------------------- |
| Presentation   | IPC API     | jest.mock('@/preload')        |
| Application    | ILLMAdapter | Mock implementation injection |
| Infrastructure | 外部API     | MSW (Mock Service Worker)     |

### 7.2 テスト境界

```
Unit Tests:
├── packages/shared/src/types/llm/__tests__/      # 型テスト
├── packages/shared/src/infrastructure/__tests__/  # アダプターテスト
└── apps/desktop/src/renderer/store/__tests__/     # Storeテスト

Integration Tests:
├── apps/desktop/src/main/__tests__/               # IPC統合テスト
└── apps/desktop/e2e/                              # E2Eテスト
```

---

## 8. 関連ドキュメント

| ドキュメント | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     |
| API仕様      | `outputs/phase-2/api-specification.md`       |
| 状態管理設計 | `outputs/phase-2/state-management-design.md` |
