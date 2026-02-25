# Phase 4 回帰ケース一覧

| Case ID | 観点                  | 入力                      | 期待結果                                       |
| ------- | --------------------- | ------------------------- | ---------------------------------------------- | ------ |
| RC-01   | login正常             | `{ provider: "google" }`  | `{ success: true }`                            |
| RC-02   | login異常             | `{ provider: "invalid" }` | `success:false` + `INVALID_PROVIDER`           |
| RC-03   | logout                | なし                      | `success:true` or 既存失敗形式                 |
| RC-04   | get-session           | なし                      | `IPCResponse<AuthSession                       | null>` |
| RC-05   | refresh               | なし                      | `IPCResponse<AuthSession>` or `REFRESH_FAILED` |
| RC-06   | check-online          | なし                      | `{ success:true, data:{ online:boolean } }`    |
| RC-07   | fallback login        | なし                      | `AUTH_NOT_CONFIGURED`                          |
| RC-08   | fallback get-session  | なし                      | `{ success:true, data:null }`                  |
| RC-09   | fallback check-online | なし                      | `{ success:true, data:{ online:boolean } }`    |
| RC-10   | 登録一元化            | 登録処理実行              | 5チャネルが過不足なく登録される                |
