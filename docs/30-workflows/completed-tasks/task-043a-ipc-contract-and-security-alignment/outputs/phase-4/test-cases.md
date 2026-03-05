# Phase 4 テストケース一覧

## 自動テスト

| TC-ID      | 分類         | 観点                                   | 実装箇所                      | 判定 |
| ---------- | ------------ | -------------------------------------- | ----------------------------- | ---- |
| TC-AUTO-01 | 契約         | 空文字/空白/型不正で `ERR_1001`        | `skillHandlers.share.test.ts` | PASS |
| TC-AUTO-02 | セキュリティ | sender拒否で `ERR_2004`                | `skillHandlers.share.test.ts` | PASS |
| TC-AUTO-03 | エラー       | 内部例外で `ERR_5001`                  | `skillHandlers.share.test.ts` | PASS |
| TC-AUTO-04 | 境界         | import導線で `importFromSource` 不呼出 | `skill-api.contract.test.ts`  | PASS |
| TC-AUTO-05 | 契約         | share3チャネル whitelist 登録          | `skill-api.contract.test.ts`  | PASS |
| TC-AUTO-06 | 互換         | errorCode が preload 透過される        | `skill-api.contract.test.ts`  | PASS |

## 手動テスト（Phase11へ引継ぎ）

- TC-11-01: import成功表示
- TC-11-02: `ERR_1001` 表示
- TC-11-03: unauthorized 表示
- TC-11-04: channel boundary（importFromSource=0回）
