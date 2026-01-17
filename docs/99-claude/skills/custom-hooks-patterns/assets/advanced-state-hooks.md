# 高度な状態管理フック

## useReducerWithMiddleware

```typescript
import { useReducer, useCallback, useRef, Reducer, Dispatch } from "react";

type Middleware<S, A> = (
  getState: () => S,
  dispatch: Dispatch<A>,
) => (next: Dispatch<A>) => Dispatch<A>;

/**
 * ミドルウェア付きのuseReducer
 */
export function useReducerWithMiddleware<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = [],
): [S, Dispatch<A>] {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  const dispatch = useCallback(
    (action: A) => {
      const chain = middlewares.map((middleware) =>
        middleware(getState, baseDispatch),
      );

      const composedDispatch = chain.reduceRight(
        (next, middleware) => middleware(next),
        baseDispatch,
      );

      return composedDispatch(action);
    },
    [middlewares, getState, baseDispatch],
  );

  return [state, dispatch];
}

// ロギングミドルウェア
export const loggerMiddleware: Middleware<unknown, unknown> =
  (getState) => (next) => (action) => {
    console.log("Previous State:", getState());
    console.log("Action:", action);
    const result = next(action);
    console.log("Next State:", getState());
    return result;
  };

// Thunkミドルウェア
export const thunkMiddleware: Middleware<unknown, unknown> =
  (getState, dispatch) => (next) => (action) => {
    if (typeof action === "function") {
      return (
        action as (
          dispatch: typeof dispatch,
          getState: typeof getState,
        ) => unknown
      )(dispatch, getState);
    }
    return next(action);
  };
```

## useUndoRedo

```typescript
import { useState, useCallback, useMemo } from "react";

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
  maxHistory = 50,
): UseUndoRedoResult<T> {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const set = useCallback(
    (newState: T) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, index + 1);
        newHistory.push(newState);

        if (newHistory.length > maxHistory) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [index, maxHistory],
  );

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const reset = useCallback(
    (newState?: T) => {
      setHistory([newState ?? initialState]);
      setIndex(0);
    },
    [initialState],
  );

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

## 使用例

```typescript
// useReducerWithMiddleware例
type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

function counterReducer(state: number, action: Action): number {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    default: return state;
  }
}

function Counter() {
  const [count, dispatch] = useReducerWithMiddleware(
    counterReducer,
    0,
    [loggerMiddleware]
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  );
}

// useUndoRedo例
function TextEditor() {
  const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo('');

  return (
    <div>
      <textarea
        value={state}
        onChange={(e) => set(e.target.value)}
      />
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}
```
