# useReducerテンプレート

## 基本テンプレート

```typescript
import { useReducer } from 'react';

// ============================================
// 状態の型定義
// ============================================
interface State {
  // 状態のプロパティを定義
  value: string;
  count: number;
  isLoading: boolean;
}

// ============================================
// アクションの型定義（判別可能なユニオン型）
// ============================================
type Action =
  | { type: 'SET_VALUE'; payload: string }
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

// ============================================
// 初期状態
// ============================================
const initialState: State = {
  value: '',
  count: 0,
  isLoading: false,
};

// ============================================
// リデューサー関数
// ============================================
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, value: action.payload };

    case 'INCREMENT':
      return { ...state, count: state.count + 1 };

    case 'DECREMENT':
      return { ...state, count: state.count - 1 };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'RESET':
      return initialState;

    default:
      // TypeScriptの網羅性チェック
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// ============================================
// コンポーネントでの使用
// ============================================
function ExampleComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

## 非同期データフェッチテンプレート

```typescript
import { useReducer, useEffect } from 'react';

// ============================================
// 状態の型定義
// ============================================
interface FetchState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

// ============================================
// アクションの型定義
// ============================================
type FetchAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'RESET' };

// ============================================
// 初期状態
// ============================================
function getInitialState<T>(): FetchState<T> {
  return {
    status: 'idle',
    data: null,
    error: null,
  };
}

// ============================================
// リデューサー関数
// ============================================
function fetchReducer<T>(
  state: FetchState<T>,
  action: FetchAction<T>
): FetchState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading', data: null, error: null };

    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload, error: null };

    case 'FETCH_ERROR':
      return { status: 'error', data: null, error: action.payload };

    case 'RESET':
      return getInitialState<T>();

    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// ============================================
// カスタムフック
// ============================================
function useFetchReducer<T>(fetchFn: () => Promise<T>) {
  const [state, dispatch] = useReducer(
    fetchReducer<T>,
    null,
    getInitialState
  );

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const data = await fetchFn();
        if (!cancelled) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        }
      } catch (error) {
        if (!cancelled) {
          dispatch({
            type: 'FETCH_ERROR',
            payload: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [fetchFn]);

  return state;
}
```

## フォーム状態管理テンプレート

```typescript
import { useReducer, useCallback } from 'react';

// ============================================
// 状態の型定義
// ============================================
interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================
// アクションの型定義
// ============================================
type FormAction<T extends Record<string, unknown>> =
  | { type: 'SET_FIELD'; field: keyof T; value: T[keyof T] }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'TOUCH_FIELD'; field: keyof T }
  | { type: 'SET_ERRORS'; errors: Partial<Record<keyof T, string>> }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR' }
  | { type: 'RESET'; values: T };

// ============================================
// リデューサー関数
// ============================================
function formReducer<T extends Record<string, unknown>>(
  state: FormState<T>,
  action: FormAction<T>
): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
        isValid: false,
      };

    case 'TOUCH_FIELD':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
        isValid: Object.keys(action.errors).length === 0,
      };

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };

    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };

    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false };

    case 'RESET':
      return {
        values: action.values,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true,
      };

    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// ============================================
// カスタムフック
// ============================================
function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [state, dispatch] = useReducer(formReducer<T>, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const setField = useCallback((field: keyof T, value: T[keyof T]) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const touchField = useCallback((field: keyof T) => {
    dispatch({ type: 'TOUCH_FIELD', field });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', values: initialValues });
  }, [initialValues]);

  return {
    ...state,
    setField,
    touchField,
    reset,
  };
}
```

## チェックリスト

- [ ] 状態の型が定義されている
- [ ] アクションの型が判別可能なユニオン型で定義されている
- [ ] 初期状態が定義されている
- [ ] リデューサーが純粋関数である
- [ ] switchのdefaultで網羅性チェックがある
- [ ] 必要に応じてカスタムフックに抽出されている
