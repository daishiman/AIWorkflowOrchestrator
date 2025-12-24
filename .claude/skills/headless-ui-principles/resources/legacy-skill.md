---
name: .claude/skills/headless-ui-principles/SKILL.md
description: |
  ヘッドレスUIアーキテクチャとスタイル非依存コンポーネント設計の専門知識。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/headless-ui-principles/resources/headless-architecture.md`: ヘッドレスアーキテクチャ詳細
  - `.claude/skills/headless-ui-principles/resources/aria-patterns.md`: WAI-ARIAパターン実装ガイド
  - `.claude/skills/headless-ui-principles/resources/library-comparison.md`: Radix UI/Headless UI/React Aria/Downshift/Ariakitの特徴・評価・選択ガイド
  - `.claude/skills/headless-ui-principles/templates/headless-hook-template.ts`: カスタムフックテンプレート
  - `.claude/skills/headless-ui-principles/templates/headless-component-template.tsx`: コンポーネントテンプレート

  専門分野:
  - ロジックとプレゼンテーションの分離: 動作とスタイルの完全分離
  - スタイル非依存設計: Style Agnostic アーキテクチャ
  - アクセシビリティ組み込み: WAI-ARIA パターン実装
  - 実装パターン: Custom Hooks、Render Props、Headless Components

  使用タイミング:
  - カスタムデザインシステムを構築する時
  - 完全なスタイル制御が必要な時
  - 再利用可能なUI ロジックを抽出する時
  - アクセシビリティを確保しながら柔軟性を保ちたい時

  Use proactively when building custom design systems,
  implementing style-agnostic components, or creating reusable UI logic.
version: 1.0.0
---

# .claude/skills/headless-ui-principles/SKILL.md

ヘッドレスUIアーキテクチャとスタイル非依存コンポーネント設計の専門知識

---

## 概要

### 目的

ヘッドレスUIの設計原則を体系化し、ロジックとスタイルを完全に分離した
再利用性の高いコンポーネント設計を支援する。

### 対象者

- UIライブラリ開発者
- デザインシステムアーキテクト
- 高度なコンポーネント設計を行うフロントエンドエンジニア

---

## コア原則

### 1. ロジックとプレゼンテーションの分離

```
┌─────────────────────────────────────────────────┐
│               ヘッドレスコンポーネント           │
│  ┌─────────────────────────────────────────┐   │
│  │  ロジック層（Headless）                  │   │
│  │  - 状態管理                              │   │
│  │  - キーボードナビゲーション              │   │
│  │  - アクセシビリティ属性                  │   │
│  │  - イベントハンドリング                  │   │
│  └─────────────────────────────────────────┘   │
│                      ↓                          │
│  ┌─────────────────────────────────────────┐   │
│  │  プレゼンテーション層（Styled）          │   │
│  │  - 視覚的スタイル                        │   │
│  │  - アニメーション                        │   │
│  │  - レイアウト                            │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 2. 関心の分離

| 層                   | 責任                         | 例                     |
| -------------------- | ---------------------------- | ---------------------- |
| ロジック層           | 動作・状態・アクセシビリティ | `useDialog`, `useMenu` |
| プレゼンテーション層 | 視覚表現・スタイル           | CSS, Tailwind          |
| コンポジション層     | 構造・レイアウト             | JSX構造                |

### 3. スタイル非依存（Style Agnostic）

```tsx
// ヘッドレスコンポーネント - スタイルなし
function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);
  const toggle = () => setIsOn((prev) => !prev);

  return {
    isOn,
    toggle,
    buttonProps: {
      role: "switch",
      "aria-checked": isOn,
      onClick: toggle,
    },
  };
}

// 消費者が自由にスタイルを適用
function StyledToggle() {
  const { isOn, buttonProps } = useToggle();

  return (
    <button {...buttonProps} className={isOn ? "bg-blue-500" : "bg-gray-300"}>
      {isOn ? "ON" : "OFF"}
    </button>
  );
}
```

---

## 実装パターン

### パターン1: Custom Hooks

最もシンプルなヘッドレスパターン。ロジックをhookとして抽出。

```tsx
// useDialog.ts
interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  triggerProps: {
    onClick: () => void;
    "aria-haspopup": "dialog";
    "aria-expanded": boolean;
  };
  dialogProps: {
    role: "dialog";
    "aria-modal": boolean;
    "aria-labelledby": string;
  };
}

function useDialog(): UseDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    triggerProps: {
      onClick: () => setIsOpen(true),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
    },
    dialogProps: {
      role: "dialog",
      "aria-modal": true,
      "aria-labelledby": `${id}-title`,
    },
  };
}
```

### パターン2: Render Props

レンダリングの完全な制御を消費者に委譲。

```tsx
interface ComboboxProps<T> {
  items: T[];
  value: T | null;
  onChange: (value: T) => void;
  children: (props: ComboboxRenderProps<T>) => ReactNode;
}

interface ComboboxRenderProps<T> {
  isOpen: boolean;
  highlightedIndex: number;
  inputProps: InputProps;
  menuProps: MenuProps;
  getItemProps: (item: T, index: number) => ItemProps;
}

function Combobox<T>({ items, value, onChange, children }: ComboboxProps<T>) {
  // ... ロジック実装

  return <>{children(renderProps)}</>;
}
```

### パターン3: Headless Components

コンポーネント形式でプロパティを提供。

```tsx
// Dialog.tsx
const DialogContext = createContext<DialogContextType | null>(null);

function Dialog({ children, open, onOpenChange }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild }) {
  const { onOpenChange } = useDialogContext();
  const Comp = asChild ? Slot : "button";

  return <Comp onClick={() => onOpenChange(true)}>{children}</Comp>;
}

function DialogContent({ children }) {
  const { open, onOpenChange } = useDialogContext();

  if (!open) return null;

  return (
    <Portal>
      <div role="dialog" aria-modal>
        {children}
      </div>
    </Portal>
  );
}
```

---

## アクセシビリティの組み込み

### WAI-ARIA パターン実装

```tsx
// メニューボタンのヘッドレス実装
function useMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  // キーボードナビゲーション
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Enter":
      case " ":
        if (activeIndex >= 0) {
          selectItem(activeIndex);
        }
        break;
    }
  };

  return {
    isOpen,
    activeIndex,
    buttonProps: {
      "aria-haspopup": "menu",
      "aria-expanded": isOpen,
      onClick: () => setIsOpen(!isOpen),
    },
    menuProps: {
      role: "menu",
      "aria-activedescendant":
        activeIndex >= 0 ? `menu-item-${activeIndex}` : undefined,
      onKeyDown: handleKeyDown,
      ref: menuRef,
    },
    getItemProps: (index: number) => ({
      id: `menu-item-${index}`,
      role: "menuitem",
      tabIndex: activeIndex === index ? 0 : -1,
      "aria-selected": activeIndex === index,
    }),
  };
}
```

---

## 主要なヘッドレスライブラリ

### Radix UI

```tsx
import * as Dialog from "@radix-ui/react-dialog";

// 完全なスタイル制御が可能
<Dialog.Root>
  <Dialog.Trigger className="your-button-styles">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="your-overlay-styles" />
    <Dialog.Content className="your-content-styles">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>;
```

### Headless UI

```tsx
import { Menu } from "@headlessui/react";

<Menu>
  <Menu.Button className="your-button-styles">Options</Menu.Button>
  <Menu.Items className="your-menu-styles">
    <Menu.Item>
      {({ active }) => <a className={active ? "bg-blue-500" : ""}>Account</a>}
    </Menu.Item>
  </Menu.Items>
</Menu>;
```

### React Aria

```tsx
import { useButton } from "@react-aria/button";

function Button(props) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);

  return (
    <button {...buttonProps} ref={ref} className="your-styles">
      {props.children}
    </button>
  );
}
```

---

## 設計判断ガイド

### ヘッドレスを選ぶべき場合

✅ **推奨**:

- カスタムデザインシステムを構築する
- ブランドアイデンティティが重要
- 複数プロジェクトで再利用する
- 完全なアクセシビリティ制御が必要

❌ **非推奨**:

- 素早いプロトタイピング
- 標準的なUIで十分
- チームにアクセシビリティ知識が不足

### パターン選択フロー

```
コンポーネント設計開始
    │
    ├─ シンプルな状態管理のみ？
    │   └─ Yes → Custom Hook
    │
    ├─ 複雑なレンダリング制御が必要？
    │   └─ Yes → Render Props
    │
    └─ 標準的なコンポーネント構造で十分？
        └─ Yes → Headless Components
```

---

## リソース

- `resources/headless-architecture.md` - ヘッドレスアーキテクチャ詳細
- `resources/aria-patterns.md` - WAI-ARIAパターン実装ガイド
- `resources/library-comparison.md` - ライブラリ比較
- `templates/headless-hook-template.ts` - カスタムフックテンプレート
- `templates/headless-component-template.tsx` - コンポーネントテンプレート

---

## 関連スキル

- `.claude/skills/component-composition-patterns/SKILL.md` - コンポーネント合成パターン
- `.claude/skills/accessibility-wcag/SKILL.md` - アクセシビリティ対応
- `.claude/skills/design-system-architecture/SKILL.md` - デザインシステム設計

---

## バージョン情報

- 作成日: 2025-01-13
- 最終更新: 2025-01-13
- バージョン: 1.0.0
