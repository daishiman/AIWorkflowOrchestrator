# Phase 7 Coverage Report

## 更新日

2026-04-20

## サマリー

| 区分          | 分母 | 導入済み | 完了率 |
| ------------- | ---: | -------: | -----: |
| Wave 1 direct |    7 |        7 |   100% |
| Wave 2 direct |   16 |       16 |   100% |
| Wave 3 direct |   25 |        0 |     0% |
| direct 合計   |   48 |       23 |  47.9% |
| auxiliary     |    1 |        1 |   100% |

- direct coverage の正本分母は `48`
- 実ファイル数は `24`（direct 23 + auxiliary 1）
- 実テスト数は `121`

## 実行証跡

### Wave 1

- コマンド:
  - `ESBUILD_BINARY_PATH=<repo>/node_modules/.pnpm/esbuild@0.21.5/node_modules/@esbuild/darwin-arm64/bin/esbuild VITEST_MAX_FORKS=1 VITEST_FILE_PARALLELISM=false pnpm --dir apps/desktop exec vitest run ...wave1 8 files... --reporter=dot`
- 結果:
  - `8 files / 41 tests PASS`
  - Vitest duration: `197.79s`
  - tests time: `17.40s`

### Wave 2

- コマンド:
  - `ESBUILD_BINARY_PATH=<repo>/node_modules/.pnpm/esbuild@0.21.5/node_modules/@esbuild/darwin-arm64/bin/esbuild VITEST_MAX_FORKS=1 VITEST_FILE_PARALLELISM=false pnpm --dir apps/desktop exec vitest run ...wave2 16 files... --reporter=dot`
- 結果:
  - `16 files / 80 tests PASS`
  - Vitest duration: `112.26s`
  - tests time: `8.91s`

## 注意点

- 24 files 一括実行はこの環境で `SIGKILL` した
- したがって現時点の安定運用は「wave 分割 + single-fork 実行」
- `creatorHandlers.registrationSnapshot.test.ts` は `registerRuntimeSkillCreatorHandlers` 用であり、direct 分母 48件には含めない

## Wave 3 残課題

- 計画・難所整理は [`wave3-prereq-check.md`](./../phase-6/wave3-prereq-check.md) に記録済み
- 25 direct unit は後続 wave として未導入

## ゲート判定

- AC-004: PASS
- AC-005: PASS
- AC-006: PASS
- Phase 8 進行可
