# useReducerパターン

## 概要

useReducerは、複雑な状態ロジックを管理するためのReact Hookです。
Reduxの思想を取り入れ、アクションベースの状態更新を提供します。

## いつuseReducerを使うか

### 適用基準

| 基準 | useState | useReducer |
|------|----------|------------|
| 状態の複雑さ | 単純 | 複雑 |
| 状態の関連性 | 独立 | 相互関連 |
| 更新ロジック | シンプル | 複雑 |
| テスト容易性 | - | 高い |
| 状態遷移パターン | 少ない | 多い |

### useReducerが適切なケース

1. **複数の関連状態**: loading, error, data などが連動
2. **複雑な状態遷移**: 状態マシン的な遷移
3. **テスト重視**: リデューサーの単体テストが必要
4. **コンテキストとの組み合わせ**: Context API経由で状態を共有

## 基本構造

```typescript
// 状態の型定義
interface State {
  count: number;
  step: number;
}

// アクションの型定義（判別可能なユニオン型）
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; payload: number };

// 初期状態
const initialState: State = {
  count: 0,
  step: 1,
};

// リデューサー関数（純粋関数）
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'reset':
      return initialState;
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      // TypeScriptの網羅性チェック
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// コンポーネントでの使用
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </>
  );
}
```

## 実践パターン

### パターン1: 非同期データフェッチ

```typescript
interface FetchState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

type FetchAction<T> =
  | { type: 'fetch_start' }
  | { type: 'fetch_success'; payload: T }
  | { type: 'fetch_error'; error: Error }
  | { type: 'reset' };

function createFetchReducer<T>() {
  return function fetchReducer(
    state: FetchState<T>,
    action: FetchAction<T>
  ): FetchState<T> {
    switch (action.type) {
      case 'fetch_start':
        return { ...state, status: 'loading', error: null };
      case 'fetch_success':
        return { status: 'success', data: action.payload, error: null };
      case 'fetch_error':
        return { status: 'error', data: null, error: action.error };
      case 'reset':
        return { status: 'idle', data: null, error: null };
      default:
        return state;
    }
  };
}

// 使用例
function UserProfile({ userId }: { userId: string }) {
  const [state, dispatch] = useReducer(createFetchReducer<User>(), {
    status: 'idle',
    data: null,
    error: null,
  });

  useEffect(() => {
    dispatch({ type: 'fetch_start' });

    fetchUser(userId)
      .then(user => dispatch({ type: 'fetch_success', payload: user }))
      .catch(error => dispatch({ type: 'fetch_error', error }));
  }, [userId]);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <Error error={state.error} />;
  if (state.status === 'success') return <Profile user={state.data} />;
  return null;
}
```

### パターン2: フォーム状態管理

```typescript
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

type FormAction =
  | { type: 'change'; field: string; value: string }
  | { type: 'blur'; field: string }
  | { type: 'validate'; errors: Record<string, string> }
  | { type: 'submit_start' }
  | { type: 'submit_success' }
  | { type: 'submit_error'; errors: Record<string, string> }
  | { type: 'reset' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'change':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'blur':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case 'validate':
      return {
        ...state,
        errors: action.errors,
        isValid: Object.keys(action.errors).length === 0,
      };
    case 'submit_start':
      return { ...state, isSubmitting: true };
    case 'submit_success':
      return { ...state, isSubmitting: false };
    case 'submit_error':
      return { ...state, isSubmitting: false, errors: action.errors };
    case 'reset':
      return initialFormState;
    default:
      return state;
  }
}
```

### パターン3: 状態マシン（FSM）

```typescript
type WizardState =
  | { step: 'personal'; data: { name?: string; email?: string } }
  | { step: 'address'; data: { name: string; email: string; address?: string } }
  | { step: 'confirm'; data: { name: string; email: string; address: string } }
  | { step: 'complete'; data: { name: string; email: string; address: string } };

type WizardAction =
  | { type: 'next'; payload?: Partial<WizardState['data']> }
  | { type: 'back' }
  | { type: 'reset' };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'next':
      const newData = { ...state.data, ...action.payload };

      switch (state.step) {
        case 'personal':
          if (newData.name && newData.email) {
            return { step: 'address', data: newData as any };
          }
          return state;
        case 'address':
          if (newData.address) {
            return { step: 'confirm', data: newData as any };
          }
          return state;
        case 'confirm':
          return { step: 'complete', data: newData as any };
        default:
          return state;
      }
    case 'back':
      switch (state.step) {
        case 'address':
          return { step: 'personal', data: state.data };
        case 'confirm':
          return { step: 'address', data: state.data };
        default:
          return state;
      }
    case 'reset':
      return { step: 'personal', data: {} };
    default:
      return state;
  }
}
```

## 設計原則

### 1. アクションの命名

```typescript
// ❌ 悪い例: 状態変更を記述
{ type: 'SET_LOADING_TRUE' }
{ type: 'UPDATE_COUNT' }

// ✅ 良い例: 何が起こったかを記述
{ type: 'fetch_started' }
{ type: 'user_incremented_count' }
```

### 2. リデューサーの純粋性

```typescript
// ❌ 悪い例: 副作用あり
function reducer(state, action) {
  localStorage.setItem('state', JSON.stringify(state)); // 副作用
  return { ...state, count: state.count + 1 };
}

// ✅ 良い例: 純粋関数
function reducer(state, action) {
  return { ...state, count: state.count + 1 };
}
// 副作用はuseEffectで処理
useEffect(() => {
  localStorage.setItem('state', JSON.stringify(state));
}, [state]);
```

### 3. 状態の正規化

```typescript
// ❌ 悪い例: ネストした状態
interface State {
  users: Array<{
    id: string;
    posts: Array<{
      id: string;
      comments: Comment[];
    }>;
  }>;
}

// ✅ 良い例: フラットな正規化
interface State {
  users: Record<string, User>;
  posts: Record<string, Post>;
  comments: Record<string, Comment>;
  userPosts: Record<string, string[]>; // userId -> postIds
  postComments: Record<string, string[]>; // postId -> commentIds
}
```

## Context + useReducer

```typescript
// コンテキスト定義
interface AppContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// プロバイダー
function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// カスタムフック
function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
```

## テスト

```typescript
describe('counterReducer', () => {
  it('should increment count', () => {
    const state = { count: 0, step: 1 };
    const result = reducer(state, { type: 'increment' });
    expect(result.count).toBe(1);
  });

  it('should decrement count', () => {
    const state = { count: 5, step: 2 };
    const result = reducer(state, { type: 'decrement' });
    expect(result.count).toBe(3);
  });

  it('should reset to initial state', () => {
    const state = { count: 100, step: 5 };
    const result = reducer(state, { type: 'reset' });
    expect(result).toEqual(initialState);
  });
});
```

## ベストプラクティスまとめ

1. **型安全性**: 判別可能なユニオン型でアクションを定義
2. **純粋関数**: リデューサーに副作用を含めない
3. **フラットな状態**: 正規化してネストを避ける
4. **網羅性チェック**: switchのdefaultでTypeScriptの網羅性を活用
5. **テスト容易性**: リデューサーは単体テストが容易
