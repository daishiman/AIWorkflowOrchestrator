# Phase 4 テスト仕様

## 対象

| 層        | ファイル                                                            | 目的                                                                                 |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| core unit | `apps/desktop/scripts/phase11-current-build-preflight-core.test.ts` | 4 bucket と blocked 契約を固定する                                                   |
| CLI smoke | `apps/desktop/scripts/phase11-current-build-preflight.test.ts`      | `--json` / `--write` / `--base-url` / `--no-auto-serve` と no-duplication を固定する |

## core test case

| ケース              | 期待結果                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| success             | 4 bucket が `pass`、`bundleName=phase11-current-build-preflight`         |
| native mismatch     | `native=fail`、残り 3 bucket は `blocked`、exit code 10                  |
| build missing       | `build=fail`、`harness` / `baseUrl` は `blocked`、build command guidance |
| harness missing     | `harness=fail`、`baseUrl=blocked`、`electron.vite.config.ts` guidance    |
| baseUrl auto-serve  | `baseUrl=pass`、`autoServed=true`                                        |
| baseUrl unreachable | `baseUrl=fail`、exit code 40、`--base-url` guidance                      |

## wrapper / integration test case

| ケース                           | 期待結果                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--json`                         | JSON がそのまま出力される                                                                                                      |
| `--write`                        | 指定先へ JSON が書き込まれる                                                                                                   |
| `--base-url` + `--no-auto-serve` | core へ option が正しく伝播する                                                                                                |
| capture no-duplication           | capture script が `runPhase11CurrentBuildPreflight` を使い、`probeStaticServer` / `startRendererStaticServer` 直呼びを持たない |

## 実装前 gate

- remediation task の UI 修正はテスト対象に入れない
- package script 名は `preflight:light-theme-contrast-guard` に固定する
