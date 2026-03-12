# Phase 2 成果物: batch-plan

## 実行順序

1. Batch A: ThemeSelector
2. Batch B/C: AuthView と WorkspaceSearchPanel を並列で進行
3. Batch D: AccountSection / LocaleSelector / TimezoneSelector を統合
4. 共通 contract test と Phase 11 harness を仕上げる

## Batch 詳細

| Batch | 実装範囲                                             | テスト範囲                                        | 完了ゲート                                               |
| ----- | ---------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| A     | `ThemeSelector`                                      | `ThemeSelector.test.tsx`                          | semantic token class への置換完了                        |
| B     | `AuthView`                                           | `AuthView.test.tsx`                               | heading / subtitle / error shell が light で可読         |
| C     | `WorkspaceSearchPanel`                               | `WorkspaceSearchPanel.test.tsx`                   | `slate-*` 除去 + empty/result/replace row 状態の回帰なし |
| D     | `AccountSection` `LocaleSelector` `TimezoneSelector` | 既存各 test + `SettingsView.integration.test.tsx` | Settings shell 内部の contrast 一貫性確保                |

## 並列条件

| 並列ペア                   | 条件                                              |
| -------------------------- | ------------------------------------------------- |
| B と C                     | Batch A 完了後に開始。相互依存なし                |
| D と Phase 11 harness 設計 | Batch B/C で使う token 契約が確定した後なら並列可 |

## 監査対象パターン

```text
text-white
bg-white/5
bg-white/10
bg-white/20
border-white/10
border-white/20
bg-slate-
text-slate-
border-slate-
bg-zinc-
text-zinc-
border-zinc-
```

## 成功条件

- target files から監査対象パターンを除去できる
- 既存テストを壊さない
- Phase 11 で 5 surface をスクリーンショットで説明できる状態になる
