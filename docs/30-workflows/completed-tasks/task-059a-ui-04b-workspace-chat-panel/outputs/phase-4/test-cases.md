# Phase 4 テストケース一覧

| TC    | 種別                 | 期待                        |
| ----- | -------------------- | --------------------------- |
| TC-A1 | 初期表示             | `chat-only` で表示される    |
| TC-A2 | file toggle          | file panel を表示できる     |
| TC-A3 | mobile overlay       | 800pxで dialog 表示         |
| TC-A4 | file select          | status bar と read が更新   |
| TC-A5 | attach selected      | `addFiles()` へ追加される   |
| TC-A6 | mention select       | 背景情報追加 + preview 表示 |
| TC-A7 | stream success       | assistant 表示 + 保存       |
| TC-A8 | context menu preview | メニューから preview 表示   |
| TC-A9 | file read fail       | status bar error 表示       |
| TC-H1 | mention open         | `@app` で候補表示           |
| TC-H2 | mention move         | 上下キーで循環              |
| TC-H3 | mention reject       | `abc@app` は候補を開かない  |
| TC-U1 | file selection       | `.ts` MIME 推定             |
| TC-U2 | no extension         | `.txt` fallback             |
