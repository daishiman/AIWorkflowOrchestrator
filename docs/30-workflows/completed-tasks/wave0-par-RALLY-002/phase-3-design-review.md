# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 3                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 2                                |
| 後続Phase  | Phase 4                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

RALLY-002 が「既存ロジックの意味を固定する最小責務」に留まっているかをレビューし、不要な実装膨張を防ぐ。

## 実行タスク

1. verify_existing 化が妥当かを再判定する
2. `rally-phase-2-solution.md` と現コードのズレを許容範囲に収める
3. Phase 4 以降のテスト・diff check・close-out が過不足なく繋がるか確認する

## 実行手順

- 設計とコードの責務差をレビューする
- `RALLY-002 -> RALLY-010..013` の依存を確認する
- approval-blocked ルールが Phase 13 に反映されているか確認する

## 統合テスト連携

- targeted test が comment 改善と clear condition を過不足なくカバーするかを確認する
- manual semantic check と automated regression check の責務分離を確認する

## 多角的チェック観点（AIが判断）

- 批判的思考: 実装を増やし過ぎていないか
- 抽象化思考: downstream が参照すべき契約に落ちているか
- why思考: RALLY-002 を今やる理由が RALLY-010 以降の前提整備で説明できるか

## サブタスク管理

| チェック項目    | 判定観点                                               |
| --------------- | ------------------------------------------------------ |
| scope drift     | `ConversationalInterview.tsx` 外へ責務が漏れていないか |
| design drift    | verify_existing が Phase 4/5 に反映されているか        |
| close-out drift | Phase 11/12/13 が最新 skill に沿っているか             |

## 参照資料

| 資料名         | パス                                                                 | 用途     |
| -------------- | -------------------------------------------------------------------- | -------- |
| Phase 2 成果物 | `outputs/phase-2/*.md`                                               | 設計確認 |
| 上流レビュー   | `docs/30-workflows/00-task-spec-design-docs/rally-phase-3-review.md` | 依存確認 |

## 成果物

- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/gate-decision.md`
- `outputs/phase-3/dependency-risk-register.md`

## 完了条件

- [ ] verify_existing 方針を PASS と判断した
- [ ] downstream 依存に矛盾がない
- [ ] Phase 11/12/13 の運用矛盾を解消した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] Gate 判定を明文化
- [ ] 成果物を全件定義

## 次のPhase

Phase 4: テスト作成
