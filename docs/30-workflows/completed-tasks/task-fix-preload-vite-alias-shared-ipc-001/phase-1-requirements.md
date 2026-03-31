# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 1                                          |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 目的

`@repo/shared/src/ipc/channels` の build/test 解決ドリフトを特定し、shared IPC 正本を同一waveで安定利用できる要件を確定する。

## 問題の現状

### 症状

- preload bundle に `require("@repo/shared/src/ipc/channels")` が残ると `window.electronAPI` が壊れる
- 実測で `pnpm exec vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts src/main/services/runtime/__tests__/governance-bundle.test.ts` を実行すると、Vitest が `@repo/shared/src/ipc/channels` を解決できず 1 suite fail する

### 根本原因

1. preload build:
   `externalizeDepsPlugin()` が `@repo/shared` を external 扱いにするため、`resolve.alias` 単独では shared IPC channel を bundle に取り込めない。
2. test runtime:
   `apps/desktop/vitest.config.ts` に同 alias がなく、shared IPC channel の import で `vite:import-analysis` が失敗する。

## 要件

### 機能要件

- REQ-1: `electron.vite.config.ts` の preload で `@repo/shared` を external から除外し、`@repo/shared/src/ipc/channels` を source file へ alias する
- REQ-2: `vitest.config.ts` にも同 alias を追加する
- REQ-3: `governance-bundle.test.ts` の 7 階層相対パスを shared alias に戻す
- REQ-4: `apps/desktop/src/preload/channels.ts` の shared 正本参照は維持する

### 非機能要件

- NFR-1: 変更は build/test 設定と既存テスト 1 ファイルの import 正規化に留める
- NFR-2: `@repo/shared` の他サブパスに意図しない bundle 混入を起こさない
- NFR-3: build / typecheck / targeted vitest が通る

## 受け入れ条件

- AC-1: `pnpm --filter @repo/desktop build` 後、`apps/desktop/out/preload/index.js` に `@repo/shared/src/ipc/channels` の `require()` が残らない
- AC-2: `apps/desktop/out/preload/index.js` に `skill:list` 等の channel 文字列がインライン化される
- AC-3: `pnpm --filter @repo/desktop typecheck` が PASS する
- AC-4: targeted vitest が PASS する
- AC-5: `governance-bundle.test.ts` に 7 階層相対パス workaround が残らない
- AC-6: main / renderer の build には影響がない

## 関連タスク整理

`UT-DX-VITE-ALIAS-SHARED-IMPORT-001` は 2026-03-29 時点では follow-up として分離されていた。
今回の review で current failure だと判明したため、本 wave で吸収して完了移管する。

## 成果物

| 成果物     | パス                                         |
| ---------- | -------------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` |
