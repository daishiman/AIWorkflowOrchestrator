# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 11                                                   |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 1、Phase 2、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10 の結果を人手で読み合わせ、close-out 証跡が current facts を説明できるかを確認する。

## 実行タスク

- parent workflow の close-out 4 点を読み合わせる
- old path 残存有無を目視確認する
- `spec_created` judgement の説明を目視確認する
- follow-up 導線の説明を目視確認する

## 参照資料

| 資料名                | パス                           | 説明           |
| --------------------- | ------------------------------ | -------------- |
| Phase 1 要件          | `phase-1-requirements.md`      | acceptance     |
| Phase 2 設計          | `phase-2-design.md`            | lane 設計      |
| Phase 5 実装          | `phase-5-implementation.md`    | 実更新対象     |
| Phase 6 拡充          | `phase-6-test-expansion.md`    | drift 観点     |
| Phase 7 監査          | `phase-7-coverage-check.md`    | coverage       |
| Phase 8 整理          | `phase-8-refactoring.md`       | 語彙整理       |
| Phase 9 QA            | `phase-9-quality-assurance.md` | 機械検証の観点 |
| Phase 10 最終レビュー | `phase-10-final-review.md`     | 最終 gate      |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容                                |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| backlog current  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | follow-up 導線確認                  |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | `spec_created` close-out の説明基準 |

## 成果物

| 成果物                | パス                                        | 説明                 |
| --------------------- | ------------------------------------------- | -------------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 手動確認項目         |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | 手動確認結果         |
| screenshot plan       | `outputs/phase-11/screenshot-plan.json`     | validator 補助成果物 |

## 統合テスト連携

- Phase 12 は Phase 11 の読み合わせ結果を compliance check と changelog へ反映する。
- Phase 13 は Phase 11 の確認結果を local check の補足 note に使う。

## 完了条件

- [ ] close-out 4 点の読み合わせが完了している
- [ ] old path 残存有無の目視確認が完了している
- [ ] `spec_created` judgement の説明確認が完了している
- [ ] follow-up 導線の説明確認が完了している
- [ ] **本Phase内の全タスクを100%実行完了**
