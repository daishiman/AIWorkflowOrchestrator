# Phase 1 要件定義書

## 概要

- タスクID: UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001
- 目的: screenshot再取得を `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` に統一し、Phase 11/12 文書と実行手順の再現性を担保する。

## FR（機能要件）

| ID   | 要件                                                                                  | 判定方法                                    |
| ---- | ------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------- |
| FR-1 | `apps/desktop/package.json` に `screenshot:skill-import-idempotency-guard` を登録する | `pnpm --filter @repo/desktop run            | rg screenshot` で確認 |
| FR-2 | workflow02 の Phase 11/12 文書コマンドを `run screenshot:*` へ統一する                | 対象2ファイルの `rg` 確認                   |
| FR-3 | 実行ログ（run一覧 / screenshot実行 / coverage）を保存する                             | `outputs/phase-5/command-run-log.md` に記録 |

## NFR（非機能要件）

| ID    | 要件                               | 判定方法                                                    |
| ----- | ---------------------------------- | ----------------------------------------------------------- |
| NFR-1 | 同一コマンドで再実行可能           | 同日再実行で screenshot 再取得成功                          |
| NFR-2 | 再現手順が3コマンド以内            | run一覧→実行→coverage の3手順                               |
| NFR-3 | 監査値を current/baseline 分離記録 | `audit-unassigned-tasks --json --diff-from HEAD` の値を記録 |

## SubAgent分担（仕様書別）

| SubAgent | 担当                   | 出力                    |
| -------- | ---------------------- | ----------------------- |
| A        | コマンド登録要件の確定 | FR-1, 命名規約          |
| B        | 文書同期要件の確定     | FR-2, 置換対象2ファイル |
| C        | 検証要件の確定         | FR-3, NFR-1〜3          |

## 完了判定

- [x] FR-1〜FR-3 を定義
- [x] NFR-1〜NFR-3 を定義
- [x] SubAgent-A/B/C の責務を明記
- [x] 統合テスト観点（発見性/実行性/証跡整合）を確定
