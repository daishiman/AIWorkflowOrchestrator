# Phase 6: テスト拡充

## 実施方針

Phase 4/5 で成立した最小ケースに対し、`terminal_handoff` の実データ形状と失敗 envelope を追加で固定した。あわせて、関連 Preload API の単純委譲ケースも補完し、Phase 7 のカバレッジ基準を満たす状態まで広げた。

## 追加・拡張した観点

| 観点                        | 対象                 | 内容                                                                                                                        | 結果 |
| --------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| `terminal_handoff` 実 shape | Preload runtime test | 実際の `TerminalHandoffBundle` 構造で envelope を維持して返す                                                               | PASS |
| 失敗 envelope 保持          | Preload runtime test | `success: false` 時に wrapper が崩れないことを確認                                                                          | PASS |
| 早期リターン                | Renderer test        | `terminal_handoff` 時に `fetchSkills` / `selectSkillByName` へ進まない                                                      | PASS |
| 失敗 UI 反映                | Renderer test        | `success: false` のとき `generationError` が設定される                                                                      | PASS |
| 空 data の既定文言          | Renderer test        | `success: true` かつ `data` なしで fallback 文言を表示                                                                      | PASS |
| 委譲 API 補完               | Preload API test     | `applyRuntimeImprovement` / `forkSkill` / `shareSkill` / `scheduleSkill` / `generateDocs` / `getStats` の invoke 契約を固定 | PASS |

## 実行結果

- 対象4ファイルの回帰テスト: 54/54 PASS
- 詳細ログ: `outputs/phase-6/test-expansion-results.md`
