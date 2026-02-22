# 実装ガイド: TASK-UI-00-TOKENS

## メタ情報

| 項目         | 値                                                              |
| ------------ | --------------------------------------------------------------- |
| タスク ID    | TASK-UI-00-TOKENS                                               |
| Phase        | 12 - ドキュメント更新                                           |
| 作成日       | 2026-02-22                                                      |
| 対象読者     | Part 1: 初学者 / Part 2: 開発者                                 |
| 対象ファイル | `tokens.css`, `renderWithTheme.tsx`, `renderWithTheme.test.tsx` |

---

## Part 1: 概念説明（中学生レベル）

### テーマカラーとは何か

#### 「部屋の照明切替」の例え

部屋の照明を思い浮かべてください。

- **昼間**は明るい白い照明（蛍光灯）をつけて、本を読んだり勉強したりするのに適した環境にします。これが「**ライトテーマ**」です。画面の背景は白く、文字は黒くなり、明るい場所で見やすくなります。
- **夜**は暖色の間接照明に切り替えて、目に優しくリラックスできる環境にします。これが「**ダークテーマ**」です。画面の背景は暗くなり、文字は明るい色になり、暗い場所で見やすくなります。
- さらに、**和風の照明**（障子越しの柔らかい光のイメージ）もあります。これが「**kanagawa-dragonテーマ**」で、プログラミングに適した落ち着いた色合いです。

照明のスイッチを切り替えるだけで部屋の雰囲気が一瞬で変わるように、テーマ切替もボタン1つで画面全体の色が変わります。

#### 仕組みの説明

私たちの作ったプログラムでは、色を「名前付きの変数」で管理しています。

- 変数 `--bg-primary`（背景色）に入る値は、テーマによって異なります
  - ライトテーマ: 白色（`#FFFFFF`）
  - ダークテーマ: 黒色（`#000000`）
  - kanagawa-dragon: 濃い灰色（`#12120f`）

色の名前は同じだけど、中身が変わる。だから「照明のスイッチ」1つで全部変わるのです。

---

### マイクロインタラクションとは何か

#### 「ボタンの手応え」の例え

- **エレベーターのボタン**を押すと、ボタンが光りますよね。あれは「押したことが伝わった」というフィードバック（反応）です。
- **ゲームのコントローラー**がブルブル振動するのも同じです。「何かが起きた」ということを体で感じられます。

パソコンやスマホの画面でも同じことをやります。

- **ホバー**（マウスを乗せた時）: 要素がほんの少し大きくなる（`1.02倍`）→ 「ここを操作できるよ」というサイン
- **クリック**した時: 要素がほんの少し小さくなる（`0.97倍`）→ 「押し込んだ手応え」
- **成功**した時: 要素がポヨンと弾む（`success-bounce`）→ 「うまくいったよ！」
- **エラー**の時: 要素が左右にブルブル震える（`error-shake`）→ 「何か問題があるよ」

こういった「小さな動き」をマイクロインタラクションと呼びます。ユーザーが「今何が起きているか」を直感的に理解できるようになります。

---

### テストヘルパーとは何か

#### 「着せ替え人形」の例え

テストヘルパーは「着せ替え人形」のようなものです。

1. 同じ人形（コンポーネント）に、3種類の衣装（テーマ）を着せます
2. それぞれの衣装で「見た目がおかしくないか」をチェックします
3. 1回のテストで3パターンを一気に確認できるので、漏れが少なくなります

具体的には、`renderWithTheme` という道具を使って：

- 「ライトテーマでボタンを表示して」
- 「ダークテーマでボタンを表示して」
- 「kanagawa-dragonテーマでボタンを表示して」

と3回テストを自動で回してくれます。手動で確認する手間が省けて、テーマを追加した時も安心です。

---

## Part 2: 技術詳細（開発者向け）

### CSS変数設計の3レイヤー構造

tokens.cssは以下の3レイヤーでCSS変数を定義しています。

#### レイヤー1: `:root`（デフォルト / kanagawa-dragonフォールバック）

```css
:root {
  /* Primitive Colors */
  --color-slate-50: #f8fafc;
  --color-macos-blue: #0a84ff;

  /* Semantic Colors (Dark Mode Default) */
  --bg-primary: var(--color-slate-900);
  --text-primary: var(--color-slate-50);
  --status-primary: var(--color-macos-blue);

  /* Micro-Interaction Tokens */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-anticipate: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --scale-hover: 1.02;
  --scale-active: 0.97;
  --scale-bounce: 1.05;
}
```

`:root` に定義されたプリミティブカラー、スペーシング、タイポグラフィ、エフェクト変数は全テーマ共通です。セマンティックカラーは `data-theme` 属性が未設定の場合のフォールバック値として機能します。

#### レイヤー2: `[data-theme="light"]`（Apple HIG System Colors Light）

```css
[data-theme="light"] {
  color-scheme: light;
  --bg-primary: #ffffff; /* systemBackground */
  --bg-secondary: #f2f2f7; /* secondarySystemBackground */
  --bg-tertiary: #e5e5ea; /* systemGray5 */
  --text-primary: #000000; /* label */
  --text-secondary: rgba(60, 60, 67, 0.6); /* secondaryLabel */
  --border-default: #c6c6c8; /* opaqueSeparator */
  --status-primary: #007aff; /* systemBlue */
  --status-success: #34c759; /* systemGreen */
  --status-error: #ff3b30; /* systemRed */
  --status-warning: #ff9500; /* systemOrange */
}
```

#### レイヤー3: `[data-theme="dark"]`（Apple HIG System Colors Dark）

```css
[data-theme="dark"] {
  color-scheme: dark;
  --bg-primary: #000000; /* systemBackground */
  --bg-secondary: #1c1c1e; /* secondarySystemBackground */
  --bg-tertiary: #2c2c2e; /* tertiarySystemBackground */
  --text-primary: #ffffff; /* label */
  --text-secondary: rgba(235, 235, 245, 0.6); /* secondaryLabel */
  --border-default: #38383a; /* opaqueSeparator */
  --status-primary: #0a84ff; /* systemBlue */
  --status-success: #30d158; /* systemGreen */
  --status-error: #ff453a; /* systemRed */
  --status-warning: #ff9f0a; /* systemOrange */
}
```

加えて `[data-theme="kanagawa-dragon"]` がkanagawa colorschemeの独自テーマとして定義されています。

### Apple HIG System Colors 準拠カラーマッピング

| 用途               | CSS変数            | Light値                 | Dark値                     | Apple HIG名称             |
| ------------------ | ------------------ | ----------------------- | -------------------------- | ------------------------- |
| 背景               | `--bg-primary`     | `#FFFFFF`               | `#000000`                  | systemBackground          |
| セカンダリ背景     | `--bg-secondary`   | `#F2F2F7`               | `#1C1C1E`                  | secondarySystemBackground |
| ターシャリ背景     | `--bg-tertiary`    | `#E5E5EA`               | `#2C2C2E`                  | tertiarySystemBackground  |
| プライマリテキスト | `--text-primary`   | `#000000`               | `#FFFFFF`                  | label                     |
| セカンダリテキスト | `--text-secondary` | `rgba(60, 60, 67, 0.6)` | `rgba(235, 235, 245, 0.6)` | secondaryLabel            |
| ボーダー           | `--border-default` | `#C6C6C8`               | `#38383A`                  | opaqueSeparator           |
| アクセント         | `--status-primary` | `#007AFF`               | `#0A84FF`                  | systemBlue                |
| 成功               | `--status-success` | `#34C759`               | `#30D158`                  | systemGreen               |
| エラー             | `--status-error`   | `#FF3B30`               | `#FF453A`                  | systemRed                 |
| 警告               | `--status-warning` | `#FF9500`               | `#FF9F0A`                  | systemOrange              |

### マイクロインタラクション変数

#### イージング関数

| 変数                | 値                                      | 用途                           |
| ------------------- | --------------------------------------- | ------------------------------ |
| `--ease-bounce`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`     | 成功時のバウンスアニメーション |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | 溜めてから跳ねるアニメーション |

#### スケール変数

| 変数             | 値     | 用途                      |
| ---------------- | ------ | ------------------------- |
| `--scale-hover`  | `1.02` | ホバー時の微拡大          |
| `--scale-active` | `0.97` | クリック/タップ時の微縮小 |
| `--scale-bounce` | `1.05` | 成功時のバウンスピーク    |

#### キーフレームアニメーション

```css
/* 成功時バウンス: 1 → 1.05 → 1 */
@keyframes success-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(var(--scale-bounce));
  }
  100% {
    transform: scale(1);
  }
}

/* エラー時シェイク: 左右に4px振幅で4回揺れる */
@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
```

### テーマ遷移アニメーション

```css
html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition:
    background-color var(--duration-normal) var(--ease-default),
    border-color var(--duration-normal) var(--ease-default),
    color var(--duration-fast) var(--ease-default) !important;
}
```

テーマ切替時に `html` 要素に `.theme-transition` クラスを一時的に付与することで、300ms のスムーズな色遷移を実現します。

### renderWithTheme テストヘルパー API

#### ファイルパス

`apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`

#### API定義

```typescript
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme; // "kanagawa-dragon" | "light" | "dark"
}

function renderWithTheme(
  ui: ReactElement,
  options?: ThemeRenderOptions,
): RenderResult;
```

#### パラメータ

| パラメータ      | 型              | デフォルト値        | 説明                                           |
| --------------- | --------------- | ------------------- | ---------------------------------------------- |
| `ui`            | `ReactElement`  | (必須)              | レンダリングするReactコンポーネント            |
| `options.theme` | `ResolvedTheme` | `"kanagawa-dragon"` | 適用するテーマ                                 |
| `options.*`     | `RenderOptions` | -                   | React Testing Library の render オプション全般 |

#### 使い方

```typescript
import { renderWithTheme } from "../tests/helpers/renderWithTheme";

// 基本使用
const { getByTestId } = renderWithTheme(<MyComponent />, { theme: "light" });

// デフォルト（kanagawa-dragon）
const { container } = renderWithTheme(<MyComponent />);

// 3テーマ一括テスト
describe.each(["kanagawa-dragon", "light", "dark"] as const)(
  "Theme: %s",
  (theme) => {
    it("renders correctly", () => {
      const { getByTestId } = renderWithTheme(
        <MyComponent data-testid="target" />,
        { theme },
      );
      expect(getByTestId("target")).toBeInTheDocument();
    });
  },
);
```

### テスト戦略

#### describe.each パターン

3テーマの網羅テストには `describe.each` を使用します。

```typescript
const themes = ["kanagawa-dragon", "light", "dark"] as const;

describe.each(themes)("Theme: %s", (theme) => {
  it("sets data-theme attribute", () => {
    renderWithTheme(<div />, { theme });
    expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
  });
});
```

#### WCAG AA コントラスト比検証ユーティリティ

テスト内に `relativeLuminance()` と `contrastRatio()` を定義し、各テーマのカラーペアのコントラスト比を検証します。

```typescript
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number],
): number {
  const l1 = relativeLuminance(...fg);
  const l2 = relativeLuminance(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

#### rgba値のアルファブレンド

Apple HIGの `secondaryLabel` のようなアルファ値を含む色は、背景色上でアルファブレンドしてからコントラスト比を計算します。

```typescript
function alphaBlend(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number],
): [number, number, number] {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}
```

### テスト結果サマリ

| テストグループ                    | テスト数 | 結果       |
| --------------------------------- | -------- | ---------- |
| renderWithTheme - Theme: %s       | 6        | PASS       |
| renderWithTheme - defaults/result | 3        | PASS       |
| renderWithTheme - boundary cases  | 5        | PASS       |
| WCAG AA contrast ratio - light    | 4        | PASS       |
| WCAG AA contrast ratio - dark     | 3        | PASS       |
| WCAG AA contrast ratio - kanagawa | 1        | PASS       |
| theme color map completeness      | 6        | PASS       |
| **合計**                          | **28**   | **全PASS** |

### ファイル構成

```
apps/desktop/src/renderer/
  styles/
    tokens.css                         # デザイントークンCSS変数（Light/Dark/Kanagawa Dragon）
  tests/
    helpers/
      renderWithTheme.tsx              # テーマ付きレンダリングヘルパー
      renderWithTheme.test.tsx         # テストヘルパーのテスト（28件）
```
