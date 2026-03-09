# Phase 3: 設計レビューゲート

## メタ情報

| 項目    | 値                                   |
| ------- | ------------------------------------ |
| Phase   | 3                                    |
| 機能名  | task-10a-f-store-driven-lifecycle-ui |
| 作成日  | 2026-03-09                           |
| 前Phase | 2                                    |
| 次Phase | 4                                    |

## 目的

要件・設計・正本仕様の整合をレビューし、TASK-10A-F の責務定義が正しいことを確認する。

## 実行タスク

- 要件整合レビュー: `useSkillAnalysis` 中心の要件定義を確認する
- 設計妥当性レビュー: Store / local state 境界の妥当性を確認する
- スコープ妥当性レビュー: `SkillImportDialog` 混入がないか確認する
- 判定記録: PASS / MINOR / MAJOR と戻り先を決定する

## 参照資料

| 資料名   | パス                                                                           | 説明             |
| -------- | ------------------------------------------------------------------------------ | ---------------- |
| Phase 1  | `phase-1-requirements.md`                                                      | 要件             |
| Phase 2  | `phase-2-design.md`                                                            | 設計             |
| 判定基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS/MINOR/MAJOR |
| 正本台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | TASK-10A-F 正本  |

## 実行手順

### ステップ1: 要件との整合性確認

- `useSkillAnalysis` 中心で定義されているか
- `SkillImportDialog` を誤って含めていないか

### ステップ2: 設計妥当性確認

- Store / local state 境界が妥当か
- direct IPC → Store action 方針が妥当か

### ステップ3: 判定

| 判定  | 条件                       | 対応                |
| ----- | -------------------------- | ------------------- |
| PASS  | 不整合なし                 | Phase 4 へ進行      |
| MINOR | 文言不足のみ               | 修文後に Phase 4    |
| MAJOR | スコープや責務が誤っている | Phase 1 or 2 へ戻る |

## 統合テスト連携

- Phase 4 へ渡す観点が hook / view / wizard / grep の4系統で揃っていることを確認する

## 多角的チェック観点

| 観点           | 確認内容                                 |
| -------------- | ---------------------------------------- |
| 要件           | スコープ外機能が混入していないか         |
| アーキテクチャ | 責務分離が成立しているか                 |
| UI/UX          | 画面責務を hook に押し込み過ぎていないか |
| 戻り先         | 問題種別に応じた戻り先が妥当か           |

## 成果物

| 成果物       | パス                                                                                                             | 説明     |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | -------- |
| レビュー結果 | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-3/design-review-result.md` | 判定結果 |

## 完了条件

- [ ] PASS/MINOR/MAJOR の判定基準が適用されている
- [ ] `SkillImportDialog` 誤記載の排除が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. Phase 1確認
2. Phase 2確認
3. 正本仕様確認
4. 判定記録
5. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 4: テスト作成
