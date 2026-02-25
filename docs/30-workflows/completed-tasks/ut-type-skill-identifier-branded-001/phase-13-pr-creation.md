# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 13                                                                     |
| Phase名    | PR作成                                                                 |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 12                                                               |
| 後続Phase  | なし                                                                   |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

レビュー提出単位を整理し、PR 説明と証跡リンクを作成する。

## 背景

このPhaseは提出準備の定義。実際のコミット・PR作成はユーザー指示があるまで実行しない。

## 実行タスク

- SubAgent-A（差分要約）: 変更ファイルと目的を要約する
- SubAgent-B（証跡整理）: テスト結果と仕様更新証跡を整理する
- SubAgent-C（PR本文）: PR テンプレート本文を作成する
- Lead（最終確認）: 提出条件と禁止事項を確認する

## 参照資料

| 参照資料           | パス                                            | 内容            |
| ------------------ | ----------------------------------------------- | --------------- |
| 依存Phase 1        | `phase-1-requirements.md`                       | 要件            |
| 依存Phase 2        | `phase-2-design.md`                             | 設計            |
| 依存Phase 5        | `phase-5-implementation.md`                     | 実装            |
| 依存Phase 6        | `phase-6-test-expansion.md`                     | テスト拡充      |
| 依存Phase 7        | `phase-7-coverage-check.md`                     | カバレッジ      |
| 依存Phase 8        | `phase-8-refactoring.md`                        | リファクタ      |
| 依存Phase 9        | `phase-9-quality-assurance.md`                  | 品質保証        |
| 依存Phase 10       | `phase-10-final-review.md`                      | 最終レビュー    |
| 依存Phase 11       | `phase-11-manual-test.md`                       | 手動テスト      |
| 依存Phase 12       | `phase-12-documentation.md`                     | 文書更新        |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`       | Phase 10 成果物 |
| 指摘一覧           | `outputs/phase-10/final-review-findings.md`     | Phase 10 成果物 |
| 是正計画           | `outputs/phase-10/remediation-plan.md`          | Phase 10 成果物 |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`        | Phase 11 成果物 |
| 発見事項           | `outputs/phase-11/manual-findings.md`           | Phase 11 成果物 |
| エビデンス一覧     | `outputs/phase-11/evidence-index.md`            | Phase 11 成果物 |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Phase 12 成果物 |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`       | Phase 12 成果物 |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | Phase 12 成果物 |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物 |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | Phase 12 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容       |
| --------------- | ---------------------------------------------------------------------- | ---------- |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了反映先 |
| spec-guidelines | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | 文書規則   |

## 実行手順

1. SubAgent-A/B/C が要約・証跡・PR本文を並列作成する（並列）。
2. Lead が提出条件を確認する（直列）。
3. ユーザー指示があるまでコミット/PR作成コマンドを実行しない（直列）。

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物   | パス                                 | 説明                  |
| -------- | ------------------------------------ | --------------------- |
| PR情報   | `outputs/phase-13/pr-info.md`        | PR本文案              |
| 差分要約 | `outputs/phase-13/change-summary.md` | 変更一覧              |
| 証跡一覧 | `outputs/phase-13/evidence-links.md` | テスト/仕様更新リンク |

## 完了条件

- [ ] PR本文案が作成されている
- [ ] 差分要約が作成されている
- [ ] 証跡リンクが作成されている
- [ ] ユーザー指示なしでコミット/PRを作成しない方針が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 12
- **後続**: 完了

## サブタスク管理

- [ ] SubAgent-A/B/C 実施
- [ ] Lead 最終確認
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合

## 次のPhase

完了
