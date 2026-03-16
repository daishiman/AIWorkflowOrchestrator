# Phase 7 カバレッジレポート

## 計測コマンド

```bash
cd apps/desktop
pnpm vitest run --coverage --coverage.include="src/main/menu.ts" src/main/__tests__/menu.test.ts
```

## 計測結果

```
 % Coverage report from v8
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |
 menu.ts  |     100 |      100 |     100 |     100 |
----------|---------|----------|---------|---------|-------------------
```

## カバレッジ達成状況

| 指標               | 計測値 | 最低基準 | 推奨基準 | 判定 |
| ------------------ | ------ | -------- | -------- | ---- |
| Line Coverage      | 100%   | 80%      | 90%      | PASS |
| Branch Coverage    | 100%   | 60%      | 70%      | PASS |
| Function Coverage  | 100%   | 80%      | 90%      | PASS |
| Statement Coverage | 100%   | -        | -        | PASS |

全指標で推奨基準（90%）を上回り、100% を達成。

## テスト実行サマリー

```
Test Files  1 passed (1)
Tests       20 passed (20)
```

- TC-1〜TC-12（Phase 4-5 で作成）: 12 件 PASS
- TC-13〜TC-20（Phase 6 で追加）: 8 件 PASS
- 合計: 20 件全件 PASS

## 対象ファイル

`apps/desktop/src/main/menu.ts`

export 関数:

- `buildMacTemplate`: macOS 用 4 メニューテンプレートを構築
- `buildDefaultTemplate`: Windows/Linux 用 1 メニューテンプレートを構築
- `createApplicationMenu`: プラットフォームに応じてメニューを構築・設定

## Phase 7 判定

カバレッジ基準（最低: Line 80% / Branch 60% / Function 80%）を全指標で満たし、
推奨基準（Line 90% / Branch 70% / Function 90%）も全指標で超過。

**判定: PASS → Phase 8 へ進む**
