# Phase 2 Output: Codex Handoff

## future implementation ルール

- Batch を跨ぐ差分を 1 回で入れない
- `tokens.css` と global baseline を触らない
- 新規 hex / blue utility / white utility を追加しない
- shared Button / GlassPanel / EmptyState など既存契約を優先して再利用する
- `SettingsView` 公開シェルの bypass 契約を崩さない
- Batch B では `ui-ux-settings.md` / `api-ipc-system.md` / `error-handling.md` の UI 契約を壊さない
- Batch E は review-only で、無関係な実装 diff を入れない

## 想定コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx \
  src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx \
  src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx \
  src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx \
  src/renderer/components/organisms/AccountSection/AccountSection.test.tsx \
  src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx \
  src/renderer/views/AuthView/AuthView.test.tsx \
  src/renderer/components/organisms/WorkspaceSearch/__tests__/WorkspaceSearchPanel.test.tsx
```

## 実装前チェック

1. `index.md` と Phase 3 PASS を確認する
2. 対象 batch 以外の file を触らない
3. timeout fallback / regression guard / token foundation / linked-provider warning を巻き込まない
