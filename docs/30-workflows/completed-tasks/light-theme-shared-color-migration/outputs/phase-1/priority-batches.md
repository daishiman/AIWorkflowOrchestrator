# Phase 1 成果物: priority-batches

## Batch 一覧

| Batch | 対象                                                 | 実測ヒット | 優先度 | 理由                                                             | 並列可否         |
| ----- | ---------------------------------------------------- | ---------: | ------ | ---------------------------------------------------------------- | ---------------- |
| A     | `ThemeSelector`                                      |          4 | P1     | Settings の代表 token migration。diff が小さく設計の基準点になる | B/C 着手前に完了 |
| B     | `AuthView`                                           |          4 | P1     | login shell の primary text contrast を即改善できる              | C と並列可       |
| C     | `WorkspaceSearchPanel`                               |         39 | P1     | 最多ヒット。`slate-*` 依存が panel 全体へ波及している            | B と並列可       |
| D     | `AccountSection` `LocaleSelector` `TimezoneSelector` |         47 | P2     | Settings 内部の shared surface をまとめて整える                  | A/B/C 後に統合   |

## Batch 別完了条件

| Batch | 完了条件                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| A     | container / option button / hover / selected state が semantic token へ移行し、ThemeSelector 単体テストが green |
| B     | hero text / card title / helper text が light で読め、AuthView テストが green                                   |
| C     | panel / inputs / option chips / results list が token 化され、WorkspaceSearchPanel テストが green               |
| D     | Settings 内の account / locale / timezone surface が token 化され、既存テスト + 追加 contract test が green     |

## リスク順

1. Batch C: ヒット数が多く、結果一覧・hover・focus・error の状態差分が多い
2. Batch D: AccountSection が大きく、portal / dialog / auth state を含む
3. Batch B: AuthView は画面が小さいが visual regression の影響が分かりやすい
4. Batch A: 影響が最小で design anchor に向く

## テスト接続

| Batch | 既存テスト                                                                                                              | 追加する監査                            |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| A     | `apps/desktop/src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx`                                   | semantic class / no-hardcoded assertion |
| B     | `apps/desktop/src/renderer/views/AuthView/AuthView.test.tsx`                                                            | semantic text contract assertion        |
| C     | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/__tests__/WorkspaceSearchPanel.test.tsx`                | no-slate contract assertion             |
| D     | `AccountSection*.test.tsx`, `LocaleSelector.test.tsx`, `TimezoneSelector.test.tsx`, `SettingsView.integration.test.tsx` | file-scan contract test                 |
