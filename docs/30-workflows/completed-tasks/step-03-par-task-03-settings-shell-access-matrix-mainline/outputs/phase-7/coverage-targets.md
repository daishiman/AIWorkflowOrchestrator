# Phase 7: カバレッジ計画

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Coverage Gate 基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル群                                                                                  |
| ----------------- | -------- | -------- | ----------------------------------------------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | CapabilityCard / HealthStatusRow / ProviderSummaryCard / AccessMatrixSection / TerminalLauncher |
| Branch Coverage   | 60%      | 70%      | 同上（capability 4状態 + 未認証 + loading の分岐を重点確認）                                    |
| Function Coverage | 80%      | 90%      | 同上                                                                                            |

## 2. Branch Coverage 重点確認ポイント

| 分岐                                      | 対象コンポーネント  | TC-ID                |
| ----------------------------------------- | ------------------- | -------------------- |
| capability 4状態                          | CapabilityCard      | TC-C01〜C04          |
| isAuthenticated true/false                | AccessMatrixSection | TC-C05, SC-01, SC-02 |
| uiState loading/ready/blocked/unavailable | CapabilityCard      | TC-C06, SC-06        |
| health 4値                                | HealthStatusRow     | TC-H01〜H04          |
| selectedProvider 有無                     | ProviderSummaryCard | TC-P01, TC-P02       |
| TerminalLauncher disabled                 | TerminalLauncher    | TC-L01, TC-L02       |

## 3. 判定フロー

- 全指標が最低基準以上 → Phase 8 へ進む
- いずれかの指標が最低基準未満 → 不足箇所を特定し、Phase 6 に差し戻してテスト追加
- 本タスクは設計タスクのため、カバレッジ計測は後続実装タスクで実施する

## 4. Residual Risk

- Branch Coverage が推奨基準未達の場合: capability x isAuthenticated の組合せ（8分岐）が主な不足候補
- P41 対策: v8 カバレッジプロバイダのインライン関数カウントに注意。Props 内のコールバックもカウントされる
