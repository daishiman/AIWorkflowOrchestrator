# Phase 11: 手動テスト計画

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

## 方針

本タスクは内部防御ロジック中心だが、ユーザー要求により画面スクリーンショットで検証する。

## テストケース

| テストケース | 目的                          | 操作                             | 期待結果                 |
| ------------ | ----------------------------- | -------------------------------- | ------------------------ |
| TC-11-01     | light themeでSettings遷移確認 | アプリ起動後にSettings画面を表示 | クラッシュせず表示される |
| TC-11-02     | dark themeでSettings遷移確認  | dark themeでSettings画面を表示   | クラッシュせず表示される |

## 画面証跡

- `outputs/phase-11/screenshots/TC-11-01-settings-light.png`
- `outputs/phase-11/screenshots/TC-11-02-settings-dark.png`

## 補足

- 非視覚検証は `navigationSlice.test.ts` と `customStorage.test.ts`（42 tests）で補完する。
