# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目          | 値                                                      |
| ------------- | ------------------------------------------------------- |
| タスクID      | TASK-UI-00-TOKENS                                       |
| Phase         | 4                                                       |
| Phase名       | テスト作成（TDD: Red）                                  |
| 前提Phase     | Phase 3（設計レビュー）PASS                             |
| 前Phase成果物 | `outputs/phase-3/design-review.md`                      |
| 実行方式      | 直列（テストシナリオ設計 → テストコード作成 → Red確認） |

## 目的

テストファースト原則に従い、`renderWithTheme` テストヘルパーとテーマ横断テストを先に作成する。この時点では実装コード（tokens.css の light/dark テーマ、renderWithTheme.tsx）は未完成のため、テストは失敗状態（Red）であることが正しい。

## 実行タスク

- Phaseタスク実行: 本PhaseのTaskを順に実行し、結果を成果物へ記録する

### Task 1: テストシナリオ設計

#### 1.1 テスト対象と検証観点

| テスト対象                     | 検証観点                                                                | テスト種別             |
| ------------------------------ | ----------------------------------------------------------------------- | ---------------------- |
| `renderWithTheme` ヘルパー関数 | `data-theme` 属性が `document.documentElement` に設定されること         | ユニットテスト         |
| デフォルトテーマ               | テーマ未指定時に `kanagawa-dragon` が適用されること                     | ユニットテスト         |
| 3テーマレンダリング            | `kanagawa-dragon` / `light` / `dark` 全てで要素がレンダリングされること | パラメタライズドテスト |
| テスト間状態分離               | 各テストの `afterEach` で `data-theme` 属性がリセットされること         | テスト品質             |

#### 1.2 テストケース一覧

| ID     | テストケース名                                | 期待結果                                                                           |
| ------ | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| TC-4-1 | `renderWithTheme` がdata-theme属性を設定する  | `document.documentElement.getAttribute("data-theme")` が指定テーマと一致           |
| TC-4-2 | デフォルトテーマが `kanagawa-dragon` である   | テーマ未指定時に `"kanagawa-dragon"` が設定される                                  |
| TC-4-3 | light テーマでレンダリングできる              | `data-theme="light"` が設定され、子要素が DOM に存在する                           |
| TC-4-4 | dark テーマでレンダリングできる               | `data-theme="dark"` が設定され、子要素が DOM に存在する                            |
| TC-4-5 | kanagawa-dragon テーマでレンダリングできる    | `data-theme="kanagawa-dragon"` が設定され、子要素が DOM に存在する                 |
| TC-4-6 | render結果オブジェクトが返される              | `renderWithTheme` の戻り値が `@testing-library/react` の `RenderResult` 型を満たす |
| TC-4-7 | afterEachでdata-theme属性がリセットされている | テスト完了後に `data-theme` 属性が除去されている                                   |

### Task 2: テストコード作成

#### 2.1 ファイル配置

| ファイル                                                           | 内容                              |
| ------------------------------------------------------------------ | --------------------------------- |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx` | テーマ横断テスト（7テストケース） |

#### 2.2 テストコード仕様

```typescript
// apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx
import { renderWithTheme } from "./renderWithTheme";

describe("renderWithTheme", () => {
  afterEach(() => {
    // P9準拠: テスト間の状態汚染を防止
    document.documentElement.removeAttribute("data-theme");
  });

  // TC-4-1〜TC-4-5: 3テーマでのレンダリング検証（パラメタライズド）
  describe.each(["kanagawa-dragon", "light", "dark"] as const)(
    "Theme: %s",
    (theme) => {
      it("sets data-theme attribute on documentElement", () => {
        renderWithTheme(<div data-testid="test-element">test</div>, { theme });
        expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      });

      it("renders child elements in the DOM", () => {
        const { getByTestId } = renderWithTheme(
          <div data-testid="test-element">test content</div>,
          { theme },
        );
        expect(getByTestId("test-element")).toBeInTheDocument();
        expect(getByTestId("test-element").textContent).toBe("test content");
      });
    },
  );

  // TC-4-2: デフォルトテーマ検証
  it("defaults to kanagawa-dragon when no theme specified", () => {
    renderWithTheme(<div data-testid="default-test">default</div>);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
  });

  // TC-4-6: render結果オブジェクト検証
  it("returns RenderResult with standard query methods", () => {
    const result = renderWithTheme(
      <div data-testid="result-test">result</div>,
    );
    expect(result).toHaveProperty("getByTestId");
    expect(result).toHaveProperty("queryByTestId");
    expect(result).toHaveProperty("container");
    expect(result).toHaveProperty("unmount");
  });

  // TC-4-7: afterEachによる状態リセット検証
  it("cleans up data-theme attribute after each test", () => {
    // このテストは afterEach で data-theme が除去されることを間接的に検証
    // 前のテストでセットされた data-theme が残っていないことを確認
    const currentTheme =
      document.documentElement.getAttribute("data-theme");
    expect(currentTheme).toBeNull();
  });
});
```

#### 2.3 テスト環境制約（P39/P40/P9 準拠）

| 制約                           | 根拠 | 対策                                                                    |
| ------------------------------ | ---- | ----------------------------------------------------------------------- |
| `fireEvent` を使用する         | P39  | happy-dom 環境では `userEvent.setup()` が使用不可                       |
| パッケージディレクトリから実行 | P40  | `cd apps/desktop && pnpm vitest run` で実行                             |
| テスト間状態リセット           | P9   | `afterEach` で `document.documentElement.removeAttribute("data-theme")` |

### Task 3: Red状態の確認

#### 3.1 テスト実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx
```

#### 3.2 期待される失敗理由

| テストケース                     | 失敗理由                                                   |
| -------------------------------- | ---------------------------------------------------------- |
| 全テストケース（TC-4-1〜TC-4-7） | `renderWithTheme` モジュールが存在しないため import エラー |

> **注**: この時点で全テストが `MODULE_NOT_FOUND` エラーで失敗することが TDD Red の正しい状態。

## 参照資料

| 資料                                                                                                                          | 参照目的                             |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-3-design-review.md`                                                                | 設計レビュー結果の確認               |
| `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-051-ui-00-1-design-tokens.md` | テスト対象のヘルパー仕様（Task 4/5） |
| `.claude/rules/06-known-pitfalls.md` — P9, P39, P40                                                                           | テスト環境制約                       |
| `apps/desktop/src/renderer/store/types.ts` — `ResolvedTheme` 型                                                               | テーマ型定義                         |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                  | a11yテスト観点                       |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                   | テスト品質基準                       |

- 依存Phase成果物参照: `phase-1-*`、`phase-2-*`、`phase-3-*`
  | 設計レビュー結果書 | `outputs/phase-3/design-review-result.md` | Phase 3 成果物 |
  | 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
  | アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | Phase 2 成果物 |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                | 実行方式 |
| ---- | ------------------------------------------------------------------- | -------- |
| 1    | テストシナリオ設計（Task 1）: テスト対象・テストケースを確定する    | 直列     |
| 2    | テストコード作成（Task 2）: `renderWithTheme.test.tsx` を作成する   | 直列     |
| 3    | Red状態確認（Task 3）: テスト実行し全テストが失敗することを確認する | 直列     |
| 4    | テスト仕様書（`outputs/phase-4/test-specification.md`）を作成する   | 直列     |

## 統合テスト連携

- テスト実行コマンド: `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx`
- Phase 5（実装）完了後に同一テストを再実行し、全テストが Green になることを検証する
- Phase 6（テスト拡充）で追加テストケースを作成し、カバレッジ基準を満たす

## 多角的チェック観点

| 観点         | 検証内容                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| テスト網羅性 | 3テーマ全てのレンダリングテストが含まれている                            |
| テスト独立性 | `afterEach` で `data-theme` 属性がリセットされ、テスト間の状態汚染がない |
| 環境互換性   | P39（happy-dom）・P40（実行ディレクトリ）の制約が遵守されている          |
| 型安全       | `ResolvedTheme` 型を使用し、無効なテーマ名がコンパイル時に検出される     |
| TDD Red 確認 | 全テストが失敗状態であり、実装前であることが明確                         |

## 成果物

| #   | 成果物           | パス                                                               |
| --- | ---------------- | ------------------------------------------------------------------ |
| 1   | テスト仕様書     | `outputs/phase-4/test-specification.md`                            |
| 2   | テストケース一覧 | `outputs/phase-4/test-cases.md`                                    |
| 3   | テストコード     | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx` |

## 完了条件

- [ ] テストシナリオが設計され、7テストケース（TC-4-1〜TC-4-7）が定義されている
- [ ] `renderWithTheme.test.tsx` が作成されている
- [ ] テスト実行時に全テストが失敗状態（Red）である
- [ ] `afterEach` で `data-theme` 属性リセットが実装されている（P9準拠）
- [ ] テストコードで `userEvent` を使用していない（P39準拠）
- [ ] テスト実行は `cd apps/desktop && pnpm vitest run` で行っている（P40準拠）
- [ ] `outputs/phase-4/test-specification.md` が作成されている
- [ ] 本Phase内の全タスク（Task 1〜3）を100%実行完了

## サブタスク管理

| タスク | 状態    | 担当 |
| ------ | ------- | ---- |
| Task 1 | pending | -    |
| Task 2 | pending | -    |
| Task 3 | pending | -    |

## タスク100%実行確認

- [ ] Task 1: テストシナリオ設計 — 完了
- [ ] Task 2: テストコード作成 — 完了
- [ ] Task 3: Red状態確認 — 完了

## 次のPhase

Phase 5: 実装（TDD: Green）— `phase-5-implementation.md`
