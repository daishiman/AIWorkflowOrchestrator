# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 7                                         |
| Phase名    | カバレッジ確認                            |
| ステータス | completed                                 |
| 前提Phase  | Phase 6                                   |
| 後続Phase  | Phase 8                                   |

## 目的

token 契約変更に対するテスト網羅を確認する。

## 実行タスク

- タスク1: token 定義、参照、fallback 廃止観点の coverage を確認する
- タスク2: 不足テストがあれば Phase 6 へ戻す

## 参照資料

| 参照資料             | パス                                                                                                   | 説明              |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ----------------- |
| Phase 4 テスト仕様   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-4/test-specification.md` | coverage 基準     |
| Phase 5 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/`                      | 実装差分          |
| Phase 6 拡張計画     | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-6/expanded-test-plan.md` | 拡張観点          |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                            | coverage 品質基準 |

## 統合テスト連携

| 観点                    | 連携内容                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Coverage gate           | Phase 8 へ進む前に token / fallback / representative screen 観点の不足有無を確定する |
| Shared migration bridge | coverage の blind spot を後続 task の着手条件へ反映する                              |
| Evidence                | `coverage-report.md` を Phase 10 最終レビューの入力にする                            |

## 成果物

| 成果物          | パス                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------- |
| coverage-report | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-7/coverage-report.md` |

## 完了条件

- [x] token 関連の不足観点が列挙されている
- [x] 継続可能な coverage 判定が出ている

## 次Phase

Phase 8: リファクタリング
