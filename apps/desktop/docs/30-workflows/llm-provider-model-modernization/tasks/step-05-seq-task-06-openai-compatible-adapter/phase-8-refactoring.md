# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| タスクID   | TASK-LLM-MOD-06                                |
| 機能名     | openai-compatible-adapter                      |
| タスク名   | OpenAICompatibleAdapter 統一アーキテクチャ実装 |
| 前提Phase  | Phase 7                                        |
| 後続Phase  | Phase 9                                        |
| 作成日     | 2026-03-23                                     |
| ステータス | completed                                      |

## 目的

コード品質を改善し、DRY 原則の遵守と型安全性の強化を行う。

## 実行タスク

- ChatCompletionResponse / StreamChunkResponse 型の共通化: レスポンス型を OpenAICompatibleAdapter 内部型として定義し、再利用性を確保する
- formatMessages メソッドの再利用性確認: BaseLLMAdapter への抽出可否を検討する
- OPENAI_COMPATIBLE_CONFIGS の型安全性強化: `as const satisfies Record<string, OpenAICompatibleProviderConfig>` パターンで型推論を強化する
- マジックナンバーの定数化: HTTP ステータスコード、デフォルトタイムアウト値を定数に抽出する

## 参照資料

| 参照資料                | パス                                                            | 説明           |
| ----------------------- | --------------------------------------------------------------- | -------------- |
| OpenAICompatibleAdapter | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | Phase 5 成果物 |
| カバレッジ計画          | `outputs/phase-7/coverage-plan.md`                              | Phase 7 成果物 |

## リファクタリング項目

| ID   | 項目                             | 変更内容                                                                    | リスク |
| ---- | -------------------------------- | --------------------------------------------------------------------------- | ------ |
| R-01 | レスポンス型の共通化             | ChatCompletionResponse / StreamChunkResponse をモジュール内型として定義     | 低     |
| R-02 | formatMessages の配置検討        | BaseLLMAdapter への抽出は見送り（プロバイダー固有のフォーマットがあるため） | -      |
| R-03 | OPENAI_COMPATIBLE_CONFIGS 型強化 | `as const satisfies` パターンで型推論を強化                                 | 低     |
| R-04 | HTTP ステータスコードの定数化    | 401 / 429 / 500 を定数として抽出                                            | 低     |

## リファクタリング判定

| 判定項目                       | 結果                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| formatMessages の BaseLLM 抽出 | 見送り: OpenAI 互換以外のプロバイダー（Anthropic / Google）は異なるフォーマットを使用するため、基底クラスへの抽出は不適切 |
| xAIAdapter との重複            | 解消済み: xAI は OPENAI_COMPATIBLE_CONFIGS で統一管理                                                                     |

## 成果物

| 成果物         | パス                                         | 説明                   |
| -------------- | -------------------------------------------- | ---------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`        | リファクタリング計画   |
| 再テスト結果   | `outputs/phase-8/post-refactor-test-plan.md` | リファクタ後テスト結果 |

## 完了条件

- [x] ChatCompletionResponse / StreamChunkResponse 型が共通化済み
- [x] formatMessages の配置判定が完了（BaseLLMAdapter 抽出は見送り）
- [x] OPENAI_COMPATIBLE_CONFIGS の型安全性が強化済み
- [x] リファクタリング後の全テストが PASS
- [x] カバレッジが Phase 7 基準を維持

## 次のPhase

Phase 9: 品質保証
