# External API Support — 実装ガイド（2026-04-03時点）

## Part 1: 中学生レベルの説明

「外部API連携」は、別サービスの機能を借りるための接続設定です。  
このタスクでは、まず「接続の型」と「通信処理（GET/POST・認証・タイムアウト）」を用意しました。

その後、`SkillCreatorIpcBridge` を中心に main / preload / renderer の配線も完了しました。  
今は「機能配線は完了、ただし Phase 11 のスクリーンショット証跡が未保存」の状態です。

## Part 2: 技術者向けリファレンス

### 実装済み

| 項目                                                                                           | 状態     | ファイル                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ExternalApiConnectionConfig` / `IExternalApiAdapter` / エラー型                               | 実装済み | `packages/shared/src/types/skillCreatorExternalApi.ts`                                                                                                                  |
| shared export (`types/index.ts`, `index.ts`)                                                   | 実装済み | `packages/shared/src/types/index.ts`, `packages/shared/index.ts`                                                                                                        |
| shared IPCチャネル定数 (`EXTERNAL_API_CONFIG_REQUIRED`, `SKILL_CREATOR_EXTERNAL_API_CHANNELS`) | 実装済み | `packages/shared/src/ipc/channels.ts`                                                                                                                                   |
| `HttpExternalApiAdapter` + T-01〜T-15                                                          | 実装済み | `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`, `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts` |
| `ExternalApiConfigForm` UI部品（ローカルバリデーション）                                       | 実装済み | `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`                                                                                                  |

### 接続済み（wiring完了）

| 対象                           | 現状（2026-04-03確認）                                                      | 影響                                                |
| ------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------- |
| `SkillCreatorIpcBridge.ts`     | `configure-api` / `api-configured` / `api-test-result` のハンドラー実装済み | main で設定受付・中継が可能                         |
| `skill-creator-api.ts`         | `configureExternalApi` API実装済み                                          | Renderer から main へ設定送信可能                   |
| `skill-creator-session-api.ts` | `onExternalApiConfigRequired` 実装済み                                      | セッションイベント購読が可能                        |
| `preload/channels.ts`          | 新規チャネルが allowlist 追加済み                                           | `safeInvoke` / `safeOn` が通る                      |
| `SkillLifecyclePanel.tsx`      | `ExternalApiConfigForm` の表示・送信 wiring 実装済み                        | `external-api-config-required` 受信時にUI表示される |

### IPCチャネル定数（shared）

| 定数                                                          | 値                                           |
| ------------------------------------------------------------- | -------------------------------------------- |
| `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`           | `skill-creator:configure-api`                |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED`          | `skill-creator:api-configured`               |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT`         | `skill-creator:api-test-result`              |

### セキュリティ注意点

1. `HttpExternalApiAdapter` は APIキーを `console.log` / `console.info` に出さない実装になっている。
2. 非HTTPS URL は `console.warn` で通知する（通信自体はブロックしない）。
3. `ExternalApiConfigForm` は認証情報入力を `type="password"` にしている。

### Phase 11 スクリーンショット連携

- `outputs/phase-11/` には現時点で `manual-testing-plan.md` のみ存在。
- UI変更に対するスクリーンショット証跡（`outputs/phase-11/screenshots/...`）は未保存。
- `outputs/phase-12/implementation-guide.md` から参照可能なスクリーンショットも未整備。
