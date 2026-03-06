# Phase 5: 変更ファイル計画

## メタ情報

| 項目   | 内容                                          |
| ------ | --------------------------------------------- |
| Phase  | 5                                             |
| 機能名 | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| 作成日 | 2026-03-06                                    |

## 変更ファイル一覧

| ファイル                                                                               | 変更種別 | 変更内容                                    |
| -------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`               | 新規作成 | authKey 専用セクションコンポーネント        |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | 新規作成 | ユニットテスト                              |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                               | 修正     | AuthKeySection の import と条件付き表示追加 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                   | 修正     | AuthKeySection モックと統合テスト追加       |

## 変更しないファイル

| ファイル                                                         | 理由                 |
| ---------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/preload/authKeyApi.ts`                         | 既存API変更なし      |
| `apps/desktop/src/main/ipc/authKeyHandlers.ts`                   | 既存ハンドラ変更なし |
| `apps/desktop/src/main/services/auth/AuthModeService.ts`         | Main変更なし         |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts`        | Store変更なし        |
| `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | preflight変更なし    |
