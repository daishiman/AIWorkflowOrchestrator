# Phase 7: キャッシュ効果レポート

## 作成日時

2026-04-14

## キャッシュ設計確認

### キャッシュキー設計

| 項目               | 値                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| プライマリキー     | `Linux-node-modules-<pnpm-lock.yaml のハッシュ>`                                                                       |
| フォールバックキー | `Linux-node-modules-`                                                                                                  |
| キャッシュ対象パス | node_modules, apps/desktop/node_modules, apps/web/node_modules, packages/shared/node_modules, packages/ui/node_modules |

### キャッシュヒット率の見込み

| 実行パターン                    | キャッシュ状態                | pnpm install 実行        |
| ------------------------------- | ----------------------------- | ------------------------ |
| 初回 CI（lockfile 変更後）      | キャッシュミス                | あり（フルインストール） |
| 2回目以降（lockfile 変更なし）  | キャッシュヒット              | なし（スキップ）         |
| PR ブランチで lockfile 変更なし | キャッシュヒット（main から） | なし                     |

### 期待キャッシュヒット率

- **初回実行後**: 0%（初回はキャッシュ作成のみ）
- **2回目以降**: 100%（pnpm-lock.yaml が変更されていない場合）

## キャッシュヒット確認コマンド（CI 実行後）

```bash
# 特定の run でキャッシュヒット状況を確認
gh run view <run-id> --log | grep -E "Cache node_modules|cache-hit|Restoring cache|Cache not found"

# キャッシュ一覧
gh cache list --limit 10 --json key,sizeInBytes,createdAt \
  --jq '.[] | {key: .key, size_mb: (.sizeInBytes/1048576 | floor), created: .createdAt}'
```

## 実測キャッシュ記録（CI 実行後に記入）

| Run ID   | キャッシュ状態 | ヒットジョブ数 | ミスジョブ数 | 備考            |
| -------- | -------------- | -------------- | ------------ | --------------- |
| 実測待ち | -              | -              | -            | Phase 11 で計測 |

## 改善効果の総括

### node_modules キャッシュ導入による削減効果（設計値）

| ジョブ                     | 削減見込み（pnpm install 省略時）                    |
| -------------------------- | ---------------------------------------------------- |
| build-shared               | ~60〜90s                                             |
| test-desktop（各シャード） | ~60〜90s                                             |
| クリティカルパス上の効果   | ~3〜4min（build-shared + test-desktop の固定費削減） |

### 3施策合計の削減見込み

| 施策                    | 削減効果見込み |
| ----------------------- | -------------- |
| node_modules キャッシュ | ~3〜4min       |
| シャード数 16→17        | ~20〜30s       |
| CI_MAX_FORKS 2→3        | ~30s前後       |
| **合計**                | **~4〜5min**   |

目標 460s（7m40s）に対して: 924s - 270s = 654s（推定）

> 実際の削減効果は CI 実行後の Phase 11 計測で確定する。
