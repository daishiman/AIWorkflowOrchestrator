# 実装ガイド

## Part 1: 中学生向けの説明

### この変更は何か

学校の廊下にある案内板を、見やすく作り直したイメージです。

前は `AppDock` という細い案内板があり、ボタンが一直線に並んでいました。項目が増えてきたので、どこに何があるか少し分かりにくくなっていました。

今回の変更では、案内板を 3つのまとまりに分けました。

- よく使う場所はすぐ押せる場所へ置く
- あまり使わない場所は「More」にまとめる
- 設定は一番下に固定する

### 何が良くなったか

- パソコンの広い画面では、名前つきで見やすくなった
- タブレットでは細い案内板になって場所を取らない
- スマホでは大事な5つだけを下に出して、残りは `More` に入れた
- スマホでは長い名前を短くして、読み切れないラベルが出ないようにした
- キーボードでもすばやく移動できる

### どうやって安全に切り替えたか

いきなり古い案内板を消さず、`VITE_USE_GLOBAL_NAV_STRIP` という切替スイッチを残しました。

だから、もし困ったら古い案内板に戻せます。

## Part 2: 技術者向けの説明

### 実装の中心

| 要素                                   | 役割                                                             |
| -------------------------------------- | ---------------------------------------------------------------- |
| `navigation/navContract.ts`            | 9項目/3セクション/shortcut/mobile primary + `mobileLabel` の正本 |
| `components/organisms/GlobalNavStrip/` | desktop/tablet nav                                               |
| `components/organisms/MobileNavBar/`   | mobile nav と More                                               |
| `components/organisms/AppLayout/`      | nav + header + main の統合テンプレート                           |
| `hooks/useNavShortcuts.ts`             | global shortcut / editable guard / go back                       |
| `store/slices/uiSlice.ts`              | `isNavExpanded` / `isMobileMoreOpen`                             |
| `App.tsx`                              | feature flag 切替と renderView 接続                              |

### 状態と責務

| 状態                                         | 所有者            |
| -------------------------------------------- | ----------------- |
| current view / history                       | `navigationSlice` |
| responsive mode / nav expanded / mobile more | `uiSlice`         |
| DOM keyboard 条件                            | `useNavShortcuts` |

### feature flag

```ts
const useGlobalNavStrip = import.meta.env.VITE_USE_GLOBAL_NAV_STRIP !== "false";
```

- default は ON
- `false` で legacy `AppDock` 経路へ戻る

### 検証コマンド

```bash
pnpm --dir apps/desktop typecheck
pnpm --dir apps/desktop test:run \
  src/renderer/navigation/navContract.test.ts \
  src/renderer/store/slices/uiSlice.test.ts \
  src/renderer/components/organisms/AppDock/AppDock.test.tsx \
  src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx \
  src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx \
  src/renderer/components/organisms/AppLayout/AppLayout.test.tsx \
  src/renderer/hooks/useNavShortcuts.test.ts
pnpm --dir apps/desktop exec vite build --config vite.e2e.config.ts
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core
```

### エッジケース

- input / textarea / select / contenteditable 上では shortcut を無効化する。
- tablet は user toggle を受けず collapsed 56px 固定。
- mobile は表示ラベルを `mobileLabel` で短縮しても、`aria-label` は正式名称を維持する。
- Step 3 の `AppDock` 削除は未実施で、現状は readiness のみ完了。
