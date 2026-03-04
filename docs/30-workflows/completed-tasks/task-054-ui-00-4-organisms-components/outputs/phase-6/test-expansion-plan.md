# Phase 6 拡充テスト計画

## 1. 追加観点

| 観点       | 対象                                                   |
| ---------- | ------------------------------------------------------ |
| 境界値     | CardGrid skeletonCount既定値、SearchFilterList 0件結果 |
| a11y       | aria-live、role整合、SlideInPanel overlay              |
| responsive | CardGrid mobile列、MasterDetail tablet/mobile挙動      |
| theme      | 3テーマ共通レンダリング（全3コンポーネント）           |
| 回帰       | 既存Red/Greenケース再実行                              |

## 2. 追加したテスト

- CardGrid: `TC-CG-BOUNDARY-01`, `TC-CG-KEY-02`, `TC-CG-THEME-01`
- MasterDetailLayout: `TC-MDL-RESP-01`, `TC-MDL-RESP-02`, `TC-MDL-THEME-01`
- SearchFilterList: `TC-SFL-EMPTY-02`, `TC-SFL-VIEW-01`, `TC-SFL-VIEW-02`, `TC-SFL-THEME-01`

## 3. 実行コマンド

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/organisms/CardGrid/CardGrid.test.tsx \
  src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx \
  src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx
```
