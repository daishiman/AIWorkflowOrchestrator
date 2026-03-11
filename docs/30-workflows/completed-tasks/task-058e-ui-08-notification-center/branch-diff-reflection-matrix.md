# ブランチ差分反映マトリクス

## 目的

本ブランチで追加した 058e workflow 差分が、どの関心ごとを担当し、どの skill 要求を満たしているかを明示する。今回は workflow 文書だけでなく、UI、Store、IPC、テスト、Phase 11/12 証跡まで含む実装差分を扱った。

## 差分一覧

| 変更ファイル                                                                                                                                                              | 主担当 SubAgent | 関心ごと                                                           | 反映した skill 要件                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`                                                                                             | SubAgent-A      | Bell 導線、Popover UI、Portal、responsive、keyboard/a11y、相対時刻 | task-058e UX 差分収束、testing-accessibility、ui-ux-portal-patterns |
| `apps/desktop/src/renderer/store/slices/notificationSlice.ts`                                                                                                             | SubAgent-B      | 履歴 dedupe、削除時 expanded reset、100件保持                      | arch-state-management、P50 既存 slice 再利用                        |
| `apps/desktop/src/preload/channels.ts`                                                                                                                                    | SubAgent-B      | `notification:delete` チャネル定義と allowlist                     | security-electron-ipc、api-ipc-system                               |
| `packages/shared/src/ipc/channels.ts`                                                                                                                                     | SubAgent-B      | shared IPC 定数同期                                                | 契約ドリフト防止、IPC 境界の一元化                                  |
| `apps/desktop/src/preload/types.ts`                                                                                                                                       | SubAgent-B      | delete request/response 型、NotificationAPI 契約拡張               | contract-first、型安全な preload API                                |
| `apps/desktop/src/preload/api/notification-api.ts`                                                                                                                        | SubAgent-B      | Renderer から delete を安全に invoke                               | preload API 実装、型付き invoke 境界                                |
| `apps/desktop/src/preload/index.ts`                                                                                                                                       | SubAgent-B      | preload 公開 API 同期                                              | contextBridge 公開境界の明確化                                      |
| `apps/desktop/src/main/ipc/notificationHandlers.ts`                                                                                                                       | SubAgent-B      | delete handler、sender/入力検証、service 委譲                      | security-electron-ipc、api-ipc-system                               |
| `apps/desktop/src/renderer/components/organisms/NotificationCenter/NotificationCenter.test.tsx`                                                                           | SubAgent-C      | popover、delete、outside click、focus trap、empty state            | TDD、testing-component-patterns、testing-accessibility              |
| `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`                                                                                                        | SubAgent-C      | dedupe / expanded reset 回帰                                       | state 回帰ガード                                                    |
| `apps/desktop/src/main/ipc/notificationHandlers.test.ts`, `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts`, `apps/desktop/src/preload/channels.test.ts` | SubAgent-C      | handler 登録、delete validation、allowlist 回帰                    | IPC 契約テスト、security gate                                       |
| `apps/desktop/scripts/capture-task-058e-notification-center-phase11.mjs`                                                                                                  | SubAgent-A / C  | Phase 11 screenshot capture、desktop/tablet/mobile 証跡            | phase-11-12-guide、UI 状態カバレッジ                                |
| `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-1` 〜 `phase-12`                                                                     | SubAgent-D      | 各 Phase の証跡、判断、設計、テスト、文書同期                      | phase templates、evidence sync、phase12 checklist                   |
| `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/index.md` ほか root 文書                                                                           | SubAgent-D      | workflow status、traceability、verification の実績同期             | workflow body stale 防止、仕様と実績の一致                          |

## 差分評価

| 観点              | 判定 | 内容                                                                    |
| ----------------- | ---- | ----------------------------------------------------------------------- |
| task-spec 準拠    | 適合 | Phase 1-12 の必須成果物、Phase 11 screenshot、Phase 12 outputs を揃えた |
| requirements 抽出 | 適合 | system spec 抽出根拠を実装・テスト・文書同期の3層で回収した             |
| 関心分離          | 適合 | UI / Store / IPC / テスト / 文書同期を SubAgent-A から D に分離した     |
| 現ブランチ方針    | 適合 | 実装と検証は完了し、commit / PR のみユーザー制約で保留している          |
