# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 8                                                    |
| Phase名    | リファクタリング                                     |
| ステータス | completed                                            |

## 目的

guard 追加で増えた分岐を concern ごとに読みやすく整理し、次の preview/search UI へ横展開しやすくする。

## 実行内容

- hook / component に埋まっていた rule を utility へ抽出した
- preview error surface を typed object 化し、heading / status text を helper で再利用した
- stale preview を防ぐ state reset 順序へ整理した

## 実行タスク

- タスク1: search rule を hook から utility へ抽出する
- タスク2: preview resilience を helper に集約する
- タスク3: naming / placement を統一する

## 参照資料

- `outputs/phase-7/coverage-gap-list.md`
- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-2/resilience-guard-design.md`
- `outputs/phase-5/implementation-plan.md`
- `outputs/phase-6/expanded-test-plan.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`

## 統合テスト連携

- utility 抽出後も既存 hook / component test が green のまま維持されることを確認した
- naming 変更は typed error contract と test file へ同時に反映した

## 成果物

| 成果物        | パス                               |
| ------------- | ---------------------------------- |
| refactor-plan | `outputs/phase-8/refactor-plan.md` |
| naming-rules  | `outputs/phase-8/naming-rules.md`  |

## 完了条件

- [x] 4 concern の配置と naming を整理した
- [x] UI と test の責務境界を読みやすくした
