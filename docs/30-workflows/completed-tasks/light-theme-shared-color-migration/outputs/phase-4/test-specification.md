# Phase 4 成果物: test-specification

## 目的

target file の hardcoded color migration を、見た目の印象論ではなく機械検証できるテストへ落とし込む。

## 追加 / 更新するテスト

| 種別   | ファイル                                                                                                 | 役割                                                                            |
| ------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Update | `apps/desktop/src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx`                    | container / selected / unselected の semantic token class を検証                |
| Update | `apps/desktop/src/renderer/views/AuthView/AuthView.test.tsx`                                             | title / subtitle / hero icon が semantic token class を使うことを検証           |
| Update | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/__tests__/WorkspaceSearchPanel.test.tsx` | root / input / option button / results summary の semantic class を検証         |
| Update | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/__tests__/LocaleSelector.test.tsx`          | combobox / dropdown option の semantic class を検証                             |
| Update | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/__tests__/TimezoneSelector.test.tsx`        | field / helper / detect button / dropdown search input の semantic class を検証 |
| Add    | `apps/desktop/src/renderer/styles/light-theme-shared-color-migration.contract.test.ts`                   | target files に disallowed pattern が残っていないことを source scan で検証      |

## contract test 監査対象

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

## 非対象テスト

- pixel perfect screenshot diff
- token value 自体の色数値検証
- target 外 component の repo-wide scan

## Red 条件

- 既存コードのままでは contract test が失敗する
- ThemeSelector / AuthView / WorkspaceSearch / Locale / Timezone の semantic class assertion が失敗する
- 実装後に同じテストが green へ反転する
