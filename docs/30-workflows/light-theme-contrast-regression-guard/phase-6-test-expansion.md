# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 6                                                  |
| Phase名    | テスト拡充                                         |
| ステータス | not_started                                        |
| 前提Phase  | Phase 5                                            |
| 後続Phase  | Phase 7                                            |

## 目的

guard の運用パターンを増やし false positive / false negative を減らす。

## 実行タスク

- タスク1: current/baseline 2 系統のテストを増やす
- タスク2: representative screen 追加時の拡張性を確認する

## 参照資料

| 参照資料             | パス                                                                                                | 説明     |
| -------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| Phase 4 テスト仕様   | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-4/test-specification.md`     | 拡張元   |
| Phase 5 実装まとめ   | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md` | 差分確認 |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                         | 品質基準 |

## 統合テスト連携

| 観点                   | 連携内容                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| Current/baseline split | current 差分 fail と baseline 記録の両系統を testcase 化する           |
| Extensibility          | 新しい representative screen を追加した時の validator 拡張点を明記する |
| Evidence reuse         | Phase 7 coverage 集計に使う testcase ID を固定する                     |

## 成果物

| 成果物             | パス                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| expanded-test-plan | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-6/expanded-test-plan.md` |

## 完了条件

- [ ] false positive / false negative 観点が追加されている
- [ ] 画面追加時の拡張性観点がある

## 次Phase

Phase 7: カバレッジ確認
