# Phase 11 スクリーンショット計画

## 目的

`ViewType` 追加（`skillAnalysis` / `skillCreate`）と `renderView()` ルーティング変更が、既存導線を壊さずに描画されることを実画面で確認する。

## 取得対象

| TC-ID    | 画面到達経路                                                        | 待機セレクタ                          | 出力ファイル                                                    |
| -------- | ------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| TC-11-01 | `/advanced/skill-analysis?skipAuth=true`                            | `[data-testid="skill-analysis-view"]` | `screenshots/TC-11-01-renderview-skill-analysis.png`            |
| TC-11-02 | `/advanced/skill-create-wizard?skipAuth=true`                       | `[data-testid="skill-create-wizard"]` | `screenshots/TC-11-02-renderview-skill-create.png`              |
| TC-11-03 | `/?skipAuth=true`                                                   | `[data-testid="dashboard-view"]`      | `screenshots/TC-11-03-renderview-dashboard-regression.png`      |
| TC-11-04 | `/advanced/skill-analysis?skipAuth=true` + close 操作               | `[data-testid="skill-center-view"]`   | `screenshots/TC-11-04-analysis-close-to-skill-center.png`       |
| TC-11-05 | `/advanced/skill-center?skipAuth=true`（legacy alias 正規化到達面） | `[data-testid="skill-center-view"]`   | `screenshots/TC-11-05-legacy-skill-center-alias-normalized.png` |

## 実行コマンド

```bash
node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs
```

## 補助検証

`renderView()` の case 分岐そのものは screenshot だけではなく、以下の unit test で固定する。

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx
```
