# Phase 4 テスト仕様書

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-C

## テスト方針

- Slice（状態遷移）: `settingsSlice.test.ts` / `settingsSlice.kanagawa.test.ts`
- 型/ユーティリティ: `types.test.ts`
- UI: `ThemeSelector.test.tsx` / `SettingsView.test.tsx`
- Hook: `useTheme.test.ts`
- IPC: `themeHandlers.test.ts`

## 重点観点

- 4モードの値制約
- system解決の正当性
- 保存値復元とフォールバック
- DOM同期
- 入力バリデーション
- P31（selector安定性）

## 判定基準

- 必須ケースは全PASS
- 変更対象主要ファイルで 80/60/80 を満たす
- typecheck/lint エラー0
