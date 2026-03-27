# Phase 6 Regression Matrix

| 観点             | ケース                                                     | 結果 |
| ---------------- | ---------------------------------------------------------- | ---- |
| fail path        | `terminal_handoff` で `manualRetryRule` が response に残る | PASS |
| fallback path    | resolver 未注入で既存 execute path が動く                  | PASS |
| authority bypass | consumer が local reason 文字列を再生成しない              | PASS |
| contract drift   | Agent / Skill の public response shape を変えていない      | PASS |
| legacy isolation | `AI_CHECK_CONNECTION` を今回 wave で削除していない         | PASS |

## 未実施にしないための整理

- cleanup 項目は regression で「消さなかったこと」を確認し、完了扱いにはしない。
- Step 2 no-op は drift なしの確認であり、shared/preload を更新したという主張には使わない。
