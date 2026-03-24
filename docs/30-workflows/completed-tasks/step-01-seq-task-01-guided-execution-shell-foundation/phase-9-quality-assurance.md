# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| Phase名    | 品質検証                                       |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 4-8                                      |
| 後続Phase  | Phase 10（最終レビュー）                       |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

用語、links、route 契約、accessibility の品質を横断的に確認する。

## 実行タスク

- wording QA
- route QA
- accessibility QA
- link / artifacts QA

## 参照資料

| 参照資料  | パス                                                                   | 内容        |
| --------- | ---------------------------------------------------------------------- | ----------- |
| Phase 5   | `phase-5-implementation.md`                                            | 実装計画    |
| Phase 8   | `phase-8-refactoring.md`                                               | 整理方針    |
| root pack | `../guided-execution-console-realization/phase-9-quality-assurance.md` | 親パック QA |

## 実行手順

### ステップ1: wording QA を実施する

front label が `実行コンソール` に統一されているかを文字列レベルで検査する。

### ステップ2: route QA を実施する

`ViewType` / `renderView` / `openExecutionConsole()` の所有者と呼び出し先が一致しているかを検査する。

### ステップ3: link / artifacts QA を実施する

各 Phase の成果物パスが `artifacts.json` の定義と一致しているかを突合する。

## 統合テスト連携

wording / route / accessibility の品質検証結果を Phase 10 の最終レビュー判定材料にする。

## 成果物

| 成果物            | パス                                   | 説明     |
| ----------------- | -------------------------------------- | -------- |
| quality checklist | `outputs/phase-9/quality-checklist.md` | QA 一覧  |
| risk register     | `outputs/phase-9/risk-register.md`     | 残リスク |

## 完了条件

- [ ] wording / route / accessibility の各観点が含まれている
- [ ] artifacts 名称が phase 本文と一致している
- [ ] 残リスクが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
