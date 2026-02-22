# Phase 4: テストケース一覧 — TASK-UI-00-TOKENS

## renderWithTheme テストヘルパー

| #   | テストケース                                        | テーマ           | 期待結果                                              |
| --- | --------------------------------------------------- | ---------------- | ----------------------------------------------------- |
| 1   | sets data-theme attribute on documentElement        | kanagawa-dragon  | `data-theme="kanagawa-dragon"` が設定される           |
| 2   | renders child elements in the DOM                   | kanagawa-dragon  | 子要素がDOMに存在し内容が一致                         |
| 3   | sets data-theme attribute on documentElement        | light            | `data-theme="light"` が設定される                     |
| 4   | renders child elements in the DOM                   | light            | 子要素がDOMに存在し内容が一致                         |
| 5   | sets data-theme attribute on documentElement        | dark             | `data-theme="dark"` が設定される                      |
| 6   | renders child elements in the DOM                   | dark             | 子要素がDOMに存在し内容が一致                         |
| 7   | defaults to kanagawa-dragon when no theme specified | (未指定)         | `data-theme="kanagawa-dragon"` がデフォルト設定       |
| 8   | returns RenderResult with standard query methods    | (デフォルト)     | getByTestId, queryByTestId, container, unmount が存在 |
| 9   | cleans up data-theme attribute after each test      | (クリーンアップ) | `data-theme` 属性が `null`                            |

## テスト実行結果

```
 ✓ src/renderer/tests/helpers/renderWithTheme.test.tsx (9 tests) 64ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```
