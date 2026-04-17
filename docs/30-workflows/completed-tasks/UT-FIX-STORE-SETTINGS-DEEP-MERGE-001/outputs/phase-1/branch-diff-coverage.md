# ブランチ差分カバレッジ

## 変更対象ファイル

| ファイル                                          | 変更内容                                             | テスト対象              |
| ------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| `apps/desktop/src/main/ipc/storeHandlers.ts`      | `deepMerge` 関数追加・`settings:update` ハンドラ修正 | `storeHandlers.test.ts` |
| `apps/desktop/src/main/ipc/storeHandlers.test.ts` | TC-01〜TC-12 テストケース追加                        | -                       |

## テスト対応表

| テストケース                        | 変更箇所                       | AC   |
| ----------------------------------- | ------------------------------ | ---- |
| TC-01: ネスト部分更新フィールド保持 | `deepMerge` 再帰処理           | AC-1 |
| TC-02: トップレベル上書き           | `deepMerge` プリミティブ上書き | AC-2 |
| TC-03: 配列上書き                   | `deepMerge` 配列判定           | AC-5 |
| TC-04: null 上書き                  | `deepMerge` null 判定          | AC-1 |
| TC-05: 存在しない子キー追加         | `deepMerge` 再帰処理           | AC-1 |
| TC-06: 3 階層ネスト                 | `deepMerge` 再帰処理           | AC-1 |
| TC-07: 空オブジェクト patch         | `deepMerge` 空オブジェクト処理 | AC-1 |
| TC-08: 空子オブジェクト patch       | `deepMerge` 空オブジェクト処理 | AC-1 |
| TC-09: undefined 省略               | `deepMerge` 省略処理           | AC-1 |
| TC-10: update/get 往復              | `registerUserSettingsHandlers` | AC-2 |
| TC-11: 非 plain object 拒否         | 入力検証                       | AC-6 |
| TC-12: prototype pollution 防止     | 危険キー除外                   | AC-7 |
