# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 7                                              |
| Phase名    | カバレッジ確認                                 |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 4-6                                      |
| 後続Phase  | Phase 8（リファクタリング）                    |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

AC-1〜AC-4、4 surface、negative path の coverage を可視化する。

## 実行タスク

- AC coverage
- surface coverage
- route coverage
- negative path coverage

## 参照資料

| 参照資料  | パス                                                                | 内容              |
| --------- | ------------------------------------------------------------------- | ----------------- |
| Phase 5   | `phase-5-implementation.md`                                         | 実装計画          |
| Phase 6   | `phase-6-test-expansion.md`                                         | 回帰拡張          |
| root pack | `../guided-execution-console-realization/phase-7-coverage-check.md` | 親パック coverage |

## 実行手順

### ステップ1: AC coverage を集計する

AC-1〜AC-4 それぞれに対応するテストケースを列挙し、coverage 有無を判定する。

### ステップ2: surface coverage を集計する

App Shell / Chat / Workspace / Skill Creator の 4 surface すべてにテストがあるかを判定する。

### ステップ3: negative path coverage を確認する

no-op / agent 代替 / fallback の禁止ケースが Phase 4-6 のテストに含まれているかを判定する。

## 統合テスト連携

route / label / CTA / fallback 禁止の 4 軸で gate を作る。

## 成果物

| 成果物           | パス                                  | 説明          |
| ---------------- | ------------------------------------- | ------------- |
| coverage targets | `outputs/phase-7/coverage-targets.md` | coverage 目標 |
| integration gate | `outputs/phase-7/integration-gate.md` | gate 判定表   |

## 完了条件

- [ ] AC-1〜AC-4 の coverage が可視化されている
- [ ] App Shell / Chat / Workspace / Skill Creator が網羅されている
- [ ] negative path が coverage 対象になっている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
