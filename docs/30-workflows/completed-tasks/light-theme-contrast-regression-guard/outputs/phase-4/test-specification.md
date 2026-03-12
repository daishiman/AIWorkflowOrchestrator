# Phase 4 テスト仕様

## 目的

`light-theme-contrast-regression-guard` を guard task として成立させるため、audit・capture・documentation bridge の Red 条件を固定する。

## テストレイヤー

| レイヤー             | 対象                                          | 実装先                                                                           | Red 条件                                           |
| -------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| Audit helper         | hardcoded color hit / ignore / bucket split   | `apps/desktop/scripts/light-theme-contrast-guard.test.ts`                        | `current` と `baseline` が混線しない               |
| Harness selector     | Settings / Dashboard / Auth / WorkspaceSearch | `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | current build から selector-based capture ができる |
| Component readiness  | `data-testid` 契約                            | `ThemeSelector.test.tsx`, `AuthView.test.tsx`                                    | ready selector が欠落しない                        |
| Documentation bridge | TC-ID ↔ screenshot ↔ issue handoff            | `outputs/phase-11/*`, `outputs/phase-12/*`                                       | coverage validator / guide validator を通せる      |

## テストケース定義

| ID        | 観点                    | 入力                              | 期待結果                                                     |
| --------- | ----------------------- | --------------------------------- | ------------------------------------------------------------ |
| T4-AUD-01 | baseline split          | `ThemeSelector/index.tsx`         | `baseline` に分類される                                      |
| T4-AUD-02 | current split           | `SettingsView/index.tsx`          | `current` に分類され、現状 0 件を維持する                    |
| T4-AUD-03 | exclusion               | `.test.tsx`, `phase11-*.tsx`      | audit 対象外になる                                           |
| T4-AUD-04 | summary                 | hit 一覧                          | `currentViolations` / `baselineViolations` / `byFile` を返す |
| T4-SEL-01 | Settings capture        | `settings-view` selector          | current build で要素 screenshot を取得できる                 |
| T4-SEL-02 | Dashboard capture       | `dashboard-view` selector         | light / dark 比較ができる                                    |
| T4-SEL-03 | Auth capture            | `auth-view-panel` selector        | panel 単位の screenshot を取得できる                         |
| T4-SEL-04 | WorkspaceSearch capture | `workspace-search-panel` selector | preCapture 後に result row を含めて取得できる                |
| T4-DOC-01 | Phase 11 coverage       | `manual-test-result.md`           | TC-ID と png が 1:1 で結び付く                               |
| T4-DOC-02 | Phase 12 guide          | `implementation-guide.md`         | Part 1 / Part 2 / 型 / CLI / edge case を満たす              |

## Red 完了条件

1. audit helper の bucket 判定がテストで固定されている。
2. Phase 11 harness が current build から 5 ケースの route / selector を再現できる。
3. `ThemeSelector` と `AuthView` が ready selector を expose する。
4. Phase 11 / 12 validator が期待する literal 名称を outputs に反映できる。

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  scripts/light-theme-contrast-guard.test.ts \
  src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx \
  src/renderer/views/AuthView/AuthView.test.tsx
```

## Phase 5 への引き継ぎ

- config 集約は `light-theme-contrast-guard.config.mjs` に寄せる。
- capture route は `phase11-light-theme-contrast-guard.html` を build input に登録する。
- UI 修正は行わず、test id と harness 導線のみ追加する。
