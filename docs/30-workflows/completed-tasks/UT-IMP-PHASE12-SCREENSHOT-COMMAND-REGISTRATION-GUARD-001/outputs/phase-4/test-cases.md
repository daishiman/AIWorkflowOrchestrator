# Phase 4 テストケース

## 正常系

| TC-ID | 観点              | 手順                          | 期待値                                           |
| ----- | ----------------- | ----------------------------- | ------------------------------------------------ |
| TC-01 | scriptsキー存在   | package.json 読み出し         | `screenshot:skill-import-idempotency-guard` 存在 |
| TC-02 | scripts値一致     | package.json 読み出し         | value が対象 script と一致                       |
| TC-03 | Phase 11 文書同期 | manual-test-result 検索       | 新コマンド表記あり                               |
| TC-04 | Phase 12 文書同期 | spec-update-summary 検索      | 新コマンド表記あり                               |
| TC-05 | screenshot 実行   | `pnpm ... run screenshot:...` | TC-01..04 画像更新                               |
| TC-06 | coverage          | validator 実行                | PASS                                             |

## 失敗系

| FC-ID | 条件           | 期待失敗                 |
| ----- | -------------- | ------------------------ |
| FC-01 | scripts未登録  | run一覧で対象が非表示    |
| FC-02 | scripts値誤り  | screenshot実行失敗       |
| FC-03 | 旧コマンド残存 | 文書レビューで差分不整合 |
