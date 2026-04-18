# Phase 2: 設計書 (design)

## 作成日

2026-04-18

---

## 1. 設計概要

TASK-SW-CANCEL-002 は preload 層のキャンセル API を以下の 3 つの設計要素で構成する。

| 設計要素             | 対象ファイル                           | 内容                                           |
| -------------------- | -------------------------------------- | ---------------------------------------------- |
| インターフェース設計 | `skill-creator-api.ts`（396行目）      | `SkillCreatorAPI` への `cancelGeneration` 追加 |
| 実装設計             | `skill-creator-api.ts`（725〜727行目） | `safeInvoke` パターンによる実装                |
| ホワイトリスト設計   | `channels.ts`（716行目）               | `ALLOWED_INVOKE_CHANNELS` への登録             |

---

## 2. インターフェース設計

### 2-1. SkillCreatorAPI インターフェースへの追加

**追加箇所**: `SkillCreatorAPI` インターフェース末尾（`onApprovalRequest` の直後）

```typescript
/**
 * 現在実行中のスキル生成をキャンセルする
 * @returns キャンセル結果
 */
cancelGeneration: () => Promise<IpcResult<void>>;
```

### 2-2. 型設計の根拠

| 型要素              | 選択                       | 根拠                                                                         |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| 引数                | なし（`()`）               | キャンセル操作は副作用のみで識別子不要。現在実行中セッションを一意に特定可能 |
| 戻り値              | `Promise<IpcResult<void>>` | 成否を `IpcResult.success` で返す統一パターン。データ返却不要                |
| `IpcResult<T>` の T | `void`                     | キャンセル成功時に返却すべきペイロードが存在しない                           |

### 2-3. 他メソッドとの型比較

| メソッド                 | 引数                     | 戻り値                                        |
| ------------------------ | ------------------------ | --------------------------------------------- |
| `detectMode`             | `(request: string)`      | `Promise<IpcResult<SkillCreatorMode>>`        |
| `getAdapterStatus`       | `()`                     | `Promise<IpcResult<LLMAdapterStatusPayload>>` |
| `cleanupExpiredSessions` | `()`                     | `Promise<number>`                             |
| **`cancelGeneration`**   | **`()`**                 | **`Promise<IpcResult<void>>`**                |
| `deleteSession`          | `(checkpointId: string)` | `Promise<IpcResult<void>>`                    |

`cancelGeneration` は `deleteSession` と同様の `IpcResult<void>` 戻り値パターンに属する。引数なしの点は `getAdapterStatus` / `cleanupExpiredSessions` と同様のパターン。

---

## 3. 実装設計

### 3-1. skillCreatorAPI オブジェクトへの追加

**追加箇所**: `skillCreatorAPI` 定数の末尾（`onApprovalRequest` の直後）

```typescript
// TASK-SW-CANCEL-002: スキル生成キャンセル
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

### 3-2. safeInvoke 呼び出しパターン詳細

```
cancelGeneration()
  └── safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)
        └── invokeWithTimeout<IpcResult<void>>(ALLOWED_INVOKE_CHANNELS, "skill-creator:cancel")
              ├── ホワイトリスト検証: ALLOWED_INVOKE_CHANNELS.includes("skill-creator:cancel")
              │     → true の場合: ipcRenderer.invoke("skill-creator:cancel") を実行
              │     → false の場合: エラーを返す（セキュリティ拒否）
              └── タイムアウト制御（invokeWithTimeout の責務）
```

### 3-3. 実装一貫性の根拠

| 観点                    | 選択                                              | 根拠                                                          |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| 直接 `ipcRenderer` 禁止 | `safeInvoke` 経由                                 | Electron コンテキスト分離・ホワイトリスト検証を必ず通過させる |
| 型引数の明示            | `safeInvoke<IpcResult<void>>`                     | 型推論ではなく明示的型付けで型安全性を保証                    |
| チャンネル定数参照      | `IPC_CHANNELS.SKILL_CREATOR_CANCEL`               | 文字列リテラル直書き禁止。定数変更時に一元管理可能            |
| arrow function スタイル | `(): Promise<IpcResult<void>> => safeInvoke(...)` | `skillCreatorAPI` オブジェクト内の全メソッドと統一スタイル    |

---

## 4. ホワイトリスト設計

### 4-1. ALLOWED_INVOKE_CHANNELS への登録

**登録箇所**: `channels.ts` 内の `ALLOWED_INVOKE_CHANNELS` 配列

```typescript
// Skill Creator cancel channel (TASK-SW-CANCEL-002)
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

**登録位置**: SKILL_CREATOR 系拡張チャンネル（TASK-9B Phase 5）の直後、Skill file operations（TASK-9A-B）の直前

### 4-2. チャンネル値の設計

| 項目         | 値                       | 根拠                                    |
| ------------ | ------------------------ | --------------------------------------- |
| チャンネル名 | `"skill-creator:cancel"` | `"<domain>:<action>"` 命名規則に準拠    |
| ドメイン部   | `skill-creator`          | 既存の SKILL_CREATOR 系チャンネルと一致 |
| アクション部 | `cancel`                 | キャンセル操作を端的に表現              |

### 4-3. ホワイトリスト方式の意義

`ALLOWED_INVOKE_CHANNELS` によるホワイトリスト制御は Electron のコンテキスト分離モデルに基づくセキュリティ機構である。

- renderer プロセスは任意のチャンネル名で IPC 通信できない
- preload が明示的に許可したチャンネルのみ `ipcRenderer.invoke` を実行可能
- `safeInvoke` 内の `invokeWithTimeout` がこの検証を実施する

`SKILL_CREATOR_CANCEL` を登録することで、renderer から `cancelGeneration()` を呼び出した際に main プロセスへの IPC 送信が正当に許可される。

---

## 5. 全体データフロー設計

```
[Renderer Process]
  useCancelGeneration() hook
    └── window.skillCreatorAPI.cancelGeneration()

[Preload (Context Bridge)]
  skillCreatorAPI.cancelGeneration()
    └── safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)
          └── invokeWithTimeout(ALLOWED_INVOKE_CHANNELS, "skill-creator:cancel")
                └── ipcRenderer.invoke("skill-creator:cancel")

[Main Process]
  ipcMain.handle("skill-creator:cancel", ...)
    └── SkillCreatorService.cancelGeneration()
          └── AbortController.abort()

[Response Flow]
  Main → Preload → Renderer
  IpcResult<void> { success: true } or { success: false, error: "..." }
```

---

## 6. テスト設計方針

実装済みコードに対するテストファイルを新規作成する。

### 6-1. テスト対象

| テスト対象                                      | テストの観点                                                |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `cancelGeneration` インターフェース型定義       | TypeScript 型チェックで検証（`pnpm typecheck`）             |
| `cancelGeneration` 実装 → `safeInvoke` 呼び出し | `safeInvoke` のモックで正しいチャンネルが渡されることを確認 |
| `ALLOWED_INVOKE_CHANNELS` への登録              | 配列に `"skill-creator:cancel"` が含まれることを確認        |

### 6-2. テストファイル配置方針

```
apps/desktop/src/preload/
  __tests__/
    skill-creator-api.cancelGeneration.test.ts  # cancelGeneration UT
    channels.allowedInvokeChannels.test.ts       # ホワイトリスト確認（既存テストへの追加も可）
```

### 6-3. モック戦略

- `ipcRenderer` を Vitest の `vi.mock` でモック化
- `safeInvoke` の呼び出し引数（チャンネル名）を `expect` で検証
- 成功レスポンス `{ success: true }` と失敗レスポンス `{ success: false, error: "..." }` の両ケースをテスト

---

## 7. 設計制約・リスク

| 項目                      | 内容                                                                                     | 対策                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Main プロセス未実装リスク | `ipcMain.handle("skill-creator:cancel", ...)` が未実装の場合、IPC 呼び出しがエラーを返す | 本タスクの scope 外。TASK-SW-CANCEL-001 で実装済みを確認済み                  |
| タイムアウト超過リスク    | キャンセル応答が遅延した場合、`invokeWithTimeout` がタイムアウトエラーを返す             | `IpcResult<void> { success: false, error: "timeout" }` として renderer に通知 |
| 二重キャンセルリスク      | 短期間に複数回 `cancelGeneration` が呼び出された場合の重複実行                           | Main プロセス側で冪等性を担保する設計（本タスクスコープ外）                   |
