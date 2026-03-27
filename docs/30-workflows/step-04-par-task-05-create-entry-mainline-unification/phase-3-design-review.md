# Phase 3: 設計レビュー

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 3                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 2                           |
| 後続Phase | Phase 4                           |

## 目的

Task05 の設計が「主導線を 1 本にする」目的へ収束しているかを確認し、Task06 / Task07 との責務侵食がない状態で gate を通す。

## 実行タスク

- primary route の説明可能性をレビューする
- secondary / advanced route の格下げが明確かレビューする
- provenance / warning の summary 設計をレビューする
- Task06 / Task07 との責務境界をレビューする

## 参照資料

| 資料名                 | パス                                                                                                | 説明                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 要件           | `phase-1-requirements.md`                                                                           | AC-1〜AC-7                           |
| Phase 2 設計           | `phase-2-design.md`                                                                                 | surface / navigation 設計            |
| Phase 2 境界マトリクス | `outputs/phase-2/mainline-boundary-matrix.md`                                                       | primary/secondary 設計表             |
| Task06 index           | `../skill-creator-agent-sdk-lane/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md` | verify / improve 側の責務            |
| elegance review        | `outputs/phase-3/skill-compliance-and-elegance-review.md`                                           | 2 skill 準拠監査と 30 思考法レビュー |

## レビュー観点

| 観点                                                                                 | 判定 | メモ                                                 |
| ------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------- |
| primary route が 1 文で説明できるか                                                  | PASS | `Skill Center -> skillCreate` で固定されている       |
| `SkillCreateWizard` が destination へ整理されているか                                | PASS | standalone は shell destination として説明されている |
| `SkillLifecyclePanel` / `SkillManagementPanel` が secondary route と明記されているか | PASS | advanced route として格下げ済み                      |
| provenance / warning が summary と diagnostics に分離されているか                    | PASS | Task03 trigger を mainline summary へ限定している    |
| Task06 / Task07 と責務衝突していないか                                               | PASS | verify / governance は downstream へ委譲している     |

## 判定

PASS。全面統合ではなく create 主導線の一本化へ scope を絞ったため、
lane 全体の責務境界を保ったまま Task05 を独立 task として成立させられる。

## 戻り先判定

| 問題の種類                      | 戻り先  |
| ------------------------------- | ------- |
| primary route が複数残る        | Phase 1 |
| navigation / warning 配置が曖昧 | Phase 2 |
| verify / governance の責務侵食  | Phase 2 |

## 統合テスト連携

- Phase 4 で primary/secondary の判別がテストケースへ落ちているかを確認する。
- Task06 と共有するテスト観点は route collision ではなく boundary assertion に限定する。

## 成果物

| 成果物       | パス                                                      | 内容                       |
| ------------ | --------------------------------------------------------- | -------------------------- |
| レビュー結果 | `phase-3-design-review.md`                                | review gate の本文         |
| gate record  | `outputs/phase-3/design-review-gate.md`                   | 判定根拠の要約             |
| review audit | `outputs/phase-3/skill-compliance-and-elegance-review.md` | skill 準拠とエレガンス監査 |

## 完了条件

- [ ] primary route の説明可能性がレビューされている
- [ ] advanced route の格下げがレビューされている
- [ ] warning summary 設計がレビューされている
- [ ] Task06 / Task07 との境界がレビューされている
- [ ] PASS / MINOR / MAJOR の戻り先基準が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
