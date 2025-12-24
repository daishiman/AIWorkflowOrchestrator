# CSS変数設計書

## メタ情報

| 項目         | 内容          |
| ------------ | ------------- |
| サブタスクID | T-01-1        |
| フェーズ     | Phase 1: 設計 |
| 作成日       | 2025-12-12    |
| 担当         | .claude/agents/ui-designer.md  |

---

## 1. 概要

### 1.1 目的

Kanagawa Dragon/Wave/Lotusテーマを`tokens.css`のCSS変数として体系化し、`[data-theme="kanagawa-xxx"]`セレクタで切り替え可能にする。

### 1.2 設計方針

- 既存のセマンティック変数名（`--bg-primary`等）を維持
- 新しいテーマセレクタで値をオーバーライド
- プリミティブカラーとセマンティックカラーを分離
- 既存テーマ（light/dark）との互換性を維持

---

## 2. Kanagawa プリミティブカラー追加

### 2.1 Dragon パレット

```css
/* Kanagawa Dragon - Primitive Colors */
--kanagawa-dragon-black-0: #0d0c0c;
--kanagawa-dragon-black-1: #12120f;
--kanagawa-dragon-black-2: #1d1c19;
--kanagawa-dragon-black-3: #282727;
--kanagawa-dragon-black-4: #393836;
--kanagawa-dragon-black-5: #625e5a;
--kanagawa-dragon-black-6: #7a8382;
--kanagawa-dragon-white: #c5c9c5;
--kanagawa-dragon-gray: #625e5a;
--kanagawa-dragon-gray-2: #a6a69c;
--kanagawa-dragon-violet: #8992a7;
--kanagawa-dragon-blue: #8ba4b0;
--kanagawa-dragon-green: #87a987;
--kanagawa-dragon-pink: #a292a3;
--kanagawa-dragon-orange: #b6927b;
--kanagawa-dragon-aqua: #8ea4a2;
--kanagawa-dragon-red: #c4746e;
--kanagawa-dragon-yellow: #c4b28a;
--kanagawa-dragon-teal: #949fb5;
```

### 2.2 Wave パレット

```css
/* Kanagawa Wave - Primitive Colors */
--kanagawa-wave-sumi-ink-0: #16161d;
--kanagawa-wave-sumi-ink-1: #1f1f28;
--kanagawa-wave-sumi-ink-2: #2a2a37;
--kanagawa-wave-sumi-ink-3: #363646;
--kanagawa-wave-sumi-ink-4: #54546d;
--kanagawa-wave-sumi-ink-5: #626278;
--kanagawa-wave-sumi-ink-6: #727288;
--kanagawa-wave-fuji-white: #dcd7ba;
--kanagawa-wave-old-white: #c8c093;
--kanagawa-wave-fuji-gray: #727169;
--kanagawa-wave-oni-violet: #957fb8;
--kanagawa-wave-crystal-blue: #7e9cd8;
--kanagawa-wave-spring-green: #98bb6c;
--kanagawa-wave-sakura-pink: #d27e99;
--kanagawa-wave-surimi-orange: #ffa066;
--kanagawa-wave-wave-aqua-2: #7aa89f;
--kanagawa-wave-wave-blue-2: #2d4f67;
--kanagawa-wave-wave-red: #e46876;
--kanagawa-wave-carp-yellow: #e6c384;
--kanagawa-wave-dragon-blue: #658594;
```

### 2.3 Lotus パレット

```css
/* Kanagawa Lotus - Primitive Colors */
--kanagawa-lotus-white-0: #d5cea3;
--kanagawa-lotus-white-1: #dcd5ac;
--kanagawa-lotus-white-2: #e5ddb0;
--kanagawa-lotus-white-3: #f2ecbc;
--kanagawa-lotus-white-4: #e7dba0;
--kanagawa-lotus-ink-1: #545464;
--kanagawa-lotus-ink-2: #43436c;
--kanagawa-lotus-gray: #8a8980;
--kanagawa-lotus-gray-2: #716e61;
--kanagawa-lotus-violet-1: #b35b79;
--kanagawa-lotus-violet-2: #624c83;
--kanagawa-lotus-blue-4: #4d699b;
--kanagawa-lotus-green: #6f894e;
--kanagawa-lotus-green-2: #5e857a;
--kanagawa-lotus-orange: #cc6d00;
--kanagawa-lotus-yellow-3: #de9800;
--kanagawa-lotus-red: #c84053;
--kanagawa-lotus-teal-1: #4e8ca2;
```

### 2.4 共通UIカラー

```css
/* Kanagawa UI Colors (shared) */
--kanagawa-samurai-red: #e82424;
--kanagawa-ronin-yellow: #ff9e3b;
--kanagawa-spring-blue: #7fb4ca;
--kanagawa-autumn-green: #76946a;
--kanagawa-autumn-yellow: #dca561;
--kanagawa-autumn-red: #c34043;
--kanagawa-peach-red: #ff5d62;
```

---

## 3. テーマセレクタ設計

### 3.1 Kanagawa Dragon（デフォルト）

```css
[data-theme="kanagawa-dragon"] {
  color-scheme: dark;

  /* Background */
  --bg-primary: var(--kanagawa-dragon-black-1);
  --bg-secondary: var(--kanagawa-dragon-black-2);
  --bg-tertiary: var(--kanagawa-dragon-black-3);
  --bg-elevated: var(--kanagawa-dragon-black-3);
  --bg-glass: rgba(18, 18, 15, 0.9);
  --bg-selection: var(--kanagawa-dragon-black-4);

  /* Text */
  --text-primary: var(--kanagawa-dragon-white);
  --text-secondary: var(--kanagawa-dragon-gray-2);
  --text-muted: var(--kanagawa-dragon-gray);
  --text-inverse: var(--kanagawa-dragon-black-1);

  /* Border */
  --border-default: var(--kanagawa-dragon-black-4);
  --border-emphasis: var(--kanagawa-dragon-black-5);
  --border-subtle: rgba(197, 201, 197, 0.1);

  /* Status */
  --status-primary: var(--kanagawa-dragon-blue);
  --status-primary-hover: var(--kanagawa-dragon-teal);
  --status-success: var(--kanagawa-dragon-green);
  --status-success-hover: var(--kanagawa-autumn-green);
  --status-warning: var(--kanagawa-ronin-yellow);
  --status-warning-hover: var(--kanagawa-dragon-yellow);
  --status-error: var(--kanagawa-samurai-red);
  --status-error-hover: var(--kanagawa-dragon-red);
  --status-info: var(--kanagawa-spring-blue);
  --status-info-hover: var(--kanagawa-dragon-blue);

  /* Syntax Highlighting */
  --syntax-keyword: var(--kanagawa-dragon-violet);
  --syntax-function: var(--kanagawa-dragon-blue);
  --syntax-string: var(--kanagawa-dragon-green);
  --syntax-number: var(--kanagawa-dragon-pink);
  --syntax-constant: var(--kanagawa-dragon-orange);
  --syntax-type: var(--kanagawa-dragon-aqua);
  --syntax-comment: var(--kanagawa-dragon-gray);
  --syntax-variable: var(--kanagawa-dragon-yellow);
}
```

### 3.2 Kanagawa Wave

```css
[data-theme="kanagawa-wave"] {
  color-scheme: dark;

  /* Background */
  --bg-primary: var(--kanagawa-wave-sumi-ink-1);
  --bg-secondary: var(--kanagawa-wave-sumi-ink-2);
  --bg-tertiary: var(--kanagawa-wave-sumi-ink-3);
  --bg-elevated: var(--kanagawa-wave-sumi-ink-3);
  --bg-glass: rgba(31, 31, 40, 0.8);
  --bg-selection: var(--kanagawa-wave-wave-blue-2);

  /* Text */
  --text-primary: var(--kanagawa-wave-fuji-white);
  --text-secondary: var(--kanagawa-wave-old-white);
  --text-muted: var(--kanagawa-wave-fuji-gray);
  --text-inverse: var(--kanagawa-wave-sumi-ink-1);

  /* Border */
  --border-default: var(--kanagawa-wave-sumi-ink-4);
  --border-emphasis: var(--kanagawa-wave-sumi-ink-5);
  --border-subtle: rgba(220, 215, 186, 0.1);

  /* Status */
  --status-primary: var(--kanagawa-wave-crystal-blue);
  --status-primary-hover: var(--kanagawa-spring-blue);
  --status-success: var(--kanagawa-wave-spring-green);
  --status-success-hover: var(--kanagawa-autumn-green);
  --status-warning: var(--kanagawa-ronin-yellow);
  --status-warning-hover: var(--kanagawa-wave-carp-yellow);
  --status-error: var(--kanagawa-samurai-red);
  --status-error-hover: var(--kanagawa-peach-red);
  --status-info: var(--kanagawa-spring-blue);
  --status-info-hover: var(--kanagawa-wave-dragon-blue);

  /* Syntax Highlighting */
  --syntax-keyword: var(--kanagawa-wave-oni-violet);
  --syntax-function: var(--kanagawa-wave-crystal-blue);
  --syntax-string: var(--kanagawa-wave-spring-green);
  --syntax-number: var(--kanagawa-wave-sakura-pink);
  --syntax-constant: var(--kanagawa-wave-surimi-orange);
  --syntax-type: var(--kanagawa-wave-wave-aqua-2);
  --syntax-comment: var(--kanagawa-wave-fuji-gray);
  --syntax-variable: var(--kanagawa-wave-carp-yellow);
}
```

### 3.3 Kanagawa Lotus（ライト）

```css
[data-theme="kanagawa-lotus"] {
  color-scheme: light;

  /* Background */
  --bg-primary: var(--kanagawa-lotus-white-1);
  --bg-secondary: var(--kanagawa-lotus-white-2);
  --bg-tertiary: var(--kanagawa-lotus-white-3);
  --bg-elevated: var(--kanagawa-lotus-white-3);
  --bg-glass: rgba(220, 213, 172, 0.8);
  --bg-selection: #b5cbd2;

  /* Text */
  --text-primary: var(--kanagawa-lotus-ink-1);
  --text-secondary: var(--kanagawa-lotus-gray-2);
  --text-muted: var(--kanagawa-lotus-gray);
  --text-inverse: var(--kanagawa-lotus-white-1);

  /* Border */
  --border-default: var(--kanagawa-lotus-white-4);
  --border-emphasis: var(--kanagawa-lotus-gray);
  --border-subtle: rgba(84, 84, 100, 0.1);

  /* Status */
  --status-primary: var(--kanagawa-lotus-blue-4);
  --status-primary-hover: #5d57a3;
  --status-success: var(--kanagawa-lotus-green);
  --status-success-hover: var(--kanagawa-lotus-green-2);
  --status-warning: var(--kanagawa-lotus-yellow-3);
  --status-warning-hover: #e98a00;
  --status-error: var(--kanagawa-lotus-red);
  --status-error-hover: #d7474b;
  --status-info: var(--kanagawa-lotus-teal-1);
  --status-info-hover: #6693bf;

  /* Syntax Highlighting */
  --syntax-keyword: var(--kanagawa-lotus-violet-1);
  --syntax-function: var(--kanagawa-lotus-blue-4);
  --syntax-string: var(--kanagawa-lotus-green);
  --syntax-number: var(--kanagawa-lotus-violet-2);
  --syntax-constant: var(--kanagawa-lotus-orange);
  --syntax-type: var(--kanagawa-lotus-green-2);
  --syntax-comment: var(--kanagawa-lotus-gray);
  --syntax-variable: #836f4a;
}
```

---

## 4. 既存CSS変数との互換性

### 4.1 変数名マッピング

| 既存変数名          | 用途                 | 互換性 |
| ------------------- | -------------------- | ------ |
| `--bg-primary`      | メイン背景           | ✓維持  |
| `--bg-secondary`    | セカンダリ背景       | ✓維持  |
| `--bg-tertiary`     | ターシャリ背景       | ✓維持  |
| `--bg-elevated`     | 浮き上がり背景       | ✓維持  |
| `--bg-glass`        | ガラス効果背景       | ✓維持  |
| `--text-primary`    | メインテキスト       | ✓維持  |
| `--text-secondary`  | セカンダリテキスト   | ✓維持  |
| `--text-muted`      | ミュートテキスト     | ✓維持  |
| `--text-inverse`    | 反転テキスト         | ✓維持  |
| `--border-default`  | デフォルト境界線     | ✓維持  |
| `--border-emphasis` | 強調境界線           | ✓維持  |
| `--border-subtle`   | 微妙な境界線         | ✓維持  |
| `--status-primary`  | プライマリステータス | ✓維持  |
| `--status-success`  | 成功ステータス       | ✓維持  |
| `--status-warning`  | 警告ステータス       | ✓維持  |
| `--status-error`    | エラーステータス     | ✓維持  |
| `--status-info`     | 情報ステータス       | ✓維持  |

### 4.2 新規追加変数

| 変数名              | 用途                 |
| ------------------- | -------------------- |
| `--bg-selection`    | 選択範囲背景         |
| `--syntax-keyword`  | キーワードハイライト |
| `--syntax-function` | 関数ハイライト       |
| `--syntax-string`   | 文字列ハイライト     |
| `--syntax-number`   | 数値ハイライト       |
| `--syntax-constant` | 定数ハイライト       |
| `--syntax-type`     | 型ハイライト         |
| `--syntax-comment`  | コメントハイライト   |
| `--syntax-variable` | 変数ハイライト       |

---

## 5. Glass Morphism 更新

### 5.1 テーマ別Glass効果

```css
/* Dragon Glass */
[data-theme="kanagawa-dragon"] .glass-panel {
  background: rgba(18, 18, 15, 0.85);
  border-color: rgba(197, 201, 197, 0.1);
}

/* Wave Glass */
[data-theme="kanagawa-wave"] .glass-panel {
  background: rgba(31, 31, 40, 0.8);
  border-color: rgba(220, 215, 186, 0.1);
}

/* Lotus Glass */
[data-theme="kanagawa-lotus"] .glass-panel {
  background: rgba(220, 213, 172, 0.7);
  border-color: rgba(84, 84, 100, 0.1);
}
```

---

## 6. 完了条件チェックリスト

- [x] 全カラー変数のマッピングが定義されている
- [x] セマンティックカラー体系が設計されている
- [x] 既存CSS変数との互換性が確認されている
- [x] 3テーマ（Dragon/Wave/Lotus）の設計が完了
- [x] Glass Morphism更新が設計されている
- [x] シンタックスハイライト変数が追加されている
