# Phase 5: 実装（TDD: Green）-- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 5                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 4（テスト作成）     |

## 目的

Phase 4 で作成したテスト（T-01 から T-06）を全て通す実装を行う（TDD: Green フェーズ）。`OpenAICompatibleAdapter.ts` を新規作成し、`LLMAdapterFactory.ts` と `index.ts` を更新する。

## 実行タスク

### Task 5-1: OpenAICompatibleAdapter.ts の新規作成

`apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` を新規作成する（243行）。

#### ファイル構成

```
L1-8:     ファイルヘッダー（JSDoc）
L9-15:    import 文
L17-32:   OpenAICompatibleProviderConfig インターフェース
L34-55:   ChatCompletionResponse 型（private）
L57-73:   StreamChunkResponse 型（private）
L75-96:   OpenAICompatibleAdapter クラス宣言 + コンストラクタ
L98-138:  sendChat メソッド
L140-190: streamChat メソッド
L192-226: checkHealth メソッド
L228-250: formatMessages メソッド（private）
```

#### 主要な実装ポイント

1. **コンストラクタ**: `providerConfig` から `providerId`, `baseUrl`, `extraHeaders` を初期化
2. **sendChat**: `fetchWithRetry` で POST /chat/completions、レスポンスを `AdapterChatResponse` に変換
3. **streamChat**: `fetchSSE` で SSE ストリーム取得、各チャンクを `StreamChunk` に変換して yield
4. **checkHealth**: `fetchWithRetry` で GET /models（リトライなし）、成功/失敗の `HealthCheckResult` を返す
5. **formatMessages**: `systemPrompt` + `messages` を `{ role, content }[]` に変換

### Task 5-2: LLMAdapterFactory.ts の更新

`apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` を以下のように更新する:

#### 変更 1: import 追加

```typescript
import {
  OpenAICompatibleAdapter,
  type OpenAICompatibleProviderConfig,
} from "./OpenAICompatibleAdapter";
```

#### 変更 2: OPENAI_COMPATIBLE_CONFIGS マップ追加

```typescript
const OPENAI_COMPATIBLE_CONFIGS: Record<
  string,
  OpenAICompatibleProviderConfig
> = {
  openai: {
    providerId: "openai",
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  xai: {
    providerId: "xai",
    defaultBaseUrl: "https://api.x.ai/v1",
  },
  openrouter: {
    providerId: "openrouter",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    extraHeaders: {
      "HTTP-Referer": "https://aiworkflow.app",
      "X-Title": "AIWorkflowOrchestrator",
    },
  },
};
```

#### 変更 3: コンストラクタの設定駆動化

```typescript
constructor() {
  // OpenAI互換プロバイダーを設定駆動で一括登録
  for (const [id, providerConfig] of Object.entries(OPENAI_COMPATIBLE_CONFIGS)) {
    this.register(
      id as LLMProviderId,
      (apiKey, config) => new OpenAICompatibleAdapter(providerConfig, apiKey, config),
    );
  }

  // 独自API形式のプロバイダーは個別アダプターで登録
  this.register("anthropic", (apiKey, config) => new AnthropicAdapter(apiKey, config));
  this.register("google", (apiKey, config) => new GoogleAdapter(apiKey, config));
}
```

#### 変更 4: xAIAdapter の import 削除

`import { xAIAdapter } from "./xAIAdapter"` の import と個別登録を削除する。

### Task 5-3: index.ts の更新

`apps/desktop/src/main/adapters/llm/index.ts` のエクスポートを更新する:

```typescript
// Provider adapters
export { OpenAICompatibleAdapter } from "./OpenAICompatibleAdapter";
export type { OpenAICompatibleProviderConfig } from "./OpenAICompatibleAdapter";
export { AnthropicAdapter } from "./AnthropicAdapter";
export { GoogleAdapter } from "./GoogleAdapter";
```

### Task 5-4: Green フェーズの確認

実装後に以下を実行し、Phase 4 で追加したテストが全て通ることを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts
```

期待する結果: T-01 から T-06 の全テストが PASS

### Task 5-5: TypeScript コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
```

期待する結果: エラー 0 件

### Task 5-6: 既存テスト影響確認

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

期待する結果: 既存テストを含む全テストが PASS

## 参照資料

| 資料名           | パス                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計     | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-2-design.md`        |
| Phase 4 テスト   | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-4-test-creation.md` |
| BaseLLMAdapter   | `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`                                                                            |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                                                                |

## 成果物

| 成果物               | パス                                                            | 形式       |
| -------------------- | --------------------------------------------------------------- | ---------- |
| 新規アダプター       | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | TypeScript |
| 更新済みファクトリ   | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | TypeScript |
| 更新済みエクスポート | `apps/desktop/src/main/adapters/llm/index.ts`                   | TypeScript |

## 完了条件

- [x] `OpenAICompatibleAdapter.ts` を新規作成した（243行）
- [x] `OpenAICompatibleProviderConfig` インターフェースを定義した
- [x] `sendChat` が fetchWithRetry で POST /chat/completions を呼び出す
- [x] `streamChat` が fetchSSE で SSE ストリームを処理する
- [x] `checkHealth` が GET /models でヘルスチェックを行う（リトライなし）
- [x] `formatMessages` が systemPrompt + messages を変換する
- [x] `LLMAdapterFactory` に `OPENAI_COMPATIBLE_CONFIGS` マップを追加した
- [x] `LLMAdapterFactory` のコンストラクタを設定駆動に変更した
- [x] `index.ts` のエクスポートを更新した
- [x] Phase 4 の全テスト（T-01 から T-06）が PASS した
- [x] `pnpm typecheck` がエラー 0 件で完了した
- [x] 既存テストが引き続き PASS している

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
