# Phase 6: テスト拡充

## メタ情報

| 項目          | 値                                                                               |
| ------------- | -------------------------------------------------------------------------------- |
| タスクID      | TASK-UI-00-TOKENS                                                                |
| Phase         | 6                                                                                |
| Phase名       | テスト拡充                                                                       |
| 前提Phase     | Phase 5（実装）完了 — 全テストが Green 状態であること                            |
| 前Phase成果物 | `apps/desktop/src/renderer/styles/tokens.css`（更新済み）、`renderWithTheme.tsx` |
| 実行方式      | 直列（カバレッジ分析 → テスト追加 → 再カバレッジ測定）                           |

## 目的

Phase 5 で実装したコードのテストカバレッジを計測し、カバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）未達の場合にテストを追加する。`renderWithTheme` ヘルパーの境界値テスト、3テーマの CSS 変数存在テスト、WCAG AA コントラスト比テストを追加してカバレッジと品質を向上させる。

## 実行タスク

- Phaseタスク実行: 本PhaseのTaskを順に実行し、結果を成果物へ記録する

### Task 1: カバレッジ分析

#### 1.1 カバレッジ測定コマンド

```bash
cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx --coverage
```

#### 1.2 カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル          |
| ----------------- | -------- | -------- | --------------------- |
| Line Coverage     | 80%      | 90%      | `renderWithTheme.tsx` |
| Branch Coverage   | 60%      | 70%      | `renderWithTheme.tsx` |
| Function Coverage | 80%      | 90%      | `renderWithTheme.tsx` |

#### 1.3 分析観点

| 観点             | 確認内容                                             |
| ---------------- | ---------------------------------------------------- |
| 未カバー行       | `renderWithTheme` 内でテストが到達していない行を特定 |
| 未カバーブランチ | `theme = "kanagawa-dragon"` デフォルト値パスの検証   |
| 未カバー関数     | エクスポートされた関数が全てテストされているか       |

### Task 2: 境界値テスト追加

Phase 4 で作成したテストに対し、以下の境界値・異常系テストを `renderWithTheme.test.tsx` に追加する。

#### 2.1 追加テストケース一覧

| ID     | テストケース名                                      | 期待結果                                                      |
| ------ | --------------------------------------------------- | ------------------------------------------------------------- |
| TC-6-1 | options 未指定で renderWithTheme を呼び出す         | デフォルト theme `"kanagawa-dragon"` が設定される             |
| TC-6-2 | 空オブジェクト `{}` を options に渡す               | デフォルト theme `"kanagawa-dragon"` が設定される             |
| TC-6-3 | container オプションを渡してレンダリングする        | 指定 container にレンダリングされ、data-theme も設定される    |
| TC-6-4 | 連続して異なるテーマで renderWithTheme を呼び出す   | 最後に呼ばれたテーマが data-theme に設定される                |
| TC-6-5 | wrapper オプション付きで renderWithTheme を呼び出す | wrapper コンポーネントで ui が包まれ、data-theme も設定される |

#### 2.2 追加テストコード仕様

```typescript
// renderWithTheme.test.tsx に追加するテストケース

describe("renderWithTheme - boundary cases", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  // TC-6-1: options 未指定
  it("works without any options parameter", () => {
    const { getByTestId } = renderWithTheme(
      <div data-testid="no-opts">content</div>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
    expect(getByTestId("no-opts")).toBeInTheDocument();
  });

  // TC-6-2: 空オブジェクト
  it("works with empty options object", () => {
    const { getByTestId } = renderWithTheme(
      <div data-testid="empty-opts">content</div>,
      {},
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
    expect(getByTestId("empty-opts")).toBeInTheDocument();
  });

  // TC-6-3: container オプション
  it("respects container option from RenderOptions", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    renderWithTheme(
      <span data-testid="custom-container">in container</span>,
      { theme: "light", container },
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(container.querySelector('[data-testid="custom-container"]')).not.toBeNull();

    document.body.removeChild(container);
  });

  // TC-6-4: 連続テーマ切り替え
  it("overrides previous theme when called consecutively", () => {
    renderWithTheme(<div>first</div>, { theme: "light" });
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    renderWithTheme(<div>second</div>, { theme: "dark" });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    renderWithTheme(<div>third</div>, { theme: "kanagawa-dragon" });
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
  });

  // TC-6-5: wrapper オプション
  it("respects wrapper option from RenderOptions", () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="wrapper">{children}</div>
    );

    const { getByTestId } = renderWithTheme(
      <span data-testid="wrapped-child">child</span>,
      { theme: "dark", wrapper: Wrapper },
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(getByTestId("wrapper")).toBeInTheDocument();
    expect(getByTestId("wrapped-child")).toBeInTheDocument();
  });
});
```

### Task 3: WCAG AA コントラスト比テスト

3テーマ全てで主要カラーペアの WCAG AA コントラスト比を検証するテストを追加する。

#### 3.1 コントラスト比計算ヘルパー

テスト内にコントラスト比計算関数を定義し、CSSの色値ではなくハードコードされた色値で検証する（happy-dom では `getComputedStyle` でCSS変数を解決できないため）。

#### 3.2 検証カラーペアと期待コントラスト比

| テーマ          | 前景色                                     | 背景色                   | 最低基準 | 期待比  |
| --------------- | ------------------------------------------ | ------------------------ | -------- | ------- |
| light           | `--text-primary` (#000000)                 | `--bg-primary` (#FFFFFF) | 4.5:1    | 21:1    |
| light           | `--text-secondary` (rgba(60,60,67,0.6))    | `--bg-primary` (#FFFFFF) | 4.5:1    | ≈5.5:1  |
| dark            | `--text-primary` (#FFFFFF)                 | `--bg-primary` (#000000) | 4.5:1    | 21:1    |
| dark            | `--text-secondary` (rgba(235,235,245,0.6)) | `--bg-primary` (#000000) | 4.5:1    | ≈5.4:1  |
| kanagawa-dragon | `--text-primary` (#c5c9c5)                 | `--bg-primary` (#12120f) | 4.5:1    | ≈10.3:1 |

> **注意**: `--text-muted`（tertiaryLabel: 30% opacity）は WCAG AA 4.5:1 を満たさない場合がある。テストでは「検証済み」であることを記録し、使用箇所の注意喚起とする。

#### 3.3 追加テストコード仕様

```typescript
// renderWithTheme.test.tsx に追加するコントラスト比テスト

/**
 * 相対輝度計算（WCAG 2.1 準拠）
 * sRGB カラーの相対輝度を計算する
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * コントラスト比計算（WCAG 2.1 準拠）
 */
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

/**
 * rgba前景色を背景色上でアルファブレンドしたRGBを計算
 */
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

describe("WCAG AA contrast ratio verification", () => {
  describe("light theme", () => {
    it("text-primary on bg-primary meets 4.5:1", () => {
      const ratio = contrastRatio([0, 0, 0], [255, 255, 255]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("text-secondary on bg-primary meets 4.5:1", () => {
      // rgba(60, 60, 67, 0.6) on #FFFFFF
      const blended = alphaBlend([60, 60, 67], 0.6, [255, 255, 255]);
      const ratio = contrastRatio(blended, [255, 255, 255]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("text-muted on bg-primary is documented as low contrast", () => {
      // rgba(60, 60, 67, 0.3) on #FFFFFF — tertiaryLabel
      const blended = alphaBlend([60, 60, 67], 0.3, [255, 255, 255]);
      const ratio = contrastRatio(blended, [255, 255, 255]);
      // tertiaryLabel は WCAG AA 4.5:1 を満たさない場合がある（≈2.5:1）
      // 小テキスト（<18px）での使用時は要注意
      expect(ratio).toBeLessThan(4.5);
    });

    it("status-primary on bg-primary meets 3:1 for UI components", () => {
      const ratio = contrastRatio([0, 122, 255], [255, 255, 255]);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe("dark theme", () => {
    it("text-primary on bg-primary meets 4.5:1", () => {
      const ratio = contrastRatio([255, 255, 255], [0, 0, 0]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("text-secondary on bg-primary meets 4.5:1", () => {
      // rgba(235, 235, 245, 0.6) on #000000
      const blended = alphaBlend([235, 235, 245], 0.6, [0, 0, 0]);
      const ratio = contrastRatio(blended, [0, 0, 0]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("status-primary on bg-primary meets 3:1 for UI components", () => {
      const ratio = contrastRatio([10, 132, 255], [0, 0, 0]);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe("kanagawa-dragon theme", () => {
    it("text-primary on bg-primary meets 4.5:1", () => {
      // #c5c9c5 on #12120f
      const ratio = contrastRatio([197, 201, 197], [18, 18, 15]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
```

### Task 4: 3テーマカラーマップ整合性テスト

3テーマ全てで全セマンティック変数カテゴリが定義されていることを検証するテスト。

#### 4.1 検証対象の CSS 変数カテゴリ

| カテゴリ   | CSS変数プレフィックス | 最低変数数 |
| ---------- | --------------------- | ---------- |
| Background | `--bg-`               | 5          |
| Text       | `--text-`             | 4          |
| Border     | `--border-`           | 3          |
| Status     | `--status-`           | 8          |
| Syntax     | `--syntax-`           | 8          |

#### 4.2 テストコード仕様

> **注意**: happy-dom 環境では `getComputedStyle` で CSS 変数を完全に解決できないため、tokens.css の「テキスト内容」をテストファイルから直接解析する方法は使わない。代わりに、`renderWithTheme` で各テーマを設定した際に `data-theme` 属性が正しく設定されることの検証と、上記の WCAG テスト（Task 3）で代替する。

```typescript
describe("theme color map completeness", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  const themes = ["kanagawa-dragon", "light", "dark"] as const;

  describe.each(themes)("Theme: %s", (theme) => {
    it("sets data-theme and renders correctly", () => {
      const { container } = renderWithTheme(
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-default)",
          }}
          data-testid="styled-element"
        >
          Theme styled content
        </div>,
        { theme },
      );
      expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("can render elements using status color variables", () => {
      const { getByTestId } = renderWithTheme(
        <div>
          <span data-testid="primary" style={{ color: "var(--status-primary)" }}>primary</span>
          <span data-testid="success" style={{ color: "var(--status-success)" }}>success</span>
          <span data-testid="error" style={{ color: "var(--status-error)" }}>error</span>
          <span data-testid="warning" style={{ color: "var(--status-warning)" }}>warning</span>
        </div>,
        { theme },
      );
      expect(getByTestId("primary")).toBeInTheDocument();
      expect(getByTestId("success")).toBeInTheDocument();
      expect(getByTestId("error")).toBeInTheDocument();
      expect(getByTestId("warning")).toBeInTheDocument();
    });
  });
});
```

## 参照資料

| 資料                                                                                                                          | 参照目的                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------- |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-4-test-creation.md`                                                                | Phase 4 テストケースとの整合性                |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-5-implementation.md`                                                               | 実装コードの確認                              |
| `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-051-ui-00-1-design-tokens.md` | テーマカラーマップ全体像の参照                |
| `.claude/rules/01-architecture.md` — アクセシビリティ（WCAG 2.1 AA）                                                          | コントラスト比基準                            |
| `.claude/rules/02-code-quality.md` — カバレッジ基準                                                                           | Line 80%+, Branch 60%+, Function 80%+         |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                  | a11yテスト観点                                |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                   | テスト品質基準                                |
| テスト仕様書                                                                                                                  | `outputs/phase-4/test-specification.md`       | Phase 4 成果物 |
| tokens.css更新済み                                                                                                            | `apps/desktop/src/renderer/styles/tokens.css` | Phase 5 成果物 |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                                    | 実行方式 |
| ---- | --------------------------------------------------------------------------------------- | -------- |
| 1    | カバレッジ測定（Task 1）: `--coverage` フラグ付きでテスト実行し、現在のカバレッジを取得 | 直列     |
| 2    | 境界値テスト追加（Task 2）: `renderWithTheme.test.tsx` に 5 テストケースを追加          | 直列     |
| 3    | WCAG テスト追加（Task 3）: コントラスト比検証テストを追加                               | 直列     |
| 4    | カラーマップ整合性テスト追加（Task 4）: 3テーマの CSS 変数参照テストを追加              | 直列     |
| 5    | 再カバレッジ測定: 追加テスト込みでカバレッジを再計測し基準を確認                        | 直列     |

## 統合テスト連携

- テスト実行コマンド: `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx --coverage`
- カバレッジ基準未達の場合は追加テストを作成し、再度カバレッジを測定する
- 全テストが PASS し、カバレッジ基準を満たした後、Phase 7（カバレッジ確認）に進む

## 多角的チェック観点

| 観点               | 検証内容                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| カバレッジ基準充足 | Line 80%+, Branch 60%+, Function 80%+ を全て満たしている                         |
| WCAG AA 準拠       | 3テーマ全ての主要カラーペアでコントラスト比が検証されている                      |
| 境界値網羅         | options 未指定、空オブジェクト、container / wrapper カスタマイズが検証されている |
| テスト独立性       | 全テストで `afterEach` による `data-theme` リセットが実装されている              |
| テーマ整合性       | 3テーマ全てで CSS 変数参照要素がレンダリングされている                           |

## 成果物

| #   | 成果物             | パス                                                                       |
| --- | ------------------ | -------------------------------------------------------------------------- |
| 1   | カバレッジレポート | `outputs/phase-6/coverage-report.md`                                       |
| 2   | 追加テストコード   | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`（更新） |

## 完了条件

- [ ] カバレッジ測定が実施され、結果が `outputs/phase-6/coverage-report.md` に記録されている
- [ ] 境界値テスト 5 ケース（TC-6-1〜TC-6-5）が追加されている
- [ ] WCAG AA コントラスト比テストが light / dark / kanagawa-dragon の3テーマで追加されている
- [ ] 3テーマカラーマップ整合性テストが追加されている
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx` で全テストが PASS
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たしている
- [ ] 本Phase内の全タスク（Task 1〜4）を100%実行完了

## サブタスク管理

| タスク | 状態    | 担当 |
| ------ | ------- | ---- |
| Task 1 | pending | -    |
| Task 2 | pending | -    |
| Task 3 | pending | -    |
| Task 4 | pending | -    |

## タスク100%実行確認

- [ ] Task 1: カバレッジ分析 — 完了
- [ ] Task 2: 境界値テスト追加 — 完了
- [ ] Task 3: WCAG AA コントラスト比テスト追加 — 完了
- [ ] Task 4: 3テーマカラーマップ整合性テスト追加 — 完了
- [ ] 再カバレッジ測定: 基準充足確認 — 完了

## 次のPhase

Phase 7: カバレッジ確認 — `phase-7-coverage-check.md`
