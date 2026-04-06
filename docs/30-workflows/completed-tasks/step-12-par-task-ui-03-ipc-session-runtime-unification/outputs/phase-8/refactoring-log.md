# リファクタリングログ（Phase 8） — TASK-UI-03 IPC 二重経路統合

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| Phase 名   | リファクタリング                           |
| 機能名     | ipc-session-runtime-unification            |
| 対象機能   | TASK-UI-03 IPC 二重経路統合                |
| 参照 Phase | Phase 3 ゲート（MINOR 記録）/ Phase 5 実装 |
| 作成日     | 2026-04-06                                 |
| ステータス | complete                                   |

---

## 1. MINOR-01 解決仕様 — Session IPC エラーハンドリングの IpcResult 化

### 背景

Phase 3 ゲートで記録された MINOR-01:

> Session IPC のエラーハンドリング形式が `throw` 形式で Runtime IPC の `IpcResult` パターンと非統一

対象ファイル: `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`

対象メソッド:

- `onStartSession` — バリデーション失敗・セッション重複時に `throw new Error(...)` を使用
- `onAnswer` — セッション未存在・`toolCallId` 不一致時に `throw new Error(...)` を使用

### 変更方針

`onStartSession` と `onAnswer` は `Promise<void>` を返す設計であり、Electron の `ipcMain.handle` が `throw` を受け取ると Renderer 側でも例外として再 throw される。Runtime IPC は `IpcResult<T>` を返して例外を起こさない設計になっている。

Session IPC の 2 メソッドを `IpcResult<void>` を返す形式に変更することで、Renderer 側が `try/catch` に頼らずに `result.success` でエラー判定できるようにする。

### 変更前→変更後 対比表

#### `onStartSession` — バリデーション失敗時

| 観点               | 変更前                                                                                  | 変更後                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 戻り値型           | `Promise<void>`                                                                         | `Promise<IpcResult<void>>`                                                                               |
| バリデーション失敗 | `throw new Error("[SkillCreatorIpcBridge] start-session request must include ...")`     | `return { success: false, error: "[SkillCreatorIpcBridge] start-session request must include ..." }`     |
| セッション重複     | `throw new Error("[SkillCreatorIpcBridge] A skill creator session is already running")` | `return { success: false, error: "[SkillCreatorIpcBridge] A skill creator session is already running" }` |
| 正常時             | `void`（return なし）                                                                   | `return { success: true }`                                                                               |
| セキュリティ       | `assertSender` が `throw`                                                               | `assertSender` は維持（不正 sender は引き続き throw — セキュリティ例外は IpcResult 化しない）            |

#### `onAnswer` — エラー時

| 観点                | 変更前                                                                                  | 変更後                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 戻り値型            | `Promise<void>`                                                                         | `Promise<IpcResult<void>>`                                                                               |
| セッション未存在    | `throw new Error("[SkillCreatorIpcBridge] Received answer but no active session")`      | `return { success: false, error: "[SkillCreatorIpcBridge] Received answer but no active session" }`      |
| 質問未保留          | `throw new Error("[SkillCreatorIpcBridge] Received answer but no question is pending")` | `return { success: false, error: "[SkillCreatorIpcBridge] Received answer but no question is pending" }` |
| `toolCallId` 不一致 | `throw new Error(\`[SkillCreatorIpcBridge] toolCallId mismatch: ...\`)`                 | `return { success: false, error: \`[SkillCreatorIpcBridge] toolCallId mismatch: ...\` }`                 |
| 正常時              | `void`（return なし）                                                                   | `return { success: true }`                                                                               |

#### IPC ハンドラー登録側の変更

| 箇所                       | 変更前                                                             | 変更後                                                                    |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `START_SESSION` ハンドラー | `async (event, req) => { await this.onStartSession(event, req); }` | `async (event, req) => { return await this.onStartSession(event, req); }` |
| `ANSWER` ハンドラー        | `async (event, answer) => { await this.onAnswer(event, answer); }` | `async (event, answer) => { return await this.onAnswer(event, answer); }` |

#### Renderer 側（`skill-creator-session-api.ts`）の変更

| 箇所              | 変更前                                 | 変更後                                            |
| ----------------- | -------------------------------------- | ------------------------------------------------- |
| `startSession` 型 | `startSession: (...) => Promise<void>` | `startSession: (...) => Promise<IpcResult<void>>` |
| `sendAnswer` 型   | `sendAnswer: (...) => Promise<void>`   | `sendAnswer: (...) => Promise<IpcResult<void>>`   |

#### `SkillCreatorSessionAPI` インターフェース変更

| メソッド       | 変更前          | 変更後                     |
| -------------- | --------------- | -------------------------- |
| `startSession` | `Promise<void>` | `Promise<IpcResult<void>>` |
| `sendAnswer`   | `Promise<void>` | `Promise<IpcResult<void>>` |

### セキュリティ例外の扱いについて

`assertSender` が throw する `"IPC sender does not match the active window"` エラーは IpcResult 化しない。不正な sender からの呼び出しは Electron セキュリティの観点でハードエラーとして扱い、Renderer 側が握りつぶせない形式を維持する。

### 影響範囲

| ファイル                                                                         | 変更の種類                |
| -------------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                | 戻り値型変更・return 追加 |
| `apps/desktop/src/preload/skill-creator-session-api.ts`                          | インターフェース型変更    |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts` | テスト期待値の更新が必要  |

---

## 2. デッドコード除去リスト

### 2-1. `creatorHandlers.ts` — `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複登録

**問題**: `creatorHandlers.ts` の 219〜252 行目と 254〜287 行目に `IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS` の `ipcMain.handle` が 2 回登録されている（完全に同一の実装内容）。

Phase 5 で修正済みであることを最終確認する。確認方法:

```
grep -n "SKILL_CREATOR_GET_ADAPTER_STATUS" apps/desktop/src/main/ipc/creatorHandlers.ts
```

期待結果: 1 件のみ（`ipcMain.handle` 呼び出しが 1 箇所、`removeHandler` 呼び出しが 1 箇所）。

重複が残存する場合は 254〜287 行目のブロック全体を削除する。

### 2-2. `types.ts` (preload) — `skillCreator` / `skillCreatorSession` フィールド

Phase 5 で `electronAPI.skillCreator` / `electronAPI.skillCreatorSession` を削除した場合、`ElectronAPI` インターフェースに残存フィールドがないか確認する。

| 削除対象                                       | ファイル                            | 確認方法                                                          |
| ---------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `skillCreator?: SkillCreatorAPI`               | `apps/desktop/src/preload/types.ts` | `grep -n "skillCreator" apps/desktop/src/preload/types.ts`        |
| `skillCreatorSession?: SkillCreatorSessionAPI` | `apps/desktop/src/preload/types.ts` | `grep -n "skillCreatorSession" apps/desktop/src/preload/types.ts` |

Phase 5 後の現在の `ElectronAPI` 定義（`types.ts` 1255〜1256 行目）では維持されているため、削除が完了している場合はこの行が存在しないことを確認する。

### 2-3. `skill-creator-session-api.ts` — 不要 import の確認

`IpcResult` 型を追加した場合、`@repo/shared/types` からの import が必要になる。逆に Phase 5 での変更で不要になった import がある場合は除去する。

### 2-4. `SkillCreatorIpcBridge.ts` — `ConfigureApiResult` 型の再利用確認

現在 `ConfigureApiResult` 型はファイルローカルに定義されている。`IpcResult<void>` を採用することで `ConfigureApiResult` は `IpcResult<void>` と等価になる。型を削除して `IpcResult<void>` に統一できる。

| 削除対象                                                                       | 代替                     |
| ------------------------------------------------------------------------------ | ------------------------ |
| `type ConfigureApiResult = { success: boolean; error?: string; }` (46〜49行目) | `IpcResult<void>` を使用 |

削除後の影響箇所:

- `onConfigureApi` の戻り値型: `Promise<ConfigureApiResult>` → `Promise<IpcResult<void>>`
- `onOverwriteApproved` の戻り値型: `Promise<ConfigureApiResult>` → `Promise<IpcResult<void>>`

---

## 3. 命名統一の最終確認結果

### 3-1. チャネル名の確認

| チャネル定数名                                                | 実際の値                                     | 命名規則（`skill-creator:xxx`） | 判定 |
| ------------------------------------------------------------- | -------------------------------------------- | ------------------------------- | ---- |
| `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION`                | `skill-creator:start-session`                | 準拠                            | OK   |
| `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`                       | `skill-creator:answer`                       | 準拠                            | OK   |
| `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED`            | `skill-creator:question-received`            | 準拠                            | OK   |
| `SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE`             | `skill-creator:session-complete`             | 準拠                            | OK   |
| `SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR`                | `skill-creator:session-error`                | 準拠                            | OK   |
| `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` | 準拠                            | OK   |
| `IPC_CHANNELS.SKILL_CREATOR_PLAN`                             | `skill-creator:plan`                         | 準拠                            | OK   |
| `IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS`               | `skill-creator:get-adapter-status`           | 準拠                            | OK   |
| `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN`                     | `skill-creator:execute-plan`                 | 準拠                            | OK   |
| `IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS`                    | `skill-creator:list-sessions`                | 準拠                            | OK   |
| `IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION`                   | `skill-creator:resume-session`               | 準拠                            | OK   |
| `IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION`                   | `skill-creator:delete-session`               | 準拠                            | OK   |

**結論**: 全チャネル名が `skill-creator:` プレフィックス統一規則に準拠。変更不要。

### 3-2. ハンドラー関数名の確認

| ハンドラー関数名                        | ファイル                   | チャネルとの一貫性          | 判定 |
| --------------------------------------- | -------------------------- | --------------------------- | ---- |
| `onStartSession`                        | `SkillCreatorIpcBridge.ts` | `START_SESSION` に対応      | OK   |
| `onAnswer`                              | `SkillCreatorIpcBridge.ts` | `ANSWER` に対応             | OK   |
| `onConfigureApi`                        | `SkillCreatorIpcBridge.ts` | `CONFIGURE_API` に対応      | OK   |
| `onOverwriteApproved`                   | `SkillCreatorIpcBridge.ts` | `OVERWRITE_APPROVED` に対応 | OK   |
| `registerRuntimeSkillCreatorHandlers`   | `creatorHandlers.ts`       | Runtime ハンドラー群を統括  | OK   |
| `unregisterRuntimeSkillCreatorHandlers` | `creatorHandlers.ts`       | register の逆操作           | OK   |

**結論**: 命名の統一に問題なし。変更不要。

### 3-3. 型名の確認

| 型名                               | ファイル                              | 対応チャネル／用途                 | 判定 |
| ---------------------------------- | ------------------------------------- | ---------------------------------- | ---- |
| `SkillCreatorSessionStartRequest`  | `@repo/shared/types`                  | `START_SESSION` のリクエスト型     | OK   |
| `UserInputAnswer`                  | `@repo/shared/types`                  | `ANSWER` のペイロード型            | OK   |
| `UserInputQuestion`                | `@repo/shared/types`                  | `QUESTION_RECEIVED` のペイロード型 | OK   |
| `SkillCreatorSessionCompleteEvent` | `@repo/shared/types`                  | `SESSION_COMPLETE` のペイロード型  | OK   |
| `SkillCreatorSessionErrorEvent`    | `@repo/shared/types`                  | `SESSION_ERROR` のペイロード型     | OK   |
| `SessionFactory`                   | `SkillCreatorIpcBridge.ts` (exported) | sessionFactory の型                | OK   |
| `IpcResult<T>`                     | `creatorHandlers.ts` (file-local)     | Runtime IPC 戻り値の共通型         | OK   |

**結論**: 型名の統一に問題なし。変更不要。

---

## 4. 共通パターン抽出の可否判断

### 4-1. `validateSender`（creatorHandlers.ts）と `assertSender`（SkillCreatorIpcBridge.ts）の統一検討

| 観点             | `validateSender` (creatorHandlers.ts)                                                                                                         | `assertSender` (SkillCreatorIpcBridge.ts)                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 実装             | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` を呼び出し → 失敗時は `throw toIPCValidationError(validation)` | `event.sender.id !== this.window.webContents.id` を直接比較 → 失敗時は `throw new Error(...)` |
| セキュリティ強度 | BrowserWindow からの逆引き + DevTools 検出 + 許可ウィンドウリスト照合（3段階）                                                                | sender ID の直接比較（1段階）                                                                 |
| 依存ライブラリ   | `ipc-validator.ts` の `validateIpcSender` / `toIPCValidationError`                                                                            | なし（インライン実装）                                                                        |
| 適用可能性       | 関数型（`mainWindow` を引数で受け取れる）                                                                                                     | クラスメソッド（`this.window` を参照）                                                        |
| 共通化の効果     | セキュリティ強度を `assertSender` と同等以上に揃えられる                                                                                      | `SkillCreatorIpcBridge` が `ipc-validator` に依存するようになる                               |

**判断: 統一を推奨するが、Phase 8 スコープでは仕様確認のみに留める**

理由:

1. `assertSender` を `validateSender` に差し替えることで、Session IPC のセキュリティ強度が Runtime IPC と同等（3段階検証）になる。これは Phase 3 AC-6 で求められた「セキュリティ均一化」の目標に合致する。
2. ただし `SkillCreatorIpcBridge` のコンストラクタ引数に `mainWindow: BrowserWindow` が既に存在するため、`validateIpcSender` を呼び出す形式への変更は容易。
3. 一方、`assertSender` を維持したままでも現在のテストは全通過しており、追加の安全性向上は漸進的変更に相当する。

**Phase 8 での結論**: `assertSender` の実装を `validateIpcSender` ベースに差し替える変更は「MINOR-01 解決（IpcResult 化）」と同時に実施することで変更のまとまりがよい。次タスク（未タスク化 or Phase 9 QA 確認）として記録する。

#### 統一後のコード形式（参考）

```typescript
// SkillCreatorIpcBridge.ts — assertSender の統一案
private assertSender(event: IpcMainInvokeEvent, channel: string): void {
  const validation = validateIpcSender(event, channel, {
    getAllowedWindows: () => [this.window],
  });
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }
}
```

追加 import が必要:

```typescript
import {
  validateIpcSender,
  toIPCValidationError,
} from "../../infrastructure/security/ipc-validator";
```

### 4-2. `IpcResult<T>` 型の共有化検討

現在 `IpcResult<T>` は `creatorHandlers.ts` にファイルローカルで定義されており、`skill-creator-api.ts` にも同名の interface が別定義されている。

| ファイル                                       | 定義場所                                  |
| ---------------------------------------------- | ----------------------------------------- |
| `creatorHandlers.ts`（32〜36 行目）            | ファイルローカル `interface IpcResult<T>` |
| `skill-creator-api.ts`（42〜46 行目）          | ファイルローカル `interface IpcResult<T>` |
| `@repo/shared/types` または `@repo/shared/ipc` | 現状未定義                                |

`IpcResult<T>` を `packages/shared/src/ipc/` または `packages/shared/src/types/` に移動し、両ファイルから import することで型の重複を解消できる。

**Phase 8 での結論**: Phase 8 スコープは「確認と仕様記録」に限定。実際の型移動は独立したリファクタリングタスクとして次フェーズ以降で実施する。

---

## 5. 変更後の最終ファイル構成

### Session IPC 側

```
apps/desktop/src/main/services/runtime/
  SkillCreatorIpcBridge.ts         — onStartSession/onAnswer を IpcResult<void> 化
                                     assertSender の validateIpcSender 統一（推奨、次タスク）
                                     ConfigureApiResult 型を IpcResult<void> に統一

apps/desktop/src/preload/
  skill-creator-session-api.ts     — startSession/sendAnswer の戻り値型を IpcResult<void> に変更
```

### Runtime IPC 側

```
apps/desktop/src/main/ipc/
  creatorHandlers.ts               — SKILL_CREATOR_GET_ADAPTER_STATUS 重複登録の削除確認
                                     （Phase 5 での修正が反映済みであることを確認）
```

### 型定義側

```
apps/desktop/src/preload/
  types.ts                         — electronAPI.skillCreator / skillCreatorSession
                                     フィールドが削除済みであることを確認（Phase 5 完了確認）
```

### テスト側

```
apps/desktop/src/main/services/runtime/__tests__/
  SkillCreatorIpcBridge.test.ts    — IpcResult<void> 化に伴う期待値更新
                                     throw ではなく { success: false, error: ... } を期待するように変更
```

---

## 6. 完了条件チェックリスト

### MINOR-01 解決

- [ ] `SkillCreatorIpcBridge.onStartSession` の戻り値型が `Promise<IpcResult<void>>` に変更されている
- [ ] `SkillCreatorIpcBridge.onAnswer` の戻り値型が `Promise<IpcResult<void>>` に変更されている
- [ ] バリデーション失敗時に `throw` ではなく `return { success: false, error: ... }` を使用している
- [ ] `ipcMain.handle` のコールバックで `return await this.onStartSession(...)` / `return await this.onAnswer(...)` になっている
- [ ] `SkillCreatorSessionAPI.startSession` の型が `Promise<IpcResult<void>>` に更新されている
- [ ] `SkillCreatorSessionAPI.sendAnswer` の型が `Promise<IpcResult<void>>` に更新されている
- [ ] `assertSender` が throw する不正 sender エラーは IpcResult 化しないことを確認した
- [ ] 上記変更に対応したテストが更新されている

### デッドコード除去

- [ ] `creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複登録が 1 件のみであることを確認した
- [ ] `types.ts` に `electronAPI.skillCreator` / `electronAPI.skillCreatorSession` フィールドが残存していないことを確認した
- [ ] `SkillCreatorIpcBridge.ts` の `ConfigureApiResult` 型が `IpcResult<void>` に統一されている（推奨）

### 命名統一

- [ ] 全チャネル名が `skill-creator:` プレフィックスで統一されていることを確認した
- [ ] ハンドラー関数名とチャネル名の対応が一貫していることを確認した
- [ ] 型名がチャネル名・用途と一貫していることを確認した

### 共通パターン抽出

- [ ] `assertSender` vs `validateSender` の統一方針を記録した（本ドキュメント 4-1 参照）
- [ ] `IpcResult<T>` 型の重複定義を記録した（本ドキュメント 4-2 参照）
- [ ] `assertSender` の `validateIpcSender` 統一を次フェーズ以降のタスクとして登録した（省略可）

### 全体

- [ ] リファクタリング後に全テスト（`pnpm --filter @repo/desktop test`）がパスすること
- [ ] 型チェック（`pnpm --filter @repo/desktop typecheck`）がパスすること
- [ ] Phase 3 MINOR-02（`GovernanceSummaryPanel.test.tsx` の mock 修正）が Phase 5 で解決済みであることを Phase 9 QA で確認する

---

## 付録: Phase 3 MINOR 追跡の最終状況

| MINOR-ID | 内容                                                                | 解決 Phase   | 解決確認          |
| -------- | ------------------------------------------------------------------- | ------------ | ----------------- |
| MINOR-01 | Session IPC エラーが `throw` で Runtime IPC の `IpcResult` と非統一 | **Phase 8**  | Phase 9 QA で確認 |
| MINOR-02 | `GovernanceSummaryPanel.test.tsx` の mock 修正                      | Phase 5 完了 | Phase 7 確認済み  |
