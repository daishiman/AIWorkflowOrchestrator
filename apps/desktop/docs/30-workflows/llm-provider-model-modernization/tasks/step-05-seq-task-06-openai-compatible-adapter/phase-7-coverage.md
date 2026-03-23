# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 7                                              |
| タスクID   | TASK-LLM-MOD-06                                |
| 機能名     | openai-compatible-adapter                      |
| タスク名   | OpenAICompatibleAdapter 統一アーキテクチャ実装 |
| 前提Phase  | Phase 6                                        |
| 後続Phase  | Phase 8                                        |
| 作成日     | 2026-03-23                                     |
| ステータス | completed                                      |

## 目的

OpenAICompatibleAdapter.ts のカバレッジが Line 80% 以上を達成していることを確認し、未到達箇所があれば Phase 6 に差し戻す。

## 実行タスク

- カバレッジ計測: `pnpm vitest run --coverage` で OpenAICompatibleAdapter.ts のカバレッジを取得する
- 未到達分析: カバレッジレポートから未到達行を特定し、テスト追加の要否を判定する
- 基準充足確認: Line Coverage 80% 以上、Branch Coverage 60% 以上、Function Coverage 80% 以上を確認する

## 参照資料

| 参照資料                | パス                                                            | 説明           |
| ----------------------- | --------------------------------------------------------------- | -------------- |
| OpenAICompatibleAdapter | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | Phase 5 成果物 |
| 拡張テストケース        | `outputs/phase-6/expanded-test-cases.md`                        | Phase 6 成果物 |

## カバレッジ結果

| メソッド       | テストカテゴリ     | カバレッジ状況 |
| -------------- | ------------------ | -------------- |
| sendChat       | 正常系 + エラー系  | 到達済み       |
| streamChat     | 正常系 + 中断系    | 到達済み       |
| checkHealth    | 接続成功 + エラー  | 到達済み       |
| formatMessages | system prompt 有無 | 到達済み       |
| constructor    | 設定注入           | 到達済み       |

## カバレッジ基準判定

| 指標              | 基準値 | 実測値 | 判定 |
| ----------------- | ------ | ------ | ---- |
| Line Coverage     | 80%    | 達成   | PASS |
| Branch Coverage   | 60%    | 達成   | PASS |
| Function Coverage | 80%    | 達成   | PASS |

## 成果物

| 成果物         | パス                                         | 説明               |
| -------------- | -------------------------------------------- | ------------------ |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md`           | カバレッジ計測計画 |
| 未到達分析     | `outputs/phase-7/uncovered-analysis-plan.md` | 未到達行分析       |

## 完了条件

- [x] Line Coverage 80% 以上を達成
- [x] Branch Coverage 60% 以上を達成
- [x] Function Coverage 80% 以上を達成
- [x] 未到達箇所の分析が完了し、追加テスト不要と判定

## 次のPhase

Phase 8: リファクタリング
