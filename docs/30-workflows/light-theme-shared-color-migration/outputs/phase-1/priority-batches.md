# Phase 1 Output: Priority Batches

## バッチ一覧

| Batch | 対象                                                  | 根拠                                                      | 優先度 | 並列条件         |
| ----- | ----------------------------------------------------- | --------------------------------------------------------- | ------ | ---------------- |
| A     | `ThemeSelector`, `AuthModeSelector`, `AuthKeySection` | shared selector / CTA で neutral + accent hardcode が残る | P1     | 最初に着手       |
| B     | `AccountSection`, `ApiKeysSection`                    | Settings domain で white glass / text hardcode が集中     | P1     | A 後、C と並列可 |
| C     | `AuthView`                                            | login surface の white text 前提が残る                    | P1     | A 後、B と並列可 |
| D     | `WorkspaceSearchPanel`                                | slate / blue / white hardcode が最多                      | P1     | A 後、単独推奨   |
| E     | `SettingsView`, `SettingsCard`, `DashboardView`       | hardcode は主因でなく verification-only                   | Verify | B/C/D と並列可   |

## 並列実行ポリシー

- 直列: SubAgent-A の system spec 抽出完了まで batch 設計へ進まない
- 並列: Batch B と Batch C は independent
- 直列: Batch D は影響面が広いため単独 review を通す
- 直列: Batch E は最後にまとめて non-regression を確認する

## Phase 4 へ渡す優先順位

1. Batch A
2. Batch B
3. Batch C
4. Batch D
5. Batch E
