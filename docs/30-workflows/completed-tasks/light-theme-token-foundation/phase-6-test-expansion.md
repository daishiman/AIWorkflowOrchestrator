# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| ステータス | completed                                 |
| 前提Phase  | Phase 5                                   |
| 後続Phase  | Phase 7                                   |

## 目的

token 実装後の light/dark/kanagawa 比較テストを補強する。

## 実行タスク

- タスク1: theme snapshot / computed style 観点を追加する
- タスク2: missing token fallback 非依存を検証する
- タスク3: representative component 連携テストを補強する

## 参照資料

| 参照資料             | パス                                                                                                       | 説明               |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト仕様   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-4/test-specification.md`     | 基本テストの拡張元 |
| Phase 5 実装まとめ   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/implementation-summary.md` | 実装差分の確認     |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                | 品質基準           |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容     |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

## 統合テスト連携

| 観点                      | 連携内容                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Cross-theme regression    | light/dark/kanagawa の比較ケースを追加する                                          |
| Representative components | Settings / Dashboard / Auth の代表 component を Phase 11 の前倒し観点として追加する |
| Evidence reuse            | Phase 7 の coverage 集計に使う testcase ID を固定する                               |

## 成果物

| 成果物             | パス                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| expanded-test-plan | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-6/expanded-test-plan.md` |

## 完了条件

- [x] 比較テストの追加内容と対象ケースが明記されている
- [x] fallback 非依存の検証観点がある
- [x] 後続 shared migration task の前提が明確である

## 次Phase

Phase 7: カバレッジ確認
