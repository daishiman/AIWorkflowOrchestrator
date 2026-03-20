# Phase 12: 未タスク検出レポート

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 検出結果: 7件（重複整理後）

以下の未タスクを `docs/30-workflows/unassigned-task/` に formalize した。
元々は簡潔形式（task-ut-fix-_）9件で記録されていたが、task-specification-creator フォーマット準拠の詳細形式（task-04-_）6件 + verify-all-specs 1件に統合・整理済み。

| 未タスクID                                  | 内容                                                                                            | 優先度 | 指示書                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| UT-FIX-SKILLANALYSIS-ARIA-LABEL-001/002/003 | SkillAnalysisView の「選択を適用」「全自動改善」「再試行」ボタンへ aria-label を付与（3件統合） | 中     | `docs/30-workflows/unassigned-task/task-04-skillanalysis-aria-labels.md`              |
| UT-FIX-SKILLIMPORT-ARIA-LABEL-001           | SkillImportDialog の import button へ aria-label を付与                                         | 中     | `docs/30-workflows/unassigned-task/task-04-skillimport-aria-label.md`                 |
| UT-FIX-APP-CONSOLE-LOG-001                  | `App.tsx` の auth 初期化 `console.log` を削除または debug guard 化                              | 中     | `docs/30-workflows/unassigned-task/task-04-app-console-log-cleanup.md`                |
| UT-FIX-APP-INLINE-SELECTOR-001              | `App.tsx` の `useAppStore(...)` 直接参照を selector hook に統一                                 | 中     | `docs/30-workflows/unassigned-task/task-04-app-inline-selector-refactor.md`           |
| UT-FIX-VIEWHISTORY-ACCUMULATION-001         | `viewHistory` の蓄積上限または重複圧縮を検討                                                    | 低     | `docs/30-workflows/unassigned-task/task-04-viewhistory-accumulation-limit.md`         |
| UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001           | `AgentView.cta.test.tsx` の async effect warning を `act()` で解消                              | 低     | `docs/30-workflows/unassigned-task/task-04-agentview-cta-act-wrap.md`                 |
| UT-FIX-VERIFY-ALL-SPECS-BLOCKED-PHASE-001   | `verify-all-specs` が Phase 13 `blocked` を `問題なし` と誤記録する点を是正                     | 中     | `docs/30-workflows/unassigned-task/task-ut-fix-verify-all-specs-blocked-phase-001.md` |

## 所見

- 9件とも blocker ではなく follow-up。
- Phase 11 実画面では機能不具合は検出されなかった。
- Phase 10 / Phase 11 の minor 系は formalize 済みのため、以後は backlog から追跡できる。
