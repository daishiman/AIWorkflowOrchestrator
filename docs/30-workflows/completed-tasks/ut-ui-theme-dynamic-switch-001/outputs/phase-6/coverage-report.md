# Phase 6 カバレッジレポート

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 実施日: 2026-02-25
- 担当: SubAgent-C

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  --coverage.thresholds.lines=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.statements=0 \
  src/renderer/store/slices/settingsSlice.test.ts \
  src/renderer/store/slices/settingsSlice.kanagawa.test.ts \
  src/renderer/store/types.test.ts \
  src/renderer/components/molecules/ThemeSelector/ThemeSelector.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  src/renderer/hooks/useTheme.test.ts \
  src/main/ipc/themeHandlers.test.ts
```

## 変更対象主要ファイルの実測

| ファイル                  |  Lines | Branches | Functions |
| ------------------------- | -----: | -------: | --------: |
| `settingsSlice.ts`        | 94.67% |   79.17% |   100.00% |
| `themeHandlers.ts`        | 87.76% |   84.38% |   100.00% |
| `ThemeSelector/index.tsx` | 97.76% |   88.46% |   100.00% |
| `SettingsView/index.tsx`  | 97.14% |   81.82% |   100.00% |
| `useTheme.ts`             | 93.94% |   91.67% |   100.00% |

## 判定

- 主要変更ファイルは基準（Line80/Branch60/Func80）を満たす。
- 全体カバレッジはモノレポ全ファイル対象のため低値だが、本タスク対象の品質基準は達成。
