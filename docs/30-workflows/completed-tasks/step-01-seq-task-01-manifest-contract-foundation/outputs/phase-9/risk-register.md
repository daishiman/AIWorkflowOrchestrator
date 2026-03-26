# Risk Register

| ID   | 種別       | 内容                                                         | 対応                                             |
| ---- | ---------- | ------------------------------------------------------------ | ------------------------------------------------ |
| R-01 | tooling    | Vitest が `esbuild` version mismatch で起動しない            | 依存再構築後に `ManifestLoader.test.ts` を再実行 |
| R-02 | downstream | Task02/03/04 が hook 実行 semantics を別途定義する必要がある | 本 task では contract だけ固定                   |
