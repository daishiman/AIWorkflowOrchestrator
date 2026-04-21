# Phase 4 成果物: command-expectations.md

## メタ情報

| 項目     | 値                                                                                |
| -------- | --------------------------------------------------------------------------------- |
| Phase    | 4                                                                                 |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                             |
| Lane     | Lane B                                                                            |
| 目的     | 差分確認 grep / 依存整合チェック / targeted test の期待結果を spec として固定する |

## 1. `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/`

### 期待ヒット対象ファイル

| #   | ファイル                                                                      | 内容                                                                                       |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                           | 関数定義（`export function sendSkillCreatorProgress`）と `createSkill` 内の呼び出し 1 箇所 |
| 2   | `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`     | integration test の import と `sendSkillCreatorProgress(...)` 呼び出し群                   |
| 3   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | validation test の import と `describe("sendSkillCreatorProgress", ...)` ブロック          |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts`   | progress 専用テストのコメント / 呼び出し                                                   |

### 期待ヒット数（本 Phase 時点の参考値）

| 区分         | 期待ヒット数 | 補足                                                              |
| ------------ | ------------ | ----------------------------------------------------------------- |
| prod コード  | 2            | `skillCreatorHandlers.ts` 内の定義 1 + 呼び出し 1                 |
| テストコード | 約 15〜20    | 既存 integration / validation / progress test に分散              |
| 合計         | 15 以上      | 実装追加後も必ず prod 側に呼び出し 1 箇所以上が残ることを静的保証 |

判定基準: `sendSkillCreatorProgress` の `grep` 結果が prod 2 ヒット未満であれば Main 送信経路の後退として Phase 4 gate fail。

## 2. `grep -rn "SkillCreatorProgress" apps/desktop/src/`

### 期待される 3 点（preload 型定義 / Main / Renderer）

| 観点           | ファイル                                                  | 期待出現                                                                                                                        |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| preload 型定義 | `apps/desktop/src/preload/skill-creator-api.ts`           | `export interface SkillCreatorProgress { phase; percentage; message; planId?; requestId?; }` と `onProgress` シグネチャでの参照 |
| Main 送信型    | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`       | `sendSkillCreatorProgress` の progress 引数型に `planId?` / `requestId?` が含まれる（実装時）                                   |
| Renderer Hook  | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | `StreamingProgressApi.onProgress` callback 型に `planId?` / `requestId?` が含まれる（実装時）                                   |

### 期待ヒット数

| 区分                | 期待ヒット数 | 補足                                                                                   |
| ------------------- | ------------ | -------------------------------------------------------------------------------------- |
| prod コード（3 点） | 3 系統以上   | preload 型 / Main 送信 / Renderer Hook の 3 ファイルに最低 1 ヒットずつ                |
| テストコード        | 任意         | 既存テストが `SkillCreatorProgress` 型を直接 import していない限りヒット数は制約しない |

判定基準: 上記 3 系統すべてでヒットが無い場合 Phase 4 gate fail（型拡張が Main / Renderer へ伝播していない）。

## 3. 依存関係整合チェック【必須】

### 3.1 `pnpm install --frozen-lockfile`

| 項目       | 期待                                                             |
| ---------- | ---------------------------------------------------------------- |
| 終了コード | 0                                                                |
| 標準出力   | `Lockfile is up to date` または `Already up to date`             |
| 前提       | 本 spec は実装を伴わないため lockfile は既存から変更されていない |
| 失敗時処理 | `package.json` / `pnpm-lock.yaml` に差分を入れないこと           |

### 3.2 `pnpm --filter @repo/desktop typecheck`

| 項目       | 期待                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 終了コード | 0                                                                                                   |
| 対象       | `@repo/desktop` の TypeScript ソース全体（preload / main / renderer）                               |
| 観点       | `SkillCreatorProgress` に `planId?` / `requestId?` を追加しても既存型利用箇所で型エラーが発生しない |
| 失敗時処理 | 型エラー箇所を Lane A（型拡張）にフィードバックし Phase 5 実装計画を修正                            |

### 3.3 `pnpm --filter @repo/desktop test -- --run useStreamingProgress`

| 項目       | 期待                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| 終了コード | 0                                                                          |
| 対象       | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`   |
| 観点       | 既存テスト（AC-8）が全 PASS、新規 TC-01〜TC-04（spec 記載）が実装後に PASS |
| 失敗時処理 | Phase 6 エッジケースおよび Phase 7 カバレッジ側にフィードバック            |

## 4. spec-only 原則

本成果物は期待値の固定のみを目的とし、実コマンド実行 / 実テスト更新 / コミット作成は本 spec では行わない。実行は Phase 5 以降の実装タスクに委譲する。

## 参照

- phase-4-test-creation.md 差分確認コマンド期待値 / 依存関係整合チェック
- phase-1-requirements.md AC-1 / AC-2 / AC-3 / AC-8 / AC-9
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
