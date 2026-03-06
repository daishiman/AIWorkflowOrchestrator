# Phase 7 カバレッジレポート

## 実行日

- 2026-03-06

## 実行コマンド

```bash
pnpm --dir apps/desktop test:coverage \
  src/renderer/navigation/navContract.test.ts \
  src/renderer/store/slices/uiSlice.test.ts \
  src/renderer/components/organisms/AppDock/AppDock.test.tsx \
  src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx \
  src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx \
  src/renderer/components/organisms/AppLayout/AppLayout.test.tsx \
  src/renderer/hooks/useNavShortcuts.test.ts
```

## コマンド結果

- `vitest run --coverage` 自体は対象テストを完走した。
- 終了コードは repo-wide threshold 未達のため `1`。
- task-057 対象コードの実測値は `apps/desktop/coverage/coverage-final.json` から抽出した。

## 対象ファイル別実測値

| ファイル                                                                 | Statements | Branches | Functions | Lines  |
| ------------------------------------------------------------------------ | ---------- | -------- | --------- | ------ |
| `src/renderer/components/organisms/AppLayout/index.tsx`                  | 100.00     | 100.00   | 100.00    | 100.00 |
| `src/renderer/components/organisms/GlobalNavStrip/index.tsx`             | 94.06      | 81.48    | 100.00    | 100.00 |
| `src/renderer/components/organisms/MobileNavBar/index.tsx`               | 100.00     | 100.00   | 100.00    | 100.00 |
| `src/renderer/components/organisms/MobileNavBar/components/MoreMenu.tsx` | 98.10      | 79.17    | 100.00    | 100.00 |
| `src/renderer/hooks/useNavShortcuts.ts`                                  | 100.00     | 100.00   | 100.00    | 100.00 |
| `src/renderer/navigation/navContract.ts`                                 | 98.68      | 93.94    | 100.00    | 100.00 |
| `src/renderer/store/slices/uiSlice.ts`                                   | 100.00     | 100.00   | 100.00    | 100.00 |

## 基準との比較

| 指標              | 最低基準 | task-057 の最小実測値 | 判定 |
| ----------------- | -------- | --------------------- | ---- |
| Line Coverage     | 80       | 100.00                | PASS |
| Branch Coverage   | 60       | 79.17                 | PASS |
| Function Coverage | 80       | 100.00                | PASS |

## repo-wide threshold 補足

| 指標       | repo-wide 実測 |
| ---------- | -------------- |
| Statements | 2.17%          |
| Branches   | 27.57%         |
| Functions  | 7.17%          |
| Lines      | 2.17%          |

- これは `apps/desktop` 全体に対する閾値評価であり、task-057 の対象差分品質を直接示す値ではない。
