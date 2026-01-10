# ダークモード実装ガイド

## 概要

Tailwind CSSでダークモードを実装するための
戦略とベストプラクティスを解説します。

---

## 実装方法

### 1. クラスベース（推奨）

手動で制御可能。JavaScriptでトグル。

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class",
};
```

```tsx
// 使用例
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  コンテンツ
</div>
```

```tsx
// テーマ切り替え
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)}>{isDark ? "🌙" : "☀️"}</button>
  );
}
```

### 2. メディアクエリベース

OSの設定に自動で追従。

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "media",
};
```

### 3. セレクタベース（Tailwind v3.4+）

カスタムセレクタを使用。

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
};
```

```html
<html data-theme="dark"></html>
```

---

## テーマ管理

### Context APIでテーマ管理

```tsx
// ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // ローカルストレージから復元
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    let resolved: "light" | "dark";
    if (theme === "system") {
      resolved = systemDark ? "dark" : "light";
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // ローカルストレージに保存
    localStorage.setItem("theme", theme);
  }, [theme]);

  // システム設定の変更を監視
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

### テーマトグルボタン

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-2 rounded-md",
          theme === "light" && "bg-gray-200 dark:bg-gray-700",
        )}
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-2 rounded-md",
          theme === "dark" && "bg-gray-200 dark:bg-gray-700",
        )}
      >
        🌙
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "p-2 rounded-md",
          theme === "system" && "bg-gray-200 dark:bg-gray-700",
        )}
      >
        💻
      </button>
    </div>
  );
}
```

---

## CSS変数との統合

### 変数定義

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### Tailwind設定

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
    },
  },
};
```

### 使用例

```tsx
// CSS変数経由（dark:不要）
<div className="bg-background text-foreground border-border">
  自動でテーマが切り替わる
</div>

// 直接指定（dark:必要）
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  手動で両方指定
</div>
```

---

## カラーパレット設計

### 推奨構造

```
Light Mode                    Dark Mode
─────────────────────────────────────────
Background   #FFFFFF (白)     #09090B (ほぼ黒)
Foreground   #09090B (黒)     #FAFAFA (ほぼ白)
─────────────────────────────────────────
Card         #FFFFFF          #09090B
Card-fg      #09090B          #FAFAFA
─────────────────────────────────────────
Muted        #F4F4F5          #27272A
Muted-fg     #71717A          #A1A1AA
─────────────────────────────────────────
Border       #E4E4E7          #27272A
─────────────────────────────────────────
```

### コントラスト確保

```tsx
// ✅ 十分なコントラスト
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">読みやすい</p>
</div>

// ❌ 不十分なコントラスト
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-400 dark:text-gray-500">読みにくい</p>
</div>
```

---

## フラッシュ防止

### サーバーサイドでの初期化

```tsx
// layout.tsx (Next.js App Router)
export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (theme === 'dark' || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## コンポーネントパターン

### ダークモード対応ボタン

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: ["bg-primary text-primary-foreground", "hover:bg-primary/90"],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
        ],
        outline: [
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
        ],
        ghost: ["hover:bg-accent hover:text-accent-foreground"],
      },
    },
  },
);
```

### ダークモード対応カード

```tsx
function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        // ダークモードでシャドウを調整
        "dark:shadow-none dark:border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

---

## ベストプラクティス

### 1. セマンティックカラーを使用

```tsx
// ✅ Good: セマンティック
<div className="bg-background text-foreground">
<div className="bg-muted text-muted-foreground">

// ❌ Bad: ハードコード
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### 2. 画像の調整

```tsx
// ダークモードで明るさを下げる
<img
  src={image}
  className="dark:brightness-90"
  alt=""
/>

// ダークモード用の別画像
<picture>
  <source srcSet={darkImage} media="(prefers-color-scheme: dark)" />
  <img src={lightImage} alt="" />
</picture>
```

### 3. アイコンの色

```tsx
// currentColorを使用
<svg className="text-foreground" fill="currentColor">
  {/* ... */}
</svg>
```

---

## チェックリスト

- [ ] ダークモードの切り替えが正常に動作するか
- [ ] テーマ設定が永続化されているか
- [ ] フラッシュが発生していないか
- [ ] すべてのコンポーネントがダークモードに対応しているか
- [ ] 画像やアイコンがダークモードで見やすいか
- [ ] コントラスト比が十分か（WCAG AA: 4.5:1）
- [ ] システム設定の変更に追従するか
