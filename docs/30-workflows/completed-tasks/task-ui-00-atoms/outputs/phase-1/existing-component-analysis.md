# 既存コンポーネント分析 — Phase 1 成果物

## Badge 現状分析

### コード構造（52行）

| 分析項目               | 現状の値                                                   |
| ---------------------- | ---------------------------------------------------------- |
| コンポーネントパターン | `forwardRef` + `clsx`                                      |
| variant 定義           | `"default" \| "success" \| "warning" \| "error" \| "info"` |
| size 定義              | `"sm" \| "md"`                                             |
| カラー指定方式         | Tailwind 標準クラス（`bg-gray-600`, `bg-green-500` 他）    |
| ARIA 属性              | `role="status"`                                            |
| children の型          | `React.ReactNode`（必須 props）                            |
| displayName            | `"Badge"`                                                  |
| テスト内のアサーション | Tailwind クラス名（`toHaveClass("bg-gray-600")`）          |

### カラーマッピング（移行対象）

| variant        | 現在のクラス    | 移行先 CSS 変数         |
| -------------- | --------------- | ----------------------- |
| default        | `bg-gray-600`   | `var(--status-default)` |
| success        | `bg-green-500`  | `var(--status-success)` |
| warning        | `bg-orange-400` | `var(--status-warning)` |
| error          | `bg-red-500`    | `var(--status-error)`   |
| info           | `bg-blue-500`   | `var(--status-info)`    |
| (新規) primary | なし            | `var(--status-primary)` |

### テスト影響分析（17テスト）

**影響あり（6テスト）** — カラークラス名アサーションの修正が必要:

| テスト名                                | 現在のアサーション             | 修正内容                  |
| --------------------------------------- | ------------------------------ | ------------------------- |
| defaultバリアントのスタイルを適用する   | `toHaveClass("bg-gray-600")`   | CSS変数ベースクラスに変更 |
| successバリアントのスタイルを適用する   | `toHaveClass("bg-green-500")`  | CSS変数ベースクラスに変更 |
| warningバリアントのスタイルを適用する   | `toHaveClass("bg-orange-400")` | CSS変数ベースクラスに変更 |
| errorバリアントのスタイルを適用する     | `toHaveClass("bg-red-500")`    | CSS変数ベースクラスに変更 |
| infoバリアントのスタイルを適用する      | `toHaveClass("bg-blue-500")`   | CSS変数ベースクラスに変更 |
| デフォルトでdefaultバリアントを使用する | `toHaveClass("bg-gray-600")`   | CSS変数ベースクラスに変更 |

**影響なし（11テスト）** — テキスト内容・DOM構造・ref・className・ARIA等のアサーション:

- レンダリング系: 2件（子要素レンダリング、span要素確認）
- サイズ系: 3件（sm/md/デフォルトmd）
- スタイル系: 3件（rounded-full, inline-flex, whitespace-nowrap）
- ARIA系: 1件（role=status）
- className系: 2件（カスタムclassName追加、共存確認）
- ref系: 1件（ref転送）
- 追加props系: 2件（data-testid, title）

---

## EmptyState 現状分析

### コード構造（41行）

| 分析項目               | 現状の値                                                  |
| ---------------------- | --------------------------------------------------------- |
| コンポーネントパターン | `React.FC` + `memo` + `clsx`                              |
| props 定義             | `title`, `description?`, `icon?`, `action?`, `className?` |
| Icon 依存              | `../Icon` から `Icon`, `IconName` をインポート            |
| カラー指定方式         | Tailwind 標準クラス（`text-gray-400`, `text-gray-500`）   |
| ARIA 属性              | なし（要追加）                                            |
| displayName            | `"EmptyState"`                                            |
| action 渡し方          | `React.ReactNode`（JSX をそのまま渡す）                   |

### カラーマッピング（移行対象）

| 要素     | 現在のクラス    | 移行先 CSS 変数         |
| -------- | --------------- | ----------------------- |
| タイトル | `text-gray-400` | `var(--text-secondary)` |
| 説明文   | `text-gray-500` | `var(--text-muted)`     |
| アイコン | `text-gray-500` | `var(--text-muted)`     |

### テスト影響分析（6テスト）

**全テスト影響なし** — テキスト内容・DOM構造をアサーションしており、カラークラス名をアサーションしていない:

| テスト名                         | アサーション内容        | 影響 |
| -------------------------------- | ----------------------- | ---- |
| タイトルを表示する               | `getByText`             | なし |
| 説明文を表示する                 | `getByText`             | なし |
| 説明文なしでもレンダリングできる | `getByText`             | なし |
| アイコンを表示する               | `getByText`（存在確認） | なし |
| アクションを表示する             | `getByRole("button")`   | なし |
| カスタムclassNameを追加する      | `toHaveClass`           | なし |

### atoms/index.ts エクスポート状況

現在のエクスポート: Button, Icon, Badge, Spinner, Avatar, ProgressBar, Input, TextArea, Checkbox（9コンポーネント）

**注意**: EmptyState が現在エクスポートされていない。Phase 5 で新規5コンポーネント + EmptyState の計6エクスポートを追加する必要がある。
