# Phase 2 テストアーキテクチャ

## テスト層

| 層                | 対象                                       | 主なケース                                                            |
| ----------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Core unit         | `phase11-current-build-preflight-core.mjs` | success、native fail、build fail、harness fail、baseUrl fail、blocked |
| CLI smoke         | `phase11-current-build-preflight.mjs`      | `--json`, `--write`, `--no-auto-serve`, `--base-url`, exit code       |
| Integration guard | capture metadata                           | preflight summary の保存、重複 orchestration の不在                   |

## no-duplication 検証

- capture script から `probeStaticServer` / `startRendererStaticServer` 直呼びを除去する。
- baseUrl readiness の一次判定は shared core 側だけが持つ。
- wrapper は `runPhase11CurrentBuildPreflight()` の戻り値を変換するだけにする。

## Phase 7 実行コマンド

1. `pnpm --filter @repo/desktop exec vitest run scripts/phase11-current-build-preflight-core.test.ts scripts/phase11-current-build-preflight.test.ts`
2. `pnpm --filter @repo/desktop build`
3. `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json`
