# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 6                                                    |
| Phase名    | テスト拡充                                           |
| ステータス | completed                                            |

## 目的

Phase 5 の実装を境界値と recoverable error まで固定し、04C 由来の再発パターンを潰す。

## 実行内容

- search no-match / deterministic sort / empty state を追加した
- timeout retry exhausted / read failure detail / parse fallback / crash reset を追加した
- docs validation は validator 実行計画として整理した

## 実行タスク

- タスク1: search の no-match / deterministic sort / empty state を追加する
- タスク2: preview retry exhausted / parse fallback / crash reset を追加する
- タスク3: docs validation command と capture fallback を整理する

## 参照資料

- `outputs/phase-5/implementation-plan.md`
- `outputs/phase-4/test-case-matrix.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`

## 統合テスト連携

- same-score と no-match を unit / hook の両方で固定した
- timeout の integration assertion を `WorkspaceView.test.tsx` に残した

## 成果物

| 成果物               | パス                                      |
| -------------------- | ----------------------------------------- |
| expanded-test-plan   | `outputs/phase-6/expanded-test-plan.md`   |
| docs-validation-plan | `outputs/phase-6/docs-validation-plan.md` |

## 完了条件

- [x] Phase 4 で定義した testcase を edge case まで拡張した
- [x] Phase 12 検証コマンドを固定した
