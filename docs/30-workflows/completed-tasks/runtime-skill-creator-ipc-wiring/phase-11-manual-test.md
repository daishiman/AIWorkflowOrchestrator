# Phase 11: 手動テスト - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 11 - 手動テスト                             |
| 関連Issue | #1434                                       |
| 前提Phase | Phase 10（最終レビュー）                    |
| 作成日    | 2026-03-21                                  |

## 目的

Main Process / Preload / shared contract の変更を current workflow 配下で検証し、  
ユーザー要求に合わせて representative screenshot も残す。

## 実行タスク

- Task 11-1: targeted tests / typecheck / package.json で非視覚検証を行う
- Task 11-2: `channels.ts` / `skill-creator-api.ts` / `creatorHandlers.ts` / shared types の4層整合を grep とコードレビューで確認する
- Task 11-3: review board PNG 3件、`manual-test-checklist.md`、`screenshot-plan.json`、metadata を current workflow 配下へ生成する
- Task 11-4: 結果を `manual-test-result.md` と `discovered-issues.md` に記録する

## 参照資料

| 資料名                     | パス                                                                                                            | 説明                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 2 設計書             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`                                         | runtime public surface 設計                |
| Phase 5 実装書             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md`                                 | 実装判断の正本                             |
| Phase 6 テスト拡充書       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-06-test-expansion.md`                                 | fallback / handoff / unregister の回帰観点 |
| Phase 7 統合テストメモ     | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-7/integration-test.md`                        | 再実行状況                                 |
| Phase 8 リファクタリング書 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-08-refactoring.md`                                    | naming / comment / helper 整理の観点       |
| Phase 9 品質検証書         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-09-quality.md`                                        | typecheck と validator の gate             |
| 最終レビュー結果           | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-10/final-review-result.md`                    | Phase 10 判定結果                          |
| screenshot plan            | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/screenshot-plan.json`                      | review board 計画                          |
| metadata                   | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/screenshots/phase11-capture-metadata.json` | capture 方式と生成時刻                     |

## 実行手順

### Step 1: 非視覚検証

```bash
pnpm --filter @repo/desktop typecheck
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/creatorHandlers.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts \
  src/preload/__tests__/skill-creator-api.runtime.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

### Step 2: screenshot fallback

```bash
node apps/desktop/scripts/capture-runtime-skill-creator-ipc-wiring-phase11.mjs
```

### Step 3: current workflow 記録

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/screenshots/*.png`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`

## テストケース

| TC-ID    | 観点                                | 実行方法                                         | 期待結果                                                 |
| -------- | ----------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| TC-11-01 | targeted runtime tests              | `vitest run ...`                                 | 関連 suite が起動できる                                  |
| TC-11-02 | typecheck                           | `pnpm --filter @repo/desktop typecheck`          | 型エラー 0                                               |
| TC-11-03 | lint script 有無                    | `apps/desktop/package.json` 確認                 | script の有無が明確                                      |
| TC-11-04 | チャンネル定義                      | `channels.ts` 確認                               | 3 チャンネル定義あり                                     |
| TC-11-05 | allowlist                           | `ALLOWED_INVOKE_CHANNELS` 確認                   | 3 チャンネル追加済み                                     |
| TC-11-06 | sender validation                   | `creatorHandlers.ts` 確認                        | 3 handler に適用済み                                     |
| TC-11-07 | facade 登録                         | `ipc/index.ts` 確認                              | optional DI 済み                                         |
| TC-11-08 | preload API + type exposure         | `skill-creator-api.ts` / `preload/types.ts` 確認 | 3 メソッド追加済み + `SkillCreatorAPI` 公開参照あり      |
| TC-11-09 | runtime public surface review board | screenshot                                       | 既存 UI surface から runtime bridge へ到達する導線を確認 |
| TC-11-10 | IPC contract review board           | screenshot                                       | 4層整合を確認                                            |
| TC-11-11 | graceful degradation review board   | screenshot                                       | unavailable message / fallback / handoff を確認          |

## テスト結果マトリクス

| TC-ID    | 期待結果                               | 実測結果                                                              | 判定     |
| -------- | -------------------------------------- | --------------------------------------------------------------------- | -------- |
| TC-11-01 | suite 起動可能                         | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-02 | 型エラー 0                             | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-03 | script 有無明確                        | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-04 | 3 チャンネル定義                       | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-05 | allowlist 追加済み                     | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-06 | sender validation 適用                 | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-07 | optional DI 登録済み                   | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-08 | preload API 3 メソッド + type exposure | `manual-test-result.md` 参照                                          | 記録済み |
| TC-11-09 | review board PNG                       | `screenshots/TC-11-09-skill-creator-runtime-surface-review-board.png` | 記録済み |
| TC-11-10 | review board PNG                       | `screenshots/TC-11-10-runtime-ipc-contract-review-board.png`          | 記録済み |
| TC-11-11 | review board PNG                       | `screenshots/TC-11-11-runtime-graceful-degradation-review-board.png`  | 記録済み |

## 画面カバレッジマトリクス

| テストケース | 対象                                 | 証跡                                                                  | 判定 | 補足                                                       |
| ------------ | ------------------------------------ | --------------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| TC-11-09     | Skill Creator runtime public surface | `screenshots/TC-11-09-skill-creator-runtime-surface-review-board.png` | PASS | `SkillLifecyclePanel` と preload bridge を review board 化 |
| TC-11-10     | IPC contract 4層整合                 | `screenshots/TC-11-10-runtime-ipc-contract-review-board.png`          | PASS | channels / preload / main / shared contract を確認         |
| TC-11-11     | graceful degradation / fallback      | `screenshots/TC-11-11-runtime-graceful-degradation-review-board.png`  | PASS | unavailable message / auth fallback / handoff を確認       |

## 統合テスト連携

| 項目                | 内容                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| Main / Preload 契約 | `channels.ts` / `skill-creator-api.ts` / `creatorHandlers.ts` / shared types の4層整合 |
| Security gate       | `validateIpcSender` / `sanitizeErrorMessage` / P42 blank check                         |
| Runtime fallback    | `RuntimeSkillCreatorFacade` 未注入時の一定 error envelope                              |
| Evidence            | current workflow 配下の review board PNG 3件と metadata                                |

## 成果物

| 成果物                   | パス                                                                                           | 説明                 |
| ------------------------ | ---------------------------------------------------------------------------------------------- | -------------------- |
| Phase 11 仕様書          | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-11-manual-test.md`                   | 本ファイル           |
| 手動テストチェックリスト | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/manual-test-checklist.md` | 実施項目一覧         |
| 手動テスト結果           | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/manual-test-result.md`    | TC ごとの判定        |
| 発見課題一覧             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/discovered-issues.md`     | 環境課題を含む       |
| screenshot plan          | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/screenshot-plan.json`     | 撮影計画             |
| screenshots              | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/screenshots/`             | review board PNG 3件 |

## 完了条件

- [x] `manual-test-checklist.md` を出力した
- [x] `manual-test-result.md` を出力した
- [x] `discovered-issues.md` を出力した
- [x] `screenshot-plan.json` を出力した
- [x] `outputs/phase-11/screenshots/*.png` を生成した
- [x] `phase11-capture-metadata.json` を生成した
- [x] typecheck 結果を記録した
- [x] targeted tests の blocker を記録した
- [x] non-visual / visual evidence の両方を current workflow へ固定した

## 次のPhase

Phase 12: ドキュメント更新
