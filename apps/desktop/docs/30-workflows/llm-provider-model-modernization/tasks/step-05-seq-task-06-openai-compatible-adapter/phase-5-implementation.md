# Phase 5: 実装

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| タスクID   | TASK-LLM-MOD-06                                |
| 機能名     | openai-compatible-adapter                      |
| タスク名   | OpenAICompatibleAdapter 統一アーキテクチャ実装 |
| 前提Phase  | Phase 4                                        |
| 後続Phase  | Phase 6                                        |
| 作成日     | 2026-03-23                                     |
| ステータス | completed                                      |

## 目的

OpenAICompatibleAdapter.ts を新規作成し、LLMAdapterFactory を設定駆動化することで、OpenAI / xAI / OpenRouter を1つのアダプタークラスで統一する。

## 実行タスク

- OpenAICompatibleAdapter クラス実装: BaseLLMAdapter を継承し、sendChat / streamChat / checkHealth を実装する
- OpenAICompatibleProviderConfig インターフェース定義: baseUrl / defaultModel / extraHeaders / providerName を持つ設定型を定義する
- OPENAI_COMPATIBLE_CONFIGS マップ作成: openai / xai / openrouter の3プロバイダーを Record 形式で一括管理する
- LLMAdapterFactory 設定駆動化: OPENAI_COMPATIBLE_CONFIGS を走査してアダプターを動的生成するロジックに変更する
- index.ts エクスポート更新: OpenAICompatibleAdapter を公開エクスポートに追加する

## 参照資料

| 参照資料          | パス                                                      | 説明             |
| ----------------- | --------------------------------------------------------- | ---------------- |
| テスト仕様書      | `outputs/phase-4/test-specification.md`                   | Phase 4 成果物   |
| BaseLLMAdapter    | `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`    | 基底クラス       |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | ファクトリクラス |

## 実行手順

1. `OpenAICompatibleProviderConfig` インターフェースを定義する
2. `OPENAI_COMPATIBLE_CONFIGS` を `Record<string, OpenAICompatibleProviderConfig>` として定義する
3. `OpenAICompatibleAdapter` クラスを `BaseLLMAdapter` 継承で実装する
4. `sendChat`: OpenAI Chat Completions API 互換の POST リクエストを送信し、レスポンスをパースする
5. `streamChat`: SSE ストリーミングで `AsyncGenerator<string>` を返す
6. `checkHealth`: `/v1/models` エンドポイントで接続確認する
7. `formatMessages`: system prompt の有無に応じて messages 配列を構築する
8. `LLMAdapterFactory` を更新し、OPENAI_COMPATIBLE_CONFIGS からプロバイダーを設定駆動で生成する
9. `index.ts` のエクスポートを更新する

## 主要実装ファイル

| ファイル                     | 変更種別 | 行数  | 説明                           |
| ---------------------------- | -------- | ----- | ------------------------------ |
| `OpenAICompatibleAdapter.ts` | 新規     | 243行 | 統一アダプタークラス           |
| `LLMAdapterFactory.ts`       | 修正     | -     | 設定駆動化によるファクトリ更新 |
| `index.ts`                   | 修正     | -     | エクスポート追加               |

## 設定駆動アーキテクチャ

```typescript
interface OpenAICompatibleProviderConfig {
  providerName: string;
  baseUrl: string;
  defaultModel: string;
  extraHeaders?: Record<string, string>;
}

const OPENAI_COMPATIBLE_CONFIGS: Record<
  string,
  OpenAICompatibleProviderConfig
> = {
  openai: {
    providerName: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
  },
  xai: {
    providerName: "xAI",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-3",
  },
  openrouter: {
    providerName: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o",
    extraHeaders: { "HTTP-Referer": "https://aiworkflow.app" },
  },
};
```

## 成果物

| 成果物                    | パス                                                            | 説明                 |
| ------------------------- | --------------------------------------------------------------- | -------------------- |
| OpenAICompatibleAdapter   | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | 統一アダプタークラス |
| LLMAdapterFactory（更新） | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | 設定駆動化ファクトリ |
| index.ts（更新）          | `apps/desktop/src/main/adapters/llm/index.ts`                   | エクスポート更新     |

## 完了条件

- [x] OpenAICompatibleAdapter.ts が新規作成され、sendChat / streamChat / checkHealth が実装済み
- [x] OpenAICompatibleProviderConfig インターフェースが定義済み
- [x] OPENAI_COMPATIBLE_CONFIGS に openai / xai / openrouter の3設定が登録済み
- [x] LLMAdapterFactory が設定駆動でアダプターを生成可能
- [x] Phase 4 のテストが Green に移行

## 次のPhase

Phase 6: テスト拡充
