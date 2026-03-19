# TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 ドキュメント更新履歴

## 更新日

2026-03-19

## 実施内容

| 区分                 | 内容                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装同期             | `packages/shared/src/ipc/channels.ts` を追加更新し、AC-8 を実体化                                                                                                                      |
| workflow 同期        | `index.md` / `artifacts.json` / `outputs/artifacts.json` の phase status / artifact inventory を同期                                                                                   |
| Phase 10-12 出力是正 | `safeInvoke` 記載、`unregisterAllIpcHandlers` 記載、古いテスト数を 8ファイル / 421テストへ更新し、worktree 免責注記を修正                                                              |
| Phase 11 画面再監査  | `apps/desktop/scripts/capture-task-ipc-layer-integrity-fix-phase11.mjs` を追加し、representative screenshot 5件 + `ui-sanity-visual-review.md` を生成。旧 `TC-VIS-*` は archive へ退避 |
| skill 正本同期       | `.claude/skills/task-specification-creator/*` と `.claude/skills/aiworkflow-requirements/*` の更新内容を `.agents/skills/*` mirror へ同期                                              |

## Step 完了状況

| Step | 状態 | 補足                                                                                      |
| ---- | ---- | ----------------------------------------------------------------------------------------- |
| 1-A  | 完了 | LOGS.md×2 / SKILL.md×2 を更新対象として反映済み                                           |
| 1-B  | 完了 | interfaces / architecture / security current contract を同期                              |
| 1-C  | 完了 | completed task ledger と残課題を同期                                                      |
| 1-D  | 完了 | index 系ファイルを再生成済み内容へ同期し、Phase 11 visual sanity 証跡も artifacts に反映  |
| 2    | 完了 | 8ファイルの canonical set と実装を同期                                                    |
| 3    | 完了 | IPC 契約監査を Phase 10 出力へ反映し、画面 sanity 追補後も Phase 13 は pending のまま維持 |

## 備考

- worktree を理由とした Step 1-A のスキップは行っていない
- Phase 13 はユーザー承認待ちのため pending のまま維持
