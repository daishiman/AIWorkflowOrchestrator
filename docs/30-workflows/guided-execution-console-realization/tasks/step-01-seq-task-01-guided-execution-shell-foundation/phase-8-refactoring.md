# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| Phase名    | リファクタリング                               |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 5-7                                      |
| 後続Phase  | Phase 9（品質検証）                            |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

duplicate label、surface 固有 action、legacy wording を減らし、foundation を簡素化する。

## 実行タスク

- label 重複の整理
- action 重複の整理
- legacy wording の削減

## 参照資料

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 実装計画: `phase-5-implementation.md`
- task 回帰拡張: `phase-6-test-expansion.md`
- task coverage: `phase-7-coverage-check.md`

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
