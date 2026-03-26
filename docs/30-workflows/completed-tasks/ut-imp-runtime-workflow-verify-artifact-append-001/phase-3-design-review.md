# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 3                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 1, Phase 2                                   |
| 後続Phase  | Phase 4                                            |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

failure append 設計が親 workflow 契約と矛盾せず、Phase 4 以降へ進める品質かを判定する。

## Gate 判定表

| 判定軸       | Go 条件                                             | Back 条件                         |
| ------------ | --------------------------------------------------- | --------------------------------- |
| append 正本  | `verify_result` を failure ごとに append する       | upsert / overwrite を残す         |
| owner 境界   | engine のみが write し、facade は read に限定される | facade 側で artifact を再構成する |
| traceability | AC-01〜04 が test case へ対応づく                   | AC に未対応の case がある         |
| 依存整合     | parent workflow と TASK-SDK-02 の契約が両立する     | owner 契約が競合する              |

## 実行タスク

- Phase 1 AC と Phase 2 設計の整合を確認する
- append 正本方針が upsert に戻っていないかを確認する
- test 観点が code anchor と1対1で対応しているかを確認する

## 参照資料

| 参照資料       | パス                                       | 内容          |
| -------------- | ------------------------------------------ | ------------- |
| Phase 1        | `phase-1-requirements.md`                  | AC            |
| Phase 2        | `phase-2-design.md`                        | 実装設計      |
| review summary | `outputs/phase-3/design-review-summary.md` | gate 判定結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                        | 内容                 |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| service details | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade / engine 境界 |

## 統合テスト連携

| 観点 | 連携内容                                             |
| ---- | ---------------------------------------------------- |
| gate | Phase 4 の case が review 指摘を埋めることを確認する |

## 成果物

| 成果物       | パス                                       | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| レビュー要約 | `outputs/phase-3/design-review-summary.md` | Go/Back 判定の記録 |

## 完了条件

- [ ] append 正本契約と設計に矛盾がない
- [ ] failure append が親タスクの lifecycle 修正と競合しない
- [ ] test 観点の不足がない
- [ ] Back 条件が明記されている
