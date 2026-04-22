# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 10                               |
| 後続Phase  | Phase 12                               |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |
| 種別       | NON_VISUAL                             |

## 目的

NON_VISUAL タスクとして、`pendingRequest` の意味固定が実行時に誤解されないかを確認する。primary evidence は `outputs/phase-11/manual-test-result.md` とし、スクリーンショット取得は対象外とする。

## 実行タスク

1. 通常フロー、復元フロー、復元後切替の3シナリオを確認する。
2. 実施可否と環境制約を `manual-test-result.md` に記録する。
3. `manual-test-checklist.md` と `discovered-issues.md` に結果を残す。

## 参照資料

| 資料名        | パス                                                                                   | 用途         |
| ------------- | -------------------------------------------------------------------------------------- | ------------ |
| Phase 10 結果 | `outputs/phase-10/final-review-result.md`                                              | 判定基準     |
| レビュー資料  | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md` | 後続 handoff |
| 対象コード    | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | 実装確認     |

## 実行手順

1. 実機起動可能なら 3 シナリオを実行する。
2. 実機起動が難しい場合は、未実施理由を `manual-test-result.md` に記録する。
3. `manual-test-checklist.md` と `discovered-issues.md` を更新する。

## 統合テスト連携

- `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- primary evidence は `outputs/phase-11/manual-test-result.md`
- 代替証跡は `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

## 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`

## 完了条件

- [ ] 3シナリオの実施可否を記録した
- [ ] スクリーンショット不要方針を明記した
- [ ] primary evidence を明記した

## タスク100%実行確認【必須】

- [ ] Phase 11 の3成果物を作成した
- [ ] NON_VISUAL 方針を本文に反映した

## 次のPhase

Phase 12: ドキュメント更新
