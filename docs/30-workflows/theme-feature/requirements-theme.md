# テーマ機能 - 機能要件定義書

## 概要

### 目的

ライト/ダークテーマの切り替えと永続化を実装する。

### 背景

現在のSettingsViewはテーマ選択UIがあるが、ローカルstateのみで永続化されず、実際のスタイル適用も機能していない。CSS変数ベースのテーマシステムを実装する必要がある。

### スコープ

- ライト/ダーク/システム連動テーマ
- テーマ設定の永続化
- CSS変数によるスタイル切り替え
- リアルタイムテーマ変更

---

## 機能要件

### FR-TH-001: テーマ切り替え

#### 説明

ユーザーがライト/ダーク/システム連動からテーマを選択できる。

#### 受け入れ基準

- [ ] ライトテーマを選択できる
- [ ] ダークテーマを選択できる
- [ ] システム設定に連動するオプションを選択できる
- [ ] テーマ変更が即座に反映される（リロード不要）
- [ ] 選択したテーマが永続化される

#### テーマ定義

```typescript
type ThemeMode = "light" | "dark" | "system";

interface ThemeConfig {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark"; // 実際に適用されるテーマ
}
```

---

### FR-TH-002: システムテーマ連動

#### 説明

OSのテーマ設定に連動してアプリのテーマを自動切り替え。

#### 受け入れ基準

- [ ] 「システム」選択時、OSの設定に従う
- [ ] OS設定変更時にリアルタイムで反映される
- [ ] macOS/Windows両対応

#### 実装方法

```typescript
// OSテーマ検出
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

// 変更監視
prefersDark.addEventListener("change", (e) => {
  if (themeMode === "system") {
    applyTheme(e.matches ? "dark" : "light");
  }
});
```

---

### FR-TH-003: CSS変数テーマシステム

#### 説明

CSS変数を使用したテーマ切り替えシステムを実装する。

#### 受け入れ基準

- [ ] `:root`にCSS変数を定義
- [ ] `data-theme`属性でテーマを切り替え
- [ ] 全コンポーネントがCSS変数を参照
- [ ] トランジション付きでスムーズに切り替わる

#### CSS変数定義

```css
:root {
  /* ライトテーマ（デフォルト） */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-bg-tertiary: #e0e0e0;

  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;

  --color-border: #e0e0e0;
  --color-border-hover: #cccccc;

  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Glass効果 */
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(0, 0, 0, 0.1);
  --glass-blur: 10px;
}

[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-bg-tertiary: #2a2a2a;

  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #666666;

  --color-border: #333333;
  --color-border-hover: #444444;

  --color-accent: #60a5fa;
  --color-accent-hover: #3b82f6;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;

  /* Glass効果（ダーク） */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 10px;
}
```

---

### FR-TH-004: テーマ永続化

#### 説明

選択したテーマ設定を永続化する。

#### 受け入れ基準

- [ ] テーマ設定がelectron-storeに保存される
- [ ] アプリ起動時に保存されたテーマが適用される
- [ ] 初回起動時はシステム設定に従う

#### 永続化スキーマ

```typescript
interface ThemeSettings {
  mode: ThemeMode; // 'light' | 'dark' | 'system'
  customColors?: {
    // 将来の拡張用（オプション）
    accent?: string;
  };
}
```

---

### FR-TH-005: テーマトランジション

#### 説明

テーマ切り替え時にスムーズなトランジションを適用する。

#### 受け入れ基準

- [ ] テーマ切り替え時に色がスムーズに変化する
- [ ] トランジション時間: 200ms
- [ ] 初回ロード時はトランジションなし（FOUC防止）

#### トランジションCSS

```css
:root {
  --theme-transition-duration: 200ms;
}

html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition:
    background-color var(--theme-transition-duration) ease,
    border-color var(--theme-transition-duration) ease,
    color var(--theme-transition-duration) ease !important;
}
```

---

## 非機能要件

### NFR-TH-001: パフォーマンス

- テーマ切り替え: 16ms以内（60fps維持）
- 初回テーマ適用: 50ms以内
- CSS変数変更の反映: 即座

### NFR-TH-002: アクセシビリティ

- WCAG 2.1 AA準拠のコントラスト比
  - 通常テキスト: 4.5:1以上
  - 大きいテキスト: 3:1以上
- フォーカス表示が明確
- 色のみに依存しない情報伝達

### NFR-TH-003: 互換性

- macOS/Windows/Linux対応
- システムテーマ検出: Chrome 76+相当の機能を使用
- CSS変数: 全モダンブラウザ対応

---

## UI/UX要件

### テーマ選択UI

```
┌─────────────────────────────────────────────────┐
│ 外観設定                                         │
│ テーマとディスプレイ設定                         │
├─────────────────────────────────────────────────┤
│                                                  │
│ テーマ                                           │
│                                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │  ☀️    │ │  🌙    │ │  🖥️    │             │
│ │ ライト  │ │ ダーク  │ │システム │             │
│ └─────────┘ └─────────┘ └─────────┘             │
│     ○           ●           ○                   │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ プレビュー                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ ┌───────────────────────────────────────┐   │ │
│ │ │ ミニプレビュー                         │   │ │
│ │ │ 現在のテーマの見た目                   │   │ │
│ │ └───────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
```

### テーマ切り替えボタン

- 選択中のテーマは強調表示（アクセントカラー枠）
- ホバー時にツールチップ表示
- キーボードナビゲーション対応

---

## IPCチャネル定義

```typescript
const THEME_CHANNELS = {
  GET: "theme:get", // 現在のテーマ設定取得
  SET: "theme:set", // テーマ設定を保存
  GET_SYSTEM: "theme:getSystem", // システムテーマ取得
} as const;

// リクエスト/レスポンス型
interface ThemeGetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    systemTheme: "light" | "dark";
  };
  error?: string;
}

interface ThemeSetRequest {
  mode: ThemeMode;
}
```

---

## ユースケース

### UC-TH-001: テーマを変更する

1. ユーザーが設定画面の「外観設定」セクションを開く
2. テーマ選択ボタン（ライト/ダーク/システム）をクリック
3. テーマが即座に切り替わる（トランジション付き）
4. 設定が自動保存される

### UC-TH-002: システムテーマに連動する

1. ユーザーが「システム」を選択
2. OSのテーマ設定に従ってテーマが適用される
3. OSのテーマ設定を変更
4. アプリのテーマがリアルタイムで追従

### UC-TH-003: アプリ起動時のテーマ適用

1. アプリが起動する
2. 保存されたテーマ設定を読み込む
3. 「システム」の場合はOSテーマを取得
4. 適切なテーマをDOM描画前に適用（FOUC防止）

---

## 実装詳細

### テーマ適用フロー

```
┌─────────────────────────────────────────────────────────────┐
│ 1. アプリ起動                                                │
│    ↓                                                         │
│ 2. メインプロセス: 保存されたテーマ設定を読み込み            │
│    ↓                                                         │
│ 3. プリロード: 初期テーマをwindow.__INITIAL_THEME__に設定   │
│    ↓                                                         │
│ 4. レンダラー: <html>にdata-theme属性を設定（同期的）       │
│    ↓                                                         │
│ 5. Reactアプリがマウント                                     │
│    ↓                                                         │
│ 6. useThemeフックがテーマ状態を管理                         │
└─────────────────────────────────────────────────────────────┘
```

### FOUC (Flash of Unstyled Content) 防止

```html
<!-- index.html -->
<script>
  // 同期的にテーマを適用（React マウント前）
  (function () {
    const theme = window.__INITIAL_THEME__ || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>
```

### useThemeフック

```typescript
function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // テーマ変更
  const setTheme = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    const resolved = newMode === "system" ? getSystemTheme() : newMode;

    // トランジションクラスを追加
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", resolved);

    // トランジション完了後にクラスを削除
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 200);

    // 永続化
    await window.electronAPI.theme.set({ mode: newMode });
  }, []);

  // システムテーマ変更を監視
  useEffect(() => {
    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light",
      );
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode]);

  return { mode, resolvedTheme, setTheme };
}
```

---

## 依存関係

### 既存コンポーネント

- `SettingsView` - 設定画面（テーマセクション改修）
- `tokens.css` - 既存のデザイントークン（拡張）
- `globals.css` - グローバルスタイル（テーマ変数追加）

### 新規コンポーネント

- `ThemeSelector` - テーマ選択コンポーネント（molecule）
- `ThemePreview` - テーマプレビュー（atom）
- `useTheme` - テーマ管理フック
- `themeSlice` - テーマ状態管理（store slice）

### 変更が必要な既存ファイル

- `index.html` - 初期テーマ適用スクリプト追加
- `preload/index.ts` - 初期テーマ設定
- 全コンポーネント - ハードコードされた色をCSS変数に置き換え

---

## 色彩設計

### ライトテーマ

| 用途                   | 変数名                 | 値      | コントラスト比 |
| ---------------------- | ---------------------- | ------- | -------------- |
| 背景（プライマリ）     | --color-bg-primary     | #ffffff | -              |
| 背景（セカンダリ）     | --color-bg-secondary   | #f5f5f5 | -              |
| テキスト（プライマリ） | --color-text-primary   | #1a1a1a | 16.1:1         |
| テキスト（セカンダリ） | --color-text-secondary | #666666 | 5.9:1          |
| アクセント             | --color-accent         | #3b82f6 | 4.5:1          |

### ダークテーマ

| 用途                   | 変数名                 | 値      | コントラスト比 |
| ---------------------- | ---------------------- | ------- | -------------- |
| 背景（プライマリ）     | --color-bg-primary     | #0a0a0a | -              |
| 背景（セカンダリ）     | --color-bg-secondary   | #1a1a1a | -              |
| テキスト（プライマリ） | --color-text-primary   | #ffffff | 17.4:1         |
| テキスト（セカンダリ） | --color-text-secondary | #a0a0a0 | 7.0:1          |
| アクセント             | --color-accent         | #60a5fa | 5.1:1          |
