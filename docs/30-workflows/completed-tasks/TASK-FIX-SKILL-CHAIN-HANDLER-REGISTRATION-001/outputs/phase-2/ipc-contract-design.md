# Phase 2: IPC 契約設計書

> **タスク**: TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
> **日付**: 2026-03-03
> **準拠**: ipc-contract-checklist.md Phase 1-6

---

## 1. チャンネル一覧と契約

### 1.1 skill:chain:list

| 項目                 | 内容                                                           |
| -------------------- | -------------------------------------------------------------- |
| **チャンネル名**     | `IPC_CHANNELS.SKILL_CHAIN_LIST` = `"skill:chain:list"`         |
| **Preload メソッド** | `chainList()`                                                  |
| **引数**             | なし                                                           |
| **戻り値**           | `IpcResult<SkillChainDefinition[]>`                            |
| **バリデーション**   | validateIpcSender のみ                                         |
| **エラーケース**     | UNAUTHORIZED（sender不正）、内部エラー（sanitizeErrorMessage） |

### 1.2 skill:chain:get

| 項目                           | 内容                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| **チャンネル名**               | `IPC_CHANNELS.SKILL_CHAIN_GET` = `"skill:chain:get"`              |
| **Preload メソッド**           | `chainGet(chainId: string)`                                       |
| **Preload 送信形式**           | `safeInvokeUnwrap(CHANNEL, { chainId })`                          |
| **ハンドラ受信形式（修正前）** | `(event, chainId: unknown)` — **P44 不整合**                      |
| **ハンドラ受信形式（修正後）** | `(event, args: unknown)` → `args.chainId` をデストラクチャ        |
| **戻り値**                     | `IpcResult<SkillChainDefinition \| null>`                         |
| **バリデーション**             | validateIpcSender + P42 3段バリデーション（chainId）              |
| **エラーケース**               | UNAUTHORIZED、VALIDATION_ERROR（chainId 空/非文字列）、内部エラー |

#### P44 修正詳細

```typescript
// ❌ 修正前: Preload は { chainId } を送るが、ハンドラは直接受け取る
async (event: IpcMainInvokeEvent, chainId: unknown) => {
  validateStringArg(chainId, "chainId"); // typeof { chainId: "..." } !== "string" → エラー
};

// ✅ 修正後: オブジェクト形式で受け取り、デストラクチャ
async (event: IpcMainInvokeEvent, args: unknown) => {
  if (!args || typeof args !== "object") {
    return { success: false, error: "args must be an object" };
  }
  const { chainId } = args as { chainId: unknown };
  const chainIdError = validateStringArg(chainId, "chainId");
  if (chainIdError) return chainIdError;
  // ...
};
```

### 1.3 skill:chain:save

| 項目                 | 内容                                                                |
| -------------------- | ------------------------------------------------------------------- |
| **チャンネル名**     | `IPC_CHANNELS.SKILL_CHAIN_SAVE` = `"skill:chain:save"`              |
| **Preload メソッド** | `chainSave(chain: SkillChainDefinition)`                            |
| **Preload 送信形式** | `safeInvokeUnwrap(CHANNEL, chain)`                                  |
| **ハンドラ受信形式** | `(event, chain: unknown)` — **一致**                                |
| **戻り値**           | `IpcResult<SkillChainDefinition>`                                   |
| **バリデーション**   | validateIpcSender + オブジェクト検証 + chain.name P42 3段           |
| **エラーケース**     | UNAUTHORIZED、VALIDATION_ERROR（非オブジェクト/name空）、内部エラー |

### 1.4 skill:chain:delete

| 項目                           | 内容                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| **チャンネル名**               | `IPC_CHANNELS.SKILL_CHAIN_DELETE` = `"skill:chain:delete"`        |
| **Preload メソッド**           | `chainDelete(chainId: string)`                                    |
| **Preload 送信形式**           | `safeInvokeUnwrap(CHANNEL, { chainId })`                          |
| **ハンドラ受信形式（修正前）** | `(event, chainId: unknown)` — **P44 不整合**                      |
| **ハンドラ受信形式（修正後）** | `(event, args: unknown)` → `args.chainId` をデストラクチャ        |
| **戻り値**                     | `IpcResult<{ deleted: boolean }>`                                 |
| **バリデーション**             | validateIpcSender + P42 3段バリデーション（chainId）              |
| **エラーケース**               | UNAUTHORIZED、VALIDATION_ERROR（chainId 空/非文字列）、内部エラー |

#### P44 修正詳細

`skill:chain:get` と同一パターン。修正方法も同一。

### 1.5 skill:chain:execute

| 項目                 | 内容                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| **チャンネル名**     | `IPC_CHANNELS.SKILL_CHAIN_EXECUTE` = `"skill:chain:execute"`                  |
| **Preload メソッド** | `chainExecute(chainId: string)`                                               |
| **Preload 送信形式** | `safeInvokeUnwrap(CHANNEL, { chainId })`                                      |
| **ハンドラ受信形式** | `(event, args: unknown)` → `{ chainId, variables }` — **一致**                |
| **戻り値**           | `IpcResult<SkillChainResult>`                                                 |
| **バリデーション**   | validateIpcSender + オブジェクト検証 + chainId P42 3段                        |
| **エラーケース**     | UNAUTHORIZED、VALIDATION_ERROR、BUSINESS_ERROR（chain not found）、内部エラー |

## 2. バリデーション詳細

### 2.1 sender 検証（全5チャンネル共通）

```typescript
const validation = validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 2.2 P42 準拠 3段バリデーション（chainId に適用）

```typescript
function validateStringArg(value: unknown, argName: string) {
  // 1. 型チェック
  if (typeof value !== "string") return error;
  // 2. 空文字列チェック（暗黙的に .trim() で3を含む）
  if (value.trim() === "") return error;
  // 3. トリム空文字列チェック（上記で包含）
  return null;
}
```

### 2.3 オブジェクト検証（chain:save, chain:execute）

```typescript
if (!args || typeof args !== "object") {
  return { success: false, error: "args must be an object" };
}
```

## 3. エラーレスポンス形式

全チャンネル共通で `IpcResult<T>` 形式を使用:

```typescript
// 成功
{ success: true, data: T }

// 失敗
{ success: false, error: string }
```

エラーメッセージは `sanitizeErrorMessage()` でサニタイズ:

- スタックトレース除去
- ファイルパス `[path]` 置換
- IP アドレス `[host]` 置換
- 機密情報マスク

## 4. 契約整合チェックリスト（ipc-contract-checklist.md 準拠）

| Phase | チェック項目                                      | 状態                                 |
| ----- | ------------------------------------------------- | ------------------------------------ |
| 1     | チャンネル名が IPC_CHANNELS 定数で定義            | OK（channels.ts 行214-219）          |
| 2     | ホワイトリストに登録                              | OK（channels.ts 行496-501）          |
| 3     | Preload メソッドが safeInvokeUnwrap で呼び出し    | OK（skill-api.ts 行599-621）         |
| 4     | ハンドラ引数形式と Preload 送信形式が一致         | **NG** → chainGet/chainDelete を修正 |
| 5     | 引数名のセマンティクスが実際の値と一致（P45対策） | OK（chainId は ID を表す）           |
| 6     | P42 3段バリデーション                             | OK（validateStringArg 使用）         |

## 5. 型定義の参照先

| 型名                             | 定義ファイル   |
| -------------------------------- | -------------- |
| `SkillChainDefinition`           | `@repo/shared` |
| `SkillChainResult`               | `@repo/shared` |
| `StepResult`                     | `@repo/shared` |
| `InputMapping` / `OutputMapping` | `@repo/shared` |
| `SkillChainCondition`            | `@repo/shared` |
