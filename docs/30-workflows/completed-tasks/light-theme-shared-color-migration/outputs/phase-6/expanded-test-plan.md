# Phase 6 成果物: 拡張テスト計画

## 目的

- batch 間回帰を light theme 共通観点で固定する
- Settings / Auth / WorkspaceSearch / shared fallback の代表状態を自動テストと Phase 11 証跡へ橋渡しする

## 自動テスト更新対象

| 種別      | ファイル                                                                                                 | 目的                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| component | `apps/desktop/src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx`                    | selected / unselected / focus-visible 状態で inverse text と panel token を崩さない                                      |
| view      | `apps/desktop/src/renderer/views/AuthView/AuthView.test.tsx`                                             | light theme auth surface の heading / supporting text / error banner を確認する                                          |
| organism  | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/__tests__/WorkspaceSearchPanel.test.tsx` | search row / result row / error/success state の token 移行回帰を確認する                                                |
| selector  | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/__tests__/LocaleSelector.test.tsx`          | dropdown open / selected state / hover state の token 適用を確認する                                                     |
| selector  | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/__tests__/TimezoneSelector.test.tsx`        | search field / current location button / selected row の token 適用を確認する                                            |
| contract  | `apps/desktop/src/renderer/styles/light-theme-shared-color-migration.contract.test.ts`                   | 対象 source へ `text-white` / `bg-slate-*` / `bg-zinc-*` / `bg-white/5` / `border-white/10` が戻っていないことを監査する |

## 追加した代表観点

| 観点ID   | 対象                              | 検証内容                                                                                               |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| XT-06-01 | ThemeSelector                     | unselected state が light background で読める色に落ちる                                                |
| XT-06-02 | AccountSection                    | avatar menu / delete dialog / linked providers の副次テキストが沈まない                                |
| XT-06-03 | LocaleSelector / TimezoneSelector | dropdown open 時の border / hover / selected row が light mode で区別できる                            |
| XT-06-04 | AuthView                          | radial gradient 背景上でも heading / helper / error text の hierarchy が崩れない                       |
| XT-06-05 | AuthTimeoutFallback               | primary action が inverse text で一貫する                                                              |
| XT-06-06 | WorkspaceSearchPanel              | search / replace / advanced / results / alert state の全領域で token 適用が維持される                  |
| XT-06-07 | Phase 11 harness                  | current build 上で Settings / Auth / WorkspaceSearch / Dashboard reference を light theme で再現できる |

## 実行コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx \
  src/renderer/views/AuthView/AuthView.test.tsx \
  src/renderer/components/organisms/WorkspaceSearch/__tests__/WorkspaceSearchPanel.test.tsx \
  src/renderer/views/SettingsView/ProfileSection/__tests__/LocaleSelector.test.tsx \
  src/renderer/views/SettingsView/ProfileSection/__tests__/TimezoneSelector.test.tsx \
  src/renderer/styles/light-theme-shared-color-migration.contract.test.ts
pnpm --filter @repo/desktop screenshot:light-theme-shared-color-migration
```

## 注意点

- Vitest は current worktree path の `#` と `happy-dom` 解決不全の影響を受けるため、失敗時は Phase 7 で blind spot として明示する
- Phase 11 用の harness は本番 component をそのまま描画し、mock 境界は store/electron API の最低限に留める
