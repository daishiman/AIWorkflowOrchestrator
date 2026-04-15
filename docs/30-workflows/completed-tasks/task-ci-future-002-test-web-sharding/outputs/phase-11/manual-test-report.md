# 手動テストレポート

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 概要

`test-web` シャード化 CI 設定変更の手動テスト検証レポート。

## 検証スコープ

- **対象**: `.github/workflows/ci.yml` の修正内容
- **検証種別**: NON_VISUAL（CI 設定変更、UI なし）
- **検証環境**: ローカル + GitHub Actions（CI 実行後確認）

## ローカル検証結果

| シナリオ                 | 手順                                                      | 結果                  |
| ------------------------ | --------------------------------------------------------- | --------------------- |
| test-web シャード 1 実行 | `pnpm --filter @repo/backend exec vitest run --shard=1/2` | ✅ EXIT 0             |
| test-web シャード 2 実行 | `pnpm --filter @repo/backend exec vitest run --shard=2/2` | ✅ EXIT 0（0 件実行） |
| YAML 構文検証            | `python3 -c "import yaml; yaml.safe_load(...)"`           | ✅ エラーなし         |
| 並列数計算検証           | Python スクリプト（TC-04）                                | ✅ 合計 = 20          |

## CI 検証シナリオ（PR 作成後に確認）

| シナリオ                  | 確認手順                       | 期待結果                           |
| ------------------------- | ------------------------------ | ---------------------------------- |
| test-web シャード分割確認 | Actions タブ → test-web ジョブ | matrix として 2 個のシャードが表示 |
| 全シャード PASS           | 各シャードのステータス確認     | 全 green（PASS）                   |
| 並列数上限確認            | 同時実行ジョブ数のカウント     | 合計 20 以内                       |
| 実行時間確認              | wall clock time 確認           | ベースラインを上回らない           |

## 所見

1. `@repo/backend` テストファイルが 1 件（`health.test.ts`）のため shard=2/2 は 0 件実行
2. Vitest は 0 件テストでも EXIT 0 を返すため CI に問題なし
3. テストファイルが増加した場合は自動的に両シャードに分配される

## 総合判定

**PASS**（ローカル検証完了。CI 実行結果は Phase 13 PR 作成後に確認予定）
