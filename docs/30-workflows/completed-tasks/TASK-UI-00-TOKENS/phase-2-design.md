# Phase 2: 設計 — TASK-UI-00-TOKENS

## メタ情報

| 項目     | 値                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Phase    | 2（設計）                                                                                                   |
| タスクID | TASK-UI-00-TOKENS                                                                                           |
| タスク名 | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 機能名   | TASK-UI-00-TOKENS                                                                                           |
| 作成日   | 2026-02-22                                                                                                  |
| 前Phase  | Phase 1: 要件定義（phase-1-requirements.md）                                                                |

## 目的

Phase 1 で定義した40件のFR + 6件のNFR を実現するために、tokens.css の構造設計（テーマ切替方式、セマンティック変数の3層構造、マイクロインタラクション変数の配置）と、renderWithTheme テストヘルパーのインターフェース設計を行う。

## 実行タスク

- 設計定義: tokens.css 構造・マイクロインタラクション・テストヘルパーI/Fを設計する

### Task 1: tokens.css 構造設計

#### 1-1. テーマ切替方式

テーマ切替は `data-theme` 属性によるCSSセレクタ方式を採用する（既存の kanagawa-dragon と同一方式）。

```
<html data-theme="kanagawa-dragon">  → [data-theme="kanagawa-dragon"] { ... }
<html data-theme="light">            → [data-theme="light"] { ... }
<html data-theme="dark">             → [data-theme="dark"] { ... }
```

**設計判断の根拠**: `prefers-color-scheme` メディアクエリではなく `data-theme` 属性を使用する理由は、ユーザーが OS 設定とは独立してテーマを選択できるようにするため。kanagawa-dragon はシステムのライト/ダーク設定と無関係に適用される。

#### 1-2. CSS変数の3層構造

tokens.css 内の変数は以下の3層で構成する:

| 層               | スコープ            | 命名規則                    | 例                                      |
| ---------------- | ------------------- | --------------------------- | --------------------------------------- |
| Primitive Tokens | `:root`             | `--color-{palette}-{shade}` | `--color-slate-900`, `--color-blue-600` |
| Semantic Tokens  | `[data-theme="*"]`  | `--{category}-{variant}`    | `--bg-primary`, `--text-secondary`      |
| Component Tokens | コンポーネントCSS内 | `--{component}-{property}`  | `--button-primary-bg`（本タスク対象外） |

**本タスクで変更するのは Semantic Tokens 層のみ。Primitive Tokens 層と Component Tokens 層は変更しない。**

#### 1-3. tokens.css ファイル構造設計

```css
/* ===== 1. Primitive Colors ===== */
:root {
  /* Slate, Blue, Green, Amber, Red, Sky, macOS System Colors */
  /* → 変更なし（既存のまま維持） */
}

/* ===== 2. Semantic Colors (Default = kanagawa-dragon fallback) ===== */
:root {
  /* --bg-*, --text-*, --border-*, --status-* */
  /* → 変更なし（kanagawa-dragon のデフォルト値） */
}

/* ===== 3. Spacing / Typography / Effects ===== */
:root {
  /* → 変更なし（全テーマ共通） */
}

/* ===== 4. マイクロインタラクション変数【新規追加】 ===== */
:root {
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-anticipate: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --scale-hover: 1.02;
  --scale-active: 0.97;
  --scale-bounce: 1.05;
}

/* ===== 5. キーフレームアニメーション【新規追加】 ===== */
@keyframes success-bounce {
  /* ... */
}
@keyframes error-shake {
  /* ... */
}

/* ===== 6. Kanagawa Dragon Theme ===== */
:root {
  /* Kanagawa primitive colors */
}
[data-theme="kanagawa-dragon"] {
  /* → 変更なし */
}

/* ===== 7. Light Theme【全面書き換え】 ===== */
[data-theme="light"] {
  color-scheme: light;
  /* Apple HIG System Colors (Light) */
}

/* ===== 8. Dark Theme【新規定義】 ===== */
[data-theme="dark"] {
  color-scheme: dark;
  /* Apple HIG System Colors (Dark) */
}

/* ===== 9. Theme Transition / Glass Utilities ===== */
/* → 変更なし */
```

#### 1-4. Light テーマ セマンティック変数マッピング

| セマンティック変数       | Apple HIG 名称            | 値                         |
| ------------------------ | ------------------------- | -------------------------- |
| `--bg-primary`           | systemBackground          | `#FFFFFF`                  |
| `--bg-secondary`         | secondarySystemBackground | `#F2F2F7`                  |
| `--bg-tertiary`          | systemGray5               | `#E5E5EA`                  |
| `--bg-elevated`          | elevated surface          | `#FFFFFF`                  |
| `--bg-glass`             | translucent secondary     | `rgba(242, 242, 247, 0.8)` |
| `--bg-selection`         | systemBlue 15%            | `rgba(0, 122, 255, 0.15)`  |
| `--text-primary`         | label                     | `#000000`                  |
| `--text-secondary`       | secondaryLabel            | `rgba(60, 60, 67, 0.6)`    |
| `--text-muted`           | tertiaryLabel             | `rgba(60, 60, 67, 0.3)`    |
| `--text-inverse`         | —                         | `#FFFFFF`                  |
| `--border-default`       | opaqueSeparator           | `#C6C6C8`                  |
| `--border-emphasis`      | systemGray2               | `#AEAEB2`                  |
| `--border-subtle`        | separator                 | `rgba(60, 60, 67, 0.12)`   |
| `--status-primary`       | systemBlue                | `#007AFF`                  |
| `--status-primary-hover` | —                         | `#0056B3`                  |
| `--status-success`       | systemGreen               | `#34C759`                  |
| `--status-success-hover` | —                         | `#28A745`                  |
| `--status-warning`       | systemOrange              | `#FF9500`                  |
| `--status-warning-hover` | —                         | `#CC7700`                  |
| `--status-error`         | systemRed                 | `#FF3B30`                  |
| `--status-error-hover`   | —                         | `#CC2F26`                  |
| `--status-info`          | systemIndigo              | `#5856D6`                  |
| `--status-info-hover`    | —                         | `#4240A8`                  |
| `--syntax-keyword`       | Xcode keyword purple      | `#9B2393`                  |
| `--syntax-function`      | systemBlue                | `#007AFF`                  |
| `--syntax-string`        | Xcode string red          | `#C41A16`                  |
| `--syntax-number`        | Xcode number blue         | `#1C00CF`                  |
| `--syntax-constant`      | Xcode constant purple     | `#703DAA`                  |
| `--syntax-type`          | systemIndigo              | `#5856D6`                  |
| `--syntax-comment`       | systemGray                | `#8E8E93`                  |
| `--syntax-variable`      | —                         | `#3900A0`                  |

#### 1-5. Dark テーマ セマンティック変数マッピング

| セマンティック変数       | Apple HIG 名称            | 値                         |
| ------------------------ | ------------------------- | -------------------------- |
| `--bg-primary`           | systemBackground          | `#000000`                  |
| `--bg-secondary`         | secondarySystemBackground | `#1C1C1E`                  |
| `--bg-tertiary`          | tertiarySystemBackground  | `#2C2C2E`                  |
| `--bg-elevated`          | elevated surface          | `#1C1C1E`                  |
| `--bg-glass`             | translucent secondary     | `rgba(28, 28, 30, 0.8)`    |
| `--bg-selection`         | systemBlue 25%            | `rgba(10, 132, 255, 0.25)` |
| `--text-primary`         | label                     | `#FFFFFF`                  |
| `--text-secondary`       | secondaryLabel            | `rgba(235, 235, 245, 0.6)` |
| `--text-muted`           | tertiaryLabel             | `rgba(235, 235, 245, 0.3)` |
| `--text-inverse`         | —                         | `#000000`                  |
| `--border-default`       | opaqueSeparator           | `#38383A`                  |
| `--border-emphasis`      | systemGray3               | `#48484A`                  |
| `--border-subtle`        | separator                 | `rgba(84, 84, 88, 0.36)`   |
| `--status-primary`       | systemBlue                | `#0A84FF`                  |
| `--status-primary-hover` | —                         | `#409CFF`                  |
| `--status-success`       | systemGreen               | `#30D158`                  |
| `--status-success-hover` | —                         | `#5BD97D`                  |
| `--status-warning`       | systemOrange              | `#FF9F0A`                  |
| `--status-warning-hover` | —                         | `#FFB840`                  |
| `--status-error`         | systemRed                 | `#FF453A`                  |
| `--status-error-hover`   | —                         | `#FF6961`                  |
| `--status-info`          | systemIndigo              | `#5E5CE6`                  |
| `--status-info-hover`    | —                         | `#7A78EB`                  |
| `--syntax-keyword`       | Xcode keyword pink        | `#FC5FA3`                  |
| `--syntax-function`      | systemBlue                | `#0A84FF`                  |
| `--syntax-string`        | Xcode string              | `#FC6A5D`                  |
| `--syntax-number`        | Xcode number              | `#D0BF69`                  |
| `--syntax-constant`      | Xcode constant            | `#A167E6`                  |
| `--syntax-type`          | systemIndigo              | `#5E5CE6`                  |
| `--syntax-comment`       | Xcode comment gray        | `#7F8C98`                  |
| `--syntax-variable`      | —                         | `#67B7A4`                  |

#### 1-6. 3テーマ間のセマンティック変数整合性

全3テーマが同一の31個のセマンティック変数を定義する:

| カテゴリ   | 変数名                                                                                             | 数     |
| ---------- | -------------------------------------------------------------------------------------------------- | ------ |
| Background | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`, `--bg-glass`, `--bg-selection` | 6      |
| Text       | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`                             | 4      |
| Border     | `--border-default`, `--border-emphasis`, `--border-subtle`                                         | 3      |
| Status     | `--status-{primary,success,warning,error,info}` × {base, hover}                                    | 10     |
| Syntax     | `--syntax-{keyword,function,string,number,constant,type,comment,variable}`                         | 8      |
| **合計**   |                                                                                                    | **31** |

**注意**: 既存の kanagawa-dragon テーマに `--bg-selection` が定義されている。light/dark テーマでも同変数を定義することで、全テーマでの変数名統一を維持する。既存の kanagawa-dragon セレクタ内には `--status-*-hover` も存在するため、light/dark での追加で整合性が保たれる。

### Task 2: マイクロインタラクション設計

#### 2-1. 変数配置方針

マイクロインタラクション変数はテーマ非依存のため、`:root` に配置する（テーマセレクタ内ではない）。

| 変数名              | 値                                      | 配置    | 用途                       |
| ------------------- | --------------------------------------- | ------- | -------------------------- |
| `--ease-bounce`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`     | `:root` | バウンス感のある跳ね返り   |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | `:root` | 溜めてから跳ねるモーション |
| `--scale-hover`     | `1.02`                                  | `:root` | ホバー時の微拡大           |
| `--scale-active`    | `0.97`                                  | `:root` | タップ/クリック時の微縮小  |
| `--scale-bounce`    | `1.05`                                  | `:root` | 成功時のバウンスピーク     |

#### 2-2. キーフレーム設計

```css
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

#### 2-3. tokens.css 内の挿入位置

マイクロインタラクション変数は、既存の `:root` セクション（Transitions の直後、Kanagawa Dragon の直前）に追加する:

```
:root {
  /* ... Transitions ... */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ===== Micro-Interaction Tokens ===== */  ← ここに追加
  --ease-bounce: ...;
  --ease-anticipate: ...;
  --scale-hover: ...;
  --scale-active: ...;
  --scale-bounce: ...;
}

/* ===== Keyframe Animations ===== */  ← ここに追加
@keyframes success-bounce { ... }
@keyframes error-shake { ... }

/* ===== Kanagawa Dragon Theme (Default) ===== */
```

### Task 3: renderWithTheme テストヘルパー インターフェース設計

#### 3-1. 型定義

```typescript
// 依存する既存型
import type { ResolvedTheme } from "../../store/types";
// ResolvedTheme = "kanagawa-dragon" | "light" | "dark"

// 拡張オプション型
interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}
```

#### 3-2. 関数シグネチャ

```typescript
export function renderWithTheme(
  ui: React.ReactElement,
  options?: ThemeRenderOptions,
): RenderResult;
```

| パラメータ      | 型                   | デフォルト値        | 説明                        |
| --------------- | -------------------- | ------------------- | --------------------------- |
| `ui`            | `React.ReactElement` | —（必須）           | レンダリング対象のReact要素 |
| `options`       | `ThemeRenderOptions` | `{}`                | テーマ指定 + RenderOptions  |
| `options.theme` | `ResolvedTheme`      | `"kanagawa-dragon"` | 適用するテーマ名            |

#### 3-3. 実装設計

```typescript
export function renderWithTheme(
  ui: React.ReactElement,
  options: ThemeRenderOptions = {},
) {
  const { theme = "kanagawa-dragon", ...renderOptions } = options;
  document.documentElement.setAttribute("data-theme", theme);
  return render(ui, renderOptions);
}
```

**設計判断**:

- `document.documentElement` に直接 `data-theme` を設定する方式を採用。wrapper コンポーネントを使わない理由は、CSS変数が `:root` / `html` 要素のセレクタに依存するため、子要素に `data-theme` を設定しても変数が適用されないため
- `render` の戻り値をそのまま返すことで、`screen`, `getByTestId`, `rerender` 等の全APIが利用可能

#### 3-4. ファイル配置

```
apps/desktop/src/renderer/tests/helpers/
├── renderWithTheme.tsx       ← ヘルパー実装
└── renderWithTheme.test.tsx  ← ヘルパーテスト
```

#### 3-5. テスト設計

```typescript
describe("renderWithTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  describe.each(["kanagawa-dragon", "light", "dark"] as const)(
    "Theme: %s",
    (theme) => {
      it("data-theme属性に正しいテーマ名を設定する", () => {
        renderWithTheme(<div data-testid="test">test</div>, { theme });
        expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      });
    },
  );

  it("テーマ未指定時はkanagawa-dragonをデフォルトとする", () => {
    renderWithTheme(<div data-testid="test">test</div>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("kanagawa-dragon");
  });

  it("RenderOptionsをrender関数に透過的に渡す", () => {
    const { getByTestId } = renderWithTheme(
      <div data-testid="custom">content</div>,
      { theme: "light" },
    );
    expect(getByTestId("custom")).toBeTruthy();
  });
});
```

**テスト設計の注意点**:

- `afterEach` で `data-theme` 属性を確実にリセット（P9 準拠）
- `userEvent` は使用しない（P39 準拠: happy-dom 環境では `fireEvent` を使用）
- `describe.each` で3テーマを網羅的にテスト

## 参照資料

| 参照仕様                                                                              | 用途                                         | 本設計での参照箇所         |
| ------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------- |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-1-requirements.md`                         | Phase 1 要件定義                             | 全Task の要件根拠          |
| `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-1-design-tokens.md` | 元タスク仕様書                               | CSS定義の正本              |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`            | Design Token 3層体系                         | Task 1: 3層構造設計        |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`        | マイクロインタラクション定義                 | Task 2: イージング値       |
| `apps/desktop/src/renderer/styles/tokens.css`                                         | 現行CSS変数構造                              | Task 1: ファイル構造設計   |
| `apps/desktop/src/renderer/store/types.ts`                                            | ResolvedTheme 型定義                         | Task 3: インターフェース型 |
| 要件定義書                                                                            | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物             |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                      | 実行方式 |
| ---- | ------------------------------------------------------------------------- | -------- |
| 1    | 既存 tokens.css のファイル構造を分析し、セクション境界を特定する          | 直列     |
| 2    | 3層構造（Primitive / Semantic / Component）の変数配置マッピングを作成する | 直列     |
| 3    | Light テーマの31変数 → Apple HIG 値マッピングテーブルを完成させる         | 直列     |
| 4    | Dark テーマの31変数 → Apple HIG 値マッピングテーブルを完成させる          | 直列     |
| 5    | マイクロインタラクション変数の挿入位置とキーフレームを設計する            | 直列     |
| 6    | renderWithTheme のインターフェース（型・シグネチャ・戻り値）を設計する    | 並列     |
| 7    | テストファイルのテストケース構造を設計する                                | 並列     |

## アーキテクチャ層別設計

| 層       | 設計対象                                 | 設計内容                                         |
| -------- | ---------------------------------------- | ------------------------------------------------ |
| Renderer | `tokens.css`                             | テーマセレクタ構造、変数マッピング、キーフレーム |
| Renderer | `tests/helpers/renderWithTheme.tsx`      | 関数インターフェース、型定義                     |
| Renderer | `tests/helpers/renderWithTheme.test.tsx` | テストケース構造、3テーマ網羅パターン            |

## 統合テスト連携

| テスト種別             | 実行コマンド                                                                             | 目的                               |
| ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------- |
| renderWithTheme テスト | `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx` | ヘルパー動作検証                   |
| 全テスト回帰           | `cd apps/desktop && pnpm vitest run`                                                     | 既存テストへの影響がないことを確認 |

## 多角的チェック観点

| 観点                 | チェック内容                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| 3層構造整合性        | Primitive → Semantic → Component の依存方向が一方向であるか                   |
| テーマ変数完全性     | 3テーマすべてで31個の同一セマンティック変数が定義されているか                 |
| Apple HIG 値正確性   | 全カラー値が Apple 公式ドキュメントの値と完全一致しているか                   |
| 既存構造保護         | kanagawa-dragon セクションと共通セクション（Spacing等）に変更が入っていないか |
| テストヘルパー互換性 | `@testing-library/react` の `render` 戻り値と互換性があるか                   |
| P9/P39/P40 準拠      | テスト設計が既知の落とし穴に対応しているか                                    |

## 成果物

| #   | 成果物               | パス                                                                         |
| --- | -------------------- | ---------------------------------------------------------------------------- |
| 1   | アーキテクチャ設計書 | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-2/architecture-design.md` |

> **注記**: 本 Phase 仕様書自体がアーキテクチャ設計の全情報を含むため、outputs/ フォルダの成果物は本仕様書からの抽出・整形版とする。

## 完了条件

- [ ] tokens.css のファイル構造設計（9セクション構成）が定義済み
- [ ] Light テーマの31変数マッピングテーブルが Apple HIG 値で完成済み
- [ ] Dark テーマの31変数マッピングテーブルが Apple HIG 値で完成済み
- [ ] 3テーマ間のセマンティック変数整合性（31変数 × 3テーマ）が検証済み
- [ ] マイクロインタラクション変数（5個）とキーフレーム（2個）の配置が設計済み
- [ ] renderWithTheme の型定義・関数シグネチャ・実装設計が完成済み
- [ ] テストケース構造（3テーマ × describe.each + デフォルト値 + Options透過）が設計済み
- [ ] ファイル配置が確定済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| サブタスク                                   | 状態     | 担当    |
| -------------------------------------------- | -------- | ------- |
| Task 1: tokens.css 構造設計                  | 完了予定 | 本Phase |
| Task 2: マイクロインタラクション設計         | 完了予定 | 本Phase |
| Task 3: renderWithTheme インターフェース設計 | 完了予定 | 本Phase |

## タスク100%実行確認

> 本セクションはPhase完了時に記入する。

- [ ] 全タスクの成果物が生成されている
- [ ] 完了条件の全チェックボックスがON
- [ ] 次Phaseへの引き継ぎ情報が明確

## 次のPhase

Phase 3: 設計レビュー（`phase-3-design-review.md`）

- Apple HIG System Colors 準拠の正確性検証
- WCAG 2.1 AA コントラスト比検証
- 3テーマ整合性検証
- renderWithTheme インターフェースの妥当性検証
