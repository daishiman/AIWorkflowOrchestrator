# 回帰テスト結果

## 実行コマンド

```bash
cd apps/desktop && npx vitest run --reporter=verbose src/main/ipc/storeHandlers.test.ts
```

## 結果サマリー

```
Test Files  1 passed (1)
     Tests  26 passed (26)
```

## テスト内訳

| カテゴリ                                  | ケース数 | 結果          |
| ----------------------------------------- | -------- | ------------- |
| registerStoreHandlers（既存）             | 14       | 全件 PASS     |
| registerUserSettingsHandlers TC-01〜TC-05 | 5        | 全件 PASS     |
| registerUserSettingsHandlers TC-06〜TC-09 | 4        | 全件 PASS     |
| registerUserSettingsHandlers TC-10〜TC-12 | 3        | 全件 PASS     |
| **合計**                                  | **26**   | **全件 PASS** |

## 回帰判定

既存テスト 14 件が引き続き PASS — 回帰なし。`settings:update` の round-trip / validation / prototype pollution guard も PASS。
