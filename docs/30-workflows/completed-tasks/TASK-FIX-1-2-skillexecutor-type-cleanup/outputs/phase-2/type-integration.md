# 型統合詳細設計書

## タスク情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | TASK-FIX-1-2                       |
| タスク名 | SkillExecutor 型定義クリーンアップ |
| 作成日   | 2026-02-07                         |
| Phase    | 2 - 設計                           |

---

## 1. 型統合サマリー

### 1.1 対象型一覧

| #   | 型名                    | 行番号   | 正本との比較 | 対応方針          | 変更量 |
| --- | ----------------------- | -------- | ------------ | ----------------- | ------ |
| 1   | ExecutionState          | L31-36   | 完全一致     | 削除 + import     | 小     |
| 2   | SkillExecutionRequest   | L67-74   | 差異あり     | 正本拡張 + import | 中     |
| 3   | SkillExecutionResponse  | L77-81   | 差異あり     | 正本拡張 + import | 中     |
| 4   | ExecutionInfo           | L84-90   | 完全一致     | 削除 + import     | 小     |
| 5   | SkillStreamMessage      | L100-108 | 大きな差異   | リネーム維持      | 小     |
| 6   | SkillExecutionErrorCode | L110-120 | 完全一致     | 削除 + import     | 小     |
| 7   | SkillExecutionError     | L122-127 | 完全一致     | 削除 + import     | 小     |
| 8   | ExecutionContext        | L129-137 | 完全一致     | 削除 + import     | 小     |

---

## 2. 完全一致型の詳細（5型）

### 2.1 ExecutionState

**SkillExecutor.ts（L31-36）**:

```typescript
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";
```

**正本（L519-524）**:

```typescript
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";
```

**比較結果**: 完全一致

**対応**: ローカル定義を削除し、`@repo/shared` から import

---

### 2.2 ExecutionInfo

**SkillExecutor.ts（L84-90）**:

```typescript
export interface ExecutionInfo {
  id: string;
  skillId: string;
  state: ExecutionState;
  startedAt: number;
  completedAt?: number;
}
```

**正本（L529-544）**:

```typescript
export interface ExecutionInfo {
  /** 実行ID */
  id: string;

  /** スキルID */
  skillId: string;

  /** 実行状態 */
  state: ExecutionState;

  /** 実行開始時刻（UNIXタイムスタンプ） */
  startedAt: number;

  /** 実行完了時刻（UNIXタイムスタンプ、オプション） */
  completedAt?: number;
}
```

**比較結果**: 完全一致（JSDoc コメントの有無のみ異なる）

**対応**: ローカル定義を削除し、`@repo/shared` から import

---

### 2.3 SkillExecutionErrorCode

**SkillExecutor.ts（L110-120）**:

```typescript
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED"
  | "TIMEOUT"
  | "ABORTED"
  | "MAX_CONCURRENT_EXCEEDED"
  | "SKILL_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "SDK_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR";
```

**正本（L549-558）**:

```typescript
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED"
  | "TIMEOUT"
  | "ABORTED"
  | "MAX_CONCURRENT_EXCEEDED"
  | "SKILL_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "SDK_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR";
```

**比較結果**: 完全一致

**対応**: ローカル定義を削除し、`@repo/shared` から import

---

### 2.4 SkillExecutionError

**SkillExecutor.ts（L122-127）**:

```typescript
export interface SkillExecutionError {
  code: SkillExecutionErrorCode;
  message: string;
  details?: unknown;
}
```

**正本（L563-572）**:

```typescript
export interface SkillExecutionError {
  /** エラーコード */
  code: SkillExecutionErrorCode;

  /** エラーメッセージ */
  message: string;

  /** 追加情報（オプション） */
  details?: unknown;
}
```

**比較結果**: 完全一致（JSDoc コメントの有無のみ異なる）

**対応**: ローカル定義を削除し、`@repo/shared` から import

---

### 2.5 ExecutionContext

**SkillExecutor.ts（L129-137）**:

```typescript
export interface ExecutionContext {
  id: string;
  skillId: string;
  abortController: AbortController;
  state: ExecutionState;
  startedAt: number;
  completedAt?: number;
}
```

**正本（L577-595）**:

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

  /** 実行開始時刻 */
  startedAt: number;

  /** 実行完了時刻 */
  completedAt?: number;
}
```

**比較結果**: 完全一致（JSDoc コメントの有無のみ異なる）

**対応**: ローカル定義を削除し、`@repo/shared` から import

---

## 3. 差異型の詳細（2型）

### 3.1 SkillExecutionRequest

**SkillExecutor.ts（L67-74）**:

```typescript
export interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
  retryConfig?: Partial<RetryConfig>;
}
```

**正本（L310-319）**:

```typescript
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;
}
```

**差異分析**:

| プロパティ       | SkillExecutor.ts        | 正本            | 差異         |
| ---------------- | ----------------------- | --------------- | ------------ |
| prompt           | `string` (必須)         | `string` (必須) | 一致         |
| skillId          | `string` (必須)         | なし            | ローカルのみ |
| skillName        | なし                    | `string` (必須) | 正本のみ     |
| timeout          | `number?`               | なし            | ローカルのみ |
| sessionId        | `string?`               | なし            | ローカルのみ |
| retryConfig      | `Partial<RetryConfig>?` | なし            | ローカルのみ |
| workingDirectory | なし                    | `string?`       | 正本のみ     |

**統合方針**:

```typescript
// packages/shared/src/types/skill.ts（拡張後）
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;

  /** スキルID（オプション、skillName の代替として使用可能） */
  skillId?: string;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;

  /** タイムアウト（ミリ秒） */
  timeout?: number;

  /** セッションID */
  sessionId?: string;

  /** リトライ設定（部分指定可能） */
  retryConfig?: Partial<RetryConfig>;
}
```

**影響**:

- SkillExecutor.ts: `skillName` が必須になるため、execute() 呼び出し元で対応が必要
- 対策: SkillMetadata の `name` を `skillName` として渡すよう修正

---

### 3.2 SkillExecutionResponse

**SkillExecutor.ts（L77-81）**:

```typescript
export interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
}
```

**正本（L324-333）**:

```typescript
export interface SkillExecutionResponse {
  /** 実行ID（UUID、Main側で生成） */
  executionId: string;

  /** 開始成功かどうか */
  success: boolean;

  /** エラーメッセージ（失敗時） */
  error?: string;
}
```

**差異分析**:

| プロパティ  | SkillExecutor.ts       | 正本             | 差異           |
| ----------- | ---------------------- | ---------------- | -------------- |
| executionId | `string` (必須)        | `string` (必須)  | 一致           |
| success     | `boolean` (必須)       | `boolean` (必須) | 一致           |
| error       | `SkillExecutionError?` | `string?`        | **型が異なる** |

**統合方針**:

```typescript
// packages/shared/src/types/skill.ts（拡張後）
export interface SkillExecutionResponse {
  /** 実行ID（UUID、Main側で生成） */
  executionId: string;

  /** 開始成功かどうか */
  success: boolean;

  /** エラー情報（失敗時） */
  error?: string | SkillExecutionError;
}
```

**影響**:

- SkillExecutor.ts: 変更不要（`SkillExecutionError` は union 型に含まれる）
- 既存の Renderer 側コード: `string` 型も許容されるため変更不要

---

## 4. リネーム維持型の詳細（1型）

### 4.1 SkillStreamMessage → SkillExecutorStreamMessage

**SkillExecutor.ts（L100-108）**:

```typescript
export interface SkillStreamMessage {
  executionId: string;
  id: string;
  type: SkillStreamMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}
```

**正本（L446-466）**:

```typescript
export type SkillStreamMessage =
  | (BaseStreamMessage & {
      type: "assistant";
      content: AssistantMessageContent;
    })
  | (BaseStreamMessage & {
      type: "tool_use";
      content: ToolUseMessageContent;
    })
  | (BaseStreamMessage & {
      type: "tool_result";
      content: ToolResultMessageContent;
    })
  | (BaseStreamMessage & {
      type: "status";
      content: StatusMessageContent;
    })
  | (BaseStreamMessage & {
      type: "error";
      content: ErrorMessageContent;
    });
```

**差異分析**:

| 観点       | SkillExecutor.ts                       | 正本                                            |
| ---------- | -------------------------------------- | ----------------------------------------------- |
| 型構造     | 単純オブジェクト                       | Discriminated Union                             |
| type 値    | text, tool_use, error, complete, retry | assistant, tool_use, tool_result, status, error |
| content    | `string`                               | type 別に異なる型                               |
| id         | あり                                   | なし                                            |
| isComplete | あり                                   | なし                                            |

**統合不可の理由**:

1. 設計思想が根本的に異なる
2. 完全統合には大規模なリファクタリングが必要
3. IPC 通信のメッセージ形式変更が必要

**対応方針**:

1. `SkillExecutorStreamMessage` にリネームして名前空間の衝突を回避
2. 将来的な統合タスクとして別途対応

**変更箇所**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

// 型定義のリネーム
export type SkillExecutorStreamMessageType =
  | "text"
  | "tool_use"
  | "error"
  | "complete"
  | "retry";

export interface SkillExecutorStreamMessage {
  executionId: string;
  id: string;
  type: SkillExecutorStreamMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}

// メソッド内の型参照更新
private sendStream(message: SkillExecutorStreamMessage): void { ... }
private convertToStreamMessage(...): SkillExecutorStreamMessage | null { ... }
```

---

## 5. 追加型の詳細

### 5.1 RetryConfig

**SkillExecutor.ts（L46-57）**:

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  backoffMultiplier: number;
}
```

**正本への追加**:

```typescript
// packages/shared/src/types/skill.ts

/**
 * リトライ設定
 */
export interface RetryConfig {
  /** 最大リトライ回数 */
  maxRetries: number;

  /** 基本待機時間（ミリ秒） */
  baseDelayMs: number;

  /** 最大待機時間（ミリ秒） */
  maxDelayMs: number;

  /** Jitter範囲（0-1） */
  jitterFactor: number;

  /** バックオフ倍率 */
  backoffMultiplier: number;
}
```

**理由**:

- `SkillExecutionRequest.retryConfig` で使用されるため、正本に追加が必要
- 他モジュールでも再利用可能な汎用的な型

---

## 6. import 文の変更

### 6.1 変更前

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

import type {
  Skill,
  SkillPermissionResponse,
  IPermissionStore,
} from "@repo/shared";
```

### 6.2 変更後

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

import type {
  Skill,
  SkillPermissionResponse,
  IPermissionStore,
  ExecutionState,
  ExecutionInfo,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
  SkillExecutionRequest,
  SkillExecutionResponse,
  RetryConfig,
} from "@repo/shared";
```

---

## 7. 検証項目

### 7.1 型互換性チェック

| チェック項目  | 確認方法         | 期待結果 |
| ------------- | ---------------- | -------- |
| import 解決   | `pnpm typecheck` | PASS     |
| 型互換性      | `pnpm typecheck` | PASS     |
| 未使用 import | `pnpm lint`      | 警告なし |

### 7.2 機能テスト

| チェック項目          | 確認方法       | 期待結果 |
| --------------------- | -------------- | -------- |
| execute() 正常系      | ユニットテスト | PASS     |
| execute() エラー系    | ユニットテスト | PASS     |
| abort()               | ユニットテスト | PASS     |
| getActiveExecutions() | ユニットテスト | PASS     |
| getExecutionStatus()  | ユニットテスト | PASS     |

---

## 8. 実装手順（詳細）

### Step 1: 正本拡張

1. `packages/shared/src/types/skill.ts` を編集
   - `RetryConfig` インターフェースを追加
   - `SkillExecutionRequest` を拡張
   - `SkillExecutionResponse` を拡張

2. `packages/shared/src/index.ts` を編集
   - 新規追加した型の export を追加

3. 確認
   ```bash
   pnpm --filter @repo/shared build
   pnpm --filter @repo/shared typecheck
   ```

### Step 2: SkillExecutor.ts クリーンアップ

1. import 文を更新
   - `@repo/shared` からの import に型を追加

2. 完全一致型（5型）を削除
   - ExecutionState
   - ExecutionInfo
   - SkillExecutionErrorCode
   - SkillExecutionError
   - ExecutionContext

3. 差異型（2型）を削除
   - SkillExecutionRequest
   - SkillExecutionResponse

4. SkillStreamMessage をリネーム
   - SkillStreamMessageType → SkillExecutorStreamMessageType
   - SkillStreamMessage → SkillExecutorStreamMessage

5. 確認
   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/desktop lint
   ```

### Step 3: テスト更新

1. テストコードの import 更新
2. 型参照の更新
3. 確認
   ```bash
   pnpm --filter @repo/desktop test
   ```

---

## 9. ロールバック手順

問題発生時のロールバック手順：

1. `git stash` で現在の変更を退避
2. `git checkout -- packages/shared/src/types/skill.ts`
3. `git checkout -- apps/desktop/src/main/services/skill/SkillExecutor.ts`
4. `pnpm install && pnpm build` で再ビルド
5. `pnpm test` で正常動作を確認
