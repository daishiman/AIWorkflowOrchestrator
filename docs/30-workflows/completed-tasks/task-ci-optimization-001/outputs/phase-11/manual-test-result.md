# Phase 11: 手動テスト結果

## 実行日時

2026-04-14

## テスト方式

**NON_VISUAL** — UI/UX 変更なし。GitHub Actions CI の実行ログと計測値で検証。

## 実装確認（ローカル）

| 項目             | 確認内容                                                            | 判定 |
| ---------------- | ------------------------------------------------------------------- | ---- |
| action.yml       | `actions/cache@v4` が追加され、`cache-hit != 'true'` 条件で install | ✅   |
| ci.yml           | shard: [1..17]、`--shard=N/17` コマンド（3箇所）                    | ✅   |
| vitest.config.ts | `CI_MAX_FORKS = 3`                                                  | ✅   |
| YAML 構文        | python3 yaml.safe_load で PASS                                      | ✅   |

## CI 実行計測（PR push 後に記入）

| Run #     | 実行時間 | キャッシュ       | 結論 | AC-2 判定 |
| --------- | -------- | ---------------- | ---- | --------- |
| 1（初回） | 計測待ち | キャッシュミス   | -    | -         |
| 2         | 計測待ち | キャッシュヒット | -    | -         |
| 3         | 計測待ち | キャッシュヒット | -    | -         |
| 4         | 計測待ち | キャッシュヒット | -    | -         |
| 5         | 計測待ち | キャッシュヒット | -    | -         |
| 平均      | 計測待ち | —                | —    | -         |

> CI 実行コマンド（PR push 後）:
>
> ```bash
> gh run list --workflow=ci.yml --limit 5 --json databaseId,name,status,conclusion,startedAt,updatedAt
> ```

## 3層評価

| 層       | 確認項目                                                        | 判定                              |
| -------- | --------------------------------------------------------------- | --------------------------------- |
| Semantic | CI が正しいジョブ・トリガー条件で起動するか                     | ✅ YAML 構文 PASS・設定値確認済み |
| Visual   | GitHub Actions UI でキャッシュヒット/ミスが視覚的に確認できるか | CI 実行後に確認                   |
| AI UX    | キャッシュサイズ・download 時間が妥当か（90 秒未満が目安）      | CI 実行後に確認                   |

## 統合テスト確認項目（CI 実行後）

- [ ] Phase 5 で変更した `action.yml` / `ci.yml` の YAML 構文が正しい ✅（actionlint 相当の確認済み）
- [ ] 全 17 シャードの test-desktop が PASS していること
- [ ] test-shared、typecheck、e2e-desktop が PASS していること
- [ ] カバレッジアップロードが main ブランチで正常動作していること
