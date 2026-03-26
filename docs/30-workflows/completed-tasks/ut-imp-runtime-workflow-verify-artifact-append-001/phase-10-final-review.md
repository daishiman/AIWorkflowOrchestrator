# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 10                                                 |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 9                 |
| 後続Phase  | Phase 11                                           |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

要件、設計、実装、テスト、QA が揃い、Phase 11 へ進めるかを判定する。

## Final Gate 判定表

| 判定軸        | Go 条件                                         | Back 条件                       |
| ------------- | ----------------------------------------------- | ------------------------------- |
| 要件充足      | AC-01〜04 が Phase 7/9 で閉じている             | AC 未消化が残る                 |
| scope control | engine/test/ledger 判断の範囲で閉じる           | public contract 変更へ波及する  |
| 親契約整合    | parent workflow と TASK-SDK-02 の前提が両立する | append 正本契約が衝突する       |
| Phase 12 入力 | manual evidence と sync 判断材料が揃う          | ledger 更新要否の根拠が不足する |

## 実行タスク

- AC 充足を確認する
- scope creep の有無を確認する
- parent workflow と system spec への影響を確認する

## 参照資料

| 参照資料 | パス                           | 内容     |
| -------- | ------------------------------ | -------- |
| Phase 1  | `phase-1-requirements.md`      | AC       |
| Phase 9  | `phase-9-quality-assurance.md` | 実行結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                 | 内容            |
| --------------- | -------------------------------------------------------------------- | --------------- |
| workflow ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | phase gate 記録 |

## 統合テスト連携

| 観点       | 連携内容                                              |
| ---------- | ----------------------------------------------------- |
| final gate | Phase 9 の validator と test 結果を review に反映する |

## 成果物

| 成果物       | パス                                       | 説明         |
| ------------ | ------------------------------------------ | ------------ |
| final review | `outputs/phase-10/final-review-summary.md` | Go/Back 判定 |

## 完了条件

- [ ] AC が全件確認済み
- [ ] scope creep がない
- [ ] parent workflow との矛盾がない
- [ ] Phase 11 へ進める判定理由が記録されている
