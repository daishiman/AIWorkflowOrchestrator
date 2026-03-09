# 未タスク検出レポート - TASK-10A-G

## メタ情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | TASK-10A-G      |
| Phase    | 12              |
| 検出日   | 2026-03-09      |
| 検出件数 | 1件（配置是正） |

---

## 検出結果: 新規課題0件 + 配置是正1件

今回の再監査では、当初レポートに残っていた以下の候補を精査した。機能追加としての新規未タスクは 0 件だったが、既存 open backlog 1 件は Phase 12 再監査時の正規化後、workflow 完了に伴う archive 配置へ揃え直す必要があったため、最終的に当 workflow 配下 `unassigned-task/` へ同梱した。

| 候補                                           | 判定                | 理由                                                                                                                                 |
| ---------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `skillHandlers.ts` 他ハンドラへの3層展開       | 既存 backlog へ吸収 | 汎用的な coverage 横展開は既存の粒度改善系 backlog で管理する方が重複がない                                                          |
| schedule/docs/chain ハンドラ coverage 向上     | 既存 backlog へ吸収 | feature 固有ではなく handler 横断の改善課題                                                                                          |
| SkillAnalysisView / SkillCreateWizard E2E 追加 | 既存 backlog へ吸収 | 画面導線の E2E は既存の screenshot / E2E 強化タスク群で継続管理済み                                                                  |
| open backlog の配置先                          | 是正                | Phase 12 完了済み workflow は関連未タスクを `completed-tasks/<task>/unassigned-task/` へ同梱するため、UT-10A-G を archive 配置へ整理 |

## 継続管理する既存 open backlog

| タスクID                                  | 概要                                            | 状態                                | 参照                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION | SkillEditor 残存直接IPC呼び出し6箇所のStore移行 | archive canonical path へ再配置済み | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/unassigned-task/task-10a-g-skill-editor-ipc-store-migration.md` |

## 今回差分で解消した項目

| 項目                                                                  | 対応                                                                                                                  |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `spec-update-summary.md` の「実行予定」残存                           | 実更新結果へ置換済み                                                                                                  |
| `index.md` の Phase 状態未同期                                        | Phase 1-12 完了 / Phase 13 保留へ更新済み                                                                             |
| `capture-skill-management-panel-screenshots.mjs` の analyze mock 欠落 | mock 追加後に分析ビュー証跡を再取得済み                                                                               |
| UT-10A-G の配置先ドリフト                                             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/unassigned-task/` へ整理し、台帳参照を更新済み |

結論: **TASK-10A-G 由来の新規未タスクは検出されなかった。** ただし、既存 open backlog 1 件は workflow 完了に合わせて archive canonical path へ再配置した。
