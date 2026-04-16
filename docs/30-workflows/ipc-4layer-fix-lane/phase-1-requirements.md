# Phase 1 要件定義書 — IPC 4層整合性修正

## メタ情報

| 項目           | 値                                       |
| -------------- | ---------------------------------------- |
| ドキュメントID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001-PH1   |
| 作成日         | 2026-04-15                               |
| ステータス     | Draft                                    |
| 担当フェーズ   | Phase 1（要件定義）                      |
| 後続フェーズ   | Phase 2（設計）→ Phase 3（設計レビュー） |

---

## 1. タスク概要

### 1.1 タスクID

- **TASK-1**: `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001`（Rule-1修正）
- **TASK-2**: `UT-FIX-IPC-MAIN-HANDLER-IMPL-001`（Rule-2修正）

### 1.2 目的

CI ジョブ `IPC 4-Layer Alignment`（`.github/workflows/ci.yml`）が実行する検証スクリプト `scripts/verify-ipc-4layer.cjs` において、Rule-1 および Rule-2 の違反を解消し、CI を安定的にグリーンへ戻す。

### 1.3 背景

Electronアプリにおけるセキュリティモデルとして、IPC 通信は以下の4層で定義・制御される：

```
shared（チャネル定数定義）
  ↓ Rule-1: sharedで定義されたチャネルはpreloadホワイトリストに登録必須
preload（ホワイトリスト管理）
  ↓ Rule-2: preload invoke ホワイトリストはmainハンドラ実装が必須
main（ハンドラ実装）
  ↓ Rule-3: rendererで使用するチャネルはshared/preloadで定義必須
renderer（UI利用側）
```

`packages/shared/src/ipc/channels.ts` に新チャネル定数グループが追加された一方で、`apps/desktop/src/preload/channels.ts` のホワイトリストへの追加および mainハンドラの実装が漏れていた。これにより CI が失敗する状態となっている。

---

## 2. 問題の詳細

### 2.1 Rule-1 違反（12チャネル, 6 invoke + 6 on）

`packages/shared/src/ipc/channels.ts` で定義済みだが、`apps/desktop/src/preload/channels.ts` の `ALLOWED_ON_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` に未登録のチャネル。

#### CHAT_EXPORT_CHANNELS グループ（2チャネル）

| チャネル文字列       | 定数キー                              | 方向性                    |
| -------------------- | ------------------------------------- | ------------------------- |
| `chat:exportSession` | `CHAT_EXPORT_CHANNELS.EXPORT_SESSION` | Renderer → Main（invoke） |
| `chat:previewExport` | `CHAT_EXPORT_CHANNELS.PREVIEW_EXPORT` | Renderer → Main（invoke） |

#### FILE_SYSTEM_CHANNELS グループ（2チャネル）

| チャネル文字列 | 定数キー                          | 方向性                    |
| -------------- | --------------------------------- | ------------------------- |
| `fs:writeFile` | `FILE_SYSTEM_CHANNELS.WRITE_FILE` | Renderer → Main（invoke） |
| `fs:readFile`  | `FILE_SYSTEM_CHANNELS.READ_FILE`  | Renderer → Main（invoke） |

注意: `dialog:showSaveDialog`（`FILE_SYSTEM_CHANNELS.SHOW_SAVE_DIALOG`）は preload の `DIALOG_SHOW_SAVE` として既存登録済みのため除外。

#### SKILL_CREATOR_SESSION_CHANNELS グループ（5チャネル）

| チャネル文字列                    | 定数キー                                           | 方向性                    |
| --------------------------------- | -------------------------------------------------- | ------------------------- |
| `skill-creator:start-session`     | `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION`     | Renderer → Main（invoke） |
| `skill-creator:question-received` | `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED` | Main → Renderer（on）     |
| `skill-creator:answer`            | `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`            | Renderer → Main（invoke） |
| `skill-creator:session-complete`  | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE`  | Main → Renderer（on）     |
| `skill-creator:session-error`     | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR`     | Main → Renderer（on）     |

#### SKILL_CREATOR_EXTERNAL_API_CHANNELS グループ（3チャネル）

| チャネル文字列                               | 定数キー                                                      | 方向性                |
| -------------------------------------------- | ------------------------------------------------------------- | --------------------- |
| `skill-creator:external-api-config-required` | `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | Main → Renderer（on） |
| `skill-creator:api-configured`               | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED`          | Main → Renderer（on） |
| `skill-creator:api-test-result`              | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT`         | Main → Renderer（on） |

注意: `skill-creator:configure-api`（`SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`）は preload で `IPC_CHANNELS.CONFIGURE_API` として既登録済みのため、missing 対象に含めない。

### 2.2 Rule-2 違反（8チャネル）

`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に存在するが、`apps/desktop/src/main/ipc/` 配下にハンドラ実装がないチャネル。

#### Auth 関連（2チャネル）

| チャネル文字列          | 定数キー                | 現状                                                                                    |
| ----------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `auth:start-oauth-flow` | `AUTH_START_OAUTH_FLOW` | authHandlers.ts に `auth:login` は実装済みだが `auth:start-oauth-flow` ハンドラは未登録 |
| `auth:test-callback`    | `AUTH_TEST_CALLBACK`    | 開発用チャネル。mainハンドラ未実装                                                      |

#### Settings 関連（2チャネル）

| チャネル文字列    | 定数キー               | 現状               |
| ----------------- | ---------------------- | ------------------ |
| `settings:get`    | `USER_SETTINGS_GET`    | mainハンドラ未実装 |
| `settings:update` | `USER_SETTINGS_UPDATE` | mainハンドラ未実装 |

#### Agent 関連（4チャネル）

| チャネル文字列             | 定数キー                   | 現状                                                                                                             |
| -------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `agent:get-skills`         | `AGENT_GET_SKILLS`         | agentHandlers.ts は `AGENT_EXECUTION_*` のみ実装。`agent:get-skills` ハンドラ未実装                              |
| `agent:get-skill-detail`   | `AGENT_GET_SKILL_DETAIL`   | 同上。未実装                                                                                                     |
| `agent:execute`            | `AGENT_EXECUTE`            | 同上。`AGENT_EXECUTION_START`（`agent:start`）は実装済みだが `agent:execute` は別チャネル                        |
| `agent:permission-respond` | `AGENT_PERMISSION_RESPOND` | `AGENT_EXECUTION_PERMISSION_RES`（`agent:permission:res`）は実装済みだが `agent:permission-respond` は別チャネル |

---

## 3. スコープ

### 3.1 スコープ内（含む）

- `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` への不足チャネル追加（TASK-1）
- `apps/desktop/src/main/ipc/` 配下への Rule-2 対象チャネルの ipcMain.handle 実装（TASK-2）
- `node scripts/verify-ipc-4layer.cjs` の Rule-1・Rule-2 PASSの確認

### 3.2 スコープ外（含まない）

- `packages/shared/src/ipc/channels.ts` のチャネル定数そのものの変更
- Rule-3（renderer使用チャネルの未定義）の修正（別タスク）
- 新機能の実装（チャネルの追加・削除）
- テストコードの変更（ハンドラ実装に付随する最小限の範囲を除く）
- CI ワークフロー自体の変更
- `continue-on-error` の削除（CIグリーン確認後の別作業）

---

## 4. 受け入れ条件

### 4.1 主要受け入れ条件

以下のコマンドをプロジェクトルートで実行した際、Rule-1 および Rule-2 がすべて PASS となること：

```bash
node scripts/verify-ipc-4layer.cjs
```

期待する出力（抜粋）：

```
[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: PASS
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
```

### 4.2 副次的受け入れ条件

- TypeScript 型エラーが発生しないこと（`pnpm --filter @repo/desktop typecheck`）
- ESLint エラーが発生しないこと（`pnpm --filter @repo/desktop lint`）
- 既存のユニットテストが壊れないこと（`pnpm --filter @repo/desktop test`）

---

## 5. 依存関係

### 5.1 外部依存

なし（他タスクの完了を待つ必要はない）

### 5.2 内部依存

- TASK-1 と TASK-2 は互いに独立しており、並列実行可能
- TASK-2（mainハンドラ実装）は TASK-1（preloadホワイトリスト追加）の完了を論理的には必要としないが、CI 検証は両者完了後に実施する

---

## 6. 優先度・緊急度

| 項目   | 値                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| 優先度 | High                                                                                                                     |
| 緊急度 | High                                                                                                                     |
| 理由   | CIが継続失敗中。`continue-on-error: true` で一時的に抑制されているが、IPC セキュリティ整合性の欠如は本番リスクとなりうる |

---

## 7. 関連ファイル

| 役割                          | パス                                   |
| ----------------------------- | -------------------------------------- |
| shared チャネル定義（正本）   | `packages/shared/src/ipc/channels.ts`  |
| preload ホワイトリスト        | `apps/desktop/src/preload/channels.ts` |
| main ハンドラ格納ディレクトリ | `apps/desktop/src/main/ipc/`           |
| 検証スクリプト                | `scripts/verify-ipc-4layer.cjs`        |
| CI ワークフロー               | `.github/workflows/ci.yml`             |

---

## 8. 用語定義

| 用語                    | 説明                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | Renderer → Main 方向（ipcMain.handle）のホワイトリスト                             |
| ALLOWED_ON_CHANNELS     | Main → Renderer 方向（ipcMain.on / webContents.send）のホワイトリスト              |
| Rule-1                  | shared定義チャネルがpreloadホワイトリストに登録されているかの検証ルール            |
| Rule-2                  | preload invokeホワイトリストのチャネルがmainハンドラに実装されているかの検証ルール |
| 4層整合性               | shared → preload → main → renderer の4層がすべて整合していること                   |
