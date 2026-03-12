# Phase 4 Output: Batch Test Matrix

| Batch | 対象ファイル                                                         | 自動テスト                                                                                                                                           | 手動TC              | 状態 |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| A     | `ThemeSelector`, `AuthModeSelector`                                  | `ThemeSelector.test.tsx`, `AuthModeSelector.test.tsx`, guard                                                                                         | TC-01, TC-02        | 完了 |
| B     | `AuthKeySection`, `AccountSection`, `ApiKeysSection`, `SettingsView` | `AuthKeySection.test.tsx`, `AccountSection.test.tsx`, `ApiKeysSection.test.tsx`, `SettingsView.test.tsx`, `SettingsView.integration.test.tsx`, guard | TC-03〜TC-07, TC-11 | 完了 |
| C     | `AuthView`                                                           | `AuthView.test.tsx`, guard                                                                                                                           | TC-08               | 完了 |
| D     | `WorkspaceSearchPanel`                                               | `WorkspaceSearchPanel.test.tsx`, guard                                                                                                               | TC-09, TC-10        | 完了 |
| E     | `DashboardView`                                                      | screenshot smoke                                                                                                                                     | TC-12, TC-13        | 完了 |

## 実行順

1. Batch A を Green 化して selector token 方針を固定
2. Batch B/C を独立に修正し、settings/auth surface を収束
3. Batch D を単独で token migration
4. Batch E を screenshot smoke で検証

## 備考

- `SettingsView` は当初 verification-only 扱いだったが、auth-mode status panel の blind spot を Phase 4 時点の監査基準へ追加した
