# 実装ガイド: スキル型定義の統一

## TASK-FIX-1-1-TYPE-ALIGNMENT

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日   | 2026-02-04                  |

---

# Part 1: 概念的説明（中学生レベル）

## この修正は何をしたの？

スキルの型定義は「**契約書**」のようなものです。

たとえば、宅配便を送るとき、「送り主」「届け先」「中身」を決まったフォーマットで書きますよね。
これと同じで、スキルがメッセージを送るときも「誰が」「何を」「いつ」送ったかを決まった形式で書く必要があります。

### 問題だったこと

今までは、同じ「スキルのメッセージ」を表す契約書が**2種類**ありました：

- 1つ目: `skill.ts` にある契約書
- 2つ目: `skill-execution.ts` にある契約書

これだと「どっちの契約書を使えばいいの？」と混乱してしまいます。

### 今回の解決策

**2種類あった契約書を1種類に統一**しました。
これにより、「この契約書を使えばOK！」とはっきりしました。

---

## 日常の例え話

> 学校の給食で考えてみましょう。
>
> **Before（問題だった状態）**
>
> - 「月曜日のメニュー表」が職員室と教室で**別々**にありました
> - 職員室では「カレー」、教室では「ハヤシライス」と書いてある
> - 「今日の給食なに？」と聞かれても答えが違う！
>
> **After（今回の修正後）**
>
> - メニュー表を**1つに統一**しました
> - どこで見ても「カレー」と書いてある
> - 「今日の給食なに？」と聞かれたら、誰でも同じ答えになる！

---

## なぜこの修正が必要だったの？

1. **混乱をなくす**: どの契約書を使えばいいか迷わない
2. **間違いを防ぐ**: 違う契約書を使って食い違いが起きない
3. **メンテナンスが楽**: 1箇所だけ直せばOK

---

# Part 2: 技術的詳細

## 1. 統合後の型定義

### 1.1 SkillStreamMessageType

```typescript
export type SkillStreamMessageType =
  | "assistant" // AIからのテキストメッセージ
  | "tool_use" // ツール使用開始
  | "tool_result" // ツール実行結果
  | "status" // ステータス変更
  | "error"; // エラー発生
```

### 1.2 SkillStreamMessage（Discriminated Union）

```typescript
interface BaseStreamMessage {
  executionId: string; // 実行ID（UUID）
  timestamp: number; // タイムスタンプ（UNIXタイム）
}

export type SkillStreamMessage =
  | (BaseStreamMessage & {
      type: "assistant";
      content: AssistantMessageContent;
    })
  | (BaseStreamMessage & { type: "tool_use"; content: ToolUseMessageContent })
  | (BaseStreamMessage & {
      type: "tool_result";
      content: ToolResultMessageContent;
    })
  | (BaseStreamMessage & { type: "status"; content: StatusMessageContent })
  | (BaseStreamMessage & { type: "error"; content: ErrorMessageContent });
```

### 1.3 SkillExecutionRequest

```typescript
export interface SkillExecutionRequest {
  skillName: string; // 使用するスキル名
  prompt: string; // ユーザープロンプト
  workingDirectory?: string; // 作業ディレクトリ（省略時はデフォルト）
}
```

### 1.4 ExecutionState（移行元: skill-execution.ts）

```typescript
export type ExecutionState =
  | "pending" // 実行待機中
  | "running" // 実行中
  | "completed" // 完了
  | "aborted" // 中断
  | "error"; // エラー
```

---

## 2. 使用例

### 2.1 SkillStreamMessageの型ガード

```typescript
import { SkillStreamMessage } from "@repo/shared";

function handleMessage(message: SkillStreamMessage) {
  switch (message.type) {
    case "assistant":
      // TypeScriptが自動的にcontent.textを認識
      console.log(message.content.text);
      break;
    case "tool_use":
      // content.toolNameが使用可能
      console.log(`ツール実行: ${message.content.toolName}`);
      break;
    case "error":
      // content.code, content.messageが使用可能
      console.error(
        `エラー[${message.content.code}]: ${message.content.message}`,
      );
      break;
  }
}
```

### 2.2 インポート方法

```typescript
// Before（非推奨）
import { ExecutionState } from "@repo/shared/types/skill-execution";

// After（推奨）
import { ExecutionState } from "@repo/shared/types/skill";
// または
import { ExecutionState } from "@repo/shared";
```

---

## 3. 設定可能なパラメータと定数

### SKILL_EXECUTION_DEFAULTS

```typescript
export const SKILL_EXECUTION_DEFAULTS = {
  DEFAULT_TIMEOUT: 30000, // デフォルトタイムアウト（30秒）
  MAX_CONCURRENT_EXECUTIONS: 5, // 最大同時実行数
  MAX_RETRIES: 3, // 最大リトライ回数
  INITIAL_RETRY_DELAY: 1000, // 初回リトライ待機（1秒）
  MAX_RETRY_DELAY: 4000, // 最大リトライ待機（4秒）
} as const;
```

---

## 4. エラーハンドリング

### SkillExecutionErrorCode

```typescript
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED" // 実行失敗
  | "TIMEOUT" // タイムアウト
  | "ABORTED" // ユーザーによる中断
  | "MAX_CONCURRENT_EXCEEDED" // 同時実行数超過
  | "SKILL_NOT_FOUND" // スキルが見つからない
  | "VALIDATION_FAILED" // バリデーションエラー
  | "SDK_ERROR" // SDK内部エラー
  | "NETWORK_ERROR" // ネットワークエラー
  | "AUTHENTICATION_ERROR"; // 認証エラー
```

### エラーハンドリング例

```typescript
import { SkillStreamMessage, SkillExecutionErrorCode } from "@repo/shared";

function handleError(message: SkillStreamMessage) {
  if (message.type === "error") {
    const { code, message: errorMessage, retryable } = message.content;

    if (retryable) {
      console.log(`リトライ可能なエラー: ${errorMessage}`);
      // リトライロジック
    } else {
      console.error(`致命的エラー: ${errorMessage}`);
    }
  }
}
```

---

## 5. 変更影響範囲

### 更新が必要なimport文

| ファイル                                      | 変更内容                    |
| --------------------------------------------- | --------------------------- |
| `preload/skill-api.ts`                        | `skill-execution` → `skill` |
| `renderer/hooks/useSkillExecution.ts`         | `skill-execution` → `skill` |
| `components/AgentView/SkillStreamDisplay.tsx` | `skill-execution` → `skill` |
| テストファイル（5件）                         | `skill-execution` → `skill` |

---

## 6. 後方互換性

- **型の構造は同一**: 既存コードは修正後も動作
- **import文の変更のみ必要**: `skill-execution` → `skill` に置換
- **ランタイムエラーなし**: 型定義のみの変更
