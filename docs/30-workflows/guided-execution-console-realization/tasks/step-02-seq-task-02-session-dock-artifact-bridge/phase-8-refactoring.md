# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 5-7                                 |
| 後続Phase  | Phase 9（品質検証）                       |
| ステータス | not_started                               |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session surface の重複表示や情報過多を削減し、artifact-first を維持する。

## 実行タスク

- transcript と artifact の重複整理
- share rail と provenance の簡素化
- state 表示の整理

## 参照資料

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 実装計画: `phase-5-implementation.md`
- task 回帰拡張: `phase-6-test-expansion.md`
- task coverage: `phase-7-coverage-check.md`

## 成果物

| 成果物              | パス                                           | 説明     |
| ------------------- | ---------------------------------------------- | -------- |
| refactor 境界       | `outputs/phase-8/refactor-boundaries.md`       | 整理範囲 |
| simplification 候補 | `outputs/phase-8/simplification-candidates.md` | 削減候補 |

## 完了条件

- [ ] transcript と artifact の役割分離が整理されている
- [ ] share rail の情報過多削減方針がある
- [ ] state 表示の重複削減方針がある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
