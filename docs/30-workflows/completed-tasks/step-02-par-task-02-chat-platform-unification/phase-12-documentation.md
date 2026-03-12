# Phase 12: ドキュメント

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 12                                                   |
| Phase名    | ドキュメント                                         |
| タスクID   | TASK-SKILL-LIFECYCLE-02                              |
| タスク名   | 会話基盤・セッション統合                             |
| 機能名     | chat-platform-unification                            |
| 前提Phase  | [phase-11-manual-test.md](./phase-11-manual-test.md) |
| 後続Phase  | [phase-13-pr-creation.md](./phase-13-pr-creation.md) |
| ステータス | completed                                            |
| 作成日     | 2026-03-11                                           |

## 目的

共通会話基盤の契約を後続実装・保守で再利用できるように文書化し、system spec と task spec の両方へ同期する。

## 実行タスク

- Task 1: Part 1 / Part 2 の実装ガイドを作成する
- Task 2: system spec 更新判断と Step 1-A〜1-E を実施する
- Task 3: `documentation-changelog.md` を更新する
- Task 4: `unassigned-task-detection.md` を 0件時も含めて作成する
- Task 5: `skill-feedback-report.md` を作成する

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
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

## 参照資料

| 参照資料             | パス                                                                           | 内容                    |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| phase 11/12 guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 12 必須要件       |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2        |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                       | 証跡                    |
| 発見課題             | `outputs/phase-11/discovered-issues.md`                                        | 未タスク候補            |
| 品質レポート         | `outputs/phase-9/quality-report.md`                                            | 変更要点                |
| 仕様抽出監査         | `outputs/phase-9/spec-extraction-audit.md`                                     | aiworkflow 導線改善対象 |
| 共通ドメインモデル   | `outputs/phase-2/common-chat-domain-model.md`                                  | session / mode 契約     |
| 実装ログ             | `outputs/phase-5/implementation-log.md`                                        | 実装実体                |
| 回帰ケース一覧       | `outputs/phase-6/regression-case-matrix.md`                                    | failure 観点            |
| 要件トレーサビリティ | `outputs/phase-7/requirement-traceability.md`                                  | AC と証跡               |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                           | 最終構造                |
| 最終レビュー指摘一覧 | `outputs/phase-10/final-review-findings.md`                                    | documentation 根拠      |

## 実行手順

1. Task 1-5 を SubAgent ごとに分担し、implementation guide / spec update / changelog / unassigned / feedback を並列で下書きする。
2. Step 1-A〜1-E を順に実施し、workflow 本文と `.claude` 正本を同期する。
3. `resource-map.md` と `quick-reference.md` に Task02 専用の逆引き導線があるか確認し、不足を補う。
4. 新規ドメイン仕様更新が発生した場合は references を更新し、発生しない場合は理由を `documentation-changelog.md` に明記する。
5. 0件でも未タスク検出結果とスキル改善結果を残す。

## 成果物

| 成果物             | パス                                                     | 説明                                 |
| ------------------ | -------------------------------------------------------- | ------------------------------------ |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2                      |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`                | Step 1-A〜Step 2 実施記録            |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`            | 更新ログ                             |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md`          | 0件含む結果                          |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`              | task-spec / aiworkflow 改善          |
| 準拠確認補助成果物 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 / Step 1-A〜1-G 集約 |

## 完了条件

- [x] 共通基盤契約の更新先が定義されている
- [x] aiworkflow-requirements の逆引き導線改善が記録されている
- [x] 未タスク検出レポート対象が列挙されている
- [x] Task 1〜5 の成果物が揃っている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-11-manual-test.md](./phase-11-manual-test.md)
- 後続: [phase-13-pr-creation.md](./phase-13-pr-creation.md)

## サブタスク管理

- [x] Task 1 実装ガイド
- [x] Task 2 system spec 更新
- [x] Task 3 changelog
- [x] Task 4 未タスク検出
- [x] Task 5 スキル改善

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] current workflow と `.claude` 正本が整合している
- [x] Task02 専用の spec extraction 導線改善が確認できる

## 次のPhase

Phase 13: [phase-13-pr-creation.md](./phase-13-pr-creation.md)
