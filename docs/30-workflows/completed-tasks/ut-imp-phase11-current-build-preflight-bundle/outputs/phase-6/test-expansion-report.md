# Phase 6 テスト拡充レポート

## 追加した観点

| 観点           | 実装内容                                             | 証跡                                                                |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| CLI option     | `--json`, `--write`, `--base-url`, `--no-auto-serve` | `phase11-current-build-preflight.test.ts`                           |
| metadata       | capture metadata に `preflight` を保持               | `outputs/phase-11/screenshots/source-phase11-capture-metadata.json` |
| guidance       | build / harness / baseUrl fail の JSON 実測を採取    | `failure-*.json`                                                    |
| no-duplication | capture script の source assertion                   | `phase11-current-build-preflight.test.ts`                           |

## Phase 4 からの拡張

- planned case を実コードへ結び、manual failure path の JSON を追加で採取した。
- `autoServed=true` を success path の必須観測値に昇格した。
