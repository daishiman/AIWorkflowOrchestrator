# Phase 5 実装サマリー

## 実装対象

| ファイル                                                                         | 変更内容                                                              |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/desktop/scripts/phase11-current-build-preflight-core.mjs`                  | 4 bucket 判定、guidance、blocked、auto serve、cleanup を実装          |
| `apps/desktop/scripts/phase11-current-build-preflight.mjs`                       | thin CLI wrapper、argv 解析、JSON / write / exit code 変換を実装      |
| `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | shared preflight を実行し、metadata に `preflight` を保存するよう変更 |
| `apps/desktop/package.json`                                                      | `preflight:light-theme-contrast-guard` を追加                         |
| `apps/desktop/scripts/phase11-current-build-preflight-core.test.ts`              | core contract test を追加                                             |
| `apps/desktop/scripts/phase11-current-build-preflight.test.ts`                   | CLI smoke + no-duplication test を追加                                |

## 除外対象

- `ThemeSelector` / `AuthView` / `WorkspaceSearchPanel` の色修正
- native dependency 修復タスク自体の一般化
- commit / PR / Issue 操作

## 実装後の実測

| 観点                | 結果                                             |
| ------------------- | ------------------------------------------------ |
| targeted tests      | 11/11 PASS                                       |
| build               | PASS                                             |
| preflight success   | 4 bucket `pass`, `autoServed=true`               |
| capture integration | screenshot 5件取得、metadata に `preflight` 保存 |

## 補足

- `native` bucket は bare import ではなく `vite` が使う `esbuild` 依存を解決するよう調整した。
- capture script は fail 時に screenshot を開始せず、metadata を残して終了する。
