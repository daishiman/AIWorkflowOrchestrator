# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 11                                      |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

人手で読んで、save target、resume 可否、warning / reject、checkpoint boundary が誤解なく理解できるかを確認する。

## 実行タスク

- save target の可読性を確認する
- invalidation / conflict / warning の区別を確認する
- Agent SDK session と別契約であることを確認する
- downstream handoff の理解しやすさを確認する

## テストケース

| テストケース | 観点                | 手順                                                         | 期待結果                                        |
| ------------ | ------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| `TC-11-01`   | save target         | `phase-1-requirements.md` と `phase-2-design.md` を読む      | save target 一覧を説明できる                    |
| `TC-11-02`   | compatibility       | `outputs/phase-2/persistence-compatibility-matrix.md` を読む | warning / reject / conflict の差を説明できる    |
| `TC-11-03`   | checkpoint boundary | `outputs/phase-2/checkpoint-topology.md` を読む              | checkpoint が phase boundary 限定だと説明できる |
| `TC-11-04`   | API boundary        | `phase-10-final-review.md` と `index.md` を読む              | `agent:resumeSession` と別契約だと説明できる    |

## 画面カバレッジマトリクス

| テストケース | 対象             | 画面/証跡                                      | 実施方針                                    |
| ------------ | ---------------- | ---------------------------------------------- | ------------------------------------------- |
| `TC-11-01`   | docs walkthrough | `outputs/phase-11/screenshots/placeholder.png` | docs-only の representative evidence を使用 |
| `TC-11-02`   | docs walkthrough | `outputs/phase-11/screenshots/placeholder.png` | docs-only の representative evidence を使用 |
| `TC-11-03`   | docs walkthrough | `outputs/phase-11/screenshots/placeholder.png` | docs-only の representative evidence を使用 |
| `TC-11-04`   | docs walkthrough | `outputs/phase-11/screenshots/placeholder.png` | docs-only の representative evidence を使用 |

## 参照資料

| 資料名                 | パス                                                  | 説明               |
| ---------------------- | ----------------------------------------------------- | ------------------ |
| Phase 6 test expansion | `phase-6-test-expansion.md`                           | drift / conflict   |
| Phase 7 coverage       | `phase-7-coverage-check.md`                           | coverage 観点      |
| Phase 8 refactoring    | `phase-8-refactoring.md`                              | 用語整理           |
| Phase 9 QA             | `phase-9-quality-assurance.md`                        | quality gate       |
| Phase 2 設計           | `phase-2-design.md`                                   | persisted contract |
| compatibility matrix   | `outputs/phase-2/persistence-compatibility-matrix.md` | 判定表             |
| checkpoint topology    | `outputs/phase-2/checkpoint-topology.md`              | restore flow       |
| Phase 10 final review  | `phase-10-final-review.md`                            | handoff 先         |

## 成果物

| 成果物            | パス                                        | 説明                              |
| ----------------- | ------------------------------------------- | --------------------------------- |
| manual checklist  | `outputs/phase-11/manual-test-checklist.md` | 人手確認項目                      |
| manual result     | `outputs/phase-11/manual-test-result.md`    | 実施結果                          |
| manual report     | `outputs/phase-11/manual-test-report.md`    | walkthrough 所見                  |
| discovered issues | `outputs/phase-11/discovered-issues.md`     | Blocker / Note / Info 分類        |
| screenshot plan   | `outputs/phase-11/screenshot-plan.json`     | docs-only representative evidence |

## 実行手順

### ステップ1: docs walkthrough を実施する

- `phase-1-requirements.md`、`phase-2-design.md`、`phase-5-implementation.md` を順に読み、保存対象と restore 境界を説明できるか確認する。
- `outputs/phase-2/persistence-compatibility-matrix.md` と `outputs/phase-2/checkpoint-topology.md` を読み、warning / reject / conflict の差を説明できるか確認する。

### ステップ2: API 境界の理解を確認する

- `agent:resumeSession` と Skill Creator workflow resume が別契約であることを説明できるか確認する。
- 発見事項は `Blocker / Note / Info` へ分類する。

## 統合テスト連携

- manual reviewer が Phase 6〜9 の edge case と QA 結果を矛盾なく読めることを確認する。
- Phase 12 に walkthrough 結果を反映する。

## 完了条件

- [ ] save target と checkpoint boundary が読める
- [ ] warning / reject / conflict の差が読める
- [ ] Agent SDK session と別契約であることが読める
- [ ] **本Phase内の全タスクを100%実行完了**
