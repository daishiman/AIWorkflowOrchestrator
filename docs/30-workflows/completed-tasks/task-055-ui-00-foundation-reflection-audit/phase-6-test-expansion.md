# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 6                                          |
| Phase名   | テスト拡充                                 |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 5                                    |
| 後続Phase | Phase 7                                    |

## 目的

Phase 5 の監査を拡張し、後続画面仕様全体に対する反映監査の漏れを排除する。

## 実行タスク

- 対象拡張: `task-057`〜`task-061` 全仕様へ監査範囲を拡張する。
- 観点拡張: WCAG/ARIA、レスポンシブ、エラー表示、UX文言反映を追加監査する。
- 回帰監査: Phase 5 の判定結果と差分を比較し判定変動を記録する。

## 参照資料

| 参照資料               | パス                                                                                                                                         | 内容           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 5 反映マトリクス | `outputs/phase-5/reflection-matrix.md`                                                                                                       | 拡張前結果     |
| Phase 5 リンクマップ   | `outputs/phase-5/section-link-map.md`                                                                                                        | 突合元         |
| Phase 5 指摘ログ       | `outputs/phase-5/finding-log.md`                                                                                                             | 既知課題       |
| 監査対象仕様           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058b-ui-04a-workspace-layout-filebrowser.md` | 拡張対象       |
| 監査対象仕様           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058e-ui-08-notification-center.md`           | 拡張対象       |
| 監査テストケース       | `outputs/phase-4/audit-test-cases.md`                                                                                                        | Phase 4 成果物 |
| Redチェック計画        | `outputs/phase-4/red-check-plan.md`                                                                                                          | Phase 4 成果物 |
| 検証コマンド表         | `outputs/phase-4/validation-command-sheet.md`                                                                                                | Phase 4 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                           | このPhaseでの適用観点 |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------- |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | WCAG/HIG反映確認      |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | ナビ反映確認          |
| アクセシビリティテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | a11y観点検証          |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 監査密度の確認        |

## 統合テスト連携

| 連携観点 | 実施内容                                      | 出力先                                     |
| -------- | --------------------------------------------- | ------------------------------------------ |
| 範囲拡張 | `task-057`〜`task-061` の反映監査を追加する。 | `outputs/phase-6/expanded-audit-report.md` |
| a11y拡張 | WCAG/ARIA/キーボード操作の判定を追加する。    | `outputs/phase-6/regression-checklist.md`  |
| 差分追跡 | Phase 5 との差分理由を課題ID単位で記録する。  | `outputs/phase-6/followup-finding-log.md`  |

## 実行順序（直列/並列）

| 作業           | 実行方式 | 理由                         |
| -------------- | -------- | ---------------------------- |
| 拡張対象の固定 | 直列     | 対象外混入を防ぐため         |
| 仕様別監査     | 並列     | 各仕様は独立で監査できるため |
| 回帰差分統合   | 直列     | 判定変動の理由を統一するため |

## SubAgent Team分担

| SubAgent                      | 関心ごと                                 | 担当成果物                                 |
| ----------------------------- | ---------------------------------------- | ------------------------------------------ |
| SubAgent-EXPAND-NAV           | `task-057-ui-02-global-nav-core.md` 監査 | `outputs/phase-6/expanded-audit-report.md` |
| SubAgent-EXPAND-WORKSPACE     | `task-058b/059a/059b` 監査               | `outputs/phase-6/expanded-audit-report.md` |
| SubAgent-EXPAND-SKILL-HISTORY | `task-030/058c` 監査                     | `outputs/phase-6/expanded-audit-report.md` |
| SubAgent-EXPAND-DNO           | `task-058d/058e/061` 監査                | `outputs/phase-6/expanded-audit-report.md` |
| SubAgent-EXPAND-A11Y          | 横断a11y監査（WCAG/ARIA/Keyboard）       | `outputs/phase-6/regression-checklist.md`  |
| SubAgent-EXPAND-INTEGRATOR    | 判定差分統合・優先度確定                 | `outputs/phase-6/followup-finding-log.md`  |

## 仕様書別SubAgent分担（関心ごとの分離）

| 対象仕様書グループ                  | 専任SubAgent                  | 実行方式 | 統合先                     |
| ----------------------------------- | ----------------------------- | -------- | -------------------------- |
| `task-057-ui-02-global-nav-core.md` | SubAgent-EXPAND-NAV           | 並列     | `expanded-audit-report.md` |
| `task-058b/059a/059b`               | SubAgent-EXPAND-WORKSPACE     | 並列     | `expanded-audit-report.md` |
| `task-030/058c`                     | SubAgent-EXPAND-SKILL-HISTORY | 並列     | `expanded-audit-report.md` |
| `task-058d/058e/061`                | SubAgent-EXPAND-DNO           | 並列     | `expanded-audit-report.md` |
| 横断a11y観点                        | SubAgent-EXPAND-A11Y          | 並列     | `regression-checklist.md`  |
| 差分統合・課題優先度                | SubAgent-EXPAND-INTEGRATOR    | 直列     | `followup-finding-log.md`  |

## 成果物

| 成果物             | パス                                       | 内容         |
| ------------------ | ------------------------------------------ | ------------ |
| 拡張監査レポート   | `outputs/phase-6/expanded-audit-report.md` | 拡張監査結果 |
| 回帰チェックリスト | `outputs/phase-6/regression-checklist.md`  | 変動点確認   |
| 追加指摘ログ       | `outputs/phase-6/followup-finding-log.md`  | 新規指摘     |

## 完了条件

- [x] 拡張対象仕様が全件監査されている。
- [x] a11y観点の判定が記録されている。
- [x] Phase 5 との差分理由が記録されている。
- [x] 新規指摘の優先度が記録されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 拡張対象仕様を一覧化する。
2. 仕様書グループごとに専任SubAgentを割り当てて並列監査する。
3. 差分理由を統合SubAgentで集約し重複を削除する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 7 の集計項目を確定した。

## 依存関係

- 前提: Phase 5
- 後続: Phase 7

## 次のPhase

- Phase 7: テストカバレッジ確認
