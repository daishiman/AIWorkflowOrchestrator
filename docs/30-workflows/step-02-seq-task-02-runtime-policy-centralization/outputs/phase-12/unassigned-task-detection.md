# Phase 12: 未タスク検出レポート

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 作成日   | 2026-03-21                                 |
| 検出件数 | 4件                                        |

---

## 検出した未タスク

### UT-1: implementation closure タスク

| 項目       | 値                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001                                                                        |
| 優先度     | 高                                                                                                                                       |
| 概要       | current code に残る centralization 未完了箇所を解消し、shared contract と test coverage まで閉じる                                       |
| 根拠       | 最終再監査で `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` / `RuntimeSkillCreatorFacade.ts` / shared transport の gap を確認 |
| ステータス | 指示書 + backlog + 関連仕様書リンク登録済み                                                                                              |

**3ステップ完了確認:**

1. 指示書: `docs/30-workflows/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` に作成済み
2. backlog: `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録済み
3. 関連仕様書リンク: `workflow-ai-runtime-execution-responsibility-realignment.md` / `task-workflow-completed.md` / `lessons-learned-phase12-workflow-lifecycle.md` に追加済み

---

### UT-2: AI_CHECK_CONNECTION cleanup タスク（M-3 対処）

| 項目       | 値                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------ |
| タスクID   | UT-CLEANUP-AI-CHECK-CONNECTION-001                                                               |
| 優先度     | 低                                                                                               |
| 概要       | Step 03-09 の全 surface 移行完了後に AI_CHECK_CONNECTION ハンドラーを aiHandlers.ts から削除する |
| トリガー   | `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/` の結果が 0 件                        |
| 関連       | Phase 3 MINOR 指摘 M-3、contract-matrix.md § 3                                                   |
| ステータス | 指示書 + backlog + 関連仕様書リンク登録済み                                                      |

**3ステップ完了確認:**

1. 指示書: `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md` に作成済み
2. backlog: `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録済み
3. 関連仕様書リンク: `workflow-ai-runtime-execution-responsibility-realignment.md` / `lessons-learned-phase12-workflow-lifecycle.md` に追加済み

---

### UT-3: RuntimeResolver deprecated 削除タスク

| 項目       | 値                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| タスクID   | UT-CLEANUP-RUNTIME-RESOLVER-001                                                     |
| 優先度     | 低                                                                                  |
| 概要       | 全 surface の IRuntimePolicyResolver 移行完了後に RuntimeResolver.ts を削除する     |
| トリガー   | `grep -rn "RuntimeResolver" apps/desktop/src/` の結果が RuntimeResolver.ts 本体のみ |
| 関連       | DD-1、contract-matrix.md § 5                                                        |
| ステータス | 指示書 + backlog + 関連仕様書リンク登録済み                                         |

**3ステップ完了確認:**

1. 指示書: `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md` に作成済み
2. backlog: `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録済み
3. 関連仕様書リンク: `workflow-ai-runtime-execution-responsibility-realignment.md` / `lessons-learned-phase12-workflow-lifecycle.md` に追加済み

---

### UT-4: sanitizeForRenderer() 配置ファイル確定タスク

| 項目       | 値                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| タスクID   | UT-DESIGN-SANITIZE-PLACEMENT-001                                                                       |
| 優先度     | 中                                                                                                     |
| 概要       | sanitizeForRenderer() を IPC ハンドラー内に直接記述するか、共通 utility として独立配置するかを確定する |
| 関連       | Phase 5 sanitize-type-addendum.md、Phase 11 discovered-issues.md D-1                                   |
| ステータス | 指示書 + backlog + 関連仕様書リンク登録済み                                                            |

**3ステップ完了確認:**

1. 指示書: `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md` に作成済み
2. backlog: `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録済み
3. 関連仕様書リンク: `workflow-ai-runtime-execution-responsibility-realignment.md` / `lessons-learned-phase12-workflow-lifecycle.md` に追加済み
