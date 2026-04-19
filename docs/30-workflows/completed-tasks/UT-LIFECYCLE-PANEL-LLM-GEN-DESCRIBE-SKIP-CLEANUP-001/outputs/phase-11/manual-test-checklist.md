# Manual Test Checklist

## 判定

- タスク種別: `NON_VISUAL`
- スクリーンショット取得: `N/A`

## チェック項目

1. `describe.skip` / `it.skip` / `test.skip` が対象テストファイルに残っていない。
2. `planSkill` / `detectMode` の廃止済み API 参照が残っていない。
3. `pnpm --filter @repo/desktop test:run` が PASS する。
4. `pnpm --filter @repo/desktop typecheck` が PASS する。
5. `pnpm --filter @repo/desktop lint` が PASS する。
