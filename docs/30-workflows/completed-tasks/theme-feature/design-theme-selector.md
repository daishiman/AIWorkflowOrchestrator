# ThemeSelector コンポーネント設計書

## ドキュメント情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | T-01-5                                                                   |
| ステータス   | 完了                                                                     |
| 作成日       | 2025-12-08                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx` |

---

## 1. 設計概要

### 1.1 目的

`ThemeSelector` は、ユーザーがテーマ（Light / Dark / System）を選択するための UIコンポーネント。

### 1.2 設計方針

- **Atomic Design**: molecules レベルのコンポーネント
- **アクセシビリティ**: WCAG 2.1 AA 準拠
- **macOS HIG**: セグメントコントロール風のデザイン
- **再利用性**: useTheme フックとの疎結合

### 1.3 コンポーネント階層

```
ThemeSelector (molecules)
├── Button (atoms) × 3  [Light, Dark, System]
└── Icon (atoms) × 3    [sun, moon, monitor]
```

---

## 2. ビジュアル設計

### 2.1 外観仕様

```
┌───────────────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  ☀️ ライト  │ │  🌙 ダーク  │ │  🖥️ システム │          │
│  │  (Light)   │ │  (Dark)    │ │  (System)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                      ▲                                    │
│                   選択状態                                 │
└───────────────────────────────────────────────────────────┘
```

### 2.2 状態

| 状態       | スタイル                               |
| ---------- | -------------------------------------- |
| 未選択     | `bg-white/5`, `text-white/60`          |
| 選択中     | `bg-[#0a84ff]`, `text-white`, `ring-2` |
| ホバー     | `bg-white/10`（未選択時のみ）          |
| フォーカス | `ring-2 ring-offset-2 ring-[#0a84ff]`  |
| 無効       | `opacity-50`, `cursor-not-allowed`     |

### 2.3 サイズ

| サイズ | ボタン寸法 | アイコン | テキスト  |
| ------ | ---------- | -------- | --------- |
| sm     | h-8 px-3   | 14px     | text-xs   |
| md     | h-10 px-4  | 16px     | text-sm   |
| lg     | h-12 px-6  | 18px     | text-base |

---

## 3. Props インターフェース

### 3.1 型定義

```typescript
// apps/desktop/src/renderer/components/molecules/ThemeSelector/types.ts

import type { ThemeMode } from "../../../store/types";

export interface ThemeSelectorProps {
  /**
   * 現在選択されているテーマモード
   */
  value: ThemeMode;

  /**
   * テーマ変更時のコールバック
   */
  onChange: (mode: ThemeMode) => void;

  /**
   * コンポーネントのサイズ
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * 無効状態
   * @default false
   */
  disabled?: boolean;

  /**
   * 横幅を親要素に合わせる
   * @default false
   */
  fullWidth?: boolean;

  /**
   * ラベルを表示するか
   * @default true
   */
  showLabels?: boolean;

  /**
   * 追加のCSSクラス
   */
  className?: string;

  /**
   * アクセシビリティ用のラベルID
   */
  "aria-labelledby"?: string;
}

export interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: "sun" | "moon" | "monitor";
  description: string;
}
```

### 3.2 デフォルト Props

```typescript
const defaultProps: Partial<ThemeSelectorProps> = {
  size: "md",
  disabled: false,
  fullWidth: false,
  showLabels: true,
};
```

---

## 4. 実装設計

### 4.1 コンポーネント本体

```tsx
// apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx

import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { ThemeSelectorProps, ThemeOption } from "./types";
import type { ThemeMode } from "../../../store/types";

const THEME_OPTIONS: ThemeOption[] = [
  {
    mode: "light",
    label: "ライト",
    icon: "sun",
    description: "常にライトテーマを使用",
  },
  {
    mode: "dark",
    label: "ダーク",
    icon: "moon",
    description: "常にダークテーマを使用",
  },
  {
    mode: "system",
    label: "システム",
    icon: "monitor",
    description: "OSの設定に従う",
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  value,
  onChange,
  size = "md",
  disabled = false,
  fullWidth = false,
  showLabels = true,
  className,
  "aria-labelledby": ariaLabelledby,
}) => {
  // サイズに応じたスタイル
  const sizeStyles = useMemo(
    () => ({
      sm: { button: "h-8 px-3 text-xs gap-1.5", icon: 14 },
      md: { button: "h-10 px-4 text-sm gap-2", icon: 16 },
      lg: { button: "h-12 px-6 text-base gap-2.5", icon: 18 },
    }),
    [],
  );

  // ボタンクリックハンドラー
  const handleClick = useCallback(
    (mode: ThemeMode) => {
      if (!disabled) {
        onChange(mode);
      }
    },
    [disabled, onChange],
  );

  // キーボードナビゲーション
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const options = THEME_OPTIONS;
      let newIndex = currentIndex;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          newIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
          break;
        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;
        case "End":
          event.preventDefault();
          newIndex = options.length - 1;
          break;
        default:
          return;
      }

      onChange(options[newIndex].mode);
      // 新しいボタンにフォーカスを移動
      const buttons =
        event.currentTarget.parentElement?.querySelectorAll("button");
      buttons?.[newIndex]?.focus();
    },
    [onChange],
  );

  const currentStyles = sizeStyles[size];

  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledby}
      className={clsx(
        "inline-flex rounded-lg p-1",
        "bg-white/5 backdrop-blur-sm",
        fullWidth && "w-full",
        className,
      )}
    >
      {THEME_OPTIONS.map((option, index) => {
        const isSelected = value === option.mode;

        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.description}
            disabled={disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleClick(option.mode)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={clsx(
              "inline-flex items-center justify-center rounded-md",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "focus:ring-[#0a84ff] focus:ring-offset-gray-900",
              currentStyles.button,
              fullWidth && "flex-1",
              isSelected
                ? "bg-[#0a84ff] text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/10",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <Icon
              name={option.icon}
              size={currentStyles.icon}
              aria-hidden="true"
            />
            {showLabels && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

ThemeSelector.displayName = "ThemeSelector";
```

### 4.2 使用例

```tsx
// 基本的な使用
import { ThemeSelector } from '../components/molecules/ThemeSelector';
import { useTheme } from '../hooks/useTheme';

function SettingsPage() {
  const { themeMode, setTheme } = useTheme();

  return (
    <SettingsCard title="テーマ" id="theme-settings">
      <ThemeSelector
        value={themeMode}
        onChange={setTheme}
        aria-labelledby="theme-settings"
      />
    </SettingsCard>
  );
}

// アイコンのみ（ラベルなし）
<ThemeSelector
  value={themeMode}
  onChange={setTheme}
  showLabels={false}
  size="sm"
/>

// フル幅
<ThemeSelector
  value={themeMode}
  onChange={setTheme}
  fullWidth
  size="lg"
/>
```

---

## 5. アクセシビリティ設計

### 5.1 ARIA 属性

| 属性              | 値               | 説明               |
| ----------------- | ---------------- | ------------------ |
| `role`            | `radiogroup`     | セレクターグループ |
| `aria-labelledby` | 外部ラベルのID   | ラベルとの関連付け |
| `role` (button)   | `radio`          | 各ボタンの役割     |
| `aria-checked`    | `true` / `false` | 選択状態           |
| `aria-label`      | オプションの説明 | 各ボタンの詳細説明 |
| `aria-disabled`   | `true` / `false` | 無効状態           |

### 5.2 キーボードナビゲーション

| キー            | 動作                                   |
| --------------- | -------------------------------------- |
| `Tab`           | グループにフォーカス（選択中のボタン） |
| `Shift+Tab`     | グループからフォーカスアウト           |
| `→` / `↓`       | 次のオプションを選択                   |
| `←` / `↑`       | 前のオプションを選択                   |
| `Home`          | 最初のオプションを選択                 |
| `End`           | 最後のオプションを選択                 |
| `Space`/`Enter` | 現在のオプションを選択（フォーカス時） |

### 5.3 roving tabindex パターン

```typescript
// 選択されているボタンのみ tabIndex=0
// それ以外は tabIndex=-1
tabIndex={isSelected ? 0 : -1}
```

### 5.4 フォーカス管理

```typescript
// 矢印キーで移動時、新しいボタンにフォーカスを移動
const buttons = event.currentTarget.parentElement?.querySelectorAll("button");
buttons?.[newIndex]?.focus();
```

---

## 6. スタイル詳細

### 6.1 CSSクラス定義

```typescript
// コンテナ
const containerStyles = clsx(
  "inline-flex rounded-lg p-1",
  "bg-white/5 backdrop-blur-sm",
);

// ボタン共通
const buttonBaseStyles = clsx(
  "inline-flex items-center justify-center rounded-md",
  "transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-offset-1",
  "focus:ring-[#0a84ff] focus:ring-offset-gray-900",
);

// 選択状態
const selectedStyles = "bg-[#0a84ff] text-white shadow-sm";

// 未選択状態
const unselectedStyles = "text-white/60 hover:text-white hover:bg-white/10";

// 無効状態
const disabledStyles = "opacity-50 cursor-not-allowed";
```

### 6.2 CSS変数の使用

```css
/* tokens.css の変数を使用 */
.theme-selector-button {
  background-color: var(--status-primary); /* 選択時 */
  color: var(--text-primary);
}

.theme-selector-button:not(.selected) {
  color: var(--text-secondary);
}

.theme-selector-button:hover:not(.selected) {
  background-color: var(--bg-elevated);
}
```

---

## 7. テスト設計

### 7.1 ユニットテスト

```typescript
// apps/desktop/src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSelector } from './index';

describe('ThemeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all theme options', () => {
    render(<ThemeSelector value="system" onChange={mockOnChange} />);

    expect(screen.getByRole('radio', { name: /ライト/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /ダーク/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /システム/i })).toBeInTheDocument();
  });

  it('should mark selected option as checked', () => {
    render(<ThemeSelector value="dark" onChange={mockOnChange} />);

    const darkButton = screen.getByRole('radio', { name: /ダーク/i });
    expect(darkButton).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange when option is clicked', async () => {
    render(<ThemeSelector value="system" onChange={mockOnChange} />);

    const lightButton = screen.getByRole('radio', { name: /ライト/i });
    await userEvent.click(lightButton);

    expect(mockOnChange).toHaveBeenCalledWith('light');
  });

  it('should support keyboard navigation with arrow keys', async () => {
    render(<ThemeSelector value="light" onChange={mockOnChange} />);

    const lightButton = screen.getByRole('radio', { name: /ライト/i });
    lightButton.focus();

    // 右矢印で次のオプション
    fireEvent.keyDown(lightButton, { key: 'ArrowRight' });
    expect(mockOnChange).toHaveBeenCalledWith('dark');
  });

  it('should wrap around when navigating past the last option', async () => {
    render(<ThemeSelector value="system" onChange={mockOnChange} />);

    const systemButton = screen.getByRole('radio', { name: /システム/i });
    systemButton.focus();

    fireEvent.keyDown(systemButton, { key: 'ArrowRight' });
    expect(mockOnChange).toHaveBeenCalledWith('light');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ThemeSelector value="system" onChange={mockOnChange} disabled />);

    const buttons = screen.getAllByRole('radio');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should not call onChange when disabled', async () => {
    render(<ThemeSelector value="system" onChange={mockOnChange} disabled />);

    const lightButton = screen.getByRole('radio', { name: /ライト/i });
    await userEvent.click(lightButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should hide labels when showLabels is false', () => {
    render(
      <ThemeSelector value="system" onChange={mockOnChange} showLabels={false} />
    );

    expect(screen.queryByText('ライト')).not.toBeInTheDocument();
    expect(screen.queryByText('ダーク')).not.toBeInTheDocument();
    expect(screen.queryByText('システム')).not.toBeInTheDocument();
  });

  it('should have proper aria-labelledby when provided', () => {
    render(
      <ThemeSelector
        value="system"
        onChange={mockOnChange}
        aria-labelledby="theme-label"
      />
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-labelledby', 'theme-label');
  });
});
```

### 7.2 テストケース一覧

| テストケース                   | 検証内容                      |
| ------------------------------ | ----------------------------- |
| 3つのオプションが表示される    | light, dark, system が存在    |
| 選択状態の表示                 | aria-checked="true"           |
| クリックで onChange が呼ばれる | 正しいモード値が渡される      |
| 矢印キーでナビゲーション       | ArrowRight/Left で移動        |
| ラップアラウンド               | 最後→最初、最初→最後          |
| Home/End キー                  | 最初/最後のオプションに移動   |
| disabled 状態                  | クリック無効、スタイル適用    |
| showLabels=false               | ラベルが非表示                |
| aria-labelledby の設定         | radiogroup に属性が設定される |
| フォーカス管理                 | roving tabindex が機能        |

---

## 8. 完了条件チェックリスト

### T-01-5 完了条件

- [x] Props定義が完了している
  - `value`, `onChange`, `size`, `disabled`, `fullWidth`, `showLabels`
- [x] レイアウト・スタイル仕様が定義されている
  - 3つのボタン、サイズバリエーション、状態スタイル
- [x] アクセシビリティ要件が設計されている
  - radiogroup, roving tabindex, キーボードナビゲーション
- [x] 既存コンポーネントとの統合方針が明確
  - Button/Icon atoms の利用、SettingsCard との組み合わせ

---

## 9. 関連ドキュメント

| ドキュメント     | パス                                                           | 関係         |
| ---------------- | -------------------------------------------------------------- | ------------ |
| useTheme設計書   | `docs/30-workflows/theme-feature/design-use-theme.md`          | フック連携   |
| CSS変数設計書    | `docs/30-workflows/theme-feature/design-css-variables.md`      | スタイル連携 |
| 既存Button       | `apps/desktop/src/renderer/components/atoms/Button/`           | パターン参照 |
| 既存SettingsCard | `apps/desktop/src/renderer/components/organisms/SettingsCard/` | 使用例       |

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容 |
| ---------- | ---------- | ------------ | -------- |
| 1.0.0      | 2025-12-08 | .claude/agents/ui-designer.md | 初版作成 |
