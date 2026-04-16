# System Spec Update Summary: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## 結論

今回の変更は renderer-local helper と badge removal の整理であり、
shared interface / backend / IPC contract への昇格は `N/A`。
aiworkflow-requirements 側では completed ledger 追加と履歴同期を行い、
`task-workflow-backlog.md` は未タスク 0 件のため更新しなかった。

## current facts

| 項目                    | 内容                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 実装主題                | `resolveExternalIntegration` の複数ツール統合対応                                                                          |
| 付随整理                | `ConversationRoundStep.tsx` の主ツールバッジ削除                                                                           |
| visual evidence         | `outputs/phase-11/screenshots/q5-single-select-no-badge.png` / `outputs/phase-11/screenshots/q5-multi-select-no-badge.png` |
| 変更層                  | renderer-local                                                                                                             |
| shared interface 昇格   | N/A                                                                                                                        |
| backend / DB / IPC 更新 | N/A                                                                                                                        |
| 未タスク                | 0 件                                                                                                                       |
| Phase 13                | blocked                                                                                                                    |

## renderer-local と判定した理由

- 新規 helper は `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts`
- `resolveExternalIntegration()` は `SkillCreateWizard.tsx` 内の UI 補助ロジック
- `packages/shared/` へ新規型・export・subpath は追加していない
- `apps/backend/` と IPC channel surface に変更がない

## fallback 補足

close-out では次の補足仕様を明記した。

- Step 0 直後は `answers.q5.selectedOptions` が空になり得る
- その場合でも `smartDefaults.tool` があれば、それを fallback 候補として外部連携 state を維持する
- この扱いは renderer-local の UI close-out rule であり、shared interface 化は不要

## aiworkflow-requirements 側の同期

### 追加・更新対象

| ファイル                                                                                       | 内容                                                 |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                 | 2026-04 recent list に本タスクの完了記録リンクを追加 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-recent-2026-04g.md` | 本タスクの詳細完了記録を新規追加                     |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`                   | 履歴エントリを追加                                   |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                           | current facts を追記                                 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                               | current facts sync を追記                            |
| `.agents/skills/aiworkflow-requirements/...`                                                   | mirror 同期                                          |

### 更新しなかったもの

| ファイル                   | 判定  | 理由                                                    |
| -------------------------- | ----- | ------------------------------------------------------- |
| `task-workflow-backlog.md` | no-op | 新規残件なし                                            |
| `topic-map.md`             | no-op | 新しい仕様セクションを増やしておらず discovery 影響なし |
| `SKILL.md`                 | no-op | 再利用ルール追加までは不要                              |

## workflow root 同期

| 対象                                                                                                                    | 反映内容                                       |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/index.md`                                                   | Phase 1-12 completed / Phase 13 blocked に更新 |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/artifacts.json`                                             | completed 化                                   |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/outputs/artifacts.json`                                     | root と parity で新規作成                      |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/outputs/phase-11/screenshot-plan.json`                      | 補助スクリーンショット計画を追加               |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/outputs/phase-11/phase11-capture-metadata.json`             | current build の capture metadata を追加       |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/outputs/phase-11/screenshots/q5-single-select-no-badge.png` | Q5 single select 画像証跡                      |
| `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/outputs/phase-11/screenshots/q5-multi-select-no-badge.png`  | Q5 multi select 画像証跡                       |

## Phase 12 Step 2 判定

**N/A**

理由:

1. shared 型追加なし
2. shared export 変更なし
3. backend / preload / IPC 契約変更なし
4. renderer-local helper と UI 整理に閉じる
