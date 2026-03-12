# Phase 5 成果物: 実装サマリー

## 実装方針

- 対象は light theme で共有利用される color hardcode の除去に限定した
- token foundation を再定義せず、既存 semantic token の適用へ寄せた
- Settings 系を先に収束し、Auth / WorkspaceSearch / shared fallback を後続 batch として分離した

## バッチ別実施結果

| Batch | 対象                              | 実施内容                                                                                                                                              | 主な変更ファイル                                                                                                                                                                                                                                                                                                            | 結果 |
| ----- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| A     | Settings shell / selector         | `ThemeSelector`、`AccountSection`、`LocaleSelector`、`TimezoneSelector` の `text-white` / `bg-white/5` / `border-white/10` 系を semantic token へ移行 | `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx`, `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`, `apps/desktop/src/renderer/views/SettingsView/ProfileSection/LocaleSelector.tsx`, `apps/desktop/src/renderer/views/SettingsView/ProfileSection/TimezoneSelector.tsx`   | 完了 |
| B     | Auth surface                      | `AuthView` の背景・見出し・エラー帯、`AuthTimeoutFallback` の inverse text を token ベースへ移行                                                      | `apps/desktop/src/renderer/views/AuthView/index.tsx`, `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`                                                                                                                                                                                              | 完了 |
| C     | WorkspaceSearch                   | `WorkspaceSearchPanel` の背景、入力欄、toggle、results list、error/success state を semantic token へ移行                                             | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx`                                                                                                                                                                                                                                   | 完了 |
| D     | 検証ハーネス / regression support | Phase 11 専用 harness、capture script、contract scan、entrypoint を追加し、light theme 回帰証跡を固定                                                 | `apps/desktop/src/renderer/views/LightThemeSharedColorMigrationReviewHarness.tsx`, `apps/desktop/scripts/capture-light-theme-shared-color-migration-phase11.mjs`, `apps/desktop/src/renderer/styles/light-theme-shared-color-migration.contract.test.ts`, `apps/desktop/src/renderer/main.tsx`, `apps/desktop/package.json` | 完了 |

## 具体的な置換パターン

| 旧パターン                                                         | 新パターン                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `text-white` / `text-white/80` / `text-white/60` / `text-white/40` | `--text-primary` / `--text-secondary` / `--text-muted` / `--text-tertiary`                        |
| `bg-white/5` / `bg-white/10` / `bg-slate-*` / `bg-zinc-*`          | `--bg-primary` / `--bg-secondary` / `--bg-tertiary` / `--bg-hover` / `color-mix(...)`             |
| `border-white/10` / `border-slate-*`                               | `--border-primary` / `--border-emphasis`                                                          |
| 強調ボタンの `text-white`                                          | `--text-inverse`                                                                                  |
| state color を直接 opacity で調整                                  | `--status-primary` / `--status-success` / `--status-error` / `--status-warning` の semantic token |

## 変更しなかった対象

- `DashboardView` は今回の source scan 対象に含めたが、対象 hardcode は今回差分時点で回帰面の参照用に留まり、コード変更は不要と判断した
- token foundation (`tokens.css` など) は依存元 task の責務として据え置いた

## 回帰ガード

- `ThemeSelector.test.tsx`
- `AuthView.test.tsx`
- `WorkspaceSearchPanel.test.tsx`
- `LocaleSelector.test.tsx`
- `TimezoneSelector.test.tsx`
- `light-theme-shared-color-migration.contract.test.ts`

## 実装メモ

- worktree path に `#` が含まれるため、Phase 11 の capture は app shell 直起動ではなく dedicated harness + safe temp build + static serve で固定した
- `main.tsx` は `React.lazy` + `Suspense` に切り替え、Phase 11 harness で不要な graph を極力読まない構成に寄せた
