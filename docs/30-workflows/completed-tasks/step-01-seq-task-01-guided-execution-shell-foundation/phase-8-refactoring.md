# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| Phase名    | リファクタリング                               |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 5-7                                      |
| 後続Phase  | Phase 9（品質検証）                            |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

duplicate label、surface 固有 action、legacy wording を減らし、foundation を簡素化する。

## 実行タスク

- label 重複の整理
- action 重複の整理
- legacy wording の削減

## 参照資料

| 参照資料 | パス                        | 内容          |
| -------- | --------------------------- | ------------- |
| Phase 1  | `phase-1-requirements.md`   | 要件定義      |
| Phase 2  | `phase-2-design.md`         | 設計契約      |
| Phase 5  | `phase-5-implementation.md` | 実装計画      |
| Phase 6  | `phase-6-test-expansion.md` | 回帰拡張      |
| Phase 7  | `phase-7-coverage-check.md` | coverage 確認 |

## 実行手順

### ステップ1: label 重複を特定する

`openExecutionConsole` / `実行コンソール` / `terminal` が複数 surface で独自定義されていないかを確認する。

### ステップ2: action 重複を特定する

shared action に集約すべき surface 固有 handler を列挙する。

### ステップ3: legacy wording を特定する

front に残る `terminal` / `agent` 代替の残存箇所を列挙し、退避先を定義する。

## 統合テスト連携

refactoring 後の route / label / CTA integration が回帰していないことを、Phase 4-6 のテストで確認する。

## 成果物

| 成果物              | パス                                           | 説明               |
| ------------------- | ---------------------------------------------- | ------------------ |
| refactor 境界       | `outputs/phase-8/refactor-boundaries.md`       | どこまで整理するか |
| simplification 候補 | `outputs/phase-8/simplification-candidates.md` | 削減候補一覧       |

## 完了条件

- [ ] 共有化できる action が特定されている
- [ ] front から退避すべき wording が特定されている
- [ ] route / label の重複削減方針が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
