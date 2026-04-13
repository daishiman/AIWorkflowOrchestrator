# Phase 2: テスト戦略

## テスト対象

| 対象                                      | 種別           | AC番号         |
| ----------------------------------------- | -------------- | -------------- |
| `visualConfigToCron()` weekdays=[] ガード | ユニットテスト | AC-01, AC-05   |
| `visualConfigToCron()` 正常系             | ユニットテスト | AC-02〜AC-04   |
| `InvalidConfigError` クラス自体           | ユニットテスト | AC-05 関連     |
| `frequency="daily"` 回帰（weekdays=[]可） | 回帰テスト     | スコープ外確認 |

## テストファイル

`apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts`（新規作成）

## 実行コマンド

```bash
pnpm --filter @repo/desktop test:run -- apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts
```
