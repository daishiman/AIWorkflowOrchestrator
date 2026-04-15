# Phase 4: 検証計画書

## 実行日時

2026-04-14

## 事前確認結果

```bash
# 現行設定確認結果:
# .github/workflows/ci.yml: shard: [1..16], /16 コマンド
# apps/desktop/vitest.config.ts: CI_MAX_FORKS = 2
# .github/actions/pnpm-install-retry/action.yml: actions/cache 設定なし
# pnpm-lock.yaml: 存在確認済み
```

## キャッシュ動作確認観点

### Phase 5 実装後の確認観点

| 観点                             | 確認方法                                      | 期待動作                                          |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| キーの形式                       | CI ログの "Cache node_modules" ステップを確認 | `Linux-node-modules-<hash>` 形式で出力される      |
| キャッシュヒット時の動作         | ログの "Cache restored successfully" を確認   | `cache-hit: true` になり install がスキップされる |
| キャッシュミス時のフォールバック | restore-keys でのパーシャルマッチ確認         | 旧バージョンから部分的に復元される                |
| pnpm-lock.yaml 変更時の動作      | ロックファイル変更後の CI ログを確認          | キャッシュキーが変わり再 install が走る           |

### 検証コマンド（CI 実行後）

```bash
# 直近 5 回の CI 実行結果を取得
gh run list --workflow=ci.yml --limit 5 --json databaseId,startedAt,updatedAt,conclusion,status

# 特定の run のキャッシュステップのログ確認
gh run view <run-id> --log | grep -A 5 "Cache node_modules"

# キャッシュの一覧確認
gh cache list --limit 10
```

## 計測基準

### ベースライン（Phase 5 実装前）

| ジョブ名                         | 計測前の実績値     | 改善後の目標時間  |
| -------------------------------- | ------------------ | ----------------- |
| CI 全体                          | 924s（15m24s）平均 | 460s（7m40s）以内 |
| test-desktop（最長シャード想定） | ~8〜9min           | ~6〜7min          |

ベースラインは `outputs/phase-4/baseline-timing.md` に記録済み。

## 回帰テスト計画

シャード数 16→17 変更後も全テストが PASS し続けることを確認する計画:

### 確認方法

```bash
# シャード変更後の全シャード結果確認
gh run list --workflow=ci.yml --limit 1 --json databaseId \
  --jq '.[0].databaseId' | xargs gh run view --json jobs \
  --jq '.jobs[] | select(.name | startswith("Test (desktop)")) | {name: .name, conclusion: .conclusion}'

# 失敗シャードがないことを確認
gh run view <run-id> --json jobs \
  --jq '[.jobs[] | select(.name | startswith("Test (desktop)")) | select(.conclusion != "success")] | length'
```

### 回帰確認基準

- シャード数 17 の全シャードが `success` であること
- 失敗シャード数が 0 であること
- テスト総件数が変更前と同等であること（シャード分割による件数変化がないこと）

## ロールバック計画（別ファイル参照）

`outputs/phase-4/rollback-criteria.md` に記録済み。
