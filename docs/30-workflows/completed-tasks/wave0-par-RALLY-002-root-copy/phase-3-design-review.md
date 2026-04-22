# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 3                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 2                                |
| 後続Phase  | Phase 4                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

Phase 2 の設計が RALLY-002 の責務に閉じているかを gate する。レビュー対象は「追加実装不要の根拠」「後続 handoff 契約」「検証可能性」の3点に絞る。

## 実行タスク

1. 設計が `ConversationalInterview.tsx` 単体に閉じているか確認する。
2. 後続タスク依存を handoff 契約として明文化できているか確認する。
3. PASS / MINOR / MAJOR の gate 判定と、未解決リスクを記録する。

## 参照資料

| 資料名             | パス                                                                                   | 用途             |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------- |
| Phase 2 設計       | `outputs/phase-2/verification-design.md`                                               | レビュー本体     |
| Phase 2 責務表     | `outputs/phase-2/responsibility-boundary-matrix.md`                                    | スコープ確認     |
| Phase 2 コマンド表 | `outputs/phase-2/validation-command-matrix.md`                                         | 検証可能性確認   |
| レビュー資料       | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md` | 懸念点・依存確認 |

## 実行手順

1. Phase 2 の3成果物を読み、スコープ外要求が混入していないか確認する。
2. PASS / MINOR / MAJOR を `design-review-result.md` と `gate-decision.md` に整理する。
3. 依存リスクを `dependency-risk-register.md` に整理し、Phase 4 へ引き渡す。

## 統合テスト連携

- Phase 4 以降で実行するコマンドが review 時点で過不足ないかを確認する。
- `verify_existing` なのに新規ロジックや広域 AC を背負っていないかを確認する。

## 多角的チェック観点（AIが判断）

- simpler alternative が存在するか
- Phase 4 で実行不能な前提を置いていないか
- 後続 RALLY-010〜013 に誤解を残さないか

## サブタスク管理

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| review scope | RALLY-002 固有責務に閉じているか    |
| risk scope   | 後続 handoff を阻害する依存があるか |
| gate         | PASS / MINOR / MAJOR                |

## 成果物

- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/gate-decision.md`
- `outputs/phase-3/dependency-risk-register.md`

## 完了条件

- [ ] 設計レビュー結果を記録した
- [ ] gate 判定を記録した
- [ ] 依存リスクを記録した
- [ ] Phase 4 へ進める論点だけを残した

## タスク100%実行確認【必須】

- [ ] Phase 3 の3成果物を作成した
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/wave0-par-RALLY-002 --phase 3` を実行または実行可能な状態にした
- [ ] MINOR / MAJOR の戻り先を明文化した

## 次のPhase

Phase 4: テスト作成
