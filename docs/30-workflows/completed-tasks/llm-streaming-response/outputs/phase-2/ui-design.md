# Phase 2: UIコンポーネント設計書

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 2                 |
| 作成日     | 2026-01-23        |
| ステータス | 完了              |

---

## 1. コンポーネント構造

### 1.1 コンポーネント階層

```
ChatView/
├── ChatContainer/
│   ├── ChatHeader/
│   │   └── ProviderSelector
│   ├── MessageList/
│   │   ├── ChatMessage (既存・拡張)
│   │   │   ├── UserMessage
│   │   │   └── AssistantMessage
│   │   └── StreamingMessage (新規)
│   │       ├── StreamingContent
│   │       └── StreamingIndicator
│   └── ChatInput/
│       ├── TextArea
│       └── SendButton / CancelButton
└── ErrorBoundary
```

### 1.2 コンポーネント責務

| コンポーネント       | 責務                               | 状態                    |
| -------------------- | ---------------------------------- | ----------------------- |
| `ChatContainer`      | チャット全体のレイアウト・状態管理 | 既存                    |
| `MessageList`        | メッセージ一覧表示・スクロール制御 | 既存（拡張）            |
| `ChatMessage`        | 個別メッセージ表示                 | 既存（streamingProp有） |
| `StreamingMessage`   | ストリーミング中メッセージ表示     | 新規                    |
| `StreamingIndicator` | タイピングアニメーション           | 新規                    |
| `ChatInput`          | メッセージ入力・送信               | 既存（キャンセル追加）  |

---

## 2. StreamingMessage コンポーネント

### 2.1 設計概要

```typescript
// apps/desktop/src/renderer/components/chat/StreamingMessage/index.tsx

interface StreamingMessageProps {
  /** ストリーミング中のコンテンツ */
  content: string;
  /** ストリーミング中かどうか */
  isStreaming: boolean;
  /** カーソル表示 */
  showCursor?: boolean;
  /** キャンセルコールバック */
  onCancel?: () => void;
  /** クラス名 */
  className?: string;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
  isStreaming,
  showCursor = true,
  onCancel,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg bg-muted/50",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy={isStreaming}
    >
      {/* Avatar */}
      <Avatar>
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="prose prose-sm max-w-none">
          {content}
          {isStreaming && showCursor && (
            <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-0.5" />
          )}
        </div>

        {/* Cancel Button */}
        {isStreaming && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            <StopCircle className="w-4 h-4 mr-1" />
            停止
          </Button>
        )}
      </div>
    </div>
  );
};
```

### 2.2 スタイリング

```css
/* Tailwind CSS ベース */
.streaming-cursor {
  @apply inline-block w-2 h-4 bg-foreground animate-pulse ml-0.5;
}

.streaming-message {
  @apply flex gap-3 p-4 rounded-lg bg-muted/50;
}

/* カーソルアニメーション */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
```

---

## 3. StreamingIndicator コンポーネント

### 3.1 設計概要

```typescript
// apps/desktop/src/renderer/components/chat/StreamingIndicator/index.tsx

interface StreamingIndicatorProps {
  /** 表示状態 */
  visible: boolean;
  /** インジケータータイプ */
  type?: 'dots' | 'cursor' | 'text';
  /** テキスト（type='text'時） */
  text?: string;
}

const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  visible,
  type = 'dots',
  text = '入力中...',
}) => {
  if (!visible) return null;

  switch (type) {
    case 'dots':
      return (
        <div className="flex items-center gap-1" aria-label="入力中">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      );

    case 'cursor':
      return (
        <span
          className="inline-block w-2 h-4 bg-foreground animate-pulse"
          aria-label="入力中"
        />
      );

    case 'text':
      return (
        <span className="text-muted-foreground text-sm animate-pulse">
          {text}
        </span>
      );

    default:
      return null;
  }
};
```

---

## 4. ChatInput 拡張

### 4.1 設計概要

```typescript
// apps/desktop/src/renderer/components/chat/ChatInput/index.tsx

interface ChatInputProps {
  /** 送信コールバック */
  onSend: (message: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 無効化 */
  disabled?: boolean;
  /** ストリーミング中 */
  isStreaming?: boolean;
  /** キャンセルコールバック */
  onCancelStream?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = "メッセージを入力...",
  disabled = false,
  isStreaming = false,
  onCancelStream,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled && !isStreaming) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape でキャンセル
    if (e.key === 'Escape' && isStreaming && onCancelStream) {
      onCancelStream();
      return;
    }

    // Enter で送信（Shift+Enter は改行）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isStreaming}
        className="flex-1 min-h-[40px] max-h-[200px] resize-none"
        rows={1}
      />

      {isStreaming ? (
        <Button
          variant="destructive"
          size="icon"
          onClick={onCancelStream}
          aria-label="ストリーミングを停止"
        >
          <StopCircle className="w-5 h-5" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="メッセージを送信"
        >
          <Send className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
```

---

## 5. 状態管理設計

### 5.1 ChatSlice 拡張

```typescript
// apps/desktop/src/renderer/store/slices/chatSlice.ts
import { StateCreator } from "zustand";

interface StreamingState {
  isStreaming: boolean;
  streamingContent: string;
  currentRequestId: string | null;
  startedAt: number | null;
  chunkCount: number;
}

interface ChatState {
  messages: ChatMessage[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  streaming: StreamingState;
}

interface ChatActions {
  // 既存
  addMessage: (message: ChatMessage) => void;
  setError: (error: string | null) => void;

  // ストリーミング
  startStreaming: (requestId: string) => void;
  appendStreamChunk: (content: string) => void;
  finishStreaming: (finalMessage: ChatMessage) => void;
  cancelStreaming: () => void;
  handleStreamError: (error: LLMError) => void;
  resetStreaming: () => void;
}

export const createChatSlice: StateCreator<ChatSlice> = (set, get) => ({
  // 初期状態
  messages: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
  streaming: {
    isStreaming: false,
    streamingContent: "",
    currentRequestId: null,
    startedAt: null,
    chunkCount: 0,
  },

  // アクション
  startStreaming: (requestId) =>
    set((state) => ({
      streaming: {
        ...state.streaming,
        isStreaming: true,
        streamingContent: "",
        currentRequestId: requestId,
        startedAt: Date.now(),
        chunkCount: 0,
      },
    })),

  appendStreamChunk: (content) =>
    set((state) => ({
      streaming: {
        ...state.streaming,
        streamingContent: state.streaming.streamingContent + content,
        chunkCount: state.streaming.chunkCount + 1,
      },
    })),

  finishStreaming: (finalMessage) =>
    set((state) => ({
      messages: [...state.messages, finalMessage],
      streaming: {
        isStreaming: false,
        streamingContent: "",
        currentRequestId: null,
        startedAt: null,
        chunkCount: 0,
      },
    })),

  cancelStreaming: () =>
    set((state) => {
      // 途中コンテンツがあればメッセージとして保存
      const partialMessage = state.streaming.streamingContent
        ? {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: state.streaming.streamingContent + " [中断]",
            timestamp: new Date(),
            isCancelled: true,
          }
        : null;

      return {
        messages: partialMessage
          ? [...state.messages, partialMessage]
          : state.messages,
        streaming: {
          isStreaming: false,
          streamingContent: "",
          currentRequestId: null,
          startedAt: null,
          chunkCount: 0,
        },
      };
    }),

  handleStreamError: (error) =>
    set((state) => ({
      error: error.message,
      streaming: {
        isStreaming: false,
        streamingContent: state.streaming.streamingContent, // 保持
        currentRequestId: null,
        startedAt: null,
        chunkCount: state.streaming.chunkCount,
      },
    })),

  resetStreaming: () =>
    set({
      streaming: {
        isStreaming: false,
        streamingContent: "",
        currentRequestId: null,
        startedAt: null,
        chunkCount: 0,
      },
    }),
});
```

### 5.2 Custom Hook

```typescript
// apps/desktop/src/renderer/hooks/useStreamingChat.ts

export function useStreamingChat() {
  const {
    streaming,
    startStreaming,
    appendStreamChunk,
    finishStreaming,
    cancelStreaming,
    handleStreamError,
  } = useChatStore();

  // イベント購読
  useEffect(() => {
    const unsubChunk = window.llmAPI.onStreamChunk((event) => {
      if (event.requestId === streaming.currentRequestId) {
        if (event.chunk.type === "content") {
          appendStreamChunk(event.chunk.content);
        }
      }
    });

    const unsubEnd = window.llmAPI.onStreamEnd((event) => {
      if (event.requestId === streaming.currentRequestId) {
        finishStreaming({
          id: crypto.randomUUID(),
          role: "assistant",
          content: streaming.streamingContent,
          timestamp: new Date(),
        });
      }
    });

    const unsubError = window.llmAPI.onStreamError((event) => {
      if (event.requestId === streaming.currentRequestId) {
        handleStreamError(event.error);
      }
    });

    return () => {
      unsubChunk();
      unsubEnd();
      unsubError();
    };
  }, [streaming.currentRequestId]);

  // ストリーミング送信
  const sendStreamingMessage = async (request: LLMStreamChatRequest) => {
    try {
      const response = await window.llmAPI.streamChat(request);
      startStreaming(response.requestId);
    } catch (error) {
      handleStreamError(error as LLMError);
    }
  };

  // キャンセル
  const cancelStream = async () => {
    if (streaming.currentRequestId) {
      await window.llmAPI.cancelStream(streaming.currentRequestId);
      cancelStreaming();
    }
  };

  return {
    isStreaming: streaming.isStreaming,
    streamingContent: streaming.streamingContent,
    sendStreamingMessage,
    cancelStream,
  };
}
```

---

## 6. アクセシビリティ設計

### 6.1 ARIA属性

| 要素               | ARIA属性                            | 目的                       |
| ------------------ | ----------------------------------- | -------------------------- |
| StreamingMessage   | `role="status"`                     | ライブリージョンとして認識 |
| StreamingMessage   | `aria-live="polite"`                | 更新時に読み上げ           |
| StreamingMessage   | `aria-busy="true/false"`            | 処理中状態の通知           |
| CancelButton       | `aria-label="ストリーミングを停止"` | ボタン目的の説明           |
| SendButton         | `aria-label="メッセージを送信"`     | ボタン目的の説明           |
| StreamingIndicator | `aria-label="入力中"`               | インジケーターの説明       |

### 6.2 キーボード操作

| キー            | 動作                                 |
| --------------- | ------------------------------------ |
| `Enter`         | メッセージ送信（非ストリーミング時） |
| `Shift + Enter` | 改行挿入                             |
| `Escape`        | ストリーミングキャンセル             |
| `Tab`           | フォーカス移動                       |

---

## 7. パフォーマンス最適化

### 7.1 React最適化

```typescript
// メモ化によるリレンダリング防止
const MemoizedStreamingMessage = React.memo(StreamingMessage, (prev, next) => {
  // contentの末尾追加のみの場合は再レンダリングを最小化
  return (
    prev.isStreaming === next.isStreaming &&
    prev.content === next.content
  );
});

// useMemo/useCallbackの活用
const ChatContainer = () => {
  const { streamingContent, isStreaming } = useStreamingChat();

  const handleCancel = useCallback(() => {
    cancelStream();
  }, [cancelStream]);

  return (
    <MemoizedStreamingMessage
      content={streamingContent}
      isStreaming={isStreaming}
      onCancel={handleCancel}
    />
  );
};
```

### 7.2 仮想化（長いチャット履歴用）

```typescript
// react-window を使用した仮想化
import { VariableSizeList } from 'react-window';

const VirtualizedMessageList = ({ messages }) => {
  const listRef = useRef<VariableSizeList>(null);

  // 自動スクロール
  useEffect(() => {
    listRef.current?.scrollToItem(messages.length - 1, 'end');
  }, [messages.length]);

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={messages.length}
      itemSize={getItemSize}
    >
      {({ index, style }) => (
        <div style={style}>
          <ChatMessage message={messages[index]} />
        </div>
      )}
    </VariableSizeList>
  );
};
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-23 | 初版作成 |
