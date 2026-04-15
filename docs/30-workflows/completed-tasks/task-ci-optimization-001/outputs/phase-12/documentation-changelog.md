# Phase 12: Documentation Changelog

## 作成日時

2026-04-14

## 変更サマリ

| 項目                    | baseline（変更前） | current（変更後）                          |
| ----------------------- | ------------------ | ------------------------------------------ |
| node_modules キャッシュ | なし               | `actions/cache@v4`（lockfileハッシュキー） |
| テストシャード数        | 16                 | 17                                         |
| CI_MAX_FORKS            | 2                  | 3                                          |
| CI 実行時間（平均）     | 924s (15m24s)      | 460s (7m40s) 以内（目標）                  |

## ファイル別変更記録

### `.github/actions/pnpm-install-retry/action.yml`

| 変更種別     | baseline                                                               | current                                                                                 |
| ------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| description  | "Run pnpm install with retries to mitigate transient network failures" | "Run pnpm install with retries and node_modules cache"                                  |
| Cache step   | なし                                                                   | `actions/cache@v4` を追加（node*modules, apps/*/node*modules, packages/*/node_modules） |
| Install 条件 | 無条件実行                                                             | `if: steps.cache-node-modules.outputs.cache-hit != 'true'`                              |
| 変更理由     | -                                                                      | CI固定コスト（pnpm install）を全ジョブで省略するため                                    |

### `.github/workflows/ci.yml`

| 変更種別                   | baseline                  | current                                                            |
| -------------------------- | ------------------------- | ------------------------------------------------------------------ |
| シャード配列               | `[1..16]`                 | `[1..17]`                                                          |
| テスト実行コマンド（PR）   | `--shard=N/16`            | `--shard=N/17`                                                     |
| テスト実行コマンド（main） | `--shard=N/16 --coverage` | `--shard=N/17 --coverage`                                          |
| ステップ名                 | `(shard N/16)`            | `(shard N/17)`                                                     |
| 変更理由                   | -                         | 無料枠並列上限内での最適化（399ファイル÷17=23.5ファイル/シャード） |

### `apps/desktop/vitest.config.ts`

| 変更種別     | baseline | current                                                      |
| ------------ | -------- | ------------------------------------------------------------ |
| CI_MAX_FORKS | `2`      | `3`                                                          |
| 変更理由     | -        | I/O待機中の並列不足解消（7GBランナーに対してメモリ余裕あり） |

## Validator 実行結果

```bash
# YAML 構文チェック
$ python3 -c "import yaml; yaml.safe_load(open('.github/actions/pnpm-install-retry/action.yml')); yaml.safe_load(open('.github/workflows/ci.yml'))"
YAML syntax OK
```

✅ バリデーション PASS

## planned wording 確認

```bash
# rg で "仕様策定のみ|実行予定|保留として記録" を確認
# 結果: planned wording なし
```

✅ planned wording なし

## 更新対象ドキュメント

| ドキュメント                                    | 更新内容                                           | 状態 |
| ----------------------------------------------- | -------------------------------------------------- | ---- |
| `index.md`                                      | Phase status を `Phase 12 完了（PR未着手）` に更新 | 完了 |
| `artifacts.json`                                | Phase status を `phase12_completed` に更新         | 完了 |
| `aiworkflow-requirements/LOGS.md`               | TASK-CI-OPT-001 完了記録を追加                     | 完了 |
| `task-specification-creator/LOGS.md`            | TASK-CI-OPT-001 完了記録を追加                     | 完了 |
| `aiworkflow-requirements/SKILL.md`              | current facts を更新                               | 完了 |
| `aiworkflow-requirements/SKILL-changelog.md`    | 変更履歴テーブルを更新                             | 完了 |
| `task-specification-creator/SKILL.md`           | 変更履歴テーブルを更新                             | 完了 |
| `task-specification-creator/SKILL-changelog.md` | 変更履歴テーブルを更新                             | 完了 |
