# Phase 6: エッジケーステスト追加

## 追加テストケース

| #   | テストケース                                                         | 結果 |
| --- | -------------------------------------------------------------------- | ---- |
| 20  | apiKey が undefined → subscription 判定に進む                        | PASS |
| 21  | subscription 期限切れ（false）→ no-auth, runbook なし                | PASS |
| 22  | apiKey + subscription 両方有効 → パターンA優先, validateToken 未呼出 | PASS |
| 23  | no-auth bundle に runbook が含まれないこと                           | PASS |
| 24  | subscription bundle の runbook に手順含む                            | PASS |
| 25  | subscription bundle の suggestedCommand 形式                         | PASS |

## テスト総数: 25テスト (Phase 4: 19 + Phase 6: 6)
