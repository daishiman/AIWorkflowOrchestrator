# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目          | 値                                                                 |
| ------------- | ------------------------------------------------------------------ |
| タスクID      | TASK-UI-00-TOKENS                                                  |
| Phase         | 5                                                                  |
| Phase名       | 実装（TDD: Green）                                                 |
| 前提Phase     | Phase 4（テスト作成）完了 — 全テストが Red 状態であること          |
| 前Phase成果物 | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx` |
| 実行方式      | 直列（Task 1 → Task 2 → Task 3 → Task 4 → Green確認）              |

## 目的

Phase 4 で作成したテストを全て Green にするために、tokens.css の light/dark テーマ定義を Apple HIG System Colors に全面置き換えし、マイクロインタラクション用CSS変数を追加し、`renderWithTheme` テストヘルパーを実装する。

## 実行タスク

- Phaseタスク実行: 本PhaseのTaskを順に実行し、結果を成果物へ記録する

### Task 1: tokens.css light テーマ定義（Apple HIG System Colors 全面置き換え）

#### 1.1 変更対象

ファイル: `apps/desktop/src/renderer/styles/tokens.css`

既存の `[data-theme="light"]` セクション（Tailwind Slate ベース）を Apple HIG System Colors に全面置き換えする。

#### 1.2 変更前（Tailwind Slate ベース — 削除対象）

```css
/* 削除対象: 以下の [data-theme="light"] セクション全体 */
[data-theme="light"] {
  color-scheme: light;
  --bg-primary: #ffffff;
  --bg-secondary: var(--color-slate-50);
  --bg-tertiary: var(--color-slate-100);
  --bg-elevated: rgba(0, 0, 0, 0.02);
  --bg-glass: rgba(0, 0, 0, 0.05);
  --text-primary: var(--color-slate-900);
  --text-secondary: var(--color-slate-600);
  --text-muted: var(--color-slate-400);
  --text-inverse: var(--color-slate-50);
  --border-default: var(--color-slate-200);
  --border-emphasis: var(--color-slate-300);
  --border-subtle: rgba(0, 0, 0, 0.1);
  --status-primary: var(--color-blue-600);
  --status-success: var(--color-green-600);
  --status-error: var(--color-red-600);
}
```

#### 1.3 変更後（Apple HIG System Colors）

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

#### 1.4 変更点の差分要約

| CSS変数                  | 変更前（Tailwind Slate）           | 変更後（Apple HIG）                      |
| ------------------------ | ---------------------------------- | ---------------------------------------- |
| `--bg-secondary`         | `var(--color-slate-50)` (#f8fafc)  | `#f2f2f7` (systemGray6)                  |
| `--bg-tertiary`          | `var(--color-slate-100)` (#f1f5f9) | `#e5e5ea` (systemGray5)                  |
| `--bg-elevated`          | `rgba(0, 0, 0, 0.02)`              | `#ffffff`                                |
| `--bg-glass`             | `rgba(0, 0, 0, 0.05)`              | `rgba(242, 242, 247, 0.8)`               |
| `--bg-selection`         | （なし）                           | `rgba(0, 122, 255, 0.15)` **新規**       |
| `--text-primary`         | `var(--color-slate-900)` (#0f172a) | `#000000` (label)                        |
| `--text-secondary`       | `var(--color-slate-600)` (#475569) | `rgba(60, 60, 67, 0.6)` (secondaryLabel) |
| `--text-muted`           | `var(--color-slate-400)` (#94a3b8) | `rgba(60, 60, 67, 0.3)` (tertiaryLabel)  |
| `--text-inverse`         | `var(--color-slate-50)` (#f8fafc)  | `#ffffff`                                |
| `--border-default`       | `var(--color-slate-200)` (#e2e8f0) | `#c6c6c8` (opaqueSeparator)              |
| `--border-emphasis`      | `var(--color-slate-300)` (#cbd5e1) | `#aeaeb2` (systemGray2)                  |
| `--border-subtle`        | `rgba(0, 0, 0, 0.1)`               | `rgba(60, 60, 67, 0.12)` (separator)     |
| `--status-primary`       | `var(--color-blue-600)` (#2563eb)  | `#007aff` (systemBlue)                   |
| `--status-primary-hover` | （なし）                           | `#0056b3` **新規**                       |
| `--status-success`       | `var(--color-green-600)` (#16a34a) | `#34c759` (systemGreen)                  |
| `--status-success-hover` | （なし）                           | `#28a745` **新規**                       |
| `--status-warning`       | （なし）                           | `#ff9500` (systemOrange) **新規**        |
| `--status-warning-hover` | （なし）                           | `#cc7700` **新規**                       |
| `--status-error`         | `var(--color-red-600)` (#dc2626)   | `#ff3b30` (systemRed)                    |
| `--status-error-hover`   | （なし）                           | `#cc2f26` **新規**                       |
| `--status-info`          | （なし）                           | `#5856d6` (systemIndigo) **新規**        |
| `--status-info-hover`    | （なし）                           | `#4240a8` **新規**                       |
| `--syntax-*`             | （なし）                           | Xcode Light カラー8種 **全て新規**       |

### Task 2: tokens.css dark テーマ定義（Apple HIG System Colors 新規定義）

#### 2.1 変更対象

ファイル: `apps/desktop/src/renderer/styles/tokens.css`

既存のスタブ `[data-theme="dark"]`（`color-scheme: dark` のみ）を Apple HIG System Colors で完全定義する。

#### 2.2 変更前（スタブ — 置き換え対象）

```css
[data-theme="dark"] {
  color-scheme: dark;
}
```

#### 2.3 変更後（Apple HIG System Colors）

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

### Task 3: マイクロインタラクション用CSS変数追加

#### 3.1 変更対象

ファイル: `apps/desktop/src/renderer/styles/tokens.css`

既存の `:root` セクション（最初のもの）の末尾、`--ease-spring` の直後に以下の変数を追加する。

#### 3.2 追加する CSS変数

```css
/* ─── マイクロインタラクション用イージング ─── */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* バウンス感のある跳ね返り */
--ease-anticipate: cubic-bezier(0.68, -0.55, 0.27, 1.55); /* 溜めてから跳ねる */

/* ─── スケールフィードバック ─── */
--scale-hover: 1.02; /* ホバー時の微拡大 */
--scale-active: 0.97; /* タップ/クリック時の微縮小 */
--scale-bounce: 1.05; /* 成功時のバウンスピーク */
```

#### 3.3 追加する @keyframes（tokens.css 末尾に追加）

```css
/* ===== Micro Interaction Keyframes ===== */
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

#### 3.4 変更箇所の明示

| 挿入位置                                         | 追加内容                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `:root` セクション内、`--ease-spring` 定義の直後 | `--ease-bounce`, `--ease-anticipate`, `--scale-hover`, `--scale-active`, `--scale-bounce` |
| ファイル末尾（`.glass-panel-heavy` の後）        | `@keyframes success-bounce`, `@keyframes error-shake`                                     |

### Task 4: renderWithTheme テストヘルパー実装

#### 4.1 ファイル配置

| ファイル                                                      | 内容                     |
| ------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx` | テーマ設定付きrender関数 |

#### 4.2 実装コード

````typescript
// apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement } from "react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}

/**
 * テーマ設定付きのrender関数
 * document.documentElement に data-theme 属性を設定してからレンダリングする。
 *
 * @param ui - レンダリングするReact要素
 * @param options - テーマ指定とRenderOptionsの拡張
 * @returns RenderResult — @testing-library/react の標準render結果
 *
 * @example
 * ```tsx
 * const { getByTestId } = renderWithTheme(<MyComponent />, { theme: "light" });
 * ```
 */
export function renderWithTheme(
  ui: ReactElement,
  options: ThemeRenderOptions = {},
): RenderResult {
  const { theme = "kanagawa-dragon", ...renderOptions } = options;
  document.documentElement.setAttribute("data-theme", theme);
  return render(ui, renderOptions);
}
````

#### 4.3 実装の設計判断

| 判断ポイント                | 選択                       | 理由                                                                                 |
| --------------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| デフォルトテーマ            | `kanagawa-dragon`          | settingsSlice がこのテーマに固定されているため、テスト環境でも同一のデフォルトにする |
| data-theme の設定先         | `document.documentElement` | CSS の `[data-theme="..."]` セレクタと一致させるため                                 |
| React Context での Provider | 不使用                     | CSS変数ベースのテーマはDOM属性で十分。Provider不要                                   |
| 戻り値型                    | `RenderResult`             | `@testing-library/react` の標準型で、テストのタイプセーフを保証                      |

### 実装時注意事項

| 注意事項                                                     | 根拠                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| `kanagawa-dragon` テーマは変更しない                         | 仕様（Task 1/2の対象外）                                 |
| `:root` の Semantic Colors デフォルト値は変更しない          | `:root` はフォールバック用。テーマはdata-themeで切り替え |
| settingsSlice のテーマ固定制約は変更しない                   | 本タスクのスコープ外。テーマ切替有効化は別タスク         |
| 既存のPrimitive Colors（`:root` の `--color-*`）は削除しない | 他コンポーネントが参照している可能性がある               |

## 参照資料

| 資料                                                                                             | 参照目的                                |
| ------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------- |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-4-test-creation.md`                                   | Phase 4 のテストコードとの整合性確認    |
| `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-1-design-tokens.md`            | Apple HIG カラー値の正確な参照          |
| `apps/desktop/src/renderer/styles/tokens.css`                                                    | 既存トークンの変更箇所の特定            |
| `apps/desktop/src/renderer/store/types.ts`                                                       | `ResolvedTheme` 型定義                  |
| `.claude/rules/01-architecture.md` — カラーパレット                                              | Apple HIG 準拠カラー値                  |
| [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)         | Apple 公式カラーガイドライン            |
| [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | ダークモード設計ガイド                  |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                       | トークン体系・テーマ要件                |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                   | Apple HIG/WCAGの設計原則                |
| テスト仕様書                                                                                     | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                                                                  | 実行方式 |
| ---- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | `tokens.css` を読み込み、変更対象の `[data-theme="light"]` セクションを特定する                                       | 直列     |
| 2    | Task 1: `[data-theme="light"]` を Apple HIG System Colors に全面置き換え                                              | 直列     |
| 3    | Task 2: `[data-theme="dark"]` を Apple HIG System Colors で完全定義                                                   | 直列     |
| 4    | Task 3: `:root` にマイクロインタラクション変数を追加し、末尾に `@keyframes` を追加                                    | 直列     |
| 5    | Task 4: `renderWithTheme.tsx` を作成する                                                                              | 直列     |
| 6    | Green確認: `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx` で全テストが PASS | 直列     |
| 7    | `kanagawa-dragon` テーマが変更されていないことを `git diff` で確認                                                    | 直列     |

## 統合テスト連携

- テスト実行コマンド: `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx`
- 全テストが Green になることを確認後、Phase 6（テスト拡充）に進む
- `kanagawa-dragon` テーマの既存テストが壊れていないことを `cd apps/desktop && pnpm vitest run` で確認する

## 多角的チェック観点

| 観点                 | 検証内容                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Apple HIG 準拠       | 全カラー値が Apple Human Interface Guidelines の公式値と一致する                              |
| kanagawa-dragon 不変 | `[data-theme="kanagawa-dragon"]` セクションに変更がない                                       |
| CSS変数網羅性        | light/dark 両テーマで全セマンティック変数（bg, text, border, status, syntax）が定義されている |
| 後方互換性           | `:root` の Primitive Colors と Semantic Colors デフォルト値が維持されている                   |
| TDD Green            | Phase 4 の全テストケース（TC-4-1〜TC-4-7）が PASS する                                        |

## 成果物

| #   | 成果物                       | パス                                                          |
| --- | ---------------------------- | ------------------------------------------------------------- |
| 1   | tokens.css（テーマ追加済み） | `apps/desktop/src/renderer/styles/tokens.css`                 |
| 2   | renderWithTheme ヘルパー     | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx` |

## 完了条件

- [ ] `[data-theme="light"]` が Apple HIG System Colors で定義されている（bg 6種、text 4種、border 3種、status 10種、syntax 8種）
- [ ] `[data-theme="dark"]` が Apple HIG System Colors で定義されている（bg 6種、text 4種、border 3種、status 10種、syntax 8種）
- [ ] `kanagawa-dragon` テーマが変更されていない（`git diff` で差分がないこと）
- [ ] マイクロインタラクション変数（`--ease-bounce`, `--ease-anticipate`, `--scale-hover`, `--scale-active`, `--scale-bounce`）が `:root` に追加されている
- [ ] `@keyframes success-bounce` と `@keyframes error-shake` が tokens.css 末尾に追加されている
- [ ] `renderWithTheme.tsx` が作成され、`ResolvedTheme` 型を使用している
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx` で全テストが PASS（Green）
- [ ] `cd apps/desktop && pnpm vitest run` で既存テストが壊れていない
- [ ] 本Phase内の全タスク（Task 1〜4）を100%実行完了

## サブタスク管理

| タスク | 状態    | 担当 |
| ------ | ------- | ---- |
| Task 1 | pending | -    |
| Task 2 | pending | -    |
| Task 3 | pending | -    |
| Task 4 | pending | -    |

## タスク100%実行確認

- [ ] Task 1: tokens.css light テーマ定義 — 完了
- [ ] Task 2: tokens.css dark テーマ定義 — 完了
- [ ] Task 3: マイクロインタラクション用CSS変数追加 — 完了
- [ ] Task 4: renderWithTheme テストヘルパー実装 — 完了
- [ ] Green確認: 全テスト PASS — 完了

## 次のPhase

Phase 6: テスト拡充 — `phase-6-test-expansion.md`
