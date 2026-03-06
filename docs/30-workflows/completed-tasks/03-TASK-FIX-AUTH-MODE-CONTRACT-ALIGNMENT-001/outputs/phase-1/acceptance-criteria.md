# Phase 1 受け入れ基準

## チャネル別 AC

| ID             | 判定対象             | Yes 条件                                                                  | No 条件                                                   |
| -------------- | -------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| AC-GET-01      | `auth-mode:get`      | `success: true` 時の `data` が `{ mode: "subscription"                    | "api-key" }`                                              | `data` が文字列直返し、または `mode` 欠落 |
| AC-SET-01      | `auth-mode:set`      | `{ mode }` request を受け付け、成功後 `auth-mode:changed` を新 DTO で送る | request shape 不一致、または旧 event payload のまま       |
| AC-STATUS-01   | `auth-mode:status`   | `mode`, `isValid`, `hasCredentials`, `message`, `lastCheckedAt` を返す    | `isAuthenticated` 中心の旧 DTO、または UI 用 message 欠落 |
| AC-VALIDATE-01 | `auth-mode:validate` | `status` と同一 DTO を返し、`request?.mode` の有無で shape が変わらない   | `mode`, `hasCredentials`, `error` だけの旧 DTO            |
| AC-CHANGED-01  | `auth-mode:changed`  | `previousMode`, `mode`, `status`, `changedAt` を含む                      | `currentMode`, `timestamp`, `isAuthenticated` のみ        |

## 横断 AC

| ID         | 判定対象            | Yes 条件                                                                                                                                | No 条件                                                       |
| ---------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AC-SEC-01  | sender 検証         | invalid sender が request validation より前に拒否される                                                                                 | invalid mode 先行、または sender 未検証                       |
| AC-TYPE-01 | 公開型正本          | transport DTO が `packages/shared/src/types/auth-mode.ts` のみで定義される                                                              | preload / renderer に重複定義が残る                           |
| AC-P31-01  | SettingsView 初期化 | `store/index.ts` の個別 selector と `useEffect([initializeAuthMode])` を維持する                                                        | `useAuthModeStore` 再導入、または `useRef` ガード前提へ逆戻り |
| AC-TEST-01 | テスト              | Main / Preload / Renderer で同一 fixture 名を再利用する                                                                                 | 層ごとに payload 名や shape が分裂する                        |
| AC-DOC-01  | Phase 12 同期       | interfaces / api / security / state / error / guideline / patterns / testing / workflow / lessons / LOGS / topic-map を更新対象へ含める | 一部 reference が未列挙のまま進行する                         |
