# UI コンポーネント設計 - TASK-3-2 Phase 2

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| 作成日     | 2026-01-25            |
| Phase      | 2                     |
| タスク     | UI コンポーネント設計 |
| ステータス | 完了                  |

---

## 1. コンポーネント構成

### 1.1 ディレクトリ構造

```
apps/desktop/src/renderer/components/SkillStreamDisplay/
├── index.tsx                    # メインコンポーネント（エクスポート）
├── SkillStreamDisplay.tsx       # メインコンポーネント実装
├── StreamHeader.tsx             # ヘッダー（状態表示）
├── StreamContent.tsx            # コンテンツ（メッセージ一覧）
├── StreamActions.tsx            # アクションエリア
├── messages/
│   ├── MessageItem.tsx          # メッセージラッパー
│   ├── TextMessage.tsx          # テキストメッセージ
│   ├── ToolUseMessage.tsx       # ツール使用メッセージ
│   └── ErrorMessage.tsx         # エラーメッセージ
├── __tests__/
│   ├── SkillStreamDisplay.test.tsx
│   ├── StreamHeader.test.tsx
│   ├── StreamContent.test.tsx
│   └── messages/
│       ├── TextMessage.test.tsx
│       └── ToolUseMessage.test.tsx
└── styles.css                   # Tailwind カスタムスタイル（オプション）
```

### 1.2 コンポーネント階層

```
SkillStreamDisplay
├── StreamHeader
│   ├── StatusBadge
│   └── ExecutionInfo
├── StreamContent
│   └── MessageItem (map)
│       ├── TextMessage
│       ├── ToolUseMessage
│       └── ErrorMessage
└── StreamActions
    ├── AbortButton
    └── ResetButton
```

---

## 2. コンポーネント詳細設計

### 2.1 SkillStreamDisplay（メイン）

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/SkillStreamDisplay.tsx

import { useEffect, useRef } from "react";
import {
  useSkillExecution,
  type SkillExecutionStatus,
} from "../../hooks/useSkillExecution";
import type { SkillExecutionError } from "@repo/shared/types/skill-execution";
import { StreamHeader } from "./StreamHeader";
import { StreamContent } from "./StreamContent";
import { StreamActions } from "./StreamActions";

export interface SkillStreamDisplayProps {
  /** 実行対象のスキルID */
  skillId: string;
  /** 初期プロンプト（オプション） */
  initialPrompt?: string;
  /** 自動実行フラグ */
  autoExecute?: boolean;
  /** 完了時コールバック */
  onComplete?: () => void;
  /** エラー時コールバック */
  onError?: (error: SkillExecutionError) => void;
  /** 状態変更時コールバック */
  onStatusChange?: (status: SkillExecutionStatus) => void;
  /** 高さ指定（デフォルト: "auto"） */
  height?: string | number;
  /** クラス名 */
  className?: string;
}

export function SkillStreamDisplay({
  skillId,
  initialPrompt,
  autoExecute = false,
  onComplete,
  onError,
  onStatusChange,
  height = "auto",
  className,
}: SkillStreamDisplayProps) {
  const { messages, status, error, execute, abort, reset, isAborting } =
    useSkillExecution(skillId);

  const contentRef = useRef<HTMLDivElement>(null);

  // 状態変更通知
  useEffect(() => {
    onStatusChange?.(status);

    if (status === "completed") {
      onComplete?.();
    } else if (status === "error" && error) {
      onError?.(error);
    }
  }, [status, error, onComplete, onError, onStatusChange]);

  // 自動実行
  useEffect(() => {
    if (autoExecute && initialPrompt && status === "idle") {
      execute(initialPrompt);
    }
  }, [autoExecute, initialPrompt, status, execute]);

  // 自動スクロール
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`flex flex-col border rounded-lg bg-background ${className ?? ""}`}
      style={{ height }}
    >
      <StreamHeader status={status} />
      <StreamContent ref={contentRef} messages={messages} status={status} />
      <StreamActions
        status={status}
        isAborting={isAborting}
        onAbort={abort}
        onReset={reset}
      />
    </div>
  );
}
```

### 2.2 StreamHeader

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/StreamHeader.tsx

import type { SkillExecutionStatus } from "../../hooks/useSkillExecution";

interface StreamHeaderProps {
  status: SkillExecutionStatus;
}

const STATUS_LABELS: Record<SkillExecutionStatus, string> = {
  idle: "待機中",
  running: "実行中",
  completed: "完了",
  error: "エラー",
  aborted: "中断",
};

const STATUS_COLORS: Record<SkillExecutionStatus, string> = {
  idle: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
  aborted: "bg-yellow-100 text-yellow-700",
};

export function StreamHeader({ status }: StreamHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <h3 className="text-sm font-medium">スキル実行</h3>
      <span
        className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[status]}`}
      >
        {status === "running" && (
          <span className="inline-block w-2 h-2 mr-1 bg-blue-500 rounded-full animate-pulse" />
        )}
        {STATUS_LABELS[status]}
      </span>
    </div>
  );
}
```

### 2.3 StreamContent

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/StreamContent.tsx

import { forwardRef } from "react";
import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";
import type { SkillExecutionStatus } from "../../hooks/useSkillExecution";
import { MessageItem } from "./messages/MessageItem";

interface StreamContentProps {
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus;
}

export const StreamContent = forwardRef<HTMLDivElement, StreamContentProps>(
  function StreamContent({ messages, status }, ref) {
    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && status === "idle" && (
          <p className="text-sm text-muted-foreground text-center py-4">
            スキル実行を開始してください
          </p>
        )}

        {messages.length === 0 && status === "running" && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">
              実行中...
            </span>
          </div>
        )}

        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    );
  }
);
```

### 2.4 StreamActions

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/StreamActions.tsx

import type { SkillExecutionStatus } from "../../hooks/useSkillExecution";

interface StreamActionsProps {
  status: SkillExecutionStatus;
  isAborting: boolean;
  onAbort: () => void;
  onReset: () => void;
}

export function StreamActions({
  status,
  isAborting,
  onAbort,
  onReset,
}: StreamActionsProps) {
  const showAbort = status === "running";
  const showReset = status === "completed" || status === "error" || status === "aborted";

  if (!showAbort && !showReset) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-2 border-t">
      {showAbort && (
        <button
          onClick={onAbort}
          disabled={isAborting}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAborting ? "中断中..." : "中断"}
        </button>
      )}

      {showReset && (
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          リセット
        </button>
      )}
    </div>
  );
}
```

---

## 3. メッセージコンポーネント

### 3.1 MessageItem

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/messages/MessageItem.tsx

import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";
import { TextMessage } from "./TextMessage";
import { ToolUseMessage } from "./ToolUseMessage";
import { ErrorMessage } from "./ErrorMessage";

interface MessageItemProps {
  message: SkillStreamMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  switch (message.type) {
    case "text":
      return <TextMessage message={message} />;
    case "tool_use":
      return <ToolUseMessage message={message} />;
    case "error":
      return <ErrorMessage message={message} />;
    case "complete":
      return null; // 完了メッセージは表示しない
    default:
      return null;
  }
}
```

### 3.2 TextMessage

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/messages/TextMessage.tsx

import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";

interface TextMessageProps {
  message: SkillStreamMessage;
}

export function TextMessage({ message }: TextMessageProps) {
  return (
    <div className="p-3 rounded-lg bg-muted">
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      <time className="block mt-1 text-xs text-muted-foreground">
        {new Date(message.timestamp).toLocaleTimeString()}
      </time>
    </div>
  );
}
```

### 3.3 ToolUseMessage

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/messages/ToolUseMessage.tsx

import { useState } from "react";
import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";

interface ToolUseMessageProps {
  message: SkillStreamMessage;
}

interface ToolUseContent {
  name: string;
  input: unknown;
}

export function ToolUseMessage({ message }: ToolUseMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  let toolContent: ToolUseContent | null = null;
  try {
    toolContent = JSON.parse(message.content);
  } catch {
    toolContent = null;
  }

  if (!toolContent) {
    return null;
  }

  return (
    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">
            {/* ツールアイコン */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="text-sm font-medium text-blue-700">
            {toolContent.name}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? "閉じる" : "詳細"}
        </button>
      </div>

      {isExpanded && (
        <pre className="mt-2 p-2 text-xs bg-white rounded overflow-x-auto">
          {JSON.stringify(toolContent.input, null, 2)}
        </pre>
      )}

      <time className="block mt-1 text-xs text-blue-400">
        {new Date(message.timestamp).toLocaleTimeString()}
      </time>
    </div>
  );
}
```

### 3.4 ErrorMessage

```typescript
// apps/desktop/src/renderer/components/SkillStreamDisplay/messages/ErrorMessage.tsx

import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";

interface ErrorMessageProps {
  message: SkillStreamMessage;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
      <div className="flex items-center gap-2">
        <span className="text-red-500">
          {/* エラーアイコン */}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span className="text-sm font-medium text-red-700">エラー</span>
      </div>
      <p className="mt-1 text-sm text-red-600">{message.content}</p>
      <time className="block mt-1 text-xs text-red-400">
        {new Date(message.timestamp).toLocaleTimeString()}
      </time>
    </div>
  );
}
```

---

## 4. アクセシビリティ

### 4.1 ARIA 属性

| コンポーネント | ARIA 属性            | 目的                 |
| -------------- | -------------------- | -------------------- |
| StreamContent  | `role="log"`         | ログ領域として認識   |
| StreamContent  | `aria-live="polite"` | 新メッセージ読み上げ |
| AbortButton    | `aria-busy`          | 処理中状態           |
| StatusBadge    | `aria-label`         | 状態の説明           |

### 4.2 キーボード操作

| キー   | 動作           |
| ------ | -------------- |
| Tab    | フォーカス移動 |
| Enter  | ボタン実行     |
| Escape | 中断（Abort）  |

---

## 5. 参照

- React Hook 設計: `outputs/phase-2/react-hook-design.md`
- 型定義: `packages/shared/src/types/skill-execution.ts`
- Tailwind CSS: プロジェクト設定準拠
