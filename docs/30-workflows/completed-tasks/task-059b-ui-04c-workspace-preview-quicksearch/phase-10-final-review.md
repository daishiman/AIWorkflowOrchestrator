# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 10                                             |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-D                                     |

## 目的

Phase 1-9 の成果を最終判定し、手動テストへ進めるかを決定する。重大課題が残る場合は戻り先を明確にする。

## 実行タスク

- 総合レビュー: 要件、設計、実装、テスト、品質の整合を確認する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を判定する
- 戻り先決定: 判定ごとの戻り Phase を記録する
- 手動テスト入力整理: Phase 11 の実施条件を整理する

## 参照資料

| 参照資料         | パス                                                                                                       | 説明           |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物   | `outputs/phase-1/acceptance-criteria.md`                                                                   | 要件受入条件   |
| Phase 2 成果物   | `outputs/phase-2/architecture-design.md`                                                                   | 設計境界       |
| Phase 5 成果物   | `outputs/phase-5/implementation-summary.md`                                                                | 実装結果       |
| Phase 9 成果物   | `outputs/phase-9/quality-report.md`                                                                        | 品質判定       |
| Phase仕様全体    | `phase-1-requirements.md` 〜 `phase-9-quality-assurance.md`                                                | 総合判定材料   |
| 04A 最終レビュー | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-10-final-review.md` | 連携リスク確認 |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                        | 本Phaseで使う理由      |
| ------------- | --------------------------------------------------------------------------- | ---------------------- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | ゲート記録の同期先確認 |
| lessons       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 再発防止観点確認       |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 最終判定基準確認       |

## 実行手順

### ステップ1: 判定テーブル

| 判定     | 条件                           | 戻り先                 |
| -------- | ------------------------------ | ---------------------- |
| PASS     | blocking issue 0 件            | Phase 11               |
| MINOR    | 軽微修正のみ                   | Phase 11               |
| MAJOR    | 仕様逸脱または品質未達         | Phase 5 または Phase 6 |
| CRITICAL | セキュリティ欠陥または契約破綻 | Phase 1                |

### ステップ2: 重点確認項目

- 04A 連携で panel 表示が崩れない
- `file:read` 契約から外れていない
- sanitize/CSP の防御が維持される
- Cmd+P が既存ショートカットと衝突しない

## 統合テスト連携

| 観点         | Phase 11 へ引き継ぐ内容 |
| ------------ | ----------------------- |
| 手動検証対象 | screenshot ケース一覧   |
| 既知課題     | open-items の検証対象   |
| 戻り条件     | fail 時の戻り先         |

## 成果物

| 成果物           | パス                                      | 説明          |
| ---------------- | ----------------------------------------- | ------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果      |
| 戻り先マップ     | `outputs/phase-10/rollback-map.md`        | 戻り条件      |
| 手動検証入力     | `outputs/phase-10/manual-test-input.md`   | Phase 11 入力 |

## 完了条件

- [ ] PASS/MINOR/MAJOR/CRITICAL の判定表を定義している
- [ ] 重点確認項目を定義している
- [ ] 戻り先を定義している
- [ ] Phase 11 入力成果物を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 総合レビュー
2. 判定決定
3. 戻り先記録
4. 手動検証入力整理
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-10/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 11: 手動テスト検証](./phase-11-manual-test.md)
