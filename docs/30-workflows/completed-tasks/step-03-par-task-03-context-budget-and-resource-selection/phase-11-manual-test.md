# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

人手で読んで source discovery、resource selection、budget / degrade、provenance handoff の方針が理解しやすいか確認する。

## 実行タスク

- source discovery 順序の可読性を確認する
- fixed path 非前提が明示されているか確認する
- downstream handoff の理解しやすさを確認する
- current canonical facts と Task03 extension の境界が読めるか確認する

## 参照資料

| 資料名                   | パス                                          | 説明           |
| ------------------------ | --------------------------------------------- | -------------- |
| Phase 5 実装             | `phase-5-implementation.md`                   | 実装対象と順序 |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                   | edge case      |
| Phase 7 coverage         | `phase-7-coverage-check.md`                   | coverage 観点  |
| Phase 8 refactoring      | `phase-8-refactoring.md`                      | 命名整理       |
| Phase 9 QA               | `phase-9-quality-assurance.md`                | final QA       |
| source resolution matrix | `outputs/phase-2/source-resolution-matrix.md` | discovery 順序 |
| budget degrade matrix    | `outputs/phase-2/budget-degrade-matrix.md`    | degrade 条件   |
| Phase 10 final review    | `phase-10-final-review.md`                    | handoff 先     |

## 成果物

| 成果物            | パス                                        | 説明                             |
| ----------------- | ------------------------------------------- | -------------------------------- |
| manual checklist  | `outputs/phase-11/manual-test-checklist.md` | 人手確認項目                     |
| manual result     | `outputs/phase-11/manual-test-result.md`    | 実施結果                         |
| manual report     | `outputs/phase-11/manual-test-report.md`    | walkthrough 概要と所見           |
| discovered issues | `outputs/phase-11/discovered-issues.md`     | Blocker / Note / Info の分類結果 |
| screenshot plan   | `outputs/phase-11/screenshot-plan.json`     | docs-only のため NON_VISUAL plan |

## 実行手順

### ステップ1: docs-only walkthrough を実施する

- `phase-1-requirements.md`、`phase-2-design.md`、`phase-5-implementation.md` を順に読み、source discovery と planner boundary を説明できるか確認する。
- `outputs/phase-2/source-resolution-matrix.md` と `outputs/phase-2/budget-degrade-matrix.md` を読み、foundation snapshot と Task03 extension の区別が読めるか確認する。

### ステップ2: downstream handoff の可読性を確認する

- `phase-10-final-review.md` と `outputs/phase-3/skill-compliance-and-elegance-review.md` を読み、Task04 / 05 / 06 / 07 / 08 へ何を渡すか説明できるか確認する。
- 発見事項は `Blocker / Note / Info` に分類し、`discovered-issues.md` へ残す。

## 統合テスト連携

- manual reviewer が Phase 4 / 10 の想定と矛盾なく読めることを確認する。
- Phase 12 に walkthrough 結果を記録する。

## 完了条件

- [ ] 選択 / 縮退ロジックが読める
- [ ] source discovery 順序と provenance handoff が読める
- [ ] current canonical facts と Task03 extension の境界が読める
- [ ] **本Phase内の全タスクを100%実行完了**
