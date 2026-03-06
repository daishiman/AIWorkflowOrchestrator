# Phase 6 回帰マトリクス

## 回帰軸

| 観点                                 | desktop | tablet                  | mobile | 自動/手動   |
| ------------------------------------ | ------- | ----------------------- | ------ | ----------- |
| 9項目/3セクション表示                | PASS    | N/A                     | N/A    | 自動        |
| collapsed 56px 表示                  | N/A     | PASS                    | N/A    | 自動 + 手動 |
| keyboard roving focus                | PASS    | PASS                    | N/A    | 自動 + 手動 |
| Nav expand/collapse toggle           | PASS    | tablet は固定 collapsed | N/A    | 自動        |
| primary 5 + More 4                   | N/A     | N/A                     | PASS   | 自動 + 手動 |
| More open/close/Escape/outside click | N/A     | N/A                     | PASS   | 自動 + 手動 |
| shortcut view change                 | PASS    | PASS                    | N/A    | 自動 + 手動 |
| editable guard                       | PASS    | PASS                    | N/A    | 自動 + 手動 |
| go back                              | PASS    | PASS                    | N/A    | 自動 + 手動 |
| feature flag OFF/ON                  | PASS    | PASS                    | PASS   | 自動中心    |

## テストファイル別の回帰担当

| テストファイル                                                             | 担当回帰軸                                              | 結果 |
| -------------------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| `src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx` | expanded / collapsed / keyboard / toggle                | PASS |
| `src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx`     | mobile default / More open-close / secondary active     | PASS |
| `src/renderer/components/organisms/AppLayout/AppLayout.test.tsx`           | desktop/mobile layout / back button / container padding | PASS |
| `src/renderer/hooks/useNavShortcuts.test.ts`                               | ctrl/meta / editable guard / go back                    | PASS |
| `src/renderer/store/slices/uiSlice.test.ts`                                | nav expanded / mobile more / responsive reset           | PASS |
| `src/renderer/components/organisms/AppDock/AppDock.test.tsx`               | feature flag OFF 側の退行検知                           | PASS |

## 実行コマンド

```bash
pnpm --dir apps/desktop test:run \
  src/renderer/navigation/navContract.test.ts \
  src/renderer/store/slices/uiSlice.test.ts \
  src/renderer/components/organisms/AppDock/AppDock.test.tsx \
  src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx \
  src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx \
  src/renderer/components/organisms/AppLayout/AppLayout.test.tsx \
  src/renderer/hooks/useNavShortcuts.test.ts
```

## 判定

- 回帰マトリクスは **PASS**。
- manual にしか現れない観点は Phase 11 へ引き渡した。
