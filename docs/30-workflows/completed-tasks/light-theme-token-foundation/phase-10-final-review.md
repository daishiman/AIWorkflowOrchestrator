# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 10                                        |
| Phase名    | 最終レビュー                              |
| ステータス | completed                                 |
| 前提Phase  | Phase 9                                   |
| 後続Phase  | Phase 11                                  |

## 目的

token 基盤タスクを完了判定できるか最終レビューする。

## 実行タスク

- タスク1: AC-1〜AC-5 の達成度を確認する
- タスク2: 後続タスクへの引き継ぎ事項を確認する
- タスク3: 未解決事項の backlog 化を判断する

## 参照資料

| 参照資料             | パス                                                                                                     | 説明                |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/`                        | 受入基準の原本      |
| Phase 2 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/`                        | token 契約          |
| Phase 5 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/`                        | 実装差分            |
| Quality report       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-9/quality-report.md`       | 最終判定の根拠      |
| Design review result | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-3/design-review-result.md` | 上流ゲート結果      |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                     | 完了/未タスク整理先 |

## 統合テスト連携

| 観点           | 連携内容                                                                         |
| -------------- | -------------------------------------------------------------------------------- |
| Release gate   | Phase 11 で確認すべき representative screen を確定する                           |
| Backlog bridge | token task だけで閉じない課題は shared migration / regression guard へ振り分ける |
| Evidence       | `final-review-result.md` に AC 判定と残課題移送先を記録する                      |

## 成果物

| 成果物              | パス                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| final-review-result | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-10/final-review-result.md` |

## 完了条件

- [x] AC-1〜AC-5 のレビュー結果が記録されている
- [x] 後続タスクへの引き継ぎが明記されている

## 次Phase

Phase 11: 手動テスト
