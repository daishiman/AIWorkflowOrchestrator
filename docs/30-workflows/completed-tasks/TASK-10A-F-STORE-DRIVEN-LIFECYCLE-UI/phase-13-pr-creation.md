# Phase 13: 完了・PR準備

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 13                                         |
| 機能名 | task-10a-f-store-driven-lifecycle-ui       |
| 作成日 | 2026-03-09                                 |
| 制約   | コミット / PR はユーザー許可前に実行しない |

## 目的

成果物確認とユーザー引き継ぎを行い、コミット / PR は未実行のまま止める。

## 実行タスク

- 成果物確認: Phase 1-12 の成果物を確認する
- 台帳確認: `artifacts.json` を確認する
- 変更サマリー作成: ユーザー引き継ぎ用の要点をまとめる
- 制約維持: コミット / PR 未実行を維持する

## 参照資料

| 資料名           | パス                                                                       | 説明           |
| ---------------- | -------------------------------------------------------------------------- | -------------- |
| Phase 2          | `phase-2-design.md`                                                        | 設計要約       |
| Phase 5          | `phase-5-implementation.md`                                                | 実装確認結果   |
| Phase 6          | `phase-6-test-expansion.md`                                                | 再発観点       |
| Phase 7          | `phase-7-coverage-check.md`                                                | カバレッジ結果 |
| Phase 8          | `phase-8-refactoring.md`                                                   | 責務整理結果   |
| Phase 9          | `phase-9-quality-assurance.md`                                             | 品質ゲート     |
| Phase 10         | `phase-10-final-review.md`                                                 | 最終判定       |
| Phase 11         | `phase-11-manual-test.md`                                                  | UI証跡         |
| Phase 12         | `phase-12-documentation.md`                                                | 最終成果物     |
| execute workflow | `.claude/skills/task-specification-creator/references/execute-workflow.md` | PRの扱い       |

## 実行手順

### ステップ1: 成果物確認

- Phase 1-12 の成果物存在を確認する

### ステップ2: 変更サマリー作成

- スコープ補正
- aiworkflow 入口改善
- コミット / PR 未実行

### ステップ3: ユーザー引き継ぎ

- 実行していないことを明記する

## 統合テスト連携

- Phase 1-12 の成果物整合だけを確認し、PR 作成フローには入らない

## 多角的チェック観点

| 観点         | 確認内容                                   |
| ------------ | ------------------------------------------ |
| 制約遵守     | コミット / PR を実行していないか           |
| 成果物完全性 | workflow と skill 改善の両方が残っているか |

## 成果物

| 成果物       | パス                                                                                                           | 説明             |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ---------------- |
| 完了レポート | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-13/completion-report.md` | 引き継ぎレポート |

## 完了条件

- [ ] Phase 1-12 成果物確認手順がある
- [ ] コミット / PR 未実行が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 成果物確認
2. サマリー作成
3. 未実行確認
4. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
