# Phase 4 テスト仕様書

## 実行方針

- 実行ディレクトリ:
  - `cd apps/desktop`
- テスト環境:
  - `vitest`
  - `happy-dom`
- ルール:
  - `fireEvent` を優先
  - store selector は個別 selector / `useAppStore.setState` を使用

## 対象ファイル

| 種別      | 対象                                          |
| --------- | --------------------------------------------- |
| Component | `GlobalNavStrip`, `MobileNavBar`, `AppLayout` |
| Hook      | `useNavShortcuts`                             |
| Slice     | `uiSlice`                                     |
| Contract  | `navContract.ts`                              |

## 実行コマンド

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx
pnpm vitest run src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx
pnpm vitest run src/renderer/components/organisms/AppLayout/AppLayout.test.tsx
pnpm vitest run src/renderer/hooks/useNavShortcuts.test.tsx
pnpm vitest run src/renderer/store/slices/uiSlice.test.ts
```

## Red 条件

- `GlobalNavStrip` が 3 セクションを描画できない
- `MobileNavBar` が 5+More を描画できない
- `MoreMenu` が Escape / outside click を処理できない
- `useNavShortcuts` が `Cmd/Ctrl+[` や editable guard を満たさない
- `uiSlice` に nav state が追加されない
