# Phase 8 成果物: リファクタリング計画

## 実施した整理

| 項目                      | 内容                                                                                                    | 判断   |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| dedicated harness 抽出    | `LightThemeSharedColorMigrationReviewHarness` を追加し、App shell を経由しない visual review 入口を分離 | 実施   |
| entrypoint 分離           | `phase11-light-theme-shared-color-migration.*` を追加し、Phase 11 専用 entry を分離                     | 実施   |
| `main.tsx` の graph 縮小  | `App` / `WorkspaceView` を `React.lazy` 化し、Phase 11 harness の不要読み込みを抑制                     | 実施   |
| 共通 style helper 化      | token 適用は既存 className 置換で完結し、helper 新設は scope 拡大になるため見送り                       | 見送り |
| repo-wide color migration | current task の shared light theme 対象外まで広げると SoC を崩すため見送り                              | 見送り |

## helper 化しなかった理由

- `ThemeSelector`、`LocaleSelector`、`TimezoneSelector`、`WorkspaceSearchPanel` は view/organism ごとに state density が異なる
- 今回は semantic token の適用が主目的であり、style helper 抽出よりも token contract への置換が優先だった
- helper 化すると別 task で扱うべき token policy まで current task が抱え込みやすい

## Phase 11 supporting refactor

- capture script は safe temp build を使い、current worktree source を固定した
- `packages/shared` を safe temp 配下へ複製し、renderer build 時の型参照 drift を避けた
- `scheduler` と `auth-mode` を alias 補正し、preview source の揺れを封じた

## 残すべき境界

1. token 定義の変更は依存元 task の責務
2. component ごとの color 置換と screenshot capture infrastructure は別 concern として管理する
3. repo-wide hardcoded color audit は regression guard task へ引き継ぐ
