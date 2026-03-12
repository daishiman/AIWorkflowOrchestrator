# Phase 12: ドキュメント

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 12                                                   |
| Phase名    | ドキュメント                                         |
| タスクID   | TASK-SKILL-LIFECYCLE-02                              |
| タスク名   | 会話基盤・セッション統合                             |
| 前提Phase  | [phase-11-manual-test.md](./phase-11-manual-test.md) |
| 後続Phase  | [phase-13-pr-creation.md](./phase-13-pr-creation.md) |
| ステータス | completed                                            |
| 作成日     | 2026-03-12                                           |

## 目的

共通会話基盤の契約を後続実装・保守で再利用できるように文書化し、system spec への同期対象を定義する。

## 実行タスク

- Task 1: Part 1 / Part 2 の実装ガイドを作成する
- Task 2: Step 1-A〜1-E と Step 2 を実施する
- Task 3: `documentation-changelog.md` を更新する
- Task 4: `unassigned-task-detection.md` を 0件時も含めて作成する
- Task 5: `skill-feedback-report.md` を作成する
- parent / sibling sync: `skill-lifecycle-unification/index.md` と依存 workflow の relative ref を current 配置へ同期する
- follow-up 判定: revive / handoff gap が残る場合は `UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001` を更新または追補する

## system spec 更新候補

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`
- `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`
- `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`
- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

## 参照資料

| 参照資料             | パス                                                                           | 内容                             |
| -------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| phase 11/12 guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 12 必須要件                |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2                 |
| session model        | `outputs/phase-2/session-model.md`                                             | session 契約                     |
| implementation log   | `outputs/phase-5/implementation-log.md`                                        | 実装差分                         |
| test expansion       | `outputs/phase-6/test-expansion-result.md`                                     | 追加テスト結果                   |
| coverage report      | `outputs/phase-7/coverage-report.md`                                           | coverage 結果                    |
| refactoring log      | `outputs/phase-8/refactoring-log.md`                                           | 最終構造                         |
| quality report       | `outputs/phase-9/quality-report.md`                                            | 品質判定                         |
| final review         | `outputs/phase-10/final-review-result.md`                                      | 最終判定                         |
| manual test result   | `outputs/phase-11/manual-test-result.md`                                       | 証跡                             |
| discovered issues    | `outputs/phase-11/discovered-issues.md`                                        | 未タスク候補                     |
| unassigned detection | `outputs/phase-12/unassigned-task-detection.md`                                | 未タスク結果                     |
| task workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | current/archive 台帳             |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 再利用知見                       |
| follow-up guard      | `./unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md`         | revive / handoff の formalize 先 |

## 成果物

| 成果物             | パス                                            | 説明                        |
| ------------------ | ----------------------------------------------- | --------------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2             |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜Step 2 実施記録   |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 更新ログ                    |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | 0件含む結果                 |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | task-spec / aiworkflow 改善 |

## 完了条件

- [x] 共通基盤契約の更新先が定義されている
- [x] current workflow と completed archive の役割分離が明文化されている
- [x] parent pack / sibling workflow の relative ref 同期方針が含まれている
- [x] 未タスク検出レポート対象が列挙されている
- [x] revive / handoff の follow-up 判定先が定義されている
- [x] task-spec / aiworkflow の両スキル更新が計画に含まれている
