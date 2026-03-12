# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 8                                                                        |
| Phase名    | リファクタリング                                                         |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 7                                                                  |
| 後続Phase  | Phase 9                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

guard と manifest の責務を整理し、再利用しやすい構造へ寄せる。大きな一枚岩のスクリプトや、Phase 12 sync と drift detection の混在を避ける。

## 実行タスク

- SubAgent-A: manifest 定義と実行ロジックの責務分離を見直す
- SubAgent-B: path/status/mirror の検出関数境界を見直す
- SubAgent-C: Phase 12 sync 用の更新ロジックと validator ロジックの結合を減らす
- Lead: リファクタ後も Phase 7 coverage を落とさない形にまとめる

## 参照資料

| 参照資料       | パス                                           | 説明                   |
| -------------- | ---------------------------------------------- | ---------------------- |
| Phase 1成果物  | `outputs/phase-1/requirements-definition.md`   | 元の受入基準と責務境界 |
| Phase 2成果物  | `outputs/phase-2/concern-boundary-map.md`      | 設計上の責務境界       |
| Phase 5        | `phase-5-implementation.md`                    | 実装内容               |
| Phase 6成果物  | `outputs/phase-6/test-expansion-result.md`     | variation 検証結果     |
| Phase 7        | `phase-7-coverage-check.md`                    | coverage 制約          |
| カバレッジ報告 | `outputs/phase-7/coverage-report.md`           | 未退行確認             |
| 要件追跡表     | `outputs/phase-7/requirements-traceability.md` | 責務維持の確認         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                             | パス                                                                                        | 内容                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 再利用できる guard 構造        |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | cross-cutting concern の置き場 |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去 drift 再発の抑止          |

## 統合テスト連携

- Phase 7 coverage を維持したまま責務分離を進める
- リファクタ後に path/status/mirror の各ケースが同じ結果になることを確認する
- Phase 9 で品質評価しやすい構造に寄せる

## 成果物

| 成果物         | パス                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| リファクタログ | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-8/refactoring-log.md`    |
| 責務分割図     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-8/responsibility-map.md` |
| 回帰確認       | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-8/regression-check.md`   |

## 完了条件

- [x] manifest、guard、Phase 12 sync の責務が分離されている
- [x] Phase 7 coverage を落としていない
- [x] 回帰確認で drift class の挙動が変わっていない
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 9: 品質検証へ進む。
