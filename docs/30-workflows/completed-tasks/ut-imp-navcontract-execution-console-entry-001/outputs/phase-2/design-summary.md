# Phase 2: 設計 — 成果物

## 変更ファイル一覧

| ファイル            | 変更内容                                                             |
| ------------------- | -------------------------------------------------------------------- |
| Icon/index.tsx      | PlayCircle import + "play-circle" IconName + iconMap                 |
| navContract.ts      | DockViewType Extract union + NAV_SECTIONS sub + NAV_SHORTCUT_TO_VIEW |
| navContract.test.ts | 期待値更新（items count, id配列, shortcut, length）                  |
| types.test.ts       | ViewType member count 更新                                           |

## 依存関係

```
Icon/index.tsx (play-circle 追加)
      |
navContract.ts (DockViewType + NAV_SECTIONS + shortcut)
      |
navContract.test.ts + types.test.ts (期待値更新)
```

## テスト影響分析

| テストファイル          | 変更箇所                                    |
| ----------------------- | ------------------------------------------- |
| navContract.test.ts:43  | items.length [6,2,1] -> [6,3,1]             |
| navContract.test.ts:49  | APP_DOCK_NAV_ITEMS に executionConsole 追加 |
| navContract.test.ts:60  | shortcut に Cmd+9 追加                      |
| navContract.test.ts:81  | MOBILE_SECONDARY に executionConsole 追加   |
| navContract.test.ts:209 | NAV_SHORTCUT_TO_VIEW length 9 -> 10         |
| types.test.ts:61-78     | existingViewTypes 15 -> 16                  |
| types.test.ts:82-101    | allViewTypes 17 -> 18                       |
