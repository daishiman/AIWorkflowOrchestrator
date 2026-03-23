# Phase 1: 要件定義 -- OpenRouter プロバイダー統合

## メタ情報

| 項目      | 値                                   |
| --------- | ------------------------------------ |
| Phase番号 | 1                                    |
| 機能名    | openrouter-integration               |
| タスクID  | TASK-LLM-MOD-07                      |
| 作成日    | 2026-03-23                           |
| 依存Phase | なし（TASK-LLM-MOD-06 完了後に着手） |

## 目的

OpenRouter を新規 LLM プロバイダーとして全レイヤー（型定義、アダプター、ファクトリ、ハンドラ、セキュアストレージ、UI型）に統合するための要件を定義する。

## 実行タスク

### Task 1-1: OpenRouter サービス特性の整理

OpenRouter の技術的特性を整理する:

1. **API互換性**: OpenAI Chat Completions API 互換（`/v1/chat/completions` エンドポイント）
2. **ベースURL**: `https://openrouter.ai/api/v1`
3. **認証方式**: Bearer Token（`Authorization: Bearer <API_KEY>`）
4. **追加ヘッダー**: `HTTP-Referer`（リファラー）、`X-Title`（アプリ名）が推奨
5. **モデルID形式**: `provider/model`（例: `openai/gpt-4o`, `anthropic/claude-3.5-sonnet`）
6. **特徴**: 1つのAPIキーで複数プロバイダーのモデルにアクセス可能

### Task 1-2: 統合対象レイヤーの特定

以下の 6 レイヤーで変更が必要:

| レイヤー             | ファイル                                                                            | 変更種別       |
| -------------------- | ----------------------------------------------------------------------------------- | -------------- |
| 型定義               | `packages/shared/src/types/llm/schemas/provider.ts`                                 | enum 値追加    |
| ハンドラ             | `apps/desktop/src/main/handlers/llm.ts`                                             | 設定・推論追加 |
| セキュアストレージ   | `apps/desktop/src/main/services/secureStorage.ts`                                   | 配列要素追加   |
| アダプターファクトリ | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                           | 設定追加       |
| IPC ハンドラ         | `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | 型統一         |
| Renderer Hook        | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | 型統一         |

### Task 1-3: 受入基準の定義

| 基準ID | 受入基準                                                                         | 検証方法                             |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------ |
| AC-01  | `LLMProviderIdSchema.parse("openrouter")` が成功する                             | 単体テスト（スキーマバリデーション） |
| AC-02  | `handleGetProviders()` が OpenRouter プロバイダーを返す                          | 統合テスト（ハンドラ呼び出し）       |
| AC-03  | `inferProviderId("openai/gpt-4o")` が `"openrouter"` を返す                      | 単体テスト（推論ロジック）           |
| AC-04  | `isValidProviderId("openrouter")` が `true` を返す                               | 単体テスト（バリデーション）         |
| AC-05  | `LLMAdapterFactory.getAdapter("openrouter")` が `OpenAICompatibleAdapter` を返す | 統合テスト（ファクトリ生成）         |
| AC-06  | TypeScript コンパイルエラー 0 件                                                 | `pnpm typecheck`                     |

### Task 1-4: 提供モデルの決定

OpenRouter 経由で提供する初期モデルセット:

| モデルID                             | 表示名                             | コンテキストウィンドウ | デフォルト |
| ------------------------------------ | ---------------------------------- | ---------------------- | ---------- |
| `openai/gpt-4o`                      | GPT-4o (via OpenRouter)            | 128,000                | true       |
| `anthropic/claude-3.5-sonnet`        | Claude 3.5 Sonnet (via OpenRouter) | 200,000                | false      |
| `google/gemini-pro-1.5`              | Gemini 1.5 Pro (via OpenRouter)    | 2,097,152              | false      |
| `meta-llama/llama-3.1-405b-instruct` | Llama 3.1 405B (via OpenRouter)    | 131,072                | false      |

### Task 1-5: 二重管理解消の要件

`isValidProviderId` 関数が `LLMProviderIdSchema` とは別にハードコードされたリテラル配列でバリデーションしている問題を解消する。`LLMProviderIdSchema.safeParse` に統一し、プロバイダー追加時の変更箇所を最小化する。

## 参照資料

| 資料                                                      | 用途                             |
| --------------------------------------------------------- | -------------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts`       | LLMProviderIdSchema 定義の確認   |
| `apps/desktop/src/main/handlers/llm.ts`                   | PROVIDER_CONFIGS・推論ロジック   |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | OpenAICompatibleAdapter 設定確認 |
| `apps/desktop/src/main/services/secureStorage.ts`         | ALL_PROVIDERS 配列の確認         |
| TASK-LLM-MOD-06 仕様書                                    | OpenAICompatibleAdapter 依存確認 |

## 成果物

| 成果物             | パス       | 備考 |
| ------------------ | ---------- | ---- |
| Phase 1 要件定義書 | 本ファイル | -    |

## 統合テスト連携

Phase 4 テスト設計に以下を引き継ぐ:

- AC-01 〜 AC-06 の各受入基準に対応するテストケースの設計
- `inferProviderId` の `/` 含みモデルIDパターンのエッジケーステスト
- 既存プロバイダーへの回帰テスト

## 完了条件

- [ ] OpenRouter のサービス特性（API互換性、ベースURL、追加ヘッダー、モデルID形式）を文書化した
- [ ] 統合対象の 6 レイヤー・6 ファイルを特定した
- [ ] 受入基準 AC-01 〜 AC-06 を定義した
- [ ] 初期提供モデルセット（4モデル）を決定した
- [ ] `isValidProviderId` の二重管理解消要件を定義した

## 次のPhase

[Phase 2: 設計](./phase-2-design.md)
