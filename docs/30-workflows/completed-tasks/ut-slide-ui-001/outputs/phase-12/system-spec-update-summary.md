# system spec update summary: UT-SLIDE-UI-001

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | UT-SLIDE-UI-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 更新日   | 2026-03-21                   |

## Step 1: 実装差分と同期対象

| 区分                  | 実測内容                                                                                            | 反映先                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Renderer UI           | `SlideWorkspace.tsx` が handoff/settings/manualSync を現在の store と結合し、4領域 UI を表示        | `ui-ux-feature-components-details.md`                                        |
| Shared contract drift | canonical doc の `SyncStatus` 記述が `idle` ベースで、実コードの `out-of-sync` と不一致             | `api-ipc-system-core.md`                                                     |
| State drift           | `useSlideProject()` は current branch で個別 selector 化済みなのに、正本は P31 未解消と記録していた | `arch-state-management-advanced.md`                                          |
| Task台帳 drift        | Task09 follow-up に `UT-SLIDE-UI-001` と `UT-SLIDE-P31-001` が未完了として残っていた                | `task-workflow-completed.md` / `workflow-ai-runtime-authmode-unification.md` |
| Security note drift   | IPC セキュリティ follow-up に UI 実装タスクが混在していた                                           | `security-electron-ipc-core.md`                                              |

### canonical file 更新結果

| ファイル                                                                                        | 更新内容                                                                                  |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`         | Slide UI 章を「正本のみ」から current branch 実装済みへ更新し、残課題を再整理             |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      | `SyncStatus` を `synced / out-of-sync / syncing / error` に是正し、UI follow-up を整理    |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md`           | P31 未解消記述を除去し、残存 drift を store 契約差分のみに絞り込んだ                      |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                  | Task09 follow-up から `UT-SLIDE-UI-001` を完了扱いへ、`UT-SLIDE-P31-001` を吸収済みへ更新 |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Step-04 Task09 再監査追補に current branch の解消状況を追記                               |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | 関連未タスクを `UT-SLIDE-IMPL-001` 中心へ整理                                             |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                | same-wave sync 実績を記録                                                                 |
| `.claude/skills/task-specification-creator/LOGS.md`                                             | Phase 11/12 再監査と validator 実績を記録                                                 |

## Step 2: 判定

### 判定: canonical 更新あり

本タスクは UI 実装だけでなく、正本仕様に残っていた事実誤認を同時に是正したため、Step 2 は `更新あり` です。理由は次の 3 点です。

1. `SyncStatus` の canonical 記述が実コードとズレていた
2. `UT-SLIDE-UI-001` / `UT-SLIDE-P31-001` の完了状態が台帳へ反映されていなかった
3. Slide UI 章が「未実装」のままで、current branch の画面と証跡を説明できていなかった

### mirror / index 同期

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| index 再生成 | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行済み |
| mirror 同期  | `.claude` ファイルを `.agents/skills/...` へ同内容で同期済み                       |

## 依存タスクとの境界確認

| 依存タスク                    | 本タスクで完了した範囲                                                                 | 依存先へ残した範囲                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `UT-SLIDE-IMPL-001`           | handoff 表示、settings 導線、manualSync 再試行、watch 表示、Phase 11 証跡の current 化 | IPC rename、native terminal 起動、reverse-sync の厳密表現、runtime contract 完全統合 |
| `UT-SLIDE-P31-001`            | `useSlideProject()` の個別 selector 化は current branch で吸収済み                     | なし                                                                                 |
| `UT-SLIDE-UI-CLOSE-ERROR-001` | 問題の特定と未タスク formalize                                                         | UI 通知実装                                                                          |
