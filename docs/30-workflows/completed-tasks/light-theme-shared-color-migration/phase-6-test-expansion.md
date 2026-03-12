# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 6                                               |
| Phase名    | テスト拡充                                      |
| ステータス | completed                                       |
| 前提Phase  | Phase 5                                         |
| 後続Phase  | Phase 7                                         |

## 目的

batch 間回帰を防ぐ追加テストを定義する。

## 実行タスク

- タスク1: Settings / Dashboard / Auth / WorkspaceSearch の統合観点を追加する
- タスク2: selector / profile 系の副作用検証を追加する

## 参照資料

| 参照資料             | パス                                                                                                             | 説明           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 4 テスト仕様   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-4/test-specification.md`     | 拡張元         |
| Phase 5 実装まとめ   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/implementation-summary.md` | 差分確認       |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                      | 品質基準       |
| batch-test-matrix    | `outputs/phase-4/batch-test-matrix.md`                                                                           | Phase 4 成果物 |

## 統合テスト連携

| 観点                   | 連携内容                                                           |
| ---------------------- | ------------------------------------------------------------------ |
| Cross-batch regression | batch 間で影響する shell / selector / panel の連携ケースを追加する |
| Accessibility bridge   | light mode の文字可読性と境界線視認性を test ID と結び付ける       |
| Evidence reuse         | Phase 7 coverage に使う testcase ID を固定する                     |

## 成果物

| 成果物             | パス                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| expanded-test-plan | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/expanded-test-plan.md` |

## 完了条件

- [x] batch 間回帰観点が追加されている
- [x] representative flow の追加テスト観点がある

## 次Phase

Phase 7: カバレッジ確認
