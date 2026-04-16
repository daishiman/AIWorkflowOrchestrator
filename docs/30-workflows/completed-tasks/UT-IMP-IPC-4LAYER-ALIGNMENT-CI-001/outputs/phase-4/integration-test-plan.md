# Phase 4 統合テスト計画

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| Phase    | 4                                  |
| 作成日   | 2026-04-14                         |

---

## 統合テスト方針

フィクスチャベースの結合テストにより、shared -> preload -> main -> renderer の4層パイプライン全体をテスト用データで検証する。実際のプロジェクトファイルに依存せず、テストファイル内に定義したフィクスチャ文字列を使用する。

### テスト実装場所

`scripts/__tests__/verify-ipc-4layer/e2e.test.ts`

---

## フィクスチャ設計

### フィクスチャ構成

| フィクスチャ名         | 模倣対象                                 | 内容                                       |
| ---------------------- | ---------------------------------------- | ------------------------------------------ |
| `SHARED_FIXTURE`       | `packages/shared/src/ipc/channels.ts`    | 3グループ、6チャネル（FILE/CHAT/単独定数） |
| `PRELOAD_FIXTURE`      | `apps/desktop/src/preload/channels.ts`   | IPC_CHANNELS 7件 + ALLOWED_INVOKE/ON       |
| `MAIN_HANDLER_FIXTURE` | `apps/desktop/src/main/ipc/*Handlers.ts` | ipcMain.handle 6件                         |
| `RENDERER_FIXTURE`     | renderer 層の safeInvoke/safeOn 使用箇所 | safeInvoke 2件 + safeOn 1件                |

### チャネルマッピング

フィクスチャ間のチャネル対応関係:

| チャネル名                   | shared | preload | main | renderer |
| ---------------------------- | ------ | ------- | ---- | -------- |
| `file:read`                  | o      | o       | o    | o        |
| `file:write`                 | o      | o       | o    |          |
| `file:delete`                | o      | o       | o    |          |
| `chat:send`                  | o      | o       | o    | o        |
| `chat:exportSession`         | o      | o       | o    |          |
| `skill-creator:output-ready` | o      | o       |      | o        |
| `analytics:send`             |        | o       | o    |          |

---

## 統合テストシナリオ

### シナリオ1: 全層整合（正常系）

| 項目         | 内容                                                                                                                                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 入力         | 4層フィクスチャ全て（上記テーブルのチャネルが正しく配置）                                                                                                                                                                                                                                |
| パイプライン | parseSharedChannels -> parseSharedGroupMap -> parsePreloadWhitelist -> buildPreloadChannelMap -> parseMainHandlersFromContent -> resolveMainChannelRefs -> parseRendererUsageFromContent -> validateSharedToPreload -> validatePreloadToMain -> validateRendererToShared -> formatReport |
| 期待結果     | Rule-1: PASS, Rule-2: PASS, Rule-3: PASS                                                                                                                                                                                                                                                 |
| 判定         | hasErrors=false, "Passed: 3", "Failed: 0"                                                                                                                                                                                                                                                |
| 対応要件     | AC-5, FR-5                                                                                                                                                                                                                                                                               |

### シナリオ2: shared -> preload 不整合 (Rule-1 FAIL)

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| 入力     | shared に `test:two` を追加、preload に未登録  |
| 期待結果 | Rule-1: FAIL, missing に `test:two` が含まれる |
| 対応要件 | AC-2, FR-1, FR-4                               |

### シナリオ3: preload -> main 不整合 (Rule-2 FAIL)

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| 入力     | preload に `action:two` を登録、main に未実装    |
| 期待結果 | Rule-2: FAIL, missing に `action:two` が含まれる |
| 対応要件 | AC-3, FR-2, FR-4                                 |

### シナリオ4: renderer -> shared 不整合 (Rule-3 FAIL)

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 入力     | renderer で `unknown:channel` を使用、shared に未定義 |
| 期待結果 | Rule-3: FAIL, missing に `unknown:channel` が含まれる |
| 対応要件 | AC-4, FR-3, FR-4                                      |

### シナリオ5: 複合不整合（全ルール FAIL）

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| 入力     | 3つのルールそれぞれで不整合を持つバリデーション結果           |
| 期待結果 | hasErrors=true, "Failed: 3", 全チャネル名がレポートに含まれる |
| 対応要件 | FR-4, FR-5                                                    |

### シナリオ6: IPC_CHANNELS 参照解決

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| 入力     | `__IPC_CHANNELS_REF__:FILE_READ` と `__CHANNELS_REF__:CHAT_CHANNELS.CHAT_SEND` を含む raw セット |
| 期待結果 | `resolveMainChannelRefs` により `file:read` と `chat:send` に解決される                          |
| 対応要件 | FR-6                                                                                             |

### シナリオ7: camelCase チャネル名パイプライン

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 入力     | `chat:exportSession`, `skill:getDetail` が4層全てに正しく定義されている |
| 期待結果 | 全ルール PASS（camelCase がパイプライン全体で正しく処理される）         |
| 対応要件 | FR-6                                                                    |

---

## テストデータの独立性保証

- テストフィクスチャはすべてテストファイル内の文字列定数として定義
- 実際のプロジェクトファイル（`packages/shared/src/ipc/channels.ts` 等）には一切依存しない
- これにより、プロジェクトの IPC チャネル変更がテストに影響しない
- 一時ディレクトリ（`os.tmpdir()`）を使用するテスト（`parseMainHandlers`, `parseRendererUsage`）は `try/finally` でクリーンアップを保証する
