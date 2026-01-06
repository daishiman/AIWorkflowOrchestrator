# WebSocketフック

## useWebSocket

```typescript
import { useState, useEffect, useCallback, useRef } from "react";

type WebSocketStatus = "connecting" | "open" | "closing" | "closed";

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

interface UseWebSocketResult<T> {
  status: WebSocketStatus;
  lastMessage: T | null;
  sendMessage: (message: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

/**
 * WebSocket接続を管理するフック
 */
export function useWebSocket<T = unknown>(
  url: string,
  options: UseWebSocketOptions = {},
): UseWebSocketResult<T> {
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnect = true,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = (event) => {
      setStatus("open");
      reconnectCountRef.current = 0;
      onOpen?.(event);
    };

    wsRef.current.onclose = (event) => {
      setStatus("closed");
      onClose?.(event);

      if (reconnect && reconnectCountRef.current < reconnectAttempts) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectCountRef.current++;
          connect();
        }, reconnectInterval);
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data) as T;
      setLastMessage(data);
      onMessage?.(event);
    };

    wsRef.current.onerror = (event) => {
      onError?.(event);
    };
  }, [url, onOpen, onClose, onMessage, onError, reconnect, reconnectInterval, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    reconnectCountRef.current = reconnectAttempts;
    wsRef.current?.close();
  }, [reconnectAttempts]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { status, lastMessage, sendMessage, connect, disconnect };
}
```

## 使用例

```typescript
interface ChatMessage {
  id: string;
  user: string;
  content: string;
  timestamp: number;
}

function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { status, lastMessage, sendMessage } = useWebSocket<ChatMessage>(
    `wss://chat.example.com/room/${roomId}`,
    {
      onOpen: () => console.log('Connected to chat'),
      onClose: () => console.log('Disconnected from chat'),
      onMessage: (event) => console.log('Received:', event.data),
      reconnect: true,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
    }
  );

  useEffect(() => {
    if (lastMessage) {
      setMessages((prev) => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage({
        type: 'message',
        content: inputValue,
      });
      setInputValue('');
    }
  };

  return (
    <div className="chat-room">
      <div className="status">
        Status: {status}
        {status === 'connecting' && <Spinner />}
      </div>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <span className="user">{msg.user}:</span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={status !== 'open'}
        />
        <button onClick={handleSend} disabled={status !== 'open'}>
          Send
        </button>
      </div>
    </div>
  );
}
```
