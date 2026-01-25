# TASK-3-1-B Hooks 実装ガイド

## 更新日

2026-01-25

---

# Part 1: 概念的説明（初学者・非技術者向け）

## Hooks機能とは

Hooksは、スキル実行時のツール使用前後に処理を挿入する機能です。
セキュリティチェックや通知送信を自動的に行い、安全なスキル実行を実現します。

### 主な機能

1. **PreToolUse Hook**: ツール実行前のセキュリティチェック
   - 危険なコマンド（システム破壊の可能性があるもの）をブロック
   - 保護されたパス（設定ファイルなど）への書き込みを防止
   - ツール実行開始をUIに通知

2. **PostToolUse Hook**: ツール実行後の通知
   - 実行結果の送信
   - 完了ステータスの更新

### 動作イメージ

```
ユーザーがスキルを実行
        ↓
   ツール呼び出し
        ↓
┌─────────────────┐
│  PreToolUse     │ ← 危険チェック・通知
│  (実行前)       │
└────────┬────────┘
         ↓ 安全な場合のみ続行
┌─────────────────┐
│  ツール実行     │
│  (Bash, Write等)│
└────────┬────────┘
         ↓
┌─────────────────┐
│  PostToolUse    │ ← 結果・完了通知
│  (実行後)       │
└─────────────────┘
```

### セキュリティ機能

| 機能             | 説明                                             | 例                              |
| ---------------- | ------------------------------------------------ | ------------------------------- |
| 危険コマンド検出 | システムを破壊する可能性のあるコマンドをブロック | `rm -rf /`, `sudo`, `chmod 777` |
| 保護パス検出     | 重要なファイルへの書き込みをブロック             | `/etc/passwd`, `~/.ssh/`        |

### エラーの分類

スキル実行中にエラーが発生した場合、自動的に分類されます：

| エラータイプ      | 説明                   | リトライ可能？ |
| ----------------- | ---------------------- | -------------- |
| network           | ネットワーク接続の問題 | はい           |
| timeout           | 処理時間超過           | はい           |
| permission_denied | 権限エラー             | いいえ         |
| sdk_error         | SDK内部エラー          | いいえ         |
| unknown           | その他のエラー         | いいえ         |

---

# Part 2: 技術的詳細（開発者向け）

## 技術仕様

### createHooks(executionId: string)

Hooks オブジェクトを生成するメソッド。

#### パラメータ

| パラメータ    | 型       | 説明                             |
| ------------- | -------- | -------------------------------- |
| `executionId` | `string` | 実行を識別するユニークID（UUID） |

#### 戻り値

```typescript
{
  PreToolUse: (
    input: PreToolUseInput,
    toolUseId: string,
    context: { signal: AbortSignal },
  ) => Promise<PreToolUseResult>;
  PostToolUse: (
    input: PostToolUseInput,
    toolUseId: string,
    context: { signal: AbortSignal },
  ) => Promise<Record<string, never>>;
}
```

### 型定義

```typescript
/** PreToolUse入力 */
interface PreToolUseInput {
  toolName: string;
  args: Record<string, unknown>;
}

/** PostToolUse入力 */
interface PostToolUseInput {
  toolName: string;
  result?: unknown;
}

/** PreToolUse結果 */
type PreToolUseResult = { proceed: true } | { proceed: false; message: string };

/** エラーカテゴリ */
type ErrorCategory =
  | "sdk_error"
  | "permission_denied"
  | "timeout"
  | "network"
  | "unknown";
```

### ストリームメッセージ形式

```typescript
/** Hooks拡張ストリームメッセージ */
export type HooksStreamMessage =
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: ToolResultContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: StatusContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: ErrorContent;
      timestamp: number;
    };
```

### 使用例

```typescript
// SkillExecutor内での使用
const executor = new SkillExecutor(mainWindow);
const hooks = executor.createHooks(executionId);

// Claude Agent SDK query()との統合
const conversation = query({
  prompt,
  options: {
    hooks,
    tools: ["Read", "Write", "Bash"],
    permissionMode: "default",
  },
});
```

### エラーハンドリング

```typescript
// エラーカテゴリの判定
const category = executor.categorizeError(error);
// → "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown"

// リトライ可能かの判定
const canRetry = executor.isRetryable(error);
// → true (network, timeout) | false (permission_denied, sdk_error, unknown)
```

### セキュリティチェック関数

```typescript
import { isDangerousCommand, isProtectedPath } from "@repo/shared/constants";

// 危険コマンドチェック
isDangerousCommand("rm -rf /"); // true
isDangerousCommand("echo hello"); // false

// 保護パスチェック
isProtectedPath("/etc/passwd"); // true
isProtectedPath("/tmp/test.txt"); // false
```

### パフォーマンス特性

| 処理             | 平均時間  | 目標   |
| ---------------- | --------- | ------ |
| PreToolUse Hook  | < 0.05ms  | < 10ms |
| PostToolUse Hook | < 0.01ms  | < 10ms |
| categorizeError  | < 0.001ms | < 1ms  |
| isRetryable      | < 0.001ms | < 1ms  |

---

## 関連ファイル

| ファイル                                                       | 説明                     |
| -------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`        | 実装ファイル             |
| `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts` | Hooksテスト              |
| `apps/desktop/src/main/services/skill/__tests__/error.test.ts` | エラーハンドリングテスト |
| `packages/shared/src/constants/security.ts`                    | セキュリティ定数         |

---

## 参照

- [Claude Agent SDK Hooks Documentation](https://docs.anthropic.com/claude-agent-sdk/hooks)
- Phase 1-12 タスク仕様書: `docs/30-workflows/task-3-1-b-hooks/`
