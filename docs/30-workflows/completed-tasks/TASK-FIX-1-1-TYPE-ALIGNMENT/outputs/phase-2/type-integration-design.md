# 型統合設計書: TASK-FIX-1-1-TYPE-ALIGNMENT

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-FIX-1-1-TYPE-ALIGNMENT |
| Phase    | 2                           |
| 作成日   | 2026-02-04                  |

---

## 1. 統合方針

### 1.1 正となる型定義

`@repo/shared/src/types/skill.ts` を正とし、仕様書（specification.md §5.1）に準拠する。

### 1.2 統合対象ファイル

- **移行元**: `packages/shared/src/types/skill-execution.ts`
- **移行先**: `packages/shared/src/types/skill.ts`

---

## 2. 型移行設計

### 2.1 移行対象（skill-execution.ts → skill.ts）

| 型名                       | 移行先セクション   | 備考                       |
| -------------------------- | ------------------ | -------------------------- |
| `ExecutionState`           | 実行関連型（§5.1） | SkillExecutionStatusと併存 |
| `ExecutionInfo`            | 実行関連型（§5.1） | 内部用として維持           |
| `SkillExecutionErrorCode`  | 実行関連型（§5.1） | 新規追加                   |
| `SkillExecutionError`      | 実行関連型（§5.1） | 新規追加                   |
| `ExecutionContext`         | 実行関連型（§5.1） | 内部用として維持           |
| `SKILL_EXECUTION_DEFAULTS` | 定数セクション     | 新規セクション追加         |

### 2.2 削除対象（skill-execution.tsから削除）

| 型名                     | 理由                                      |
| ------------------------ | ----------------------------------------- |
| `SkillStreamMessage`     | skill.tsにDiscriminated Union版が既に存在 |
| `SkillStreamMessageType` | skill.tsに正しい5種類の定義が既に存在     |
| `SkillExecutionRequest`  | skill.tsに定義が既に存在                  |
| `SkillExecutionResponse` | skill.tsに定義が既に存在                  |

---

## 3. SkillStreamMessageType 統合設計

### 3.1 型マッピング

| skill-execution.ts（削除） | skill.ts（維持） | 備考                            |
| -------------------------- | ---------------- | ------------------------------- |
| `"text"`                   | `"assistant"`    | テキスト出力                    |
| `"tool_use"`               | `"tool_use"`     | 変更なし                        |
| `"error"`                  | `"error"`        | 変更なし                        |
| `"complete"`               | `"status"`       | status.status="completed"で表現 |
| -                          | `"tool_result"`  | 維持（skill.ts固有）            |

### 3.2 正となる定義

```typescript
export type SkillStreamMessageType =
  | "assistant"
  | "tool_use"
  | "tool_result"
  | "status"
  | "error";
```

---

## 4. skill.ts への追加内容

### 4.1 実行状態型（ExecutionState）

```typescript
/**
 * 実行状態
 * @see specification.md §5.1 ExecutionState
 */
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";
```

### 4.2 実行情報型（ExecutionInfo）

```typescript
/**
 * 実行情報
 */
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

### 4.3 エラー関連型

```typescript
/**
 * スキル実行エラーコード
 */
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

/**
 * スキル実行エラー
 */
export interface SkillExecutionError {
  /** エラーコード */
  code: SkillExecutionErrorCode;
  /** エラーメッセージ */
  message: string;
  /** 追加情報（オプション） */
  details?: unknown;
}
```

### 4.4 実行コンテキスト型

```typescript
/**
 * 実行コンテキスト（内部用）
 */
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

### 4.5 デフォルト設定定数

```typescript
/**
 * スキル実行設定定数
 */
export const SKILL_EXECUTION_DEFAULTS = {
  /** デフォルトタイムアウト（ミリ秒） */
  DEFAULT_TIMEOUT: 30000,
  /** 最大同時実行数 */
  MAX_CONCURRENT_EXECUTIONS: 5,
  /** 最大リトライ回数 */
  MAX_RETRIES: 3,
  /** 初回リトライ待機時間（ミリ秒） */
  INITIAL_RETRY_DELAY: 1000,
  /** 最大リトライ待機時間（ミリ秒） */
  MAX_RETRY_DELAY: 4000,
} as const;
```

---

## 5. index.ts re-export 設計

### 5.1 現状

```typescript
// skill-execution.ts からのエクスポート
export type {
  ExecutionState,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
  SkillStreamMessageType,
  SkillStreamMessage,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
} from "./skill-execution";

export { SKILL_EXECUTION_DEFAULTS } from "./skill-execution";
```

### 5.2 修正後

```typescript
// skill-execution.ts からのエクスポートを削除
// skill.ts から全てエクスポート（既に export * from "./skill" が存在）

// 明示的なエクスポート追加（必要に応じて）
export type {
  ExecutionState,
  ExecutionInfo,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
} from "./skill";

export { SKILL_EXECUTION_DEFAULTS } from "./skill";
```

---

## 6. 統合テスト連携設計

| 統合ポイント      | 契約定義                                 |
| ----------------- | ---------------------------------------- |
| IPC skill:stream  | `SkillStreamMessage`型でのストリーミング |
| IPC skill:execute | `SkillExecutionRequest`/`Response`型     |
| Store → Component | `SkillExecutionStatus`型の状態伝播       |

---

## 7. アーキテクチャ層別設計

| 層           | 設計観点                          | 実装ファイル                            |
| ------------ | --------------------------------- | --------------------------------------- |
| Shared       | 型定義の集約、re-exportの整理     | `packages/shared/src/types/skill.ts`    |
| Main Process | IPCハンドラーでの型使用箇所特定   | `apps/desktop/src/main/ipc/`            |
| Renderer     | Component/Hooksでの型使用箇所特定 | `apps/desktop/src/renderer/`            |
| IPC通信      | チャンネル型定義の整合性確認      | `apps/desktop/src/preload/skill-api.ts` |

---

## 8. 移行手順

1. **Step 1**: skill.tsに移行対象の型を追加
2. **Step 2**: index.tsのre-exportを修正
3. **Step 3**: 影響ファイルのimport文を修正
4. **Step 4**: skill-execution.tsを削除
5. **Step 5**: 型チェック・テスト実行
