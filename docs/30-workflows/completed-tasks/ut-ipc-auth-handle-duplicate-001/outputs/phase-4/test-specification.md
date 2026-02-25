# Phase 4 テスト仕様

## 1. 目的

登録一元化後も `AUTH_*` IPC契約が不変であることを保証する。

## 2. テストカテゴリ

| カテゴリ | 目的               | 代表ケース                                  |
| -------- | ------------------ | ------------------------------------------- |
| 正常系   | 既存フロー維持     | `AUTH_LOGIN` 成功、`AUTH_CHECK_ONLINE` 成功 |
| 異常系   | エラー契約維持     | 不正providerで `INVALID_PROVIDER`           |
| 境界値   | 登録漏れ/重複防止  | 5チャネルが過不足なく登録される             |
| fallback | 非Supabase環境互換 | login/logout/refresh が not-configured 応答 |

## 3. 追加予定ケース

- TC-RG-01: `registerAuthHandlers` 実行後に5チャネル全てが登録される
- TC-RG-02: `AUTH_LOGIN` の不正providerエラー形式が不変
- TC-RG-03: fallback登録で `AUTH_GET_SESSION` が `success:true,data:null`
- TC-RG-04: fallback登録で `AUTH_CHECK_ONLINE` が `{ online: boolean }`
- TC-RG-05: fallback登録で not-configured エラー構造が不変

## 4. 判定基準

- 既存 authHandlers テストがPASS
- 新規 fallback テストがPASS
- 契約破壊（引数/戻り値/エラー形式）なし
