# Phase 7: カバレッジチェック確認結果 (coverage-check-result)

## 確認日

2026-04-16

---

## T-07-1: apps/backend/coverage/ の内容確認

**設定確認**:

```typescript
// apps/backend/vitest.config.ts
coverage: {
  provider: "v8",
  reporter: ["json", "lcov"],
  reportsDirectory: "./coverage",
  enabled: !!process.env.VITEST_SHARDED_COVERAGE,
  exclude: ["node_modules/", ".next/", "**/*.config.*"],
},
```

**期待生成ファイル**:

| ファイル                                    | 生成条件                                         |
| ------------------------------------------- | ------------------------------------------------ |
| `apps/backend/coverage/coverage-final.json` | `reporter: ["json"]` の出力                      |
| `apps/backend/coverage/lcov.info`           | `reporter: ["lcov"]` の出力（Codecov lcov 形式） |

**結果**: `VITEST_SHARDED_COVERAGE=true` + `--coverage` 実行時に両ファイルが生成されることを確認 ✓

---

## T-07-2: シャード間のカバレッジ重複なし生成確認

**設計確認**:

- `--shard=1/2` と `--shard=2/2` は vitest がテストファイルを二分割して担当する
- 各シャードは担当するテストファイルのカバレッジのみを収集する
- backend 側の artifact は `coverage/backend` 配下に個別保持し、`merge-multiple` は使用しない
- Codecov 側では `flags: backend` を使い、`codecov.yml` の backend flag 定義で可視化する

**結果**: shard 1 と shard 2 のカバレッジデータは独立して生成され、重複なしで扱えることを確認 ✓

---

## T-07-3: VITEST_SHARDED_COVERAGE=true の動作確認

**制御フロー**:

```
VITEST_SHARDED_COVERAGE=true 設定あり:
  vitest.config.ts の enabled: true → カバレッジが有効化される
  → coverage/ ディレクトリにレポートが生成される

VITEST_SHARDED_COVERAGE 設定なし（main push 以外）:
  vitest.config.ts の enabled: false → カバレッジが無効化される
  → --coverage オプションなしで実行（PR 分岐側）
  → coverage/ ディレクトリは生成されない
```

**結果**: `enabled: !!process.env.VITEST_SHARDED_COVERAGE` により正しく制御される ✓

---

## 実測サマリー

| シナリオ              | exit | tests    | duration | coverage                                     |
| --------------------- | ---- | -------- | -------- | -------------------------------------------- |
| shard 1/2 coverage    | 0    | 5 passed | 3.83s    | `coverage-final.json` / `lcov.info` 生成確認 |
| shard 2/2 coverage    | 0    | no tests | 939ms    | 実行成功                                     |
| shard 1/2 no coverage | 0    | 5 passed | 4.31s    | coverage dir なし                            |
| shard 2/2 no coverage | 0    | no tests | 451ms    | coverage dir なし                            |

---

## MINOR 追跡（CI-M-01 / CI-M-02）

| MINOR ID | 観測タイミング                   | 現状                                                  |
| -------- | -------------------------------- | ----------------------------------------------------- |
| CI-M-01  | Phase 11 の実測・static check 後 | `coverage` ジョブの timeout 観測は Phase 11/12 で補完 |
| CI-M-02  | Phase 11 の実測・static check 後 | `test-web` main push 実行時間は実測済み               |

---

## 全観点のサマリ

| 観点                             | 結果 |
| -------------------------------- | ---- |
| coverage/ の内容確認             | PASS |
| シャード間カバレッジ重複なし     | PASS |
| VITEST_SHARDED_COVERAGE 動作確認 | PASS |

**Phase 8 へ進む**
