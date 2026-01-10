# デザイントークン詳細ガイド

## 概要

デザイントークンは、デザインシステムにおける**原子レベルの設計値**です。
色、タイポグラフィ、スペーシングなど、あらゆるビジュアル要素の値を
抽象化・一元管理することで、一貫性とメンテナンス性を実現します。

---

## トークン階層モデル

### 3層構造の詳細

```
┌─────────────────────────────────────────┐
│         Global Tokens (基盤層)           │
│   プラットフォーム非依存の生の値         │
│   例: blue-500: "#3B82F6"               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Alias Tokens (意味層)            │
│   セマンティックな意味を持つ参照         │
│   例: primary: {$blue-500}              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       Component Tokens (用途層)          │
│   特定コンポーネント用の値               │
│   例: button-bg: {$primary}             │
└─────────────────────────────────────────┘
```

### なぜ3層構造が必要か

1. **変更の局所化**: ブランドカラーが変わってもAlias層の参照先を変えるだけ
2. **文脈の明確化**: `blue-500`より`primary`が意図を伝える
3. **テーマ対応**: ダークモードはAlias層で切り替え可能

---

## カテゴリ別トークン設計

### 1. Color Tokens

```json
{
  "color": {
    "global": {
      "blue": {
        "50": "#EFF6FF",
        "100": "#DBEAFE",
        "500": "#3B82F6",
        "600": "#2563EB",
        "900": "#1E3A8A"
      },
      "gray": {
        "50": "#F9FAFB",
        "100": "#F3F4F6",
        "500": "#6B7280",
        "900": "#111827"
      }
    },
    "alias": {
      "primary": "{color.global.blue.500}",
      "primary-hover": "{color.global.blue.600}",
      "text-primary": "{color.global.gray.900}",
      "text-secondary": "{color.global.gray.500}",
      "background": "{color.global.gray.50}"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    }
  }
}
```

**設計原則**:

- グローバル層は数値ベース（50, 100, 500...）
- エイリアス層は用途ベース（primary, secondary...）
- セマンティック層は状態ベース（success, error...）

### 2. Typography Tokens

```json
{
  "typography": {
    "fontFamily": {
      "sans": "Inter, system-ui, -apple-system, sans-serif",
      "mono": "JetBrains Mono, Menlo, monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    "fontWeight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  }
}
```

**Alias例**:

```json
{
  "text": {
    "heading-1": {
      "fontSize": "{typography.fontSize.3xl}",
      "fontWeight": "{typography.fontWeight.bold}",
      "lineHeight": "{typography.lineHeight.tight}"
    },
    "body": {
      "fontSize": "{typography.fontSize.base}",
      "fontWeight": "{typography.fontWeight.normal}",
      "lineHeight": "{typography.lineHeight.normal}"
    }
  }
}
```

### 3. Spacing Tokens

```json
{
  "spacing": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem"
  }
}
```

**4pxグリッドシステム**:

- 1 = 4px (0.25rem)
- 2 = 8px (0.5rem)
- 4 = 16px (1rem)

### 4. Border & Radius Tokens

```json
{
  "border": {
    "width": {
      "none": "0",
      "thin": "1px",
      "medium": "2px",
      "thick": "4px"
    },
    "radius": {
      "none": "0",
      "sm": "0.125rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "full": "9999px"
    }
  }
}
```

### 5. Shadow Tokens

```json
{
  "shadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"
  }
}
```

### 6. Motion Tokens

```json
{
  "motion": {
    "duration": {
      "instant": "0ms",
      "fast": "150ms",
      "normal": "250ms",
      "slow": "400ms"
    },
    "easing": {
      "linear": "linear",
      "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}
```

---

## ダークモード対応

### テーマ切り替え戦略

```json
{
  "color": {
    "alias": {
      "light": {
        "background": "{color.global.gray.50}",
        "text-primary": "{color.global.gray.900}",
        "border": "{color.global.gray.200}"
      },
      "dark": {
        "background": "{color.global.gray.900}",
        "text-primary": "{color.global.gray.50}",
        "border": "{color.global.gray.700}"
      }
    }
  }
}
```

### CSS変数での実装

```css
:root {
  --color-background: #f9fafb;
  --color-text-primary: #111827;
}

[data-theme="dark"] {
  --color-background: #111827;
  --color-text-primary: #f9fafb;
}
```

---

## トークン命名規則

### 命名パターン

```
[category].[property].[variant].[state]

例:
color.background.primary
color.text.secondary
spacing.padding.md
border.radius.lg
```

### 避けるべき命名

| NG            | OK               | 理由                 |
| ------------- | ---------------- | -------------------- |
| `red`         | `error`          | 色ではなく意味で     |
| `large`       | `lg`             | 略語で統一           |
| `button-blue` | `button-primary` | 色の直接参照を避ける |

---

## ツール統合

### Style Dictionary変換

```javascript
// config.js
module.exports = {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
      ],
    },
  },
};
```

### Tailwind Config統合

```javascript
// tailwind.config.js
const tokens = require("./dist/tokens.js");

module.exports = {
  theme: {
    colors: tokens.color,
    spacing: tokens.spacing,
    // ...
  },
};
```

---

## チェックリスト

### トークン設計時

- [ ] 3層構造（Global → Alias → Component）が適用されているか
- [ ] セマンティックな命名がされているか
- [ ] ダークモード対応が考慮されているか
- [ ] アクセシビリティ要件（コントラスト比等）を満たしているか
- [ ] 拡張性が考慮されているか（新しい色の追加が容易か）

### 実装時

- [ ] CSS変数として出力されているか
- [ ] TypeScript型が生成されているか
- [ ] Tailwind設定と統合されているか
- [ ] 変更時の影響範囲が明確か
