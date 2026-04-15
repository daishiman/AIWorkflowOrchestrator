# Phase 4: ロールバック基準

## 実行日時

2026-04-14

## ロールバック判断基準

| 状況                                      | 判定         | アクション                                                   |
| ----------------------------------------- | ------------ | ------------------------------------------------------------ |
| キャッシュ追加後に CI が遅くなった        | ロールバック | node_modules キャッシュ設定を action.yml から削除            |
| OOM エラーが増加した                      | 調査・修正   | CI_MAX_FORKS を 2 に戻す                                     |
| 特定シャードが断続的に失敗する            | 調査・修正   | シャード数を 16 に戻す                                       |
| CI 実行時間が 7分40秒を超えたまま変化なし | 計測継続     | 5 回分の平均で再判定                                         |
| キャッシュ download 時間が 90 秒超        | ロールバック | node_modules キャッシュ廃止、pnpm ストアキャッシュのみに戻す |
| 第2波のキューイング待機が 1 分超          | 調整         | シャード数を 16 に戻す（CI-M-01 対処）                       |

## ロールバック手順

```bash
# 1. 変更前後の diff 確認
git diff HEAD~1 .github/actions/pnpm-install-retry/action.yml
git diff HEAD~1 .github/workflows/ci.yml
git diff HEAD~1 apps/desktop/vitest.config.ts

# 2. 個別ロールバック（各施策ごとに独立してロールバック可能）
# A. node_modules キャッシュのみ削除
git checkout HEAD~1 -- .github/actions/pnpm-install-retry/action.yml

# B. シャード数のみ 16 に戻す
# ci.yml の shard 配列を [1..16] に戻し、/17 を /16 に変更

# C. CI_MAX_FORKS のみ 2 に戻す
# vitest.config.ts の CI_MAX_FORKS = 3 を CI_MAX_FORKS = 2 に変更
```

## 施策別独立ロールバック可否

| 施策                    | 独立ロールバック | 手順                              |
| ----------------------- | ---------------- | --------------------------------- |
| node_modules キャッシュ | ✅ 可能          | action.yml から cache step を削除 |
| シャード数 16→17        | ✅ 可能          | ci.yml の matrix と /N を変更     |
| CI_MAX_FORKS 2→3        | ✅ 可能          | vitest.config.ts の定数を変更     |

各施策は独立しているため、問題発生時に原因となった施策のみをロールバックできる。
