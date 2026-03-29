# Phase 12: ドキュメント

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 12                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

Task 12-1〜12-5 を漏れなく閉じ、`spec_created` task として same-wave sync の根拠を残す。

## 実行タスク

- Task 12-1: implementation guide を作成する
- Task 12-2: Step 1-A〜1-C を必須実施し、Step 2 要否を判定する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned-task detection を実施する
- Task 12-5: skill feedback report を作成する
- Task 12-6: phase12-task-spec-compliance-check を作成する

## 参照資料

| 資料名               | パス                                                                             | 説明             |
| -------------------- | -------------------------------------------------------------------------------- | ---------------- |
| Phase 11 結果        | `phase-11-manual-test.md`                                                        | walkthrough 結果 |
| spec update workflow | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1/2 判断    |
| phase12 template     | `.agents/skills/task-specification-creator/references/phase-template-phase12.md` | 必須成果物       |

## 実行手順

### Task 12-1: implementation guide

- Part 1: 中学生レベルで「空成功を失敗として見せる必要性」を例えで説明する
- Part 2: `RuntimeSkillCreatorPlanErrorResponse` / `RuntimeSkillCreatorImproveErrorResponse` / type guard / execute 抑止を記載する

### Task 12-2: system spec update summary

| Step     | 必須     | 本タスクでの扱い                                                      |
| -------- | -------- | --------------------------------------------------------------------- |
| Step 1-A | ✅       | 完了記録、関連リンク、LOGS / topic-map 更新要否を記録                 |
| Step 1-B | ✅       | 実装状況は `spec_created` として記録                                  |
| Step 1-C | ✅       | 関連タスク・未タスク候補の status を current facts に同期             |
| Step 2   | 条件付き | shared type / IPC / renderer contract に code wave が入る場合のみ更新 |

**no-op 根拠の書き方**

- Step 2 が不要でも `system-spec-update-summary.md` に理由を残す
- 将来文言を残さない

### Task 12-4: 未タスク検出

最低でも以下を再判定する。

- type 定義後の実装タスク化要否
- RT-03 で必要な result panel 側 follow-up
- i18n / copy standardization

## 統合テスト連携

- Phase 13 は blocked 前提で local check と change summary までを閉じる

## 成果物

| 成果物               | パス                                                     | 説明                     |
| -------------------- | -------------------------------------------------------- | ------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2          |
| 仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 結果     |
| 変更履歴             | `outputs/phase-12/documentation-changelog.md`            | current / baseline 差分  |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも作成              |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点 or なし           |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 完了確認 |

## 完了条件

- [ ] 必須5成果物 + compliance check が揃っている
- [ ] Step 1-A〜1-C が記録されている
- [ ] Step 2 要否の根拠が書かれている
- [ ] 将来文言が残っていない
- [ ] **本Phase内の全タスクを100%実行完了**
