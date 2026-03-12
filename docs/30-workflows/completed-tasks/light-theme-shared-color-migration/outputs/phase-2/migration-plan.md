# Phase 2 成果物: migration-plan

## 設計方針

1. token foundation で定義済みの `--bg-*` `--text-*` `--border-*` を唯一の色契約とする
2. glare が強い surface には `var(--bg-tertiary)` または `color-mix(in_srgb, var(--bg-tertiary) ..., var(--bg-primary))` を使う
3. status color は既存 `--status-*` を使い、white/slate/zinc の直書きは避ける
4. target file に対して file-scan contract test を追加し、再発を機械検知する

## ファイル別移行設計

| ファイル                              | 現状                                           | 置換先                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeSelector`                       | `bg-white/5` `border-white/10` `text-white/60` | container=`bg-[color-mix(in_srgb,var(--bg-tertiary)_72%,var(--bg-primary))]` / text=`text-[var(--text-secondary)]` / hover=`bg-[var(--bg-hover)]` |
| `AuthView`                            | title / subtitle / icon が `text-white*`       | title=`text-[var(--text-primary)]`, subtitle=`text-[var(--text-secondary)]`, icon=`text-[var(--text-muted)]`                                      |
| `WorkspaceSearchPanel`                | panel 全体が `slate-*` 固定                    | panel=`bg-[var(--bg-secondary)]`, controls=`bg-[var(--bg-primary)]` or token-based mix, border=`[var(--border-primary)]`, text=`[var(--text-*)]`  |
| `AccountSection`                      | profile/menu/dialog の white 依存              | panel child text=`[var(--text-*)]`, avatar/menu background=`[var(--bg-tertiary)]`, hover=`[var(--bg-hover)]`, disabled=`[var(--text-tertiary)]`   |
| `LocaleSelector` / `TimezoneSelector` | combobox / dropdown / helper が `white` 依存   | label=`[var(--text-secondary)]`, field=`[var(--bg-tertiary)]`, option hover=`[var(--bg-hover)]`, placeholder/helper=`[var(--text-muted)]`         |

## 実装禁止事項

- `tokens.css` に新しい semantic token を追加しない
- target file 外へ無関係な置換を広げない
- global CSS override の追加で local 問題を隠さない

## Phase 11 を意識した UI 状態マトリクス

| Surface              | 必須状態                                                           |
| -------------------- | ------------------------------------------------------------------ |
| ThemeSelector        | light theme default / selected option / hover 代替状態             |
| AuthView             | light default / error card / GlassPanel 上の text contrast         |
| WorkspaceSearchPanel | light default / replace row open / empty results                   |
| Account/Profile      | account summary / locale dropdown / timezone dropdown              |
| DashboardView        | reference capture only。token contract regression がないことを確認 |

## 追加テスト設計の軸

- DOM class で semantic token class を保持しているか
- target file source に disallowed pattern が残っていないか
- Settings/Auth/Workspace の代表 view がレンダリング継続するか
