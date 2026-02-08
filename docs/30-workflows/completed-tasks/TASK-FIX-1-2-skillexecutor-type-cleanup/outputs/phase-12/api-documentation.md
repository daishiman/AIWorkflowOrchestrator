# TASK-FIX-1-2: SkillExecutor 型クリーンアップ API文書

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-FIX-1-2-skillexecutor-type-cleanup |
| Phase    | 12 - ドキュメント作成                   |
| 作成日   | 2026-02-08                              |

---

## 統一された型のAPI仕様

### 1. ExecutionState

実行状態を表すユニオン型。

```typescript
export type ExecutionState =
  | "pending" // 実行待機中
  | "running" // 実行中
  | "completed" // 完了
  | "aborted" // 中断
  | "error"; // エラー
```

#### 使用例

```typescript
import type { ExecutionState } from "@repo/shared";

function isExecutionActive(state: ExecutionState): boolean {
  return state === "pending" || state === "running";
}
```

---

### 2. ExecutionInfo

実行情報を表すインターフェース。Renderer側に公開される情報。

```typescript
export interface ExecutionInfo {
  /** 実行ID */
  id: string;

  /** スキルID */
  skillId: string;

  /** 実行状態 */
  state: ExecutionState;

  /** 実行開始時刻（UNIXタイムスタンプ、ミリ秒） */
  startedAt: number;

  /** 実行完了時刻（UNIXタイムスタンプ、ミリ秒、オプション） */
  completedAt?: number;
}
```

#### 使用例

```typescript
import type { ExecutionInfo } from "@repo/shared";

function formatExecutionDuration(info: ExecutionInfo): string {
  if (!info.completedAt) {
    return "実行中...";
  }
  const durationMs = info.completedAt - info.startedAt;
  return `${(durationMs / 1000).toFixed(2)}秒`;
}
```

---

### 3. SkillExecutionErrorCode

エラーコードを表すユニオン型。

```typescript
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED" // 一般的な実行失敗
  | "TIMEOUT" // タイムアウト
  | "ABORTED" // ユーザーによる中断
  | "MAX_CONCURRENT_EXCEEDED" // 同時実行数超過
  | "SKILL_NOT_FOUND" // スキルが見つからない
  | "VALIDATION_FAILED" // バリデーション失敗
  | "SDK_ERROR" // SDK関連エラー
  | "NETWORK_ERROR" // ネットワークエラー
  | "AUTHENTICATION_ERROR"; // 認証エラー
```

#### エラー分類

| エラーコード            | リトライ可能 | 説明                                     |
| ----------------------- | ------------ | ---------------------------------------- |
| EXECUTION_FAILED        | No           | 一般的な実行失敗                         |
| TIMEOUT                 | Yes          | タイムアウト（リトライで解消する可能性） |
| ABORTED                 | No           | ユーザーが意図的に中断                   |
| MAX_CONCURRENT_EXCEEDED | Yes          | 時間をおいて再試行可能                   |
| SKILL_NOT_FOUND         | No           | スキル定義が存在しない                   |
| VALIDATION_FAILED       | No           | 入力が不正                               |
| SDK_ERROR               | No           | SDK内部エラー                            |
| NETWORK_ERROR           | Yes          | ネットワーク一時障害                     |
| AUTHENTICATION_ERROR    | No           | 認証情報の問題                           |

---

### 4. SkillExecutionError

エラー情報を表すインターフェース。

```typescript
export interface SkillExecutionError {
  /** エラーコード */
  code: SkillExecutionErrorCode;

  /** エラーメッセージ（ユーザー向け） */
  message: string;

  /** 追加情報（デバッグ用、オプション） */
  details?: unknown;
}
```

#### 使用例

```typescript
import type { SkillExecutionError } from "@repo/shared";

function handleError(error: SkillExecutionError): void {
  console.error(`[${error.code}] ${error.message}`);
  if (error.details) {
    console.debug("詳細:", error.details);
  }
}
```

---

### 5. ExecutionContext

実行コンテキスト（Main Process 内部用）。

```typescript
export interface ExecutionContext {
  /** 実行ID */
  id: string;

  /** スキルID */
  skillId: string;

  /** 中断コントローラー */
  abortController: AbortController;

  /** 実行状態 */
  state: ExecutionState;

  /** 実行開始時刻（UNIXタイムスタンプ） */
  startedAt: number;

  /** 実行完了時刻（UNIXタイムスタンプ、オプション） */
  completedAt?: number;
}
```

#### 注意事項

- `ExecutionContext` は Main Process 内部でのみ使用
- `abortController` は Renderer に公開しない
- Renderer には `ExecutionInfo` を使用して情報を公開

---

## インポート方法

### 型のみインポート

```typescript
import type {
  ExecutionState,
  ExecutionInfo,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
} from "@repo/shared";
```

### 定数もインポート

```typescript
import { SKILL_EXECUTION_DEFAULTS } from "@repo/shared";

// 使用例
const timeout = SKILL_EXECUTION_DEFAULTS.DEFAULT_TIMEOUT; // 30000
const maxConcurrent = SKILL_EXECUTION_DEFAULTS.MAX_CONCURRENT_EXECUTIONS; // 5
```

---

## 関連ドキュメント

- [実装ガイド](./implementation-guide.md)
- [型定義ファイル](../../../../../packages/shared/src/types/skill.ts)
- [SkillExecutor本体](../../../../../apps/desktop/src/main/services/skill/SkillExecutor.ts)
