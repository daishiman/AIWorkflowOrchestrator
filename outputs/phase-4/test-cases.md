# テストケースコード記録 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## TDD Red確認結果

実行コマンド:

```bash
pnpm --filter @repo/desktop exec vitest run src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

### 結果サマリー

```
Tests  1 failed | 16 passed (17)
```

### RED ケース（期待通りの失敗）

| TC ID | 状態   | 説明                                                                     |
| ----- | ------ | ------------------------------------------------------------------------ |
| TC-01 | RED ✅ | `"0 0 31 2 *"` + semantic=true → null が返る（実装前なので期待通り失敗） |

### GREEN ケース（後方互換が確認）

| TC ID | 状態     | 説明                                                                |
| ----- | -------- | ------------------------------------------------------------------- |
| TC-02 | GREEN ✅ | semantic=true で `"0 0 29 2 *"` → null（options引数無視で後方互換） |
| TC-03 | GREEN ✅ | semantic=true で `"0 0 30 * *"` → null                              |
| TC-04 | GREEN ✅ | semantic=true で `"0 0 * * *"` → null                               |
| TC-05 | GREEN ✅ | semantic=false で `"0 0 31 2 *"` → null（後方互換）                 |
| TC-06 | GREEN ✅ | options未指定で `"0 0 31 2 *"` → null（後方互換）                   |
| TC-07 | GREEN ✅ | semantic=true で `"0 0 31 1,3,5,7,8,10,12 *"` → null                |
| TC-08 | GREEN ✅ | semantic=true で `"0 0 31 2 1"` → null                              |

既存テスト SCV-01〜SCV-12: 全件 PASS（回帰なし）

## Phase 5 への引き継ぎ

- TC-01 は現在 RED。Phase 5 で `cron-parser` を使い semantic validation を実装することで GREEN にする
- TC-02〜TC-08 は GREEN を維持すること（`options.semantic !== true` の後方互換 + 到達可能ケース）

> 補足: Phase 5 で `cron-parser@5.5.0` の実挙動を確認し、TC-08 の期待値は `not.toBeNull()` に修正した。ここでは Phase 4 実施時点の記録を残している。
