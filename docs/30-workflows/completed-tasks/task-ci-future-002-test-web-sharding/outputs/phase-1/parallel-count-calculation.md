# 並列数計算シート

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 現状（TASK-CI-FUTURE-002 実装前）

| ジョブ名     | 並列数 | 備考                          |
| ------------ | ------ | ----------------------------- |
| test-desktop | 17     | matrix shard: [1..17]         |
| typecheck    | 1      | 単一ジョブ                    |
| test-shared  | 1      | 単一ジョブ                    |
| e2e-desktop  | 1      | 単一ジョブ                    |
| **合計**     | **20** | GitHub Free Tier 上限 = 20 ✅ |

※ `lint`、`security`、`check-module-sync`、`coverage`、`build` は上記と独立して実行されるか後続ジョブであるため、同時実行数の計算から除外。

## 計画後（TASK-CI-FUTURE-002 実装後・案 A）

```
test-web シャード数 = 20 - (test-desktop_shards + typecheck + test-shared + e2e-desktop)
                   = 20 - (15 + 1 + 1 + 1)
                   = 20 - 18
                   = 2
```

| ジョブ名     | 並列数 | 備考                                  |
| ------------ | ------ | ------------------------------------- |
| test-desktop | 15     | matrix shard: [1..15]（17→15 に削減） |
| test-web     | 2      | matrix shard: [1, 2]（新規追加）      |
| typecheck    | 1      | 変更なし                              |
| test-shared  | 1      | 変更なし                              |
| e2e-desktop  | 1      | 変更なし                              |
| **合計**     | **20** | GitHub Free Tier 上限 = 20 ✅         |

## 対応案の比較

| 対応案       | test-desktop | test-web | 合計          | 上限遵守 | 採用 |
| ------------ | ------------ | -------- | ------------- | -------- | ---- |
| 案 A（採用） | 15           | 2        | 15+2+1+1+1=20 | OK       | ✅   |
| 案 B         | 14           | 3        | 14+3+1+1+1=20 | OK       | —    |
| 案 C         | 13           | 4        | 13+4+1+1+1=20 | OK       | —    |

**採用理由**: test-backend は現在テストファイルが1件のため、2シャードで十分。test-desktop のシャード削減は最小限（17→15）に抑える。
