# Phase 2 成果物: API 仕様

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| タスク ID | UT-06-005-A                              |
| フェーズ  | Phase 2 - 設計                           |
| 作成日    | 2026-03-17                               |
| 参照      | `outputs/phase-2/architecture-design.md` |

## 新規コンポーネント仕様

### 1. PermissionTimeoutError

**種別:** クラス（Error 継承）
**配置:** `SkillExecutor.ts` ファイルスコープ（クラス外）

```typescript
class PermissionTimeoutError extends Error {
  constructor(
    public readonly executionId: string,
    public readonly toolName: string,
    timeoutMs: number,
  ) {
    super(
      `Permission request timed out after ${timeoutMs}ms for tool "${toolName}" (executionId: ${executionId})`,
    );
    this.name = "PermissionTimeoutError";
  }
}
```

**責務:** タイムアウト発生を他のエラー種別と区別できるよう型情報を提供する。

---

### 2. sendPermissionRequestWithTimeout

**種別:** private async メソッド
**クラス:** `SkillExecutor`

**シグネチャ:**

```typescript
private async sendPermissionRequestWithTimeout(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal: AbortSignal,
): Promise<SkillPermissionResponse>
```

**パラメータ:**

| パラメータ    | 型                        | 説明                         |
| ------------- | ------------------------- | ---------------------------- |
| `executionId` | `string`                  | スキル実行を一意に識別するID |
| `toolName`    | `string`                  | 実行対象のツール名           |
| `args`        | `Record<string, unknown>` | ツール実行の引数             |
| `signal`      | `AbortSignal`             | キャンセル制御用シグナル     |

**戻り値:** `Promise<SkillPermissionResponse>`

**例外:**

| 例外                     | 発生条件                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| `PermissionTimeoutError` | `DEFAULT_TIMEOUT_MS`（30000ms）以内に応答がない場合                 |
| その他                   | `sendPermissionRequest` が例外をスローした場合（そのまま re-throw） |

**内部動作:**

1. `setTimeout` で `DEFAULT_TIMEOUT_MS` 後に `PermissionTimeoutError` を reject するタイマーを作成
2. `Promise.race([sendPermissionRequest(...), timeoutPromise])` で競合実行
3. 応答取得成功時は `clearTimeout` でタイマーを解放してから戻り値を返す
4. タイムアウト時は `PermissionTimeoutError` がタイムアウト Promise から伝播される

---

### 3. handlePermissionCheck

**種別:** private async メソッド
**クラス:** `SkillExecutor`

**シグネチャ:**

```typescript
private async handlePermissionCheck(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal: AbortSignal,
): Promise<{ proceed: boolean; message?: string }>
```

**パラメータ:**

| パラメータ    | 型                        | 説明                         |
| ------------- | ------------------------- | ---------------------------- |
| `executionId` | `string`                  | スキル実行を一意に識別するID |
| `toolName`    | `string`                  | 実行対象のツール名           |
| `args`        | `Record<string, unknown>` | ツール実行の引数             |
| `signal`      | `AbortSignal`             | キャンセル制御用シグナル     |

**戻り値:** `Promise<{ proceed: boolean; message?: string }>`

| 戻り値パターン                        | 発生条件                            |
| ------------------------------------- | ----------------------------------- |
| `{ proceed: true }`                   | Permission が承認された場合         |
| `{ proceed: false, message: string }` | skip フォールバックが実行された場合 |

**例外（スロー）:**

| 例外         | 発生条件                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| abort エラー | `processPermissionFallback` が `action: "abort"` を返した場合、または max_retries に達した場合 |
| abort エラー | タイムアウトまたは予期しない例外が発生した場合（fail-closed）                                  |

**内部動作:**

1. `retryCount = 0` で初期化
2. while ループで以下を繰り返す:
   a. `sendPermissionRequestWithTimeout` を呼び出す
   b. `response.approved === true` なら `{ proceed: true }` を返す
   c. `processPermissionFallback(response, context)` を呼び出す
   d. fallback.action に応じて分岐:
   - `"approved"` → `{ proceed: true }` を返す
   - `"skip"` → `executeSkipFlow()` を呼び出し `{ proceed: false }` を返す
   - `"retry"` → `retryCount >= PERMISSION_MAX_RETRIES` なら `executeAbortFlow("max_retries")` して throw、そうでなければ `retryCount++` してループ継続
   - `"abort"` → `executeAbortFlow("abort")` して throw
3. 外側 try-catch で任意の例外をキャッチし `executeAbortFlow("error")` して re-throw（fail-closed）

---

## 既存メソッド: PreToolUse Hook 修正箇所

**修正前（変更箇所のみ）:**

```typescript
// L1184 付近（最終 return）
return { proceed: true };
```

**修正後:**

```typescript
// handlePermissionCheck に委譲
return await this.handlePermissionCheck(executionId, toolName, args, signal);
```

**注意:** FR-001〜FR-003 の処理ロジックは一切変更しない。

---

## 既存定数・型（参照のみ）

| 識別子                    | 型        | 値・定義場所    |
| ------------------------- | --------- | --------------- |
| `DEFAULT_TIMEOUT_MS`      | `number`  | `30000`（L257） |
| `PERMISSION_MAX_RETRIES`  | `number`  | `3`（L251）     |
| `PermissionFlowContext`   | interface | L232 付近       |
| `PermissionFlowResult`    | interface | L232 付近       |
| `AbortReason`             | type      | L232 付近       |
| `SkillPermissionResponse` | interface | 既存型定義      |
