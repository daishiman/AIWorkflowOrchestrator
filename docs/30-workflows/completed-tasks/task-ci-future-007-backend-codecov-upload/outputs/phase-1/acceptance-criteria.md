# Phase 1: 受入基準 (acceptance-criteria)

## 受入基準 AC-1〜AC-5

| AC番号 | 基準                                                                                                                      | 検証方法                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AC-1   | `test-web` ジョブに PR / main push の条件分岐が追加されている                                                             | `ci.yml` の diff 確認・`if:` 条件ブロックの存在確認           |
| AC-2   | main push 時に `VITEST_SHARDED_COVERAGE=true` 環境変数が設定され `--coverage` オプションが付与される                      | CI ログの vitest 実行コマンド確認                             |
| AC-3   | main push 時に `backend-coverage-{shard}` アーティファクトがアップロードされる                                            | CI ログの `upload-artifact` ステップ確認                      |
| AC-4   | `coverage` ジョブで `backend-coverage-*` アーティファクトをダウンロードし Codecov に `backend` フラグでアップロードされる | CI ログの codecov-action ステップの flags 確認                |
| AC-5   | PR 時の `test-web` 実行時間がカバレッジ追加前と変化しない（PR はカバレッジ収集なし）                                      | PR ブランチの CI ログで `--coverage` が付与されないことを確認 |

---

## 追加確認事項

| 項目             | 内容                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| desktop 回帰なし | `coverage` ジョブの `desktop` フラグアップロードが維持されること                                     |
| YAML 構文        | `ci.yml` が有効な YAML であること（`python3 -c "import yaml; yaml.safe_load(..."` で確認）           |
| vitest reporter  | `apps/backend/vitest.config.ts` の reporter に `json` と `lcov` が含まれること                       |
| `enabled` フラグ | `apps/backend/vitest.config.ts` に `enabled: !!process.env.VITEST_SHARDED_COVERAGE` が設定されること |
