# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 3                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Task01-03 の責務分離と推奨実行順が妥当かを判定し、配下 task 仕様書を生成してよいかを決める。

## 実行タスク

- review gate: PASS / MINOR / MAJOR / CRITICAL を定義する
- simpler alternative: もっと少ない task 数で成立するか再確認する
- blocked 条件: commit / PR / no auto-send 破りを禁止条件として固定する

## 参照資料

| 資料名         | パス                      | 説明          |
| -------------- | ------------------------- | ------------- |
| Phase 1        | `phase-1-requirements.md` | 要件確認      |
| Phase 2        | `phase-2-design.md`       | task 分割確認 |
| UI/UX 正本     | `ui-ux-realization.md`    | UX 契約確認   |
| 監査マトリクス | `design-audit-matrix.md`  | 判断根拠確認  |

## 実行手順

### ステップ1: task 分割の妥当性を判定する

3 task で漏れなく重複なく covering できるかを確認する。

### ステップ2: root blocked 条件を固定する

PR / commit / auto-send / hidden share を禁止する。

### ステップ3: task 仕様書作成へ進む gate を出す

MINOR までを許容し、MAJOR 以上なら Phase 2 に戻す。

## 成果物

| 成果物           | パス                                      | 説明          |
| ---------------- | ----------------------------------------- | ------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定と根拠    |
| gate 決定        | `outputs/phase-3/gate-decision.md`        | task 作成可否 |

## 完了条件

- [ ] PASS / MINOR / MAJOR / CRITICAL の判定基準が明記されている
- [ ] blocked 条件に commit / PR / auto-send 禁止が含まれている
- [ ] 配下 task 仕様書へ進む条件が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次アクション

- [Task01: guided-execution-shell-foundation](./tasks/step-01-seq-task-01-guided-execution-shell-foundation/index.md)
