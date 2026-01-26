# 型定義設計書

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. 概要

skillAPI permission機能に必要な型定義を設計する。既存の`PermissionRequest`型との関係を整理し、新規型の定義場所と内容を明確化する。

---

## 2. 型定義の配置場所

### 2.1 配置方針

| 型                      | 配置場所                            | 理由            |
| ----------------------- | ----------------------------------- | --------------- |
| SkillPermissionRequest  | `apps/desktop/src/preload/types.ts` | Preload固有の型 |
| SkillPermissionResponse | `apps/desktop/src/preload/types.ts` | Preload固有の型 |
| PermissionRequest       | `@repo/shared/types/agent`          | 既存（再利用）  |
| PermissionResponse      | `@repo/shared/types/agent`          | 既存（再利用）  |

### 2.2 既存PermissionRequest型との関係

```typescript
// @repo/shared/types/agent から
export interface PermissionRequest {
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

// SkillPermissionRequestはPermissionRequestを拡張
export interface SkillPermissionRequest extends PermissionRequest {
  executionId: string; // 追加フィールド
  timestamp?: number; // 追加フィールド（オプション）
}
```

**判断**: `SkillPermissionRequest`は`PermissionRequest`を拡張する形で定義

---

## 3. 新規型定義

### 3.1 SkillPermissionRequest

**定義場所**: `apps/desktop/src/preload/types.ts`

```typescript
import type { PermissionRequest } from "@repo/shared/types/agent";

/**
 * スキル権限リクエスト
 *
 * Main ProcessからRenderer Processに送信される権限確認リクエスト。
 * PermissionRequestを拡張し、スキル実行固有のフィールドを追加。
 *
 * @extends PermissionRequest
 */
export interface SkillPermissionRequest extends PermissionRequest {
  /**
   * スキル実行ID
   * SkillExecutor.execute()で生成されるUUID
   */
  executionId: string;

  /**
   * リクエスト生成時刻（Unix timestamp、ミリ秒）
   * オプション：デバッグ・監査用
   */
  timestamp?: number;
}
```

### 3.2 SkillPermissionResponse

**定義場所**: `apps/desktop/src/preload/types.ts`

```typescript
/**
 * スキル権限応答
 *
 * Renderer ProcessからMain Processに送信される権限応答。
 * ユーザーの「許可」「拒否」選択結果を含む。
 */
export interface SkillPermissionResponse {
  /**
   * リクエストID
   * SkillPermissionRequest.requestIdと一致する必要がある
   */
  requestId: string;

  /**
   * 許可された場合 true、拒否された場合 false
   */
  approved: boolean;

  /**
   * 「この選択を記憶する」がチェックされた場合 true
   * Main Process側でツール名と紐付けて保存される（将来実装）
   */
  rememberChoice?: boolean;

  /**
   * 拒否理由（オプション）
   * 将来の拡張用：ユーザーが理由を入力できる場合に使用
   */
  rejectReason?: string;
}
```

---

## 4. 拡張SkillAPIインターフェース

**定義場所**: `apps/desktop/src/preload/skill-api.ts`

```typescript
import type {
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillStreamMessage,
  ExecutionInfo,
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "./types";

/**
 * SkillAPI - Skill 実行関連の Preload API インターフェース
 */
export interface SkillAPI {
  // 既存メソッド
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // 新規追加メソッド
  onPermission: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  respondPermission: (response: SkillPermissionResponse) => Promise<boolean>;
}
```

---

## 5. Window型拡張

**定義場所**: `apps/desktop/src/renderer/types/global.d.ts`（または既存の型定義ファイル）

```typescript
import type { SkillAPI } from "../../preload/skill-api";

declare global {
  interface Window {
    skillAPI: SkillAPI;
    // ... 他の既存定義
  }
}
```

---

## 6. 既存型との互換性

### 6.1 PermissionRequest型（@repo/shared/types/agent）

```typescript
// 既存定義（変更なし）
export interface PermissionRequest {
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}
```

### 6.2 PermissionResponse型（@repo/shared/types/agent）

```typescript
// 既存定義（変更なし）
export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

### 6.3 互換性マトリクス

| フィールド  | PermissionRequest | SkillPermissionRequest | 互換性 |
| ----------- | ----------------- | ---------------------- | ------ |
| requestId   | ✓                 | ✓                      | ✅     |
| toolName    | ✓                 | ✓                      | ✅     |
| args        | ✓                 | ✓                      | ✅     |
| reason      | ✓ (optional)      | ✓ (optional)           | ✅     |
| executionId | ❌                | ✓                      | 拡張   |
| timestamp   | ❌                | ✓ (optional)           | 拡張   |

---

## 7. 型変換関数

### 7.1 SkillPermissionRequest → PermissionRequest

**定義場所**: `apps/desktop/src/renderer/utils/permission-utils.ts`

```typescript
import type { PermissionRequest } from "@repo/shared/types/agent";
import type { SkillPermissionRequest } from "../../preload/types";

/**
 * SkillPermissionRequest を PermissionDialog用の PermissionRequest に変換
 *
 * PermissionDialogコンポーネントが PermissionRequest 型を期待するため、
 * skillAPI から受信した SkillPermissionRequest を変換する。
 *
 * @param skillRequest - スキル権限リクエスト
 * @returns PermissionDialog用のPermissionRequest
 */
export function convertToPermissionRequest(
  skillRequest: SkillPermissionRequest,
): PermissionRequest {
  return {
    requestId: skillRequest.requestId,
    toolName: skillRequest.toolName,
    args: skillRequest.args,
    reason: skillRequest.reason,
  };
}
```

### 7.2 型ガード関数

```typescript
/**
 * SkillPermissionRequest の型ガード
 */
export function isSkillPermissionRequest(
  obj: unknown,
): obj is SkillPermissionRequest {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const request = obj as Record<string, unknown>;

  return (
    typeof request.requestId === "string" &&
    typeof request.executionId === "string" &&
    typeof request.toolName === "string" &&
    typeof request.args === "object" &&
    request.args !== null
  );
}

/**
 * SkillPermissionResponse の型ガード
 */
export function isSkillPermissionResponse(
  obj: unknown,
): obj is SkillPermissionResponse {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const response = obj as Record<string, unknown>;

  return (
    typeof response.requestId === "string" &&
    typeof response.approved === "boolean"
  );
}
```

---

## 8. エクスポート設計

### 8.1 preload/types.ts からのエクスポート

```typescript
// apps/desktop/src/preload/types.ts
export type { SkillPermissionRequest, SkillPermissionResponse };
```

### 8.2 skill-api.ts からのエクスポート

```typescript
// apps/desktop/src/preload/skill-api.ts
export type { SkillAPI };
export { skillAPI };
```

---

## 9. 型定義ファイル一覧

| ファイル                                              | 追加/変更 | 内容                            |
| ----------------------------------------------------- | --------- | ------------------------------- |
| `apps/desktop/src/preload/types.ts`                   | 追加      | SkillPermissionRequest/Response |
| `apps/desktop/src/preload/skill-api.ts`               | 変更      | SkillAPI インターフェース拡張   |
| `apps/desktop/src/renderer/utils/permission-utils.ts` | 新規      | 型変換関数・型ガード            |

---

## 10. テスト用型定義

### 10.1 モック型

```typescript
// テストファイル内で使用
const mockSkillPermissionRequest: SkillPermissionRequest = {
  requestId: "req-test-001",
  executionId: "exec-test-001",
  toolName: "Bash",
  args: { command: "echo test" },
  reason: "コマンドを実行: echo test",
  timestamp: Date.now(),
};

const mockSkillPermissionResponse: SkillPermissionResponse = {
  requestId: "req-test-001",
  approved: true,
  rememberChoice: false,
};
```

---

## 11. 設計判断根拠

### 11.1 PermissionRequestの拡張採用

**判断**: `SkillPermissionRequest`は`PermissionRequest`を`extends`する

**理由**:

- 既存PermissionDialogとの互換性を維持
- 共通フィールドの重複定義を避ける
- 型安全な型変換が可能

### 11.2 preload/types.tsへの配置

**判断**: Preload固有の型は`preload/types.ts`に配置

**理由**:

- Preloadコンテキストで使用される型を集約
- Main Process / Renderer Process 間の境界を明確化
- 既存の型定義パターンとの一貫性
