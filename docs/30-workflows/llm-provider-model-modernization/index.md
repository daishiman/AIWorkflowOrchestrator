# LLM Provider & Model Modernization 仕様書パック

## 概要

本パックは、LLMアダプターアーキテクチャの構造改善とモデル定義最新化を統合的に実施するワークフローである。

30種の思考法による多角的分析の結果、単なるモデル定義更新にとどまらず、以下の3つの構造的改善を同時実現する「トレードオン」アプローチを採用する：

1. **OpenAICompatibleAdapter** による OpenAI互換プロバイダーの統一（コード削減 + 拡張性向上）
2. **OpenRouter** プロバイダー統合（マルチプロバイダーアクセスの一元化）
3. **isAvailable フィルタリング** による安全なモデル選択UI（P62準拠）

## 目的

- `PROVIDER_CONFIGS` のモデル定義を最新プロバイダーAPIに準拠させる
- OpenAI互換プロバイダー（OpenAI/xAI/OpenRouter）を設定駆動で統一する
- OpenRouter をフルスタック統合する（型→アダプター→ファクトリ→ハンドラ→ストレージ→UI）
- APIキー未設定プロバイダーのモデルをチャットUIから非表示にする
- テスト・型定義の整合性を維持する

## 調査結果サマリ（2026-03-23 時点）

### 現状と最新の対比

| プロバイダー   | 現在の定義（レガシー）                                                            | 最新で使うべきモデル                                                                                                 |
| -------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **OpenAI**     | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`                                            | `gpt-5.4`(flagship, 1.05M ctx), `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini`                       |
| **Anthropic**  | `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307` | `claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5`（変更なし）                                               |
| **Google**     | `gemini-1.5-pro`, `gemini-1.5-flash`                                              | `gemini-3-flash-preview`(1M ctx), `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`                          |
| **xAI**        | `grok-beta`                                                                       | `grok-3-mini`(速度重視), `grok-4-1-fast-non-reasoning`(default,バランス), `grok-4-1-fast-reasoning`(精度重視,2M ctx) |
| **OpenRouter** | 未対応                                                                            | 300+ モデル、OpenAI互換API（動的モデルリスト取得）                                                                   |

> **注記**: Gemini 2.5 は 2026年6月17日に廃止予定。GPT-4.1 系は ChatGPT から退役済み（API では引き続き利用可能）。

### API構成の変更点

| プロバイダー   | 現状の問題                                                | 修正内容                                                                                            |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **OpenAI**     | `inferProviderId` が `gpt-5` プレフィックスに未対応       | `gpt-5` プレフィックスパターン追加検討。`reasoning.effort` (none/low/medium/high/xhigh)対応も要検討 |
| **Anthropic**  | ヘルスチェックが `claude-3-haiku-20240307` を使用         | `claude-haiku-4-5` に更新                                                                           |
| **Google**     | `system_instruction` 未使用（userロールワークアラウンド） | `system_instruction` フィールド対応、Gemini 3 新機能（thinking_level, Thought Signatures）検討      |
| **xAI**        | OpenAIと99%同一コードが別ファイルに重複                   | `OpenAICompatibleAdapter` で統合（実装済み）                                                        |
| **OpenRouter** | 全レイヤーで未対応                                        | 型→アダプター→ファクトリ→ハンドラ→ストレージ→UI 全統合（実装済み）                                  |
| **UI**         | APIキー未設定プロバイダーのモデルが選択可能               | `isAvailable` フィルタリング追加（実装済み）                                                        |

## 新アーキテクチャ（実装済み）

```
Renderer (llmSlice.ts)
  |  fetchProviders() -> IPC -> handleGetProviders()
  |  providers.filter(p => p.isAvailable) <- APIキー未設定は非表示
  v
Preload (channels.ts / index.ts)
  |  LLM_GET_PROVIDERS / LLM_SEND_CHAT / LLM_STREAM_CHAT
  v
Main Process (handlers/llm.ts)
  |  PROVIDER_CONFIGS（5プロバイダー） -> LLMProvider[] を返す
  |  inferProviderId() -> o3/o4 + "/" パターン対応
  |  isValidProviderId() -> LLMProviderIdSchema.safeParse (Single Source of Truth)
  v
Adapter Layer (adapters/llm/)
  |  LLMAdapterFactory -> OPENAI_COMPATIBLE_CONFIGS (設定駆動)
  |
  |  [OpenAI互換グループ: 設定のみで差し替え可能]
  |  +-- OpenAICompatibleAdapter (providerId="openai",  baseUrl="api.openai.com/v1")
  |  +-- OpenAICompatibleAdapter (providerId="xai",     baseUrl="api.x.ai/v1")
  |  +-- OpenAICompatibleAdapter (providerId="openrouter", baseUrl="openrouter.ai/api/v1")
  |
  |  [独自API形式: 個別アダプター]
  +-- AnthropicAdapter  (Anthropic Messages API)
  +-- GoogleAdapter     (Gemini generateContent API)
```

### 関連ファイル一覧

| ファイル                                                                            | 責務                                    | 修正状態     |
| ----------------------------------------------------------------------------------- | --------------------------------------- | ------------ |
| `packages/shared/src/types/llm/schemas/provider.ts`                                 | LLMProviderIdSchema ("openrouter" 追加) | **実装済み** |
| `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts`                     | OpenAI互換統一アダプター                | **実装済み** |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                           | 設定駆動ファクトリ                      | **実装済み** |
| `apps/desktop/src/main/handlers/llm.ts`                                             | PROVIDER_CONFIGS + inferProviderId      | **実装済み** |
| `apps/desktop/src/main/services/secureStorage.ts`                                   | ALL_PROVIDERS                           | **実装済み** |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                  | isAvailable フィルタリング              | **実装済み** |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | LLMProviderId 型統一                    | **実装済み** |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | LLMProviderId 型統一                    | **実装済み** |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                            | ヘルスチェックモデル更新                | **未着手**   |
| `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`                               | system_instruction 対応                 | **未着手**   |
| `apps/desktop/src/main/adapters/llm/__tests__/*.test.ts`                            | テスト更新                              | **未着手**   |

## Lane 分離

| lane         | 主担当 task    | 意味                                                             |
| ------------ | -------------- | ---------------------------------------------------------------- |
| Data lane    | Task01         | PROVIDER_CONFIGS のモデル定義更新 + inferProviderId パターン修正 |
| Adapter lane | Task02, Task03 | 各Adapterの API 通信設定を現行ドキュメントに合わせる             |
| Test lane    | Task04         | テストの期待値を新モデル定義に合わせて更新                       |
| Schema lane  | Task05         | 共有型スキーマの拡張検討（description フィールド等）             |
| Arch lane    | Task06         | OpenAICompatibleAdapter 統一アーキテクチャ                       |
| Integration  | Task07         | OpenRouter フルスタック統合                                      |
| UX lane      | Task08         | UI isAvailable フィルタリング                                    |

## 実行順序と並列可能性

```
Phase 1: 設計（直列）
  Phase 1-1: 要件定義
  Phase 1-2: 設計
  Phase 1-3: 設計レビュー
  -- ゲート: PASS/MINOR -> 続行 / MAJOR -> 戻る --

Phase 2: 実装（依存関係に基づく直列 + 並列）
  step-01-seq: Task01 -- PROVIDER_CONFIGS + inferProviderId 更新（先行必須）
       | 依存
  step-02-par: Task02 -- AnthropicAdapter ヘルスチェックモデル更新 --+
  step-02-par: Task03 -- GoogleAdapter system_instruction 対応     --+ 並列可能
       | 全完了待ち                                                   +
  step-03-seq: Task04 -- テスト期待値更新（全Adapter変更後）
       |
  step-04-seq: Task05 -- 共有型スキーマ拡張検討（オプション）
       |
  step-05-seq: Task06 -- OpenAICompatibleAdapter 統一アーキテクチャ [実装済み]
       | 依存
  step-06-par: Task07 -- OpenRouter フルスタック統合 [実装済み] --+
  step-06-par: Task08 -- UI isAvailable フィルタリング [実装済み] --+ 並列可能
```

## リスク境界

- モデルIDの変更は `inferProviderId` のパターンマッチに直結するため、Data lane を先行必須とする
- GoogleAdapter の `system_instruction` 対応は既存の `formatContents` ワークアラウンドからの移行であり、互換性を壊す可能性がある
- テスト修正はデータ変更とAdapter変更の両方に依存するため、最後段に配置する
- `LLMModelSchema` に `description` を追加する場合、`LLMModel` 型を使用する全箇所に影響する
- OpenAICompatibleAdapter 導入後、既存の OpenAIAdapter.ts / xAIAdapter.ts のテストが直接インポートしているため、テストの移行が必要

## タスク一覧

| Task | タスクID        | 名称                                       | ステップ    | ステータス |
| ---- | --------------- | ------------------------------------------ | ----------- | ---------- |
| 01   | TASK-LLM-MOD-01 | PROVIDER_CONFIGS + inferProviderId 更新    | step-01-seq | 未着手     |
| 02   | TASK-LLM-MOD-02 | AnthropicAdapter ヘルスチェックモデル更新  | step-02-par | 未着手     |
| 03   | TASK-LLM-MOD-03 | GoogleAdapter system_instruction 対応      | step-02-par | 未着手     |
| 04   | TASK-LLM-MOD-04 | テスト期待値更新                           | step-03-seq | 未着手     |
| 05   | TASK-LLM-MOD-05 | 共有型スキーマ拡張検討                     | step-04-seq | 未着手     |
| 06   | TASK-LLM-MOD-06 | OpenAICompatibleAdapter 統一アーキテクチャ | step-05-seq | 実装済み   |
| 07   | TASK-LLM-MOD-07 | OpenRouter フルスタック統合                | step-06-par | 実装済み   |
| 08   | TASK-LLM-MOD-08 | UI isAvailable フィルタリング              | step-06-par | 実装済み   |

## 各プロバイダー詳細調査

| ファイル                        | 内容                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `research/openai-models.md`     | OpenAI 最新モデル・API仕様                           |
| `research/anthropic-models.md`  | Anthropic 最新モデル・API仕様                        |
| `research/google-models.md`     | Google Gemini 最新モデル・API仕様（Gemini 3対応）    |
| `research/xai-models.md`        | xAI 最新モデル・API仕様（Grok 4系対応）              |
| `research/openrouter-models.md` | OpenRouter 統合ガイド（300+ モデル、動的リスト取得） |
