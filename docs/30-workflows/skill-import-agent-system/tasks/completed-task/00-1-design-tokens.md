# TASK-UI-00-TOKENS: デザイントークン・テーマ定義

## 1. メタ情報

| 項目         | 値                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-00-TOKENS                                                                                           |
| タスク名     | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 優先度       | 最高（全コンポーネントの前提条件）                                                                          |
| 複雑度       | medium                                                                                                      |
| 依存タスク   | なし                                                                                                        |
| ブロック対象 | TASK-UI-00-ATOMS, TASK-UI-00-MOLECULES, TASK-UI-00-ORGANISMS                                                |

## 2. 目的

tokens.css の light/dark テーマを Apple HIG System Colors に全面置き換えし、マイクロインタラクション用CSS変数を追加し、テーマ横断テスト用の `renderWithTheme` テストヘルパーを作成する。後続の全コンポーネント実装（Atoms / Molecules / Organisms）が本タスクのデザイントークンとテストヘルパーに依存する。

## 3. Why（なぜ必要か）

1. **Apple HIG 準拠**: 既存の light テーマは Tailwind Slate ベースの青みがかった灰色であり、Apple Human Interface Guidelines の中性灰色（色相なし）と異なる。公式システムカラーへの全面置き換えにより、クリーンで見やすいテーマを実現する
2. **dark テーマ完全実装**: 現在スタブ状態の dark テーマを Apple HIG System Colors で新規定義し、3テーマ（kanagawa-dragon / light / dark）の完全サポートを実現する
3. **マイクロインタラクション統一**: 後続コンポーネントで統一的なフィードバック体験（ホバー、タップ、成功、エラー）を実現するためのCSS変数とキーフレームを事前定義する
4. **テスト基盤**: テーマ横断テストの `renderWithTheme` ヘルパーにより、後続の全コンポーネントテストでテーマ切替の検証を統一的に実施できる

## 4. 実行タスク

### Task 1: tokens.css light テーマ定義（Apple HIG System Colors 全面置き換え）

既存の Tailwind Slate ベースの light テーマを Apple HIG System Colors に全面置き換えする。

> **変更理由**: Tailwind Slate（`#f8fafc` 等）は微かな青味を持ち、Apple の UI と比較すると色温度が異なる。Apple の `#F2F2F7`（systemGray6）は完全な中性灰で、クリーンで見やすいライトモードを実現する。

```css
[data-theme="light"] {
  color-scheme: light;

  /* ─── Apple System Background Colors ─── */
  --bg-primary: #ffffff; /* systemBackground */
  --bg-secondary: #f2f2f7; /* secondarySystemBackground (systemGray6) */
  --bg-tertiary: #e5e5ea; /* systemGray5 */
  --bg-elevated: #ffffff; /* elevated surface */
  --bg-glass: rgba(242, 242, 247, 0.8); /* translucent secondary */
  --bg-selection: rgba(0, 122, 255, 0.15); /* systemBlue 15% */

  /* ─── Apple Label Colors ─── */
  --text-primary: #000000; /* label */
  --text-secondary: rgba(60, 60, 67, 0.6); /* secondaryLabel (#3C3C43 60%) */
  --text-muted: rgba(60, 60, 67, 0.3); /* tertiaryLabel (#3C3C43 30%) */
  --text-inverse: #ffffff;

  /* ─── Apple Separator Colors ─── */
  --border-default: #c6c6c8; /* opaqueSeparator */
  --border-emphasis: #aeaeb2; /* systemGray2 */
  --border-subtle: rgba(60, 60, 67, 0.12); /* separator (low opacity) */

  /* ─── Apple System Tint Colors (Light) ─── */
  --status-primary: #007aff; /* systemBlue */
  --status-primary-hover: #0056b3;
  --status-success: #34c759; /* systemGreen */
  --status-success-hover: #28a745;
  --status-warning: #ff9500; /* systemOrange */
  --status-warning-hover: #cc7700;
  --status-error: #ff3b30; /* systemRed */
  --status-error-hover: #cc2f26;
  --status-info: #5856d6; /* systemIndigo */
  --status-info-hover: #4240a8;

  /* ─── Syntax Highlighting (Xcode Light 準拠) ─── */
  --syntax-keyword: #9b2393; /* Xcode keyword purple */
  --syntax-function: #007aff; /* systemBlue */
  --syntax-string: #c41a16; /* Xcode string red */
  --syntax-number: #1c00cf; /* Xcode number blue */
  --syntax-constant: #703daa; /* Xcode constant purple */
  --syntax-type: #5856d6; /* systemIndigo */
  --syntax-comment: #8e8e93; /* systemGray */
  --syntax-variable: #3900a0;
}
```

**Apple System Gray Scale（Light Mode 参考）:**

| 名前        | Hex       | 用途                   |
| ----------- | --------- | ---------------------- |
| systemGray  | `#8E8E93` | 非アクティブ要素       |
| systemGray2 | `#AEAEB2` | セカンダリ UI 部品     |
| systemGray3 | `#C7C7CC` | ディバイダー補助       |
| systemGray4 | `#D1D1D6` | 入力フィールド背景     |
| systemGray5 | `#E5E5EA` | グループ化された背景   |
| systemGray6 | `#F2F2F7` | セカンダリシステム背景 |

### Task 2: tokens.css dark テーマ定義（Apple HIG System Colors 全面置き換え）

スタブ状態の dark テーマを Apple HIG System Colors で新規定義する。

> **変更理由**: Tailwind Slate-900（`#0f172a`）は濃い紺色であり、Apple の中性 `#000000`/`#1C1C1E` とは異なる印象を与える。Apple のダークモードは OLED ディスプレイで真の黒を活用し、コンテンツとの明確なコントラストを実現する。

```css
[data-theme="dark"] {
  color-scheme: dark;

  /* ─── Apple System Background Colors (Dark) ─── */
  --bg-primary: #000000; /* systemBackground */
  --bg-secondary: #1c1c1e; /* secondarySystemBackground */
  --bg-tertiary: #2c2c2e; /* tertiarySystemBackground */
  --bg-elevated: #1c1c1e; /* elevated surface */
  --bg-glass: rgba(28, 28, 30, 0.8); /* translucent secondary */
  --bg-selection: rgba(10, 132, 255, 0.25); /* systemBlue 25% */

  /* ─── Apple Label Colors (Dark) ─── */
  --text-primary: #ffffff; /* label */
  --text-secondary: rgba(235, 235, 245, 0.6); /* secondaryLabel (#EBEBF5 60%) */
  --text-muted: rgba(235, 235, 245, 0.3); /* tertiaryLabel (#EBEBF5 30%) */
  --text-inverse: #000000;

  /* ─── Apple Separator Colors (Dark) ─── */
  --border-default: #38383a; /* opaqueSeparator */
  --border-emphasis: #48484a; /* systemGray3 */
  --border-subtle: rgba(84, 84, 88, 0.36); /* separator */

  /* ─── Apple System Tint Colors (Dark) ─── */
  --status-primary: #0a84ff; /* systemBlue */
  --status-primary-hover: #409cff;
  --status-success: #30d158; /* systemGreen */
  --status-success-hover: #5bd97d;
  --status-warning: #ff9f0a; /* systemOrange */
  --status-warning-hover: #ffb840;
  --status-error: #ff453a; /* systemRed */
  --status-error-hover: #ff6961;
  --status-info: #5e5ce6; /* systemIndigo */
  --status-info-hover: #7a78eb;

  /* ─── Syntax Highlighting (Xcode Dark 準拠) ─── */
  --syntax-keyword: #fc5fa3; /* Xcode keyword pink */
  --syntax-function: #0a84ff; /* systemBlue */
  --syntax-string: #fc6a5d; /* Xcode string */
  --syntax-number: #d0bf69; /* Xcode number */
  --syntax-constant: #a167e6; /* Xcode constant */
  --syntax-type: #5e5ce6; /* systemIndigo */
  --syntax-comment: #7f8c98; /* Xcode comment gray */
  --syntax-variable: #67b7a4;
}
```

**Apple System Gray Scale（Dark Mode 参考）:**

| 名前        | Hex       | 用途                     |
| ----------- | --------- | ------------------------ |
| systemGray  | `#8E8E93` | 非アクティブ要素（共通） |
| systemGray2 | `#636366` | セカンダリ UI 部品       |
| systemGray3 | `#48484A` | 強調ボーダー             |
| systemGray4 | `#3A3A3C` | 入力フィールド背景       |
| systemGray5 | `#2C2C2E` | ターシャリ背景           |
| systemGray6 | `#1C1C1E` | セカンダリシステム背景   |

**Apple System Tint Colors 対照表（Light ↔ Dark）:**

| カラー名     | Light Mode | Dark Mode | 用途             |
| ------------ | ---------- | --------- | ---------------- |
| systemBlue   | `#007AFF`  | `#0A84FF` | アクセント       |
| systemGreen  | `#34C759`  | `#30D158` | 成功             |
| systemRed    | `#FF3B30`  | `#FF453A` | エラー・破壊操作 |
| systemOrange | `#FF9500`  | `#FF9F0A` | 警告             |
| systemIndigo | `#5856D6`  | `#5E5CE6` | 情報             |
| systemPurple | `#AF52DE`  | `#BF5AF2` | 特殊機能         |
| systemPink   | `#FF2D55`  | `#FF375F` | ハイライト       |
| systemTeal   | `#5AC8FA`  | `#64D2FF` | 補助情報         |
| systemYellow | `#FFCC00`  | `#FFD60A` | 注意             |

### Task 3: マイクロインタラクション用CSS変数追加

`:root` にマイクロインタラクション用のイージングとスケール変数を追加する。後続コンポーネントで統一的なフィードバックパターンを実現するための基盤。

```css
:root {
  /* ─── マイクロインタラクション用イージング ─── */
  --ease-bounce: cubic-bezier(
    0.34,
    1.56,
    0.64,
    1
  ); /* バウンス感のある跳ね返り */
  --ease-anticipate: cubic-bezier(
    0.68,
    -0.55,
    0.27,
    1.55
  ); /* 溜めてから跳ねる */

  /* ─── スケールフィードバック ─── */
  --scale-hover: 1.02; /* ホバー時の微拡大 */
  --scale-active: 0.97; /* タップ/クリック時の微縮小 */
  --scale-bounce: 1.05; /* 成功時のバウンスピーク */
}
```

**標準フィードバックパターン:**

| 操作              | CSS                                                                                      | 用途                       |
| ----------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| ホバー            | `transform: scale(var(--scale-hover)); transition: var(--duration-fast) var(--ease-out)` | カード、ボタン             |
| アクティブ/タップ | `transform: scale(var(--scale-active)); transition: 50ms ease-in`                        | 全インタラクティブ要素     |
| 成功              | `scale(1) → scale(var(--scale-bounce)) → scale(1)` 300ms `var(--ease-bounce)`            | 追加完了、送信完了         |
| 失敗/エラー       | `translateX(-4px, 4px, -4px, 4px, 0)` 400ms (シェイク)                                   | バリデーションエラー       |
| 出現              | `opacity: 0 → 1` + `translateY(8px → 0)` 200ms `var(--ease-out)`                         | カード出現、リスト項目追加 |
| 消失              | `opacity: 1 → 0` + `scale(1 → 0.95)` 150ms `ease-in`                                     | 削除、ポップオーバー閉じ   |

**フィードバック実装パターン（CSS）:**

```css
/* 標準的なインタラクティブカード */
.interactive-card {
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.interactive-card:hover {
  transform: scale(var(--scale-hover));
  box-shadow: var(--shadow-md);
}
.interactive-card:active {
  transform: scale(var(--scale-active));
  transition-duration: 50ms;
}

/* 成功バウンスアニメーション */
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

/* エラーシェイクアニメーション */
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

### Task 4: renderWithTheme テストヘルパー作成

テーマ横断テスト用のヘルパー関数を作成する。全コンポーネントテストで統一的にテーマ切替の検証を行うための基盤。

```typescript
// apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx
import { render, type RenderOptions } from "@testing-library/react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}

export function renderWithTheme(
  ui: React.ReactElement,
  options: ThemeRenderOptions = {},
) {
  const { theme = "kanagawa-dragon", ...renderOptions } = options;
  document.documentElement.setAttribute("data-theme", theme);
  return render(ui, renderOptions);
}
```

### Task 5: テーマ横断テスト設計

`renderWithTheme` テストヘルパーの動作検証と、3テーマでのレンダリングテストパターンを確立する。

```typescript
// apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx
import { renderWithTheme } from "./renderWithTheme";

describe("renderWithTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  describe.each(["kanagawa-dragon", "light", "dark"] as const)(
    "Theme: %s",
    (theme) => {
      it("renders with correct theme attribute", () => {
        renderWithTheme(<div data-testid="test">test</div>, { theme });
        expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      });
    },
  );

  it("defaults to kanagawa-dragon theme", () => {
    renderWithTheme(<div data-testid="test">test</div>);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
  });
});
```

### 既存トークン（変更不要・そのまま利用）

以下は tokens.css で既に適切に定義済み。全テーマ共通で使用し、本タスクでは変更しない。

**スペーシング（8pxグリッド）:**

| トークン       | 値   | 用途                     |
| -------------- | ---- | ------------------------ |
| `--spacing-1`  | 4px  | アイコンとテキストの間隔 |
| `--spacing-2`  | 8px  | コンパクトなパディング   |
| `--spacing-3`  | 12px | 標準パディング           |
| `--spacing-4`  | 16px | カード内パディング       |
| `--spacing-6`  | 24px | セクション間ギャップ     |
| `--spacing-8`  | 32px | 大セクション間隔         |
| `--spacing-12` | 48px | ページレベル余白         |

**タイポグラフィ:**

| トークン      | 値                  | 用途                 |
| ------------- | ------------------- | -------------------- |
| `--font-sans` | Inter, ...          | UIテキスト全般       |
| `--font-mono` | JetBrains Mono, ... | コード表示           |
| `--text-xs`   | 0.75rem             | バッジ、補足テキスト |
| `--text-sm`   | 0.875rem            | ボタン、ラベル       |
| `--text-base` | 1rem                | 本文                 |
| `--text-lg`   | 1.125rem            | セクション見出し     |
| `--text-xl`   | 1.25rem             | ページ見出し         |
| `--text-2xl`  | 1.5rem              | 大見出し             |

**角丸:**

| トークン           | 値     | 用途                       |
| ------------------ | ------ | -------------------------- |
| `--radius-sm`      | 4px    | インラインバッジ           |
| `--radius-default` | 6px    | ボタン                     |
| `--radius-md`      | 8px    | カード、インプット         |
| `--radius-lg`      | 12px   | モーダル、パネル           |
| `--radius-xl`      | 16px   | フローティングパネル       |
| `--radius-full`    | 9999px | アバター、ステータスドット |

**シャドウ:**

| トークン           | 用途                           |
| ------------------ | ------------------------------ |
| `--shadow-sm`      | ホバーフィードバック           |
| `--shadow-default` | カード                         |
| `--shadow-md`      | ドロップダウン、ポップオーバー |
| `--shadow-lg`      | モーダル                       |
| `--shadow-xl`      | フローティングパネル           |
| `--shadow-glass`   | グラスモーフィズムパネル       |

**トランジション:**

| トークン             | 値                                      | 用途                       |
| -------------------- | --------------------------------------- | -------------------------- |
| `--duration-fast`    | 100ms                                   | ホバー、フォーカス         |
| `--duration-default` | 200ms                                   | ボタン操作フィードバック   |
| `--duration-normal`  | 300ms                                   | パネルスライド、テーマ切替 |
| `--duration-slow`    | 500ms                                   | ページトランジション       |
| `--ease-out`         | cubic-bezier(0, 0, 0.2, 1)              | パネルアニメーション       |
| `--ease-spring`      | cubic-bezier(0.175, 0.885, 0.32, 1.275) | バウンスエフェクト         |

### 3テーマカラーマップ全体像

> **注**: `--text-secondary` / `--text-muted` の light / dark は Apple の rgba 表記。テーブルでは白/黒背景上での近似 Hex を記載。

| セマンティック変数 | kanagawa-dragon | light（Apple HIG） | dark（Apple HIG） |
| ------------------ | --------------- | ------------------ | ----------------- |
| `--bg-primary`     | `#12120f`       | `#FFFFFF`          | `#000000`         |
| `--bg-secondary`   | `#1d1c19`       | `#F2F2F7`          | `#1C1C1E`         |
| `--bg-tertiary`    | `#282727`       | `#E5E5EA`          | `#2C2C2E`         |
| `--text-primary`   | `#c5c9c5`       | `#000000`          | `#FFFFFF`         |
| `--text-secondary` | `#a6a69c`       | `≈#86868B`¹        | `≈#98989F`¹       |
| `--text-muted`     | `#625e5a`       | `≈#C5C5C7`¹        | `≈#6C6C70`¹       |
| `--border-default` | `#393836`       | `#C6C6C8`          | `#38383A`         |
| `--status-primary` | `#8ba4b0`       | `#007AFF`          | `#0A84FF`         |
| `--status-success` | `#87a987`       | `#34C759`          | `#30D158`         |
| `--status-error`   | `#e82424`       | `#FF3B30`          | `#FF453A`         |

¹ CSS 定義は `rgba()` 形式（Apple 公式）。近似 Hex は白/黒背景上の視覚的等価色。

## 5. 成果物

| #   | 成果物                | パス                                                               |
| --- | --------------------- | ------------------------------------------------------------------ |
| 1   | tokens.css テーマ追加 | `apps/desktop/src/renderer/styles/tokens.css`                      |
| 2   | テストヘルパー        | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`      |
| 3   | テーマテスト          | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx` |

## 6. 完了条件

- [ ] tokens.css に light テーマが Apple HIG System Colors で定義されている
- [ ] tokens.css に dark テーマが Apple HIG System Colors で定義されている
- [ ] kanagawa-dragon テーマが変更されていない（既存のまま維持）
- [ ] マイクロインタラクション用CSS変数（`--ease-bounce`, `--ease-anticipate`, `--scale-hover`, `--scale-active`, `--scale-bounce`）が `:root` に追加されている
- [ ] `@keyframes success-bounce` と `error-shake` が定義されている
- [ ] `renderWithTheme` テストヘルパーが作成されている
- [ ] 3テーマでのレンダリングテストが PASS
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS
- [ ] WCAG 2.1 AA コントラスト比が全テーマで検証されている

## 7. 既知の落とし穴・教訓

| Pitfall | 内容                                   | 対策                                                                                                                                                   |
| ------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 新規    | settingsSlice テーマ固定               | settingsSlice.ts の `setThemeMode`/`setResolvedTheme` が `kanagawa-dragon` に固定されている。テーマ切替を有効化するには settingsSlice の制約解除が必要 |
| 新規    | Apple HIG tertiaryLabel 低コントラスト | `--text-muted`（30% opacity）は小テキスト（< 18px）で WCAG AA 4.5:1 を満たさない場合がある。使用箇所でコントラスト比を個別検証すること                 |
| P39     | happy-dom環境でuserEvent非互換         | テストでは `fireEvent` を使用。`userEvent.setup()` は使用禁止                                                                                          |
| P40     | テスト実行ディレクトリ依存             | `cd apps/desktop && pnpm vitest run` で実行。プロジェクトルートから実行しない                                                                          |
| P9      | モジュールスコープ変数テスト間リーク   | `afterEach` で `data-theme` 属性をリセットし、テスト間の状態汚染を防止                                                                                 |

## 8. 実行手順（task-specification-creator準拠）

| Step | 内容                                                                                                                          | 実行方式 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | `00-ui-design-foundation.md` と `00-1-design-tokens.md` を読み、変更対象トークンを確定する                                    | 直列     |
| 2    | `tokens.css` の `light` / `dark` / マイクロインタラクショントークンを更新する（Task 1〜3）                                    | 直列     |
| 3    | `renderWithTheme` ヘルパー作成（Task 4）とテーマ横断テストケース作成（Task 5）を実施する                                      | 並列     |
| 4    | 統合テスト連携: `cd apps/desktop && pnpm vitest run` でテーマ横断テストを実行し、失敗時はトークン定義へ即時フィードバックする | 直列     |
| 5    | 完了条件チェックリストを全件確認し、成果物パスが実ファイルと一致していることを確認する                                        | 直列     |

## 9. システム仕様（aiworkflow-requirements）

| 参照仕様                                                                       | 今回抽出した必須要件                                                                              | 本仕様への反映                       |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | Design Token 3層（Primitive/Semantic/Component）、`data-theme` によるテーマ管理、コントラスト基準 | Task 1〜3、完了条件のテーマ/WCAG要件 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG準拠、マイクロインタラクション速度、アクセシビリティ前提                                 | Why、Task 3、完了条件                |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | a11y観点での属性検証（role/aria）と検証方針                                                       | Task 5、完了条件（WCAG）             |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | Vitest実行基準、テスト品質ゲート                                                                  | 完了条件（Vitest PASS）              |

## 10. 参照資料

- `apps/desktop/src/renderer/styles/tokens.css` — 既存デザイントークン
- `apps/desktop/src/renderer/store/types.ts` — `ThemeMode`, `ResolvedTheme` 型定義
- `apps/desktop/src/renderer/store/slices/settingsSlice.ts` — テーマ管理ロジック（kanagawa-dragon固定）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` — トークン体系・テーマ要件
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG/WCAGの設計原則
- `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` — アクセシビリティ検証パターン
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` — テスト品質基準
- `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-foundation-reflection-audit.md` — 分割反映トレーサビリティ監査
- [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color) — Apple 公式カラーガイドライン
- [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) — ダークモード設計ガイド
- `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-ui-design-foundation.md` — 親仕様書
