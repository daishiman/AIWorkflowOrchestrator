# 命名規則とファイル構造ガイド

## 概要

一貫した命名規則は、デザインシステムの**発見可能性**と**保守性**を高めます。
チーム全員が同じルールに従うことで、認知負荷を下げ、生産性を向上させます。

---

## コンポーネント命名規則

### 基本ルール

| 対象             | 規約                           | 例                                 |
| ---------------- | ------------------------------ | ---------------------------------- |
| コンポーネント名 | PascalCase                     | `Button`, `IconButton`, `UserCard` |
| ファイル名       | PascalCase.tsx                 | `Button.tsx`, `IconButton.tsx`     |
| フォルダ名       | PascalCase                     | `Button/`, `IconButton/`           |
| カスタムフック   | camelCase + use接頭辞          | `useButton`, `useModal`            |
| 型定義           | PascalCase + Props/State接尾辞 | `ButtonProps`, `ModalState`        |

### コンポーネント命名パターン

```
[修飾語] + [基本名]

例:
- IconButton = Icon + Button
- SearchInput = Search + Input
- PrimaryButton = Primary + Button（❌ 避ける：variantで表現）
```

**良い例**:

- `Button` - 基本ボタン
- `IconButton` - アイコン付きボタン
- `SubmitButton` - 送信ボタン（機能を表す）

**避けるべき例**:

- `BlueButton` - 色で命名（variantで表現すべき）
- `BigButton` - サイズで命名（sizeプロパティで表現すべき）
- `Btn` - 過度な略語

---

## Props命名規則

### 基本ルール

| 種類          | 規約             | 例                                  |
| ------------- | ---------------- | ----------------------------------- |
| 一般Props     | camelCase        | `onClick`, `className`              |
| 真偽値Props   | is/has/can接頭辞 | `isDisabled`, `hasError`, `canEdit` |
| ハンドラProps | on接頭辞         | `onClick`, `onChange`, `onSubmit`   |
| 参照Props     | ref接尾辞        | `inputRef`, `containerRef`          |

### Variant命名

```typescript
// 良い例
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

// 避けるべき例
type ButtonVariant = "blue" | "gray"; // ❌ 色ベース
type ButtonSize = "small" | "medium" | "large"; // ❌ 長い表記
```

### 状態Props

```typescript
// 真偽値は is/has/can で始める
interface ButtonProps {
  isDisabled?: boolean; // ○
  isLoading?: boolean; // ○
  hasIcon?: boolean; // ○
  disabled?: boolean; // △ HTML属性との一致を優先する場合
}
```

---

## ファイル構造規則

### コンポーネントフォルダ構造

```
Button/
├── Button.tsx           # メインコンポーネント
├── Button.styles.ts     # スタイル定義（Tailwind variants等）
├── Button.types.ts      # 型定義
├── Button.stories.tsx   # Storybook
├── Button.test.tsx      # テスト
├── useButton.ts         # カスタムフック（必要な場合）
├── ButtonContext.tsx    # Context（必要な場合）
└── index.ts             # エクスポート
```

### index.ts のエクスポート形式

```typescript
// Button/index.ts
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant } from "./Button.types";
```

### 階層別ディレクトリ構造

```
components/
├── primitives/
│   ├── Button/
│   ├── Input/
│   ├── Text/
│   └── index.ts         # 全primitiveのre-export
├── patterns/
│   ├── FormField/
│   ├── Modal/
│   └── index.ts
├── features/
│   ├── auth/
│   │   ├── LoginForm/
│   │   └── index.ts
│   └── user/
│       └── UserCard/
└── templates/
    ├── DashboardLayout/
    └── index.ts
```

---

## CSS/スタイル命名規則

### CSS変数

```css
/* 命名パターン: --[namespace]-[category]-[property]-[variant] */

:root {
  /* Colors */
  --ds-color-primary-500: #3b82f6;
  --ds-color-text-primary: #111827;

  /* Spacing */
  --ds-spacing-md: 1rem;

  /* Typography */
  --ds-font-size-base: 1rem;
}
```

### Tailwindカスタムクラス

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--ds-color-primary-50)",
          // ...
        },
      },
    },
  },
};
```

### CSS Modulesクラス名

```css
/* Button.module.css */
.button {
}
.button--primary {
}
.button--disabled {
}
.button__icon {
}
.button__label {
}
```

---

## デザイントークン命名規則

### トークン命名パターン

```
[category].[property].[variant].[state]

例:
color.background.primary
color.text.secondary
spacing.padding.md
border.radius.lg
motion.duration.fast
```

### カテゴリ一覧

| カテゴリ     | 説明 | 例                         |
| ------------ | ---- | -------------------------- |
| `color`      | 色   | `color.primary.500`        |
| `typography` | 文字 | `typography.fontSize.base` |
| `spacing`    | 間隔 | `spacing.4`                |
| `border`     | 境界 | `border.radius.md`         |
| `shadow`     | 影   | `shadow.lg`                |
| `motion`     | 動き | `motion.duration.normal`   |

---

## Storybook命名規則

### タイトル

```typescript
// Button.stories.tsx
export default {
  title: "Primitives/Button", // 階層/コンポーネント名
  component: Button,
};
```

### Story名

```typescript
// PascalCaseで機能を表現
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const WithIcon: Story = { args: { leftIcon: <SearchIcon /> } };
export const Disabled: Story = { args: { isDisabled: true } };
```

---

## テストファイル命名規則

### ファイル名

```
Button.test.tsx       # 単体テスト
Button.spec.tsx       # 統合テスト（代替）
Button.e2e.test.tsx   # E2Eテスト
```

### テストケース命名

```typescript
describe("Button", () => {
  describe("レンダリング", () => {
    it("デフォルトのvariantでレンダリングされる", () => {});
    it("disabledの場合クリックできない", () => {});
  });

  describe("インタラクション", () => {
    it("クリック時にonClickが呼ばれる", () => {});
  });
});
```

---

## チェックリスト

### 命名時

- [ ] PascalCase/camelCaseが正しく使われているか
- [ ] 略語を避け、意味が明確か
- [ ] 色やサイズではなく機能で命名しているか
- [ ] 真偽値は is/has/can で始まっているか
- [ ] ハンドラは on で始まっているか

### ファイル構造

- [ ] コンポーネントごとにフォルダが作られているか
- [ ] index.ts で適切にエクスポートされているか
- [ ] 階層（primitives/patterns/features）が守られているか
- [ ] テスト・Storybookファイルが存在するか

### 一貫性

- [ ] プロジェクト全体で命名規則が統一されているか
- [ ] 既存コンポーネントと整合性があるか
- [ ] ドキュメント化されているか
