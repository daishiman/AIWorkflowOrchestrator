# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| Phase        | 8                                           |
| Phase名      | リファクタリング                            |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |
| 後続Phase    | Phase 9                                     |
| ステータス   | completed                                   |
| 作成日       | 2026-03-06                                  |
| 機能名       | task-056e-integration-gate-and-spec-sync    |
| 担当SubAgent | SubAgent-E2 / E4                            |

## 目的

命名ゆれ、重複判定、冗長な同期対象を削減し、統合ゲートと仕様同期台帳の可読性と一貫性を高める。

## 実行タスク

- 命名整備: 用語、ファイル名、判定ラベルの表記を統一する。
- 重複削除: 同一内容を指す同期対象や引き渡し条件を統合する。
- 一貫性確認: リファクタ後の内容がカバレッジ判定を下回らないことを確認する。

## 参照資料

| 参照資料               | パス                                        | 内容           |
| ---------------------- | ------------------------------------------- | -------------- |
| Phase 1要件            | `phase-1-requirements.md`                   | 用語基準       |
| Phase 2設計            | `phase-2-design.md`                         | 構造基準       |
| Phase 5実装            | `phase-5-implementation.md`                 | リファクタ対象 |
| Phase 6拡充            | `phase-6-test-expansion.md`                 | 回帰観点       |
| Phase 7判定            | `phase-7-coverage-check.md`                 | 下限基準       |
| 実装計画               | `outputs/phase-5/implementation-plan.md`    | Phase 5 成果物 |
| レビューゲート         | `outputs/phase-5/review-gate.md`            | Phase 5 成果物 |
| 仕様同期対象一覧       | `outputs/phase-5/spec-sync-targets.md`      | Phase 5 成果物 |
| カバレッジ目標レポート | `outputs/phase-7/coverage-target-report.md` | Phase 7 成果物 |
| カバレッジ判定結果     | `outputs/phase-7/coverage-gate-result.md`   | Phase 7 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ総論 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 関心分離の維持         |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 命名と契約境界の再利用 |
| タスク台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 用語一貫性の確認       |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の用語ドリフト対策 |

## 実行手順

### ステップ1: 命名差分の抽出

state、ipc、security、navigation、documentation の表記差分を一覧化する。

### ステップ2: 重複統合

同じ更新対象を複数行で持つ箇所を1行へ統合する。

### ステップ3: 一貫性再確認

Phase 7 のカバレッジ母集団を再照合し、削除し過ぎていないことを確認する。

## 統合テスト連携

| 観点           | 内容                                           |
| -------------- | ---------------------------------------------- |
| 用語整合       | 用語差分が0件になることを確認する              |
| 更新整合       | 同一対象の重複行が0件になることを確認する      |
| カバレッジ維持 | Phase 7 の母集団数が減っていないことを確認する |

## 成果物

| 成果物         | パス                                            | 内容                     |
| -------------- | ----------------------------------------------- | ------------------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`           | 整備方針                 |
| 一貫性チェック | `outputs/phase-8/contract-consistency-check.md` | 用語・構造差分の確認結果 |

## 完了条件

- [x] 用語差分が一覧化されている
- [x] 重複行の統合結果が記録されている
- [x] 判定ラベルの表記が統一されている
- [x] カバレッジ母集団数が維持されている
- [x] リファクタ後の一貫性確認結果が記録されている

## 次のPhase

Phase 9: 品質保証

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                 | 仕様参照先                                                                                     |
| -------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 用語整合       | 命名差分を除去するため適用               | `aiworkflow-requirements: architecture-overview.md`, `architecture-implementation-patterns.md` |
| 台帳整合       | 更新対象の重複を除去するため適用         | `aiworkflow-requirements: task-workflow.md`                                                    |
| 教訓反映       | 過去の再発パターンを再確認するため適用   | `aiworkflow-requirements: lessons-learned.md`                                                  |
| カバレッジ維持 | 母集団を減らしていないか確認するため適用 | `phase-7-coverage-check.md`                                                                    |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 命名差分の抽出
2. 重複統合
3. 一貫性再確認
4. カバレッジ維持の確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 命名差分と統合結果を成果物へ反映
- [x] 一貫性再確認結果を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 8
```
