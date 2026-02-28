# Phase 1 受け入れ基準

## 判定基準

- [x] timeout 後に `waitForCallback()` が `Callback timeout` を返す。
- [x] timeout 時にサーバーは自動停止せず、呼び出し側が `stop()` を制御できる。
- [x] `stop()` は停止済みサーバーに対しても失敗しない。
- [x] `authCallbackServer.test.ts` が全件 PASS。
- [x] `verify-all-specs` / `validate-phase-output` が PASS。
- [x] 未タスク検出結果が current=0 である。

## 実測

- 2026-02-28 実行: `13 tests passed`
- 監査: `currentViolations=0`
