# Phase 13: PR作成

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| カテゴリ   | 完了                       |
| 優先度     | medium                     |
| ステータス | pending                    |
| 前提Phase  | Phase 12                   |
| 後続Phase  | なし                       |

## 目的

変更内容、検証結果、spec 同期結果、未タスク有無をまとめ、レビュー可能な PR 情報を作成する。

## 実行タスク

- PR 情報整理: 背景、変更点、検証結果、影響範囲をまとめる
- 添付情報整理: screenshot、coverage、spec update の参照先をまとめる
- 未タスク整理: 残課題がある場合は unassigned-task をリンクする

## 参照資料

| 参照資料                | パス                                            | 説明            |
| ----------------------- | ----------------------------------------------- | --------------- |
| コンポーネント設計      | `outputs/phase-2/component-design.md`           | Phase 2 成果物  |
| 実装サマリー            | `outputs/phase-5/implementation-summary.md`     | Phase 5 成果物  |
| 統合テスト結果          | `outputs/phase-6/integration-test.md`           | Phase 6 成果物  |
| カバレッジレポート      | `outputs/phase-7/coverage-report.md`            | Phase 7 成果物  |
| リファクタ記録          | `outputs/phase-8/refactoring-log.md`            | Phase 8 成果物  |
| 品質レポート            | `outputs/phase-9/quality-report.md`             | Phase 9 成果物  |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`        | Phase 11 成果物 |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`      | Phase 12 成果物 |
| documentation changelog | `outputs/phase-12/documentation-changelog.md`   | Phase 12 成果物 |
| 未タスク検出            | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物 |
| 最終レビュー結果        | `outputs/phase-10/final-review-result.md`       | 判定の根拠      |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容             |
| --------------- | ---------------------------------------------------------------------- | ---------------- |
| task workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了記録の正本   |
| lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | follow-up の正本 |

## 実行手順

### ステップ1: PR 情報を整理する

| 項目      | 内容                                  |
| --------- | ------------------------------------- |
| Summary   | 04B で追加した体験と接続範囲          |
| Testing   | auto / manual / screenshot / coverage |
| Spec Sync | 更新した references と workflow       |
| Follow-up | 未タスクがあればリンク                |

### ステップ2: 実施条件を明記する

本 workflow 作成時点では PR 作成を実行しない。実際の PR 作成はユーザーの明示指示後に行う。

## 成果物

| 成果物  | パス                          | 説明          |
| ------- | ----------------------------- | ------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR 本文下書き |

## 多角的チェック観点

| 観点             | このPhaseでの確認内容                                 | 仕様参照先                                                                  |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| プロセス思考     | 実装、検証、spec sync をレビュー可能な流れにまとめる  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        |
| トレードオン思考 | 未タスク化とその場修正の境界を明記する                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      |
| 価値提案思考     | PR 本文が reviewer に最短で価値を伝える構造か確認する | `.claude/skills/task-specification-creator/references/quality-standards.md` |

## 完了条件

- [ ] PR 本文に含める項目を定義している
- [ ] testing / spec sync / follow-up の参照先を定義している
- [ ] PR 作成をユーザー明示指示後に限定している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. PR summary 整理
2. testing / evidence 参照整理
3. follow-up / unassigned 整理
4. PR 実施条件明記
5. 完了条件確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-13/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

なし。Phase 13 完了で workflow 完了。
