# Task06: OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目         | 値                                        |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-LLM-MOD-06                           |
| 責務         | Adapter lane                              |
| 実行順序     | step-05-seq（step-01 完了後）             |
| 依存先       | TASK-LLM-MOD-01（PROVIDER_CONFIGS 更新）  |
| ブロック対象 | なし                                      |
| ステータス   | 実装済み（2026-03-23 本セッションで完了） |

## 目的

OpenAI / xAI / OpenRouter の 3 プロバイダーが使用する OpenAI Chat Completions API 互換エンドポイントを、設定駆動の統一アダプター `OpenAICompatibleAdapter` で置き換える。個別アダプタークラス（xAIAdapter 等）の重複コードを排除し、新しい OpenAI 互換プロバイダーを設定 5 行の追加だけで対応可能にする。

## 対象ファイル

| ファイル                                                        | 変更内容                                              |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | 新規: 統一アダプタークラス（243行）                   |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | 設定駆動化（OPENAI_COMPATIBLE_CONFIGS マップ導入）    |
| `apps/desktop/src/main/adapters/llm/index.ts`                   | エクスポート更新（OpenAICompatibleAdapter 追加）      |
| `apps/desktop/src/main/adapters/llm/types.ts`                   | OpenAICompatibleProviderConfig 型（アダプター内定義） |

## 実行タスク

### Task 6-1: OpenAICompatibleAdapter の新規作成

`BaseLLMAdapter` を継承し、OpenAI Chat Completions API 互換の `sendChat` / `streamChat` / `checkHealth` を実装する。コンストラクタで `OpenAICompatibleProviderConfig`（providerId, defaultBaseUrl, extraHeaders）を受け取り、プロバイダー固有の設定を外部から注入する。

### Task 6-2: LLMAdapterFactory の設定駆動化

`OPENAI_COMPATIBLE_CONFIGS` マップに OpenAI / xAI / OpenRouter の設定を定義し、コンストラクタ内でループ登録する。`xAIAdapter` の直接登録を `OpenAICompatibleAdapter` 経由の登録に置換する。

### Task 6-3: index.ts のエクスポート更新

`OpenAICompatibleAdapter` クラスと `OpenAICompatibleProviderConfig` 型をエクスポートに追加する。

## 参照資料

- `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`（基底クラス）
- `apps/desktop/src/main/adapters/llm/types.ts`（ILLMAdapter インターフェース）
- `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`（置換元の参考実装）
- `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`（置換元の参考実装）

## 完了条件

- [x] `OpenAICompatibleAdapter` が `sendChat` / `streamChat` / `checkHealth` を正しく実装している
- [x] `LLMAdapterFactory` が OpenAI / xAI / OpenRouter を設定駆動で生成する
- [x] TypeScript コンパイルエラーが 0 件
- [x] 既存の OpenAI / xAI テストが引き続き PASS する
