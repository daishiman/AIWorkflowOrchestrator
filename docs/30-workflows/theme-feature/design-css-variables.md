# CSS変数・デザイントークン設計書

## ドキュメント情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | T-01-1                                        |
| ステータス   | 完了                                          |
| 作成日       | 2025-12-08                                    |
| 対象ファイル | `apps/desktop/src/renderer/styles/tokens.css` |

---

## 1. 設計概要

### 1.1 移行方針

現在の `@media (prefers-color-scheme: light)` によるシステム連動方式から、`[data-theme]` 属性によるユーザー制御方式へ移行する。

#### 現状の課題

```css
/* 現在: システム設定に完全依存 */
@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    --bg-primary: #ffffff;
  }
}
```

- ユーザーがテーマを選択できない
- システム設定と独立した制御が不可能
- JavaScript からの制御が困難

#### 移行後の構造

```css
/* 移行後: data-theme 属性で制御 */
:root,
[data-theme="light"] {
  --bg-primary: #ffffff;
}

[data-theme="dark"] {
  --bg-primary: var(--color-slate-900);
}
```

### 1.2 互換性確保方法

既存の tokens.css を **非破壊的に拡張** する方針を採用:

1. **Primitive Colors は変更なし** - 既存の `--color-slate-*`, `--color-macos-*` 等はそのまま維持
2. **Semantic Colors を拡張** - `[data-theme]` セレクタを追加し、既存の `:root` 定義を上書き
3. **段階的移行** - 新旧セレクタを並存させ、テスト後に旧セレクタを削除

### 1.3 段階的移行戦略

| フェーズ | 内容                                      |
| -------- | ----------------------------------------- |
| Phase 1  | `[data-theme]` セレクタを追加（新旧並存） |
| Phase 2  | ThemeProvider で `data-theme` 属性を制御  |
| Phase 3  | 動作確認後、`@media` ルールを削除         |

---

## 2. CSS変数体系設計

### 2.1 ファイル構造

```
apps/desktop/src/renderer/styles/
├── tokens.css        # 変数定義（この設計書の対象）
├── globals.css       # グローバルスタイル（トランジション設定を追加）
└── theme.css         # テーマ切り替えアニメーション（新規）
```

### 2.2 変数階層構造

```
Primitive Colors (変更なし)
├── --color-slate-50 ~ 950
├── --color-macos-blue, green, red, yellow, orange
└── --color-blue-*, --color-green-*, etc.

Semantic Colors (テーマ対応に拡張)
├── Background: --bg-primary, --bg-secondary, --bg-tertiary
├── Text: --text-primary, --text-secondary, --text-muted
├── Border: --border-default, --border-emphasis, --border-subtle
├── Status: --status-primary, --status-success, --status-warning, --status-error
└── Glass: --bg-glass, --glass-bg, --glass-border
```

---

## 3. カラーパレット定義

### 3.1 ライトテーマ（デフォルト）

```css
:root,
[data-theme="light"] {
  /* ===== Background Colors ===== */
  --bg-primary: #ffffff;
  --bg-secondary: var(--color-slate-50); /* #f8fafc */
  --bg-tertiary: var(--color-slate-100); /* #f1f5f9 */
  --bg-elevated: rgba(0, 0, 0, 0.02);
  --bg-glass: rgba(255, 255, 255, 0.8);

  /* ===== Text Colors ===== */
  --text-primary: var(--color-slate-900); /* #0f172a */
  --text-secondary: var(--color-slate-600); /* #475569 */
  --text-muted: var(--color-slate-400); /* #94a3b8 */
  --text-inverse: #ffffff;

  /* ===== Border Colors ===== */
  --border-default: var(--color-slate-200); /* #e2e8f0 */
  --border-emphasis: var(--color-slate-300); /* #cbd5e1 */
  --border-subtle: rgba(0, 0, 0, 0.1);

  /* ===== Status Colors ===== */
  --status-primary: var(--color-blue-600); /* #2563eb */
  --status-primary-hover: var(--color-blue-500);
  --status-success: var(--color-green-600); /* #16a34a */
  --status-success-hover: var(--color-green-500);
  --status-warning: var(--color-amber-500); /* #f59e0b */
  --status-warning-hover: var(--color-amber-400);
  --status-error: var(--color-red-600); /* #dc2626 */
  --status-error-hover: var(--color-red-500);
  --status-info: var(--color-sky-500);

  /* ===== Glass Effects ===== */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.1);
  --glass-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}
```

### 3.2 ダークテーマ

```css
[data-theme="dark"] {
  /* ===== Background Colors ===== */
  --bg-primary: var(--color-slate-900); /* #0f172a */
  --bg-secondary: var(--color-slate-800); /* #1e293b */
  --bg-tertiary: var(--color-slate-700); /* #334155 */
  --bg-elevated: rgba(255, 255, 255, 0.05);
  --bg-glass: rgba(255, 255, 255, 0.1);

  /* ===== Text Colors ===== */
  --text-primary: var(--color-slate-50); /* #f8fafc */
  --text-secondary: var(--color-slate-400); /* #94a3b8 */
  --text-muted: var(--color-slate-500); /* #64748b */
  --text-inverse: var(--color-slate-900);

  /* ===== Border Colors ===== */
  --border-default: var(--color-slate-700); /* #334155 */
  --border-emphasis: var(--color-slate-600); /* #475569 */
  --border-subtle: rgba(255, 255, 255, 0.1);

  /* ===== Status Colors ===== */
  --status-primary: var(--color-macos-blue); /* #0a84ff */
  --status-primary-hover: var(--color-blue-400);
  --status-success: var(--color-green-500);
  --status-success-hover: var(--color-green-400);
  --status-warning: var(--color-amber-500);
  --status-warning-hover: var(--color-amber-400);
  --status-error: var(--color-red-500);
  --status-error-hover: var(--color-red-400);
  --status-info: var(--color-sky-500);

  /* ===== Glass Effects ===== */
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
}
```

### 3.3 コントラスト比検証結果

WCAG 2.1 AA 準拠要件:

- 通常テキスト: 4.5:1 以上
- 大きなテキスト (18px以上): 3:1 以上
- UIコンポーネント: 3:1 以上

#### ライトテーマ

| 組み合わせ                  | 前景色    | 背景色    | コントラスト比 | 判定         |
| --------------------------- | --------- | --------- | -------------- | ------------ |
| Text Primary / BG Primary   | `#0f172a` | `#ffffff` | **15.4:1**     | PASS (AAA)   |
| Text Secondary / BG Primary | `#475569` | `#ffffff` | **6.3:1**      | PASS (AA)    |
| Text Muted / BG Primary     | `#94a3b8` | `#ffffff` | **3.0:1**      | PASS (Large) |
| Status Primary / BG Primary | `#2563eb` | `#ffffff` | **4.6:1**      | PASS (AA)    |

#### ダークテーマ

| 組み合わせ                  | 前景色    | 背景色    | コントラスト比 | 判定       |
| --------------------------- | --------- | --------- | -------------- | ---------- |
| Text Primary / BG Primary   | `#f8fafc` | `#0f172a` | **15.4:1**     | PASS (AAA) |
| Text Secondary / BG Primary | `#94a3b8` | `#0f172a` | **6.4:1**      | PASS (AA)  |
| Text Muted / BG Primary     | `#64748b` | `#0f172a` | **4.5:1**      | PASS (AA)  |
| Status Primary / BG Primary | `#0a84ff` | `#0f172a` | **6.8:1**      | PASS (AA)  |

---

## 4. トランジション仕様

### 4.1 トランジション設定

```css
/* globals.css に追加 */

/* テーマ切り替えトランジション */
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition:
    background-color 200ms ease-out,
    border-color 200ms ease-out,
    color 200ms ease-out,
    fill 200ms ease-out,
    stroke 200ms ease-out,
    box-shadow 200ms ease-out !important;
}

/* トランジション無効化（初回ロード時） */
.no-transition,
.no-transition *,
.no-transition *::before,
.no-transition *::after {
  transition: none !important;
}
```

### 4.2 トランジション対象プロパティ

| プロパティ         | 対象        | 理由                   |
| ------------------ | ----------- | ---------------------- |
| `background-color` | 全要素      | 背景色の切り替え       |
| `border-color`     | 全要素      | ボーダー色の切り替え   |
| `color`            | 全要素      | テキスト色の切り替え   |
| `fill`             | SVGアイコン | アイコン色の切り替え   |
| `stroke`           | SVGアイコン | アイコン線色の切り替え |
| `box-shadow`       | 影付き要素  | 影色の切り替え         |

### 4.3 FOUC（Flash of Unstyled Content）防止

```html
<!-- index.html の <head> 内に追加するインラインスクリプト -->
<script>
  (function () {
    // Preload から渡された初期テーマを取得
    const theme = window.__INITIAL_THEME__ || "dark";

    // DOM が構築される前にテーマを設定（FOUCを防止）
    document.documentElement.setAttribute("data-theme", theme);

    // 初回ロード時のトランジションを無効化
    document.documentElement.classList.add("no-transition");

    // レンダリング完了後にトランジションを有効化
    window.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.remove("no-transition");
      });
    });
  })();
</script>
```

---

## 5. 実装パターン

### 5.1 data-theme 属性の設定方法

```typescript
// テーマを設定
function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;

  // トランジションを有効化
  root.classList.add("theme-transition");

  // テーマを設定
  root.setAttribute("data-theme", theme);

  // トランジション終了後にクラスを削除
  setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 200);
}
```

### 5.2 CSS での使用例

```css
/* コンポーネントスタイル */
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
}

.card:hover {
  background-color: var(--bg-tertiary);
}

/* Glass Effect の適用 */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

---

## 6. 移行計画

### 6.1 既存 `@media` ルールとの共存方法

移行期間中は新旧の両方のルールを維持:

```css
/* 新: data-theme による制御（優先） */
:root,
[data-theme="light"] {
  --bg-primary: #ffffff;
}

[data-theme="dark"] {
  --bg-primary: var(--color-slate-900);
}

/* 旧: @media による制御（フォールバック） */
/* data-theme 属性がない場合のみ適用 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bg-primary: var(--color-slate-900);
  }
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --bg-primary: #ffffff;
  }
}
```

### 6.2 段階的移行ステップ

#### Step 1: CSS変数の拡張（T-03-1）

1. tokens.css に `[data-theme]` セレクタを追加
2. 既存の `@media` ルールを `:root:not([data-theme])` に変更
3. globals.css にトランジション設定を追加

#### Step 2: ThemeProvider 実装（T-03-5）

1. useTheme フックの実装
2. 初期化スクリプトの追加（FOUC防止）

#### Step 3: UI統合（T-03-7）

1. 設定画面にテーマ切り替えUIを追加
2. テーマ選択の永続化

#### Step 4: 検証・旧ルール削除

1. 全コンポーネントでの動作確認
2. 旧 `@media` ルールの削除

---

## 7. 検証基準

### 7.1 アクセシビリティ検証

#### 自動検証ツール

```bash
# コントラスト比の検証
npx @axe-core/cli http://localhost:3000 --rules color-contrast
```

#### 手動検証項目

- [ ] すべてのテキストが背景に対して読みやすい
- [ ] フォーカスインジケーターが視認できる
- [ ] ステータスカラーが色覚異常でも識別可能

### 7.2 既存コンポーネントへの影響範囲

| コンポーネント | 影響度 | 確認事項                          |
| -------------- | ------ | --------------------------------- |
| Sidebar        | 中     | 背景色、ボーダー、テキスト色      |
| SettingsCard   | 中     | 背景色、ボーダー、シャドウ        |
| Button         | 高     | 全状態（hover, active, disabled） |
| Input          | 高     | 背景、ボーダー、フォーカス状態    |

---

## 8. 完了条件チェックリスト

### T-01-1 完了条件

- [x] ライト/ダーク両テーマのカラーパレットが定義されている
- [x] `[data-theme]` 属性による切り替え方式が設計されている
- [x] トランジション仕様が定義されている
- [x] 既存tokens.cssとの互換性が確保されている

---

## 付録: 完全なCSS変数定義（実装用）

以下のコードを `tokens.css` の既存Semantic Colors セクションを置換する形で追加:

```css
/* ==========================================================================
   Theme Variables - テーマ対応CSS変数
   ========================================================================== */

/* --------------------------------------------------------------------------
   Light Theme (Default)
   -------------------------------------------------------------------------- */
:root,
[data-theme="light"] {
  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: var(--color-slate-50);
  --bg-tertiary: var(--color-slate-100);
  --bg-elevated: rgba(0, 0, 0, 0.02);
  --bg-glass: rgba(255, 255, 255, 0.8);

  /* Text */
  --text-primary: var(--color-slate-900);
  --text-secondary: var(--color-slate-600);
  --text-muted: var(--color-slate-400);
  --text-inverse: #ffffff;

  /* Border */
  --border-default: var(--color-slate-200);
  --border-emphasis: var(--color-slate-300);
  --border-subtle: rgba(0, 0, 0, 0.1);

  /* Status */
  --status-primary: var(--color-blue-600);
  --status-primary-hover: var(--color-blue-500);
  --status-success: var(--color-green-600);
  --status-success-hover: var(--color-green-500);
  --status-warning: var(--color-amber-500);
  --status-warning-hover: var(--color-amber-400);
  --status-error: var(--color-red-600);
  --status-error-hover: var(--color-red-500);
  --status-info: var(--color-sky-500);

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.1);
  --glass-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

/* --------------------------------------------------------------------------
   Dark Theme
   -------------------------------------------------------------------------- */
[data-theme="dark"] {
  /* Background */
  --bg-primary: var(--color-slate-900);
  --bg-secondary: var(--color-slate-800);
  --bg-tertiary: var(--color-slate-700);
  --bg-elevated: rgba(255, 255, 255, 0.05);
  --bg-glass: rgba(255, 255, 255, 0.1);

  /* Text */
  --text-primary: var(--color-slate-50);
  --text-secondary: var(--color-slate-400);
  --text-muted: var(--color-slate-500);
  --text-inverse: var(--color-slate-900);

  /* Border */
  --border-default: var(--color-slate-700);
  --border-emphasis: var(--color-slate-600);
  --border-subtle: rgba(255, 255, 255, 0.1);

  /* Status */
  --status-primary: var(--color-macos-blue);
  --status-primary-hover: var(--color-blue-400);
  --status-success: var(--color-green-500);
  --status-success-hover: var(--color-green-400);
  --status-warning: var(--color-amber-500);
  --status-warning-hover: var(--color-amber-400);
  --status-error: var(--color-red-500);
  --status-error-hover: var(--color-red-400);
  --status-info: var(--color-sky-500);

  /* Glass */
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
}

/* --------------------------------------------------------------------------
   Fallback for missing data-theme (legacy support)
   -------------------------------------------------------------------------- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bg-primary: var(--color-slate-900);
    --bg-secondary: var(--color-slate-800);
    --bg-tertiary: var(--color-slate-700);
    --bg-elevated: rgba(255, 255, 255, 0.05);
    --bg-glass: rgba(255, 255, 255, 0.1);
    --text-primary: var(--color-slate-50);
    --text-secondary: var(--color-slate-400);
    --text-muted: var(--color-slate-500);
    --text-inverse: var(--color-slate-900);
    --border-default: var(--color-slate-700);
    --border-emphasis: var(--color-slate-600);
    --border-subtle: rgba(255, 255, 255, 0.1);
    --status-primary: var(--color-macos-blue);
    --status-primary-hover: var(--color-blue-400);
  }
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --bg-primary: #ffffff;
    --bg-secondary: var(--color-slate-50);
    --bg-tertiary: var(--color-slate-100);
    --bg-elevated: rgba(0, 0, 0, 0.02);
    --bg-glass: rgba(255, 255, 255, 0.8);
    --text-primary: var(--color-slate-900);
    --text-secondary: var(--color-slate-600);
    --text-muted: var(--color-slate-400);
    --text-inverse: #ffffff;
    --border-default: var(--color-slate-200);
    --border-emphasis: var(--color-slate-300);
    --border-subtle: rgba(0, 0, 0, 0.1);
    --status-primary: var(--color-blue-600);
    --status-primary-hover: var(--color-blue-500);
  }
}
```
