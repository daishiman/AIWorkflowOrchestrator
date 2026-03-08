# Phase 5: 変更ファイル計画

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

---

## 変更ファイル一覧

| ファイル                                                          | 変更種別 | DD          | 変更内容                                            |
| ----------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/navigationSlice.ts`       | 修正     | DD-03,04,05 | viewHistory の Array.isArray ガード追加 (3箇所)     |
| `apps/desktop/src/renderer/store/index.ts`                        | 修正     | DD-01,02,05 | customStorage getItem/setItem ガード + useCanGoBack |
| `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`  | 追加     | DD-03,04,05 | iterable hardening テスト (15 cases)                |
| `apps/desktop/src/renderer/store/__tests__/customStorage.test.ts` | 新規     | DD-01,02    | customStorage 破損テスト (11 cases)                 |

---

## 変更しないファイル

| ファイル                                                                         | 理由                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                         | UI 文言は非スコープ (OUT-01)               |
| `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`          | 既存テストは変更なし、回帰確認のみ (AC-05) |
| `apps/desktop/src/renderer/__tests__/integration/navigation.integration.test.ts` | 既存統合テストは変更なし                   |
| `apps/desktop/src/renderer/store/types.ts`                                       | 型定義の変更なし                           |

---

## 変更量見積もり

| 指標           | 値                     |
| -------------- | ---------------------- |
| 変更ファイル数 | 2 (修正)               |
| 新規ファイル数 | 1 (テスト)             |
| 追加行数       | 約 100 行 (テスト含む) |
| 削除行数       | 約 15 行               |
| 純増行数       | 約 85 行               |
