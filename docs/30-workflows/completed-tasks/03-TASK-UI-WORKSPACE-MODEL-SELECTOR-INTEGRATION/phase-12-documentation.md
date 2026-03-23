# Phase 12: ドキュメント

## メタ情報

| 項目          | 値                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 12                                                                                                                           |
| タスクID      | `TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION`                                                                               |
| 作成日        | 2026-03-21                                                                                                                   |
| 更新日        | 2026-03-22                                                                                                                   |
| ステータス    | 完了                                                                                                                         |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-11-manual-test.md` |

## 目的

WorkspaceChatPanel へ `InlineModelSelector` を統合した結果を、implementation guide、system spec、task ledger、未タスク管理へ同期する。

## 事前チェック（既知の落とし穴確認）

| Pitfall | 確認内容                                                                                   | チェック |
| ------- | ------------------------------------------------------------------------------------------ | -------- |
| P1/P25  | LOGS.md は aiworkflow-requirements と task-specification-creator の**2ファイル**を更新する | [ ]      |
| P2/P27  | topic-map.md は `node generate-index.js` で**必ず再生成**する                              | [ ]      |
| P3/P38  | 未タスクは `docs/30-workflows/unassigned-task/` に独立ファイルとして配置する               | [ ]      |
| P4/P51  | documentation-changelog は全Step完了後に**事後記録**する（実行前に完了と書かない）         | [ ]      |
| P29     | SKILL.md の変更履歴テーブルも更新する（LOGS.md だけでは不十分）                            | [ ]      |
| P43     | サブエージェント使用時は3ファイル以下/エージェントに分割する                               | [ ]      |
| P57     | 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する                          | [ ]      |

## 実行タスク

- Task 1: `outputs/phase-12/implementation-guide.md` を作成する
- Task 2: `ui-ux-llm-selector.md` を中心に system spec を更新する
- Task 3: `outputs/phase-12/documentation-changelog.md` を事後記録で作成する
- Task 4: `outputs/phase-12/unassigned-task-detection.md` を 0 件でも出力する
- Task 5: `outputs/phase-12/skill-feedback-report.md` を作成する
- Task 6: `outputs/phase-12/phase12-task-spec-compliance-check.md` で最終確認する

## 参照資料

| 資料                 | パス                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 2 設計         | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-2-design.md`         |
| Phase 3 レビュー     | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-3-design-review.md`  |
| Phase 5 実装         | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md` |
| Phase 11 手動テスト  | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-11-manual-test.md`   |
| Phase 12 ガイド      | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                                         |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                 |

## 実行手順

1. Task 1 で `implementation-guide.md` を 2 パート構成で作成する。
2. Task 2 で `ui-ux-llm-selector.md`、必要に応じて `ui-ux-navigation.md`、Workspace surface に実変更がある場合のみ `ui-ux-feature-components-*.md`、`task-workflow-backlog.md`、対応する completed ledger、LOGS / SKILL を更新する。
3. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する。
4. `.claude/skills/aiworkflow-requirements/` と `.claude/skills/task-specification-creator/` を `.agents/skills/` へ mirror sync する。
5. Task 3〜6 の成果物を `outputs/phase-12/` にそろえ、validator 実測を記録する。
6. 未タスクがある場合は `docs/30-workflows/unassigned-task/` に formalize する。

## 成果物

| 成果物                   | パス                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド               | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/implementation-guide.md`               |
| システム仕様更新サマリー | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/system-spec-update-summary.md`         |
| 更新履歴                 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出             | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバック     | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/skill-feedback-report.md`              |
| 準拠チェック             | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` を作成した
- [ ] `outputs/phase-12/system-spec-update-summary.md` を作成した
- [ ] `outputs/phase-12/documentation-changelog.md` を作成した
- [ ] `outputs/phase-12/unassigned-task-detection.md` を作成した
- [ ] `outputs/phase-12/skill-feedback-report.md` を作成した
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成した
- [ ] `ui-ux-llm-selector.md` と task ledger の更新有無を判断し、結果を記録した
- [ ] `generate-index.js` と mirror sync を実行した
- [ ] 未タスクがある場合は `docs/30-workflows/unassigned-task/` に配置した
- [ ] LOGS.md を aiworkflow-requirements と task-specification-creator の**2ファイル**更新した（P1/P25対策）
- [ ] SKILL.md 変更履歴を aiworkflow-requirements と task-specification-creator の**2ファイル**更新した（P29対策）
- [ ] `grep -rn "TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索し更新した（Step 1-C）
- [ ] artifacts.json の Phase 1-12 ステータスを確認した
- [ ] 事前チェックテーブルの全項目をチェックした

## 次のPhase

[Phase 13: 完了](./phase-13-pr-creation.md)
