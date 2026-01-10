# コンポーネント階層設計ガイド

## 概要

コンポーネント階層は、UIライブラリの**組織化戦略**です。
適切な階層分離により、再利用性、保守性、拡張性を最大化します。

---

## 階層モデル

### 4層構造

```
┌────────────────────────────────────────────┐
│           Templates (テンプレート)          │
│  ページ全体のレイアウト構造                 │
│  例: DashboardLayout, AuthLayout          │
└────────────────────┬───────────────────────┘
                     │
┌────────────────────▼───────────────────────┐
│           Features (機能)                   │
│  ビジネスロジックを含む高レベルコンポーネント │
│  例: LoginForm, UserCard, CommentSection   │
└────────────────────┬───────────────────────┘
                     │
┌────────────────────▼───────────────────────┐
│           Patterns (パターン)               │
│  汎用的なUI構成パターン                     │
│  例: SearchInput, FormField, IconButton    │
└────────────────────┬───────────────────────┘
                     │
┌────────────────────▼───────────────────────┐
│           Primitives (プリミティブ)          │
│  最小単位のUI要素、ビジネスロジックなし      │
│  例: Button, Input, Text, Badge            │
└────────────────────────────────────────────┘
```

---

## 各層の詳細

### 1. Primitives（プリミティブ）

**定義**: 分割不可能な最小単位のUI要素

**特徴**:

- ビジネスロジックを含まない
- 高い再利用性
- 単一の責務
- 外部依存なし（他コンポーネントに依存しない）

**例**:

```typescript
// Button - プリミティブの典型例
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, size, disabled, children, onClick }: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**プリミティブの一覧**:

- `Button` - クリック可能なアクション要素
- `Input` - テキスト入力
- `Checkbox` - 選択状態の切り替え
- `Radio` - 単一選択
- `Select` - ドロップダウン選択
- `Text` - テキスト表示
- `Icon` - アイコン表示
- `Badge` - ステータス表示
- `Avatar` - ユーザー画像
- `Spinner` - ローディング表示

### 2. Patterns（パターン）

**定義**: プリミティブを組み合わせた汎用UIパターン

**特徴**:

- プリミティブの組み合わせ
- 特定のUIパターンを実現
- ビジネスロジックは含まない
- レイアウトや振る舞いの標準化

**例**:

```typescript
// FormField - Label + Input + ErrorMessage のパターン
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode; // Input等を受け取る
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label required={required}>{label}</Label>
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}
```

**パターンの一覧**:

- `FormField` - ラベル付きフォーム入力
- `SearchInput` - 検索アイコン付き入力
- `IconButton` - アイコン付きボタン
- `PasswordInput` - 表示切替付きパスワード入力
- `Alert` - 通知メッセージ
- `Card` - コンテンツカード
- `Modal` - モーダルダイアログ
- `Dropdown` - ドロップダウンメニュー
- `Tabs` - タブ切り替え
- `Accordion` - 折りたたみコンテンツ

### 3. Features（機能）

**定義**: ビジネスロジックを含む機能特化型コンポーネント

**特徴**:

- 特定の機能に特化
- ビジネスロジックを含む
- データフェッチを行う場合がある
- プロジェクト固有

**例**:

```typescript
// LoginForm - 認証機能を持つフォーム
export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Email" error={error?.email}>
        <Input type="email" value={email} onChange={setEmail} />
      </FormField>
      <FormField label="Password" error={error?.password}>
        <PasswordInput value={password} onChange={setPassword} />
      </FormField>
      <Button type="submit" loading={isLoading}>
        ログイン
      </Button>
    </form>
  );
}
```

**Featuresの例**:

- `LoginForm` - ログインフォーム
- `UserCard` - ユーザー情報カード
- `CommentSection` - コメント一覧
- `NotificationList` - 通知リスト
- `SettingsPanel` - 設定パネル

### 4. Templates（テンプレート）

**定義**: ページ全体のレイアウト構造

**特徴**:

- ページの骨格を定義
- Slot（配置場所）を提供
- コンテンツは受け取る
- ナビゲーション、サイドバー等を含む

**例**:

```typescript
// DashboardLayout - ダッシュボードのレイアウト
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r">
        {sidebar ?? <DefaultSidebar />}
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
```

---

## 依存関係ルール

### 許可される依存

```
Templates → Features → Patterns → Primitives
    ↓          ↓          ↓          ↓
   OK         OK         OK         ❌
```

**ルール**:

- 上位層は下位層に依存できる
- 下位層は上位層に依存してはいけない
- 同一層内での依存は最小限に

### 禁止される依存

```
❌ Primitives → Patterns
❌ Primitives → Features
❌ Patterns → Features
❌ 循環参照（A → B → A）
```

---

## ディレクトリ構造

### 推奨構造

```
src/
├── components/
│   ├── primitives/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Text/
│   │   └── index.ts
│   ├── patterns/
│   │   ├── FormField/
│   │   ├── SearchInput/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   └── SignupForm/
│   │   └── user/
│   │       └── UserCard/
│   └── templates/
│       ├── DashboardLayout/
│       └── AuthLayout/
```

### 各コンポーネントの構造

```
Button/
├── Button.tsx           # コンポーネント本体
├── Button.styles.ts     # スタイル（Tailwind variants等）
├── Button.types.ts      # 型定義
├── Button.stories.tsx   # Storybook
├── Button.test.tsx      # テスト
├── useButton.ts         # カスタムフック（必要な場合）
└── index.ts             # エクスポート
```

---

## 設計判断基準

### どの層に配置するか？

```
Q: ビジネスロジックを含むか？
├── Yes → Features または Templates
└── No
    ├── Q: 複数のプリミティブを組み合わせているか？
    │   ├── Yes → Patterns
    │   └── No → Primitives
```

### Patterns vs Features の判断

| 観点             | Patterns         | Features           |
| ---------------- | ---------------- | ------------------ |
| ビジネスロジック | なし             | あり               |
| データフェッチ   | なし             | あり               |
| 再利用性         | プロジェクト横断 | プロジェクト固有   |
| 命名             | 汎用的（Card）   | 具体的（UserCard） |

---

## チェックリスト

### 階層設計時

- [ ] 4層構造が明確に分離されているか
- [ ] 依存関係ルールが守られているか
- [ ] 各コンポーネントの配置が適切か
- [ ] 循環参照がないか

### コンポーネント追加時

- [ ] 適切な層に配置されているか
- [ ] 単一責任の原則を守っているか
- [ ] 依存関係が適切か
- [ ] 命名が一貫しているか
