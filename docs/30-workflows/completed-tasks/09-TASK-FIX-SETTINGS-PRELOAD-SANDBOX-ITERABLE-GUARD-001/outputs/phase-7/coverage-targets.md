# Phase 7: coverage 目標

## 変更ファイルの coverage 目標

| ファイル                 | Line | Branch | Function | 基準                 |
| ------------------------ | ---- | ------ | -------- | -------------------- |
| ApiKeysSection/index.tsx | 90%  | 70%    | 90%      | 推奨基準             |
| loadProviders 関数       | 100% | 100%   | 100%     | 変更箇所は完全カバー |

## 重点 Branch

| Branch                                  | 条件                     | テストケース           |
| --------------------------------------- | ------------------------ | ---------------------- |
| window.electronAPI?.apiKey 存在チェック | truthy / falsy           | REG-06, REG-07, REG-08 |
| apiKeyApi?.list 存在チェック            | truthy / falsy           | REG-06, REG-07         |
| result?.success チェック                | true / false / undefined | REG-01, REG-02, REG-08 |
| Array.isArray(result.data.providers)    | true / false             | REG-04, REG-05, REG-08 |

## Gap 分析結果

Gap なし（Phase 6 で全ケース追加済み）
