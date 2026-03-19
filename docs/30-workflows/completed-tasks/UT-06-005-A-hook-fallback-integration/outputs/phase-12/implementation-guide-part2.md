# Phase 12 実装ガイド Part 2: 開発者向け技術詳細

## 1. 新規追加クラス/メソッド

| 名前                               | 種別             | 場所               | 行番号     | 説明                                |
| ---------------------------------- | ---------------- | ------------------ | ---------- | ----------------------------------- |
| `PermissionTimeoutError`           | クラス（export） | `SkillExecutor.ts` | L260-269   | Permission タイムアウトエラー       |
| `handlePermissionCheck`            | private メソッド | `SkillExecutor.ts` | L1590-1665 | Permission チェックのメインロジック |
| `sendPermissionRequestWithTimeout` | private メソッド | `SkillExecutor.ts` | L1544-1576 | タイムアウト付き Permission 要求    |

### 呼び出し関係

```
createHooks() → PreToolUse Hook (L1196-1197)
  └→ handlePermissionCheck(executionId, toolName, args, signal)
       ├→ sendPermissionRequestWithTimeout(...)  ← Promise.race タイムアウト
       │    └→ sendPermissionRequest(...)         ← 既存メソッド（変更なし）
       ├→ processPermissionFallback(response, context)  ← UT-06-005 で実装済み
       │    ├→ "approved" → return { proceed: true }
       │    ├→ "skip"     → executeSkipFlow() + return { proceed: false }
       │    ├→ "retry"    → while ループ再実行
       │    └→ "abort"    → throw Error
       └→ [catch] fail-closed (NFR-101)
            ├→ PermissionTimeoutError → executeAbortFlow("timeout")
            ├→ 既に abort 済み        → 再スロー（冪等性ガード）
            └→ 未知例外              → executeAbortFlow("unknown")
```

## 2. TypeScript 型定義

### PermissionTimeoutError

```typescript
/** Permission タイムアウトエラー (FR-102) */
export class PermissionTimeoutError extends Error {
  readonly timeoutMs: number;
  constructor(timeoutMs: number, toolName: string) {
    super(
      `Permission request timed out after ${timeoutMs}ms for tool: ${toolName}`,
    );
    this.name = "PermissionTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}
```

### PreToolUseResult（handlePermissionCheck の戻り値型）

```typescript
type PreToolUseResult = { proceed: true } | { proceed: false; message: string };
```

### PermissionFlowContext（フォールバック分岐で使用）

```typescript
interface PermissionFlowContext {
  executionId: string;
  requestId: string;
  toolName: string;
  retryCount: number;
  maxRetries: number;
}
```

## 3. エラーハンドリング

`handlePermissionCheck` の catch ブロック（L1651-1664）は3つのパスで fail-closed を実現する:

| エラー種別               | 検出方法                             | 処理                                     | abort reason |
| ------------------------ | ------------------------------------ | ---------------------------------------- | ------------ |
| `PermissionTimeoutError` | `instanceof` チェック                | `executeAbortFlow("timeout")` + 再スロー | `"timeout"`  |
| abort 済み例外           | `abortedExecutions.has(executionId)` | 再スローのみ（二重abort防止）            | -            |
| 未知例外                 | 上記以外                             | `executeAbortFlow("unknown")` + 再スロー | `"unknown"`  |

全てのパスで `throw error` による再スローが保証されており、例外を握りつぶすパスは存在しない。

### abort 冪等性ガード

`executeAbortFlow` 内部で `abortedExecutions: Set<string>` を使用し、同一 `executionId` に対する二重 abort を防止する（NFR-103）。

## 4. 設定値

| 設定値                   | デフォルト      | ソース                                                   | 説明                                                                     |
| ------------------------ | --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `permissionTimeoutMs`    | `30000`（30秒） | `this.config?.permissionTimeoutMs ?? DEFAULT_TIMEOUT_MS` | sendPermissionRequestWithTimeout のタイムアウト時間                      |
| `PERMISSION_MAX_RETRIES` | 定数            | `SkillExecutor.ts` モジュールスコープ                    | retry の最大回数。超過時は `processPermissionFallback` が `abort` を返す |
| `DEFAULT_TIMEOUT_MS`     | `30000`         | L257                                                     | タイムアウトのデフォルト定数                                             |

## 5. 既存コードへの影響

| 既存機能                         | 影響         | 詳細                                                                                      |
| -------------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| FR-001（ツール種別判定）         | **変更なし** | PreToolUse Hook の先頭で実行される。handlePermissionCheck はその後に挿入                  |
| FR-002（許可済みツール自動承認） | **変更なし** | 自動承認ツールは handlePermissionCheck 到達前に return される                             |
| FR-003（ツール実行開始通知）     | **変更なし** | 通知後に handlePermissionCheck が呼ばれる                                                 |
| `sendPermissionRequest`          | **変更なし** | ラッパー（`sendPermissionRequestWithTimeout`）を追加。既存メソッドに breaking change なし |
| `processPermissionFallback`      | **変更なし** | UT-06-005 で実装済み。handlePermissionCheck から呼び出すだけ                              |

### 挿入位置

```typescript
// createHooks() 内の PreToolUse Hook
// L1196-1197: FR-003 の後に挿入
return this.handlePermissionCheck(executionId, input.toolName, input.args);
```
