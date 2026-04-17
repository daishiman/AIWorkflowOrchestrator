# Phase 1: リスク整理 (risks)

## リスク一覧

| リスクID | リスク内容                                                            | 影響                                                       | 対応方針                                                            |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| R-01     | PR 実行時間増加                                                       | AC-5 違反                                                  | 条件分岐により PR 時は `--coverage` なし                            |
| R-02     | desktop 回帰                                                          | Codecov dashboard の desktop データ欠損                    | 既存 `desktop` アップロードステップを変更せず追加のみ               |
| R-03     | coverage ディレクトリ混在                                             | desktop/backend のカバレッジが混在してアップロード先が不正 | desktop を `coverage/desktop`、backend を `coverage/backend` に分離 |
| R-04     | `if-no-files-found: error` でカバレッジファイルが未生成の場合 CI 失敗 | main push 時にカバレッジが生成されない場合ブロック         | vitest の `enabled` フラグと reporter 設定を事前に確認              |
| R-05     | シャード数変更時のアーティファクト欠損                                | coverage ジョブで一部シャードのデータが欠損                | `{shard}` 変数で動的命名しているため自動追従（低リスク）            |

---

## PR 実行時間への影響評価

- **現行 PR 実行**: `pnpm --filter @repo/backend exec vitest run --shard=X/2`（カバレッジなし）
- **変更後 PR 実行**: 同じコマンド（条件分岐により変化なし）
- **変更後 main push**: `VITEST_SHARDED_COVERAGE=true ... --coverage` 追加（+20〜30% 程度）
- **結論**: PR への影響なし（AC-5 満足）

---

## desktop 回帰リスク評価

- 既存の `desktop-coverage-*` ダウンロードと Codecov `flags: desktop` アップロードは変更なし
- backend 対応は独立した新規ステップとして追加
- **結論**: 後方互換性あり（MAJOR リスクなし）

---

## apps/backend/vitest.config.ts 修正要否

- **修正必要**: `reporter` に `lcov` 追加（現在: `['text', 'json', 'html']`）
- **修正必要**: `enabled: !!process.env.VITEST_SHARDED_COVERAGE` 追加
- **任意**: `reportsDirectory: './coverage'` 明示的設定（デフォルト値と同じなので省略可）
