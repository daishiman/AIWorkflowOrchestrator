# 現状棚卸し - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 1

## P50チェック（着手時点の実装状況）

| 確認対象                         | 状態     | ファイルパス                                                         | 備考                                                        |
| -------------------------------- | -------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `authKeyHandlers.ts`             | 実装済み | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                       | `auth-key:set/exists/validate/delete` の 4 チャンネルを提供 |
| `authKeyApi.ts`                  | 実装済み | `apps/desktop/src/preload/authKeyApi.ts`                             | `window.electronAPI.authKey` を公開                         |
| `ApiKeySettingsPanel.tsx`        | 実装済み | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` | 補助導線 UI                                                 |
| `SkillLifecyclePanel.tsx`        | 統合済み | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | `<ApiKeySettingsPanel />` を埋め込み済み                    |
| `SettingsView/index.tsx`         | 実装済み | `apps/desktop/src/renderer/views/SettingsView/index.tsx`             | 主導線として `AuthKeySection` を提供                        |
| `ApiKeyStatus`                   | 実装済み | `packages/shared/src/types/skillCreator.ts:209`                      | `not_set / validating / configured / error`                 |
| `skill-creator:*` 新規 namespace | 不要     | —                                                                    | 現在の正本では採用しない                                    |

## IPC 4層整合性確認

| 層             | 確認内容                                                  | 対象ファイル                                       | 状態 |
| -------------- | --------------------------------------------------------- | -------------------------------------------------- | ---- |
| 1. Shared type | `ApiKeyStatus` が正本として定義されている                 | `packages/shared/src/types/skillCreator.ts`        | OK   |
| 2. Main IPC    | `auth-key:*` を `authKeyHandlers.ts` が処理する           | `apps/desktop/src/main/ipc/authKeyHandlers.ts`     | OK   |
| 3. Preload API | `window.electronAPI.authKey` が公開される                 | `apps/desktop/src/preload/authKeyApi.ts`           | OK   |
| 4. Renderer    | `ApiKeySettingsPanel` と `SkillLifecyclePanel` が利用する | `apps/desktop/src/renderer/components/skill/*.tsx` | OK   |

## Drift 特定

| Drift                          | 内容                                     | 影響度 |
| ------------------------------ | ---------------------------------------- | ------ |
| `AuthKeyExistsResponse.source` | 型定義上は optional だが実装では常に返す | Minor  |
| Phase 2 設計への引き継ぎ       | 全 current facts を Phase 2 へ引き渡す   | なし   |
