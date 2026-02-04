# 型マッピング表: TASK-FIX-1-1-TYPE-ALIGNMENT

## 1. SkillStreamMessageType マッピング

### 1.1 値の対応

| skill-execution.ts（旧・削除） | skill.ts（新・維持） | 用途                     |
| ------------------------------ | -------------------- | ------------------------ |
| `"text"`                       | `"assistant"`        | アシスタントテキスト出力 |
| `"tool_use"`                   | `"tool_use"`         | ツール使用開始           |
| `"error"`                      | `"error"`            | エラー発生               |
| `"complete"`                   | `"status"`           | 完了ステータス           |
| -                              | `"tool_result"`      | ツール結果（新規維持）   |

### 1.2 実装への影響

`"text"` → `"assistant"` の変換が必要なコードがある場合は、実装時に確認が必要。

---

## 2. SkillStreamMessage 構造マッピング

### 2.1 skill-execution.ts（旧・削除）

```typescript
interface SkillStreamMessage {
  executionId: string;
  id: string; // ← skill.tsには存在しない
  type: SkillStreamMessageType;
  content: string; // ← 単純な文字列
  timestamp: number;
  isComplete: boolean; // ← skill.tsには存在しない
}
```

### 2.2 skill.ts（新・維持）

```typescript
type SkillStreamMessage =
  | {
      executionId: string;
      type: "assistant";
      content: AssistantMessageContent; // ← 型付きオブジェクト
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseMessageContent; // ← 型付きオブジェクト
      timestamp: number;
    };
// ... 他のDiscriminated Union
```

### 2.3 構造の違い

| フィールド    | skill-execution.ts | skill.ts           | 備考                 |
| ------------- | ------------------ | ------------------ | -------------------- |
| `executionId` | string             | string             | 同一                 |
| `id`          | string             | -                  | 削除（不要）         |
| `type`        | 4種類              | 5種類              | 値が異なる           |
| `content`     | string             | 型付きオブジェクト | **重大な差異**       |
| `timestamp`   | number             | number             | 同一                 |
| `isComplete`  | boolean            | -                  | 削除（statusで表現） |

---

## 3. SkillExecutionRequest マッピング

### 3.1 skill-execution.ts（旧・削除）

```typescript
interface SkillExecutionRequest {
  prompt: string;
  skillId?: string;
  skillName?: string;
  timeout?: number;
  sessionId?: string;
}
```

### 3.2 skill.ts（新・維持）

```typescript
interface SkillExecutionRequest {
  skillName: string;
  prompt: string;
  workingDirectory?: string;
}
```

### 3.3 フィールドマッピング

| skill-execution.ts | skill.ts           | 対応                 |
| ------------------ | ------------------ | -------------------- |
| `prompt`           | `prompt`           | 同一                 |
| `skillId`          | -                  | 削除（不使用）       |
| `skillName`        | `skillName`        | **必須に変更**       |
| `timeout`          | -                  | 削除（別途設定）     |
| `sessionId`        | -                  | 削除（別途設定）     |
| -                  | `workingDirectory` | 新規（skill.ts固有） |

---

## 4. SkillExecutionResponse マッピング

### 4.1 skill-execution.ts（旧・削除）

```typescript
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError; // ← SkillExecutionError型
}
```

### 4.2 skill.ts（新・維持）

```typescript
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: string; // ← 単純な文字列
}
```

### 4.3 フィールドマッピング

| フィールド    | skill-execution.ts  | skill.ts | 対応           |
| ------------- | ------------------- | -------- | -------------- |
| `executionId` | string              | string   | 同一           |
| `success`     | boolean             | boolean  | 同一           |
| `error`       | SkillExecutionError | string   | **型が異なる** |

**対応方針**: skill.ts の `error?: string` を維持し、詳細エラーは別途 `SkillExecutionError` 型で管理。

---

## 5. 移行対象型（新規追加）

### 5.1 skill.ts に追加する型

| 型名                       | 元定義                      | 用途                 |
| -------------------------- | --------------------------- | -------------------- |
| `ExecutionState`           | skill-execution.ts L10-15   | 実行状態管理         |
| `ExecutionInfo`            | skill-execution.ts L48-59   | 実行情報             |
| `SkillExecutionErrorCode`  | skill-execution.ts L87-96   | エラーコード         |
| `SkillExecutionError`      | skill-execution.ts L101-108 | エラー詳細           |
| `ExecutionContext`         | skill-execution.ts L113-126 | 内部実行コンテキスト |
| `SKILL_EXECUTION_DEFAULTS` | skill-execution.ts L131-142 | デフォルト設定定数   |

---

## 6. 後方互換性への影響

### 6.1 破壊的変更

| 変更点                            | 影響                        | 対応                 |
| --------------------------------- | --------------------------- | -------------------- |
| SkillStreamMessage.content型変更  | string → 型付きオブジェクト | 呼び出し元の修正必須 |
| SkillStreamMessage.id 削除        | 参照箇所でエラー            | 削除または代替実装   |
| SkillStreamMessage.isComplete削除 | 参照箇所でエラー            | status型で判定に変更 |

### 6.2 影響を受けるコンポーネント

- `SkillStreamDisplay.tsx`: content処理の修正
- `useSkillExecution.ts`: メッセージ処理の修正
- テストファイル: モックデータの修正
