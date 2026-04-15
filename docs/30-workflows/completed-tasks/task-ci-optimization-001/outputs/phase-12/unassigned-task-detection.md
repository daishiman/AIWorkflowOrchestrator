# Phase 12: Unassigned Task Detection

## 作成日時

2026-04-14

## TODO/FIXME/HACK/XXX の確認

```bash
# rg -n "TODO|FIXME|HACK|XXX" .github/workflows/ci.yml apps/desktop/vitest.config.ts
# 結果: 0件
```

✅ CI 設定ファイルに TODO/FIXME/HACK/XXX なし

## 未タスク候補

今回の実装で対応しなかった改善案を記録する（Phase 3 MINOR・Phase 10 所見・Phase 11 所見から）。

| ID            | 未タスク内容                                | 優先度 | 理由                                                                             |
| ------------- | ------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| CI-FUTURE-001 | GitHub Actions Larger ランナーへの移行      | 低     | 有料プランが必要。費用対効果の検討が必要                                         |
| CI-FUTURE-002 | `test-web` シャードの追加                   | 中     | 現状 `test-desktop` のみシャード化。web側のテスト数が増えた場合に対応            |
| CI-FUTURE-003 | キャッシュヒット率のモニタリング設定        | 低     | GitHub Actions のダッシュボードで確認可能だが、アラート設定があると便利          |
| CI-FUTURE-004 | CI 実行時間の定期的なトレンド計測スクリプト | 低     | 定期的に `gh run list` を実行してトレンドを記録するスクリプト                    |
| CI-FUTURE-005 | CI-M-01 の実測確認とシャード数の最終判定    | 高     | Phase 11 後の CI 実行でキューイング時間を確認。1分超の場合はシャード数を16に戻す |

## CI-FUTURE-005 の対処手順（CI-M-01）

CI-M-01 はシャード数17での並列上限（20）到達の MINOR 指摘。

```bash
# キューイング時間の確認（CI 実行後）
gh run view <run-id> --json jobs \
  --jq '.jobs[] | select(.name | startswith("Test (desktop)")) | {name: .name, startedAt: .startedAt, completedAt: .completedAt}'

# 判定基準:
# - キューイング 1 分未満 → シャード数 17 を維持
# - キューイング 1 分超 → ci.yml のシャード数を 16 に戻す
```

## 未タスク移管

CI-FUTURE-001〜004 は即座に対応が必要なものではないため、将来のバックログとして記録する。
CI-FUTURE-005 は PR push 後の CI 実行で確認必須。
