# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 7                                |
| 後続Phase  | Phase 9                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

仕様書と comment 表現の冗長さを減らし、RALLY-002 の責務を downstream が読み違えない形へ整える。

## 実行タスク

1. Before / After / 理由 を表にまとめる
2. comment と仕様表現の重複を削る
3. RALLY-010 以降へ必要な contract だけを残す

## 実行手順

- `restoredPendingRequest` 優先ルール
- snapshot 到着後の切替条件
- verify_existing / NON_VISUAL / approval-blocked の固定

## 統合テスト連携

- Phase 7 で未到達だった経路をリファクタ対象に混ぜない
- 動作変更ではなく表現整理に留める

## 多角的チェック観点（AIが判断）

- 抽象化思考: 読みやすさを上げつつ意味を落としていないか
- 価値提案思考: downstream が再読コストを下げられるか

## サブタスク管理

| 項目    | 内容                            |
| ------- | ------------------------------- |
| wording | コメント・仕様文の簡潔化        |
| handoff | downstream が読む最小契約の保持 |

## 参照資料

| 資料名         | パス                   | 用途     |
| -------------- | ---------------------- | -------- |
| Phase 7 成果物 | `outputs/phase-7/*.md` | 前提確認 |

## 成果物

- `outputs/phase-8/refactoring-log.md`
- `outputs/phase-8/change-rationale-table.md`

## 完了条件

- [ ] Before / After / 理由を整理した
- [ ] 不要な重複を除去した
- [ ] downstream 契約を損なっていない

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 9: 品質保証
