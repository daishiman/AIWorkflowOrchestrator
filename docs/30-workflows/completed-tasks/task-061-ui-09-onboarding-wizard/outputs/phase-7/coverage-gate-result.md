# Phase 7 Coverage Gate Result

## Gate

- 判定: `MINOR`
- 理由: function coverage だけが `76.92%` で閾値 `80%` 未達

## Gate を通過した項目

1. statements / lines が 89.22% で十分。
2. branches が 83.06% で十分。
3. targeted vitest 73 件と `tsc --noEmit` が pass。
4. Phase 11 screenshot / keyboard evidence が別レーンで揃っている。

## 残ったギャップ

1. `SettingsView` と onboarding 周辺の一部 handler / error path の function coverage が不足。
2. `act(...)` warning を解消するための test harness 整理が残る。

## 判定メモ

リリースブロッカーではないが、品質 gate を厳密に PASS へ寄せるなら次の 1 サイクルで function coverage 80% 超えを狙う。
