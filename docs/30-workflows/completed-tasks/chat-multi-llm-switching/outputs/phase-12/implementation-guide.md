# チャット内LLMモデル切り替え機能 - 実装ガイド

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| 機能名     | chat-multi-llm-switching |
| タスクID   | TASK-CHAT-LLM-SWITCH-001 |
| 作成日     | 2026-01-08               |
| バージョン | 1.0.0                    |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## この機能は何をするもの？

### 身近な例えで理解する

この機能は「**AIの翻訳者を選べるリモコン**」のようなものです。

テレビのリモコンで、地上波・BS・CSを切り替えるように、チャット画面でAIの「翻訳者」を切り替えられます。

```
┌─────────────────────────────────────────┐
│  🎮 AIリモコン                          │
│                                         │
│  [OpenAI]  [Anthropic]  [Google]  [xAI] │
│     ↓                                   │
│  📺 選んだAIがあなたの質問に答えます     │
└─────────────────────────────────────────┘
```

### なぜ必要なの？

1. **得意分野が違う**: コード書きが得意なAI、文章作成が得意なAIがいます
2. **コストが違う**: 同じ質問でも、安いAI・高いAIがあります
3. **バックアップ**: 1つのAIが使えなくても、別のAIに切り替えられます

### どんな会社のAIが使えるの？

| 会社名    | 読み方           | 有名なAI |
| --------- | ---------------- | -------- |
| OpenAI    | オープンエーアイ | ChatGPT  |
| Anthropic | アンソロピック   | Claude   |
| Google    | グーグル         | Gemini   |
| xAI       | エックスエーアイ | Grok     |

---

## 仕組みをざっくり理解する

### 3つの層（レイヤー）

この機能は、3階建てのビルのような構造になっています。

```
┌─────────────────────────────────────────┐
│ 3F: 画面（UI）                          │
│     → ユーザーがボタンを押す場所        │
├─────────────────────────────────────────┤
│ 2F: 管理人（状態管理）                  │
│     → 「今どのAIが選ばれているか」を    │
│       覚えている場所                    │
├─────────────────────────────────────────┤
│ 1F: 基礎（型定義・スキーマ）            │
│     → 「AIの情報はこういう形式で        │
│       書く」というルールを決める場所    │
└─────────────────────────────────────────┘
```

### 今回作ったのは「1F」と「2F」

| 階層 | 名前     | 今回の実装 | 説明                       |
| ---- | -------- | ---------- | -------------------------- |
| 3F   | UI       | ❌ 未実装  | ボタンや選択画面           |
| 2F   | 状態管理 | ✅ 完了    | 選択状態を覚える仕組み     |
| 1F   | 型定義   | ✅ 完了    | データの形式を決めるルール |

---

## よく使う言葉の意味

### 専門用語リスト

| 用語                | 読み方                             | 意味                                       |
| ------------------- | ---------------------------------- | ------------------------------------------ |
| Provider            | プロバイダー                       | AIを提供している会社（OpenAIなど）         |
| Model               | モデル                             | 具体的なAIの種類（GPT-4、Claude 3など）    |
| Schema              | スキーマ                           | データの形式を定義するルール               |
| Zod                 | ゾッド                             | データの形式をチェックするツール           |
| Slice               | スライス                           | 状態管理の一部分（パンのスライスのように） |
| IPC                 | アイピーシー                       | プログラム同士が会話する方法               |
| Discriminated Union | ディスクリミネイティッド・ユニオン | 「成功」か「失敗」かを明確に区別する仕組み |

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ全体像

```
┌─────────────────────────────────────────────────────────────────┐
│                    Renderer Process                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LLM Selection UI [未実装]                                 │  │
│  │  └─► llmSlice (Zustand) [完了]                            │  │
│  │      ├─► providers: LLMProvider[]                         │  │
│  │      ├─► selectedProviderId: LLMProviderId | null         │  │
│  │      ├─► selectedModelId: string | null                   │  │
│  │      └─► healthStatus: Record<LLMProviderId, HealthCheck> │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Preload (IPC Bridge)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  window.electronAPI.llm [完了]                             │  │
│  │  ├─► getProviders(): Promise<LLMProvider[]>               │  │
│  │  └─► checkHealth(providerId): Promise<HealthCheckResult>  │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Main Process [未実装]                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  IPC Handlers                                              │  │
│  │  └─► LLM Adapter Factory                                  │  │
│  │      ├─► OpenAI Adapter                                   │  │
│  │      ├─► Anthropic Adapter                                │  │
│  │      ├─► Google Adapter                                   │  │
│  │      └─► xAI Adapter                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Package [完了]                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  packages/shared/src/types/llm/schemas/                    │  │
│  │  ├─► provider.ts  (LLMProvider, LLMModel, LLMProviderId)  │  │
│  │  ├─► message.ts   (MessageRole, LLMMessage)               │  │
│  │  ├─► request.ts   (LLMChatRequest)                        │  │
│  │  ├─► response.ts  (LLMChatResponse, LLMStreamChunk)       │  │
│  │  ├─► error.ts     (LLMError, LLMErrorCode)                │  │
│  │  ├─► health.ts    (HealthCheckResult)                     │  │
│  │  ├─► ipc.ts       (IPCChatRequest)                        │  │
│  │  └─► validators.ts (validate*, safeParse*)                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 型定義詳細

### LLMプロバイダー（provider.ts）

```typescript
// プロバイダーID: 4社のAIプロバイダーを定義
// 読み方: エルエルエム・プロバイダー・アイディー
export const LLMProviderIdSchema = z.enum([
  "openai", // オープンエーアイ
  "anthropic", // アンソロピック
  "google", // グーグル
  "xai", // エックスエーアイ
]);
export type LLMProviderId = z.infer<typeof LLMProviderIdSchema>;

// モデル情報: 各AIモデルの詳細
// 読み方: エルエルエム・モデル
export const LLMModelSchema = z.object({
  id: z.string(), // モデルID（例: "gpt-4"）
  name: z.string(), // 表示名（例: "GPT-4"）
  description: z.string().optional(), // 説明文
  maxTokens: z.number(), // 最大トークン数
  isDefault: z.boolean(), // デフォルトモデルかどうか
});
export type LLMModel = z.infer<typeof LLMModelSchema>;

// プロバイダー情報: 会社とそのモデル一覧
// 読み方: エルエルエム・プロバイダー
export const LLMProviderSchema = z.object({
  id: LLMProviderIdSchema,
  name: z.string(), // 会社名
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  models: z.array(LLMModelSchema), // 利用可能なモデル一覧
  isAvailable: z.boolean(), // 利用可能かどうか
  apiKeyConfigured: z.boolean(), // APIキー設定済みか
});
export type LLMProvider = z.infer<typeof LLMProviderSchema>;
```

### レスポンス型（response.ts）

```typescript
// Discriminated Union（識別可能なユニオン）パターン
// 「成功」と「失敗」を明確に区別する設計

// 成功時のレスポンス
export const LLMSuccessResponseSchema = z.object({
  success: z.literal(true), // 必ず true
  data: LLMResponseDataSchema,
});

// 失敗時のレスポンス
export const LLMErrorResponseSchema = z.object({
  success: z.literal(false), // 必ず false
  error: LLMErrorSchema,
});

// どちらかになる（成功 OR 失敗）
export const LLMChatResponseSchema = z.discriminatedUnion("success", [
  LLMSuccessResponseSchema,
  LLMErrorResponseSchema,
]);

// 使用例（TypeScriptの型推論が効く）
function handleResponse(response: LLMChatResponse) {
  if (response.success) {
    // ここでは response.data にアクセス可能
    console.log(response.data.content);
  } else {
    // ここでは response.error にアクセス可能
    console.error(response.error.message);
  }
}
```

### エラーコード（error.ts）

```typescript
// 10種類のエラーコードを定義
export const LLMErrorCodeSchema = z.enum([
  "API_KEY_MISSING", // APIキー未設定
  "API_KEY_INVALID", // APIキー無効
  "NETWORK_ERROR", // ネットワークエラー
  "TIMEOUT", // タイムアウト
  "RATE_LIMIT", // レート制限
  "CONTEXT_LENGTH_EXCEEDED", // コンテキスト長超過
  "CONTENT_FILTER", // コンテンツフィルター
  "MODEL_NOT_FOUND", // モデル未発見
  "SERVICE_UNAVAILABLE", // サービス利用不可
  "UNKNOWN", // 不明なエラー
]);

// エラー情報の構造
export const LLMErrorSchema = z.object({
  code: LLMErrorCodeSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  retryable: z.boolean(), // リトライ可能か
  retryAfterMs: z.number().optional(), // リトライまでの待機時間
});
```

---

## 状態管理（llmSlice）

### Zustandスライス構造

```typescript
// llmSlice: LLM関連の状態を管理するスライス
// 読み方: エルエルエム・スライス

interface LLMSlice {
  // === State（状態） ===
  providers: LLMProvider[]; // プロバイダー一覧
  selectedProviderId: LLMProviderId | null; // 選択中のプロバイダー
  selectedModelId: string | null; // 選択中のモデル
  isLoading: boolean; // ローディング中か
  error: LLMError | null; // エラー情報
  healthStatus: Record<LLMProviderId, HealthCheckResult | undefined>;

  // === Actions（アクション） ===
  fetchProviders: () => Promise<void>; // プロバイダー一覧を取得
  selectProvider: (providerId: LLMProviderId) => void; // プロバイダーを選択
  selectModel: (modelId: string) => void; // モデルを選択
  checkHealth: (providerId: LLMProviderId) => Promise<void>; // ヘルスチェック
  resetSelection: () => void; // 選択をリセット
  clearError: () => void; // エラーをクリア

  // === Selectors（セレクター） ===
  getSelectedProvider: () => LLMProvider | undefined;
  getSelectedModel: () => LLMModel | undefined;
  isProviderAvailable: (providerId: LLMProviderId) => boolean;
}
```

### 使用例

```typescript
import { useStore } from "@/renderer/store";

function LLMSelector() {
  // 状態とアクションを取得
  const {
    providers,
    selectedProviderId,
    selectedModelId,
    fetchProviders,
    selectProvider,
    selectModel,
    getSelectedProvider,
  } = useStore((state) => state);

  // 初回マウント時にプロバイダー一覧を取得
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // 選択中のプロバイダー情報を取得
  const selectedProvider = getSelectedProvider();

  return (
    <div>
      {/* プロバイダー選択 */}
      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => selectProvider(provider.id)}
          disabled={!provider.isAvailable}
        >
          {provider.name}
        </button>
      ))}

      {/* モデル選択（プロバイダー選択後に表示） */}
      {selectedProvider?.models.map((model) => (
        <button
          key={model.id}
          onClick={() => selectModel(model.id)}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
}
```

---

## IPC通信

### チャンネル定義

```typescript
// preload/channels.ts
export const IPC_CHANNELS = {
  // ... 既存のチャンネル ...

  // LLM operations
  LLM_GET_PROVIDERS: "llm:get-providers",
  LLM_CHECK_HEALTH: "llm:check-health",
};
```

### Preload API

```typescript
// preload/index.ts
const electronAPI: ElectronAPI = {
  // ... 既存のAPI ...

  llm: {
    getProviders: () => safeInvoke(IPC_CHANNELS.LLM_GET_PROVIDERS),
    checkHealth: (providerId: LLMProviderId) =>
      safeInvoke(IPC_CHANNELS.LLM_CHECK_HEALTH, providerId),
  },
};
```

---

## バリデーション関数

### 安全なパース関数

```typescript
// validators.ts
// 読み方: セーフ・パース

// safeParse: 検証失敗時にエラーをスローしない
export function safeParseChatRequest(
  data: unknown,
):
  | { success: true; data: LLMChatRequest }
  | { success: false; error: z.ZodError } {
  return LLMChatRequestSchema.safeParse(data);
}

// validate: 検証失敗時にエラーをスローする
export function validateChatRequest(data: unknown): LLMChatRequest {
  return LLMChatRequestSchema.parse(data);
}

// 使用例
const result = safeParseChatRequest(userInput);
if (result.success) {
  // 型安全に使用可能
  sendRequest(result.data);
} else {
  // エラーハンドリング
  console.error(result.error.issues);
}
```

---

## テスト構成

### テストファイル一覧

| ファイル                      | テスト数 | 内容                     |
| ----------------------------- | -------- | ------------------------ |
| provider.test.ts              | 37       | プロバイダー型テスト     |
| message.test.ts               | 30       | メッセージ型テスト       |
| request.test.ts               | 30       | リクエスト型テスト       |
| response.test.ts              | 32       | レスポンス型テスト       |
| error.test.ts                 | 36       | エラー型テスト           |
| health.test.ts                | 26       | ヘルスチェック型テスト   |
| ipc.test.ts                   | 15       | IPC型テスト              |
| validators.test.ts            | 23       | バリデーターテスト       |
| validators.edge-cases.test.ts | 45       | エッジケーステスト       |
| edge-cases.test.ts            | 61       | 境界値・特殊ケーステスト |
| llmSlice.test.ts              | 35       | 状態管理テスト           |
| llmSlice.edge-cases.test.ts   | 20       | 状態管理エッジケース     |

### テスト実行コマンド

```bash
# スキーマテスト
pnpm --filter @repo/shared test:run -- --reporter=verbose src/types/llm

# llmSliceテスト
pnpm --filter @repo/desktop test:run -- --reporter=verbose llmSlice

# カバレッジ確認
pnpm --filter @repo/shared test:coverage -- src/types/llm
```

---

## 次フェーズの実装事項

### 高優先度

| 項目             | 説明                      | 関連ファイル               |
| ---------------- | ------------------------- | -------------------------- |
| UIコンポーネント | プロバイダー/モデル選択UI | components/LLMSelector.tsx |
| IPCハンドラー    | mainプロセスでのIPC処理   | main/handlers/llm.ts       |
| LLMアダプター    | 各プロバイダーAPI実装     | adapters/llm/\*.ts         |

### 実装順序

```
1. IPCハンドラー実装
   └─► Main Process で IPC チャンネルを受信

2. LLMアダプター実装
   ├─► OpenAIAdapter
   ├─► AnthropicAdapter
   ├─► GoogleAdapter
   └─► xAIAdapter

3. UIコンポーネント実装
   ├─► ProviderSelector（プロバイダー選択）
   ├─► ModelSelector（モデル選択）
   └─► HealthIndicator（接続状態表示）

4. E2Eテスト
   └─► Playwright による統合テスト
```

---

## 変更履歴

| 日付       | バージョン | 変更内容                     |
| ---------- | ---------- | ---------------------------- |
| 2026-01-08 | 1.0.0      | 初版作成（Phase 12完了時点） |
