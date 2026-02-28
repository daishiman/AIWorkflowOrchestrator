# スコープ定義 — packages/shared ソースディレクトリ構造統一

## 含むもの

| 項目                      | 詳細                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ファイル移動（5件）       | `auth.ts`、`api-keys.ts`、`common.ts`、`file-selection.ts`、`workflow.ts` を `types/` → `src/types/` に移動                                            |
| index.ts 統合（1件）      | `types/index.ts` の re-export 内容を `src/types/index.ts` に統合                                                                                       |
| テストファイル移行（1件） | `types/__tests__/auth.test.ts` → `src/types/__tests__/auth.test.ts`                                                                                    |
| 設定ファイル更新（3-4件） | `package.json`（exports/typesVersions）、`tsup.config.ts`（entry）、`apps/desktop/tsconfig.json`（paths）、`apps/desktop/vitest.config.ts`（確認のみ） |
| 旧ディレクトリ削除（1件） | `packages/shared/types/` ディレクトリ全体                                                                                                              |

## 含まないもの

| 項目                                 | 理由                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `schemas/` ディレクトリの移動        | 独立した構造であり、`src/` 外に配置されているが別タスクで対応する          |
| `core/` ディレクトリの移動           | `src/` 外に配置されているが今回のスコープ外                                |
| `infrastructure/` ディレクトリの移動 | 同上                                                                       |
| `utils/` ディレクトリの移動          | 同上                                                                       |
| `apps/desktop` の import 文変更      | `exports` + `typesVersions` がパスマッピングを吸収するため変更不要         |
| `apps/web` の import 文変更          | 同上                                                                       |
| `apps/backend` の import 文変更      | 同上                                                                       |
| 新規型定義の追加                     | 既存ファイルの移動のみ。新規型定義の追加は行わない                         |
| `file-selection.ts` の内容変更       | 移動のみ。`schemas` 経由のエクスポートとの重複解決は内容変更なしで対処する |

## 前提条件

| 前提条件                                        | ステータス |
| ----------------------------------------------- | ---------- |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の完了 | 完了予定   |
| `packages/shared` のビルドが現在成功している    | 確認必要   |
| `apps/desktop` の型チェックが現在成功している   | 確認必要   |

## リスク

| リスク                              | 影響度 | 対策                                                                              |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `file-selection.ts` の名前衝突      | 低     | `schemas` 経由で既にカバーされている型は re-export しない                         |
| PostToolUse フック Edit 失敗（P11） | 低     | 大量編集後は `git diff --stat` で変更数を検証する                                 |
| ビルドキャッシュが古いパスを参照    | 低     | `pnpm --filter @repo/shared clean && pnpm --filter @repo/shared build` で再ビルド |
