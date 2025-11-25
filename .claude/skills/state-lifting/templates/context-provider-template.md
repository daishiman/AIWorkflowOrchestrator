# Contextプロバイダーテンプレート

## 基本的なContextプロバイダー

```typescript
import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';

// 1. 型定義
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Context作成（デフォルトはnull）
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. Provider実装
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);

  // 値をメモ化（不要な再レンダリング防止）
  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 4. カスタムフック
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

## 状態と更新を分離したContext

```typescript
import {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  ReactNode,
} from 'react';

// 型定義
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

// 分離したContext
const AuthStateContext = createContext<AuthState | null>(null);
const AuthDispatchContext = createContext<Dispatch<AuthAction> | null>(null);

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
}

// 初期状態
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// 状態用フック
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within AuthProvider');
  }
  return context;
}

// 更新用フック（状態変更で再レンダリングしない）
export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error('useAuthDispatch must be used within AuthProvider');
  }
  return context;
}

// アクション付きフック
export function useAuth() {
  const state = useAuthState();
  const dispatch = useAuthDispatch();

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await loginApi(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return { ...state, login, logout };
}
```

## 複数Provider結合パターン

```typescript
import { ReactNode } from 'react';

// 各Providerをimport
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';

// Providerを結合するユーティリティ
type ProviderComponent = React.FC<{ children: ReactNode }>;

function combineProviders(...providers: ProviderComponent[]) {
  return function CombinedProvider({ children }: { children: ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}

// 結合したProvider
export const AppProviders = combineProviders(
  ThemeProvider,
  AuthProvider,
  NotificationProvider
);

// 使用
function App() {
  return (
    <AppProviders>
      <Router>
        <Routes />
      </Router>
    </AppProviders>
  );
}
```

## セレクター付きContext

```typescript
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useSyncExternalStore,
} from 'react';

interface Store {
  user: User | null;
  cart: CartItem[];
  preferences: Preferences;
}

// Contextは参照を保持
const StoreContext = createContext<{
  getState: () => Store;
  subscribe: (listener: () => void) => () => void;
  dispatch: (action: Action) => void;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // 購読者管理
  const listeners = new Set<() => void>();

  const getState = useCallback(() => state, [state]);

  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  // 状態変更時に購読者に通知
  useEffect(() => {
    listeners.forEach((listener) => listener());
  }, [state]);

  return (
    <StoreContext.Provider value={{ getState, subscribe, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// セレクターフック
export function useSelector<T>(selector: (state: Store) => T): T {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useSelector must be used within StoreProvider');
  }

  return useSyncExternalStore(
    context.subscribe,
    () => selector(context.getState())
  );
}

// 使用例
function CartCount() {
  // cartの長さのみ購読（他の状態変更で再レンダリングしない）
  const count = useSelector((state) => state.cart.length);
  return <span>{count}</span>;
}
```

## デバッグ機能付きContext

```typescript
import { createContext, useContext, useReducer, ReactNode } from 'react';

const isDevelopment = process.env.NODE_ENV === 'development';

function createDebugContext<S, A>(
  name: string,
  reducer: (state: S, action: A) => S,
  initialState: S
) {
  const StateContext = createContext<S | null>(null);
  const DispatchContext = createContext<React.Dispatch<A> | null>(null);

  // デバッグ用ラッパー
  const debugReducer = (state: S, action: A): S => {
    if (isDevelopment) {
      console.group(`${name} Action`);
      console.log('Previous State:', state);
      console.log('Action:', action);
      const nextState = reducer(state, action);
      console.log('Next State:', nextState);
      console.groupEnd();
      return nextState;
    }
    return reducer(state, action);
  };

  function Provider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(debugReducer, initialState);

    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  }

  function useState() {
    const context = useContext(StateContext);
    if (context === null) {
      throw new Error(`use${name}State must be used within ${name}Provider`);
    }
    return context;
  }

  function useDispatch() {
    const context = useContext(DispatchContext);
    if (!context) {
      throw new Error(`use${name}Dispatch must be used within ${name}Provider`);
    }
    return context;
  }

  return { Provider, useState, useDispatch };
}

// 使用
const { Provider: CartProvider, useState: useCartState, useDispatch: useCartDispatch } =
  createDebugContext('Cart', cartReducer, initialCartState);
```

## 使用例

```typescript
// アプリのルート
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes />
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// コンポーネントでの使用
function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className={theme}>
      {user && <span>Welcome, {user.name}</span>}
      <button onClick={toggleTheme}>Toggle Theme</button>
      {user && <button onClick={logout}>Logout</button>}
    </header>
  );
}
```
