# Phase 1 受け入れ基準（SubAgent-A）

| AC-ID | 判定基準                                                                           | 測定方法                                |
| ----- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| AC-01 | `APP_DOCK_NAV_ITEMS` が9項目で、順序とショートカットが契約表に一致                 | `navContract.test.ts`                   |
| AC-02 | Cmd/CtrlショートカットでViewTypeが解決される                                       | `getViewFromNavigationShortcut` テスト  |
| AC-03 | 編集可能要素上でショートカットが無効化される                                       | `isEditableEventTarget` テスト          |
| AC-04 | `App.tsx` にグローバルショートカット登録があり、解決結果で `setCurrentView` を呼ぶ | 実装レビュー                            |
| AC-05 | TypeScript型チェックが通過する                                                     | `pnpm --filter @repo/desktop typecheck` |

## 目標値

- Line Coverage: 80%以上
- Branch Coverage: 75%以上
- Function Coverage: 90%以上
