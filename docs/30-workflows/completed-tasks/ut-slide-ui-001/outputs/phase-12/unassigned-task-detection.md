# 未タスク検出結果: UT-SLIDE-UI-001

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | UT-SLIDE-UI-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 更新日   | 2026-03-21                   |

## 検出ソース確認

| 検出ソース                   | 結果       |
| ---------------------------- | ---------- |
| Phase 10 / Phase 11 既存指摘 | 再確認済み |
| current branch 実装差分      | 再確認済み |
| 正本仕様との差分             | 再確認済み |
| スクリーンショット視覚確認   | 再確認済み |

## 未タスク検出結果

### pending: 3件

| 未タスクID                    | 内容                                                                                                              | 影響度 | 対応方針                      | 指示書                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `UT-SLIDE-IMPL-001`           | native terminal 起動、IPC rename、reverse-sync 表現、`out-of-sync` 専用 surface を runtime 契約として収束させる   | 高     | 既存 runtime follow-up に統合 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-impl-001.md` |
| `UT-SLIDE-UI-CLOSE-ERROR-001` | `closeProject()` / `cancelExecution()` の失敗が UI へ出ず、`console.error` に埋もれる                             | 中     | root unassigned task で継続   | `docs/30-workflows/unassigned-task/task-ut-slide-ui-close-error-001.md`                                                      |
| `UT-SLIDE-UI-HIG-LEGACY-001`  | `SyncStatusIndicator.tsx` / `SkillPhasePanel.tsx` に legacy gray / green クラスが残り、Slide 新UIとトーンがずれる | 低     | root unassigned task で継続   | `docs/30-workflows/unassigned-task/task-ut-slide-ui-hig-legacy-001.md`                                                       |

### resolved in current branch

| 項目                            | 解消内容                                                                                                                                             | 証跡                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `UT-SLIDE-UI-ACCESSIBILITY-001` | `SlideGuidanceBlock` / `SlideProgressRow` / `TerminalLauncher` / close button に focus ring を追加し、`SlideSyncCard` の synced badge を黒文字へ変更 | `docs/30-workflows/unassigned-task/task-ut-slide-ui-accessibility-001.md`                                                   |
| `UT-SLIDE-P31-001`              | `useSlideProject()` は store 全体参照を廃止し、個別 selector ベースへ移行済み                                                                        | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-p31-001.md` |

### task 化しない観測事項

| 観測事項                                                 | 理由                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| live preview が `esbuild` mismatch で起動しない          | 環境要因であり、現在は static fallback screenshot + metadata で証跡化済み |
| `TerminalLauncher` の open ボタンが copy fallback で動く | 実装修正点ではなく runtime 契約の不足なので `UT-SLIDE-IMPL-001` に含める  |

## 重複確認

| 既存未タスク                  | 重複有無         | 判定理由                                             |
| ----------------------------- | ---------------- | ---------------------------------------------------- |
| `UT-SLIDE-IMPL-001`           | 重複ではなく内包 | runtime / IPC / terminal open は UI 単独では閉じない |
| `UT-SLIDE-UI-CLOSE-ERROR-001` | 新規追加不要     | root 側に formalize 済み                             |
| `UT-SLIDE-UI-HIG-LEGACY-001`  | 新規追加不要     | root 側に formalize 済み                             |

## まとめ

| 項目                 | 結果                     |
| -------------------- | ------------------------ |
| pending 件数         | 3                        |
| resolved 件数        | 2                        |
| リリースブロッカー   | `UT-SLIDE-IMPL-001` のみ |
| Phase 12 Task 4 判定 | PASS                     |
