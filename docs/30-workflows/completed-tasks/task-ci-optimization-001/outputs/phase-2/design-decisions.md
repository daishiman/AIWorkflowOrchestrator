# Phase 2: 設計決定記録

## 実行日時

2026-04-14

## 3つの改善レイヤー

| レイヤー     | 対象ファイル                                    | 改善内容                    | 期待削減効果 |
| ------------ | ----------------------------------------------- | --------------------------- | ------------ |
| Setup 最適化 | `.github/actions/pnpm-install-retry/action.yml` | node_modules キャッシュ導入 | ~3〜4min     |
| Shard 最適化 | `.github/workflows/ci.yml`                      | シャード数 16→17            | ~20〜30s     |
| Vitest 設定  | `apps/desktop/vitest.config.ts`                 | CI_MAX_FORKS 2→3            | ~30s前後     |

## 設計判断記録

| 決定事項                      | 選択                                  | 理由                                                    |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------- |
| キャッシュ配置方式            | `pnpm-install-retry` composite action | setup job パターンより変更量少・既存構造維持            |
| キャッシュキー                | `hashFiles('pnpm-lock.yaml')`         | ロックファイル変更時の自動無効化                        |
| シャード数                    | 17                                    | GitHub Free Tier 並列上限（20）内で最適化               |
| CI_MAX_FORKS                  | 3                                     | I/O 待機中のアイドル削減。7GBランナーに対してメモリ余裕 |
| security + module-sync の統合 | 見送り                                | 現状の実行時間が short (~1min) のため、優先度低と判断   |

## 設計上の根拠

### node_modules キャッシュ: composite action への集約を採用した理由

`pnpm-install-retry` は全ジョブから呼ばれており、cache ロジックを 1 箇所に集約できる。
setup job パターンは `needs: [setup]` の依存追加が必要でジョブ数が増加する。

### シャード数 17 を選択した理由

- 399ファイル ÷ 17 = 23.47ファイル/シャード（16シャードより5〜8%短縮）
- GitHub Free Tier 上限20に対して: 17(test-desktop) + 1(typecheck) + 1(test-shared) + 1(e2e) = 20（ちょうど収まる）
- 18シャード以上は他ジョブとの合計で上限を超える可能性

### CI_MAX_FORKS 3 を選択した理由

- GitHub Actions ubuntu-latest ランナーのメモリ: 7GB
- Electron テストプロセス 1プロセスあたりの推定メモリ: ~200〜400MB
- CI_MAX_FORKS=3 の推定合計: ~1.2〜1.6GB（7GB に対して余裕あり）
- 4以上はメモリリスクが高まるためバランスポイントとして3を選択
