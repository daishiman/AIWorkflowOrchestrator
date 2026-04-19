# Phase 11: 手動テストチェックリスト

本 Phase は NON_VISUAL タスクのため、スクリーンショットは不要。Git マージ挙動を一時 repo 上で検証する。

## チェック項目

| MT ID | 観点                                                                | 対象ファイル                             | 期待結果                                                 | 実測結果     | 判定 |
| ----- | ------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------- | ------------ | ---- |
| MT-01 | `setup-merge-drivers.sh` 実行で `merge.ours.driver=true` 登録される | `.claude/scripts/setup-merge-drivers.sh` | `git config --get merge.ours.driver` → `true`            | true         | ✅   |
| MT-02 | 構造化ファイルの並列編集で conflict marker が出現する               | `references/task-workflow.md` 相当       | conflict marker ≥ 3（`<<<<<<<` / `=======` / `>>>>>>>`） | 3            | ✅   |
| MT-03 | append-only の並列追記で両側 entry が残る（union）                  | `LOGS.md` 相当                           | 両 entry 残存 + conflict marker 0                        | 2/2 残存 / 0 | ✅   |
| MT-04 | `indexes/*.json` 並列編集で main 側採用（ours）                     | `indexes/topic-map.json`                 | 自ブランチ側内容採用 + conflict marker 0                 | a 側採用 / 0 | ✅   |
| MT-05 | macOS（darwin）での動作確認（CI / Linux は CI ログに委任）          | 全体                                     | darwin 25.3.0 / git 2.38.1 で全 MT PASS                  | PASS         | ✅   |

## 補助観点（FAIL-01）

| ID      | 観点                                                      | 期待結果                                           | 実測結果                                                                   | 判定        |
| ------- | --------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- | ----------- |
| FAIL-01 | driver 未登録状態での `merge=ours` フォールバック挙動観測 | Git 仕様想定: stderr に warning / 挙動: 3-way 解決 | stderr は空、exit 1、conflict marker 3 件で default 3-way へフォールバック | ⚠️ 発見事項 |

## 判定サマリー

- MT-01〜MT-05: **5/5 PASS**
- FAIL-01: 挙動は設計通り（マージ破損なし）だが stderr warning が出ない点は Phase 6 予想と差異あり → `discovered-issues.md` MEDIUM として記録

## 完了条件

- [x] MT-01〜MT-05 を全て実行
- [x] 実測結果を記録
- [x] FAIL-01 補助観点も実測
- [x] 判定サマリー作成
