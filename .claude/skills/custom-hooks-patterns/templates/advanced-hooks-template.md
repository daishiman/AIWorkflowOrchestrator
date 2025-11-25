# 高度なカスタムフックテンプレート

## データフェッチフック

### useFetch

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions<T> {
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * データフェッチを管理するフック
 *
 * @param url - フェッチURL（nullで無効化）
 * @param options - オプション設定
 */
export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { enabled = true, initialData, onSuccess, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!!url && enabled);
  const [error, setError] = useState<Error | null>(null);

  // キャンセル用
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // 前のリクエストをキャンセル
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

### useAsync

```typescript
import { useState, useCallback, useRef } from 'react';

type AsyncFunction<T, Args extends unknown[]> = (...args: Args) => Promise<T>;

interface UseAsyncResult<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | undefined>;
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * 非同期関数を管理するフック
 *
 * @param asyncFunction - 実行する非同期関数
 *
 * @example
 * const { execute, data, isLoading, error } = useAsync(updateUser);
 * <button onClick={() => execute(userId, userData)}>Update</button>
 */
export function useAsync<T, Args extends unknown[]>(
  asyncFunction: AsyncFunction<T, Args>
): UseAsyncResult<T, Args> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);

  const execute = useCallback(async (...args: Args) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      if (isMountedRef.current) {
        setData(result);
        return result;
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, data, isLoading, error, reset };
}
```

## フォームフック

### useForm

```typescript
import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
}

/**
 * フォーム状態を管理するフック
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const { initialValues, validationSchema, onSubmit } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | undefined => {
    const rules = validationSchema?.[field];
    if (!rules) return undefined;

    for (const rule of rules) {
      if (!rule.validate(value, values)) {
        return rule.message;
      }
    }
    return undefined;
  }, [validationSchema, values]);

  const validateAllFields = useCallback((): boolean => {
    if (!validationSchema) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field of Object.keys(values) as (keyof T)[]) {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationSchema]);

  const handleChange = useCallback((field: keyof T) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;

    setValues(prev => ({ ...prev, [field]: value }));

    // タッチ済みならバリデーション
    if (touched[field]) {
      const error = validateField(field, value as T[keyof T]);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [values, validateField]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    // 全フィールドをタッチ済みに
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    if (!validateAllFields()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAllFields, onSubmit]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChange: handleChange(field),
    onBlur: handleBlur(field),
  }), [values, handleChange, handleBlur]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    getFieldProps,
  };
}
```

## 状態管理フック

### useReducerWithMiddleware

```typescript
import { useReducer, useCallback, useRef, Reducer, Dispatch } from 'react';

type Middleware<S, A> = (
  getState: () => S,
  dispatch: Dispatch<A>
) => (next: Dispatch<A>) => Dispatch<A>;

/**
 * ミドルウェア付きのuseReducer
 */
export function useReducerWithMiddleware<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = []
): [S, Dispatch<A>] {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  const dispatch = useCallback((action: A) => {
    // ミドルウェアチェーンを構築
    const chain = middlewares.map(middleware =>
      middleware(getState, baseDispatch)
    );

    // ミドルウェアを適用
    const composedDispatch = chain.reduceRight(
      (next, middleware) => middleware(next),
      baseDispatch
    );

    return composedDispatch(action);
  }, [middlewares, getState, baseDispatch]);

  return [state, dispatch];
}

// ロギングミドルウェア例
export const loggerMiddleware: Middleware<unknown, unknown> =
  (getState) => (next) => (action) => {
    console.log('Previous State:', getState());
    console.log('Action:', action);
    const result = next(action);
    console.log('Next State:', getState());
    return result;
  };

// 非同期アクションミドルウェア例
export const thunkMiddleware: Middleware<unknown, unknown> =
  (getState, dispatch) => (next) => (action) => {
    if (typeof action === 'function') {
      return (action as (dispatch: typeof dispatch, getState: typeof getState) => unknown)(
        dispatch,
        getState
      );
    }
    return next(action);
  };
```

### useUndoRedo

```typescript
import { useState, useCallback, useMemo } from 'react';

interface UseUndoRedoResult<T> {
  state: T;
  set: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState?: T) => void;
  history: T[];
  historyIndex: number;
}

/**
 * Undo/Redo機能付きの状態管理フック
 *
 * @param initialState - 初期状態
 * @param maxHistory - 最大履歴数
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistory = 50
): UseUndoRedoResult<T> {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const set = useCallback((newState: T) => {
    setHistory(prev => {
      // 現在位置以降の履歴を削除
      const newHistory = prev.slice(0, index + 1);
      newHistory.push(newState);

      // 最大履歴数を超えたら古いものを削除
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [index, maxHistory]);

  const undo = useCallback(() => {
    setIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setIndex(prev => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const reset = useCallback((newState?: T) => {
    setHistory([newState ?? initialState]);
    setIndex(0);
  }, [initialState]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return {
    state,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    history,
    historyIndex: index,
  };
}
```

## WebSocket フック

### useWebSocket

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed';

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
  options: UseWebSocketOptions = {}
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

  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = (event) => {
      setStatus('open');
      reconnectCountRef.current = 0;
      onOpen?.(event);
    };

    wsRef.current.onclose = (event) => {
      setStatus('closed');
      onClose?.(event);

      // 再接続
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
    reconnectCountRef.current = reconnectAttempts; // 再接続を防止
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
function ChatRoom({ roomId }: { roomId: string }) {
  // WebSocket接続
  const { status, lastMessage, sendMessage } = useWebSocket<ChatMessage>(
    `wss://chat.example.com/room/${roomId}`,
    {
      onMessage: (event) => {
        console.log('Received:', event.data);
      },
    }
  );

  // フォーム管理
  const form = useForm({
    initialValues: { message: '' },
    onSubmit: async (values) => {
      sendMessage({ type: 'message', content: values.message });
      form.reset();
    },
  });

  // メッセージ履歴（Undo/Redo付き）
  const { state: messages, set: setMessages, undo, canUndo } = useUndoRedo<ChatMessage[]>([]);

  useEffect(() => {
    if (lastMessage) {
      setMessages([...messages, lastMessage]);
    }
  }, [lastMessage]);

  return (
    <div>
      <div>Status: {status}</div>
      <MessageList messages={messages} />
      <form onSubmit={form.handleSubmit}>
        <input {...form.getFieldProps('message')} />
        <button type="submit" disabled={form.isSubmitting}>Send</button>
      </form>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
    </div>
  );
}
```
