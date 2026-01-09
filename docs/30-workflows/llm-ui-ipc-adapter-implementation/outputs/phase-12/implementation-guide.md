# LLM UI/IPC/Adapter 実装ガイド

## Part 1: 概念的な説明（初学者・非技術者向け）

### LLMプロバイダー切り替えとは？

**比喩で説明**: 電源アダプターのような仕組み

世界中の国によってコンセントの形状が異なります。日本ではA型、ヨーロッパではC型、イギリスではG型など。旅行する時、電源アダプターを使えば、どの国でも同じ機器が使えますよね？

LLMアダプターシステムも同じです。OpenAI、Anthropic、Google、xAIなど、AIプロバイダーごとにAPIの「形状」が異なります。LLMアダプターは、これらの違いを吸収し、統一された形式でAIと会話できるようにする「翻訳者」の役割を果たします。

```
┌─────────────────────────────────────────────────────┐
│                    あなた（ユーザー）                │
│             「明日の天気を教えて」                   │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│              LLMアダプター（翻訳者）                 │
│   「あなたの言葉をAIが理解できる形に変換します」     │
└─────────────────────────────────────────────────────┘
          ↓              ↓              ↓
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ OpenAI  │    │Anthropic│    │ Google  │
    │ (GPT-4) │    │(Claude) │    │(Gemini) │
    └─────────┘    └─────────┘    └─────────┘
```

### なぜこの機能が必要？

1. **選択の自由**: お気に入りのAIを自由に選べる
2. **コスト最適化**: 用途に応じて安いモデルを選べる
3. **障害対策**: 1つのAIがダウンしても別のAIに切り替え可能
4. **最新技術の活用**: 新しいAIモデルが出たらすぐに試せる

### どのように動作する？

```
1. ユーザーがプロバイダーを選択
   例: 「Claude（Anthropic）を使いたい」

2. システムがAPIキーを確認
   例: 「Anthropicの認証情報、OK!」

3. ユーザーがメッセージを送信
   例: 「こんにちは」

4. アダプターがAPIに変換して送信
   例: OpenAI形式 → Anthropic形式に翻訳

5. AIから返答を受信
   例: 「こんにちは！何かお手伝いできますか？」

6. 統一形式でユーザーに表示
   例: どのAIでも同じUIで表示
```

### 用語集

| 用語         | 読み方           | 意味                                                      |
| ------------ | ---------------- | --------------------------------------------------------- |
| LLM          | エル・エル・エム | Large Language Model。大規模言語モデル。ChatGPTのようなAI |
| Provider     | プロバイダー     | AIサービスを提供する会社（OpenAI、Anthropicなど）         |
| Adapter      | アダプター       | 異なる形式を変換する仕組み                                |
| IPC          | アイ・ピー・シー | Inter-Process Communication。プロセス間通信               |
| Health Check | ヘルスチェック   | サービスが正常に動作しているか確認すること                |
| Streaming    | ストリーミング   | データを少しずつ受信しながら表示する方式                  |

---

## Part 2: 技術的な詳細（開発者・技術者向け）

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ LLMSelectorPanel                                    │ │
│  │  ├── ProviderSelector (プロバイダー選択)            │ │
│  │  ├── ModelSelector (モデル選択)                     │ │
│  │  └── HealthIndicator (接続状態)                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│                    window.electronAPI                    │
│                          │                               │
└─────────────────────────────────────────────────────────┘
                           │ IPC Bridge (Preload)
┌─────────────────────────────────────────────────────────┐
│                     Main Process                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ IPC Handlers (llm.ts)                               │ │
│  │  ├── llm:get-providers    → プロバイダー一覧取得    │ │
│  │  ├── llm:check-health     → ヘルスチェック実行      │ │
│  │  ├── llm:send-chat        → チャット送信            │ │
│  │  └── llm:stream-chat      → ストリーミング送信      │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ LLMAdapterFactory                                   │ │
│  │  └── getAdapter(providerId) → ILLMAdapter           │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Adapters (extends BaseLLMAdapter)                   │ │
│  │  ├── OpenAIAdapter     (GPT-4o, GPT-4-turbo, etc.)  │ │
│  │  ├── AnthropicAdapter  (Claude 3.5, 3 Opus, etc.)   │ │
│  │  ├── GoogleAdapter     (Gemini 1.5, 2.0, etc.)      │ │
│  │  └── xAIAdapter        (Grok-2, Grok-2-mini)        │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### なぜこの設計にしたか（設計理由）

#### 1. Adapterパターンの採用

**悪い例**: 直接API呼び出し

```typescript
// ❌ プロバイダーごとに条件分岐が増え続ける
async function chat(provider: string, message: string) {
  if (provider === "openai") {
    return await openaiClient.chat(message);
  } else if (provider === "anthropic") {
    return await anthropicClient.messages(message);
  } else if (provider === "google") {
    // ...延々と続く
  }
}
```

**良い例**: Adapterパターン

```typescript
// ✅ 統一インターフェースで呼び出し
const adapter = factory.getAdapter(providerId);
const response = await adapter.chat(request);
```

**理由**: 新プロバイダー追加時、既存コードの変更不要。Single Responsibility原則に従う。

#### 2. Factory パターンの採用

**理由**: アダプターのインスタンス化ロジックを1箇所に集約。APIキー取得や依存性注入を隠蔽。

```typescript
// ファクトリーがAPIキー取得とインスタンス化を担当
export function getAdapter(providerId: LLMProviderId): ILLMAdapter {
  const apiKey = secureStorage.get(`${providerId}_api_key`);
  switch (providerId) {
    case "openai":
      return new OpenAIAdapter(apiKey);
    // ...
  }
}
```

#### 3. BaseLLMAdapter抽象クラスの採用

**理由**: 共通ロジック（リトライ、エラーハンドリング、ログ）を1箇所にまとめ、各アダプターはAPI固有のロジックのみに集中。

```typescript
// 基底クラスで共通処理を実装
abstract class BaseLLMAdapter implements ILLMAdapter {
  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    // リトライロジック（全アダプター共通）
  }

  // 各アダプターが実装するメソッド
  abstract chat(request: LLMChatRequest): Promise<LLMChatResponse>;
}
```

### IPCチャンネル仕様

| チャンネル          | メソッド | 入力             | 出力                    |
| ------------------- | -------- | ---------------- | ----------------------- |
| `llm:get-providers` | invoke   | なし             | `LLMProvider[]`         |
| `llm:check-health`  | invoke   | `LLMProviderId`  | `HealthCheckResult`     |
| `llm:send-chat`     | invoke   | `LLMChatRequest` | `LLMChatResponse`       |
| `llm:stream-chat`   | send/on  | `LLMChatRequest` | `LLMStreamChunk` (連続) |

### UIコンポーネント詳細

#### ProviderSelector

```typescript
// プロバイダー選択コンポーネント
interface ProviderSelectorProps {
  providers: LLMProvider[]; // 利用可能なプロバイダー一覧
  selectedProviderId: LLMProviderId | null; // 選択中のプロバイダー
  onSelect: (id: LLMProviderId) => void; // 選択時コールバック
  disabled?: boolean; // 無効化フラグ
}
```

**設計意図**: 利用不可のプロバイダー（APIキー未設定など）はdisabled表示。視覚的に状態を伝達。

#### ModelSelector

```typescript
// モデル選択コンポーネント
interface ModelSelectorProps {
  models: LLMModel[]; // 利用可能なモデル一覧
  selectedModelId: string | null; // 選択中のモデル
  onSelect: (id: string) => void; // 選択時コールバック
  disabled?: boolean; // 無効化フラグ
}
```

**設計意図**: プロバイダー選択後に動的にモデル一覧を更新。プロバイダー未選択時はdisabled。

#### HealthIndicator

```typescript
// 接続状態インジケーター
interface HealthIndicatorProps {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  latencyMs?: number; // レイテンシ（ms）
  errorMessage?: string; // エラーメッセージ
}
```

**設計意図**: 信号機のように直感的に状態を伝達（緑=正常、黄=警告、赤=異常）。

### エラーハンドリング

```typescript
// エラーコード一覧
enum LLMErrorCode {
  API_KEY_MISSING = "API_KEY_MISSING", // APIキー未設定
  API_KEY_INVALID = "API_KEY_INVALID", // APIキー無効
  NETWORK_ERROR = "NETWORK_ERROR", // ネットワークエラー
  TIMEOUT = "TIMEOUT", // タイムアウト
  RATE_LIMIT = "RATE_LIMIT", // レート制限
  CONTEXT_LENGTH_EXCEEDED = "CONTEXT_LENGTH_EXCEEDED", // コンテキスト超過
  CONTENT_FILTER = "CONTENT_FILTER", // コンテンツフィルター
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND", // モデル未発見
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE", // サービス利用不可
  UNKNOWN = "UNKNOWN", // 不明なエラー
}

// エラー型
interface LLMError {
  code: LLMErrorCode;
  message: string;
  retryable: boolean; // リトライ可能か
  retryAfterMs?: number; // リトライ待機時間
}
```

**設計意図**: ユーザーに適切なフィードバックを提供し、リトライ可能な場合は自動リトライを実行。

### ディレクトリ構成

```
apps/desktop/src/
├── main/
│   ├── adapters/llm/
│   │   ├── BaseLLMAdapter.ts      # 基底クラス
│   │   ├── OpenAIAdapter.ts       # OpenAI実装
│   │   ├── AnthropicAdapter.ts    # Anthropic実装
│   │   ├── GoogleAdapter.ts       # Google実装
│   │   ├── xAIAdapter.ts          # xAI実装
│   │   ├── factory.ts             # ファクトリー
│   │   └── __tests__/             # テスト
│   └── handlers/
│       ├── llm.ts                 # IPCハンドラー
│       └── __tests__/
├── renderer/
│   ├── components/llm/
│   │   ├── ProviderSelector.tsx   # プロバイダー選択
│   │   ├── ModelSelector.tsx      # モデル選択
│   │   ├── HealthIndicator.tsx    # ヘルスインジケーター
│   │   ├── LLMSelectorPanel.tsx   # 統合パネル
│   │   └── __tests__/
│   └── store/slices/
│       └── llmSlice.ts            # 状態管理
└── preload/
    ├── channels.ts                # チャンネル定義
    └── index.ts                   # API公開
```

### テストカバレッジ

| コンポーネント | Statements | Branches   | Functions  |
| -------------- | ---------- | ---------- | ---------- |
| Adapters       | 92.67%     | 100%       | 95.12%     |
| Handlers       | 88.31%     | 68.42%     | 88.88%     |
| UI Components  | 91.79%     | 81.20%     | 91.66%     |
| Store          | 99.27%     | 90.56%     | 100%       |
| **Total**      | **84.11%** | **87.32%** | **89.18%** |

### 使用例

#### プロバイダー一覧取得

```typescript
// Renderer Process
const providers = await window.electronAPI.llm.getProviders();
// => [{ id: 'openai', name: 'OpenAI', models: [...], isAvailable: true }, ...]
```

#### チャット送信

```typescript
// 通常のチャット
const response = await window.electronAPI.llm.sendChat({
  messages: [{ role: "user", content: "Hello!" }],
  modelId: "gpt-4o",
  temperature: 0.7,
});

// ストリーミング
window.electronAPI.llm.streamChat(
  {
    messages: [{ role: "user", content: "Tell me a story" }],
    modelId: "claude-3.5-sonnet",
  },
  (chunk) => {
    console.log(chunk.delta.content);
  },
);
```

#### ヘルスチェック

```typescript
const result = await window.electronAPI.llm.checkHealth("openai");
// => { status: 'healthy', latencyMs: 234, checkedAt: '2026-01-09T...' }
```

---

## 関連ドキュメント

- 型定義: `packages/shared/src/types/llm/schemas/`
- 状態管理: `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- IPCチャンネル: `apps/desktop/src/preload/channels.ts`
- システム仕様: `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
