# Phase 1 要件定義書

## 目的

`auth-mode:get`, `auth-mode:set`, `auth-mode:status`, `auth-mode:validate`, `auth-mode:changed` の公開契約を Main / Preload / Renderer で一致させ、`packages/shared/src/types/auth-mode.ts` を transport DTO の単一正本に固定する。

## 現状確認サマリー

| 観点       | 現状                                                         | 要件                                                                                            |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `get`      | Main は `data: AuthMode` を返す                              | `data: { mode }` に統一する                                                                     |
| `status`   | Main は `isAuthenticated`, `error`, `details` を返す         | `mode`, `isValid`, `hasCredentials`, `message`, `errorCode`, `guidance`, `lastCheckedAt` を返す |
| `validate` | Main は `mode`, `hasCredentials`, `error` を返す             | `status` と同一 DTO を返す                                                                      |
| `changed`  | Main は `currentMode`, `timestamp`, `isAuthenticated` を送る | `previousMode`, `mode`, `status`, `changedAt` を送る                                            |
| 公開型     | shared / main / preload / renderer に重複                    | shared を正本、他は参照専用にする                                                               |

## 機能要件

1. `auth-mode:get` は `IPCResponse<{ mode: AuthMode }>` を返す。
2. `auth-mode:set` は request を `{ mode: AuthMode }` のまま維持し、成功時に `auth-mode:changed` を新契約で送る。
3. `auth-mode:status` は UI 表示に必要な情報を 1 DTO に集約して返す。
4. `auth-mode:validate` は `status` と同一 shape を返し、`request?.mode` 指定時も未指定時も同じ DTO を返す。
5. `auth-mode:changed` は `status` DTO を内包し、Renderer が追加 fetch なしでも画面更新できる payload を持つ。
6. Main の sender 検証順序は `sender -> request shape -> mode validation -> service call` を守る。
7. `apps/desktop/src/preload/channels.ts` の channel 名と whitelist は変更しない。
8. SettingsView は個別 selector と `useEffect([initializeAuthMode])` を維持し、`useAuthModeStore` 再導入を禁止する。
9. `packages/shared/src/types/auth-mode.ts` に transport DTO と error code union を集約し、`preload/types.ts` と `authModeSlice.ts` で重複再定義しない。

## 非機能要件

| ID     | 要件                                                                     |
| ------ | ------------------------------------------------------------------------ |
| NFR-01 | 変更後も `auth-mode` 以外の認証 provider 実装には手を広げない            |
| NFR-02 | touched file の line 90%以上、branch 85%以上、function 100% を目標にする |
| NFR-03 | invalid sender、invalid mode、credential missing を必須異常系にする      |
| NFR-04 | Phase 11 で `/settings` の実画面証跡とスクリーンショット検証記録を残す   |
| NFR-05 | Phase 12 で aiworkflow 正本仕様と LOGS / topic-map を同期する            |

## 影響範囲

| 区分     | 対象                                                                       | 要件上の扱い                                               |
| -------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Main     | `apps/desktop/src/main/ipc/authModeHandlers.ts`                            | transport adapter の差し込み点                             |
| Main     | `apps/desktop/src/main/services/auth/types.ts`                             | internal type と transport type を分離する基準             |
| Main     | `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts`          | guidance の事実根拠参照のみ。provider 実装自体は原則非変更 |
| Preload  | `apps/desktop/src/preload/index.ts`                                        | shared DTO を返す bridge へ切替                            |
| Preload  | `apps/desktop/src/preload/types.ts`                                        | transport 型の再定義を廃止し shared 参照へ寄せる           |
| Renderer | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                  | status / validate / changed の受信 shape を統一            |
| Renderer | `apps/desktop/src/renderer/store/index.ts`                                 | 個別 selector 維持、合成 hook 非推奨のまま                 |
| Renderer | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | mount 時初期化と status 表示の契約確認対象                 |
| Renderer | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | `AuthMode` 型の shared 参照先へ寄せる対象                  |

## Phase 12 で必ず同期する正本仕様

1. `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
2. `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
3. `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
4. `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
5. `.claude/skills/aiworkflow-requirements/references/error-handling.md`
6. `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`
7. `.claude/skills/aiworkflow-requirements/references/patterns.md`
8. `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`
9. `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
10. `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
11. `.claude/skills/aiworkflow-requirements/LOGS.md`
12. `.claude/skills/task-specification-creator/LOGS.md`
13. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`

## 実行記録

- Main / Preload / Renderer / system spec を並列棚卸しした。
- 契約ドリフトは `get`, `set`, `status`, `validate`, `changed` の5系統で固定した。
- Phase 2 へ渡す公開型正本は `packages/shared/src/types/auth-mode.ts` に固定した。
