# Phase 2 設計判断記録

| 案  | 内容                                                            | 判定 | 理由                                                              |
| --- | --------------------------------------------------------------- | ---- | ----------------------------------------------------------------- |
| A   | capture script から CLI wrapper を child process 実行する       | 破棄 | stdout/exit code 依存になり、capture 側で契約を再解釈するため     |
| B   | shared core を正本にし、wrapper と capture が同じ結果構造を使う | 採用 | 判定の単一正本化、テスト容易性、metadata 再利用性が高い           |
| C   | `phase11-static-server.mjs` に orchestration まで持たせる       | 破棄 | localhost helper の責務が肥大化し、workflow 固有 logic が混入する |

## 補足

- `esbuild` transform を native bucket の probe に採用する。
- `build` と `harness` は別 bucket に分離し、`out/renderer` 欠落と build input 登録漏れを区別する。
- baseUrl は loopback のみ auto serve 対象にし、remote URL は fail fast にする。
