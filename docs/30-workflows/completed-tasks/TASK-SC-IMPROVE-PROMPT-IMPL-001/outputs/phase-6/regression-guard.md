# 回帰ガード

## 確認項目

| 観点              | 確認方法                          | 結果           |
| ----------------- | --------------------------------- | -------------- |
| create モード回帰 | TC-09                             | ✓ PASS         |
| update モード回帰 | TC-10                             | ✓ PASS         |
| progress 順序     | TC-08 / progress.test.ts TC-11-13 | ✓ PASS         |
| abort 挙動        | TC-05, TC-07                      | ✓ PASS         |
| 既存 202 テスト   | 全件実行                          | ✓ 202/202 PASS |

## progress.test.ts 修正内容

`beforeEach` に `executeJson.mockResolvedValue({ suggestions: [] })` を追加。
これにより `improve-prompt` モードの `improveSkill()` フォールバックが正常終了するようになった。
他モードのテストへの影響なし（各テストが必要に応じて `executeJson` を上書きするため）。
