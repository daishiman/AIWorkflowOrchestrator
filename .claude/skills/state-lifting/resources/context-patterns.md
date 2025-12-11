# Context APIパターン

## 概要

React ContextはProp Drillingを解決する強力なツールですが、
適切に使用しないとパフォーマンス問題を引き起こします。
このドキュメントでは、Contextの効果的な使用パターンを解説します。

## 使用判断基準

### Contextが適切なケース

```
✅ 使用すべき
├── テーマ（ダーク/ライトモード）
├── 認証状態（ログインユーザー）
├── 言語/ロケール設定
├── 設定/プリファレンス
└── 更新頻度が低いデータ

❌ 避けるべき
├── 高頻度で更新されるデータ
├── 単一コンポーネントでのみ使用
├── 深さ2-3階層程度のデータ
└── リアルタイムで変化するデータ
```

## 基本パターン

### パターン1: シンプルContext

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. 型定義
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Context作成
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. Provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 4. カスタムフック
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### パターン2: 状態と更新の分離

高頻度更新時のパフォーマンス最適化。

```typescript
// 状態用Context
const CountStateContext = createContext<number | null>(null);
// 更新用Context
const CountDispatchContext = createContext<((action: Action) => void) | null>(null);

type Action = { type: 'increment' } | { type: 'decrement' };

function countReducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'decrement': return state - 1;
  }
}

export function CountProvider({ children }: { children: ReactNode }) {
  const [count, dispatch] = useReducer(countReducer, 0);

  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={dispatch}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

// 状態のみ必要なコンポーネント用
export function useCountState() {
  const context = useContext(CountStateContext);
  if (context === null) {
    throw new Error('useCountState must be used within CountProvider');
  }
  return context;
}

// 更新のみ必要なコンポーネント用（状態変更で再レンダリングしない）
export function useCountDispatch() {
  const context = useContext(CountDispatchContext);
  if (!context) {
    throw new Error('useCountDispatch must be used within CountProvider');
  }
  return context;
}
```

### パターン3: メモ化によるProvider最適化

```typescript
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(defaultPrefs);

  // 値をメモ化
  const value = useMemo(
    () => ({
      user,
      preferences,
      setUser,
      setPreferences,
    }),
    [user, preferences]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

### パターン4: セレクターパターン

```typescript
interface AppState {
  user: User | null;
  theme: Theme;
  notifications: Notification[];
}

const AppContext = createContext<AppState | null>(null);

// セレクターフック
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppSelector must be used within AppProvider');
  }
  return selector(context);
}

// 使用例: 必要な部分のみ購読
function UserName() {
  const userName = useAppSelector(state => state.user?.name);
  return <span>{userName}</span>;
}
```

## パフォーマンス最適化

### 問題: Context全体の再レンダリング

```typescript
// ❌ 問題: どのプロパティが変わっても全消費者が再レンダリング
const AppContext = createContext({
  user: null,
  theme: "light",
  notifications: [],
  settings: {},
});
```

### 解決策1: Contextの分割

```typescript
// ✅ 関連するデータごとにContextを分割
const UserContext = createContext<UserState>(null);
const ThemeContext = createContext<ThemeState>('light');
const NotificationContext = createContext<NotificationState>([]);

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

### 解決策2: 消費者のメモ化

```typescript
// 重いコンポーネントをメモ化
const HeavyComponent = memo(function HeavyComponent({ data }: Props) {
  // 重い描画処理
  return <div>{/* ... */}</div>;
});

function Parent() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      {/* themeが変わってもHeavyComponentは再レンダリングしない */}
      <HeavyComponent data={staticData} />
    </div>
  );
}
```

### 解決策3: children活用

```typescript
// ❌ 問題: Provider内のすべてが再レンダリング
function App() {
  const [count, setCount] = useState(0);

  return (
    <CountContext.Provider value={count}>
      <Header />  {/* countが変わるたびに再レンダリング */}
      <Main />
      <Footer />
    </CountContext.Provider>
  );
}

// ✅ 解決: childrenパターン
function CountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <CountContext.Provider value={count}>
      {children}  {/* 親で定義されたchildrenは再レンダリングしない */}
    </CountContext.Provider>
  );
}

function App() {
  return (
    <CountProvider>
      <Header />  {/* Contextを使わなければ再レンダリングしない */}
      <Main />
      <Footer />
    </CountProvider>
  );
}
```

## アンチパターン

### 1. 巨大なContext

```typescript
// ❌ 避ける
const GlobalContext = createContext({
  user: null,
  cart: [],
  products: [],
  orders: [],
  settings: {},
  notifications: [],
  // ... すべてをまとめる
});
```

### 2. 高頻度更新データ

```typescript
// ❌ 避ける: マウス位置のような高頻度データ
const MouseContext = createContext({ x: 0, y: 0 });
```

### 3. オブジェクトリテラルの直接渡し

```typescript
// ❌ 毎レンダリングで新しいオブジェクトが作られる
<UserContext.Provider value={{ user, setUser }}>

// ✅ useMemoでメモ化
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={value}>
```

## ベストプラクティス

1. **Contextは小さく保つ**: 関連データごとに分割
2. **更新頻度で分離**: 読み取り専用と書き込み用を分ける
3. **デフォルト値を適切に**: nullを使い、フック内でエラーをスロー
4. **カスタムフックを提供**: 直接useContextを使わせない
5. **メモ化を活用**: Provider値とコンポーネントをメモ化
